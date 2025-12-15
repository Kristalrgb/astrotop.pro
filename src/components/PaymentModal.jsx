import React, { useState } from 'react'
import { usePayment } from '../contexts/PaymentContext'
import { useLanguage } from '../contexts/LanguageContext'
import { FaCreditCard, FaBitcoin, FaEthereum, FaTimes } from 'react-icons/fa'

const PaymentModal = ({ isOpen, onClose, consultation, onSuccess }) => {
  const { t } = useLanguage()
  const { paymentMethods, calculatePrice, calculatePriceWithFreeMinutes, processPayment, FREE_MINUTES } = usePayment()
  
  const [selectedMethod, setSelectedMethod] = useState('card')
  const [selectedCurrency, setSelectedCurrency] = useState('RUB')
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const [cryptoAddress, setCryptoAddress] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    setError('')

    try {
      // Используем расчет с учетом бесплатных минут
      const priceInfo = calculatePriceWithFreeMinutes(consultation.duration, consultation.pricePerMinute, selectedCurrency)
      const amount = priceInfo.priceWithFree
      
      const paymentData = {
        method: selectedMethod,
        currency: selectedCurrency,
        amount,
        consultationId: consultation.id,
        freeMinutes: FREE_MINUTES,
        chargeableMinutes: priceInfo.chargeableMinutes,
        ...(selectedMethod === 'card' ? { cardData } : { cryptoAddress })
      }

      const result = await processPayment(paymentData)
      
      if (result.success) {
        onSuccess(result)
        onClose()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const getAvailableCurrencies = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod)
    return method ? method.currencies : []
  }

  const getMethodIcon = (methodId) => {
    switch (methodId) {
      case 'card':
        return <FaCreditCard />
      case 'crypto':
        return <FaBitcoin />
      default:
        return null
    }
  }

  const getCryptoIcon = (currency) => {
    switch (currency) {
      case 'BTC':
        return <FaBitcoin />
      case 'ETH':
        return <FaEthereum />
      default:
        return <span>{currency}</span>
    }
  }

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h2>{t('payment.title')}</h2>
          <button onClick={onClose} className="close-btn">
            <FaTimes />
          </button>
        </div>

        <div className="payment-modal-content">
          {/* Информация о консультации */}
          <div className="consultation-info">
            <h3>{consultation.title}</h3>
            <p>{t('consultation.duration')}: {consultation.duration} мин</p>
            <p>{t('consultation.specialist')}: {consultation.specialist}</p>
            <p>{t('consultation.date')}: {consultation.date} в {consultation.time}</p>
          </div>

          {/* Выбор способа оплаты */}
          <div className="payment-methods">
            <h4>{t('payment.method')}</h4>
            <div className="method-options">
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  className={`method-option ${selectedMethod === method.id ? 'active' : ''}`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <span className="method-icon">{method.icon}</span>
                  <span>{t(`payment.${method.id}`)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Выбор валюты */}
          <div className="currency-selection">
            <h4>{t('payment.currency')}</h4>
            <div className="currency-options">
              {getAvailableCurrencies().map(currency => (
                <button
                  key={currency}
                  className={`currency-option ${selectedCurrency === currency ? 'active' : ''}`}
                  onClick={() => setSelectedCurrency(currency)}
                >
                  {currency === 'BTC' || currency === 'ETH' ? (
                    getCryptoIcon(currency)
                  ) : (
                    <span>{currency}</span>
                  )}
                  <span>{currency}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Форма оплаты */}
          <form onSubmit={handleSubmit} className="payment-form">
            {selectedMethod === 'card' ? (
              <div className="card-form">
                <div className="form-group">
                  <label>{t('payment.cardNumber')}</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.number}
                    onChange={(e) => setCardData({...cardData, number: e.target.value})}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('payment.expiry')}</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('payment.cvv')}</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('payment.cardholderName')}</label>
                  <input
                    type="text"
                    placeholder="Иван Иванов"
                    value={cardData.name}
                    onChange={(e) => setCardData({...cardData, name: e.target.value})}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="crypto-form">
                <div className="form-group">
                  <label>{t('payment.cryptoAddress')}</label>
                  <input
                    type="text"
                    placeholder="Введите адрес кошелька"
                    value={cryptoAddress}
                    onChange={(e) => setCryptoAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="crypto-info">
                  <p>{t('payment.cryptoInfo')}</p>
                  <p className="crypto-address">
                    {t('payment.sendTo')}: <strong>bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Информация о бесплатных минутах */}
            {consultation.duration > FREE_MINUTES && (
              <div style={{
                background: '#e8f5e9',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '2px solid #4CAF50'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.5rem' }}>🎁</span>
                  <strong style={{ color: '#2e7d32' }}>Первые {FREE_MINUTES} минуты БЕСПЛАТНО!</strong>
                </div>
                <p style={{ margin: '5px 0', color: '#2e7d32', fontSize: '0.9rem' }}>
                  Бесплатных минут: {FREE_MINUTES} мин • 
                  Платных минут: {Math.max(0, consultation.duration - FREE_MINUTES)} мин
                </p>
              </div>
            )}

            {/* Сумма к оплате */}
            <div className="payment-amount">
              <h4>{t('payment.amount')}</h4>
              {(() => {
                const priceInfo = calculatePriceWithFreeMinutes(consultation.duration, consultation.pricePerMinute, selectedCurrency)
                return (
                  <div>
                    {priceInfo.totalPrice > priceInfo.priceWithFree && (
                      <div style={{ 
                        textDecoration: 'line-through', 
                        color: '#999', 
                        fontSize: '0.9rem',
                        marginBottom: '5px'
                      }}>
                        {priceInfo.totalPrice.toFixed(2)} {selectedCurrency}
                      </div>
                    )}
                    <div className="amount-display">
                      <span className="amount">
                        {priceInfo.priceWithFree.toFixed(2)}
                      </span>
                      <span className="currency">{selectedCurrency}</span>
                    </div>
                    {priceInfo.freeAmount > 0 && (
                      <div style={{ 
                        color: '#4CAF50', 
                        fontSize: '0.85rem',
                        marginTop: '5px',
                        fontWeight: '600'
                      }}>
                        Экономия: {priceInfo.freeAmount.toFixed(2)} {selectedCurrency}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Ошибки */}
            {error && <div className="error-message">{error}</div>}

            {/* Кнопка оплаты */}
            <button
              type="submit"
              className="payment-submit-btn"
              disabled={isProcessing}
            >
              {isProcessing ? t('common.loading') : t('payment.process')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
