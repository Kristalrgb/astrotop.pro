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
  if (response.ok) {
    return response.json()
  }
  let errorMessage = fallbackMessage
  try {
    const errorBody = await response.json()
    if (errorBody?.error) {
      errorMessage = errorBody.error
    }
  } catch (error) {
    // ignore
  }
  throw new Error(errorMessage)
}

export const NewsProvider = ({ children }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/news`)
      const data = await handleResponse(response, 'Не удалось загрузить новости')
      setPosts(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      console.error('Ошибка загрузки новостей:', err)
      setError(err.message || 'Не удалось загрузить новости')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const createPost = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/api/news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const newPost = await handleResponse(response, 'Не удалось создать публикацию')
    setPosts(prev => [newPost, ...prev])
    return newPost
  }

  const updatePost = async (id, payload) => {
    const response = await fetch(`${API_BASE_URL}/api/news/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const updatedPost = await handleResponse(response, 'Не удалось обновить публикацию')
    setPosts(prev => prev.map(post => (post.id === id ? updatedPost : post)))
    return updatedPost
  }

  const deletePost = async (id, authorId) => {
    const response = await fetch(`${API_BASE_URL}/api/news/${id}?authorId=${authorId}`, {
      method: 'DELETE'
    })
    await handleResponse(response, 'Не удалось удалить публикацию')
    setPosts(prev => prev.filter(post => post.id !== id))
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

