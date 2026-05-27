import React, { useState } from 'react'
import { usePromo } from '../contexts/PromoContext'
import { FaGift, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa'

const PromoCodeInput = ({ astrologerId, onPromoApplied, onPromoRemoved, currentPrice }) => {
  const { validatePromoCode, applyPromoCode } = usePromo()
  const [promoCode, setPromoCode] = useState('')
  const [validationResult, setValidationResult] = useState(null)
  const [isValidating, setIsValidating] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState(null)

  const handlePromoCodeChange = (e) => {
    const value = e.target.value.toUpperCase()
    setPromoCode(value)
    
    // Сбрасываем результат валидации при изменении кода
    if (validationResult) {
      setValidationResult(null)
    }
  }

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      setValidationResult({ valid: false, message: 'Введите промо код' })
      return
    }

    setIsValidating(true)
    
    try {
      const result = validatePromoCode(promoCode.trim(), astrologerId)
      setValidationResult(result)
      
      if (result.valid) {
        setAppliedPromo(result.promoCode)
        if (onPromoApplied) {
          onPromoApplied(result.promoCode)
        }
      }
    } catch (error) {
      console.error('Ошибка при проверке промо кода:', error)
      setValidationResult({ valid: false, message: 'Ошибка при проверке промо кода' })
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCode('')
    setValidationResult(null)
    if (onPromoRemoved) {
      onPromoRemoved()
    }
  }

  const calculateDiscount = (price, discountPercent) => {
    return Math.round(price * (discountPercent / 100))
  }

  const calculateFinalPrice = (price, discountPercent) => {
    return price - calculateDiscount(price, discountPercent)
  }

  return (
    <div className="promo-code-input">
      <div className="promo-header">
        <h3>
          <FaGift style={{ marginRight: '8px', color: '#667eea' }} />
          Промо код
        </h3>
        {appliedPromo && (
          <div className="applied-promo">
            <span className="discount-badge">
              -{appliedPromo.discount}%
            </span>
            <span className="promo-code-text">{appliedPromo.code}</span>
          </div>
        )}
      </div>

      {!appliedPromo ? (
        <div className="promo-input-section">
          <div className="input-group">
            <input
              type="text"
              placeholder="Введите промо код"
              value={promoCode}
              onChange={handlePromoCodeChange}
              className="promo-input"
              style={{ textTransform: 'uppercase' }}
            />
            <button
              className="validate-btn"
              onClick={handleValidatePromo}
              disabled={isValidating || !promoCode.trim()}
            >
              {isValidating ? 'Проверка...' : 'Применить'}
            </button>
          </div>

          {validationResult && (
            <div className={`validation-result ${validationResult.valid ? 'success' : 'error'}`}>
              {validationResult.valid ? (
                <div className="success-message">
                  <FaCheck />
                  <span>Промо код применен! Скидка {validationResult.promoCode.discount}%</span>
                </div>
              ) : (
                <div className="error-message">
                  <FaTimes />
                  <span>{validationResult.message}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="applied-promo-info">
          <div className="promo-details">
            <div className="promo-info-item">
              <strong>Промо код:</strong> {appliedPromo.code}
            </div>
            <div className="promo-info-item">
              <strong>Скидка:</strong> {appliedPromo.discount}%
            </div>
            {appliedPromo.description && (
              <div className="promo-info-item">
                <strong>Описание:</strong> {appliedPromo.description}
              </div>
            )}
          </div>

          <div className="price-calculation">
            <div className="price-row">
              <span>Исходная цена:</span>
              <span>{currentPrice} ₽</span>
            </div>
            <div className="price-row discount">
              <span>Скидка ({appliedPromo.discount}%):</span>
              <span>-{calculateDiscount(currentPrice, appliedPromo.discount)} ₽</span>
            </div>
            <div className="price-row total">
              <span><strong>Итого к оплате:</strong></span>
              <span><strong>{calculateFinalPrice(currentPrice, appliedPromo.discount)} ₽</strong></span>
            </div>
          </div>

          <button
            className="remove-promo-btn"
            onClick={handleRemovePromo}
          >
            <FaTimes />
            Удалить промо код
          </button>
        </div>
      )}

      <style jsx>{`
        .promo-code-input {
          background: white;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .promo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .promo-header h3 {
          margin: 0;
          color: #333;
          display: flex;
          align-items: center;
        }

        .applied-promo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .discount-badge {
          background: #27ae60;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }

        .promo-code-text {
          font-family: monospace;
          font-weight: bold;
          color: #667eea;
        }

        .promo-input-section {
          margin-bottom: 15px;
        }

        .input-group {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .promo-input {
          flex: 1;
          padding: 12px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s ease;
        }

        .promo-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .validate-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s ease;
        }

        .validate-btn:hover:not(:disabled) {
          background: #5a6fd8;
        }

        .validate-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .validation-result {
          padding: 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        .validation-result.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .validation-result.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .applied-promo-info {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
        }

        .promo-details {
          margin-bottom: 15px;
        }

        .promo-info-item {
          margin-bottom: 8px;
          font-size: 14px;
        }

        .price-calculation {
          background: white;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
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
        }

        .remove-promo-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .remove-promo-btn:hover {
          background: #c0392b;
        }

        @media (max-width: 768px) {
          .input-group {
            flex-direction: column;
          }

          .promo-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}

export default PromoCodeInput








