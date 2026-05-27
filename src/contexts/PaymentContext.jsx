import React, { createContext, useContext, useState } from 'react'

const PaymentContext = createContext()

export const usePayment = () => {
  const context = useContext(PaymentContext)
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider')
  }
  return context
}

export const PaymentProvider = ({ children }) => {
  const [paymentMethods] = useState([
    {
      id: 'card',
      name: 'Банковская карта',
      icon: '💳',
      currencies: ['RUB', 'USD', 'EUR'],
      fees: { RUB: 0, USD: 0, EUR: 0 }
    },
    {
      id: 'crypto',
      name: 'Криптовалюта',
      icon: '₿',
      currencies: ['BTC', 'ETH', 'USDT', 'USDC'],
      fees: { BTC: 0.001, ETH: 0.01, USDT: 0, USDC: 0 }
    }
  ])

  const [exchangeRates] = useState({
    RUB: 1,
    USD: 0.011,
    EUR: 0.01,
    BTC: 0.0000004,
    ETH: 0.000006,
    USDT: 0.011,
    USDC: 0.011
  })

  // Первые 3 минуты бесплатные
  const FREE_MINUTES = 3

  const calculatePrice = (minutes, pricePerMinute, currency, useFreeMinutes = false) => {
    let chargeableMinutes = minutes
    
    // Если используются бесплатные минуты, вычитаем первые 3 минуты
    if (useFreeMinutes && minutes > FREE_MINUTES) {
      chargeableMinutes = minutes - FREE_MINUTES
    }
    
    const basePrice = chargeableMinutes * pricePerMinute
    const rate = exchangeRates[currency] || 1
    return Math.max(0, basePrice * rate) // Не меньше 0
  }

  // Расчет стоимости с учетом бесплатных минут (для отображения)
  const calculatePriceWithFreeMinutes = (minutes, pricePerMinute, currency) => {
    const totalPrice = calculatePrice(minutes, pricePerMinute, currency, false)
    const priceWithFree = calculatePrice(minutes, pricePerMinute, currency, true)
    const freeAmount = totalPrice - priceWithFree
    const rate = exchangeRates[currency] || 1
    
    return {
      totalPrice,
      priceWithFree,
      freeAmount,
      freeMinutes: minutes > FREE_MINUTES ? FREE_MINUTES : minutes,
      chargeableMinutes: minutes > FREE_MINUTES ? minutes - FREE_MINUTES : 0
    }
  }

  const processPayment = async (paymentData) => {
    try {
      // Здесь будет интеграция с платежными системами
      console.log('Обработка платежа:', paymentData)
      
      // Имитация успешного платежа
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return {
        success: true,
        transactionId: `tx_${Date.now()}`,
        amount: paymentData.amount,
        currency: paymentData.currency
      }
    } catch (error) {
      console.error('Ошибка платежа:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const value = {
    paymentMethods,
    exchangeRates,
    calculatePrice,
    calculatePriceWithFreeMinutes,
    processPayment,
    FREE_MINUTES
  }

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  )
}
