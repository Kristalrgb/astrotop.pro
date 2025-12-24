import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Проверяем сохраненную сессию
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // Функция для удаления пользователя
  const deleteUser = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('specialists')
    // Перенаправляем на главную страницу
    window.location.href = '/'
  }

  // Функция для проверки существующих пользователей
  const checkExistingUser = (email) => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        // Нормализуем email для сравнения
        const normalizedUserEmail = user.email ? user.email.toLowerCase().trim() : ''
        const normalizedInputEmail = email ? email.toLowerCase().trim() : ''
        return normalizedUserEmail === normalizedInputEmail ? user : null
      } catch (error) {
        console.error('Ошибка парсинга пользователя:', error)
        return null
      }
    }
    return null
  }

  const value = {
    user,
    login,
    logout,
    updateUser,
    deleteUser,
    checkExistingUser,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
