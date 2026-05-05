import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProducerList from './pages/ProducerList';
import ProducerDetail from './pages/ProducerDetail';
import AddGuide from './pages/AddGuide';
import AddSale from './pages/AddSale';
import UpdateGuide from './pages/UpdateGuide';

function App() {
  const handleExit = () => {
    alert('Salvando alterações...');
    window.location.href = "about:blank";
    window.close();
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        <header className="bg-white px-4 py-8 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex flex-col items-center justify-center w-full relative">
            <Link to="/" className="flex flex-col items-center gap-1 outline-none text-center">
              <div className="flex items-center gap-4 leading-none">
                <img src="https://sc01.alicdn.com/kf/Ab1d5f68f57e14024a5f9a93453a2ab73I.png" alt="RD Conilon Logo" className="h-16 w-auto" />
                <span className="text-3xl font-black text-slate-800 tracking-tighter uppercase">RD - CONTROLE DE CAFÉ</span>
              </div>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mt-1">Sistema Atualizado v2.0</span>
            </Link>
            <button 
              onClick={handleExit}
              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-4 py-2 border border-red-100 rounded-xl text-red-600 font-black text-[10px] uppercase active:bg-red-50 transition-colors"
            >
              <span className="w-2 h-2 bg-red-600 rounded-full" />
              Sair
            </button>
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
