import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import AdBanner from './AdBanner'
import { FaVideo, FaPhone, FaClock, FaUsers, FaCreditCard, FaGlobe } from 'react-icons/fa'

const Footer = () => {
  const { currentLanguage } = useLanguage()
  const isEnglish = currentLanguage === 'en'

  const translate = (ru, en) => (isEnglish ? en : ru)

  return (
    <footer className="footer">
      <div className="container">
        {/* Консультации информация */}
        <div className="consultations-info" style={{ 
          marginBottom: '40px', 
          padding: '30px 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div className="consultations-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
            justifyContent: 'center'
          }}>
            <div className="consultations-item" style={{ 
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              color: 'white'
            }}>
              <FaVideo style={{ fontSize: '24px', marginBottom: '8px', color: '#7e5bf7' }} />
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'white' }}>{translate('Видео консультации', 'Video consultations')}</h4>
            </div>

            <div className="consultations-item" style={{ 
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              color: 'white'
            }}>
              <FaPhone style={{ fontSize: '24px', marginBottom: '8px', color: '#7e5bf7' }} />
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'white' }}>{translate('Аудио консультации', 'Audio consultations')}</h4>
            </div>

            <div className="consultations-item" style={{ 
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              color: 'white'
            }}>
              <FaClock style={{ fontSize: '24px', marginBottom: '8px', color: '#7e5bf7' }} />
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'white' }}>{translate('Удобное время', 'Convenient time')}</h4>
            </div>

            <div className="consultations-item" style={{ 
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              color: 'white'
            }}>
              <FaUsers style={{ fontSize: '24px', marginBottom: '8px', color: '#7e5bf7' }} />
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'white' }}>{translate('Групповые сессии', 'Group sessions')}</h4>
            </div>

            <div className="consultations-item" style={{ 
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              color: 'white'
            }}>
              <FaCreditCard style={{ fontSize: '24px', marginBottom: '8px', color: '#7e5bf7' }} />
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'white' }}>{translate('Поминутная оплата', 'Pay per minute')}</h4>
            </div>

            <div className="consultations-item" style={{ 
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              color: 'white'
            }}>
              <FaGlobe style={{ fontSize: '24px', marginBottom: '8px', color: '#7e5bf7' }} />
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'white' }}>{translate('Специалисты Online', 'Specialists Online')}</h4>
            </div>
          </div>
        </div>

        <div className="footer-content">
          <div className="footer-section">
            <h3>astrotop.pro</h3>
            <p>
              {isEnglish
                ? 'Professional online consultations with astrologers and tarologists. Get answers to the important questions of life.'
                : 'Профессиональные онлайн консультации с астрологами и тарологами. Получите ответы на важные вопросы жизни.'}
            </p>
          </div>
          
          <div className="footer-section">
            <h3>{isEnglish ? 'Services' : 'Услуги'}</h3>
            <p>{isEnglish ? 'Astrological consultations' : 'Астрологические консультации'}</p>
            <p>{isEnglish ? 'Tarot readings' : 'Таро-чтения'}</p>
            <p>{isEnglish ? 'Natal charts' : 'Натальные карты'}</p>
            <p>{isEnglish ? 'Forecasts and predictions' : 'Прогнозы и предсказания'}</p>
          </div>
          
          <div className="footer-section">
            <h3>{isEnglish ? 'Contacts' : 'Контакты'}</h3>
            <p>Email: info@astro-consult.ru</p>
            <p>{isEnglish ? 'Phone: +7 (999) 123-45-67' : 'Телефон: +7 (999) 123-45-67'}</p>
            <p>{isEnglish ? 'Working hours: 24/7' : 'Время работы: 24/7'}</p>
          </div>
          
          <div className="footer-section">
            <h3>{isEnglish ? 'Support' : 'Поддержка'}</h3>
            <p>{isEnglish ? 'Customer help' : 'Помощь клиентам'}</p>
            <p>{isEnglish ? 'Technical support' : 'Техническая поддержка'}</p>
            <p>FAQ</p>
            <p>{isEnglish ? 'Privacy policy' : 'Политика конфиденциальности'}</p>
          </div>
        </div>
        
        {/* Реклама перед копирайтом */}
        <AdBanner 
          size="banner" 
          position="inline" 
          id="footer-ad" 
          showLabel={true}
        />
        
        <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #34495e' }}>
          <p>
            {isEnglish
              ? '© 2024 astrotop.pro. All rights reserved.'
              : '© 2024 astrotop.pro. Все права защищены.'}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
