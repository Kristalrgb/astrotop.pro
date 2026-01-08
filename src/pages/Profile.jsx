import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useSpecialists } from '../contexts/SpecialistsContext'
import ImageUpload from '../components/ImageUpload'
import { FaUser, FaEnvelope, FaPhone, FaSave, FaTimes, FaTrash, FaLink } from 'react-icons/fa'

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
      console.log('Profile: useEffect - обновление данных из user')
      console.log('user.profileImage существует?', !!user.profileImage)
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || ''
      })
      // Обновляем фото только если оно изменилось
      if (user.profileImage !== profileImage) {
        setProfileImage(user.profileImage || null)
        console.log('Profile: profileImage обновлен из user, длина:', user.profileImage?.length || 0)
      }
    }
  }, [user, user?.profileImage])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageChange = (preview, imageData) => {
    console.log('=== ЗАГРУЗКА ФОТО ===')
    console.log('Profile: handleImageChange вызван')
    console.log('preview существует?', !!preview)
    console.log('preview длина:', preview?.length)
    console.log('preview начало:', preview?.substring(0, 100) + '...')
    console.log('imageData:', imageData)
    
    try {
      if (preview && typeof preview === 'string') {
        // Проверяем, что это действительно base64 изображение
        if (preview.startsWith('data:image/')) {
          setProfileImage(preview)
          setMessage('✅ Фото успешно загружено! Теперь нажмите "Сохранить изменения" для сохранения.')
          setTimeout(() => setMessage(''), 5000)
          console.log('✅ Profile: profileImage установлен, длина base64:', preview.length, 'символов')
          console.log('✅ Тип изображения:', preview.substring(5, preview.indexOf(';')))
        } else {
          console.error('❌ Ошибка: preview не является валидным base64 изображением')
          setMessage('❌ Ошибка: неверный формат изображения')
          setTimeout(() => setMessage(''), 3000)
        }
      } else if (preview === null) {
        setProfileImage(null)
        setMessage('Фото удалено')
        setTimeout(() => setMessage(''), 2000)
        console.log('Profile: profileImage сброшен')
      } else {
        console.error('❌ Ошибка: preview имеет неверный тип:', typeof preview)
        setMessage('❌ Ошибка при загрузке фото')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('❌ Ошибка в handleImageChange:', error)
      setMessage('❌ Ошибка при обработке фото: ' + error.message)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const handleLoadImageFromUrl = async () => {
    const url = prompt('Введите URL изображения:')
    if (!url) return

    try {
      setIsLoading(true)
      setMessage('Загружаем изображение...')

      // Загружаем изображение через прокси или напрямую
      const response = await fetch(url, { mode: 'cors' })
      if (!response.ok) throw new Error('Не удалось загрузить изображение')

      const blob = await response.blob()
      
      // Проверяем тип файла
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL не указывает на изображение')
      }

      // Проверяем размер (20 MB)
      if (blob.size > 20 * 1024 * 1024) {
        throw new Error(`Изображение слишком большое. Максимальный размер: 20 MB`)
      }

      // Конвертируем в base64
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target.result)
        setMessage('Изображение успешно загружено!')
        setTimeout(() => setMessage(''), 3000)
        setIsLoading(false)
      }
      reader.onerror = () => {
        throw new Error('Ошибка при чтении изображения')
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error)
      setMessage(`Ошибка: ${error.message}`)
      setIsLoading(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  // Обработка вставки из буфера обмена
  useEffect(() => {
    if (!isEditing) return

    const handlePaste = async (e) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault()
          const blob = item.getAsFile()
          
          if (blob.size > 20 * 1024 * 1024) {
            setMessage('Изображение слишком большое. Максимальный размер: 20 MB')
            setTimeout(() => setMessage(''), 5000)
            return
          }

          const reader = new FileReader()
          reader.onload = (event) => {
            setProfileImage(event.target.result)
            setMessage('Изображение вставлено!')
            setTimeout(() => setMessage(''), 3000)
          }
          reader.readAsDataURL(blob)
          break
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [isEditing])

  const handleSave = async () => {
    if (!user) {
      console.log('Ошибка: пользователь не найден')
      setMessage('Ошибка: пользователь не найден')
      return
    }
    
    console.log('=== СОХРАНЕНИЕ ПРОФИЛЯ ===')
    console.log('Текущий пользователь:', user)
    console.log('Данные формы:', formData)
    console.log('profileImage существует?', !!profileImage)
    console.log('profileImage длина:', profileImage?.length)
    console.log('profileImage начало:', profileImage ? profileImage.substring(0, 100) + '...' : 'нет')
    
    setIsLoading(true)
    setMessage('Сохранение профиля...')

    try {
      // Обновляем данные пользователя
      const updatedUser = {
        ...user,
        ...formData,
        profileImage: profileImage || null // Явно указываем null если нет фото
      }
      
      console.log('Обновленные данные пользователя:', {
        ...updatedUser,
        profileImage: updatedUser.profileImage ? `${updatedUser.profileImage.substring(0, 50)}... (${updatedUser.profileImage.length} символов)` : 'нет'
      })
      console.log('profileImage в updatedUser:', updatedUser.profileImage ? `✅ ЕСТЬ (${updatedUser.profileImage.length} символов)` : '❌ НЕТ')

      // Сначала обновляем пользователя в AuthContext
      updateUser(updatedUser)
      console.log('✅ Пользователь обновлен в AuthContext')
      
      // Проверяем, что фото действительно сохранилось
      const savedUserCheck = localStorage.getItem('user')
      if (savedUserCheck) {
        const parsedUser = JSON.parse(savedUserCheck)
        console.log('✅ Проверка сохранения - profileImage в localStorage:', parsedUser.profileImage ? `ЕСТЬ (${parsedUser.profileImage.length} символов)` : 'НЕТ')
      }
      
      // Также обновляем пользователя в массиве users, если он там есть
      try {
        const savedUsers = localStorage.getItem('users')
        if (savedUsers) {
          let users = JSON.parse(savedUsers)
          const userIndex = users.findIndex(u => u.id === user.id || (u.email && u.email.toLowerCase().trim() === user.email?.toLowerCase().trim()))
          if (userIndex >= 0) {
            users[userIndex] = { ...updatedUser } // Создаем новый объект
            localStorage.setItem('users', JSON.stringify(users))
            console.log('✅ Пользователь обновлен в массиве users, индекс:', userIndex)
            
            // Проверяем сохранение
            const checkUsers = JSON.parse(localStorage.getItem('users'))
            console.log('✅ Проверка массива users - profileImage:', checkUsers[userIndex].profileImage ? `ЕСТЬ (${checkUsers[userIndex].profileImage.length} символов)` : 'НЕТ')
          } else {
            console.log('⚠️ Пользователь не найден в массиве users, добавляем...')
            users.push(updatedUser)
            localStorage.setItem('users', JSON.stringify(users))
            console.log('✅ Пользователь добавлен в массив users')
          }
        } else {
          console.log('⚠️ Массив users не существует, создаем...')
          localStorage.setItem('users', JSON.stringify([updatedUser]))
          console.log('✅ Массив users создан с текущим пользователем')
        }
      } catch (error) {
        console.error('❌ Ошибка обновления пользователя в массиве users:', error)
      }
      
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
        <h2 style={{ color: '#333' }}>{t('profile.personalInfo')}</h2>
        
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
            <div style={{ marginTop: '20px' }}>
              <ImageUpload
                currentImage={profileImage}
                onImageChange={handleImageChange}
                maxSize={20 * 1024 * 1024}
                single={true}
              />
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleLoadImageFromUrl}
                  disabled={isLoading}
                  style={{
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isLoading ? 0.6 : 1
                  }}
                >
                  <FaLink />
                  Загрузить по URL
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="profile-form">
          <div className="form-group">
            <label htmlFor="name" style={{ color: '#333' }}>{t('register.fullName')}</label>
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
                style={{ paddingLeft: '40px', color: '#333' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" style={{ color: '#333' }}>{t('register.email')}</label>
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
                style={{ paddingLeft: '40px', color: '#333' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone" style={{ color: '#333' }}>{t('register.phone')}</label>
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
                style={{ paddingLeft: '40px', color: '#333' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ color: '#333' }}>{t('register.accountType')}</label>
            {isEditing ? (
              <select
                name="role"
                value={formData.role || user.role}
                onChange={handleChange}
                style={{ paddingLeft: '40px', color: '#333' }}
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
                color: '#333'
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
