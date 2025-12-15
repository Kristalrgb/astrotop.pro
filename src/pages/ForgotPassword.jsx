import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordCopied, setPasswordCopied] = useState(false)

  const handleChange = (e) => {
    setEmail(e.target.value)
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Валидация email
    if (!email.trim()) {
      setError('Пожалуйста, введите email')
      return
    }
    
    // Простая проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Пожалуйста, введите корректный email адрес')
      return
    }
    
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Проверяем, существует ли пользователь в localStorage
      const savedUser = localStorage.getItem('user')
      let userFound = false
      let generatedPassword = ''

      if (savedUser) {
        try {
          const user = JSON.parse(savedUser)
          if (user.email && user.email.toLowerCase() === email.toLowerCase()) {
            userFound = true
            // Генерируем новый пароль (16 символов)
            generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
            
            // Обновляем пароль пользователя
            const updatedUser = {
              ...user,
              password: generatedPassword
            }
            localStorage.setItem('user', JSON.stringify(updatedUser))
            console.log('Пароль обновлен для пользователя:', user.email)
          }
        } catch (parseError) {
          console.error('Ошибка парсинга пользователя из localStorage:', parseError)
        }
      }

      // Также проверяем моковые данные
      const mockUsers = [
        { email: 'client@example.com', name: 'Анна Смирнова', id: 1, role: 'client' },
        { email: 'astrologer@example.com', name: 'Елена Петрова', id: 2, role: 'astrologer' },
        { email: 'l@test.com', name: 'Лена', id: 3, role: 'astrologer' },
        { email: 'lusa@test.com', name: 'Люся', id: 4, role: 'astrologer' },
        { email: 'lida@test.com', name: 'Лида', id: 5, role: 'astrologer' }
      ]

      // Проверяем моковые данные только если пользователь не найден в localStorage
      if (!userFound) {
        const mockUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
        if (mockUser) {
          userFound = true
          // Генерируем новый пароль (16 символов)
          generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
          
          // Сохраняем мокового пользователя в localStorage с новым паролем
          const updatedMockUser = {
            ...mockUser,
            password: generatedPassword
          }
          localStorage.setItem('user', JSON.stringify(updatedMockUser))
          console.log('Пароль восстановлен для мокового пользователя:', mockUser.email)
        }
      }

      if (userFound) {
        setNewPassword(generatedPassword)
        setSuccess(true)
        console.log('Новый пароль сгенерирован успешно')
      } else {
        setError('Пользователь с таким email не найден. Проверьте правильность введенного email.')
      }
    } catch (error) {
      console.error('Ошибка восстановления пароля:', error)
      setError('Произошла ошибка при восстановлении пароля')
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
          <h1 style={{ color: '#333', marginBottom: '10px' }}>Восстановление пароля</h1>
          <p style={{ color: '#666' }}>Введите ваш email для восстановления пароля</p>
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

        {success ? (
          <div>
            <div style={{
              background: '#d4edda',
              color: '#155724',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #c3e6cb'
            }}>
              <strong>Пароль успешно восстановлен!</strong>
              <div style={{ marginTop: '15px', padding: '15px', background: '#fff', borderRadius: '6px', border: '2px solid #28a745' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Ваш новый пароль:</p>
                <div style={{ position: 'relative' }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontFamily: 'monospace', 
                  background: '#f8f9fa', 
                  padding: '10px 40px 10px 10px', 
                  borderRadius: '4px',
                  textAlign: 'center',
                  letterSpacing: '2px',
                  color: '#28a745',
                  fontWeight: 'bold',
                  wordBreak: 'break-all'
                }}>
                  {newPassword}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newPassword).then(() => {
                      setPasswordCopied(true)
                      setTimeout(() => setPasswordCopied(false), 2000)
                    }).catch(err => {
                      console.error('Ошибка копирования:', err)
                      // Fallback для старых браузеров
                      const textArea = document.createElement('textarea')
                      textArea.value = newPassword
                      document.body.appendChild(textArea)
                      textArea.select()
                      document.execCommand('copy')
                      document.body.removeChild(textArea)
                      setPasswordCopied(true)
                      setTimeout(() => setPasswordCopied(false), 2000)
                    })
                  }}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: passwordCopied ? '#28a745' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  title="Копировать пароль"
                >
                  {passwordCopied ? '✓ Скопировано' : '📋 Копировать'}
                </button>
              </div>
                <p style={{ margin: '15px 0 0 0', fontSize: '14px', color: '#666' }}>
                  Сохраните этот пароль в безопасном месте. Вы можете изменить его после входа в систему.
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <Link 
                to="/login" 
                className="btn btn-primary"
                style={{ 
                  width: '100%', 
                  textAlign: 'center', 
                  textDecoration: 'none',
                  display: 'block',
                  padding: '12px'
                }}
              >
                Перейти к входу
              </Link>
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                  setNewPassword('')
                  setPasswordCopied(false)
                  setError('')
                }}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Восстановить еще раз
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
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
                  value={email}
                  onChange={handleChange}
                  placeholder="Введите ваш email"
                  required
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', marginTop: '20px' }}
            >
              {isLoading ? 'Отправка...' : 'Восстановить пароль'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Link 
            to="/login" 
            style={{ 
              color: '#667eea', 
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaArrowLeft /> Вернуться к входу
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

