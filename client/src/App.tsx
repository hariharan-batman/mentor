import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppContextProvider } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { CompanyProfile } from './pages/CompanyProfile';
import { Diagnostic } from './pages/Diagnostic';
import { AIChat } from './pages/AIChat';
import { Topics } from './pages/Topics';
import { Documents } from './pages/Documents';
import { Roadmap } from './pages/Roadmap';
import { Funds } from './pages/Funds';
import { Rules } from './pages/Rules';
import { Mentors } from './pages/Mentors';

const AppLayout = () => (
  <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
    <Sidebar />
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-y-auto w-full">
        <Outlet />
      </main>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <AppContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Landing />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="company-profile" element={<CompanyProfile />} />
            <Route path="topics" element={<Topics />} />
            <Route path="documents" element={<Documents />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="funds" element={<Funds />} />
            <Route path="rules" element={<Rules />} />
            <Route path="mentors" element={<Mentors />} />
            <Route path="diagnostic" element={<Diagnostic />} />
            <Route path="ai-chat" element={<AIChat />} />
            <Route path="*" element={<div className="p-8"><h2 className="text-2xl font-bold">Page Coming Soon</h2><p className="mt-2 text-slate-500">This feature is being developed.</p></div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppContextProvider>
  );
};

export default App;
