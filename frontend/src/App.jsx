import { useContext } from 'react';
import { BrowserRouter as Router, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import MovieDetails from './pages/MovieDetails';
import Watchlist from './pages/Watchlist';
import { AuthProvider } from './context/AuthContext';
import { AuthContext } from './context/AuthContext';

function ProtectedLayout() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

function PublicOnlyRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (user) {
    return <Navigate to="/browse" replace />;
  }

  return children;
}

function RootRedirect() {
  const { user } = useContext(AuthContext);
  return <Navigate to={user ? '/browse' : '/login'} replace />;
}

function AppShell() {
  const location = useLocation();
  const authPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className={`min-h-screen bg-netflix-dark text-white ${authPage ? '' : 'overflow-x-hidden'}`}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route
          path="/login"
          element={(
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/register"
          element={(
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          )}
        />

        <Route element={<ProtectedLayout />}>
          <Route path="/browse" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/watchlist" element={<Watchlist />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppShell />
      </Router>
    </AuthProvider>
  );
}

export default App;
