import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Specialists from './pages/Specialists'
import Store from './pages/Store'
import School from './pages/School'
import Profile from './pages/Profile'
import ClientDashboard from './pages/ClientDashboard'
import AstrologerDashboard from './pages/AstrologerDashboard'
import VideoChat from './pages/VideoChat'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { PaymentProvider } from './contexts/PaymentContext'
import { SpecialistsProvider } from './contexts/SpecialistsContext'
import { ProductsProvider } from './contexts/ProductsContext'
import { LecturesProvider } from './contexts/LecturesContext'
import { PromoProvider } from './contexts/PromoContext'
import { NewsProvider } from './contexts/NewsContext'

function App() {
  return (
    <LanguageProvider>
      <PaymentProvider>
        <SpecialistsProvider>
          <ProductsProvider>
            <LecturesProvider>
              <PromoProvider>
                <AuthProvider>
                  <NewsProvider>
                  <div className="App">
                    <Header />
                    <main>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/specialists" element={<Specialists />} />
                        <Route path="/store" element={<Store />} />
                        <Route path="/school" element={<School />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/client-dashboard" element={<ClientDashboard />} />
                        <Route path="/astrologer-dashboard" element={<AstrologerDashboard />} />
                        <Route path="/video-chat/:sessionId" element={<VideoChat />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                  </NewsProvider>
                </AuthProvider>
              </PromoProvider>
            </LecturesProvider>
          </ProductsProvider>
        </SpecialistsProvider>
      </PaymentProvider>
    </LanguageProvider>
  )
}

export default App
