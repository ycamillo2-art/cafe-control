import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ChevronRight, Plus } from 'lucide-react';
import api from '../utils/api';

export default function Dashboard() {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProducerName, setNewProducerName] = useState('');
  const [showAdd, setShowAdd] = useState(false);

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

  const handleAddProducer = async (e) => {
    e.preventDefault();
    if (!newProducerName) return;
    try {
      await api.post('/producers', { name: newProducerName });
      setNewProducerName('');
      setShowAdd(false);
      fetchProducers();
    } catch (err) {
      alert('Erro ao adicionar produtor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Produtores</h1>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="p-2 bg-emerald-600 text-white rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddProducer} className="card flex gap-2 animate-in fade-in slide-in-from-top-4">
          <input
            type="text"
            placeholder="Nome do produtor"
            className="input-field flex-1"
            value={newProducerName}
            onChange={(e) => setNewProducerName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary py-2 px-4">Salvar</button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Carregando...</div>
      ) : (
        <div className="grid gap-4">
          {producers.length === 0 ? (
            <p className="text-center text-gray-500 py-10">Nenhum produtor cadastrado.</p>
          ) : (
            producers.map((p) => (
              <Link to={`/producer/${p.id}`} key={p.id} className="card flex items-center justify-between active:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{p.name}</h3>
                    <p className="text-sm text-gray-500">Saldo: <span className="font-semibold text-emerald-600">{p.balance} kg</span></p>
                  </div>
                </div>
                <ChevronRight className="text-gray-400" />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
