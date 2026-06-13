import React, { useState } from 'react';
import Swal from 'sweetalert2';
import api from '../utils/api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { username, password });
      localStorage.setItem('cafe_token', res.data.token);
      onLogin();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Acesso Negado',
        text: 'Usuário ou senha incorretos.',
        confirmButtonColor: '#d32f2f'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4" style={{
      backgroundImage: "url('https://sc01.alicdn.com/kf/A50dab64c2acd4195a772f129afc8e83cn.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative'
    }}>
      <div className="absolute inset-0 bg-black/60" />
      
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl border border-white/20">
        <div className="text-center mb-10">
          <img src="https://sc01.alicdn.com/kf/Ab1d5f68f57e14024a5f9a93453a2ab73I.png" alt="RD Logo" className="h-20 mx-auto mb-6 rounded-2xl" />
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">RD CONILON</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Controle de Café</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Usuário</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 transition-colors font-bold text-slate-700"
              placeholder="Digite seu usuário"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Senha</label>
            <input 
              type="password" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 transition-colors font-bold text-slate-700"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all">
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
