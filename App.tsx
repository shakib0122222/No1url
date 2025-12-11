import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ViewPage from './components/ViewPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/v/:id" element={<ViewPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;