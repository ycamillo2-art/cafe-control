import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Dashboard from './pages/Dashboard';
import ProducerList from './pages/ProducerList';
import ProducerDetail from './pages/ProducerDetail';
import AddGuide from './pages/AddGuide';
import AddSale from './pages/AddSale';
import UpdateGuide from './pages/UpdateGuide';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('cafe_token'));

  const handleLogout = () => {
    localStorage.removeItem('cafe_token');
    setIsAuthenticated(false);
    window.location.href = "https://fazenda360.onrender.com";
  };

  const handleExitPortal = () => {
    const displayName = localStorage.getItem('user_display_name') || 'RD CONILON';
    Swal.fire({
      title: 'Deseja voltar ao Portal?',
      text: "Sua sessão será encerrada com segurança.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2e7d32',
      cancelButtonColor: '#d32f2f',
      confirmButtonText: 'Sim, encerrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
            title: 'Salvando registros...',
            text: `Obrigado pelo trabalho hoje, ${displayName.toUpperCase()}!`,
            icon: 'success',
            timer: 2500,
            showConfirmButton: false,
            timerProgressBar: true
        }).then(() => {
            localStorage.removeItem('cafe_token'); // Limpa a sessão
            localStorage.removeItem('user_display_name');
            window.location.href = "https://fazenda360.onrender.com";
        });
      }
    });
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="bg-white px-4 py-6 sticky top-0 z-50 shadow-sm border-b border-slate-100">
          <div className="max-w-6xl mx-auto flex flex-col items-center justify-center w-full relative">
            <Link to="/" className="flex flex-col items-center outline-none text-center">
              <div className="flex items-center gap-4 leading-none">
                <img src="https://sc01.alicdn.com/kf/Ab1d5f68f57e14024a5f9a93453a2ab73I.png" alt="RD Conilon Logo" className="h-16 w-auto object-contain" />
                <div className="flex flex-col items-start">
                  <span className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">RD CONILON</span>
                  <span className="text-[14px] font-bold text-slate-500 uppercase tracking-widest">CONTROLE DE CAFÉ</span>
                </div>
              </div>
            </Link>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-4">
              <div className="text-right d-none d-md-block leading-tight">
                <div className="text-[12px] font-black text-slate-800 uppercase">
                  {localStorage.getItem('user_display_name') || 'RD CONILON'}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Sessão Ativa
                </div>
              </div>
              <button 
                onClick={handleExitPortal}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-[10px] uppercase hover:bg-slate-50 transition-all shadow-sm"
              >
                <i className="fas fa-th-large mr-1" />
                Portal
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto w-full p-4 pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/producers" element={<ProducerList />} />
            <Route path="/producer/:id" element={<ProducerDetail />} />
            <Route path="/add-guide" element={<AddGuide />} />
            <Route path="/add-sale" element={<AddSale />} />
            <Route path="/update-guide/:id" element={<UpdateGuide />} />
          </Routes>
        </main>

        <footer className="max-w-md mx-auto w-full py-8 text-center border-t border-slate-100">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
            © 2026 RD CONILON - TODOS OS DIREITOS RESERVADOS
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
