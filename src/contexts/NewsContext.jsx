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
              // Если это уже локальный пост, просто обновляем его
              if (post.id.startsWith('local-')) {
                return {
                  ...post,
                  ...payload,
                  updatedAt: new Date().toISOString(),
                  localOnly: true
                }
              }
              // Если это пост с сервера, сохраняем его ID как serverId для синхронизации
              const localId = `local-${Date.now()}-${post.id}`
              return {
                ...post,
                ...payload,
                updatedAt: new Date().toISOString(),
                localOnly: true,
                id: localId,
                serverId: post.id // Сохраняем оригинальный ID для синхронизации
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
    // Если это локальный пост (еще не синхронизирован), просто удаляем его локально
    const postToDelete = posts.find(p => p.id === id)
    if (postToDelete && postToDelete.localOnly && id.startsWith('local-')) {
      setPosts(prev => {
        const updated = prev.filter(post => post.id !== id)
        if (typeof window !== 'undefined') {
          localStorage.setItem('news_backup', JSON.stringify(updated))
        }
        return updated
      })
      return
    }

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

  // Функция синхронизации локальных новостей с сервером
  const syncLocalPosts = useCallback(async () => {
    // Если API не настроен, не синхронизируем
    if (!API_BASE_URL || API_BASE_URL.trim() === '') {
      return { synced: 0, failed: 0 }
    }

    // Находим все локальные новости (с флагом localOnly)
    const localPosts = posts.filter(post => post.localOnly && post.id && post.id.startsWith('local-'))
    
    if (localPosts.length === 0) {
      return { synced: 0, failed: 0 }
    }

    let syncedCount = 0
    let failedCount = 0
    const updatedPosts = [...posts]

    for (const localPost of localPosts) {
      try {
        // Подготавливаем данные для отправки (без служебных полей)
        const { localOnly, id: localId, serverId, ...postData } = localPost
        
        // Если это обновление существующей новости (есть serverId), используем PUT
        if (serverId && serverId !== localId) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/news/${serverId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(postData)
            })
            const updatedPost = await handleResponse(response, 'Не удалось синхронизировать публикацию')
            
            // Заменяем локальную версию на серверную
            const index = updatedPosts.findIndex(p => p.id === localId)
            if (index !== -1) {
              updatedPosts[index] = updatedPost
              syncedCount++
            }
          } catch (updateError) {
            // Если пост не найден на сервере (был удален), создаем его как новый
            if (updateError.message.includes('404') || updateError.message.includes('Не найдено')) {
              const response = await fetch(`${API_BASE_URL}/api/news`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
              })
              const newPost = await handleResponse(response, 'Не удалось синхронизировать публикацию')
              
              const index = updatedPosts.findIndex(p => p.id === localId)
              if (index !== -1) {
                updatedPosts[index] = newPost
                syncedCount++
              }
            } else {
              throw updateError
            }
          }
        } else {
          // Создаем новую новость на сервере
          const response = await fetch(`${API_BASE_URL}/api/news`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
          })
          const newPost = await handleResponse(response, 'Не удалось синхронизировать публикацию')
          
          // Заменяем локальную версию на серверную
          const index = updatedPosts.findIndex(p => p.id === localId)
          if (index !== -1) {
            updatedPosts[index] = newPost
            syncedCount++
          }
        }
      } catch (error) {
        console.error(`Ошибка синхронизации новости ${localPost.id}:`, error)
        failedCount++
        // Оставляем новость с флагом localOnly для повторной попытки
      }
    }

    // Обновляем состояние, если что-то синхронизировалось
    if (syncedCount > 0) {
      setPosts(updatedPosts)
      if (typeof window !== 'undefined') {
        localStorage.setItem('news_backup', JSON.stringify(updatedPosts))
      }
    }

    return { synced: syncedCount, failed: failedCount }
  }, [posts, API_BASE_URL])

  // Автоматическая синхронизация при успешном подключении к серверу
  useEffect(() => {
    if (!API_BASE_URL || API_BASE_URL.trim() === '') return
    if (loading) return // Не синхронизируем во время загрузки

    // Проверяем наличие локальных новостей
    const hasLocalPosts = posts.some(post => post.localOnly && post.id && post.id.startsWith('local-'))
    
    // Синхронизируем только если сервер доступен (нет ошибки) и есть локальные новости
    if (hasLocalPosts && !error) {
      // Небольшая задержка для избежания конфликтов с первоначальной загрузкой
      const timer = setTimeout(() => {
        syncLocalPosts().then(result => {
          if (result.synced > 0) {
            console.log(`Автоматическая синхронизация: синхронизировано новостей: ${result.synced}`)
            // Обновляем список новостей после синхронизации
            setTimeout(() => {
              fetchNews()
            }, 500)
          }
        }).catch(err => {
          console.error('Ошибка автоматической синхронизации:', err)
        })
      }, 3000) // Задержка 3 секунды после загрузки

      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, posts, syncLocalPosts, fetchNews, API_BASE_URL])

  // Периодическая синхронизация (каждые 30 секунд, если есть локальные новости)
  useEffect(() => {
    if (!API_BASE_URL || API_BASE_URL.trim() === '') return

    const interval = setInterval(() => {
      // Проверяем наличие локальных новостей
      const hasLocalPosts = posts.some(post => post.localOnly && post.id && post.id.startsWith('local-'))
      
      // Синхронизируем только если есть локальные новости, сервер доступен и не идет загрузка
      if (hasLocalPosts && !error && !loading) {
        syncLocalPosts().then(result => {
          if (result.synced > 0) {
            console.log(`Периодическая синхронизация: синхронизировано новостей: ${result.synced}`)
            setTimeout(() => {
              fetchNews()
            }, 500)
          }
        }).catch(err => {
          console.error('Ошибка периодической синхронизации:', err)
        })
      }
    }, 30000) // Каждые 30 секунд

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncLocalPosts, fetchNews, API_BASE_URL])

  const value = {
    posts,
    loading,
    error,
    refresh: fetchNews,
    createPost,
    updatePost,
    deletePost,
    syncLocalPosts
  }

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  )
}

