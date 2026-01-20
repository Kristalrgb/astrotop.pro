import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    console.log('=== ПОПЫТКА ВХОДА ===')
    console.log('Email из формы:', formData.email)
    console.log('Пароль из формы:', formData.password)

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || ''
      let userData = null

      // Пытаемся войти через бэкенд
      if (API_BASE_URL) {
        try {
          console.log('Попытка входа через бэкенд...')
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password
            })
          })

          if (response.ok) {
            userData = await response.json()
            console.log('✅ Вход через бэкенд успешен:', userData)
            // Добавляем пароль для локального хранения
            userData.password = formData.password
          } else if (response.status === 401) {
            console.log('❌ Неверный email или пароль (бэкенд)')
            setError('Неверный email или пароль')
            setIsLoading(false)
            return
          } else {
            console.warn('Ошибка бэкенда при входе:', response.status)
            // Продолжаем с локальными данными
          }
        } catch (error) {
          console.error('Ошибка при входе через бэкенд:', error)
          // Продолжаем с локальными данными
        }
      }

      // Если бэкенд недоступен или не вернул пользователя, проверяем localStorage
      if (!userData) {
        console.log('Проверка localStorage...')
        const savedUser = localStorage.getItem('user')
        
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser)
            const normalizedUserEmail = user.email ? user.email.toLowerCase().trim() : ''
            const normalizedFormEmail = formData.email.toLowerCase().trim()
            
            if (normalizedUserEmail === normalizedFormEmail && user.password === formData.password) {
              userData = user
              console.log('✅ Пользователь найден в localStorage')
            }
          } catch (parseError) {
            console.error('Ошибка парсинга пользователя из localStorage:', parseError)
          }
        }

        // Если пользователь не найден, проверяем моковые данные
        if (!userData) {
          const mockUsers = [
            { email: 'client@example.com', password: 'password', name: 'Анна Смирнова', id: 1, role: 'client' },
            { email: 'astrologer@example.com', password: 'password', name: 'Елена Петрова', id: 2, role: 'astrologer' },
            { email: 'l@test.com', password: 'astro2', name: 'Лена', id: 3, role: 'astrologer' },
            { email: 'lusa@test.com', password: 'astro26', name: 'Люся', id: 4, role: 'astrologer' },
            { email: 'lida@test.com', password: 'password', name: 'Лида', id: 5, role: 'astrologer' }
          ]

          const normalizedFormEmail = formData.email.toLowerCase().trim()
          const mockUser = mockUsers.find(u => 
            u.email.toLowerCase().trim() === normalizedFormEmail && u.password === formData.password
          )
          
          if (mockUser) {
            userData = mockUser
            console.log('✅ Моковый пользователь найден')
          }
        }
      }
      
      if (userData) {
        login(userData)
        // Перенаправляем в соответствующий кабинет
        if (userData.role === 'astrologer') {
          navigate('/astrologer-dashboard')
        } else {
          navigate('/client-dashboard')
        }
      } else {
        setError('Неверный email или пароль')
      }
    } catch (error) {
      console.error('Ошибка входа:', error)
      setError('Произошла ошибка при входе')
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
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', marginBottom: '10px' }}>Вход в систему</h1>
          <p style={{ color: '#666' }}>Войдите в свой аккаунт для доступа к консультациям</p>
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
            <label htmlFor="email">Email</label>
            <div style={{ position: 'relative' }}>
              <FaUser style={{
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
                placeholder="Введите ваш email"
                required
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
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
                placeholder="Введите ваш пароль"
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

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '20px' }}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Нет аккаунта?{' '}
            <Link to="/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
              Зарегистрироваться
            </Link>
          </p>
          
          <button
            onClick={(e) => {
              e.preventDefault()
              console.log('Кнопка "Забыли пароль?" нажата')
              navigate('/forgot-password')
            }}
            style={{ 
              color: '#667eea', 
              background: 'transparent',
              border: 'none',
              textDecoration: 'none',
              display: 'inline-block',
              marginTop: '10px',
              padding: '8px 16px',
              fontWeight: '500',
              fontSize: '16px',
              transition: 'all 0.2s',
              cursor: 'pointer',
              borderRadius: '6px',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.target.style.textDecoration = 'underline'
              e.target.style.background = 'rgba(102, 126, 234, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.target.style.textDecoration = 'none'
              e.target.style.background = 'transparent'
            }}
          >
            Забыли пароль?
          </button>
          
          {/* Кнопка отладки */}
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => {
                console.log('=== ОТЛАДКА ВХОДА ===')
                console.log('localStorage user:', localStorage.getItem('user'))
                console.log('localStorage specialists:', localStorage.getItem('specialists'))
                alert('Проверьте консоль браузера (F12 → Console)')
              }}
              style={{
                background: '#ff9800',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🧪 ОТЛАДКА
            </button>
            
            {/* Кнопка очистки данных Юлии */}
            <button
              onClick={() => {
                // Очищаем данные о пользователе Юлия из localStorage
                const currentUser = localStorage.getItem('user')
                if (currentUser) {
                  const user = JSON.parse(currentUser)
                  if (user.name === 'Юлия' || user.email === 'yulia@test.com') {
                    localStorage.removeItem('user')
                    console.log('Данные пользователя Юлия удалены из localStorage')
                    alert('Данные пользователя Юлия удалены! Обновите страницу.')
                  } else {
                    console.log('Пользователь Юлия не найден в localStorage')
                    alert('Пользователь Юлия не найден в localStorage')
                  }
                } else {
                  console.log('localStorage пуст')
                  alert('localStorage пуст')
                }
                
                // Также очищаем данные о специалисте Юлия из списка специалистов
                const specialists = localStorage.getItem('specialists')
                if (specialists) {
                  try {
                    const specialistsList = JSON.parse(specialists)
                    const filteredSpecialists = specialistsList.filter(s => 
                      s.name !== 'Юлия' && s.email !== 'yulia@test.com'
                    )
                    if (filteredSpecialists.length !== specialistsList.length) {
                      localStorage.setItem('specialists', JSON.stringify(filteredSpecialists))
                      console.log('Специалист Юлия удален из списка специалистов')
                      alert('Специалист Юлия удален из списка специалистов!')
                    } else {
                      console.log('Специалист Юлия не найден в списке специалистов')
                    }
                  } catch (error) {
                    console.error('Ошибка при обработке списка специалистов:', error)
                  }
                }
              }}
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
              🗑️ УДАЛИТЬ ЮЛИЮ
            </button>
            

          </div>
        </div>

                 <div style={{ 
           marginTop: '30px', 
           padding: '20px', 
           background: '#f8f9ff', 
           borderRadius: '8px',
           fontSize: '14px'
         }}>
           <h4 style={{ marginBottom: '15px', color: '#333' }}>Тестовые аккаунты:</h4>
           <div style={{ marginBottom: '10px' }}>
             <strong>Клиент:</strong><br />
             Email: client@example.com<br />
             Пароль: password
           </div>
           <div style={{ marginBottom: '10px' }}>
             <strong>Астролог:</strong><br />
             Email: astrologer@example.com<br />
             Пароль: password
           </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Лена (Астролог):</strong><br />
              Email: l@test.com<br />
              Пароль: astro2
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Люся (Астролог):</strong><br />
              Email: lusa@test.com<br />
              Пароль: astro26
            </div>
            <div>
              <strong>Лида (Астролог):</strong><br />
              Email: lida@test.com<br />
              Пароль: password
            </div>
         </div>
      </div>
    </div>
  )
}

export default Login
