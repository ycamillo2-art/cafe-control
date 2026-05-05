import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronRight, Plus, Trash2, Edit2, Home } from 'lucide-react';
import api from '../utils/api';

export default function ProducerList() {
  const navigate = useNavigate();
  const [producers, setProducers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
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
    try {
      if (editingId) {
        await api.patch(`/producers/${editingId}`, { name: newName });
        alert('Produtor atualizado!');
      } else {
        await api.post('/producers', { name: newName });
        alert('Produtor cadastrado!');
      }
      setNewName('');
      setShowAdd(false);
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert('Erro ao salvar produtor');
    }
  };

  const startEdit = (e, producer) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(producer.id);
    setNewName(producer.name);
    setShowAdd(true);
  };

  const handleDelete = async (e, id, name) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir o produtor ${name} e todos os seus lançamentos?`)) {
      try {
        await api.delete(`/producers/${id}`);
        fetchData();
      } catch (err) {
        alert('Erro ao excluir produtor');
      }
    }
  };

  const filteredProducers = producers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-400 hover:text-emerald-600 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Relatório Geral</h1>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Gestão de Produtores</p>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-600 font-black text-[10px] uppercase active:bg-slate-200 transition-colors">
          <Home className="w-4 h-4" />
          Início
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input 
          type="text" 
          placeholder="Buscar produtor..." 
          className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-10 text-[10px] font-black text-slate-300 uppercase">Carregando...</div>
        ) : (
          filteredProducers.map((p) => (
            <div key={p.id} className="relative group">
              <Link to={`/producer/${p.id}`} className="block bg-white p-5 rounded-3xl border border-slate-50 shadow-sm active:bg-slate-50 transition-all">
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
                  <div className="flex items-center gap-2">
                    <div className="text-right leading-none">
                      <p className="text-[9px] font-black text-emerald-600 uppercase mb-0.5">Saldo: {p.balance.toLocaleString('pt-BR')} kg</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">{(p.balance / 60).toFixed(1)} sacas</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-200" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-50">
                  <div className="text-center">
                    <p className="text-[8px] font-bold text-slate-300 uppercase mb-0.5 tracking-wider">Recebido</p>
                    <p className="text-[10px] font-black text-slate-600">{(p.total_mature || 0).toLocaleString('pt-BR')} kg</p>
                    <p className="text-[8px] font-bold text-slate-400">{(p.total_mature / 60).toFixed(1)} sc</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-bold text-slate-300 uppercase mb-0.5 tracking-wider">Pilado</p>
                    <p className="text-[10px] font-black text-slate-600">{(p.total_milled || 0).toLocaleString('pt-BR')} kg</p>
                    <p className="text-[8px] font-bold text-slate-400">{(p.total_milled / 60).toFixed(1)} sc</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-bold text-slate-300 uppercase mb-0.5 tracking-wider">Vendido</p>
                    <p className="text-[10px] font-black text-slate-600">{(p.total_sold || 0).toLocaleString('pt-BR')} kg</p>
                    <p className="text-[8px] font-bold text-slate-400">{(p.total_sold / 60).toFixed(1)} sc</p>
                  </div>
                </div>
              </Link>
              
              <div className="absolute top-4 right-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => startEdit(e, p)}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-blue-500 rounded-lg transition-colors"
                  title="Editar nome"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button 
                  onClick={(e) => handleDelete(e, p.id, p.name)}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                  title="Excluir produtor"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {!showAdd ? (
        <button 
          onClick={() => { setShowAdd(true); setEditingId(null); setNewName(''); }}
          className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-slate-100 shadow-sm rounded-2xl text-[11px] font-black text-slate-500 uppercase tracking-widest active:bg-slate-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Produtor
        </button>
      ) : (
        <form onSubmit={handleAdd} className="space-y-3 p-4 bg-white border border-emerald-100 shadow-xl rounded-3xl animate-in zoom-in-95">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1">
            {editingId ? 'Editar Produtor' : 'Novo Produtor'}
          </p>
          <input 
            type="text" 
            placeholder="Nome Completo" 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm font-black outline-none focus:ring-2 focus:ring-emerald-500/10"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-emerald-200">
              {editingId ? 'Salvar Alterações' : 'Cadastrar Produtor'}
            </button>
            <button 
              type="button" 
              onClick={() => { setShowAdd(false); setEditingId(null); setNewName(''); }} 
              className="px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px]"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
