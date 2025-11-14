import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import RoleBasedRoute from './components/RoleBasedRoute'
import Layout from './components/Layout'
import LoginHelp from './components/LoginHelp'
import settingsService from './services/settingsService'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Stock from './pages/Stock'
import Products from './pages/Products'
import Bills from './pages/Bills'
import CreateEditBill from './pages/CreateEditBill'
import Customers from './pages/Customers'
import Suppliers from './pages/Suppliers'
import Insightful from './pages/Insightful'
import Reports from './pages/Reports'
import Contact from './pages/Contact'
import Employees from './pages/Employees'
import Income from './pages/Income'
import Manage from './pages/Manage'
import Settings from './pages/Settings'

function App() {
  // Initialize settings on app load
  useEffect(() => {
    settingsService.initializeSettings()
  }, [])

  // Test if basic React is working
  const isTestMode = window.location.pathname === '/test';
  
  if (isTestMode) {
    return <TestPage />;
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/help" element={<LoginHelp />} />
            
            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="stock" element={<Stock />} />
              <Route path="products" element={<Products />} />
              <Route path="bills" element={<Bills />} />
              <Route path="bills/create" element={<CreateEditBill />} />
              <Route path="bills/:id/edit" element={<CreateEditBill />} />
              <Route path="customers" element={<Customers />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="insightful" element={<Insightful />} />
              <Route path="reports" element={<Reports />} />
              <Route path="contact" element={<Contact />} />
              <Route path="employees" element={
                <RoleBasedRoute allowedRoles={['admin', 'manager']}>
                  <Employees />
                </RoleBasedRoute>
              } />
              <Route path="income" element={<Income />} />
              <Route path="manage" element={<Manage />} />
              <Route path="profile" element={<Settings />} />
            </Route>
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App