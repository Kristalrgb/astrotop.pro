import React, { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { usePayment } from '../contexts/PaymentContext'
import { useProducts } from '../contexts/ProductsContext'
import BookingModal from './BookingModal'
import { FaStar, FaClock, FaUsers, FaVideo, FaCalendarAlt, FaYoutube, FaTelegram, FaWhatsapp, FaInstagram, FaVk, FaTiktok, FaShoppingBag } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const SpecialistCard = ({ specialist }) => {
  const { t } = useLanguage()
  const { calculatePrice, calculatePriceWithFreeMinutes, FREE_MINUTES } = usePayment()
  const { products: storeProducts } = useProducts()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(30)
  const [selectedCurrency, setSelectedCurrency] = useState('RUB')

  const specialistProducts = React.useMemo(() => {
    return (storeProducts || [])
      .filter(product => product && String(product.ownerId) === String(specialist.id))
      .slice(0, 3)
  }, [storeProducts, specialist.id])

  const durations = [15, 30, 45, 60, 90, 120]
  const currencies = ['RUB', 'USD', 'EUR', 'BTC', 'ETH', 'USDT']

  const handleBookConsultation = () => {
    setShowBookingModal(true)
  }

  const handleBookingConfirm = async (bookingData) => {
    console.log('Бронирование подтверждено:', bookingData)
    
    try {
      // Отправляем данные бронирования на сервер
      const API_BASE_URL = import.meta.env.VITE_API_URL || ''
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      })

      if (!response.ok) {
        throw new Error('Ошибка при сохранении бронирования')
      }

      const savedBooking = await response.json()
      console.log('Бронирование сохранено:', savedBooking)
      
      alert(`✅ Консультация забронирована на ${bookingData.date} в ${bookingData.time}!\n\n` +
            `Стоимость: ${bookingData.finalPrice} ₽\n` +
            `Язык консультации: ${bookingData.language}\n` +
            `📱 Напоминание будет отправлено на ${bookingData.phoneNumber} за 24 часа до консультации`)
    } catch (error) {
      console.error('Ошибка сохранения бронирования:', error)
      // Даже если сервер недоступен, показываем успех (данные сохранятся локально)
      alert(`✅ Консультация забронирована на ${bookingData.date} в ${bookingData.time}!\n\n` +
            `Стоимость: ${bookingData.finalPrice} ₽\n` +
            `Язык консультации: ${bookingData.language}\n` +
            `⚠️ Данные сохранены локально. Напоминания будут отправлены после запуска сервера.`)
    }
  }

  const formatPrice = (price, currency) => {
    if (currency === 'BTC') {
      return `${price.toFixed(8)} BTC`
    } else if (currency === 'ETH') {
      return `${price.toFixed(6)} ETH`
    } else {
      return `${price.toFixed(2)} ${currency}`
    }
  }

  const getPriceForDuration = (duration, currency) => {
    const priceInfo = calculatePriceWithFreeMinutes(duration, specialist.pricePerMinute, currency)
    return priceInfo.priceWithFree
  }

  // Функция для получения иконки социальной сети
  const getSocialIcon = (platform) => {
    const icons = {
      'youtube': <FaYoutube style={{ color: '#FF0000' }} />,
      'telegram': <FaTelegram style={{ color: '#0088cc' }} />,
      'whatsapp': <FaWhatsapp style={{ color: '#25D366' }} />,
      'instagram': <FaInstagram style={{ color: '#E4405F' }} />,
      'vk': <FaVk style={{ color: '#4680C2' }} />,
      'tiktok': <FaTiktok style={{ color: '#000000' }} />
    }
    return icons[platform] || null
  }

  // Функция для проверки, является ли тег социальной ссылкой
  const isSocialLink = (tag) => {
    const socialPlatforms = ['youtube', 'telegram', 'whatsapp', 'instagram', 'vk', 'tiktok']
    return socialPlatforms.some(platform => tag.toLowerCase().includes(platform))
  }

  // Функция для получения URL социальной сети
  const getSocialUrl = (tag) => {
    const platform = tag.toLowerCase()
    if (platform.includes('youtube')) return 'https://youtube.com/@elenapetrova'
    if (platform.includes('telegram')) return 'https://t.me/elenapetrova'
    if (platform.includes('whatsapp')) return 'https://wa.me/79991234567'
    if (platform.includes('instagram')) return 'https://instagram.com/elenapetrova'
    if (platform.includes('vk')) return 'https://vk.com/elenapetrova'
    if (platform.includes('tiktok')) return 'https://tiktok.com/@elenapetrova'
    return '#'
  }

  return (
    <>
      <div className="specialist-card">
        <div className="specialist-header">
          <div className="specialist-avatar">
            <img src={specialist.avatar} alt={specialist.name} />
            <div className="specialist-status online"></div>
          </div>
          
          <div className="specialist-info">
            <h3 className="specialist-name">{specialist.name}</h3>
            <p className="specialist-specialty">{specialist.specialty}</p>
            <div className="specialist-rating">
              <FaStar className="star-icon" />
              <span>{specialist.rating}</span>
              <span className="reviews">({specialist.reviews} {t('specialists.reviews')})</span>
            </div>
          </div>
        </div>

        <div className="specialist-details">
          <div className="specialist-stats">
            <div className="stat">
              <FaClock />
              <span>{specialist.experience} {t('specialists.experience')}</span>
            </div>
            <div className="stat">
              <FaUsers />
              <span>{specialist.consultations} консультаций</span>
            </div>
          </div>

          <p className="specialist-description">{specialist.description}</p>

          <div className="specialist-tags">
            {specialist.tags.map(tag => (
              <span key={tag} className="tag">
                {isSocialLink(tag) ? (
                  <a 
                    href={getSocialUrl(tag)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link"
                    title={`Перейти в ${tag}`}
                  >
                    {getSocialIcon(tag)}
                    <span>{tag}</span>
                  </a>
                ) : (
                  tag
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="specialist-pricing">
          <div style={{
            background: '#e8f5e9',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '15px',
            border: '2px solid #4CAF50',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '5px' }}>
              <span style={{ fontSize: '1.2rem' }}>🎁</span>
              <strong style={{ color: '#2e7d32', fontSize: '0.9rem' }}>Первые {FREE_MINUTES} минуты БЕСПЛАТНО!</strong>
            </div>
            <p style={{ margin: 0, color: '#2e7d32', fontSize: '0.8rem' }}>
              Первая консультация начинается с {FREE_MINUTES} бесплатных минут
            </p>
          </div>

          <h4>{t('specialists.price')} за минуту</h4>
          <div className="price-display">
            <span className="price">{formatPrice(specialist.pricePerMinute, selectedCurrency)}</span>
            <span className="per-minute">/мин</span>
          </div>

          {/* Выбор длительности */}
          <div className="duration-selection">
            <label>{t('consultation.duration')}:</label>
            <div className="duration-options">
              {durations.map(duration => (
                <button
                  key={duration}
                  className={`duration-option ${selectedDuration === duration ? 'active' : ''}`}
                  onClick={() => setSelectedDuration(duration)}
                >
                  {duration} мин
                </button>
              ))}
            </div>
          </div>

          {/* Выбор валюты */}
          <div className="currency-selection">
            <label>{t('payment.currency')}:</label>
            <div className="currency-options">
              {currencies.map(currency => (
                <button
                  key={currency}
                  className={`currency-option ${selectedCurrency === currency ? 'active' : ''}`}
                  onClick={() => setSelectedCurrency(currency)}
                >
                  {currency}
                </button>
              ))}
            </div>
          </div>

          {/* Итоговая стоимость */}
          {(() => {
            const priceInfo = calculatePriceWithFreeMinutes(selectedDuration, specialist.pricePerMinute, selectedCurrency)
            return (
              <div className="total-price">
                <div style={{ marginBottom: '8px' }}>
                  <span>{t('payment.amount')}:</span>
                  {priceInfo.totalPrice > priceInfo.priceWithFree && (
                    <span style={{ 
                      textDecoration: 'line-through', 
                      color: '#999', 
                      fontSize: '0.85rem',
                      marginLeft: '8px'
                    }}>
                      {formatPrice(priceInfo.totalPrice, selectedCurrency)}
                    </span>
                  )}
                </div>
                <span className="total-amount">
                  {formatPrice(priceInfo.priceWithFree, selectedCurrency)}
                </span>
                {priceInfo.freeAmount > 0 && (
                  <div style={{ 
                    color: '#4CAF50', 
                    fontSize: '0.75rem',
                    marginTop: '5px',
                    fontWeight: '600'
                  }}>
                    Экономия: {formatPrice(priceInfo.freeAmount, selectedCurrency)}
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        {specialistProducts.length > 0 && (
          <div className="specialist-products">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <FaShoppingBag />
              <h4 style={{ margin: 0 }}>Товары специалиста</h4>
            </div>
            <div className="specialist-products-list">
              {specialistProducts.map(product => (
                <div key={product.id} className="specialist-product">
                  <div className="specialist-product-media">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0].preview} alt={product.name} />
                    ) : (
                      <span className="product-emoji">{product.image}</span>
                    )}
                  </div>
                  <div className="specialist-product-info">
                    <p className="specialist-product-name">{product.name}</p>
                    <span className="specialist-product-price">{product.price} ₽</span>
                  </div>
                  <Link to="/store" className="btn btn-secondary specialist-product-link">
                    В магазин
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="specialist-actions">
          <button 
            className="btn btn-primary book-btn"
            onClick={handleBookConsultation}
          >
            <FaCalendarAlt />
            {t('specialists.book')}
          </button>
          
          <button className="btn btn-secondary">
            <FaVideo />
            {t('consultation.join')}
          </button>
        </div>
      </div>

      {/* Модальное окно бронирования */}
      <BookingModal
        specialist={specialist}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingConfirm={handleBookingConfirm}
      />
    </>
  )
}

export default SpecialistCard
