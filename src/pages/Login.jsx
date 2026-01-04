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
      let userData = null
      const normalizedFormEmail = formData.email.toLowerCase().trim()
      const formPassword = formData.password.trim() // Убираем пробелы из пароля
      
      console.log('Нормализованный email для поиска:', normalizedFormEmail)
      console.log('Пароль (после trim):', formPassword)
      
      // ПЕРВЫМ ДЕЛОМ: Проверяем моковые данные и автоматически создаем Юлию
      if (normalizedFormEmail === 'yuliajulieyulia@gmail.com' && formPassword === 'yuliajulieyulia') {
        console.log('🔧 Обнаружен аккаунт Юлия - проверяем/создаем...')
        
        // Сначала проверяем, есть ли уже такой пользователь
        const savedUsers = localStorage.getItem('users')
        let users = []
        if (savedUsers) {
          try {
            users = JSON.parse(savedUsers)
          } catch (e) {
            console.error('Ошибка парсинга:', e)
          }
        }
        
        const existingUser = users.find(u => 
          u.email && u.email.toLowerCase().trim() === normalizedFormEmail
        )
        
        if (existingUser) {
          if (existingUser.password === formPassword) {
            console.log('✅ Пользователь Юлия найден в localStorage, пароль совпадает')
            userData = {
              ...existingUser,
              role: existingUser.role || 'astrologer',
              password: formPassword // Убеждаемся, что пароль правильный
            }
          } else {
            console.log('⚠️ Пользователь Юлия найден, но пароль не совпадает. Обновляем пароль...')
            // Обновляем пароль существующего пользователя
            const userIndex = users.findIndex(u => 
              u.email && u.email.toLowerCase().trim() === normalizedFormEmail
            )
            if (userIndex >= 0) {
              users[userIndex].password = formPassword
              localStorage.setItem('users', JSON.stringify(users))
            }
            userData = {
              ...existingUser,
              role: existingUser.role || 'astrologer',
              password: formPassword
            }
          }
        } else {
          console.log('🔧 Создаем нового пользователя Юлия...')
          userData = {
            id: Date.now(),
            name: 'Юлия Настродамовна',
            email: 'yuliajulieyulia@gmail.com',
            phone: '',
            password: 'yuliajulieyulia',
            role: 'astrologer',
            profileImage: null
          }
          
          // Удаляем старую версию если есть
          users = users.filter(u => {
            const userEmail = u.email ? u.email.toLowerCase().trim() : ''
            return userEmail !== normalizedFormEmail
          })
          // Добавляем новую
          users.push(userData)
          localStorage.setItem('users', JSON.stringify(users))
          console.log('✅ Пользователь Юлия создан в массиве users')
          
          // Также сохраняем как текущего пользователя
          localStorage.setItem('user', JSON.stringify(userData))
          
          // Добавляем в специалисты если еще нет
          const savedSpecialists = localStorage.getItem('specialists')
          let specialists = []
          if (savedSpecialists) {
            try {
              specialists = JSON.parse(savedSpecialists)
            } catch (e) {
              console.error('Ошибка парсинга специалистов:', e)
            }
          }
          
          const existingSpecIndex = specialists.findIndex(s => {
            const specEmail = s.email ? s.email.toLowerCase().trim() : ''
            return specEmail === normalizedFormEmail
          })
          
          if (existingSpecIndex >= 0) {
            specialists[existingSpecIndex] = {
              ...specialists[existingSpecIndex],
              ...userData,
              specialty: 'Астролог',
              rating: specialists[existingSpecIndex].rating || 0,
              reviews: specialists[existingSpecIndex].reviews || 0,
              price: specialists[existingSpecIndex].price || 2000,
              password: 'yuliajulieyulia'
            }
          } else {
            specialists.push({
              ...userData,
              specialty: 'Астролог',
              rating: 0,
              reviews: 0,
              price: 2000,
              password: 'yuliajulieyulia'
            })
          }
          localStorage.setItem('specialists', JSON.stringify(specialists))
          console.log('✅ Пользователь Юлия добавлен в специалисты')
        }
      }
      
      // Если пользователь еще не найден, проверяем другие моковые данные
      if (!userData) {
        if (normalizedFormEmail === 'client@example.com' && formPassword === 'password') {
          userData = {
            id: 1,
            name: 'Анна Смирнова',
            email: 'client@example.com',
            password: 'password',
            role: 'client'
          }
        } else if (normalizedFormEmail === 'astrologer@example.com' && formPassword === 'password') {
          userData = {
            id: 2,
            name: 'Елена Петрова',
            email: 'astrologer@example.com',
            password: 'password',
            role: 'astrologer'
          }
        } else if (normalizedFormEmail === 'l@test.com' && formPassword === 'astro2') {
          userData = {
            id: 3,
            name: 'Лена',
            email: 'l@test.com',
            password: 'astro2',
            role: 'astrologer'
          }
        } else if (normalizedFormEmail === 'lusa@test.com' && formPassword === 'astro26') {
          userData = {
            id: 4,
            name: 'Люся',
            email: 'lusa@test.com',
            password: 'astro26',
            role: 'astrologer'
          }
        } else if (normalizedFormEmail === 'lida@test.com' && formPassword === 'password') {
          userData = {
            id: 5,
            name: 'Лида',
            email: 'lida@test.com',
            password: 'password',
            role: 'astrologer'
          }
        }
      }
      
      // Если пользователь все еще не найден, ищем в localStorage
      if (!userData) {
        // Собираем все возможные источники данных
        const allUsers = []
        
        // 1. Проверяем текущего пользователя в localStorage
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser)
          allUsers.push({ source: 'localStorage.user', user })
          console.log('Пользователь из localStorage.user:', user)
        } catch (parseError) {
          console.error('❌ Ошибка парсинга пользователя из localStorage:', parseError)
        }
      }
      
      // 2. Проверяем всех специалистов
      const savedSpecialists = localStorage.getItem('specialists')
      if (savedSpecialists) {
        try {
          const specialists = JSON.parse(savedSpecialists)
          console.log('Проверяем специалистов:', specialists.length)
          specialists.forEach(spec => {
            if (spec.email) {
              allUsers.push({ source: 'specialists', user: spec })
            }
          })
        } catch (error) {
          console.error('Ошибка при проверке специалистов:', error)
        }
      }
      
      // 3. Проверяем массив всех пользователей
      const savedUsers = localStorage.getItem('users')
      if (savedUsers) {
        try {
          const users = JSON.parse(savedUsers)
          console.log('Проверяем массив users:', users.length)
          users.forEach(user => {
            allUsers.push({ source: 'users', user })
          })
        } catch (error) {
          console.error('Ошибка при проверке массива users:', error)
        }
      }
      
      console.log('=== ВСЕ НАЙДЕННЫЕ ПОЛЬЗОВАТЕЛИ ===')
      console.log('Всего найдено:', allUsers.length)
      allUsers.forEach((item, index) => {
        console.log(`${index + 1}. Источник: ${item.source}`)
        console.log(`   Email: ${item.user.email}`)
        console.log(`   Нормализованный email: ${item.user.email ? item.user.email.toLowerCase().trim() : 'нет'}`)
        console.log(`   Пароль: ${item.user.password ? 'есть' : 'нет'}`)
        console.log(`   Совпадает email? ${item.user.email ? item.user.email.toLowerCase().trim() === normalizedFormEmail : false}`)
        console.log(`   Совпадает пароль? ${item.user.password === formPassword}`)
      })
      
      // Ищем совпадение
      for (const item of allUsers) {
        const user = item.user
        if (!user.email) continue
        
        const normalizedUserEmail = user.email.toLowerCase().trim()
        const emailMatch = normalizedUserEmail === normalizedFormEmail
        
        // Проверяем пароль (может быть undefined, поэтому проверяем явно)
        // Используем строгое сравнение и проверяем на null/undefined
        const userPassword = user.password || ''
        const passwordMatch = userPassword === formPassword
        
        console.log(`Проверка пользователя из ${item.source}:`)
        console.log(`  Email: "${normalizedUserEmail}" === "${normalizedFormEmail}" ? ${emailMatch}`)
        console.log(`  Password: "${userPassword}" === "${formPassword}" ? ${passwordMatch}`)
        console.log(`  Тип пароля пользователя: ${typeof userPassword}, длина: ${userPassword.length}`)
        console.log(`  Тип пароля формы: ${typeof formPassword}, длина: ${formPassword.length}`)
        
        if (emailMatch && passwordMatch) {
          // Если это специалист, создаем полный объект пользователя
          if (item.source === 'specialists') {
            userData = {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              password: user.password,
              role: 'astrologer',
              profileImage: user.profileImage || user.avatar
            }
          } else {
            userData = user
          }
          console.log(`✅ Пользователь найден в ${item.source} - вход выполнен!`)
          break
        }
      }
      } // Закрываем блок if (!userData)
      
      if (userData) {
        // Убеждаемся, что пароль сохранен в userData
        if (!userData.password) {
          userData.password = formPassword
        }
        
        // Убеждаемся, что email нормализован
        if (userData.email) {
          userData.email = userData.email.toLowerCase().trim()
        }
        
        console.log('✅ Вход выполнен успешно!')
        console.log('Данные пользователя:', { 
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          password: '***скрыто***' 
        })
        
        // Сохраняем пользователя в localStorage перед входом
        localStorage.setItem('user', JSON.stringify(userData))
        
        login(userData)
        
        // Перенаправляем в соответствующий кабинет
        setTimeout(() => {
          if (userData.role === 'astrologer') {
            navigate('/astrologer-dashboard')
          } else {
            navigate('/client-dashboard')
          }
        }, 100)
      } else {
        console.log('❌ Пользователь не найден после проверки всех источников')
        console.log('Email:', normalizedFormEmail)
        console.log('Пароль:', formPassword ? 'введен' : 'не введен')
        console.log('Попробуйте:')
        console.log('1. Проверить правильность email и пароля')
        console.log('2. Зарегистрироваться заново, если аккаунт был удален')
        console.log('3. Использовать тестовые аккаунты (см. внизу страницы)')
        console.log('4. Нажать кнопку "✅ СОЗДАТЬ ЮЛИЮ" если это аккаунт Юлия')
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
      <div className="card" style={{ maxWidth: '400px', width: '100%', overflow: 'visible', position: 'relative' }}>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          <div className="form-group" style={{ display: 'block', width: '100%' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>Email</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <FaUser style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666',
                zIndex: 1
              }} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Введите ваш email"
                required
                autoComplete="email"
                autoFocus={!formData.email}
                style={{ 
                  paddingLeft: '40px',
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  display: 'block',
                  visibility: 'visible',
                  opacity: 1,
                  height: 'auto',
                  minHeight: '44px'
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'block', width: '100%' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>Пароль</label>
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
                style={{ 
                  paddingLeft: '40px', 
                  paddingRight: '40px',
                  width: '100%',
                  padding: '12px 40px 12px 40px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  display: 'block'
                }}
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
            
            {/* Кнопка создания/восстановления пользователя Юлия */}
            <button
              onClick={() => {
                // Создаем/восстанавливаем пользователя Юлия
                const userData = {
                  id: Date.now(),
                  name: 'Юлия Настродамовна',
                  email: 'yuliajulieyulia@gmail.com',
                  phone: '',
                  password: 'yuliajulieyulia',
                  role: 'astrologer',
                  profileImage: null
                }
                
                // Сохраняем в массив всех пользователей
                const savedUsers = localStorage.getItem('users')
                let users = []
                if (savedUsers) {
                  try {
                    users = JSON.parse(savedUsers)
                  } catch (e) {
                    console.error('Ошибка парсинга:', e)
                  }
                }
                
                // Удаляем старую версию если есть
                users = users.filter(u => u.email !== userData.email)
                // Добавляем новую
                users.push(userData)
                localStorage.setItem('users', JSON.stringify(users))
                
                // Также сохраняем как текущего пользователя
                localStorage.setItem('user', JSON.stringify(userData))
                
                // Добавляем в специалисты если еще нет
                const savedSpecialists = localStorage.getItem('specialists')
                let specialists = []
                if (savedSpecialists) {
                  try {
                    specialists = JSON.parse(savedSpecialists)
                  } catch (e) {
                    console.error('Ошибка парсинга специалистов:', e)
                  }
                }
                
                const existingSpecIndex = specialists.findIndex(s => s.email === userData.email)
                if (existingSpecIndex >= 0) {
                  specialists[existingSpecIndex] = {
                    ...specialists[existingSpecIndex],
                    ...userData,
                    specialty: 'Астролог',
                    rating: 0,
                    reviews: 0,
                    price: 2000,
                    password: userData.password
                  }
                } else {
                  specialists.push({
                    ...userData,
                    specialty: 'Астролог',
                    rating: 0,
                    reviews: 0,
                    price: 2000,
                    password: userData.password
                  })
                }
                localStorage.setItem('specialists', JSON.stringify(specialists))
                
                console.log('✅ Пользователь Юлия создан/восстановлен!')
                alert('Пользователь Юлия создан/восстановлен! Теперь можно войти с:\nEmail: yuliajulieyulia@gmail.com\nПароль: yuliajulieyulia')
                
                // Заполняем форму
                setFormData({
                  email: userData.email,
                  password: userData.password
                })
              }}
              style={{
                background: '#27ae60',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                marginLeft: '10px'
              }}
            >
              ✅ СОЗДАТЬ ЮЛИЮ
            </button>
            
            {/* Кнопка очистки данных Юлии */}
            <button
              onClick={() => {
                // Очищаем данные о пользователе Юлия из localStorage
                const currentUser = localStorage.getItem('user')
                if (currentUser) {
                  const user = JSON.parse(currentUser)
                  if (user.name === 'Юлия' || user.email === 'yuliajulieyulia@gmail.com') {
                    localStorage.removeItem('user')
                    console.log('Данные пользователя Юлия удалены из localStorage')
                    alert('Данные пользователя Юлия удалены! Обновите страницу.')
                  }
                }
                
                // Удаляем из массива users
                const savedUsers = localStorage.getItem('users')
                if (savedUsers) {
                  try {
                    const users = JSON.parse(savedUsers)
                    const filtered = users.filter(u => u.email !== 'yuliajulieyulia@gmail.com')
                    localStorage.setItem('users', JSON.stringify(filtered))
                  } catch (e) {
                    console.error('Ошибка:', e)
                  }
                }
                
                // Также очищаем данные о специалисте Юлия из списка специалистов
                const specialists = localStorage.getItem('specialists')
                if (specialists) {
                  try {
                    const specialistsList = JSON.parse(specialists)
                    const filteredSpecialists = specialistsList.filter(s => 
                      s.name !== 'Юлия' && s.email !== 'yuliajulieyulia@gmail.com'
                    )
                    if (filteredSpecialists.length !== specialistsList.length) {
                      localStorage.setItem('specialists', JSON.stringify(filteredSpecialists))
                      console.log('Специалист Юлия удален из списка специалистов')
                      alert('Специалист Юлия удален!')
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
