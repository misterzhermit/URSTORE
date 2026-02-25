import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';
import { Layout } from './components/layout/Layout';
import { BottomNav } from './components/layout/BottomNav';
import { HeaderSummary } from './components/layout/HeaderSummary';
import { Home } from './pages/Home';
import { Orders } from './pages/Orders';
import { Stock } from './pages/Stock';
import { List } from './pages/List';
import { Summary } from './pages/Summary';
import { Balance } from './pages/Balance';
import { Setup } from './pages/Setup';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { OfflineMonitor } from './components/ui/OfflineMonitor';

const MainApp: React.FC = () => {
  const { company, isLoaded, isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState(0); // Default to Home (Aba 0)
  const [showSetup, setShowSetup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  if (showSetup || !company?.name || company?.name === 'Minha Empresa') {
     return <Setup onComplete={() => {
       setShowSetup(false);
       setActiveTab(1); // Ir para a lista de coleta após o setup
     }} />;
  }

  // Render content based on activeTab
  const renderContent = () => {
    if (showSettings) return <Settings onEditCompany={() => setShowSetup(true)} />;
    
    switch (activeTab) {
      case 0: return <Home />;
      case 1: return <List />;
      case 2: return <Stock />;
      case 3: return <Orders />;
      case 4: return <Summary />;
      case 5: return <Balance />;
      default: return <Home />;
    }
  };

  return (
    <Layout>
       <OfflineMonitor />
       <HeaderSummary 
         onProfileClick={() => setShowSettings(!showSettings)} 
         isSettingsActive={showSettings}
       />

       <main className="flex-1 mt-[calc(env(safe-area-inset-top,8px)+56px)]">
         {renderContent()}
       </main>

       <BottomNav 
         activeTab={activeTab} 
         setActiveTab={(tab) => {
           setActiveTab(tab);
           setShowSettings(false);
         }} 
       />
    </Layout>
  );
};

function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;
