import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Coffee, Home, Users, PlusCircle, ShoppingBag } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ProducerDetail from './pages/ProducerDetail';
import AddGuide from './pages/AddGuide';
import AddSale from './pages/AddSale';
import UpdateGuide from './pages/UpdateGuide';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col pb-20">
        <header className="bg-white border-b sticky top-0 z-10 px-4 py-4">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-emerald-800">
              <Coffee className="w-6 h-6" />
              <span>CaféControl</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-lg mx-auto w-full p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/producer/:id" element={<ProducerDetail />} />
            <Route path="/add-guide" element={<AddGuide />} />
            <Route path="/add-sale" element={<AddSale />} />
            <Route path="/update-guide/:id" element={<UpdateGuide />} />
          </Routes>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 px-4 max-w-lg mx-auto shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <Link to="/" className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-700">
            <Home className="w-6 h-6" />
            <span className="text-xs">Início</span>
          </Link>
          <Link to="/add-guide" className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-700">
            <PlusCircle className="w-6 h-6" />
            <span className="text-xs">Entrada</span>
          </Link>
          <Link to="/add-sale" className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-700">
            <ShoppingBag className="w-6 h-6" />
            <span className="text-xs">Venda</span>
          </Link>
        </nav>
      </div>
    </Router>
  );
}

export default App;
