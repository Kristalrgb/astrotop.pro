import React, { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useProducts } from '../contexts/ProductsContext'
import ProductModal from '../components/ProductModal'
import CheckoutModal from '../components/CheckoutModal'
import { FaShoppingCart, FaHeart, FaStar, FaFilter, FaSearch, FaSort, FaEye, FaTimes, FaMinus, FaPlus } from 'react-icons/fa'

const Store = () => {
  const { t, currentLanguage } = useLanguage()
  const isEnglish = currentLanguage === 'en'
  const { products, getCategories, searchProducts, loading, error } = useProducts()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCartModalOpen, setIsCartModalOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  // Отладочная информация
  console.log('Store: Загружено товаров:', products.length)
  console.log('Store: Товары:', products)
  console.log('Store: isModalOpen:', isModalOpen)
  console.log('Store: selectedProduct:', selectedProduct)
  console.log('Store: loading:', loading)
  console.log('Store: error:', error)

  // Получаем категории из контекста
  const categories = [
    { id: 'all', name: 'Все категории', nameEn: 'All Categories', icon: '🛍️' },
    ...getCategories()
  ]

  const addToCart = (product) => {
    console.log('Store: Добавление товара в корзину:', product)
    
    if (!product || !product.id) {
      console.error('Store: Нельзя добавить товар без ID:', product)
      return
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        const newCart = prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        console.log('Store: Количество товара увеличено:', { productId: product.id, newQuantity: existing.quantity + 1 })
        return newCart
      }
      const newCart = [...prev, { ...product, quantity: 1 }]
      console.log('Store: Товар добавлен в корзину:', { productId: product.id, quantity: 1 })
      return newCart
    })
  }

  const updateCartQuantity = (productId, quantity) => {
    console.log('Store: Обновление количества товара:', { productId, quantity })
    
    if (quantity <= 0) {
      setCart(prev => {
        const newCart = prev.filter(item => item.id !== productId)
        console.log('Store: Товар удален из корзины:', productId)
        return newCart
      })
    } else {
      setCart(prev => {
        const existingItem = prev.find(item => item.id === productId)
        if (existingItem) {
          // Товар уже в корзине, обновляем количество
          const newCart = prev.map(item =>
            item.id === productId
              ? { ...item, quantity }
              : item
          )
          console.log('Store: Количество товара обновлено:', { productId, quantity })
          return newCart
        } else {
          // Товара нет в корзине, добавляем его
          const product = products.find(p => p.id === productId)
          if (product) {
            const newCart = [...prev, { ...product, quantity }]
            console.log('Store: Товар добавлен в корзину:', { productId, quantity })
            return newCart
          }
          return prev
        }
      })
    }
  }

  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const openProductModal = (product) => {
    console.log('Store: Открываем модальное окно для товара:', product)
    console.log('Store: Товар ID:', product?.id)
    console.log('Store: Товар название:', product?.name)
    setSelectedProduct(product)
    setIsModalOpen(true)
    console.log('Store: После установки состояния - isModalOpen:', true)
    console.log('Store: После установки состояния - selectedProduct:', product)
    
    // Простая проверка - если модальное окно не открывается, показываем alert
    setTimeout(() => {
      if (isModalOpen) {
        console.log('Store: Модальное окно должно быть открыто!')
      }
    }, 100)
  }

  const closeProductModal = () => {
    setSelectedProduct(null)
    setIsModalOpen(false)
  }

  const openCartModal = () => {
    console.log('Store: Открытие модального окна корзины')
    setIsCartModalOpen(true)
  }

  const closeCartModal = () => {
    console.log('Store: Закрытие модального окна корзины')
    setIsCartModalOpen(false)
  }

  const removeFromCart = (productId) => {
    console.log('Store: Удаление товара из корзины:', productId)
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const openCheckout = () => {
    console.log('Store: Открытие оформления заказа')
    setIsCheckoutOpen(true)
  }

  const closeCheckout = () => {
    console.log('Store: Закрытие оформления заказа')
    setIsCheckoutOpen(false)
  }

  const handleOrderComplete = (order) => {
    console.log('Store: Заказ завершен:', order)
    
    // Очищаем корзину после успешного заказа
    setCart([])
    
    // Показываем уведомление (можно заменить на toast)
    alert(`Заказ #${order.id} успешно оформлен! Сумма: ${order.total} ₽`)
    
    // Закрываем модальное окно
    closeCheckout()
  }

  const getCartQuantity = (productId) => {
    const item = cart.find(item => item.id === productId)
    const quantity = item ? item.quantity : 0
    console.log('Store: Получение количества товара в корзине:', { productId, quantity })
    return quantity
  }

  // Фильтруем товары
  let filteredProducts = products || []
  
  console.log('Store: Исходные товары:', products?.length || 0)
  console.log('Store: Выбранная категория:', selectedCategory)
  console.log('Store: Поисковый запрос:', searchQuery)
  
  if (selectedCategory !== 'all') {
    filteredProducts = filteredProducts.filter(product => product && product.category === selectedCategory)
    console.log('Store: После фильтрации по категории:', filteredProducts.length)
  }
  
  if (searchQuery) {
    try {
      filteredProducts = searchProducts(searchQuery) || []
      console.log('Store: После поиска:', filteredProducts.length)
    } catch (error) {
      console.error('Store: Ошибка поиска:', error)
      filteredProducts = []
    }
  }
  
  console.log('Store: Итоговые товары для отображения:', filteredProducts.length)

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!a || !b) return 0
    
    switch (sortBy) {
      case 'price':
        return (a.price || 0) - (b.price || 0)
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'reviews':
        return (b.reviews || 0) - (a.reviews || 0)
      default:
        return (a.name || '').localeCompare(b.name || '')
    }
  })

  const getProductName = (product) => {
    return t('store.language') === 'ru' ? product.name : product.nameEn
  }

  const getProductDescription = (product) => {
    return t('store.language') === 'ru' ? product.description : product.descriptionEn
  }

  const getCategoryName = (category) => {
    return t('store.language') === 'ru' ? category.name : category.nameEn
  }

  // Показываем состояние загрузки
  if (loading) {
    return (
      <div className="store-page">
        <div className="store-header">
          <h1>{t('store.title')}</h1>
          <p>Загрузка товаров...</p>
        </div>
      </div>
    )
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className="store-page">
        <div className="store-header">
          <h1>{t('store.title')}</h1>
          <p style={{ color: 'red' }}>Ошибка: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: '10px 0'
            }}
          >
            🔄 Перезагрузить страницу
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="store-page">
      <div className="store-header">
        <div className="dashboard-overlay">
          <h1>{t('store.title')}</h1>
          <p>{t('store.subtitle')}</p>
        </div>
        
        {/* Кнопки для тестирования */}
        <div style={{ display: 'flex', gap: '10px', margin: '10px 0', flexWrap: 'wrap' }}>
          <button 
            onClick={() => {
              const testProduct = {
                id: 'test-' + Date.now(),
                name: 'Тестовый товар',
                nameEn: 'Test Product',
                description: 'Это тестовый товар для проверки модального окна',
                descriptionEn: 'This is a test product to check modal window',
                price: 1000,
                priceUSD: 12,
                priceEUR: 11,
                rating: 4.5,
                reviews: 10,
                category: 'crystals',
                inStock: true,
                image: '🔮',
                images: []
              }
              console.log('Store: Принудительно открываем модальное окно с тестовым товаром:', testProduct)
              openProductModal(testProduct)
            }}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {isEnglish ? '🧪 Modal window test' : '🧪 Тест модального окна'}
          </button>
          
          <button 
            onClick={() => {
              console.log('Store: Принудительно открываем модальное окно с первым товаром')
              if (sortedProducts.length > 0) {
                openProductModal(sortedProducts[0])
              } else {
                alert('Нет товаров для открытия!')
              }
            }}
            style={{
              background: '#27ae60',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {isEnglish ? '🔍 Open first product' : '🔍 Открыть первый товар'}
          </button>
          
          <button 
            onClick={() => {
              console.log('Store: Принудительная перезагрузка страницы')
              window.location.reload()
            }}
            style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {isEnglish ? '🔄 Reload page' : '🔄 Перезагрузить страницу'}
          </button>
          
          <button 
            onClick={() => {
              console.log('Store: Очистка localStorage и перезагрузка')
              localStorage.removeItem('astrology-store-products')
              window.location.reload()
            }}
            style={{
              background: '#f39c12',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {isEnglish ? '🗑️ Clear and reload' : '🗑️ Очистить и перезагрузить'}
          </button>
          
          <button 
            onClick={() => {
              console.log('Store: Принудительное отображение модального окна')
              const testProduct = {
                id: 'force-test',
                name: 'Принудительный тест',
                description: 'Это принудительный тест модального окна',
                price: 999,
                rating: 5,
                reviews: 1,
                category: 'crystals',
                inStock: true,
                image: '🔮',
                images: []
              }
              setSelectedProduct(testProduct)
              setIsModalOpen(true)
              console.log('Store: Принудительно установлено isModalOpen = true')
            }}
            style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {isEnglish ? '⚡ Force open' : '⚡ Принудительно открыть'}
          </button>
        </div>
      </div>

      <div className="store-controls">
        <div className="search-section">
          <div className="search-input">
            <FaSearch />
            <input
              type="text"
              placeholder={t('store.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="filters-section">
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-filter ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{getCategoryName(category)}</span>
              </button>
            ))}
          </div>

          <div className="sort-controls">
            <FaSort />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">{t('store.sortByName')}</option>
              <option value="price">{t('store.sortByPrice')}</option>
              <option value="rating">{t('store.sortByRating')}</option>
              <option value="reviews">{t('store.sortByReviews')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="products-info" style={{ margin: '20px 0', padding: '10px', background: '#f8f9fa', borderRadius: '5px' }}>
        <p><strong>{isEnglish ? 'Total products:' : 'Всего товаров:'}</strong> {products.length}</p>
        <p><strong>{isEnglish ? 'Filtered:' : 'Отфильтровано:'}</strong> {sortedProducts.length}</p>
        <p>
          <strong>{isEnglish ? 'Modal open:' : 'Модальное окно открыто:'}</strong>{' '}
          {isModalOpen ? (isEnglish ? 'Yes' : 'Да') : (isEnglish ? 'No' : 'Нет')}
        </p>
        <p>
          <strong>{isEnglish ? 'Selected product:' : 'Выбранный товар:'}</strong>{' '}
          {selectedProduct
            ? (isEnglish ? selectedProduct.nameEn || selectedProduct.name : selectedProduct.name)
            : (isEnglish ? 'None' : 'Нет')}
        </p>
        <p>
          <strong>{isEnglish ? 'Selected product ID:' : 'ID выбранного товара:'}</strong>{' '}
          {selectedProduct ? selectedProduct.id : (isEnglish ? 'None' : 'Нет')}
        </p>
        {isModalOpen && (
          <p style={{ color: 'green', fontWeight: 'bold' }}>
            {isEnglish ? '✅ THE MODAL WINDOW MUST BE VISIBLE!' : '✅ МОДАЛЬНОЕ ОКНО ДОЛЖНО БЫТЬ ВИДНО!'}
          </p>
        )}
      </div>

      <div className="products-grid">
        {sortedProducts.map(product => {
          if (!product || !product.id) {
            console.warn('Store: Пропускаем товар без ID:', product)
            return null
          }
          
          console.log('Store: Рендерим товар:', product)
          return (
          <div key={product.id} className="product-card">
            <div className="product-image" onClick={(e) => {
              console.log('Store: Клик по изображению товара:', product)
              console.log('Store: Событие клика:', e)
              openProductModal(product)
            }}>
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0].preview} 
                  alt={getProductName(product)}
                  className="product-photo"
                />
              ) : (
                <span className="product-emoji">{product.image}</span>
              )}
              <button
                className={`wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleWishlist(product.id)
                }}
              >
                <FaHeart />
              </button>
              <button
                className="view-btn"
                onClick={(e) => {
                  console.log('Store: Клик по кнопке просмотра товара:', product)
                  console.log('Store: Событие клика кнопки:', e)
                  e.stopPropagation()
                  openProductModal(product)
                }}
                title={isEnglish ? 'View product' : 'Посмотреть товар'}
              >
                <FaEye />
              </button>
              {!product.inStock && (
                <div className="out-of-stock">
                  {t('store.outOfStock')}
                </div>
              )}
            </div>

            <div className="product-info">
              <h3 className="product-name">{getProductName(product)}</h3>
              <p className="product-description">{getProductDescription(product)}</p>
              
              <div className="product-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < Math.floor(product.rating) ? 'star filled' : 'star'}
                    />
                  ))}
                </div>
                <span className="rating-text">
                  {product.rating} ({product.reviews} {t('store.reviews')})
                </span>
              </div>

              <div className="product-price">
                <span className="price-rub">{product.price} ₽</span>
                <span className="price-other">
                  {product.priceUSD} $ / {product.priceEUR} €
                </span>
              </div>

              <div className="product-actions">
                <button
                  className="btn btn-primary add-to-cart-btn"
                  onClick={(e) => {
                    console.log('Store: Клик по кнопке "Добавить в корзину" на карточке товара:', product)
                    e.stopPropagation()
                    addToCart(product)
                  }}
                  disabled={!product.inStock}
                  title={
                    product.inStock
                      ? (isEnglish ? 'Add product to cart' : 'Добавить товар в корзину')
                      : (isEnglish ? 'Product unavailable' : 'Товар недоступен')
                  }
                >
                  <FaShoppingCart />
                  {product.inStock ? t('store.addToCart') : t('store.outOfStock')}
                </button>
              </div>
            </div>
          </div>
          )
        })}
      </div>

      {sortedProducts.length === 0 && (
        <div className="no-products">
          <p>{t('store.noProducts')}</p>
        </div>
      )}

      <div className="cart-summary">
        <div className="cart-info" onClick={openCartModal} style={{ cursor: 'pointer' }}>
          <FaShoppingCart />
          <span>{t('store.cartItems')}: {cart.length}</span>
          {cart.length > 0 && (
            <span className="cart-total">
              ({isEnglish ? 'Total amount' : 'Общая сумма'}:{' '}
              {cart.reduce((total, item) => total + (item.price * item.quantity), 0)} ₽)
            </span>
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => {
                console.log('Store: Очистка корзины')
                setCart([])
              }}
              title={isEnglish ? 'Clear cart' : 'Очистить корзину'}
            >
              {isEnglish ? '🗑️ Clear' : '🗑️ Очистить'}
            </button>
            <button className="btn btn-primary checkout-btn">
              {t('store.checkout')}
            </button>
          </div>
        )}
      </div>

      {/* Модальное окно товара */}
      {isModalOpen && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={closeProductModal}
          onAddToCart={addToCart}
          onToggleWishlist={toggleWishlist}
          isInWishlist={wishlist.includes(selectedProduct.id)}
          cartQuantity={getCartQuantity(selectedProduct.id)}
          onUpdateQuantity={updateCartQuantity}
          t={t}
        />
      )}

      {/* Модальное окно корзины */}
      {isCartModalOpen && (
        <div className="cart-modal-overlay" onClick={closeCartModal}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-modal-header">
              <h2>
                {isEnglish ? 'Cart' : 'Корзина'} ({cart.length}{' '}
                {isEnglish ? (cart.length === 1 ? 'item' : 'items') : 'товаров'})
              </h2>
              <button className="close-btn" onClick={closeCartModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="cart-modal-content">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <p>{isEnglish ? 'Cart is empty' : 'Корзина пуста'}</p>
                </div>
              ) : (
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-image">
                        {item.images && item.images.length > 0 ? (
                          <img src={item.images[0].preview} alt={item.name} />
                        ) : (
                          <span className="cart-item-emoji">{item.image}</span>
                        )}
                      </div>
                      
                      <div className="cart-item-info">
                        <h3>{item.name}</h3>
                        <p className="cart-item-price">{item.price} ₽</p>
                      </div>
                      
                      <div className="cart-item-quantity">
                        <button 
                          className="quantity-btn"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          <FaMinus />
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        >
                          <FaPlus />
                        </button>
                      </div>
                      
                      <div className="cart-item-total">
                        {item.price * item.quantity} ₽
                      </div>
                      
                      <button 
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                        title={isEnglish ? 'Remove from cart' : 'Удалить из корзины'}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="cart-modal-footer">
                <div className="cart-total">
                  <strong>
                    {isEnglish ? 'Total:' : 'Итого:'}{' '}
                    {cart.reduce((total, item) => total + (item.price * item.quantity), 0)} ₽
                  </strong>
                </div>
                <div className="cart-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      console.log('Store: Очистка корзины из модального окна')
                      setCart([])
                    }}
                  >
                    {isEnglish ? 'Clear cart' : 'Очистить корзину'}
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={openCheckout}
                    title={isEnglish ? 'Checkout' : 'Оформить заказ'}
                  >
                    {isEnglish ? 'Checkout' : 'Оформить заказ'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Модальное окно оформления заказа */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
        cart={cart}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  )
}

export default Store
