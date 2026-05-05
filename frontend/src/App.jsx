import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProducerList from './pages/ProducerList';
import ProducerDetail from './pages/ProducerDetail';
import AddGuide from './pages/AddGuide';
import AddSale from './pages/AddSale';
import UpdateGuide from './pages/UpdateGuide';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
        <header className="bg-white px-4 py-4 sticky top-0 z-50 border-b border-slate-100 shadow-sm">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 outline-none">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xl font-black text-emerald-900 tracking-tighter">RD</span>
                  <span className="text-xl font-black text-slate-800 tracking-tighter uppercase">Fazenda360</span>
                </div>
                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em] mt-0.5">Sistema Atualizado v2.0</span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <div className="text-right leading-none hidden xs:block">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Admin</p>
                <p className="text-[8px] font-bold text-emerald-600 uppercase">Sessão Ativa</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-red-100 rounded-lg text-red-600 font-bold text-[9px] uppercase active:bg-red-50 transition-colors">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-md mx-auto w-full p-4 pb-12">
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
