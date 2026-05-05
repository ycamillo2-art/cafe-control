import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Leaf, Settings, DollarSign, Box, Trash2, Edit2 } from 'lucide-react';
import api from '../utils/api';

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
      const newPrice = prompt('Novo Preço por kg (R$):', item.price_per_kg);
      if (newPrice === null) return;

      try {
        await api.patch(`/sales/${item.id}`, { 
          quantity: parseFloat(newSacas) * 60, 
          price_per_kg: parseFloat(newPrice) 
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

  if (!data) return <div className="text-center py-20 font-black text-slate-300 uppercase text-[10px]">Carregando detalhes...</div>;

  const { producer, summary, guides, sales } = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/producers')} className="p-2 -ml-2 text-slate-400">
            <ArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">{data.name}</h1>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Extrato do Produtor</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Leaf className="w-5 h-5 text-emerald-600" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Recebido (Maduro)</p>
          </div>
          <p className="text-3xl font-black text-emerald-800 leading-none">{(summary.total_mature || 0).toLocaleString('pt-BR')} kg</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Settings className="w-5 h-5 text-[#603813]" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pilado (Rendimento)</p>
          </div>
          <p className="text-3xl font-black text-[#603813] leading-none">{(summary.total_milled || 0).toLocaleString('pt-BR')} kg</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-red-600" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Vendido</p>
          </div>
          <p className="text-3xl font-black text-red-700 leading-none">{(summary.total_sold || 0).toLocaleString('pt-BR')} kg</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Box className="w-5 h-5 text-blue-600" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Atual (Pilado)</p>
          </div>
          <p className="text-3xl font-black text-blue-800 leading-none">{(summary.balance || 0).toLocaleString('pt-BR')} kg</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Entradas de Café</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header">
                  <th className="pb-4">Guia</th>
                  <th className="pb-4">Dados</th>
                  <th className="pb-4">Peso Maduro</th>
                  <th className="pb-4">Peso Pilado</th>
                  <th className="pb-4">Rendimento</th>
                  <th className="pb-4"></th>
                </tr>
              </thead>
              <tbody>
                {guides.map(g => (
                  <tr key={g.id} className="group">
                    <td className="table-cell">{g.guide_number}</td>
                    <td className="table-cell">{new Date(g.date).toLocaleDateString('pt-BR')}</td>
                    <td className="table-cell">{Number(g.weight_mature).toLocaleString('pt-BR')} kg</td>
                    <td className="table-cell">{g.weight_milled ? `${Number(g.weight_milled).toLocaleString('pt-BR')} kg` : '-'}</td>
                    <td className="table-cell text-emerald-600 font-black">{g.yield_pct ? `${Number(g.yield_pct).toFixed(1)}%` : '-'}</td>
                    <td className="table-cell text-right">
                      <div className="flex gap-1 justify-end">
                        <button 
                          onClick={() => handleEditItem('guides', g)}
                          className="p-1.5 text-slate-200 hover:text-blue-500 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem('guides', g.id)}
                          className="p-1.5 text-slate-200 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-red-500 rounded-full" />
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Vendas Realizadas</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header">
                  <th className="pb-4">Dados</th>
                  <th className="pb-4">Sacas</th>
                  <th className="pb-4">Peso (kg)</th>
                  <th className="pb-4">Valor Total</th>
                  <th className="pb-4"></th>
                </tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id} className="group">
                    <td className="table-cell">{new Date(s.date).toLocaleDateString('pt-BR')}</td>
                    <td className="table-cell">{(Number(s.quantity) / 60).toFixed(1)}</td>
                    <td className="table-cell">{Number(s.quantity).toLocaleString('pt-BR')} kg</td>
                    <td className="table-cell text-red-600 font-black">R$ {Number(s.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="table-cell text-right">
                      <div className="flex gap-1 justify-end">
                        <button 
                          onClick={() => handleEditItem('sales', s)}
                          className="p-1.5 text-slate-200 hover:text-blue-500 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem('sales', s.id)}
                          className="p-1.5 text-slate-200 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
