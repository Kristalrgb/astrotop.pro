import React, { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'astrology-store-products'
const SYSTEM_OWNER = {
  id: 'system',
  name: 'AstroTop Маркет',
  avatar: 'https://placehold.co/80x80/4b6cb7/ffffff?text=AT',
  type: 'platform'
}

const withOwnerMeta = (product) => {
  if (!product) return null
  return {
    ...product,
    ownerId: product.ownerId ?? SYSTEM_OWNER.id,
    ownerName: product.ownerName ?? SYSTEM_OWNER.name,
    ownerAvatar: product.ownerAvatar ?? SYSTEM_OWNER.avatar,
    ownerType: product.ownerType ?? SYSTEM_OWNER.type
  }
}

const ProductsContext = createContext()

export const useProducts = () => {
  const context = useContext(ProductsContext)
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider')
  }
  return context
}

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Загружаем товары из localStorage при инициализации
  useEffect(() => {
    try {
      console.log('ProductsContext: Инициализация контекста товаров')
      const savedProducts = localStorage.getItem(STORAGE_KEY)
      if (savedProducts) {
        try {
          const parsedProducts = JSON.parse(savedProducts)
          console.log('ProductsContext: Загружены товары из localStorage:', parsedProducts)
          const normalized = parsedProducts
            .filter(Boolean)
            .map(withOwnerMeta)
          setProducts(normalized)
        } catch (error) {
          console.error('Ошибка загрузки товаров:', error)
          setError('Ошибка загрузки товаров из localStorage')
          // Загружаем базовые товары по умолчанию
          loadDefaultProducts()
        }
      } else {
        console.log('ProductsContext: Товары не найдены в localStorage, загружаем по умолчанию')
        loadDefaultProducts()
      }
    } catch (error) {
      console.error('Критическая ошибка в ProductsContext:', error)
      setError('Критическая ошибка загрузки товаров')
      loadDefaultProducts()
    } finally {
      setLoading(false)
    }
  }, [])

  // Сохраняем товары в localStorage при изменении
  useEffect(() => {
    if (!loading) {
      console.log('ProductsContext: Сохраняем товары в localStorage:', products)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    }
  }, [products, loading])

  const loadDefaultProducts = () => {
    console.log('ProductsContext: Загружаем товары по умолчанию')
    const defaultProducts = [
      {
        id: 1,
        name: 'Кристалл кварца',
        nameEn: 'Quartz Crystal',
        category: 'crystals',
        price: 1500,
        priceUSD: 16,
        priceEUR: 15,
        rating: 4.8,
        reviews: 127,
        image: '🔮',
        description: 'Натуральный кристалл кварца для медитации и энергетической защиты',
        descriptionEn: 'Natural quartz crystal for meditation and energy protection',
        inStock: true,
        ownerId: SYSTEM_OWNER.id,
        ownerName: SYSTEM_OWNER.name,
        ownerAvatar: SYSTEM_OWNER.avatar,
        ownerType: SYSTEM_OWNER.type
      },
      {
        id: 2,
        name: 'Таро карты Райдера-Уэйта',
        nameEn: 'Rider-Waite Tarot Cards',
        category: 'tarot',
        price: 2500,
        priceUSD: 27,
        priceEUR: 25,
        rating: 4.9,
        reviews: 89,
        image: '🃏',
        description: 'Классическая колода таро для профессиональных чтений',
        descriptionEn: 'Classic tarot deck for professional readings',
        inStock: true,
        ownerId: SYSTEM_OWNER.id,
        ownerName: SYSTEM_OWNER.name,
        ownerAvatar: SYSTEM_OWNER.avatar,
        ownerType: SYSTEM_OWNER.type
      },
      {
        id: 3,
        name: 'Благовония лаванда',
        nameEn: 'Lavender Incense',
        category: 'incense',
        price: 300,
        priceUSD: 3,
        priceEUR: 3,
        rating: 4.6,
        reviews: 234,
        image: '🕯️',
        description: 'Успокаивающие благовония для создания атмосферы',
        descriptionEn: 'Calming incense for creating atmosphere',
        inStock: true,
        ownerId: SYSTEM_OWNER.id,
        ownerName: SYSTEM_OWNER.name,
        ownerAvatar: SYSTEM_OWNER.avatar,
        ownerType: SYSTEM_OWNER.type
      },
      {
        id: 4,
        name: 'Астрологический дневник',
        nameEn: 'Astrological Diary',
        category: 'books',
        price: 800,
        priceUSD: 9,
        priceEUR: 8,
        rating: 4.7,
        reviews: 156,
        image: '📖',
        description: 'Дневник для записи астрологических наблюдений',
        descriptionEn: 'Diary for recording astrological observations',
        inStock: false,
        ownerId: SYSTEM_OWNER.id,
        ownerName: SYSTEM_OWNER.name,
        ownerAvatar: SYSTEM_OWNER.avatar,
        ownerType: SYSTEM_OWNER.type
      },
      {
        id: 5,
        name: 'Свечи для ритуалов',
        nameEn: 'Ritual Candles',
        category: 'candles',
        price: 450,
        priceUSD: 5,
        priceEUR: 5,
        rating: 4.5,
        reviews: 89,
        image: '🕯️',
        description: 'Набор свечей для различных ритуалов и медитаций',
        descriptionEn: 'Set of candles for various rituals and meditations',
        inStock: true,
        ownerId: SYSTEM_OWNER.id,
        ownerName: SYSTEM_OWNER.name,
        ownerAvatar: SYSTEM_OWNER.avatar,
        ownerType: SYSTEM_OWNER.type
      },
      {
        id: 6,
        name: 'Подушка для медитации',
        nameEn: 'Meditation Cushion',
        category: 'accessories',
        price: 1200,
        priceUSD: 13,
        priceEUR: 12,
        rating: 4.8,
        reviews: 67,
        image: '🧘',
        description: 'Удобная подушка для медитации и йоги',
        descriptionEn: 'Comfortable cushion for meditation and yoga',
        inStock: true,
        ownerId: SYSTEM_OWNER.id,
        ownerName: SYSTEM_OWNER.name,
        ownerAvatar: SYSTEM_OWNER.avatar,
        ownerType: SYSTEM_OWNER.type
      }
    ]
    console.log('ProductsContext: Установлены товары по умолчанию:', defaultProducts)
    setProducts(defaultProducts.map(withOwnerMeta))
  }

  const addProduct = (productData) => {
    try {
      console.log('ProductsContext: Получены данные товара:', productData)
      
      const newProduct = {
        ...withOwnerMeta(productData),
        id: Date.now(),
        createdAt: new Date().toISOString()
      }
      
      console.log('ProductsContext: Создан новый товар:', newProduct)
      
      setProducts(prev => {
        console.log('ProductsContext: Предыдущий список товаров:', prev)
        const updated = [...prev, newProduct]
        console.log('ProductsContext: Обновленный список товаров:', updated)
        return updated
      })
      
      console.log('ProductsContext: Товар успешно добавлен в состояние')
    } catch (error) {
      console.error('ProductsContext: Ошибка при добавлении товара:', error)
    }
  }

  const updateProduct = (productData) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productData.id 
          ? { ...withOwnerMeta(productData), updatedAt: new Date().toISOString() }
          : product
      )
    )
    console.log('Товар обновлен:', productData)
  }

  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(product => product.id !== productId))
    console.log('Товар удален:', productId)
  }

  const getProductById = (productId) => {
    return (products || []).find(product => product && product.id === productId)
  }

  const getProductsByCategory = (category) => {
    if (category === 'all') return products || []
    return (products || []).filter(product => product && product.category === category)
  }

  const getProductsByOwner = (ownerId) => {
    if (!ownerId) {
      return (products || []).filter(product => product && product.ownerId === SYSTEM_OWNER.id)
    }
    return (products || []).filter(product => product && String(product.ownerId) === String(ownerId))
  }

  const searchProducts = (query) => {
    if (!query) return products || []
    return (products || []).filter(product => 
      product && (
        (product.name && product.name.toLowerCase().includes(query.toLowerCase())) ||
        (product.nameEn && product.nameEn.toLowerCase().includes(query.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(query.toLowerCase())) ||
        (product.descriptionEn && product.descriptionEn.toLowerCase().includes(query.toLowerCase()))
      )
    )
  }

  const getCategories = () => {
    const categories = [
      { id: 'crystals', name: 'Кристаллы', nameEn: 'Crystals', icon: '🔮' },
      { id: 'tarot', name: 'Таро', nameEn: 'Tarot', icon: '🃏' },
      { id: 'incense', name: 'Благовония', nameEn: 'Incense', icon: '🕯️' },
      { id: 'books', name: 'Книги', nameEn: 'Books', icon: '📖' },
      { id: 'candles', name: 'Свечи', nameEn: 'Candles', icon: '🕯️' },
      { id: 'accessories', name: 'Аксессуары', nameEn: 'Accessories', icon: '🧘' },
      { id: 'jewelry', name: 'Украшения', nameEn: 'Jewelry', icon: '💎' },
      { id: 'herbs', name: 'Травы', nameEn: 'Herbs', icon: '🌿' },
      { id: 'tools', name: 'Инструменты', nameEn: 'Tools', icon: '⚡' }
    ]
    return categories
  }

  const getStats = () => {
    const productsList = products || []
    return {
      total: productsList.length,
      inStock: productsList.filter(p => p && p.inStock).length,
      outOfStock: productsList.filter(p => p && !p.inStock).length,
      categories: [...new Set(productsList.map(p => p && p.category).filter(Boolean))].length,
      owners: [...new Set(productsList.map(p => p && p.ownerId).filter(Boolean))].length,
      averageRating: productsList.length > 0 
        ? (productsList.reduce((sum, p) => sum + (p && p.rating || 0), 0) / productsList.length).toFixed(1)
        : 0
    }
  }

  const getOwnerStats = (ownerId) => {
    const ownerProducts = getProductsByOwner(ownerId)
    return {
      total: ownerProducts.length,
      inStock: ownerProducts.filter(p => p.inStock).length,
      outOfStock: ownerProducts.filter(p => !p.inStock).length
    }
  }

  const value = {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductsByCategory,
    getProductsByOwner,
    searchProducts,
    getCategories,
    getStats,
    getOwnerStats
  }

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  )
}
