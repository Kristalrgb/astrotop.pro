import React from 'react'
import { Link } from 'react-router-dom'
import { FaStar } from 'react-icons/fa'
import { useLanguage } from '../contexts/LanguageContext'
import NewsFeed from '../components/NewsFeed'
import AdBanner from '../components/AdBanner'

const Home = () => {
  const { t, currentLanguage } = useLanguage()

  const topSpecialists = [
    {
      id: 1,
      name: 'Елена Петрова',
      specialty: 'Астролог',
      rating: 4.9,
      price: '3000 ₽/час',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=200&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Михаил Сидоров',
      specialty: 'Таролог',
      rating: 4.8,
      price: '2500 ₽/час',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Анна Козлова',
      specialty: 'Астролог-нумеролог',
      rating: 4.7,
      price: '3500 ₽/час',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=200&fit=crop&crop=face'
    }
  ]

  return (
    <div>
      {/* Реклама вверху страницы */}
      <AdBanner 
        size="banner" 
        position="top" 
        id="home-top-ad" 
        showLabel={true}
      />

      {/* Hero Section */}
      <section className="hero" style={{ marginTop: '-93px' }}>
        <div className="container">
          <div className="dashboard-overlay hero-overlay">
            <h1>{t('home.hero.title')}</h1>
            <p>{t('home.hero.subtitle')}</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '-19px' }}>
              <Link to="/specialists" className="btn btn-primary choose-specialist-btn" style={{ fontSize: '0.9rem', padding: '10px 20px' }}>
                {t('home.buttons.chooseSpecialist')}
              </Link>
              <Link to="/register" className="btn btn-primary register-btn" style={{ fontSize: '0.9rem', padding: '10px 20px' }}>
                {t('home.buttons.register')}
              </Link>
              <Link to="/deploy" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '10px 20px', background: '#9c27b0', borderColor: '#9c27b0' }}>
                🚀 {currentLanguage === 'en' ? 'Deploy Project' : 'Деплой проекта'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* News Feed Section */}
      <section style={{ padding: '80px 0', marginTop: '-165px', marginBottom: '-21px' }}>
        <div className="container">
          <NewsFeed limit={4} showManageLink />
        </div>
      </section>

      {/* Реклама после новостей */}
      <div className="container">
        <AdBanner 
          size="banner" 
          position="inline" 
          id="home-middle-ad" 
          showLabel={true}
        />
      </div>

      {/* Top Specialists Section */}
      <section style={{ padding: '19px 0 80px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '60px', fontSize: '2.5rem', color: 'white' }}>
            {t('home.topSpecialists.title')}
          </h2>
          <div className="specialists-grid">
            {topSpecialists.map((specialist) => (
              <div key={specialist.id} className="specialist-card">
                <img src={specialist.image} alt={specialist.name} />
                <div className="specialist-info">
                  <h3 className="specialist-name">{specialist.name}</h3>
                  <p className="specialist-specialty">{specialist.specialty}</p>
                  <div className="specialist-rating">
                    <div className="rating">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`star ${i < Math.floor(specialist.rating) ? '' : 'empty'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span>{specialist.rating}</span>
                  </div>
                  <p className="specialist-price">{specialist.price}</p>
                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    <Link to={`/specialists/${specialist.id}`} className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                      Подробнее о специалисте
                    </Link>
                    <Link to={`/specialists/${specialist.id}`} className="btn btn-primary book-appointment-btn" style={{ width: '100%' }}>
                      {t('home.topSpecialists.book')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/specialists" className="btn btn-secondary">
              {t('home.topSpecialists.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '2.5rem', color: '#333' }}>
              {t('home.ctaSection.title')}
            </h2>
            <p style={{ marginBottom: '40px', fontSize: '1.2rem', color: '#666' }}>
              {t('home.ctaSection.description')}
            </p>
            <Link to="/register" className="btn btn-gray start-now-btn">
              {t('home.ctaSection.button')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
