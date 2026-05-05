import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Nova Entrada</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">PRODUTOR</label>
          <select 
            className="input-field"
            value={formData.producer_id}
            onChange={e => setFormData({...formData, producer_id: e.target.value})}
          >
            <option value="">Selecionar produtor...</option>
            {producers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Nº DA GUIA</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="000"
              value={formData.guide_number}
              onChange={e => setFormData({...formData, guide_number: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">DATA</label>
            <input 
              type="date" 
              className="input-field"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">PESO MADURO (KG)</label>
          <input 
            type="number" 
            step="0.01"
            className="input-field py-4 text-xl font-bold"
            placeholder="0.00"
            value={formData.weight_mature}
            onChange={e => setFormData({...formData, weight_mature: e.target.value})}
          />
        </div>

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
          <Save className="w-5 h-5" />
          Salvar Entrada
        </button>
      </form>
    </div>
  );
}
