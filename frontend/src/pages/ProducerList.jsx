import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronRight, Plus } from 'lucide-react';
import api from '../utils/api';

export default function ProducerList() {
  const navigate = useNavigate();
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchProducers();
  }, []);

  const fetchProducers = async () => {
    try {
      const res = await api.get('/producers');
      setProducers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName) return;
    await api.post('/producers', { name: newName });
    setNewName('');
    setShowAdd(false);
    fetchProducers();
  };

  const filtered = producers.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-400">
          <ArrowLeft />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Produtores</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selecione um produtor para ver os detalhes</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input 
          type="text" 
          placeholder="Buscar produtor..." 
          className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-10 text-[10px] font-black text-slate-300 uppercase">Carregando...</div>
        ) : (
          filtered.map((p, idx) => (
            <Link to={`/producer/${p.id}`} key={p.id} className="bg-white p-5 rounded-3xl border border-slate-50 shadow-sm active:bg-slate-50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-lg">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight leading-none">{p.name}</h3>
                    <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase">Código: {String(p.id).padStart(3, '0')}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div className="leading-none">
                    <p className="text-[9px] font-black text-emerald-600 uppercase mb-0.5">Saldo: {p.balance} kg</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-200" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-50">
                <div className="text-center">
                  <p className="text-[8px] font-bold text-slate-300 uppercase mb-0.5 tracking-wider">Recebido</p>
                  <p className="text-[10px] font-black text-slate-600">{(p.total_mature || 0).toLocaleString('pt-BR')} kg</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] font-bold text-slate-300 uppercase mb-0.5 tracking-wider">Pilado</p>
                  <p className="text-[10px] font-black text-slate-600">{(p.total_milled || 0).toLocaleString('pt-BR')} kg</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] font-bold text-slate-300 uppercase mb-0.5 tracking-wider">Vendido</p>
                  <p className="text-[10px] font-black text-slate-600">{(p.total_sold || 0).toLocaleString('pt-BR')} kg</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {!showAdd ? (
        <button 
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-2 py-4 bg-slate-100 rounded-2xl text-[11px] font-black text-slate-500 uppercase tracking-widest active:bg-slate-200"
        >
          <Plus className="w-4 h-4" />
          Novo Produtor
        </button>
      ) : (
        <form onSubmit={handleAdd} className="space-y-3 p-4 bg-emerald-50 rounded-3xl animate-in zoom-in-95">
          <input 
            type="text" 
            placeholder="Nome Completo" 
            className="w-full bg-white border border-emerald-100 rounded-2xl py-4 px-4 text-sm font-black outline-none"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px]">Cadastrar</button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-4 bg-white text-slate-400 rounded-2xl font-black uppercase text-[10px]">X</button>
          </div>
        </form>
      )}
    </div>
  );
}
