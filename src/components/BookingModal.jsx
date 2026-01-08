import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSpecialists } from '../contexts/SpecialistsContext'
import PromoCodeInput from './PromoCodeInput'
import { FaTimes, FaCalendarAlt, FaClock, FaUser, FaVideo, FaHeadphones, FaGift, FaLanguage, FaPhone, FaUsers, FaCheckCircle, FaUserPlus } from 'react-icons/fa'

const BookingModal = ({ specialist, isOpen, onClose, onBookingConfirm }) => {
  const { user } = useAuth()
  const { specialists: allSpecialists } = useSpecialists()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDuration, setSelectedDuration] = useState(60)
  const [selectedType, setSelectedType] = useState('video')
  const [selectedLanguage, setSelectedLanguage] = useState('ru')
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [notes, setNotes] = useState('')
  const [additionalSpecialist2, setAdditionalSpecialist2] = useState(null)
  const [additionalSpecialist3, setAdditionalSpecialist3] = useState(null)
  const [specialist2Confirmed, setSpecialist2Confirmed] = useState(false)
  const [specialist3Confirmed, setSpecialist3Confirmed] = useState(false)
  const [showSpecialist2Selector, setShowSpecialist2Selector] = useState(false)
  const [showSpecialist3Selector, setShowSpecialist3Selector] = useState(false)

  // Языки для консультации с переводом
  const consultationLanguages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ]

  if (!isOpen) return null

  const durationOptions = [
    { value: 30, label: '30 минут', price: Math.round(specialist.price * 0.5) },
    { value: 60, label: '1 час', price: specialist.price },
    { value: 90, label: '1.5 часа', price: Math.round(specialist.price * 1.5) },
    { value: 120, label: '2 часа', price: specialist.price * 2 }
  ]

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ]

  // Фильтруем доступных специалистов (исключаем уже выбранных)
  const getAvailableSpecialists = () => {
    const selectedIds = [specialist.id, additionalSpecialist2?.id, additionalSpecialist3?.id].filter(Boolean)
    return allSpecialists.filter(s => 
      s.id !== specialist.id && 
      !selectedIds.includes(s.id) &&
      s.available !== false
    )
  }

  const getCurrentPrice = () => {
    let basePrice = durationOptions.find(d => d.value === selectedDuration)?.price || specialist.price
    
    // Добавляем стоимость дополнительных специалистов (если они подтверждены)
    if (additionalSpecialist2 && specialist2Confirmed) {
      const specialist2Price = durationOptions.find(d => d.value === selectedDuration)?.price || additionalSpecialist2.price || 0
      basePrice += Math.round(specialist2Price * 0.7) // 70% от стоимости основного специалиста
    }
    
    if (additionalSpecialist3 && specialist3Confirmed) {
      const specialist3Price = durationOptions.find(d => d.value === selectedDuration)?.price || additionalSpecialist3.price || 0
      basePrice += Math.round(specialist3Price * 0.7) // 70% от стоимости основного специалиста
    }
    
    return basePrice
  }

  // Проверка, можно ли создать консультацию
  const canConfirmBooking = () => {
    // Если выбран второй специалист, он должен быть подтвержден
    if (additionalSpecialist2 && !specialist2Confirmed) {
      return false
    }
    // Если выбран третий специалист, он должен быть подтвержден
    if (additionalSpecialist3 && !specialist3Confirmed) {
      return false
    }
    return true
  }

  const calculateDiscount = (price, discountPercent) => {
    return Math.round(price * (discountPercent / 100))
  }

  const calculateFinalPrice = (price, discountPercent) => {
    return price - calculateDiscount(price, discountPercent)
  }

  const handlePromoApplied = (promoCode) => {
    setAppliedPromo(promoCode)
  }

  const handlePromoRemoved = () => {
    setAppliedPromo(null)
  }

  const handleBookingSubmit = (e) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedTime) {
      alert('Пожалуйста, выберите дату и время')
      return
    }

    if (!user) {
      alert('Пожалуйста, войдите в систему для бронирования')
      return
    }

    if (!phoneNumber.trim()) {
      alert('Пожалуйста, укажите номер телефона для напоминаний')
      return
    }

    // Проверяем подтверждение всех участников
    if (!canConfirmBooking()) {
      alert('Пожалуйста, дождитесь подтверждения всех выбранных специалистов')
      return
    }

    const bookingData = {
      specialistId: specialist.id,
      specialistName: specialist.name,
      clientId: user.id,
      clientName: user.name,
      date: selectedDate,
      time: selectedTime,
      duration: selectedDuration,
      type: selectedType,
      language: selectedLanguage, // Язык для консультации
      phoneNumber: phoneNumber.trim(), // Телефон для напоминаний
      basePrice: getCurrentPrice(),
      discount: appliedPromo ? appliedPromo.discount : 0,
      finalPrice: appliedPromo 
        ? calculateFinalPrice(getCurrentPrice(), appliedPromo.discount)
        : getCurrentPrice(),
      promoCode: appliedPromo ? appliedPromo.code : null,
      notes: notes,
      status: 'pending',
      reminderSent: false, // Флаг отправки напоминания
      createdAt: new Date().toISOString(),
      // Групповая консультация
      isGroupConsultation: !!(additionalSpecialist2 || additionalSpecialist3),
      additionalSpecialists: [
        additionalSpecialist2 && specialist2Confirmed ? {
          id: additionalSpecialist2.id,
          name: additionalSpecialist2.name,
          confirmed: specialist2Confirmed
        } : null,
        additionalSpecialist3 && specialist3Confirmed ? {
          id: additionalSpecialist3.id,
          name: additionalSpecialist3.name,
          confirmed: specialist3Confirmed
        } : null
      ].filter(Boolean)
    }

    console.log('Данные бронирования:', bookingData)
    
    if (onBookingConfirm) {
      onBookingConfirm(bookingData)
    }
    
    onClose()
  }

  const getFinalPrice = () => {
    const basePrice = getCurrentPrice()
    if (appliedPromo) {
      return calculateFinalPrice(basePrice, appliedPromo.discount)
    }
    return basePrice
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FaUser style={{ marginRight: '8px', color: '#667eea' }} />
            Запись к {specialist.name}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleBookingSubmit} className="booking-form">
          {/* Выбор даты */}
          <div className="form-section">
            <label className="section-label">
              <FaCalendarAlt style={{ marginRight: '8px' }} />
              Выберите дату
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="form-input"
            />
          </div>

          {/* Выбор времени */}
          <div className="form-section">
            <label className="section-label">
              <FaClock style={{ marginRight: '8px' }} />
              Выберите время
            </label>
            <div className="time-slots">
              {timeSlots.map(time => (
                <button
                  key={time}
                  type="button"
                  className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Выбор длительности */}
          <div className="form-section">
            <label className="section-label">Длительность консультации</label>
            <div className="duration-options">
              {durationOptions.map(option => (
                <label key={option.value} className="duration-option">
                  <input
                    type="radio"
                    name="duration"
                    value={option.value}
                    checked={selectedDuration === option.value}
                    onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                  />
                  <div className="duration-card">
                    <div className="duration-label">{option.label}</div>
                    <div className="duration-price">{option.price} ₽</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Тип консультации */}
          <div className="form-section">
            <label className="section-label">Тип консультации</label>
            <div className="consultation-types">
              <label className="type-option">
                <input
                  type="radio"
                  name="type"
                  value="video"
                  checked={selectedType === 'video'}
                  onChange={(e) => setSelectedType(e.target.value)}
                />
                <div className="type-card">
                  <FaVideo />
                  <span>Видео консультация</span>
                </div>
              </label>
              <label className="type-option">
                <input
                  type="radio"
                  name="type"
                  value="audio"
                  checked={selectedType === 'audio'}
                  onChange={(e) => setSelectedType(e.target.value)}
                />
                <div className="type-card">
                  <FaHeadphones />
                  <span>Аудио консультация</span>
                </div>
              </label>
            </div>
          </div>

          {/* Выбор языка консультации */}
          <div className="form-section">
            <label className="section-label">
              <FaLanguage style={{ marginRight: '8px' }} />
              Язык консультации
            </label>
            <div className="language-selection">
              {consultationLanguages.map(lang => (
                <label key={lang.code} className="language-option-booking">
                  <input
                    type="radio"
                    name="consultationLanguage"
                    value={lang.code}
                    checked={selectedLanguage === lang.code}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  />
                  <div className="language-card-booking">
                    <span className="language-flag">{lang.flag}</span>
                    <span className="language-name">{lang.name}</span>
                  </div>
                </label>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              💡 Во время консультации будет доступен синхронный перевод между участниками
            </p>
          </div>

          {/* Выбор дополнительных специалистов для групповой консультации */}
          <div className="form-section">
            <label className="section-label">
              <FaUsers style={{ marginRight: '8px' }} />
              Групповая консультация (опционально)
            </label>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
              Вы можете добавить до двух дополнительных специалистов для консультации втроем или вчетвером. Консультация будет создана только после подтверждения всех участников.
            </p>

            {/* Выбор второго специалиста */}
            <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e1e5e9', borderRadius: '8px', background: '#f8f9fa' }}>
              {!additionalSpecialist2 ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowSpecialist2Selector(!showSpecialist2Selector)}
                    className="btn btn-secondary"
                    style={{ width: '100%', marginBottom: '10px' }}
                  >
                    <FaUserPlus style={{ marginRight: '8px' }} />
                    Добавить второго специалиста
                  </button>
                  {showSpecialist2Selector && (
                    <div style={{ marginTop: '10px' }}>
                      <select
                        className="form-input"
                        onChange={(e) => {
                          const spec = getAvailableSpecialists().find(s => s.id === parseInt(e.target.value))
                          if (spec) {
                            setAdditionalSpecialist2(spec)
                            setShowSpecialist2Selector(false)
                            // Отправляем запрос на подтверждение (имитация)
                            setTimeout(() => {
                              // В реальном приложении здесь будет запрос к серверу
                              setSpecialist2Confirmed(true)
                              alert(`${spec.name} подтвердил участие в консультации`)
                            }, 1000)
                          }
                        }}
                        value=""
                      >
                        <option value="">Выберите специалиста...</option>
                        {getAvailableSpecialists().map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.specialty}) - {s.price} ₽/час
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{additionalSpecialist2.name}</strong>
                    <span style={{ marginLeft: '10px', color: '#666' }}>
                      {specialist2Confirmed ? (
                        <span style={{ color: '#27ae60' }}>
                          <FaCheckCircle style={{ marginRight: '5px' }} />
                          Подтверждено
                        </span>
                      ) : (
                        <span style={{ color: '#f39c12' }}>
                          Ожидание подтверждения...
                        </span>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAdditionalSpecialist2(null)
                      setSpecialist2Confirmed(false)
                    }}
                    style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>

            {/* Выбор третьего специалиста */}
            <div style={{ padding: '15px', border: '1px solid #e1e5e9', borderRadius: '8px', background: '#f8f9fa' }}>
              {!additionalSpecialist3 ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowSpecialist3Selector(!showSpecialist3Selector)}
                    className="btn btn-secondary"
                    style={{ width: '100%', marginBottom: '10px' }}
                    disabled={!additionalSpecialist2}
                  >
                    <FaUserPlus style={{ marginRight: '8px' }} />
                    Добавить третьего специалиста
                  </button>
                  {showSpecialist3Selector && additionalSpecialist2 && (
                    <div style={{ marginTop: '10px' }}>
                      <select
                        className="form-input"
                        onChange={(e) => {
                          const spec = getAvailableSpecialists().find(s => s.id === parseInt(e.target.value))
                          if (spec) {
                            setAdditionalSpecialist3(spec)
                            setShowSpecialist3Selector(false)
                            // Отправляем запрос на подтверждение (имитация)
                            setTimeout(() => {
                              // В реальном приложении здесь будет запрос к серверу
                              setSpecialist3Confirmed(true)
                              alert(`${spec.name} подтвердил участие в консультации`)
                            }, 1000)
                          }
                        }}
                        value=""
                      >
                        <option value="">Выберите специалиста...</option>
                        {getAvailableSpecialists().map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.specialty}) - {s.price} ₽/час
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {!additionalSpecialist2 && (
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                      Сначала добавьте второго специалиста
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{additionalSpecialist3.name}</strong>
                    <span style={{ marginLeft: '10px', color: '#666' }}>
                      {specialist3Confirmed ? (
                        <span style={{ color: '#27ae60' }}>
                          <FaCheckCircle style={{ marginRight: '5px' }} />
                          Подтверждено
                        </span>
                      ) : (
                        <span style={{ color: '#f39c12' }}>
                          Ожидание подтверждения...
                        </span>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAdditionalSpecialist3(null)
                      setSpecialist3Confirmed(false)
                    }}
                    style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>

            {/* Информация о групповой консультации */}
            {(additionalSpecialist2 || additionalSpecialist3) && (
              <div style={{ marginTop: '15px', padding: '15px', background: '#e8f4f8', borderRadius: '8px', border: '1px solid #bee5eb' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#0c5460' }}>
                  <strong>ℹ️ Групповая консультация:</strong> Консультация будет создана только после подтверждения всех выбранных специалистов.
                  {(!specialist2Confirmed && additionalSpecialist2) || (!specialist3Confirmed && additionalSpecialist3) ? (
                    <span style={{ display: 'block', marginTop: '5px', color: '#f39c12' }}>
                      Ожидание подтверждения: {[additionalSpecialist2 && !specialist2Confirmed ? additionalSpecialist2.name : null, additionalSpecialist3 && !specialist3Confirmed ? additionalSpecialist3.name : null].filter(Boolean).join(', ')}
                    </span>
                  ) : (
                    <span style={{ display: 'block', marginTop: '5px', color: '#27ae60' }}>
                      ✓ Все участники подтверждены
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Номер телефона для напоминаний */}
          <div className="form-section">
            <label className="section-label">
              <FaPhone style={{ marginRight: '8px' }} />
              Номер телефона для напоминаний
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+7 (999) 123-45-67"
              required
              className="form-input"
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              📱 На этот номер будет отправлено SMS-напоминание за 24 часа до консультации
            </p>
          </div>

          {/* Промо код */}
          <PromoCodeInput
            astrologerId={specialist.id}
            onPromoApplied={handlePromoApplied}
            onPromoRemoved={handlePromoRemoved}
            currentPrice={getCurrentPrice()}
          />

          {/* Дополнительные заметки */}
          <div className="form-section">
            <label className="section-label">Дополнительные пожелания (необязательно)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Опишите, что вас интересует..."
              rows="3"
              className="form-textarea"
            />
          </div>

          {/* Итоговая стоимость */}
          <div className="price-summary">
            <div className="price-row">
              <span>Базовая стоимость:</span>
              <span>{getCurrentPrice()} ₽</span>
            </div>
            {appliedPromo && (
              <>
                <div className="price-row discount">
                  <span>Скидка ({appliedPromo.discount}%):</span>
                  <span>-{calculateDiscount(getCurrentPrice(), appliedPromo.discount)} ₽</span>
                </div>
                <div className="price-row total">
                  <span><strong>Итого к оплате:</strong></span>
                  <span><strong>{getFinalPrice()} ₽</strong></span>
                </div>
              </>
            )}
            {!appliedPromo && (
              <div className="price-row total">
                <span><strong>К оплате:</strong></span>
                <span><strong>{getFinalPrice()} ₽</strong></span>
              </div>
            )}
          </div>

          {/* Кнопки */}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!canConfirmBooking()}
              style={!canConfirmBooking() ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            >
              {!canConfirmBooking() ? (
                'Ожидание подтверждения всех участников...'
              ) : (
                `Забронировать за ${getFinalPrice()} ₽`
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .booking-modal {
          background: white;
          border-radius: 15px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 25px;
          border-bottom: 1px solid #e1e5e9;
        }

        .modal-header h2 {
          margin: 0;
          color: #333;
          display: flex;
          align-items: center;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
          padding: 5px;
        }

        .booking-form {
          padding: 25px;
        }

        .form-section {
          margin-bottom: 25px;
        }

        .section-label {
          display: flex;
          align-items: center;
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
          font-size: 16px;
        }

        .form-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .time-slots {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 10px;
        }

        .time-slot {
          padding: 10px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .time-slot:hover {
          border-color: #667eea;
        }

        .time-slot.selected {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .duration-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
        }

        .duration-option {
          cursor: pointer;
        }

        .duration-option input {
          display: none;
        }

        .duration-card {
          padding: 15px;
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          text-align: center;
          transition: all 0.2s ease;
        }

        .duration-option input:checked + .duration-card {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .duration-label {
          font-weight: 600;
          margin-bottom: 5px;
        }

        .duration-price {
          color: #667eea;
          font-weight: bold;
        }

        .consultation-types {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .language-selection {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 10px;
        }

        .language-option-booking {
          cursor: pointer;
        }

        .language-option-booking input {
          display: none;
        }

        .language-card-booking {
          padding: 12px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          text-align: center;
          justify-content: center;
        }

        .language-option-booking input:checked + .language-card-booking {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .language-flag {
          font-size: 20px;
        }

        .language-name {
          font-size: 14px;
          font-weight: 500;
        }

        .type-option {
          cursor: pointer;
        }

        .type-option input {
          display: none;
        }

        .type-card {
          padding: 20px;
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s ease;
        }

        .type-option input:checked + .type-card {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .form-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          resize: vertical;
          min-height: 80px;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .price-summary {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .price-row.discount {
          color: #27ae60;
        }

        .price-row.total {
          border-top: 1px solid #e1e5e9;
          padding-top: 8px;
          margin-top: 8px;
          font-size: 18px;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 25px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #007bff !important; /* Голубой цвет */
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3 !important; /* Более темный голубой при наведении */
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        @media (max-width: 768px) {
          .booking-modal {
            margin: 10px;
            max-height: 95vh;
          }

          .time-slots {
            grid-template-columns: repeat(3, 1fr);
          }

          .duration-options {
            grid-template-columns: repeat(2, 1fr);
          }

          .consultation-types {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default BookingModal






            </button>

          </div>

        </form>

      </div>



      <style jsx>{`

        .modal-overlay {

          position: fixed;

          top: 0;

          left: 0;

          right: 0;

          bottom: 0;

          background: rgba(0,0,0,0.5);

          display: flex;

          align-items: center;

          justify-content: center;

          z-index: 1000;

          padding: 20px;

        }



        .booking-modal {

          background: white;

          border-radius: 15px;

          max-width: 600px;

          width: 100%;

          max-height: 90vh;

          overflow-y: auto;

          box-shadow: 0 20px 60px rgba(0,0,0,0.3);

        }



        .modal-header {

          display: flex;

          justify-content: space-between;

          align-items: center;

          padding: 20px 25px;

          border-bottom: 1px solid #e1e5e9;

        }



        .modal-header h2 {

          margin: 0;

          color: #333;

          display: flex;

          align-items: center;

        }



        .close-btn {

          background: none;

          border: none;

          font-size: 24px;

          cursor: pointer;

          color: #999;

          padding: 5px;

        }



        .booking-form {

          padding: 25px;

        }



        .form-section {

          margin-bottom: 25px;

        }



        .section-label {

          display: flex;

          align-items: center;

          font-weight: 600;

          color: #333;

          margin-bottom: 10px;

          font-size: 16px;

        }



        .form-input {

          width: 100%;

          padding: 12px;

          border: 2px solid #e1e5e9;

          border-radius: 8px;

          font-size: 16px;

          transition: border-color 0.2s ease;

        }



        .form-input:focus {

          outline: none;

          border-color: #667eea;

        }



        .time-slots {

          display: grid;

          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));

          gap: 10px;

        }



        .time-slot {

          padding: 10px;

          border: 2px solid #e1e5e9;

          border-radius: 8px;

          background: white;

          cursor: pointer;

          transition: all 0.2s ease;

          font-size: 14px;

        }



        .time-slot:hover {

          border-color: #667eea;

        }



        .time-slot.selected {

          background: #667eea;

          color: white;

          border-color: #667eea;

        }



        .duration-options {

          display: grid;

          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));

          gap: 15px;

        }



        .duration-option {

          cursor: pointer;

        }



        .duration-option input {

          display: none;

        }



        .duration-card {

          padding: 15px;

          border: 2px solid #e1e5e9;

          border-radius: 10px;

          text-align: center;

          transition: all 0.2s ease;

        }



        .duration-option input:checked + .duration-card {

          border-color: #667eea;

          background: #f8f9ff;

        }



        .duration-label {

          font-weight: 600;

          margin-bottom: 5px;

        }



        .duration-price {

          color: #667eea;

          font-weight: bold;

        }



        .consultation-types {

          display: grid;

          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

          gap: 15px;

        }



        .language-selection {

          display: grid;

          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));

          gap: 10px;

        }



        .language-option-booking {

          cursor: pointer;

        }



        .language-option-booking input {

          display: none;

        }



        .language-card-booking {

          padding: 12px;

          border: 2px solid #e1e5e9;

          border-radius: 8px;

          display: flex;

          align-items: center;

          gap: 8px;

          transition: all 0.2s ease;

          text-align: center;

          justify-content: center;

        }



        .language-option-booking input:checked + .language-card-booking {

          border-color: #667eea;

          background: #f8f9ff;

        }



        .language-flag {

          font-size: 20px;

        }



        .language-name {

          font-size: 14px;

          font-weight: 500;

        }



        .type-option {

          cursor: pointer;

        }



        .type-option input {

          display: none;

        }



        .type-card {

          padding: 20px;

          border: 2px solid #e1e5e9;

          border-radius: 10px;

          display: flex;

          align-items: center;

          gap: 10px;

          transition: all 0.2s ease;

        }



        .type-option input:checked + .type-card {

          border-color: #667eea;

          background: #f8f9ff;

        }



        .form-textarea {

          width: 100%;

          padding: 12px;

          border: 2px solid #e1e5e9;

          border-radius: 8px;

          font-size: 16px;

          resize: vertical;

          min-height: 80px;

        }



        .form-textarea:focus {

          outline: none;

          border-color: #667eea;

        }



        .price-summary {

          background: #f8f9fa;

          border-radius: 10px;

          padding: 20px;

          margin: 20px 0;

        }



        .price-row {

          display: flex;

          justify-content: space-between;

          margin-bottom: 8px;

        }



        .price-row.discount {

          color: #27ae60;

        }



        .price-row.total {

          border-top: 1px solid #e1e5e9;

          padding-top: 8px;

          margin-top: 8px;

          font-size: 18px;

        }



        .form-actions {

          display: flex;

          gap: 15px;

          justify-content: flex-end;

          margin-top: 25px;

        }



        .btn {

          padding: 12px 24px;

          border: none;

          border-radius: 8px;

          cursor: pointer;

          font-size: 16px;

          font-weight: 600;

          transition: all 0.2s ease;

        }



        .btn-primary {

          background: #007bff !important; /* Голубой цвет */

          color: white;

        }



        .btn-primary:hover {

          background: #0056b3 !important; /* Более темный голубой при наведении */

        }



        .btn-secondary {

          background: #6c757d;

          color: white;

        }



        .btn-secondary:hover {

          background: #5a6268;

        }



        @media (max-width: 768px) {

          .booking-modal {

            margin: 10px;

            max-height: 95vh;

          }



          .time-slots {

            grid-template-columns: repeat(3, 1fr);

          }



          .duration-options {

            grid-template-columns: repeat(2, 1fr);

          }



          .consultation-types {

            grid-template-columns: 1fr;

          }



          .form-actions {

            flex-direction: column;

          }

        }

      `}</style>

    </div>

  )

}



export default BookingModal












