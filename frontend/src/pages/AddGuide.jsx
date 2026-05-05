import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Hash, Calendar, Weight } from 'lucide-react';
import api from '../utils/api';

export default function AddGuide() {
  const navigate = useNavigate();
  const [producers, setProducers] = useState([]);
  const [formData, setFormData] = useState({
    guide_number: '',
    date: new Date().toISOString().split('T')[0],
    producer_id: '',
    weight_mature: ''
  });

  useEffect(() => {
    api.get('/producers').then(res => setProducers(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.producer_id || !formData.guide_number || !formData.weight_mature) {
      alert('Preencha todos os campos');
      return;
    }
    try {
      await api.post('/guides', formData);
      navigate(`/producer/${formData.producer_id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar guia');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 active:text-brand-brown transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Novo Lançamento</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Weight className="w-4 h-4 text-emerald-600" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Classificação e Origem</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Produtor</label>
              <div className="relative flex items-center bg-[#f8fafc] border border-slate-100 rounded-2xl px-4 py-4">
                <User className="w-5 h-5 text-slate-300 mr-3" />
                <select 
                  className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 appearance-none"
                  value={formData.producer_id}
                  onChange={e => setFormData({...formData, producer_id: e.target.value})}
                >
                  <option value="">Selecione o Produtor</option>
                  {producers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Nº da Guia</label>
                <div className="relative flex items-center bg-[#f8fafc] border border-slate-100 rounded-2xl px-4 py-4">
                  <Hash className="w-5 h-5 text-slate-300 mr-3" />
                  <input 
                    type="text" 
                    className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 placeholder:text-slate-200" 
                    placeholder="000"
                    value={formData.guide_number}
                    onChange={e => setFormData({...formData, guide_number: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Data</label>
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
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Peso Maduro (kg)</label>
              <div className="relative flex items-center bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-5">
                <Weight className="w-6 h-6 text-emerald-600 mr-3" />
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full bg-transparent outline-none text-2xl font-black text-emerald-900 placeholder:text-emerald-200"
                  placeholder="0,00"
                  value={formData.weight_mature}
                  onChange={e => setFormData({...formData, weight_mature: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full py-5 bg-[#603813] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-amber-900/20 active:scale-95 transition-all">
          Confirmar Lançamento
        </button>
      </form>
    </div>
  );
}
