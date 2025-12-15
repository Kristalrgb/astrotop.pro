import React, { createContext, useContext, useState, useEffect } from 'react'

const PromoContext = createContext()

export const usePromo = () => {
  const context = useContext(PromoContext)
  if (!context) {
    throw new Error('usePromo must be used within a PromoProvider')
  }
  return context
}

export const PromoProvider = ({ children }) => {
  const [promoCodes, setPromoCodes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Загружаем промо коды из localStorage при инициализации
  useEffect(() => {
    try {
      console.log('PromoContext: Инициализация контекста промо кодов')
      const savedPromoCodes = localStorage.getItem('astrology-promo-codes')
      if (savedPromoCodes) {
        try {
          const parsedPromoCodes = JSON.parse(savedPromoCodes)
          console.log('PromoContext: Загружены промо коды из localStorage:', parsedPromoCodes)
          setPromoCodes(parsedPromoCodes)
        } catch (error) {
          console.error('Ошибка загрузки промо кодов:', error)
          setError('Ошибка загрузки промо кодов из localStorage')
        }
      } else {
        console.log('PromoContext: Промо коды не найдены в localStorage')
        setPromoCodes([])
      }
    } catch (error) {
      console.error('Критическая ошибка в PromoContext:', error)
      setError('Критическая ошибка загрузки промо кодов')
    } finally {
      setLoading(false)
    }
  }, [])

  // Сохраняем промо коды в localStorage при изменении
  useEffect(() => {
    if (!loading) {
      console.log('PromoContext: Сохраняем промо коды в localStorage:', promoCodes)
      localStorage.setItem('astrology-promo-codes', JSON.stringify(promoCodes))
    }
  }, [promoCodes, loading])

  // Создание нового промо кода
  const createPromoCode = (promoData) => {
    try {
      console.log('PromoContext: Создание нового промо кода:', promoData)
      
      const newPromoCode = {
        ...promoData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        isActive: true,
        usageCount: 0,
        maxUsage: promoData.maxUsage || 100
      }
      
      console.log('PromoContext: Создан новый промо код:', newPromoCode)
      
      setPromoCodes(prev => {
        console.log('PromoContext: Предыдущий список промо кодов:', prev)
        const updated = [...prev, newPromoCode]
        console.log('PromoContext: Обновленный список промо кодов:', updated)
        return updated
      })
      
      console.log('PromoContext: Промо код успешно добавлен в состояние')
      return newPromoCode
    } catch (error) {
      console.error('PromoContext: Ошибка при создании промо кода:', error)
      throw error
    }
  }

  // Обновление промо кода
  const updatePromoCode = (promoData) => {
    setPromoCodes(prev => 
      prev.map(promo => 
        promo.id === promoData.id 
          ? { ...promoData, updatedAt: new Date().toISOString() }
          : promo
      )
    )
    console.log('Промо код обновлен:', promoData)
  }

  // Удаление промо кода
  const deletePromoCode = (promoId) => {
    setPromoCodes(prev => prev.filter(promo => promo.id !== promoId))
    console.log('Промо код удален:', promoId)
  }

  // Активация/деактивация промо кода
  const togglePromoCode = (promoId) => {
    setPromoCodes(prev => 
      prev.map(promo => 
        promo.id === promoId 
          ? { ...promo, isActive: !promo.isActive, updatedAt: new Date().toISOString() }
          : promo
      )
    )
    console.log('Промо код переключен:', promoId)
  }

  // Проверка валидности промо кода
  const validatePromoCode = (code, astrologerId) => {
    console.log('PromoContext: Проверка промо кода:', { code, astrologerId })
    
    const promoCode = promoCodes.find(promo => 
      promo.code.toLowerCase() === code.toLowerCase() && 
      promo.astrologerId === astrologerId &&
      promo.isActive
    )
    
    if (!promoCode) {
      console.log('PromoContext: Промо код не найден или неактивен')
      return { valid: false, message: 'Промо код не найден или неактивен' }
    }
    
    if (promoCode.usageCount >= promoCode.maxUsage) {
      console.log('PromoContext: Промо код исчерпан')
      return { valid: false, message: 'Промо код исчерпан' }
    }
    
    if (promoCode.expiryDate && new Date(promoCode.expiryDate) < new Date()) {
      console.log('PromoContext: Промо код истек')
      return { valid: false, message: 'Промо код истек' }
    }
    
    console.log('PromoContext: Промо код валиден:', promoCode)
    return { valid: true, promoCode }
  }

  // Применение промо кода (увеличение счетчика использования)
  const applyPromoCode = (promoId) => {
    setPromoCodes(prev => 
      prev.map(promo => 
        promo.id === promoId 
          ? { ...promo, usageCount: promo.usageCount + 1, lastUsedAt: new Date().toISOString() }
          : promo
      )
    )
    console.log('Промо код применен:', promoId)
  }

  // Получение промо кодов астролога
  const getAstrologerPromoCodes = (astrologerId) => {
    return promoCodes.filter(promo => promo.astrologerId === astrologerId)
  }

  // Получение статистики промо кодов
  const getPromoStats = (astrologerId) => {
    const astrologerPromos = getAstrologerPromoCodes(astrologerId)
    return {
      total: astrologerPromos.length,
      active: astrologerPromos.filter(p => p.isActive).length,
      inactive: astrologerPromos.filter(p => !p.isActive).length,
      totalUsage: astrologerPromos.reduce((sum, p) => sum + p.usageCount, 0),
      averageUsage: astrologerPromos.length > 0 
        ? (astrologerPromos.reduce((sum, p) => sum + p.usageCount, 0) / astrologerPromos.length).toFixed(1)
        : 0
    }
  }

  // Генерация случайного промо кода
  const generatePromoCode = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const value = {
    promoCodes,
    loading,
    error,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    togglePromoCode,
    validatePromoCode,
    applyPromoCode,
    getAstrologerPromoCodes,
    getPromoStats,
    generatePromoCode
  }

  return (
    <PromoContext.Provider value={value}>
      {children}
    </PromoContext.Provider>
  )
}

