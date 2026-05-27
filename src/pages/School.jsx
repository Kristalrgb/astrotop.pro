import React, { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useLectures } from '../contexts/LecturesContext'
import { FaStar, FaFilter, FaSearch, FaSort, FaPlay, FaShoppingCart } from 'react-icons/fa'

const School = () => {
  const { t, currentLanguage } = useLanguage()
  const isEnglish = currentLanguage === 'en'
  const { lectures, getCategories, searchLectures, loading, error, purchaseLecture } = useLectures()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('rating')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])

  const categories = [
    { id: 'all', name: 'Все категории', nameEn: 'All Categories', icon: '📚' },
    ...getCategories()
  ]

  const addToCart = (lecture) => {
    if (!lecture || !lecture.id) return
    
    setCart(prev => {
      const existing = prev.find(item => item.id === lecture.id)
      if (existing) {
        return prev.map(item =>
          item.id === lecture.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...lecture, quantity: 1 }]
    })
  }

  // Фильтруем лекции
  let filteredLectures = lectures || []
  
  if (selectedCategory !== 'all') {
    filteredLectures = filteredLectures.filter(lecture => lecture && lecture.category === selectedCategory)
  }
  
  if (searchQuery) {
    try {
      filteredLectures = searchLectures(searchQuery) || []
    } catch (error) {
      console.error('School: Ошибка поиска:', error)
      filteredLectures = []
    }
  }

  const sortedLectures = [...filteredLectures].sort((a, b) => {
    if (!a || !b) return 0
    
    switch (sortBy) {
      case 'price':
        return (a.price || 0) - (b.price || 0)
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'reviews':
        return (b.reviews || 0) - (a.reviews || 0)
      case 'duration':
        return parseFloat((a.duration || '0').replace(/[^\d.]/g, '')) - parseFloat((b.duration || '0').replace(/[^\d.]/g, ''))
      default:
        return (a.title || '').localeCompare(b.title || '')
    }
  })

  const getLectureTitle = (lecture) => {
    return isEnglish ? (lecture.titleEn || lecture.title) : lecture.title
  }

  const getLectureDescription = (lecture) => {
    return isEnglish ? (lecture.descriptionEn || lecture.description) : lecture.description
  }

  const getCategoryName = (category) => {
    return isEnglish ? category.nameEn : category.name
  }

  if (loading) {
    return (
      <div className="school-page">
        <div className="school-header">
          <div className="dashboard-overlay">
            <h1>{t('school.title')}</h1>
            <p>{t('school.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="school-page">
        <div className="school-header">
          <div className="dashboard-overlay">
            <h1>{t('school.title')}</h1>
            <p style={{ color: 'red' }}>{t('school.error')}: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="school-page">
      <div className="school-header">
        <div className="dashboard-overlay">
          <h1>{t('school.title')}</h1>
          <p>{t('school.subtitle')}</p>
        </div>
      </div>

      <div className="school-controls">
        <div className="search-section">
          <div className="search-input">
            <FaSearch />
            <input
              type="text"
              placeholder={t('school.searchPlaceholder')}
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
              <option value="rating">{t('school.sortByRating')}</option>
              <option value="price">{t('school.sortByPrice')}</option>
              <option value="title">{t('school.sortByTitle')}</option>
              <option value="reviews">{t('school.sortByReviews')}</option>
              <option value="duration">{t('school.sortByDuration')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="lectures-info" style={{ margin: '20px 0', padding: '10px', background: 'rgba(0, 0, 0, 0.5)', borderRadius: '5px', color: 'white' }}>
        <p><strong>{isEnglish ? 'Total lectures:' : 'Всего лекций:'}</strong> {lectures.length}</p>
        <p><strong>{isEnglish ? 'Filtered:' : 'Отфильтровано:'}</strong> {sortedLectures.length}</p>
        {cart.length > 0 && (
          <p><strong>{isEnglish ? 'In cart:' : 'В корзине:'}</strong> {cart.length} {isEnglish ? (cart.length === 1 ? 'lecture' : 'lectures') : 'лекций'}</p>
        )}
      </div>

      <div className="lectures-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px', padding: '40px 0' }}>
        {sortedLectures.map(lecture => {
          if (!lecture || !lecture.id) return null
          
          const isPurchased = lecture.purchased || false
          
          return (
            <div key={lecture.id} className="lecture-card" style={{
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '15px',
              padding: '20px',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div className="lecture-image" style={{
                fontSize: '4rem',
                textAlign: 'center',
                marginBottom: '15px'
              }}>
                {lecture.image || '📚'}
              </div>

              <div className="lecture-info">
                <h3 className="lecture-title" style={{
                  fontSize: '1.3rem',
                  marginBottom: '10px',
                  color: 'white'
                }}>
                  {getLectureTitle(lecture)}
                </h3>
                
                <p className="lecture-author" style={{
                  fontSize: '0.9rem',
                  color: '#ccc',
                  marginBottom: '10px'
                }}>
                  {isEnglish ? 'By' : 'Автор'}: {lecture.author} ({lecture.authorSpecialty})
                </p>
                
                <p className="lecture-description" style={{
                  fontSize: '0.9rem',
                  color: '#ddd',
                  marginBottom: '15px',
                  lineHeight: '1.5'
                }}>
                  {getLectureDescription(lecture)}
                </p>
                
                <div className="lecture-rating" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '15px'
                }}>
                  <div className="stars" style={{ display: 'flex', gap: '3px' }}>
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        style={{
                          color: i < Math.floor(lecture.rating) ? '#ffc107' : '#666',
                          fontSize: '0.9rem'
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.9rem' }}>
                    {lecture.rating} ({lecture.reviews} {t('school.reviews')})
                  </span>
                </div>

                <div className="lecture-meta" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px',
                  fontSize: '0.9rem',
                  color: '#ccc'
                }}>
                  <span>⏱️ {isEnglish ? lecture.durationEn || lecture.duration : lecture.duration}</span>
                  <span className="lecture-category" style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '5px 10px',
                    borderRadius: '5px'
                  }}>
                    {isEnglish ? lecture.categoryNameEn || lecture.category : lecture.categoryName || lecture.category}
                  </span>
                </div>

                <div className="lecture-price" style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  color: '#ffc107'
                }}>
                  {lecture.price} ₽
                  {lecture.priceUSD && (
                    <span style={{ fontSize: '0.9rem', marginLeft: '10px', color: '#ccc' }}>
                      ({lecture.priceUSD} $ / {lecture.priceEUR} €)
                    </span>
                  )}
                </div>

                <div className="lecture-actions">
                  {isPurchased ? (
                    <button
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '1rem'
                      }}
                    >
                      <FaPlay />
                      {t('school.watch')}
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary add-to-cart-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        addToCart(lecture)
                      }}
                      style={{
                        width: '100%',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '1rem'
                      }}
                    >
                      <FaShoppingCart />
                      {t('school.buy')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {sortedLectures.length === 0 && (
        <div className="no-lectures" style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'white'
        }}>
          <p style={{ fontSize: '1.2rem' }}>{t('school.noLectures')}</p>
        </div>
      )}

      {cart.length > 0 && (
        <div className="cart-summary" style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '20px',
          borderRadius: '10px',
          color: 'white',
          boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          minWidth: '250px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>{t('school.cart')} ({cart.length})</h3>
          <div style={{ marginBottom: '15px', maxHeight: '200px', overflowY: 'auto' }}>
            {cart.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px',
                paddingBottom: '10px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <span style={{ fontSize: '0.9rem' }}>{getLectureTitle(item)}</span>
                <span style={{ fontSize: '0.9rem', color: '#ffc107' }}>{item.price} ₽</span>
              </div>
            ))}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '15px',
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}>
            <span>{t('school.total')}:</span>
            <span style={{ color: '#ffc107' }}>
              {cart.reduce((total, item) => total + (item.price * item.quantity), 0)} ₽
            </span>
          </div>
          <button
            className="btn btn-primary"
            style={{
              width: '100%',
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
            onClick={() => {
              alert(t('school.checkoutMessage'))
              cart.forEach(item => purchaseLecture(item.id))
              setCart([])
            }}
          >
            {t('school.checkout')}
          </button>
        </div>
      )}
    </div>
  )
}

export default School



