import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import MilkSales from './components/MilkSales';
import Lactation from './components/Lactation';
import Animals from './components/Animals';
import Customers from './components/Customers';

export default function App() {
  const { user, profile, canView, signOut, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('sales');

  const handleSignOut = async () => {
    setActiveTab('sales');
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p className="text-lg font-medium">Loading Cow Mania...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const tabClass = (tab) =>
    activeTab === tab
      ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
      : 'hover:text-blue-600';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-slate-800 text-white p-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-xl font-bold">Cow Mania</h1>
          <p className="text-xs text-slate-300">
            Logged in as:{' '}
            <span className="font-semibold">{profile?.full_name || user.email}</span>
            {profile?.role && ` (${profile.role})`}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition"
        >
          Sign Out
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b px-4 py-3 flex gap-6 text-sm font-medium text-gray-700">
        <button onClick={() => setActiveTab('sales')} className={tabClass('sales')}>
          Milk Sales
        </button>

        {canView && (
          <>
            <button onClick={() => setActiveTab('animals')} className={tabClass('animals')}>
              Animals
            </button>
            <button onClick={() => setActiveTab('lactation')} className={tabClass('lactation')}>
              Lactation Logs
            </button>
            <button onClick={() => setActiveTab('customers')} className={tabClass('customers')}>
              Customers
            </button>
          </>
        )}
      </nav>

      {/* Content Rendering */}
      <main className="p-6 max-w-7xl mx-auto">
        {activeTab === 'sales' && <MilkSales />}
        {activeTab === 'animals' && canView && <Animals />}
        {activeTab === 'lactation' && canView && <Lactation />}
        {activeTab === 'customers' && canView && <Customers />}
      </main>
    </div>
  );
}