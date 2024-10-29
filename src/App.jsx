import { Routes, Route, BrowserRouter, Router } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Expense from './pages/Expense';
import Trip from './pages/Trip';
import NewExpense from './pages/NewExpense';
import NewTrips from './pages/NewTrips';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { AuthProvider, AuthContext } from './components/AuthProvider';
import Approvals from './pages/Approvals';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function App() {

  function ProtectedRoute() {
    const { user } = useContext(AuthContext)
    return user ? <Outlet /> : <Navigate to="/login" replace />
  }

  return (
    <div>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Protected Routes */}
            <Route path='/' element={<ProtectedRoute/>}>
              <Route path='/' element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path='/newExpense' element={<NewExpense />} />
                <Route path='/expense' element={<Expense />} />
                <Route path='/trips' element={<Trip />} />
                <Route path='/newTrips' element={<NewTrips />} />
                <Route path='/approvals' element={<Approvals />} />
                <Route path='/settings' element={<Settings />} />
              </Route>

            </Route>


            {/* Public routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<SignUp />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}
