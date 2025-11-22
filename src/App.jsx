import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useVisitTracker } from './hooks/useVisitTracker'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ClientProducts from './pages/ClientProducts'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import AnalyticsDashboard from './components/AnalyticsDashboard'



// Component to initialize visit tracking
const VisitTracker = () => {
  useVisitTracker() // This hook handles all visit tracking
  return null
}

function App() {
  return (
    <AuthProvider>
        <VisitTracker />
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/business/:businessId" element={<ClientProducts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <div className="container mx-auto px-4 py-8">
                    <AnalyticsDashboard />
                  </div>
                </ProtectedRoute>
              } 
            />
          </Routes>
          <footer className="bg-green-600 text-gray-100 py-8 mt-12">
            <div className="container mx-auto px-4 text-center">
              &copy; {new Date().getFullYear()} Village Business Platform. All rights reserved.
            </div>
          </footer>
          
        </div>
    </AuthProvider>
  )
}

export default App