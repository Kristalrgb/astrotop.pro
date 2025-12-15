import React, { useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage } from 'react-icons/fa'
import ImageUpload from './ImageUpload'

const ProductAdmin = ({ products = [], onAddProduct, onUpdateProduct, onDeleteProduct, owner }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    category: 'crystals',
    price: '',
    priceUSD: '',
    priceEUR: '',
    rating: 5,
    reviews: 0,
    image: '🔮',
    images: [], // Массив изображений
    description: '',
    descriptionEn: '',
    inStock: true
  })

  const ownerMeta = owner
    ? {
        ownerId: owner.id,
        ownerName: owner.name,
        ownerAvatar: owner.profileImage || owner.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${owner.name || 'ME'}`,
        ownerType: 'specialist'
      }
    : {
        ownerId: 'system',
        ownerName: 'AstroTop Маркет',
        ownerAvatar: 'https://placehold.co/80x80/4b6cb7/ffffff?text=AT',
        ownerType: 'platform'
      }

  const categories = [
    { id: 'crystals', name: 'Кристаллы', icon: '🔮' },
    { id: 'tarot', name: 'Таро', icon: '🃏' },
    { id: 'incense', name: 'Благовония', icon: '🕯️' },
    { id: 'books', name: 'Книги', icon: '📖' },
    { id: 'candles', name: 'Свечи', icon: '🕯️' },
    { id: 'accessories', name: 'Аксессуары', icon: '🧘' },
    { id: 'jewelry', name: 'Украшения', icon: '💎' },
    { id: 'herbs', name: 'Травы', icon: '🌿' },
    { id: 'tools', name: 'Инструменты', icon: '⚡' }
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const productData = {
      ...formData,
      id: editingProduct ? editingProduct.id : Date.now(),
      price: parseInt(formData.price),
      priceUSD: parseInt(formData.priceUSD),
      priceEUR: parseInt(formData.priceEUR),
      rating: parseFloat(formData.rating),
      reviews: parseInt(formData.reviews),
      ...ownerMeta
    }

    console.log('ProductAdmin: Отправка товара:', productData)
    console.log('ProductAdmin: Режим редактирования:', !!editingProduct)
    console.log('ProductAdmin: Функция onAddProduct:', typeof onAddProduct)

    if (editingProduct) {
      console.log('ProductAdmin: Вызываем onUpdateProduct')
      onUpdateProduct(productData)
      setEditingProduct(null)
    } else {
      console.log('ProductAdmin: Вызываем onAddProduct')
      onAddProduct(productData)
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      category: 'crystals',
      price: '',
      priceUSD: '',
      priceEUR: '',
      rating: 5,
      reviews: 0,
      image: '🔮',
      images: [],
      description: '',
      descriptionEn: '',
      inStock: true
    })
    setIsAdding(false)
  }

  const startEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      nameEn: product.nameEn,
      category: product.category,
      price: product.price.toString(),
      priceUSD: product.priceUSD.toString(),
      priceEUR: product.priceEUR.toString(),
      rating: product.rating.toString(),
      reviews: product.reviews.toString(),
      image: product.image,
      images: product.images || [],
      description: product.description,
      descriptionEn: product.descriptionEn,
      inStock: product.inStock
    })
  }

  const cancelEdit = () => {
    setEditingProduct(null)
    resetForm()
  }

  return (
    <div className="product-admin">
      <div className="admin-header">
        <h2>🛍️ Управление товарами</h2>
        <div className="admin-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => {
              console.log('Текущие товары:', products)
              console.log('localStorage товары:', localStorage.getItem('astrology-store-products'))
            }}
          >
            🔍 Отладка
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
          >
            🔄 Обновить
          </button>
          <button 
            className="btn btn-gray"
            onClick={() => setIsAdding(true)}
            disabled={isAdding || editingProduct}
          >
            <FaPlus /> Добавить товар
          </button>
        </div>
      </div>

      {(isAdding || editingProduct) && (
        <div className="product-form">
          <div className="form-header">
            <h3>{editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}</h3>
            <button className="close-btn" onClick={cancelEdit}>
              <FaTimes />
            </button>
          </div>

          <div className="owner-meta">
            <p style={{ margin: 0, color: '#666' }}>
              Продавец: <strong>{ownerMeta.ownerName}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label>Название (RU) *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Название товара на русском"
                />
              </div>
              <div className="form-group">
                <label>Название (EN) *</label>
                <input
                  type="text"
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleInputChange}
                  required
                  placeholder="Product name in English"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Категория *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Эмодзи/Иконка</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="🔮"
                  maxLength="2"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Цена (₽) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Цена ($)</label>
                <input
                  type="number"
                  name="priceUSD"
                  value={formData.priceUSD}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Цена (€)</label>
                <input
                  type="number"
                  name="priceEUR"
                  value={formData.priceEUR}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Рейтинг</label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Отзывы</label>
                <input
                  type="number"
                  name="reviews"
                  value={formData.reviews}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                  />
                  В наличии
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Описание (RU)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Описание товара на русском"
              />
            </div>

            <div className="form-group">
              <label>Описание (EN)</label>
              <textarea
                name="descriptionEn"
                value={formData.descriptionEn}
                onChange={handleInputChange}
                rows="3"
                placeholder="Product description in English"
              />
            </div>

            {/* Загрузка изображений */}
            <div className="form-group full-width">
              <ImageUpload
                images={formData.images}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                maxImages={5}
                maxSize={5 * 1024 * 1024} // 5MB
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                <FaTimes /> Отмена
              </button>
              <button type="submit" className="btn btn-primary">
                <FaSave /> {editingProduct ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-list">
        <h3>Список товаров ({products.length})</h3>
        <div className="products-table">
          {products.map(product => (
            <div key={product.id} className="product-row">
              <div className="product-preview">
                <div className="product-image-container">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0].preview} 
                      alt={product.name}
                      className="product-image"
                    />
                  ) : (
                    <span className="product-emoji">{product.image}</span>
                  )}
                  {product.images && product.images.length > 1 && (
                    <span className="more-images-count">+{product.images.length - 1}</span>
                  )}
                </div>
                <div className="product-details">
                  <h4>{product.name}</h4>
                  <p className="product-category">
                    {categories.find(cat => cat.id === product.category)?.icon} 
                    {categories.find(cat => cat.id === product.category)?.name}
                  </p>
                  <p className="product-price">{product.price} ₽</p>
                  {product.images && product.images.length > 0 && (
                    <p className="product-images-count">
                      📸 {product.images.length} фото
                    </p>
                  )}
                </div>
              </div>
              <div className="product-actions">
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => startEdit(product)}
                >
                  <FaEdit /> Редактировать
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => onDeleteProduct(product.id)}
                >
                  <FaTrash /> Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductAdmin
