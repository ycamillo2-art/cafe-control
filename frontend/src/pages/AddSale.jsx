import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Registrar Venda</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">PRODUTOR</label>
          <select 
            className="input-field"
            value={formData.producer_id}
            onChange={e => handleProducerChange(e.target.value)}
          >
            <option value="">Selecionar produtor...</option>
            {producers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {selectedProducer && (
            <p className="mt-2 text-sm">
              Saldo disponível: <span className="font-bold text-emerald-600">{selectedProducer.balance} kg</span>
            </p>
          )}
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">QUANTIDADE (KG)</label>
            <input 
              type="number" 
              step="0.01"
              className="input-field" 
              placeholder="0.00"
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">VALOR POR KG (R$)</label>
            <input 
              type="number" 
              step="0.01"
              className="input-field"
              placeholder="0.00"
              value={formData.price_per_kg}
              onChange={e => setFormData({...formData, price_per_kg: e.target.value})}
            />
          </div>
        </div>

        {formData.quantity && formData.price_per_kg && (
          <div className="card bg-orange-50 border-orange-200">
            <p className="text-sm text-orange-600 font-bold uppercase">Total da Venda</p>
            <p className="text-2xl font-black text-orange-800">
              R$ {(formData.quantity * formData.price_per_kg).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-4 bg-orange-600 active:bg-orange-700">
          <ShoppingBag className="w-5 h-5" />
          Confirmar Venda
        </button>
      </form>
    </div>
  );
}
