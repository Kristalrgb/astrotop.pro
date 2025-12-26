import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useSpecialists } from '../contexts/SpecialistsContext'
import { usePayment } from '../contexts/PaymentContext'
import { useNews } from '../contexts/NewsContext'
import BookingModal from '../components/BookingModal'
import { FaStar, FaClock, FaUsers, FaVideo, FaCalendarAlt, FaYoutube, FaTelegram, FaWhatsapp, FaInstagram, FaVk, FaTiktok, FaArrowLeft, FaEnvelope, FaPhone } from 'react-icons/fa'
import AdBanner from '../components/AdBanner'

const SpecialistDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { specialists } = useSpecialists()
  const { calculatePrice, calculatePriceWithFreeMinutes, FREE_MINUTES } = usePayment()
  const { posts: newsPosts } = useNews()
  const [specialist, setSpecialist] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(30)
  const [selectedCurrency, setSelectedCurrency] = useState('RUB')

  useEffect(() => {
    const found = specialists.find(s => String(s.id) === String(id))
    if (found) {
      setSpecialist(found)
    } else {
      // Если специалист не найден, перенаправляем на страницу списка
      navigate('/specialists')
    }
  }, [id, specialists, navigate])

  // Фильтруем новости этого специалиста
  const specialistNews = newsPosts.filter(post => 
    post.authorId === specialist?.id || post.authorName === specialist?.name
  )

  const durations = [15, 30, 45, 60, 90, 120]
  const currencies = ['RUB', 'USD', 'EUR', 'BTC', 'ETH', 'USDT']

  const isSocialLink = (tag) => {
    const socialPlatforms = ['YouTube', 'Telegram', 'WhatsApp', 'Instagram', 'VK', 'TikTok']
    return socialPlatforms.includes(tag)
  }

  const getSocialIcon = (platform) => {
    const icons = {
      'YouTube': <FaYoutube />,
      'Telegram': <FaTelegram />,
      'WhatsApp': <FaWhatsapp />,
      'Instagram': <FaInstagram />,
      'VK': <FaVk />,
      'TikTok': <FaTiktok />
    }
    return icons[platform] || null
  }

  const getSocialUrl = (platform) => {
    if (!specialist) return '#'
    const tag = specialist.tags?.find(t => t === platform)
    if (!tag) return '#'
    
    // Ищем URL в других полях специалиста
    const socialUrls = {
      'YouTube': specialist.youtubeUrl || specialist.socialLinks?.youtube || '#',
      'Telegram': specialist.telegramUrl || specialist.socialLinks?.telegram || '#',
      'WhatsApp': specialist.whatsappUrl || specialist.socialLinks?.whatsapp || '#',
      'Instagram': specialist.instagramUrl || specialist.socialLinks?.instagram || '#',
      'VK': specialist.vkUrl || specialist.socialLinks?.vk || '#',
      'TikTok': specialist.tiktokUrl || specialist.socialLinks?.tiktok || '#'
    }
    return socialUrls[platform] || '#'
  }

  const formatDate = (value) => {
    try {
      return new Date(value).toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return value
    }
  }

  if (!specialist) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <div className="container">
          <div className="dashboard-overlay">
            <h2 style={{ color: 'white' }}>Загрузка...</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        {/* Реклама вверху */}
        <AdBanner 
          size="banner" 
          position="top" 
          id="specialist-detail-top-ad" 
          showLabel={true}
        />

        {/* Кнопка назад */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => navigate('/specialists')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FaArrowLeft />
            Назад к списку специалистов
          </button>
        </div>

        {/* Основная информация о специалисте */}
        <div className="dashboard-overlay" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            {/* Аватар и основная информация */}
            <div style={{ flex: '0 0 auto' }}>
              <div className="specialist-avatar" style={{ position: 'relative', marginBottom: '20px' }}>
                <img 
                  src={specialist.avatar} 
                  alt={specialist.name}
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #667eea'
                  }}
                />
                <div className="specialist-status online" style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  width: '30px',
                  height: '30px',
                  border: '4px solid white'
                }}></div>
              </div>
            </div>

            {/* Информация */}
            <div style={{ flex: '1 1 300px' }}>
              <h1 style={{ color: 'white', marginBottom: '10px', fontSize: '2.5rem' }}>
                {specialist.name}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.3rem', marginBottom: '15px' }}>
                {specialist.specialty}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'white' }}>
                  <FaStar style={{ color: '#ffd700' }} />
                  <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{specialist.rating}</span>
                  <span style={{ opacity: 0.8 }}>({specialist.reviews} {t('specialists.reviews')})</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                  <FaClock />
                  <span>{specialist.experience} {t('specialists.experience')}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                  <FaUsers />
                  <span>{specialist.consultations} консультаций</span>
                </div>
              </div>

              {/* Социальные ссылки */}
              {specialist.tags && specialist.tags.some(tag => isSocialLink(tag)) && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: 'white', marginBottom: '10px', fontSize: '1.1rem' }}>Социальные сети:</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {specialist.tags.filter(tag => isSocialLink(tag)).map(tag => (
                      <a
                        key={tag}
                        href={getSocialUrl(tag)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                      >
                        {getSocialIcon(tag)}
                        {tag}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Кнопка бронирования */}
              <button
                className="btn btn-primary book-btn"
                onClick={() => setShowBookingModal(true)}
                style={{ fontSize: '1.1rem', padding: '15px 30px' }}
              >
                <FaCalendarAlt style={{ marginRight: '8px' }} />
                Забронировать консультацию
              </button>
            </div>
          </div>
        </div>

        {/* Описание */}
        {specialist.description && (
          <div className="dashboard-overlay" style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'white', marginBottom: '15px' }}>О специалисте</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.8', fontSize: '1.1rem' }}>
              {specialist.description}
            </p>
          </div>
        )}

        {/* Услуги и теги */}
        {(specialist.services || specialist.tags) && (
          <div className="dashboard-overlay" style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'white', marginBottom: '15px' }}>Услуги и специализация</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {specialist.services?.map(service => (
                <span key={service} className="tag" style={{ 
                  background: 'rgba(102, 126, 234, 0.3)', 
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #667eea'
                }}>
                  {service}
                </span>
              ))}
              {specialist.tags?.filter(tag => !isSocialLink(tag)).map(tag => (
                <span key={tag} className="tag" style={{ 
                  background: 'rgba(102, 126, 234, 0.3)', 
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #667eea'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Новости специалиста */}
        {specialistNews.length > 0 && (
          <div className="dashboard-overlay" style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Новости от {specialist.name}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {specialistNews.slice(0, 5).map(post => (
                <div key={post.id} style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <h3 style={{ color: 'white', marginBottom: '10px' }}>{post.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '10px' }}>{post.content}</p>
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title}
                      style={{
                        width: '100%',
                        maxWidth: '500px',
                        borderRadius: '8px',
                        marginBottom: '10px'
                      }}
                    />
                  )}
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                    {formatDate(post.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Цены и бронирование */}
        <div className="dashboard-overlay">
          <h2 style={{ color: 'white', marginBottom: '20px' }}>Цены и бронирование</h2>
          
          <div style={{
            background: '#e8f5e9',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '2px solid #4CAF50',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '5px' }}>
              <span style={{ fontSize: '1.2rem' }}>🎁</span>
              <strong style={{ color: '#2e7d32', fontSize: '1rem' }}>Первые {FREE_MINUTES} минуты БЕСПЛАТНО!</strong>
            </div>
            <p style={{ margin: 0, color: '#2e7d32', fontSize: '0.9rem' }}>
              Первая консультация начинается с {FREE_MINUTES} бесплатных минут
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>Цена за минуту</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '20px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '700', color: '#667eea' }}>
                {specialist.pricePerMinute || 50} ₽
              </span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem' }}>/мин</span>
            </div>

            {/* Выбор длительности */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                Длительность консультации:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {durations.map(duration => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    style={{
                      padding: '10px 20px',
                      border: `2px solid ${selectedDuration === duration ? '#667eea' : '#e1e5e9'}`,
                      borderRadius: '8px',
                      background: selectedDuration === duration ? '#667eea' : 'white',
                      color: selectedDuration === duration ? 'white' : '#333',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: selectedDuration === duration ? '600' : '500'
                    }}
                  >
                    {duration} мин
                  </button>
                ))}
              </div>
            </div>

            {/* Выбор валюты */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                Валюта оплаты:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {currencies.map(currency => (
                  <button
                    key={currency}
                    onClick={() => setSelectedCurrency(currency)}
                    style={{
                      padding: '8px 16px',
                      border: `2px solid ${selectedCurrency === currency ? '#667eea' : '#e1e5e9'}`,
                      borderRadius: '8px',
                      background: selectedCurrency === currency ? '#667eea' : 'white',
                      color: selectedCurrency === currency ? 'white' : '#333',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    {currency}
                  </button>
                ))}
              </div>
            </div>

            {/* Итоговая цена */}
            {(() => {
              const priceInfo = calculatePriceWithFreeMinutes(selectedDuration, specialist.pricePerMinute || 50, selectedCurrency)
              return (
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '2px solid #667eea'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ color: '#333', fontSize: '1.1rem' }}>Итого:</span>
                    <span style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
                      {priceInfo.priceWithFree} {selectedCurrency === 'RUB' ? '₽' : selectedCurrency}
                    </span>
                  </div>
                  {priceInfo.totalPrice > priceInfo.priceWithFree && (
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                      Первые {FREE_MINUTES} минут бесплатно, далее {specialist.pricePerMinute || 50} ₽/мин
                    </p>
                  )}
                </div>
              )
            })()}
          </div>
        </div>

        {/* Реклама внизу */}
        <AdBanner 
          size="banner" 
          position="inline" 
          id="specialist-detail-bottom-ad" 
          showLabel={true}
        />
      </div>

      {/* Модальное окно бронирования */}
      {showBookingModal && (
        <BookingModal
          specialist={specialist}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          selectedDuration={selectedDuration}
          selectedCurrency={selectedCurrency}
        />
      )}
    </div>
  )
}

export default SpecialistDetail

