import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, User, Calendar, Weight, DollarSign } from 'lucide-react';
import api from '../utils/api';

export default function AddSale() {
  const navigate = useNavigate();
  const [producers, setProducers] = useState([]);
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    producer_id: '',
    quantity: '',
    price_per_kg: ''
  });

  useEffect(() => {
    api.get('/producers').then(res => setProducers(res.data));
  }, []);

  const handleProducerChange = (id) => {
    const producer = producers.find(p => p.id === parseInt(id));
    setSelectedProducer(producer);
    setFormData({...formData, producer_id: id});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.producer_id || !formData.quantity || !formData.price_per_kg) {
      alert('Preencha todos os campos');
      return;
    }
    try {
      await api.post('/sales', formData);
      navigate(`/producer/${formData.producer_id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao registrar venda');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 active:text-red-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Registrar Venda</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <DollarSign className="w-4 h-4 text-red-600" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Dados da Transação</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Produtor</label>
              <div className="relative flex items-center bg-[#f8fafc] border border-slate-100 rounded-2xl px-4 py-4">
                <User className="w-5 h-5 text-slate-300 mr-3" />
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
                  <p className="text-[10px] font-black text-emerald-700 uppercase">Saldo disponível: {selectedProducer.balance} kg</p>
                </div>
              )}
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Data da Venda</label>
              <div className="relative flex items-center bg-[#f8fafc] border border-slate-100 rounded-2xl px-4 py-4">
                <Calendar className="w-5 h-5 text-slate-300 mr-3" />
                <input 
                  type="date" 
                  className="w-full bg-transparent outline-none text-sm font-bold text-slate-700"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Quantidade (kg)</label>
                <div className="relative flex items-center bg-red-50 border border-red-100 rounded-2xl px-4 py-4">
                  <Weight className="w-5 h-5 text-red-600 mr-3" />
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full bg-transparent outline-none text-sm font-black text-red-900 placeholder:text-red-200" 
                    placeholder="0,00"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Preço por kg</label>
                <div className="relative flex items-center bg-red-50 border border-red-100 rounded-2xl px-4 py-4">
                  <DollarSign className="w-5 h-5 text-red-600 mr-3" />
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full bg-transparent outline-none text-sm font-black text-red-900 placeholder:text-red-200"
                    placeholder="R$ 0,00"
                    value={formData.price_per_kg}
                    onChange={e => setFormData({...formData, price_per_kg: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {formData.quantity && formData.price_per_kg && (
              <div className="bg-slate-900 p-5 rounded-3xl text-center space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor Total da Venda</p>
                <p className="text-2xl font-black text-white">
                  R$ {(formData.quantity * formData.price_per_kg).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-red-200 active:scale-95 transition-all">
          <ShoppingBag className="w-4 h-4 inline mr-2" />
          Confirmar Venda
        </button>
      </form>
    </div>
  );
}
