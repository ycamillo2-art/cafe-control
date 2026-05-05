import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, TrendingUp, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import api from '../utils/api';

export default function ProducerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/producers/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Carregando...</div>;
  if (!data) return <div className="text-center py-10">Produtor não encontrado.</div>;

  const { summary, guides, sales } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 -ml-2 text-gray-600">
          <ArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">{data.name}</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-blue-50 border-blue-100 p-4">
          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Total Recebido</p>
          <p className="text-2xl font-black text-blue-800">{summary.total_mature} <span className="text-sm font-medium">kg</span></p>
        </div>
        <div className="card bg-emerald-50 border-emerald-100 p-4">
          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Total Pilado</p>
          <p className="text-2xl font-black text-emerald-800">{summary.total_milled} <span className="text-sm font-medium">kg</span></p>
        </div>
        <div className="card bg-orange-50 border-orange-100 p-4">
          <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Total Vendido</p>
          <p className="text-2xl font-black text-orange-800">{summary.total_sold} <span className="text-sm font-medium">kg</span></p>
        </div>
        <div className="card bg-purple-50 border-purple-100 p-4">
          <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">Saldo Atual</p>
          <p className="text-2xl font-black text-purple-800">{summary.balance} <span className="text-sm font-medium">kg</span></p>
        </div>
      </div>

      {/* Tabs / Sections */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-800 font-bold text-lg border-b pb-2">
          <FileText className="w-5 h-5" />
          <h2>Entradas (Guias)</h2>
        </div>
        <div className="space-y-3">
          {guides.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma entrada registrada.</p>
          ) : (
            guides.map(g => (
              <div key={g.id} className="card relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${g.status === 'FINALIZADO' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-gray-400">GUIA #{g.guide_number}</span>
                    <p className="text-sm text-gray-500">{new Date(g.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${g.status === 'FINALIZADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {g.status}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Maduro</p>
                      <p className="font-bold text-gray-700">{g.weight_mature} kg</p>
                    </div>
                    {g.status === 'FINALIZADO' && (
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Pilado</p>
                        <p className="font-bold text-emerald-700">{g.weight_milled} kg</p>
                      </div>
                    )}
                  </div>
                  {g.status === 'PENDENTE' && (
                    <Link to={`/update-guide/${g.id}`} className="text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-bold active:bg-gray-200">
                      Finalizar Pilagem
                    </Link>
                  )}
                  {g.status === 'FINALIZADO' && (
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Rend.</p>
                      <p className="font-bold text-emerald-700">{Number(g.yield_pct).toFixed(1)}%</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-800 font-bold text-lg border-b pb-2">
          <ShoppingBag className="w-5 h-5" />
          <h2>Vendas</h2>
        </div>
        <div className="space-y-3">
          {sales.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma venda registrada.</p>
          ) : (
            sales.map(s => (
              <div key={s.id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-gray-500">{new Date(s.date).toLocaleDateString('pt-BR')}</p>
                  <p className="font-bold text-orange-700">R$ {Number(s.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600 font-medium">{s.quantity} kg <span className="text-xs text-gray-400">@ R$ {s.price_per_kg}/kg</span></p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <button 
        onClick={() => window.print()} 
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        <FileText className="w-5 h-5" />
        Gerar Relatório (PDF)
      </button>
    </div>
  );
}
