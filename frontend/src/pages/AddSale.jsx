import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import api from '../utils/api';

export default function AddSale() {
  const navigate = useNavigate();
  const [producers, setProducers] = useState([]);
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [sacas, setSacas] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    producer_id: '',
    quantity: '',
    price_per_kg: 0 // Mantemos no estado para não quebrar o backend, mas não mostramos no form
  });

  useEffect(() => {
    api.get('/producers').then(res => setProducers(res.data));
  }, []);

  const handleProducerChange = (id) => {
    const prod = producers.find(p => p.id === parseInt(id));
    setSelectedProducer(prod);
    setFormData({ ...formData, producer_id: id });
  };

  const handleSacasChange = (val) => {
    const s = val;
    const kg = s ? (s * 60).toFixed(2) : '';
    setSacas(s);
    setFormData({ ...formData, quantity: kg });
  };

  const handleWeightChange = (val) => {
    const kg = val;
    const s = kg ? (kg / 60).toFixed(2) : '';
    setSacas(s);
    setFormData({ ...formData, quantity: kg });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.producer_id || !formData.quantity) {
      alert('Preencha todos os campos');
      return;
    }
    try {
      await api.post('/sales', formData);
      alert('Venda registrada com sucesso!');
      navigate(`/producer/${formData.producer_id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao registrar venda');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 active:text-red-600 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Registrar Venda</h1>
        </div>
        <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-600 font-black text-[10px] uppercase active:bg-slate-200 transition-colors">
          <Home className="w-4 h-4" />
          Inicio
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm space-y-6">
          <div className="space-y-5">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Produtor</label>
              <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-4">
                <select 
                  className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 appearance-none"
                  value={formData.producer_id}
                  onChange={e => handleProducerChange(e.target.value)}
                >
                  <option value="">Selecione o Produtor</option>
                  {producers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              {selectedProducer && (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <p className="text-[10px] font-black text-emerald-700 uppercase">Saldo disponível: {selectedProducer.balance.toLocaleString('pt-BR')} kg</p>
                </div>
              )}
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Data da Venda</label>
              <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-4">
                <input 
                  type="date" 
                  className="w-full bg-transparent outline-none text-sm font-bold text-slate-700"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Quantidade (Sacas)</label>
                <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-4">
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full bg-transparent outline-none text-sm font-black text-slate-700 placeholder:text-slate-200" 
                    placeholder="0"
                    value={sacas}
                    onChange={e => handleSacasChange(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Peso Total (kg)</label>
                <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-4">
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full bg-transparent outline-none text-sm font-black text-slate-700 placeholder:text-slate-200" 
                    placeholder="0,00"
                    value={formData.quantity}
                    onChange={e => handleWeightChange(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-emerald-200 active:scale-95 transition-all">
          Confirmar Venda
        </button>
      </form>
    </div>
  );
}
