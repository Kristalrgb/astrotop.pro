import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useSpecialists } from '../contexts/SpecialistsContext'
import ImageUpload from '../components/ImageUpload'
import { FaUser, FaEnvelope, FaPhone, FaSave, FaTimes, FaTrash } from 'react-icons/fa'

const Profile = () => {
  const { t } = useLanguage()
  const { user, updateUser, deleteUser } = useAuth()
  const { updateSpecialist, deleteSpecialist } = useSpecialists()
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  })
  const [profileImage, setProfileImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || ''
      })
      setProfileImage(user.profileImage || null)
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageChange = (preview) => {
    setProfileImage(preview)
  }

  const handleSave = async () => {
    if (!user) {
      console.log('Ошибка: пользователь не найден')
      setMessage('Ошибка: пользователь не найден')
      return
    }
    
    console.log('=== СОХРАНЕНИЕ ПРОФИЛЯ ===')
    console.log('Текущий пользователь:', user)
    console.log('Данные формы:', formData)
    console.log('Изображение профиля:', profileImage)
    
    setIsLoading(true)
    setMessage('')

    try {
      // Обновляем данные пользователя
      const updatedUser = {
        ...user,
        ...formData,
        profileImage: profileImage
      }
      
      console.log('Обновленные данные пользователя:', updatedUser)

      // Сначала обновляем пользователя
      updateUser(updatedUser)
      console.log('Пользователь обновлен в AuthContext')
      
      // Если пользователь - астролог, обновляем его в списке специалистов
      if (updatedUser.role === 'astrologer') {
        console.log('Пользователь - астролог, обновляем в списке специалистов...')
        updateSpecialist(updatedUser)
        console.log('Специалист обновлен в SpecialistsContext')
      } else {
        console.log('Пользователь - клиент, обновление специалиста не требуется')
      }
      
      setIsEditing(false)
      setMessage('Профиль успешно обновлен!')
      
      console.log('Профиль успешно обновлен!')
      
      // Очищаем сообщение через 3 секунды
      setTimeout(() => setMessage(''), 3000)
      
    } catch (error) {
      console.log('Ошибка при сохранении:', error)
      setMessage('Ошибка при сохранении профиля')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // Возвращаем исходные данные
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || ''
    })
    setProfileImage(user.profileImage || null)
    setIsEditing(false)
    setMessage('')
  }

  const handleDeleteProfile = () => {
    if (window.confirm('Вы уверены, что хотите удалить свой профиль? Это действие нельзя отменить.')) {
      console.log('=== УДАЛЕНИЕ ПРОФИЛЯ ===')
      console.log('Пользователь для удаления:', user)
      
      try {
        // Если пользователь - астролог, удаляем его из списка специалистов
        if (user.role === 'astrologer') {
          console.log('Пользователь - астролог, удаляем из списка специалистов...')
          deleteSpecialist(user.id)
          console.log('Специалист удален из SpecialistsContext')
        }
        
        // Удаляем пользователя
        deleteUser()
        console.log('Профиль успешно удален!')
        
      } catch (error) {
        console.error('Ошибка при удалении профиля:', error)
        alert('Произошла ошибка при удалении профиля')
      }
    }
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="dashboard-overlay profile-overlay">
          <div className="profile-header">
            <h1 style={{ color: '#ffffff' }}>{t('profile.title')}</h1>
            <p style={{ color: '#ffffff', opacity: 0.9 }}>{t('profile.notLoggedIn')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="dashboard-overlay profile-overlay">
        <div className="profile-header">
          <h1 style={{ color: '#ffffff' }}>{t('profile.title')}</h1>
          <p style={{ color: '#ffffff', opacity: 0.9 }}>{t('profile.subtitle')}</p>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('успешно') || message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="profile-section">
        <h2 style={{ color: 'white' }}>{t('profile.personalInfo')}</h2>
        
        {/* Аватар профиля */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">
              <FaUser />
            </div>
          )}
          
          {isEditing && (
            <ImageUpload
              currentImage={profileImage}
              onImageChange={handleImageChange}
              maxSize={5}
            />
          )}
        </div>

        <div className="profile-form">
          <div className="form-group">
            <label htmlFor="name">{t('register.fullName')}</label>
            <div style={{ position: 'relative' }}>
              <FaUser style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666'
              }} />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('register.email')}</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666'
              }} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">{t('register.phone')}</label>
            <div style={{ position: 'relative' }}>
              <FaPhone style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666'
              }} />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('register.accountType')}</label>
            {isEditing ? (
              <select
                name="role"
                value={formData.role || user.role}
                onChange={handleChange}
                style={{ paddingLeft: '40px' }}
              >
                <option value="client">{t('register.client')}</option>
                <option value="astrologer">{t('register.astrologer')}</option>
              </select>
            ) : (
              <div style={{ 
                padding: '12px 12px 12px 40px', 
                background: '#f8f9fa', 
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                color: '#666'
              }}>
                {user.role === 'astrologer' ? t('register.astrologer') : t('register.client')}
              </div>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {!isEditing ? (
            <>
              <button
                className="btn btn-gray"
                onClick={() => {
                  console.log('=== НАЧАЛО РЕДАКТИРОВАНИЯ ===')
                  console.log('Текущий пользователь:', user)
                  console.log('Данные формы:', formData)
                  setIsEditing(true)
                  console.log('Режим редактирования включен')
                }}
              >
                {t('profile.editProfile')}
              </button>
              
                             {/* Кнопка отладки */}
               <button
                 onClick={() => {
                   console.log('=== ОТЛАДКА ПРОФИЛЯ ===')
                   console.log('Пользователь:', user)
                   console.log('localStorage user:', localStorage.getItem('user'))
                   console.log('localStorage specialists:', localStorage.getItem('specialists'))
                 }}
                 style={{
                   background: '#ff9800',
                   color: 'white',
                   border: 'none',
                   padding: '8px 16px',
                   borderRadius: '4px',
                   cursor: 'pointer',
                   fontSize: '12px',
                   marginLeft: '10px'
                 }}
               >
                 🧪 ОТЛАДКА
               </button>
               
                               {/* Кнопка выхода для тестирования */}
                <button
                  onClick={() => {
                    localStorage.removeItem('user')
                    window.location.reload()
                  }}
                  style={{
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginLeft: '10px'
                  }}
                >
                  🔄 ВЫЙТИ И ТЕСТИРОВАТЬ
                </button>
                
                                 {/* Кнопка удаления профиля */}
                 <button
                   onClick={handleDeleteProfile}
                   style={{
                     background: '#d32f2f',
                     color: 'white',
                     border: 'none',
                     padding: '8px 16px',
                     borderRadius: '4px',
                     cursor: 'pointer',
                     fontSize: '12px',
                     marginLeft: '10px'
                   }}
                 >
                   <FaTrash style={{ marginRight: '4px' }} />
                   УДАЛИТЬ ПРОФИЛЬ
                 </button>
                 
                 
            </>
          ) : (
            <>
                             <button
                 className="btn btn-primary"
                 onClick={() => {
                   console.log('=== КНОПКА СОХРАНЕНИЯ НАЖАТА ===')
                   console.log('isLoading:', isLoading)
                   console.log('formData:', formData)
                   handleSave()
                 }}
                 disabled={isLoading}
               >
                 <FaSave />
                 {isLoading ? t('common.loading') : t('profile.saveChanges')}
               </button>
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <FaTimes />
                {t('profile.cancel')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
