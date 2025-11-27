import React, { useState } from 'react'
import { FaTimes, FaCreditCard, FaTruck, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

const CheckoutModal = ({ isOpen, onClose, cart, onOrderComplete }) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Данные покупателя
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Адрес доставки
    address: '',
    city: '',
    postalCode: '',
    country: 'Россия',
    
    // Способ доставки
    deliveryMethod: 'standard',
    
    // Способ оплаты
    paymentMethod: 'card',
    
    // Комментарий
    comment: ''
  })
  
  const [errors, setErrors] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  const deliveryCost = formData.deliveryMethod === 'express' ? 500 : 200
  const finalAmount = totalAmount + deliveryCost

  const validateStep = (stepNumber) => {
    const newErrors = {}
    
    if (stepNumber === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Имя обязательно'
      if (!formData.lastName.trim()) newErrors.lastName = 'Фамилия обязательна'
      if (!formData.email.trim()) newErrors.email = 'Email обязателен'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Некорректный email'
      if (!formData.phone.trim()) newErrors.phone = 'Телефон обязателен'
      else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) newErrors.phone = 'Некорректный телефон'
    }
    
    if (stepNumber === 2) {
      if (!formData.address.trim()) newErrors.address = 'Адрес обязателен'
      if (!formData.city.trim()) newErrors.city = 'Город обязателен'
      if (!formData.postalCode.trim()) newErrors.postalCode = 'Почтовый индекс обязателен'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handlePrev = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(2)) return
    
    setIsProcessing(true)
    
    try {
      // Имитация обработки заказа
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const order = {
        id: Date.now(),
        date: new Date().toISOString(),
        customer: formData,
        items: cart,
        total: finalAmount,
        status: 'pending'
      }
      
      console.log('CheckoutModal: Заказ создан:', order)
      
      // Вызываем callback для завершения заказа
      if (onOrderComplete) {
        onOrderComplete(order)
      }
      
      // Закрываем модальное окно
      onClose()
      
    } catch (error) {
      console.error('CheckoutModal: Ошибка при создании заказа:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const renderStep1 = () => (
    <div className="checkout-step">
      <h3>Данные покупателя</h3>
      <div className="form-row">
        <div className="form-group">
          <label>
            <FaUser /> Имя *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={errors.firstName ? 'error' : ''}
            placeholder="Введите имя"
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>
        <div className="form-group">
          <label>
            <FaUser /> Фамилия *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={errors.lastName ? 'error' : ''}
            placeholder="Введите фамилию"
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>
      </div>
      
      <div className="form-group">
        <label>
          <FaEnvelope /> Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={errors.email ? 'error' : ''}
          placeholder="example@email.com"
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>
      
      <div className="form-group">
        <label>
          <FaPhone /> Телефон *
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className={errors.phone ? 'error' : ''}
          placeholder="+7 (999) 123-45-67"
        />
        {errors.phone && <span className="error-text">{errors.phone}</span>}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="checkout-step">
      <h3>Адрес доставки</h3>
      
      <div className="form-group">
        <label>
          <FaMapMarkerAlt /> Адрес *
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className={errors.address ? 'error' : ''}
          placeholder="Улица, дом, квартира"
        />
        {errors.address && <span className="error-text">{errors.address}</span>}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Город *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={errors.city ? 'error' : ''}
            placeholder="Москва"
          />
          {errors.city && <span className="error-text">{errors.city}</span>}
        </div>
        <div className="form-group">
          <label>Почтовый индекс *</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            className={errors.postalCode ? 'error' : ''}
            placeholder="123456"
          />
          {errors.postalCode && <span className="error-text">{errors.postalCode}</span>}
        </div>
      </div>
      
      <div className="form-group">
        <label>Страна</label>
        <select
          name="country"
          value={formData.country}
          onChange={handleInputChange}
        >
          <option value="Россия">Россия</option>
          <option value="Беларусь">Беларусь</option>
          <option value="Казахстан">Казахстан</option>
        </select>
      </div>
      
      <h3>Способ доставки</h3>
      <div className="delivery-options">
        <label className="delivery-option">
          <input
            type="radio"
            name="deliveryMethod"
            value="standard"
            checked={formData.deliveryMethod === 'standard'}
            onChange={handleInputChange}
          />
          <div className="delivery-info">
            <strong>Стандартная доставка</strong>
            <span>200 ₽ • 3-5 дней</span>
          </div>
        </label>
        
        <label className="delivery-option">
          <input
            type="radio"
            name="deliveryMethod"
            value="express"
            checked={formData.deliveryMethod === 'express'}
            onChange={handleInputChange}
          />
          <div className="delivery-info">
            <strong>Экспресс доставка</strong>
            <span>500 ₽ • 1-2 дня</span>
          </div>
        </label>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="checkout-step">
      <h3>Способ оплаты</h3>
      <div className="payment-options">
        <label className="payment-option">
          <input
            type="radio"
            name="paymentMethod"
            value="card"
            checked={formData.paymentMethod === 'card'}
            onChange={handleInputChange}
          />
          <div className="payment-info">
            <FaCreditCard />
            <span>Банковская карта</span>
          </div>
        </label>
        
        <label className="payment-option">
          <input
            type="radio"
            name="paymentMethod"
            value="crypto"
            checked={formData.paymentMethod === 'crypto'}
            onChange={handleInputChange}
          />
          <div className="payment-info">
            <span>₿</span>
            <span>Криптовалюта</span>
          </div>
        </label>
      </div>
      
      <div className="form-group">
        <label>Комментарий к заказу</label>
        <textarea
          name="comment"
          value={formData.comment}
          onChange={handleInputChange}
          placeholder="Дополнительные пожелания..."
          rows="3"
        />
      </div>
      
      <div className="order-summary">
        <h3>Итоги заказа</h3>
        <div className="summary-item">
          <span>Товары ({cart.length} шт.)</span>
          <span>{totalAmount} ₽</span>
        </div>
        <div className="summary-item">
          <span>Доставка</span>
          <span>{deliveryCost} ₽</span>
        </div>
        <div className="summary-total">
          <span>Итого</span>
          <span>{finalAmount} ₽</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-header">
          <h2>Оформление заказа</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="checkout-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <span>Данные</span>
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <span>Доставка</span>
          </div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <span>Оплата</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-content">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>
          
          <div className="checkout-actions">
            {step > 1 && (
              <button type="button" onClick={handlePrev} className="btn btn-secondary">
                Назад
              </button>
            )}
            
            {step < 3 ? (
              <button type="button" onClick={handleNext} className="btn btn-primary">
                Далее
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isProcessing}
              >
                {isProcessing ? 'Обработка...' : `Оформить заказ (${finalAmount} ₽)`}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutModal







