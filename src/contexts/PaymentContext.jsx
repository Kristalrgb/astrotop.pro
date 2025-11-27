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

  const calculatePrice = (minutes, pricePerMinute, currency) => {
    const basePrice = minutes * pricePerMinute
    const rate = exchangeRates[currency] || 1
    return basePrice * rate
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
    processPayment
  }

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  )
}
