import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, DollarSign, Percent, Box, Trash2, Edit2, CheckCircle, Download, Home, Printer, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../utils/api';

export default function ProducerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [commissionInput, setCommissionInput] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get(`/producers/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (data) {
      setCommissionInput(String(data.summary?.commission_pct ?? 0));
    }
  }, [data]);

  const handleEditItem = async (type, item) => {
    if (type === 'guides') {
      const { value: formValues } = await Swal.fire({
        title: 'Editar Entrada',
        html:
          `<label class="text-xs font-bold text-slate-400 uppercase mb-1 block">Peso Maduro (kg)</label>` +
          `<input id="swal-input1" class="swal2-input" type="number" step="0.01" value="${item.weight_mature}">` +
          `<label class="text-xs font-bold text-slate-400 uppercase mb-1 mt-4 block">Peso Pilado (kg)</label>` +
          `<input id="swal-input2" class="swal2-input" type="number" step="0.01" value="${item.weight_milled || 0}">`,
        focusConfirm: false,
        confirmButtonColor: '#2e7d32',
        confirmButtonText: 'Salvar Alterações',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          return [
            document.getElementById('swal-input1').value,
            document.getElementById('swal-input2').value
          ]
        }
      });

      if (formValues) {
        try {
          await api.patch(`/guides/${item.id}`, { 
            weight_mature: parseFloat(formValues[0]), 
            weight_milled: parseFloat(formValues[1]) 
          });
          Swal.fire({ icon: 'success', title: 'Atualizado!', showConfirmButton: false, timer: 1500 });
          fetchData();
        } catch (err) {
          Swal.fire('Erro!', 'Não foi possível atualizar.', 'error');
        }
      }
    } else {
      const { value: newSacas } = await Swal.fire({
        title: 'Editar Venda',
        input: 'number',
        inputLabel: 'Nova Quantidade (Sacas)',
        inputValue: item.quantity / 60,
        showCancelButton: true,
        confirmButtonColor: '#2e7d32',
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar'
      });

      if (newSacas) {
        try {
          await api.patch(`/sales/${item.id}`, { 
            quantity: parseFloat(newSacas) * 60
          });
          Swal.fire({ icon: 'success', title: 'Venda Atualizada!', showConfirmButton: false, timer: 1500 });
          fetchData();
        } catch (err) {
          Swal.fire('Erro!', 'Não foi possível atualizar.', 'error');
        }
      }
    }
  };

  const handleDeleteItem = async (type, itemId) => {
    const itemLabel = type === 'guides' ? 'Entrada' : 'Venda';
    
    const result = await Swal.fire({
      title: `Excluir ${itemLabel}?`,
      text: "Esta ação não pode ser desfeita!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/${type}/${itemId}`);
        Swal.fire({ icon: 'success', title: 'Excluído!', showConfirmButton: false, timer: 1500 });
        fetchData();
      } catch (err) {
        Swal.fire('Erro!', `Erro ao excluir ${itemLabel.toLowerCase()}.`, 'error');
      }
    }
  };

  const handleFinishHarvest = async () => {
    const result = await Swal.fire({
      title: 'Finalizar Safra?',
      text: 'Isso marcará as próximas vendas como "pós-safra".',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1565c0',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sim, finalizar',
      cancelButtonText: 'Manter em aberto'
    });

    if (result.isConfirmed) {
      try {
        await api.post(`/producers/${id}/finish-harvest`);
        Swal.fire({ icon: 'success', title: 'Safra Finalizada!', text: 'Bom trabalho!', confirmButtonColor: '#2e7d32' });
        fetchData();
      } catch (err) {
        Swal.fire('Erro!', 'Erro ao finalizar safra.', 'error');
      }
    }
  };

  const handleApplyCommission = async () => {
    const pct = parseFloat(commissionInput);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      Swal.fire('Valor inválido', 'Digite um percentual entre 0 e 100.', 'warning');
      return;
    }

    const hasFinalized = data.guides.some(g => g.status === 'FINALIZADO');
    const result = await Swal.fire({
      title: 'Aplicar Comissão?',
      html: `Aplicar <b>${pct}%</b> de comissão do secador para <b>${data.name}</b>?${hasFinalized ? '<br/><br/>Existem guias finalizadas. Onde aplicar a taxa?' : '<br/><br/>A taxa vale para as próximas pilagens.'}`,
      icon: 'question',
      showCancelButton: true,
      showDenyButton: hasFinalized,
      confirmButtonColor: '#2e7d32',
      denyButtonColor: '#64748b',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Nas já finalizadas também',
      denyButtonText: 'Só nas próximas',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed || result.isDenied) {
      try {
        await api.patch(`/producers/${id}`, { commission_pct: pct, apply_to_existing: result.isConfirmed });
        Swal.fire({ icon: 'success', title: 'Comissão aplicada!', showConfirmButton: false, timer: 1500 });
        fetchData();
      } catch (err) {
        Swal.fire('Erro!', 'Não foi possível aplicar a comissão.', 'error');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };


  if (!data) return <div className="text-center py-20 font-black text-slate-300 uppercase text-[10px]">Carregando detalhes...</div>;

  const { summary, guides, sales } = data;

  return (
    <div className="space-y-8">
      {/* Estilos para Impressão */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 1.5cm; }
          footer, .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; padding: 0 !important; font-size: 12pt !important; }
          /* Esconder URLs e rodapés automáticos do navegador */
          a[href]:after { content: none !important; }
          abbr[title]:after { content: none !important; }
          .shadow-sm, .shadow-lg, .shadow-xl { shadow: none !important; box-shadow: none !important; }
          .rounded-3xl, .rounded-xl { border-radius: 0 !important; border: 1px solid #eee !important; }
          .bg-emerald-600, .bg-blue-600, .bg-slate-800, .bg-[#603813] { 
            background-color: transparent !important; 
            color: black !important;
            border: 1px solid #eee !important;
          }
          .text-white { color: black !important; }
          .text-white\/60 { color: #666 !important; }
          .grid { display: block !important; }
          .grid > div { margin-bottom: 25px !important; page-break-inside: avoid; border: 1px solid #eee !important; padding: 15px !important; }
          .summary-grid { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 8px !important; }
          .summary-grid > div { margin-bottom: 0 !important; padding: 10px 8px !important; page-break-inside: avoid; border: 1px solid #eee !important; }
          .summary-grid .card-label { font-size: 7pt !important; }
          .summary-grid .card-value { font-size: 12pt !important; }
          .summary-grid .card-sub { font-size: 8pt !important; }
          table { font-size: 11pt !important; width: 100% !important; border-collapse: collapse !important; }
          th, td { border-bottom: 1px solid #eee !important; padding: 8px !important; }
          h1, h2, h3 { color: black !important; }
        }
        .print-only { display: none; }
      `}} />

      {/* Cabeçalho exclusivo para impressão */}
      <div className="print-only mb-10 border-b-4 border-emerald-600 pb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <img src="https://sc01.alicdn.com/kf/Ab1d5f68f57e14024a5f9a93453a2ab73I.png" alt="RD Logo" className="h-24 w-auto object-contain" />
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-black uppercase leading-[0.8]">RD - Controle de Café</h1>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">Soluções em Gestão Cafeeira</p>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 mt-1">Safra {new Date().getFullYear()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-400">Relatório Gerado em</p>
            <p className="text-sm font-bold">{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-10">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Produtor</p>
            <p className="text-xl font-black uppercase text-slate-800">{data.name}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Status da Safra</p>
            <p className={`text-sm font-bold uppercase ${data.harvest_finished_at ? 'text-emerald-600' : 'text-blue-600'}`}>
              {data.harvest_finished_at ? 'Safra Finalizada' : 'Safra em Aberto'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 no-print">
          <button onClick={() => navigate('/producers')} className="p-2 -ml-2 text-slate-400 hover:text-emerald-600 transition-colors">
            <ArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">{data.name}</h1>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Extrato Detalhado</p>
          </div>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-600 font-black text-[10px] uppercase active:bg-slate-200 transition-colors">
            <Home className="w-4 h-4" />
            Inicio
          </button>
          {!data.harvest_finished_at ? (
            <button 
              onClick={handleFinishHarvest}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
            >
              <CheckCircle className="w-4 h-4" />
              Finalizar Safra
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest">
              <CheckCircle className="w-4 h-4" />
              Safra Finalizada
            </div>
          )}
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
          >
            <FileText className="w-4 h-4" />
            Gerar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 summary-grid">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Settings className="w-5 h-5 text-[#603813]" />
            <p className="card-label text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pilado</p>
          </div>
          <p className="card-value text-2xl font-black text-slate-800 leading-none">{(summary.total_milled || 0).toLocaleString('pt-BR')} kg</p>
          <p className="card-sub text-[10px] font-bold text-slate-400 mt-2">{(summary.total_milled / 60).toFixed(1)} sacas</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-[#603813]" />
            <p className="card-label text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Vendas</p>
          </div>
          <p className="card-value text-2xl font-black text-slate-800 leading-none">{(summary.total_sold || 0).toLocaleString('pt-BR')} kg</p>
          <p className="card-sub text-[10px] font-bold text-slate-400 mt-2">{(summary.total_sold / 60).toFixed(1)} sacas</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Percent className="w-5 h-5 text-[#603813]" />
            <p className="card-label text-[10px] font-black text-slate-400 uppercase tracking-widest">Comissão do Secador</p>
          </div>
          <p className="card-value text-2xl font-black text-slate-800 leading-none">{(summary.commission_kg || 0).toLocaleString('pt-BR')} kg</p>
          <p className="card-sub text-[10px] font-bold text-slate-400 mt-2">{(summary.commission_sacas || 0).toFixed(1)} sacas</p>
        </div>
        <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <Box className="w-5 h-5 text-white/60" />
            <p className="card-label text-[10px] font-black text-white/60 uppercase tracking-widest">Saldo disponível para vendas</p>
          </div>
          <p className="card-value text-2xl font-black text-white leading-none">{(summary.balance || 0).toLocaleString('pt-BR')} kg</p>
          <p className="card-sub text-[10px] font-bold text-white/60 mt-2">{(summary.balance / 60).toFixed(1)} sacas</p>
        </div>
      </div>

      <div className="no-print flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-[#603813]" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comissão do Secador</p>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={commissionInput}
            onChange={(e) => setCommissionInput(e.target.value)}
            placeholder="0"
            className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-[10px] font-black text-slate-400 uppercase">%</span>
          <button
            onClick={handleApplyCommission}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
          >
            Aplicar Comissão
          </button>
          <p className="text-[10px] font-bold text-slate-400 ml-auto">Atual: {summary.commission_pct}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Entradas de Café</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header border-b border-slate-50">
                  <th className="pb-4 font-black uppercase text-[9px] text-slate-400 tracking-widest">Guia</th>
                  <th className="pb-4 font-black uppercase text-[9px] text-slate-400 tracking-widest">Data</th>
                  <th className="pb-4 font-black uppercase text-[9px] text-slate-400 tracking-widest text-right">Peso Maduro</th>
                  <th className="pb-4 font-black uppercase text-[9px] text-slate-400 tracking-widest text-right">Sacas</th>
                  <th className="pb-4 font-black uppercase text-[9px] text-slate-400 tracking-widest text-right">Peso kg</th>
                  <th className="pb-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {guides.map(g => (
                  <tr key={g.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 text-xs font-bold text-slate-700">
                      <div className="flex items-center gap-2">
                        {g.status === 'PENDENTE' ? (
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" title="Pendente" />
                        ) : (
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" title="Finalizado" />
                        )}
                        {g.guide_number}
                      </div>
                    </td>
                    <td className="py-4 text-xs font-bold text-slate-500">{new Date(g.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-4 text-xs font-black text-slate-800 text-right">{Number(g.weight_mature).toLocaleString('pt-BR')} kg</td>
                    <td className="py-4 text-xs font-black text-emerald-600 text-right">{g.weight_milled ? (Number(g.weight_milled) / 60).toFixed(1) : '-'}</td>
                    <td className="py-4 text-xs font-bold text-slate-700 text-right">{g.weight_milled ? `${Number(g.weight_milled).toLocaleString('pt-BR')} kg` : '-'}</td>
                    <td className="py-4 text-right">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        {g.status === 'PENDENTE' && (
                          <button 
                            onClick={() => navigate(`/update-guide/${g.id}`)}
                            className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-200 transition-colors"
                          >
                            Finalizar
                          </button>
                        )}
                        <button onClick={() => handleEditItem('guides', g)} className="p-1.5 text-slate-300 hover:text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteItem('guides', g.id)} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-red-500 rounded-full" />
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Vendas Realizadas</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header border-b border-slate-50">
                  <th className="pb-4 font-black uppercase text-[9px] text-slate-400 tracking-widest">Data</th>
                  <th className="pb-4 font-black uppercase text-[9px] text-slate-400 tracking-widest text-right">Sacas</th>
                  <th className="pb-4 font-black uppercase text-[9px] text-slate-400 tracking-widest text-right">Peso kg</th>
                  <th className="pb-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sales.map(s => (
                  <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 text-xs font-bold text-slate-500">
                      {new Date(s.date).toLocaleDateString('pt-BR')}
                      {s.is_post_harvest && (
                        <span className="block text-[8px] font-black text-red-500 uppercase mt-0.5">Pós-Safra</span>
                      )}
                    </td>
                    <td className="py-4 text-xs font-black text-slate-800 text-right">{(Number(s.quantity) / 60).toFixed(1)}</td>
                    <td className="py-4 text-xs font-black text-red-600 text-right">{Number(s.quantity).toLocaleString('pt-BR')} kg</td>
                    <td className="py-4 text-right">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditItem('sales', s)} className="p-1.5 text-slate-300 hover:text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteItem('sales', s.id)} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sales.some(s => s.is_post_harvest) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-[9px] font-black text-red-600 uppercase text-center">
                ⚠️ Venda feita pós safra, valor já descontado do saldo!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
