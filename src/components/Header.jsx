import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import { FaSignOutAlt, FaBars, FaVideo, FaPhone, FaClock, FaUsers, FaCreditCard, FaGlobe } from 'react-icons/fa'
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
              <img src="/images/Лого.png" alt="astrotop.pro" />
            </Link>
          </div>

          <nav className="nav">
            <button 
              className="mobile-menu-btn" 
              onClick={toggleMobileMenu}
              style={{ display: 'none', background: 'none', border: 'none', fontSize: '24px', color: '#667eea' }}
            >
              <FaBars />
            </button>

            <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <li><Link to="/">{t('navigation.home')}</Link></li>
              <li><Link to="/specialists">{t('navigation.specialists')}</Link></li>
              <li><Link to="/store">{t('navigation.store')}</Link></li>
              <li><Link to="/school">{t('navigation.school')}</Link></li>
              <li><Link to="/deploy" style={{ color: '#9c27b0', fontWeight: '600' }}>{currentLanguage === 'en' ? '🚀 Deploy' : '🚀 Деплой'}</Link></li>
              <li><Link to="/admin" className="admin-link">{currentLanguage === 'en' ? '🛠️ Admin' : '🛠️ Админ'}</Link></li>
              
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
          </nav>

          <div className="consultations-info">
            <div className="consultations-grid">
              <div className="consultations-item">
                <FaVideo />
                <h4>{translate('Видео консультации', 'Video consultations')}</h4>
              </div>

              <div className="consultations-item">
                <FaPhone />
                <h4>{translate('Аудио консультации', 'Audio consultations')}</h4>
              </div>

              <div className="consultations-item">
                <FaClock />
                <h4>{translate('Удобное время', 'Convenient time')}</h4>
              </div>

              <div className="consultations-item">
                <FaUsers />
                <h4>{translate('Групповые сессии', 'Group sessions')}</h4>
              </div>

              <div className="consultations-item">
                <FaCreditCard />
                <h4>{translate('Поминутная оплата', 'Pay per minute')}</h4>
              </div>

              <div className="consultations-item">
                <FaGlobe />
                <h4>{translate('Специалисты Online', 'Specialists Online')}</h4>
              </div>
            </div>
          </div>
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

      <style jsx>{`
        .header-grid {
          display: grid;
          grid-template-columns: minmax(90px, 150px) 1fr;
          grid-template-rows: auto auto;
          column-gap: 6px;
          row-gap: 0;
          align-items: center;
          margin-bottom: -6px;
          padding: 2px 0;
        }

        .logo-column {
          grid-row: 1 / span 2;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logo-column img {
          max-height: 99px;
          width: auto;
        }

        .nav {
          grid-column: 2;
          grid-row: 1;
        }

        .consultations-info {
          grid-column: 2;
          grid-row: 2;
          background: transparent;
          border-radius: 0;
          padding: 0;
          color: #7e5bf7;
          box-shadow: none;
          margin-top: -6px;
        }

        .consultations-grid {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          overflow-x: auto;
          padding-bottom: 4px;
          flex-wrap: nowrap;
        }

        .consultations-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 2px 0;
          font-weight: 600;
          font-size: clamp(0.67rem, 0.92vw, 0.86rem);
          white-space: nowrap;
          color: #7e5bf7;
        }

        .consultations-item svg {
          font-size: clamp(12px, 1.9vw, 16px);
          color: #7e5bf7;
        }

        @media (max-width: 768px) {
          .header-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto;
          }

          .logo-column {
            grid-row: 1;
          }

          .nav {
            grid-column: 1;
            grid-row: 2;
          }

          .consultations-info {
            grid-column: 1;
            grid-row: 3;
          }

          .mobile-menu-btn {
            display: block !important;
          }
          
          .nav-links {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            padding: 20px;
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
          }
          
          .nav-links.mobile-open {
            display: flex;
          }
          
          .nav-links li {
            margin: 10px 0;
          }

          .consultations-info {
            padding: 8px 0 !important;
          }

          .consultations-grid {
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px !important;
          }

          .consultations-item h4 {
            font-size: 0.95rem !important;
          }
        }

        .consultations-info {
          padding: 6px 0;
        }

        @media (max-width: 1200px) {
          .consultations-grid {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 992px) {
          .consultations-grid {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </header>
  )
}

export default Header
