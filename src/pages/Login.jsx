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
    console.log('Email:', formData.email)
    console.log('Пароль:', formData.password)

    try {
      // Проверяем зарегистрированных пользователей в localStorage
      const savedUser = localStorage.getItem('user')
      console.log('Сохраненный пользователь в localStorage:', savedUser)
      
      let userData = null
      
      if (savedUser) {
        const user = JSON.parse(savedUser)
        console.log('Парсированный пользователь:', user)
        console.log('Сравнение email:', user.email === formData.email)
        console.log('Сравнение пароля:', user.password === formData.password)
        
        if (user.email === formData.email && user.password === formData.password) {
          userData = user
          console.log('Пользователь найден в localStorage')
        }
      }
      
      // Если пользователь не найден, проверяем моковые данные
      if (!userData) {
        if (formData.email === 'client@example.com' && formData.password === 'password') {
          userData = {
            id: 1,
            name: 'Анна Смирнова',
            email: formData.email,
            role: 'client'
          }
        } else if (formData.email === 'astrologer@example.com' && formData.password === 'password') {
          userData = {
            id: 2,
            name: 'Елена Петрова',
            email: formData.email,
            role: 'astrologer'
          }
        } else if (formData.email === 'l@test.com' && formData.password === 'astro2') {
          userData = {
            id: 3,
            name: 'Лена',
            email: formData.email,
            role: 'astrologer'
          }
        } else if (formData.email === 'lusa@test.com' && formData.password === 'astro26') {
          userData = {
            id: 4,
            name: 'Люся',
            email: formData.email,
            role: 'astrologer'
          }
        } else if (formData.email === 'lida@test.com' && formData.password === 'password') {
          userData = {
            id: 5,
            name: 'Лида',
            email: formData.email,
            role: 'astrologer'
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
          
          <Link 
            to="/forgot-password" 
            style={{ 
              color: '#667eea', 
              textDecoration: 'none',
              display: 'inline-block',
              marginTop: '10px',
              padding: '8px 16px',
              fontWeight: '500',
              transition: 'color 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Забыли пароль?
          </Link>
          
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
