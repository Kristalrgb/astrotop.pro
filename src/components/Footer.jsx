import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const Footer = () => {
  const { currentLanguage } = useLanguage()
  const isEnglish = currentLanguage === 'en'

  return (
    <footer className="footer">
      <div className="container">
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
