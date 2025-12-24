import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useSpecialists } from '../contexts/SpecialistsContext'
import ImageUpload from '../components/ImageUpload'
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaPhone, FaUserTie } from 'react-icons/fa'

const Register = () => {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'client'
  })
  const [profileImage, setProfileImage] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login, checkExistingUser } = useAuth()
  const { addSpecialist } = useSpecialists()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleImageChange = (preview) => {
    setProfileImage(preview)
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError(t('register.errors.passwordsNotMatch'))
      return false
    }
    
    if (formData.password.length < 6) {
      setError(t('register.errors.passwordTooShort'))
      return false
    }
    
    if (!formData.name.trim()) {
      setError(t('register.errors.nameRequired'))
      return false
    }
    
    if (!formData.email.trim()) {
      setError(t('register.errors.emailRequired'))
      return false
    }
    
    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = checkExistingUser(formData.email)
    if (existingUser) {
      setError('Пользователь с таким email уже существует')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('Начало регистрации...')
    
    if (!validateForm()) {
      console.log('Валидация не прошла')
      return
    }
    
    setIsLoading(true)
    setError('')

    try {
      console.log('Создание пользователя...')
      // Моковая регистрация
      const userData = {
        id: Date.now(),
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(), // Нормализуем email (нижний регистр, без пробелов)
        phone: formData.phone.trim(),
        password: formData.password, // Сохраняем пароль
        role: formData.role,
        profileImage: profileImage
      }
      
      console.log('Данные пользователя:', userData)
      
      // Автоматически входим после регистрации
      login(userData)
      console.log('Пользователь залогинен')
      
      // Если регистрируется астролог, добавляем его в список специалистов
      if (formData.role === 'astrologer') {
        console.log('Добавление астролога в список специалистов')
        addSpecialist(userData)
      }
      
      // Перенаправляем в соответствующий кабинет
      if (formData.role === 'astrologer') {
        console.log('Перенаправление на кабинет астролога')
        navigate('/astrologer-dashboard')
      } else {
        console.log('Перенаправление на кабинет клиента')
        navigate('/client-dashboard')
      }
      
    } catch (error) {
      console.error('Ошибка регистрации:', error)
      setError(t('register.errors.registrationError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', marginBottom: '10px' }}>{t('register.title')}</h1>
          <p style={{ color: '#666' }}>{t('register.subtitle')}</p>
        </div>

        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
                placeholder={t('register.fullName')}
                required
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
                placeholder={t('register.email')}
                required
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
                placeholder="+7 (999) 123-45-67"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">{t('register.accountType')}</label>
            <div style={{ position: 'relative' }}>
              <FaUserTie style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666'
              }} />
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{ paddingLeft: '40px' }}
              >
                <option value="client">{t('register.client')}</option>
                <option value="astrologer">{t('register.astrologer')}</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('register.password')}</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('register.password')}
                required
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('register.confirmPassword')}</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666'
              }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('register.confirmPassword')}
                required
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>{t('register.profilePhoto')}</label>
            <ImageUpload
              currentImage={profileImage}
              onImageChange={handleImageChange}
              maxSize={5 * 1024 * 1024}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary register-btn"
            disabled={isLoading}
            style={{ 
              width: '100%', 
              marginTop: '20px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
            onClick={() => console.log('Кнопка регистрации нажата')}
          >
            {isLoading ? t('register.registering') : t('register.register')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ color: '#666' }}>
            {t('register.alreadyHaveAccount')}{' '}
            <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
              {t('register.login')}
            </Link>
          </p>
        </div>

        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: '#f8f9ff', 
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <h4 style={{ marginBottom: '15px', color: '#333' }}>{t('register.benefits')}</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
            {t('register.benefitsList').map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Register
