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

  const updateUser = async (userData) => {
    // Обновляем локальное состояние
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    
    // Обновляем на бэкенде
    const API_BASE_URL = import.meta.env.VITE_API_URL || ''
    if (API_BASE_URL && userData.id) {
      try {
        const updateData = {
          name: userData.name,
          phone: userData.phone,
          profileImage: userData.profileImage,
          specialty: userData.specialty,
          experience: userData.experience,
          description: userData.description,
          price: userData.price,
          languages: userData.languages,
          services: userData.services
        }
        
        const response = await fetch(`${API_BASE_URL}/api/users/${userData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        })
        
        if (response.ok) {
          const updatedUser = await response.json()
          console.log('Пользователь обновлен на бэкенде:', updatedUser)
          // Обновляем локальное состояние с данными с бэкенда
          const finalUserData = { ...userData, ...updatedUser }
          setUser(finalUserData)
          localStorage.setItem('user', JSON.stringify(finalUserData))
        } else {
          console.warn('Ошибка обновления пользователя на бэкенде:', response.status)
        }
      } catch (error) {
        console.error('Ошибка обновления пользователя на бэкенде:', error)
      }
    }
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
