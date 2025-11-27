import React, { useState } from 'react'
import { usePromo } from '../contexts/PromoContext'
import { useAuth } from '../contexts/AuthContext'
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaCopy, FaEye, FaEyeSlash } from 'react-icons/fa'

const PromoCodeManager = () => {
  const { user } = useAuth()
  const { 
    promoCodes, 
    createPromoCode, 
    updatePromoCode, 
    deletePromoCode, 
    togglePromoCode, 
    getAstrologerPromoCodes,
    getPromoStats,
    generatePromoCode 
  } = usePromo()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    discount: 10,
    description: '',
    maxUsage: 100,
    expiryDate: '',
    isActive: true
  })

  // Получаем промо коды текущего астролога
  const astrologerPromos = getAstrologerPromoCodes(user?.id)
  const stats = getPromoStats(user?.id)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    try {
      const promoData = {
        ...formData,
        astrologerId: user.id,
        astrologerName: user.name,
        discount: parseInt(formData.discount),
        maxUsage: parseInt(formData.maxUsage),
        expiryDate: formData.expiryDate || null
      }

      if (editingPromo) {
        updatePromoCode({ ...editingPromo, ...promoData })
      } else {
        createPromoCode(promoData)
      }

      // Сброс формы
      setFormData({
        code: '',
        discount: 10,
        description: '',
        maxUsage: 100,
        expiryDate: '',
        isActive: true
      })
      setEditingPromo(null)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Ошибка при сохранении промо кода:', error)
      alert('Ошибка при сохранении промо кода')
    }
  }

  const handleEdit = (promo) => {
    setEditingPromo(promo)
    setFormData({
      code: promo.code,
      discount: promo.discount,
      description: promo.description,
      maxUsage: promo.maxUsage,
      expiryDate: promo.expiryDate ? promo.expiryDate.split('T')[0] : '',
      isActive: promo.isActive
    })
    setIsModalOpen(true)
  }

  const handleDelete = (promoId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот промо код?')) {
      deletePromoCode(promoId)
    }
  }

  const handleToggle = (promoId) => {
    togglePromoCode(promoId)
  }

  const handleGenerateCode = () => {
    const newCode = generatePromoCode()
    setFormData(prev => ({ ...prev, code: newCode }))
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Промо код скопирован в буфер обмена!')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Без ограничений'
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const getDiscountColor = (discount) => {
    if (discount >= 30) return '#e74c3c'
    if (discount >= 20) return '#f39c12'
    if (discount >= 10) return '#27ae60'
    return '#3498db'
  }

  return (
    <div className="promo-manager">
      <div className="promo-manager-header">
        <h2>Управление промо кодами</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingPromo(null)
            setFormData({
              code: '',
              discount: 10,
              description: '',
              maxUsage: 100,
              expiryDate: '',
              isActive: true
            })
            setIsModalOpen(true)
          }}
        >
          <FaPlus /> Создать промо код
        </button>
      </div>

      {/* Статистика */}
      <div className="promo-stats">
        <div className="stat-card">
          <h3>Всего промо кодов</h3>
          <span className="stat-number">{stats.total}</span>
        </div>
        <div className="stat-card">
          <h3>Активных</h3>
          <span className="stat-number active">{stats.active}</span>
        </div>
        <div className="stat-card">
          <h3>Использований</h3>
          <span className="stat-number">{stats.totalUsage}</span>
        </div>
        <div className="stat-card">
          <h3>Среднее использование</h3>
          <span className="stat-number">{stats.averageUsage}</span>
        </div>
      </div>

      {/* Список промо кодов */}
      <div className="promo-codes-list">
        {astrologerPromos.length === 0 ? (
          <div className="no-promos">
            <p>У вас пока нет промо кодов</p>
            <button 
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              Создать первый промо код
            </button>
          </div>
        ) : (
          <div className="promo-codes-grid">
            {astrologerPromos.map(promo => (
              <div key={promo.id} className={`promo-card ${!promo.isActive ? 'inactive' : ''}`}>
                <div className="promo-header">
                  <div className="promo-code">
                    <span className="code-text">{promo.code}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(promo.code)}
                      title="Копировать код"
                    >
                      <FaCopy />
                    </button>
                  </div>
                  <div 
                    className="discount-badge"
                    style={{ backgroundColor: getDiscountColor(promo.discount) }}
                  >
                    -{promo.discount}%
                  </div>
                </div>

                <div className="promo-info">
                  <p className="promo-description">{promo.description}</p>
                  <div className="promo-details">
                    <span>Использований: {promo.usageCount}/{promo.maxUsage}</span>
                    <span>Действует до: {formatDate(promo.expiryDate)}</span>
                  </div>
                </div>

                <div className="promo-actions">
                  <button 
                    className={`toggle-btn ${promo.isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleToggle(promo.id)}
                    title={promo.isActive ? 'Деактивировать' : 'Активировать'}
                  >
                    {promo.isActive ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(promo)}
                    title="Редактировать"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(promo.id)}
                    title="Удалить"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно создания/редактирования */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPromo ? 'Редактировать промо код' : 'Создать промо код'}</h3>
              <button 
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="promo-form">
              <div className="form-group">
                <label htmlFor="code">Промо код *</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Введите промо код"
                    required
                    style={{ textTransform: 'uppercase' }}
                  />
                  <button 
                    type="button"
                    className="generate-btn"
                    onClick={handleGenerateCode}
                    title="Сгенерировать случайный код"
                  >
                    🎲
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="discount">Размер скидки *</label>
                <select
                  id="discount"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  required
                >
                  <option value={10}>10%</option>
                  <option value={20}>20%</option>
                  <option value={30}>30%</option>
                  <option value={40}>40%</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Описание</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Описание промо кода (необязательно)"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxUsage">Максимальное количество использований</label>
                <input
                  type="number"
                  id="maxUsage"
                  name="maxUsage"
                  value={formData.maxUsage}
                  onChange={handleInputChange}
                  min="1"
                  max="10000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="expiryDate">Дата истечения</label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Активен
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPromo ? 'Сохранить изменения' : 'Создать промо код'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .promo-manager {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .promo-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .promo-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 14px;
        }

        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .stat-number.active {
          color: #27ae60;
        }

        .promo-codes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .promo-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }

        .promo-card:hover {
          transform: translateY(-2px);
        }

        .promo-card.inactive {
          opacity: 0.6;
        }

        .promo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .promo-code {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .code-text {
          font-family: monospace;
          font-size: 18px;
          font-weight: bold;
          background: #f8f9fa;
          padding: 5px 10px;
          border-radius: 5px;
          border: 2px dashed #ddd;
        }

        .copy-btn {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          padding: 5px;
        }

        .discount-badge {
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
        }

        .promo-info {
          margin-bottom: 15px;
        }

        .promo-description {
          margin: 0 0 10px 0;
          color: #666;
          font-style: italic;
        }

        .promo-details {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 12px;
          color: #999;
        }

        .promo-actions {
          display: flex;
          gap: 10px;
        }

        .promo-actions button {
          padding: 8px 12px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-btn.active {
          background: #27ae60;
          color: white;
        }

        .toggle-btn.inactive {
          background: #e74c3c;
          color: white;
        }

        .edit-btn {
          background: #3498db;
          color: white;
        }

        .delete-btn {
          background: #e74c3c;
          color: white;
        }

        .no-promos {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 10px;
          padding: 0;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
        }

        .promo-form {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #333;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }

        .input-with-button {
          display: flex;
          gap: 10px;
        }

        .input-with-button input {
          flex: 1;
        }

        .generate-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 5px;
          cursor: pointer;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .checkbox-group input {
          width: auto;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .promo-manager-header {
            flex-direction: column;
            gap: 20px;
          }

          .promo-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .promo-codes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default PromoCodeManager

