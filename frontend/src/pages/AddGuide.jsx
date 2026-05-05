import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import api from '../utils/api';

export default function AddGuide() {
  const navigate = useNavigate();
  const [producers, setProducers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    guide_number: '',
    date: new Date().toISOString().split('T')[0],
    producer_id: '',
    weight_mature: ''
  });

  useEffect(() => {
    api.get('/producers').then(res => setProducers(res.data));
  }, []);

  const handleProducerChange = (name) => {
    setSearchTerm(name);
    const prod = producers.find(p => p.name === name);
    if (prod) {
      setFormData({ ...formData, producer_id: prod.id });
    } else {
      setFormData({ ...formData, producer_id: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.producer_id) {
      // Se não encontrou o ID, mas tem nome, talvez o usuário queira criar um novo?
      // O pedido diz "poder digitar o nome do produtor alem de selecionar".
      // Vamos assumir que se o nome não existe, ele deve cadastrar primeiro.
      alert('Selecione um produtor válido da lista.');
      return;
    }
    if (!formData.guide_number || !formData.weight_mature) {
      alert('Preencha todos os campos');
      return;
    }
    try {
      await api.post('/guides', formData);
      alert('Lançamento confirmado com sucesso!');
      navigate(`/producer/${formData.producer_id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar guia');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-emerald-600 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Novo Lançamento</h1>
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
                <input 
                  list="producers-list"
                  type="text"
                  className="w-full bg-transparent outline-none text-sm font-bold text-slate-700"
                  placeholder="Digite ou selecione o produtor"
                  value={searchTerm}
                  onChange={e => handleProducerChange(e.target.value)}
                />
                <datalist id="producers-list">
                  {producers.map(p => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Nº da Guia</label>
                <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-4">
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
                <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-4">
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
              <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-5">
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

        <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-emerald-200 active:scale-95 transition-all">
          Confirmar Lançamento
        </button>
      </form>
    </div>
  );
}
