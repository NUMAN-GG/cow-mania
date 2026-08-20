import { useAuth } from './context/AuthContext';
import MilkSales from './components/MilkSales';

// Protected route component for Admin-only views
const AdminOnly = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!isAdmin) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        Access Denied. This section is restricted to Admins only.
      </div>
    );
  }
  return children;
};

export default function App() {
  const { user, profile, isAdmin, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-medium text-gray-600">Loading Cow Mania...</p>
      </div>
    );
  }

  // Display login prompt if not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">Welcome to Cow Mania</h1>
        <p className="text-gray-500">Please sign in to access your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-slate-800 text-white p-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-xl font-bold">Cow Mania</h1>
          <p className="text-xs text-slate-300">
            Logged in as: <span className="font-semibold">{profile?.full_name || user.email}</span> ({profile?.role})
          </p>
        </div>
        <button
          onClick={signOut}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition"
        >
          Sign Out
        </button>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white border-b px-4 py-3 flex gap-6 text-sm font-medium text-gray-700">
        <a href="#sales" className="hover:text-blue-600">Milk Sales</a>

        {/* Admin-only links */}
        {isAdmin && (
          <>
            <a href="#animals" className="hover:text-blue-600">Animals</a>
            <a href="#lactation" className="hover:text-blue-600">Lactation Logs</a>
            <a href="#customers" className="hover:text-blue-600">Customers</a>
          </>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="p-6 max-w-7xl mx-auto">
        <MilkSales />
      </main>
    </div>
  );
}