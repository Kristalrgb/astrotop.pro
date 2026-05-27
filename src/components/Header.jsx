import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import { FaSignOutAlt, FaBars } from 'react-icons/fa'
import AdBanner from './AdBanner'

const Header = () => {
  const { user, logout } = useAuth()
  const { t, currentLanguage } = useLanguage()
  const isEnglish = currentLanguage === 'en'
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  
  const translate = (ru, en) => (isEnglish ? en : ru)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-grid">
          <div className="logo-column">
            <Link to="/" className="logo">
              <img src="/images/Лого.jpg" alt="astrotop.pro" />
            </Link>
          </div>

          <nav className="nav">
            <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <li><Link to="/">{t('navigation.home')}</Link></li>
              <li><Link to="/specialists">{t('navigation.specialists')}</Link></li>
              <li><Link to="/store">{t('navigation.store')}</Link></li>
              <li><Link to="/school">{t('navigation.school')}</Link></li>
              
              {user ? (
                <>
                  <li><Link to="/profile">{t('navigation.profile')}</Link></li>
                  {user.role === 'client' ? (
                    <li><Link to="/client-dashboard">{t('navigation.dashboard')}</Link></li>
                  ) : (
                    <li><Link to="/astrologer-dashboard">{t('navigation.astrologerDashboard')}</Link></li>
                  )}
                  <li>
                    <button 
                      onClick={handleLogout}
                      style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <FaSignOutAlt />
                      {t('navigation.logout')}
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><Link to="/login">{t('navigation.login')}</Link></li>
                  <li><Link to="/register">{t('navigation.register')}</Link></li>
                </>
              )}
              
              <li>
                <LanguageSwitcher />
              </li>
            </ul>
            <button 
              className="mobile-menu-btn" 
              onClick={toggleMobileMenu}
              style={{ display: 'none', background: 'none', border: 'none', fontSize: '24px', color: '#667eea' }}
            >
              <FaBars />
            </button>
          </nav>
        </div>
      </div>

      {/* Реклама под header (опционально) */}
      {/* Раскомментируйте, если нужна реклама под шапкой:
      <div className="container" style={{ marginTop: '10px' }}>
        <AdBanner 
          size="banner" 
          position="inline" 
          id="header-bottom-ad" 
          showLabel={true}
        />
      </div>
      */}
    </header>
  )
}

export default Header
