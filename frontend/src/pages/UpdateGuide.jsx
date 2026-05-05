import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../utils/api';

export default function UpdateGuide() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [weightMilled, setWeightMilled] = useState('');

  useEffect(() => {
    // We don't have a direct GET /guides/:id, but we can find it in producer detail or add an endpoint
    // For simplicity, let's assume we can fetch it or just use the data passed.
    // I'll add a quick endpoint in server.js later or just fetch producer data.
    api.get(`/producers`).then(res => {
      // Find the guide in all producers' guides (less efficient but works for now)
      // Better: Add GET /api/guides/:id to backend
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weightMilled) return;
    try {
      await api.patch(`/guides/${id}`, { weight_milled: weightMilled });
      navigate(-1);
    } catch (err) {
      alert('Erro ao atualizar guia');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Finalizar Pilagem</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card bg-gray-50 border-gray-200">
          <p className="text-xs text-gray-500 font-bold uppercase">Informações da Guia</p>
          <p className="text-lg font-bold">Guia #{id}</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">PESO PILADO (KG)</label>
          <input 
            type="number" 
            step="0.01"
            className="input-field py-4 text-2xl font-bold text-emerald-700"
            placeholder="0.00"
            autoFocus
            value={weightMilled}
            onChange={e => setWeightMilled(e.target.value)}
          />
          <p className="mt-2 text-sm text-gray-500">Insira o peso final após a pilagem para atualizar o estoque.</p>
        </div>

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-4 bg-emerald-600 active:bg-emerald-700">
          <CheckCircle className="w-5 h-5" />
          Finalizar e Atualizar Estoque
        </button>
      </form>
    </div>
  );
}
