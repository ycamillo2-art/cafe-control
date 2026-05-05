import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Leaf, Settings, DollarSign, Box, Trash2, Edit2, CheckCircle, Download, Home, Warehouse } from 'lucide-react';
import api from '../utils/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ProducerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/producers/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditItem = async (type, item) => {
    if (type === 'guides') {
      const newMature = prompt('Novo Peso Maduro (kg):', item.weight_mature);
      if (newMature === null) return;
      const newMilled = prompt('Novo Peso Pilado (kg):', item.weight_milled || 0);
      if (newMilled === null) return;
      
      try {
        await api.patch(`/guides/${item.id}`, { 
          weight_mature: parseFloat(newMature), 
          weight_milled: parseFloat(newMilled) 
        });
        alert('Entrada atualizada!');
        fetchData();
      } catch (err) {
        alert('Erro ao atualizar.');
      }
    } else {
      const newSacas = prompt('Nova Quantidade (Sacas):', item.quantity / 60);
      if (newSacas === null) return;
      
      try {
        await api.patch(`/sales/${item.id}`, { 
          quantity: parseFloat(newSacas) * 60
        });
        alert('Venda atualizada!');
        fetchData();
      } catch (err) {
        alert('Erro ao atualizar.');
      }
    }
  };

  const handleDeleteItem = async (type, itemId) => {
    const itemLabel = type === 'guides' ? 'Entrada' : 'Venda';
    if (window.confirm(`Tem certeza que deseja excluir esta ${itemLabel.toLowerCase()}?`)) {
      try {
        await api.delete(`/${type}/${itemId}`);
        alert(`${itemLabel} excluída com sucesso!`);
        fetchData();
      } catch (err) {
        alert(`Erro ao excluir ${itemLabel.toLowerCase()}.`);
      }
    }
  };

  const handleFinishHarvest = async () => {
    if (window.confirm('Deseja finalizar a safra deste produtor? Isso marcará as próximas vendas como "pós-safra".')) {
      try {
        await api.post(`/producers/${id}/finish-harvest`);
        alert('Safra finalizada com sucesso!');
        fetchData();
      } catch (err) {
        alert('Erro ao finalizar safra.');
      }
    }
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('RD - CONTROLE DE CAFÉ', 14, 15);
      doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth - 14, 15, { align: 'right' });

      // Title
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.text('EXTRATO DO PRODUTOR', pageWidth / 2, 30, { align: 'center' });
      doc.setFontSize(14);
      doc.text((data.name || '').toUpperCase(), pageWidth / 2, 40, { align: 'center' });

      // Summary Box
      doc.setDrawColor(200);
      doc.rect(14, 50, pageWidth - 28, 35);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMO DA CONTA', 20, 58);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Total Maduro: ${(data.summary?.total_mature || 0).toLocaleString('pt-BR')} kg`, 20, 68);
      doc.text(`Total Pilado: ${(data.summary?.total_milled || 0).toLocaleString('pt-BR')} kg (${((data.summary?.total_milled || 0) / 60).toFixed(1)} sacas)`, 20, 75);
      doc.text(`Total Vendido: ${(data.summary?.total_sold || 0).toLocaleString('pt-BR')} kg (${((data.summary?.total_sold || 0) / 60).toFixed(1)} sacas)`, 20, 82);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`SALDO ATUAL: ${(data.summary?.balance || 0).toLocaleString('pt-BR')} kg (${((data.summary?.balance || 0) / 60).toFixed(1)} sacas)`, 140, 82, { align: 'right' });

      let currentY = 100;

      if (data.harvest_finished_at) {
        doc.setTextColor(200, 0, 0);
        doc.text(`SAFRA FINALIZADA EM: ${new Date(data.harvest_finished_at).toLocaleDateString('pt-BR')}`, 14, 95);
        currentY = 105;
      }

      // Guides Table
      doc.setTextColor(40);
      doc.setFontSize(12);
      doc.text('ENTRADAS DE CAFÉ', 14, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Guia', 'Data', 'Status', 'Maduro (kg)', 'Pilado (kg)', 'Sacas']],
        body: (data.guides || []).map(g => [
          g.guide_number,
          new Date(g.date).toLocaleDateString('pt-BR'),
          g.status,
          `${Number(g.weight_mature || 0).toLocaleString('pt-BR')}`,
          g.weight_milled ? `${Number(g.weight_milled).toLocaleString('pt-BR')}` : '-',
          g.weight_milled ? (Number(g.weight_milled) / 60).toFixed(1) : '-'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9 }
      });

      // Sales Table
      const salesY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.text('VENDAS REALIZADAS', 14, salesY);
      
      autoTable(doc, {
        startY: salesY + 5,
        head: [['Data', 'Tipo', 'Peso (kg)', 'Sacas']],
        body: (data.sales || []).map(s => [
          new Date(s.date).toLocaleDateString('pt-BR'),
          s.is_post_harvest ? 'PÓS-SAFRA' : 'SAFRA',
          `${Number(s.quantity || 0).toLocaleString('pt-BR')}`,
          (Number(s.quantity || 0) / 60).toFixed(1)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38] },
        styles: { fontSize: 9 }
      });

      doc.save(`extrato-${(data.name || 'produtor').toLowerCase().replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Erro PDF:', error);
      alert('Erro ao gerar PDF. Verifique os dados e tente novamente.');
    }
  };

  if (!data) return <div className="text-center py-20 font-black text-slate-300 uppercase text-[10px]">Carregando detalhes...</div>;

  const { summary, guides, sales } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/producers')} className="p-2 -ml-2 text-slate-400 hover:text-emerald-600 transition-colors">
            <ArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">{data.name}</h1>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Extrato Detalhado</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Leaf className="w-5 h-5 text-emerald-600" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Maduro</p>
          </div>
          <p className="text-2xl font-black text-slate-800 leading-none">{(summary.total_mature || 0).toLocaleString('pt-BR')} kg</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2">{(summary.total_mature / 60).toFixed(1)} sacas</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Settings className="w-5 h-5 text-[#603813]" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pilado</p>
          </div>
          <p className="text-2xl font-black text-slate-800 leading-none">{(summary.total_milled || 0).toLocaleString('pt-BR')} kg</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2">{(summary.total_milled / 60).toFixed(1)} sacas</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-red-600" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Vendido</p>
          </div>
          <p className="text-2xl font-black text-slate-800 leading-none">{(summary.total_sold || 0).toLocaleString('pt-BR')} kg</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2">{(summary.total_sold / 60).toFixed(1)} sacas</p>
        </div>
        <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <Box className="w-5 h-5 text-white/60" />
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Saldo Atual</p>
          </div>
          <p className="text-2xl font-black text-white leading-none">{(summary.balance || 0).toLocaleString('pt-BR')} kg</p>
          <p className="text-[10px] font-bold text-white/60 mt-2">{(summary.balance / 60).toFixed(1)} sacas</p>
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
