import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Weight, Hash, Calendar } from 'lucide-react';
import api from '../utils/api';

export default function UpdateGuide() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [weightMilled, setWeightMilled] = useState('');

  useEffect(() => {
    // Para simplificar, buscamos todos os produtores e achamos a guia
    api.get('/producers').then(async res => {
      for (const p of res.data) {
        const detail = await api.get(`/producers/${p.id}`);
        const found = detail.data.guides.find(g => g.id === parseInt(id));
        if (found) {
          setGuide(found);
          break;
        }
      }
    });
  }, [id]);

  const [weightMilled, setWeightMilled] = useState('');
  const [sacas, setSacas] = useState('');

  const handleSacasChange = (val) => {
    setSacas(val);
    setWeightMilled(val ? val * 60 : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weightMilled) return;
    try {
      await api.patch(`/guides/${id}`, { weight_milled: parseFloat(weightMilled) });
      alert('Guia finalizada com sucesso!');
      navigate(-1);
    } catch (err) {
      alert('Erro ao atualizar guia');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 active:text-emerald-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Finalizar Pilagem</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Atualização de Estoque</h2>
          </div>

          <div className="space-y-5">
            {guide && (
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase">Guia</label>
                  <p className="text-[11px] font-black text-slate-700">#{guide.guide_number}</p>
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase">Peso Maduro</label>
                  <p className="text-[11px] font-black text-slate-700">{guide.weight_mature} kg</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Quantidade Pilada (Sacas)</label>
                <div className="relative flex items-center bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-4">
                  <Weight className="w-6 h-6 text-emerald-600 mr-3" />
                  <input 
                    type="number" 
                    className="w-full bg-transparent outline-none text-2xl font-black text-emerald-900 placeholder:text-emerald-200"
                    placeholder="0"
                    autoFocus
                    value={sacas}
                    onChange={e => handleSacasChange(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Peso Total (kg)</label>
                <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4">
                  <Weight className="w-6 h-6 text-slate-300 mr-3" />
                  <input 
                    type="number" 
                    readOnly
                    className="w-full bg-transparent outline-none text-2xl font-black text-slate-500"
                    value={weightMilled}
                  />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Insira a quantidade de sacas de 60kg obtidas. O peso total será calculado automaticamente.</p>
          </div>
        </div>

        <button type="submit" className="w-full py-5 bg-emerald-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-emerald-100 active:scale-95 transition-all">
          Confirmar e Finalizar
        </button>
      </form>
    </div>
  );
}
