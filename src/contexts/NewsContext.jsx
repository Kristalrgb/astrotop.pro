import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

const NewsContext = createContext()

// Базовый URL API
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const useNews = () => {
  const context = useContext(NewsContext)
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider')
  }
  return context
}

const handleResponse = async (response, fallbackMessage) => {
  // Проверяем, что ответ JSON, а не HTML
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    // Если сервер вернул HTML (например, 404 страницу), значит бэкенд недоступен
    // Не пытаемся парсить как JSON
    throw new Error('Сервер недоступен. Проверьте, что бэкенд запущен и правильно настроен.')
  }
  
  if (response.ok) {
    try {
      const text = await response.text()
      // Проверяем, что это действительно JSON, а не HTML
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<!doctype')) {
        throw new Error('Сервер вернул HTML вместо JSON. Бэкенд недоступен.')
      }
      return JSON.parse(text)
    } catch (error) {
      if (error.message.includes('HTML')) {
        throw error
      }
      throw new Error('Неверный формат ответа от сервера')
    }
  }
  
  let errorMessage = fallbackMessage
  try {
    const text = await response.text()
    // Проверяем, что это действительно JSON
    if (!text.trim().startsWith('<!DOCTYPE') && !text.trim().startsWith('<!doctype')) {
      const errorBody = JSON.parse(text)
      if (errorBody?.error) {
        errorMessage = errorBody.error
      }
    }
  } catch (error) {
    // ignore - используем fallbackMessage
  }
  throw new Error(errorMessage)
}

export const NewsProvider = ({ children }) => {
  // Загружаем новости из localStorage при инициализации
  const loadFromLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const backup = localStorage.getItem('news_backup')
        if (backup) {
          const parsed = JSON.parse(backup)
          return Array.isArray(parsed) ? parsed : []
        }
      } catch (e) {
        console.error('Ошибка загрузки из localStorage:', e)
      }
    }
    return []
  }, [])

  const [posts, setPosts] = useState(loadFromLocalStorage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchNews = useCallback(async () => {
    // Если API_BASE_URL не настроен, используем только localStorage
    if (!API_BASE_URL || API_BASE_URL.trim() === '') {
      console.warn('VITE_API_URL не настроен. Используются только локальные данные.')
      setLoading(false)
      const backup = localStorage.getItem('news_backup')
      if (backup) {
        try {
          const parsed = JSON.parse(backup)
          const newsArray = Array.isArray(parsed) ? parsed : []
          setPosts(newsArray)
          setError('Бэкенд не настроен. Используются сохраненные новости.')
        } catch (e) {
          console.error('Ошибка загрузки из localStorage:', e)
          setError('Бэкенд не настроен. Добавьте VITE_API_URL в настройках Vercel.')
        }
      } else {
        setError('Бэкенд не настроен. Добавьте VITE_API_URL в настройках Vercel.')
      }
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/news`)
      const data = await handleResponse(response, 'Не удалось загрузить новости')
      setPosts(Array.isArray(data) ? data : [])
      setError(null)
      
      // Сохраняем в localStorage как резервную копию
      if (typeof window !== 'undefined') {
        localStorage.setItem('news_backup', JSON.stringify(data))
      }
    } catch (err) {
      console.error('Ошибка загрузки новостей:', err)
      
      // Пытаемся загрузить из localStorage
      if (typeof window !== 'undefined') {
        try {
          const backup = localStorage.getItem('news_backup')
          if (backup) {
            const parsed = JSON.parse(backup)
            const newsArray = Array.isArray(parsed) ? parsed : []
            setPosts(newsArray)
            setError('Используются сохраненные новости. Сервер недоступен.')
            return
          }
        } catch (e) {
          console.error('Ошибка загрузки из localStorage:', e)
        }
      }
      
      // Если нет данных в localStorage, показываем ошибку, но не очищаем существующие посты
      if (posts.length === 0) {
        setError(err.message || 'Не удалось загрузить новости. Убедитесь, что сервер запущен.')
      } else {
        setError('Сервер недоступен. Используются сохраненные новости.')
      }
    } finally {
      setLoading(false)
    }
  }, [posts.length])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  // Слушаем изменения в localStorage для синхронизации между вкладками
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e) => {
      if (e.key === 'news_backup') {
        try {
          const backup = localStorage.getItem('news_backup')
          if (backup) {
            const parsed = JSON.parse(backup)
            if (Array.isArray(parsed)) {
              setPosts(parsed)
            }
          }
        } catch (error) {
          console.error('Ошибка синхронизации новостей из localStorage:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const createPost = async (payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const newPost = await handleResponse(response, 'Не удалось создать публикацию')
      setPosts(prev => {
        const updated = [newPost, ...prev]
      // Сохраняем в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('news_backup', JSON.stringify(updated))
      }
        return updated
      })
      
      return newPost
    } catch (error) {
      // Если сервер недоступен, сохраняем локально
      if (error.message.includes('Сервер недоступен') || error.message.includes('Неверный формат')) {
        const localPost = {
          id: `local-${Date.now()}`,
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          localOnly: true
        }
        setPosts(prev => {
          const updated = [localPost, ...prev]
        if (typeof window !== 'undefined') {
          localStorage.setItem('news_backup', JSON.stringify(updated))
        }
          return updated
        })
        
        throw new Error('Публикация сохранена локально. Сервер недоступен. После запуска сервера данные синхронизируются.')
      }
      throw error
    }
  }

  const updatePost = async (id, payload) => {
    try {
    const response = await fetch(`${API_BASE_URL}/api/news/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const updatedPost = await handleResponse(response, 'Не удалось обновить публикацию')
      setPosts(prev => {
        const updated = prev.map(post => (post.id === id ? updatedPost : post))
        if (typeof window !== 'undefined') {
          localStorage.setItem('news_backup', JSON.stringify(updated))
        }
        return updated
      })
    return updatedPost
    } catch (error) {
      // Если сервер недоступен, обновляем локально
      if (error.message.includes('Сервер недоступен') || error.message.includes('Неверный формат')) {
        setPosts(prev => {
          const updated = prev.map(post => {
            if (post.id === id) {
              return {
                ...post,
                ...payload,
                updatedAt: new Date().toISOString(),
                localOnly: true
              }
            }
            return post
          })
          if (typeof window !== 'undefined') {
            localStorage.setItem('news_backup', JSON.stringify(updated))
          }
          return updated
        })
        throw new Error('Публикация обновлена локально. Сервер недоступен.')
      }
      throw error
    }
  }

  const deletePost = async (id, authorId) => {
    try {
    const response = await fetch(`${API_BASE_URL}/api/news/${id}?authorId=${authorId}`, {
      method: 'DELETE'
    })
    await handleResponse(response, 'Не удалось удалить публикацию')
      setPosts(prev => {
        const updated = prev.filter(post => post.id !== id)
        if (typeof window !== 'undefined') {
          localStorage.setItem('news_backup', JSON.stringify(updated))
        }
        return updated
      })
    } catch (error) {
      // Если сервер недоступен, удаляем локально
      if (error.message.includes('Сервер недоступен') || error.message.includes('Неверный формат')) {
        setPosts(prev => {
          const updated = prev.filter(post => post.id !== id)
          if (typeof window !== 'undefined') {
            localStorage.setItem('news_backup', JSON.stringify(updated))
          }
          return updated
        })
        throw new Error('Публикация удалена локально. Сервер недоступен.')
      }
      throw error
    }
  }

  const value = {
    posts,
    loading,
    error,
    refresh: fetchNews,
    createPost,
    updatePost,
    deletePost
  }

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  )
}

