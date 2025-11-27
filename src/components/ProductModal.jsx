import React, { useState, useEffect } from 'react'
import { FaTimes, FaShoppingCart, FaHeart, FaStar, FaPlus, FaMinus, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const ProductModal = ({ product, isOpen, onClose, onAddToCart, onToggleWishlist, isInWishlist, cartQuantity, onUpdateQuantity, t }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Fallback для функции перевода
  const translate = t || ((key) => key)
  
  // Отладочная информация
  console.log('ProductModal: isOpen =', isOpen)
  console.log('ProductModal: product =', product)
  console.log('ProductModal: product?.images =', product?.images)
  console.log('ProductModal: product?.id =', product?.id)
  console.log('ProductModal: product?.name =', product?.name)
  
  if (!isOpen || !product) {
    console.log('ProductModal: Модальное окно не открыто или товар отсутствует')
    return null
  }

  // Проверяем обязательные поля товара
  if (!product.id) {
    console.error('ProductModal: У товара отсутствует ID:', product)
    return null
  }

  // Принудительно показываем модальное окно если isOpen = true
  if (isOpen && product) {
    console.log('ProductModal: Принудительно показываем модальное окно!')
  }

  const hasImages = product.images && product.images.length > 0
  const currentImage = hasImages ? product.images[currentImageIndex] : null

  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  const goToImage = (index) => {
    setCurrentImageIndex(index)
  }

  // Поддержка клавиатуры
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen || !hasImages) return
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          prevImage()
          break
        case 'ArrowRight':
          event.preventDefault()
          nextImage()
          break
        case 'Escape':
          event.preventDefault()
          onClose()
          break
        default:
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, hasImages, product?.images?.length])

  const getProductName = (product) => {
    return product.name || product.nameEn || 'Без названия'
  }

  const getProductDescription = (product) => {
    return product.description || product.descriptionEn || 'Описание отсутствует'
  }

  const handleAddToCart = () => {
    console.log('ProductModal: Добавление товара в корзину:', product)
    console.log('ProductModal: Функция onAddToCart:', typeof onAddToCart)
    
    if (typeof onAddToCart === 'function') {
      onAddToCart(product)
    } else {
      console.error('ProductModal: Функция onAddToCart не передана или не является функцией!')
    }
  }

  const handleQuantityChange = (change) => {
    console.log('ProductModal: Изменение количества:', { change, cartQuantity, productId: product.id })
    const newQuantity = Math.max(0, cartQuantity + change)
    console.log('ProductModal: Новое количество:', newQuantity)
    onUpdateQuantity(product.id, newQuantity)
  }

  console.log('ProductModal: Рендерим модальное окно с товаром:', product)

  // Простая проверка - если модальное окно должно быть открыто, показываем alert
  if (isOpen && product) {
    console.log('ProductModal: Модальное окно должно быть видно!')
  }

  return (
    <div className="product-modal-overlay" onClick={onClose} style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0, 0, 0, 0.8)', 
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()} style={{
        background: 'white',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        animation: 'modalSlideIn 0.3s ease',
        transform: 'scale(1)',
        opacity: 1
      }}>
        <div className="product-modal-header">
          <h2>{getProductName(product)}</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="product-modal-content">
          <div className="product-modal-image">
            {hasImages ? (
              <>
                <img 
                  src={currentImage.preview} 
                  alt={getProductName(product)}
                  className="product-modal-photo"
                />
                
                {/* Навигация по изображениям */}
                {product.images.length > 1 && (
                  <>
                    <button 
                      className="image-nav-btn prev-btn"
                      onClick={prevImage}
                    >
                      <FaChevronLeft />
                    </button>
                    <button 
                      className="image-nav-btn next-btn"
                      onClick={nextImage}
                    >
                      <FaChevronRight />
                    </button>
                    
                    {/* Счетчик изображений */}
                    <div className="image-counter">
                      {currentImageIndex + 1} / {product.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="product-modal-placeholder">
                <span className="product-emoji-large">{product.image}</span>
              </div>
            )}
            
            <button
              className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
              onClick={() => onToggleWishlist(product.id)}
            >
              <FaHeart />
            </button>
          </div>

          <div className="product-modal-info">
            <div className="product-category">
              <span className="category-icon">{product.category === 'crystals' ? '🔮' : 
                product.category === 'tarot' ? '🃏' : 
                product.category === 'incense' ? '🕯️' : 
                product.category === 'books' ? '📖' : 
                product.category === 'candles' ? '🕯️' : 
                product.category === 'accessories' ? '🧘' : 
                product.category === 'jewelry' ? '💎' : 
                product.category === 'herbs' ? '🌿' : 
                product.category === 'tools' ? '⚡' : '📦'}</span>
              <span className="category-name">
                {product.category === 'crystals' ? 'Кристаллы' : 
                 product.category === 'tarot' ? 'Таро' : 
                 product.category === 'incense' ? 'Благовония' : 
                 product.category === 'books' ? 'Книги' : 
                 product.category === 'candles' ? 'Свечи' : 
                 product.category === 'accessories' ? 'Аксессуары' : 
                 product.category === 'jewelry' ? 'Украшения' : 
                 product.category === 'herbs' ? 'Травы' : 
                 product.category === 'tools' ? 'Инструменты' : 'Другое'}
              </span>
            </div>

            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < Math.floor(product.rating || 0) ? 'star filled' : 'star'}
                  />
                ))}
              </div>
              <span className="rating-text">
                {product.rating || 0} ({product.reviews || 0} отзывов)
              </span>
            </div>

            <div className="product-description">
              <p>{getProductDescription(product)}</p>
            </div>

            <div className="product-price">
              <span className="price-main">{product.price || 0} ₽</span>
              <span className="price-other">
                {product.priceUSD || 0} $ / {product.priceEUR || 0} €
              </span>
            </div>

            <div className="product-availability">
              {product.inStock !== false ? (
                <span className="in-stock">✅ В наличии</span>
              ) : (
                <span className="out-of-stock">❌ Нет в наличии</span>
              )}
            </div>

            <div className="product-actions">
              {product.inStock !== false && (
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={cartQuantity <= 0}
                    title="Уменьшить количество"
                  >
                    <FaMinus />
                  </button>
                  <span className="quantity-display" title="Текущее количество">
                    {cartQuantity || 0}
                  </span>
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(1)}
                    title="Увеличить количество"
                  >
                    <FaPlus />
                  </button>
                </div>
              )}

              <button
                className={`add-to-cart-btn ${product.inStock === false ? 'disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={product.inStock === false}
                title={product.inStock !== false ? 'Добавить товар в корзину' : 'Товар недоступен'}
              >
                <FaShoppingCart />
                {product.inStock !== false ? translate('store.addToCart') || 'Добавить в корзину' : translate('store.outOfStock') || 'Нет в наличии'}
              </button>
            </div>
          </div>
        </div>

        {/* Миниатюры изображений */}
        {hasImages && product.images.length > 1 && (
          <div className="image-thumbnails">
            {product.images.map((image, index) => (
              <button
                key={index}
                className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => goToImage(index)}
              >
                <img 
                  src={image.preview} 
                  alt={`${getProductName(product)} ${index + 1}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductModal
