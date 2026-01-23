import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useSpecialists } from '../contexts/SpecialistsContext'
import { useProducts } from '../contexts/ProductsContext'
import { useLectures } from '../contexts/LecturesContext'
import ProductAdmin from '../components/ProductAdmin'
import { FaYoutube, FaTelegram, FaWhatsapp, FaInstagram, FaEdit, FaTrash, FaCalendarAlt, FaVideo, FaUsers, FaStar, FaUser, FaNewspaper, FaShoppingBag, FaFolder, FaFolderPlus, FaFolderOpen, FaFileAlt, FaDownload, FaPlus, FaBook, FaSave, FaTimes, FaExternalLinkAlt, FaCloudUploadAlt, FaCheck, FaBan } from 'react-icons/fa'
import { useNews } from '../contexts/NewsContext'

const ASTROLOGER_ARCHIVE_STORAGE_KEY = 'astrologerArchiveFolders'

const createDefaultArchiveFolders = () => [
  {
    id: 'astro-folder-vip',
    name: 'VIP клиенты',
    color: '#8b5cf6',
    description: 'Храните заметки и материалы по постоянным клиентам',
    createdAt: new Date().toISOString(),
    charts: [
      {
        id: 'chart-anna-astro',
        title: 'Анна Смирнова · консультация 12.04',
        birthDate: '1990-04-12',
        birthTime: '09:15',
        location: 'Москва, Россия',
        notes: 'Запрос: карьерный путь и финансовые возможности. Подготовить рекомендации по транзитам апреля.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'chart-ivan-astro',
        title: 'Иван Петров · совместимость',
        birthDate: '1988-09-30',
        birthTime: '18:40',
        location: 'Санкт-Петербург, Россия',
        notes: 'Парная консультация, добавить выводы по Венере и Марсу до 20.03.',
        createdAt: new Date().toISOString()
      }
    ]
  }
]

const AstrologerDashboard = () => {
  const navigate = useNavigate()
  const { user, updateUser, deleteUser } = useAuth()
  const { t, currentLanguage } = useLanguage()
  const isEnglish = currentLanguage === 'en'
  const translate = (ru, en) => (isEnglish ? en : ru)
  const { updateSpecialist, deleteSpecialist } = useSpecialists()
  const { 
    products: allProducts, 
    addProduct: addProductToStore, 
    updateProduct: updateProductInStore, 
    deleteProduct: deleteProductFromStore,
    getOwnerStats 
  } = useProducts()
  const { posts: newsPosts, loading: newsLoading, error: newsError, createPost, updatePost, deletePost } = useNews()
  const { lectures, addLecture, updateLecture, deleteLecture, getLecturesByAuthor } = useLectures()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    name: user?.name || 'Елена Петрова',
    email: user?.email || '',
    phone: user?.phone || '',
    specialty: user?.specialty || 'Астролог',
    experience: user?.experience || '15 лет',
    description: user?.description || 'Профессиональный астролог с многолетним опытом работы. Специализируюсь на натальных картах, синастрии и прогнозах.',
    price: user?.price || 3000,
    languages: user?.languages || ['Русский', 'Английский'],
    services: user?.services || ['Натальная карта', 'Синастрия', 'Прогнозы', 'Элективная астрология']
  })
  
  const [socialLinks, setSocialLinks] = useState([
    { id: 1, platform: 'youtube', url: 'https://youtube.com/@elenapetrova', title: 'Мой YouTube канал' },
    { id: 2, platform: 'telegram', url: 'https://t.me/elenapetrova', title: 'Telegram' },
    { id: 3, platform: 'whatsapp', url: 'https://wa.me/79991234567', title: 'WhatsApp' }
  ])
  
  const [consultations, setConsultations] = useState([])
  const [schedule, setSchedule] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    imageUrl: ''
  })
  const [editingPostId, setEditingPostId] = useState(null)
  const [isSavingPost, setIsSavingPost] = useState(false)
  const [postError, setPostError] = useState('')
  const [archiveFolders, setArchiveFolders] = useState(() => {
    if (typeof window === 'undefined') {
      return createDefaultArchiveFolders()
    }
    try {
      const stored = localStorage.getItem(ASTROLOGER_ARCHIVE_STORAGE_KEY)
      const parsed = stored ? JSON.parse(stored) : []
      return parsed.length ? parsed : createDefaultArchiveFolders()
    } catch (error) {
      console.warn('Не удалось загрузить архив астролога:', error)
      return createDefaultArchiveFolders()
    }
  })
  const [selectedArchiveFolderId, setSelectedArchiveFolderId] = useState(null)
  const [newArchiveFolder, setNewArchiveFolder] = useState({
    name: '',
    color: '#8b5cf6',
    description: ''
  })
  const [archiveChartForm, setArchiveChartForm] = useState({
    title: '',
    birthDate: '',
    birthTime: '',
    location: '',
    notes: ''
  })
  
  // Состояния для управления уроками
  const [isEditingLesson, setIsEditingLesson] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState(null)
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    price: '',
    priceUSD: '',
    priceEUR: '',
    duration: '',
    durationEn: '',
    category: 'basics',
    categoryName: 'Основы',
    categoryNameEn: 'Basics',
    image: '📚'
  })
  const [myLectures, setMyLectures] = useState([])
  const [lessonMessage, setLessonMessage] = useState('')
  
  const myPosts = React.useMemo(() => {
    if (!user) return []
    const filtered = newsPosts.filter(post => {
      const postAuthorId = String(post.authorId || '')
      const userId = String(user.id || '')
      return postAuthorId === userId
    })
    // Отладочная информация
    if (filtered.length === 0 && newsPosts.length > 0) {
      console.log('Отладка новостей:', {
        userId: user.id,
        userType: typeof user.id,
        totalPosts: newsPosts.length,
        posts: newsPosts.map(p => ({
          id: p.id,
          authorId: p.authorId,
          authorIdType: typeof p.authorId,
          title: p.title
        }))
      })
    }
    return filtered
  }, [newsPosts, user])

  const myProducts = React.useMemo(() => {
    if (!user) return []
    return (allProducts || []).filter(product => product && String(product.ownerId) === String(user.id))
  }, [allProducts, user])

  const myStoreStats = user ? getOwnerStats(user.id) : { total: 0, inStock: 0, outOfStock: 0 }

  const resetPostForm = () => {
    setPostForm({ title: '', content: '', imageUrl: '' })
    setEditingPostId(null)
    setPostError('')
  }

  const handlePostSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      setPostError('Автор не найден. Перезайдите в аккаунт.')
      return
    }

    if (!postForm.title.trim() || !postForm.content.trim()) {
      setPostError('Заполните заголовок и текст новости')
      return
    }

    const payload = {
      title: postForm.title.trim(),
      content: postForm.content.trim(),
      imageUrl: postForm.imageUrl.trim(),
      authorId: user.id,
      authorName: user.name || 'Астролог',
      authorAvatar: user.profileImage || ''
    }

    setIsSavingPost(true)
    setPostError('')
    try {
      if (editingPostId) {
        await updatePost(editingPostId, { ...payload, authorId: user.id })
      } else {
        await createPost(payload)
      }
      resetPostForm()
      // Обновляем список новостей после успешного сохранения
      setTimeout(() => {
        // Принудительно обновляем список, если используется локальное хранилище
        if (typeof window !== 'undefined') {
          const backup = localStorage.getItem('news_backup')
          if (backup) {
            try {
              const parsed = JSON.parse(backup)
              // Обновляем через контекст, если есть метод refresh
              // Это будет обработано автоматически через useMemo
            } catch (e) {
              console.error('Ошибка чтения из localStorage:', e)
            }
          }
        }
      }, 100)
      alert(editingPostId ? 'Публикация обновлена' : 'Новость опубликована')
    } catch (error) {
      console.error('Ошибка публикации новости:', error)
      let errorMessage = error.message || 'Не удалось сохранить новость'
      
      // Более понятное сообщение для пользователя
      if (errorMessage.includes('Сервер недоступен') || errorMessage.includes('Неверный формат')) {
        errorMessage = 'Сервер недоступен. Новость сохранена локально. Синхронизация произойдет автоматически после восстановления связи с сервером.'
      } else if (errorMessage.includes('сохранена локально') || errorMessage.includes('обновлена локально')) {
        // Это не ошибка, а предупреждение - показываем как успех с предупреждением
        alert('Новость сохранена локально. Синхронизация с сервером произойдет автоматически после восстановления связи.')
        resetPostForm()
        // Обновляем список новостей
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            const backup = localStorage.getItem('news_backup')
            if (backup) {
              try {
                const parsed = JSON.parse(backup)
                // Список обновится автоматически через useMemo
              } catch (e) {
                console.error('Ошибка чтения из localStorage:', e)
              }
            }
          }
        }, 100)
        return
      }
      
      setPostError(errorMessage)
    } finally {
      setIsSavingPost(false)
    }
  }

  const handleEditPost = (post) => {
    setPostForm({
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl || ''
    })
    setEditingPostId(post.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeletePost = async (postId) => {
    if (!user) return
    if (!window.confirm('Удалить публикацию?')) return

    try {
      await deletePost(postId, user.id)
    } catch (error) {
      console.error('Ошибка удаления новости:', error)
      setPostError(error.message || 'Не удалось удалить публикацию')
    }
  }

  // Синхронизируем профиль с данными пользователя
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || '',
        phone: user.phone || '',
        specialty: user.specialty || prev.specialty,
        experience: user.experience || prev.experience,
        description: user.description || prev.description,
        price: user.price || prev.price,
        languages: user.languages || prev.languages,
        services: user.services || prev.services
      }))
    }
  }, [user])

  // Загружаем уроки астролога при изменении пользователя или лекций
  useEffect(() => {
    if (user && user.role === 'astrologer' && user.id) {
      const authorLectures = getLecturesByAuthor(user.id)
      setMyLectures(authorLectures)
    } else {
      setMyLectures([])
    }
  }, [user, lectures, getLecturesByAuthor])

  // Загрузка консультаций с бэкенда
  useEffect(() => {
    const loadConsultations = async () => {
      if (!user || !user.id) {
        console.log('Пользователь не найден, используем моковые данные')
        setConsultations([])
        return
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || ''
      
      // Загружаем бронирования с бэкенда
      if (API_BASE_URL) {
        try {
          // Пробуем загрузить по user.id (ID пользователя)
          console.log('Загрузка бронирований для астролога (user.id):', user.id)
          let response = await fetch(`${API_BASE_URL}/api/bookings?specialistId=${user.id}`)
          
          let bookings = []
          
          // Если не найдено, пробуем загрузить все бронирования и фильтровать
          if (!response.ok) {
            console.log('Попытка загрузить все бронирования...')
            response = await fetch(`${API_BASE_URL}/api/bookings`)
            if (response.ok) {
              const allBookings = await response.json()
              console.log('Все бронирования:', allBookings)
              // Фильтруем по specialistId, сравнивая как строки
              bookings = allBookings.filter(booking => 
                String(booking.specialistId) === String(user.id)
              )
              console.log('Отфильтрованные бронирования для астролога:', bookings)
            }
          } else {
            bookings = await response.json()
            console.log('Бронирования загружены:', bookings)
          }
          
          // Преобразуем бронирования в формат консультаций
          if (bookings.length > 0) {
            const consultationsData = bookings.map(booking => ({
              id: booking.id,
              clientName: booking.clientName || 'Клиент',
              clientId: booking.clientId,
              date: booking.date,
              time: booking.time,
              duration: booking.duration || 60,
              status: booking.status === 'pending' ? 'pending' : booking.status === 'confirmed' ? 'upcoming' : booking.status === 'completed' ? 'completed' : booking.status === 'cancelled' ? 'cancelled' : 'upcoming',
              type: booking.type === 'group' ? 'group' : 'individual',
              language: booking.language || 'ru',
              phoneNumber: booking.phoneNumber,
              notes: booking.notes,
              basePrice: booking.basePrice,
              finalPrice: booking.finalPrice,
              promoCode: booking.promoCode,
              createdAt: booking.createdAt
            }))
            
            // Сортируем по дате (ближайшие первыми)
            consultationsData.sort((a, b) => {
              const dateA = new Date(`${a.date}T${a.time}`)
              const dateB = new Date(`${b.date}T${b.time}`)
              return dateA - dateB
            })
            
            setConsultations(consultationsData)
            console.log('Консультации установлены:', consultationsData)
          } else {
            console.warn('Бронирования не найдены')
            setConsultations([])
          }
        } catch (error) {
          console.error('Ошибка загрузки бронирований:', error)
          setConsultations([])
        }
      } else {
        console.warn('VITE_API_URL не настроен, используем пустой список')
        setConsultations([])
      }
    }

    loadConsultations()
    
    // Загружаем консультации каждые 30 секунд для обновления
    const interval = setInterval(loadConsultations, 30000)
    
    return () => clearInterval(interval)
  }, [user])

  // Моковые данные для расписания
  useEffect(() => {
    const mockSchedule = [
      { day: 'Понедельник', start: '09:00', end: '18:00', available: true },
      { day: 'Вторник', start: '09:00', end: '18:00', available: true },
      { day: 'Среда', start: '09:00', end: '18:00', available: true },
      { day: 'Четверг', start: '09:00', end: '18:00', available: true },
      { day: 'Пятница', start: '09:00', end: '18:00', available: true },
      { day: 'Суббота', start: '10:00', end: '16:00', available: true },
      { day: 'Воскресенье', start: '10:00', end: '16:00', available: false }
    ]

    setSchedule(mockSchedule)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(ASTROLOGER_ARCHIVE_STORAGE_KEY, JSON.stringify(archiveFolders))
  }, [archiveFolders])

  useEffect(() => {
    if (!selectedArchiveFolderId && archiveFolders.length > 0) {
      setSelectedArchiveFolderId(archiveFolders[0].id)
    }
  }, [archiveFolders, selectedArchiveFolderId])

  const platforms = [
    { key: 'youtube', name: 'YouTube', icon: <FaYoutube />, color: '#FF0000' },
    { key: 'telegram', name: 'Telegram', icon: <FaTelegram />, color: '#0088cc' },
    { key: 'whatsapp', name: 'WhatsApp', icon: <FaWhatsapp />, color: '#25D366' },
    { key: 'instagram', name: 'Instagram', icon: <FaInstagram />, color: '#E4405F' }
  ]

  const handleProfileUpdate = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleSocialLinkAdd = () => {
    const newLink = {
      id: Date.now(),
      platform: 'youtube',
      url: '',
      title: ''
    }
    setSocialLinks(prev => [...prev, newLink])
  }

  const handleSocialLinkUpdate = (id, field, value) => {
    setSocialLinks(prev => prev.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ))
  }

  const handleSocialLinkDelete = (id) => {
    setSocialLinks(prev => prev.filter(link => link.id !== id))
  }

  const handleSaveProfile = () => {
    console.log('=== СОХРАНЕНИЕ ПРОФИЛЯ АСТРОЛОГА ===')
    console.log('Текущий пользователь:', user)
    console.log('Данные профиля:', profile)
    
    if (!user) {
      alert('Ошибка: пользователь не найден')
      return
    }

    try {
      // Обновляем данные пользователя со всеми полями профиля
      const updatedUser = {
        ...user,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        specialty: profile.specialty,
        experience: profile.experience,
        description: profile.description,
        price: profile.price,
        languages: profile.languages,
        services: profile.services
      }
      
      console.log('Обновленные данные пользователя:', updatedUser)

      // Обновляем пользователя в AuthContext
      updateUser(updatedUser)
      console.log('Пользователь обновлен в AuthContext')
      
      // Обновляем специалиста в SpecialistsContext с полными данными
      const updatedSpecialistData = {
        ...updatedUser,
        rating: user.rating || 0,
        reviews: user.reviews || 0,
        pricePerMinute: user.pricePerMinute || Math.round(profile.price / 60),
        consultations: user.consultations || 0,
        tags: profile.services || []
      }
      updateSpecialist(updatedSpecialistData)
      console.log('Специалист обновлен в SpecialistsContext')
      
      setIsEditing(false)
      alert('Профиль успешно обновлен!')
      
      console.log('Профиль астролога успешно обновлен!')
      
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error)
      alert('Ошибка при сохранении профиля')
    }
  }

  const handleDeleteProfile = () => {
    if (window.confirm('Вы уверены, что хотите удалить свой профиль? Это действие нельзя отменить.')) {
      console.log('=== УДАЛЕНИЕ ПРОФИЛЯ АСТРОЛОГА ===')
      console.log('Пользователь для удаления:', user)
      
      try {
        // Удаляем специалиста из списка
        deleteSpecialist(user.id)
        console.log('Специалист удален из SpecialistsContext')
        
        // Удаляем пользователя
        deleteUser()
        console.log('Профиль астролога успешно удален!')
        
      } catch (error) {
        console.error('Ошибка при удалении профиля:', error)
        alert('Произошла ошибка при удалении профиля')
      }
    }
  }

  const getPlatformIcon = (platform) => {
    const platformData = platforms.find(p => p.key === platform)
    return platformData ? platformData.icon : null
  }

  const getPlatformColor = (platform) => {
    const platformData = platforms.find(p => p.key === platform)
    return platformData ? platformData.color : '#666'
  }

  const selectedArchiveFolder = React.useMemo(
    () => archiveFolders.find(folder => folder.id === selectedArchiveFolderId) || archiveFolders[0] || null,
    [archiveFolders, selectedArchiveFolderId]
  )

  const handleArchiveFolderCreate = (e) => {
    e.preventDefault()
    if (!newArchiveFolder.name.trim()) {
      alert('Введите название папки')
      return
    }

    const folder = {
      id: `astro-folder-${Date.now()}`,
      name: newArchiveFolder.name.trim(),
      color: newArchiveFolder.color,
      description: newArchiveFolder.description.trim(),
      createdAt: new Date().toISOString(),
      charts: []
    }

    setArchiveFolders(prev => [folder, ...prev])
    setSelectedArchiveFolderId(folder.id)
    setNewArchiveFolder({
      name: '',
      color: '#8b5cf6',
      description: ''
    })
  }

  const handleArchiveFolderDelete = (folderId) => {
    if (!window.confirm('Удалить папку вместе с сохранёнными материалами?')) return

    setArchiveFolders(prevFolders => {
      const updated = prevFolders.filter(folder => folder.id !== folderId)
      if (selectedArchiveFolderId === folderId) {
        setSelectedArchiveFolderId(updated[0]?.id || null)
      }
      return updated
    })
  }

  const handleArchiveChartCreate = (e) => {
    e.preventDefault()
    if (!selectedArchiveFolder) {
      alert('Сначала выберите папку для сохранения материалов')
      return
    }
    if (!archiveChartForm.title.trim() || !archiveChartForm.birthDate) {
      alert('Укажите имя клиента и дату рождения')
      return
    }

    const chart = {
      id: `astro-chart-${Date.now()}`,
      title: archiveChartForm.title.trim(),
      birthDate: archiveChartForm.birthDate,
      birthTime: archiveChartForm.birthTime,
      location: archiveChartForm.location.trim(),
      notes: archiveChartForm.notes.trim(),
      createdAt: new Date().toISOString()
    }

    setArchiveFolders(prevFolders =>
      prevFolders.map(folder =>
        folder.id === selectedArchiveFolder.id
          ? { ...folder, charts: [chart, ...folder.charts] }
          : folder
      )
    )

    setArchiveChartForm({
      title: '',
      birthDate: '',
      birthTime: '',
      location: '',
      notes: ''
    })
  }

  const handleArchiveChartDelete = (folderId, chartId) => {
    setArchiveFolders(prevFolders =>
      prevFolders.map(folder =>
        folder.id === folderId
          ? { ...folder, charts: folder.charts.filter(chart => chart.id !== chartId) }
          : folder
      )
    )
  }

  const handleArchiveFolderExport = (folder) => {
    alert(`Файл экспорта для папки "${folder.name}" готовится`)
  }

  // Обработчики для управления уроками
  const handleLessonChange = (e) => {
    const { name, value } = e.target
    setLessonFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreateLesson = () => {
    setIsEditingLesson(true)
    setEditingLessonId(null)
    setLessonFormData({
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      price: '',
      priceUSD: '',
      priceEUR: '',
      duration: '',
      durationEn: '',
      category: 'basics',
      categoryName: 'Основы',
      categoryNameEn: 'Basics',
      image: '📚'
    })
  }

  const handleEditLesson = (lecture) => {
    setIsEditingLesson(true)
    setEditingLessonId(lecture.id)
    setLessonFormData({
      title: lecture.title || '',
      titleEn: lecture.titleEn || '',
      description: lecture.description || '',
      descriptionEn: lecture.descriptionEn || '',
      price: lecture.price || '',
      priceUSD: lecture.priceUSD || '',
      priceEUR: lecture.priceEUR || '',
      duration: lecture.duration || '',
      durationEn: lecture.durationEn || '',
      category: lecture.category || 'basics',
      categoryName: lecture.categoryName || 'Основы',
      categoryNameEn: lecture.categoryNameEn || 'Basics',
      image: lecture.image || '📚'
    })
  }

  const handleSaveLesson = () => {
    if (!user) {
      setLessonMessage('Ошибка: пользователь не найден')
      setTimeout(() => setLessonMessage(''), 3000)
      return
    }

    if (!lessonFormData.title || !lessonFormData.description || !lessonFormData.price) {
      setLessonMessage('Заполните все обязательные поля (название, описание, цена)')
      setTimeout(() => setLessonMessage(''), 3000)
      return
    }

    try {
      const lessonData = {
        title: lessonFormData.title.trim(),
        titleEn: lessonFormData.titleEn.trim() || lessonFormData.title.trim(),
        description: lessonFormData.description.trim(),
        descriptionEn: lessonFormData.descriptionEn.trim() || lessonFormData.description.trim(),
        author: user.name,
        authorId: user.id,
        authorSpecialty: 'Астролог',
        price: parseInt(lessonFormData.price) || 0,
        priceUSD: parseInt(lessonFormData.priceUSD) || Math.round(parseInt(lessonFormData.price) / 90),
        priceEUR: parseInt(lessonFormData.priceEUR) || Math.round(parseInt(lessonFormData.price) / 95),
        duration: lessonFormData.duration.trim() || '1 час',
        durationEn: lessonFormData.durationEn.trim() || '1 hour',
        category: lessonFormData.category,
        categoryName: lessonFormData.categoryName,
        categoryNameEn: lessonFormData.categoryNameEn,
        image: lessonFormData.image || '📚',
        rating: 0,
        reviews: 0
      }

      if (editingLessonId) {
        updateLecture(editingLessonId, lessonData)
        setLessonMessage('Урок успешно обновлен!')
      } else {
        addLecture(lessonData)
        setLessonMessage('Урок успешно создан!')
      }

      setIsEditingLesson(false)
      setEditingLessonId(null)
      setTimeout(() => setLessonMessage(''), 3000)
    } catch (error) {
      console.error('Ошибка при сохранении урока:', error)
      setLessonMessage('Ошибка при сохранении урока')
      setTimeout(() => setLessonMessage(''), 3000)
    }
  }

  const handleDeleteLesson = (lectureId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот урок?')) {
      try {
        deleteLecture(lectureId)
        setLessonMessage('Урок успешно удален!')
        setTimeout(() => setLessonMessage(''), 3000)
      } catch (error) {
        console.error('Ошибка при удалении урока:', error)
        setLessonMessage('Ошибка при удалении урока')
        setTimeout(() => setLessonMessage(''), 3000)
      }
    }
  }

  const handleCancelLesson = () => {
    setIsEditingLesson(false)
    setEditingLessonId(null)
    setLessonFormData({
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      price: '',
      priceUSD: '',
      priceEUR: '',
      duration: '',
      durationEn: '',
      category: 'basics',
      categoryName: 'Основы',
      categoryNameEn: 'Basics',
      image: '📚'
    })
  }

  const categoryOptions = [
    { value: 'basics', name: 'Основы', nameEn: 'Basics' },
    { value: 'tarot', name: 'Таро', nameEn: 'Tarot' },
    { value: 'numerology', name: 'Нумерология', nameEn: 'Numerology' },
    { value: 'advanced', name: 'Продвинутый уровень', nameEn: 'Advanced' }
  ]

  const renderLessonsTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'white', marginBottom: '20px' }}>Управление уроками</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!isEditingLesson && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/school')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                title="Посмотреть уроки в разделе Школа"
              >
                <FaExternalLinkAlt />
                Перейти в Школу
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleCreateLesson}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: '#6c757d',
                  color: 'white',
                  borderColor: '#6c757d'
                }}
              >
                <FaPlus />
                Создать урок
              </button>
            </>
          )}
        </div>
      </div>

      {lessonMessage && (
        <div className={`message ${lessonMessage.includes('успешно') || lessonMessage.includes('success') ? 'success' : 'error'}`} style={{ marginBottom: '20px' }}>
          {lessonMessage}
        </div>
      )}

      {isEditingLesson ? (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>
            {editingLessonId ? 'Редактировать урок' : 'Создать новый урок'}
          </h3>
          
          <div className="form-group">
            <label>Название урока (RU) *</label>
            <input
              type="text"
              name="title"
              value={lessonFormData.title}
              onChange={handleLessonChange}
              placeholder="Введите название урока"
            />
          </div>

          <div className="form-group">
            <label>Название урока (EN)</label>
            <input
              type="text"
              name="titleEn"
              value={lessonFormData.titleEn}
              onChange={handleLessonChange}
              placeholder="Enter lesson title"
            />
          </div>

          <div className="form-group">
            <label>Описание (RU) *</label>
            <textarea
              name="description"
              value={lessonFormData.description}
              onChange={handleLessonChange}
              placeholder="Введите описание урока"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Описание (EN)</label>
            <textarea
              name="descriptionEn"
              value={lessonFormData.descriptionEn}
              onChange={handleLessonChange}
              placeholder="Enter lesson description"
              rows="4"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Цена (₽) *</label>
              <input
                type="number"
                name="price"
                value={lessonFormData.price}
                onChange={handleLessonChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Цена (USD)</label>
              <input
                type="number"
                name="priceUSD"
                value={lessonFormData.priceUSD}
                onChange={handleLessonChange}
                placeholder="Авто"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Цена (EUR)</label>
              <input
                type="number"
                name="priceEUR"
                value={lessonFormData.priceEUR}
                onChange={handleLessonChange}
                placeholder="Авто"
                min="0"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Длительность (RU)</label>
              <input
                type="text"
                name="duration"
                value={lessonFormData.duration}
                onChange={handleLessonChange}
                placeholder="Например: 2 часа"
              />
            </div>

            <div className="form-group">
              <label>Длительность (EN)</label>
              <input
                type="text"
                name="durationEn"
                value={lessonFormData.durationEn}
                onChange={handleLessonChange}
                placeholder="For example: 2 hours"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Категория</label>
            <select
              name="category"
              value={lessonFormData.category}
              onChange={(e) => {
                const selected = categoryOptions.find(opt => opt.value === e.target.value)
                if (selected) {
                  setLessonFormData(prev => ({
                    ...prev,
                    category: e.target.value,
                    categoryName: selected.name,
                    categoryNameEn: selected.nameEn
                  }))
                }
              }}
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Эмодзи/Иконка</label>
            <input
              type="text"
              name="image"
              value={lessonFormData.image}
              onChange={handleLessonChange}
              placeholder="📚"
              maxLength="2"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              className="btn btn-primary"
              onClick={handleSaveLesson}
            >
              <FaSave />
              Сохранить урок
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCancelLesson}
            >
              <FaTimes />
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <>
          {myLectures.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {myLectures.map(lecture => (
                <div
                  key={lecture.id}
                  className="card"
                >
                  <div style={{
                    fontSize: '3rem',
                    textAlign: 'center',
                    marginBottom: '15px'
                  }}>
                    {lecture.image || '📚'}
                  </div>
                  
                  <h3 style={{ color: '#333', marginBottom: '10px' }}>
                    {lecture.title}
                  </h3>
                  
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
                    {lecture.description?.substring(0, 100)}...
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <span style={{ color: '#ffc107', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {lecture.price} ₽
                    </span>
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>
                      {lecture.duration}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '10px'
                  }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEditLesson(lecture)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px'
                      }}
                    >
                      <FaEdit />
                      Редактировать
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDeleteLesson(lecture.id)}
                      style={{
                        background: '#d32f2f',
                        color: 'white',
                        border: 'none',
                        padding: '10px 15px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666'
            }}>
              <FaBook style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.5 }} />
              <p>У вас пока нет созданных уроков</p>
              <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                Создайте свой первый урок для продажи в разделе "Школа"
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )

  const renderProfileTab = () => (
    <div>
      <div className="card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#333', margin: 0 }}>
            {translate('Информация профиля', 'Profile Information')}
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`btn ${isEditing ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            >
              {isEditing ? translate('Сохранить', 'Save') : translate('Редактировать', 'Edit')}
            </button>
            
                         {/* Кнопка отладки */}
             <button
               onClick={() => {
                 console.log('=== ОТЛАДКА КАБИНЕТА АСТРОЛОГА ===')
                 console.log('Пользователь:', user)
                 console.log('Профиль:', profile)
                 console.log('localStorage user:', localStorage.getItem('user'))
                 console.log('localStorage specialists:', localStorage.getItem('specialists'))
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
               {translate('🧪 ОТЛАДКА', '🧪 DEBUG')}
             </button>
             
                           {/* Кнопка удаления профиля */}
              <button
                onClick={handleDeleteProfile}
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
                <FaTrash style={{ marginRight: '4px' }} />
                {translate('УДАЛИТЬ ПРОФИЛЬ', 'DELETE PROFILE')}
              </button>
              

          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label>{translate('Имя', 'Name')}</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleProfileUpdate('name', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>{translate('Специализация', 'Specialty')}</label>
            <input
              type="text"
              value={profile.specialty}
              onChange={(e) => handleProfileUpdate('specialty', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>{translate('Опыт работы', 'Experience')}</label>
            <input
              type="text"
              value={profile.experience}
              onChange={(e) => handleProfileUpdate('experience', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>{translate('Стоимость (₽/час)', 'Rate (₽/hour)')}</label>
            <input
              type="number"
              value={profile.price}
              onChange={(e) => handleProfileUpdate('price', parseInt(e.target.value))}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '20px' }}>
          <label>{translate('Описание', 'Description')}</label>
          <textarea
            value={profile.description}
            onChange={(e) => handleProfileUpdate('description', e.target.value)}
            disabled={!isEditing}
            rows="4"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div className="form-group">
            <label>{translate('Языки (через запятую)', 'Languages (comma-separated)')}</label>
            <input
              type="text"
              value={profile.languages.join(', ')}
              onChange={(e) => handleProfileUpdate('languages', e.target.value.split(', ').filter(l => l.trim()))}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>{translate('Услуги (через запятую)', 'Services (comma-separated)')}</label>
            <input
              type="text"
              value={profile.services.join(', ')}
              onChange={(e) => handleProfileUpdate('services', e.target.value.split(', ').filter(s => s.trim()))}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Социальные сети */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#333', margin: 0 }}>
            {translate('Ссылки на социальные сети', 'Social media links')}
          </h3>
          <button className="btn btn-gray" onClick={handleSocialLinkAdd}>
            {translate('Добавить ссылку', 'Add link')}
          </button>
        </div>

        <p style={{ color: '#666', marginBottom: '20px' }}>
          {translate(
            'Разместите ссылки на ваши социальные сети, YouTube канал и мессенджеры для привлечения клиентов',
            'Share your social media, YouTube channel, and messengers to attract clients'
          )}
        </p>

        {socialLinks.map((link) => (
          <div key={link.id} style={{ 
            display: 'grid', 
            gridTemplateColumns: 'auto 1fr 1fr auto', 
            gap: '15px', 
            alignItems: 'center',
            padding: '15px',
            border: '1px solid #e1e5e9',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            <div style={{ 
              fontSize: '24px', 
              color: getPlatformColor(link.platform),
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {getPlatformIcon(link.platform)}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <select
                value={link.platform}
                onChange={(e) => handleSocialLinkUpdate(link.id, 'platform', e.target.value)}
                style={{ margin: 0 }}
              >
                {platforms.map(platform => (
                  <option key={platform.key} value={platform.key}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <input
                type="text"
                placeholder={translate('URL ссылки', 'Link URL')}
                value={link.url}
                onChange={(e) => handleSocialLinkUpdate(link.id, 'url', e.target.value)}
                style={{ margin: 0 }}
              />
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => handleSocialLinkDelete(link.id)}
              style={{ padding: '8px 12px', fontSize: '14px' }}
            >
              <FaTrash />
            </button>
          </div>
        ))}

        {socialLinks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
            <p>Добавьте ссылки на ваши социальные сети для привлечения клиентов</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderConsultationsTab = () => (
    <div>
      <h2 style={{ color: 'white', marginBottom: '20px' }}>Мои консультации</h2>
      
      {consultations.length > 0 ? (
        consultations.map(consultation => (
          <div key={consultation.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ marginBottom: '10px' }}>
                  {consultation.type === 'group' ? 'Групповая консультация' : 'Индивидуальная консультация'}
                </h3>
                <p style={{ color: '#666', marginBottom: '8px' }}>
                  <strong>Клиент:</strong> {consultation.clientName}
                </p>
                <p style={{ color: '#666', marginBottom: '8px' }}>
                  <strong>Дата и время:</strong> {consultation.date} в {consultation.time}
                </p>
                <p style={{ color: '#666', marginBottom: '8px' }}>
                  <strong>Длительность:</strong> {consultation.duration} минут
                </p>
                {consultation.language && (
                  <p style={{ color: '#666', marginBottom: '8px' }}>
                    <strong>Язык:</strong> {consultation.language === 'ru' ? 'Русский' : consultation.language === 'en' ? 'English' : consultation.language}
                  </p>
                )}
                {consultation.phoneNumber && (
                  <p style={{ color: '#666', marginBottom: '8px' }}>
                    <strong>Телефон:</strong> {consultation.phoneNumber}
                  </p>
                )}
                {consultation.finalPrice && (
                  <p style={{ color: '#666', marginBottom: '8px' }}>
                    <strong>Стоимость:</strong> {consultation.finalPrice} ₽
                    {consultation.promoCode && <span style={{ color: '#28a745', marginLeft: '10px' }}>(Промокод: {consultation.promoCode})</span>}
                  </p>
                )}
                {consultation.notes && (
                  <p style={{ color: '#666', marginBottom: '8px' }}>
                    <strong>Примечания:</strong> {consultation.notes}
                  </p>
                )}
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: consultation.status === 'pending' ? '#ff9800' : consultation.status === 'upcoming' ? '#ffc107' : consultation.status === 'completed' ? '#28a745' : '#6c757d',
                  color: 'white'
                }}>
                  {consultation.status === 'pending' ? 'Ожидает подтверждения' : consultation.status === 'upcoming' ? 'Предстоит' : consultation.status === 'completed' ? 'Завершена' : 'Отменена'}
                </span>
              </div>
            </div>
            
            {consultation.status === 'pending' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ background: '#28a745', borderColor: '#28a745' }}
                  onClick={() => handleConfirmBooking(consultation.id)}
                >
                  <FaCheck style={{ marginRight: '8px' }} />
                  Принять
                </button>
                <button 
                  className="btn btn-secondary"
                  style={{ background: '#dc3545', borderColor: '#dc3545', color: 'white' }}
                  onClick={() => handleCancelBooking(consultation.id)}
                >
                  <FaBan style={{ marginRight: '8px' }} />
                  Отменить
                </button>
              </div>
            )}
            
            {consultation.status === 'upcoming' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" style={{ background: '#6c757d', borderColor: '#6c757d' }}>
                  <FaVideo style={{ marginRight: '8px' }} />
                  Начать консультацию
                </button>
                <button className="btn btn-secondary" style={{ border: '1px solid #667eea', color: '#667eea', background: 'transparent' }}>
                  Перенести
                </button>
                <button 
                  className="btn btn-secondary"
                  style={{ border: '1px solid #dc3545', color: '#dc3545', background: 'transparent' }}
                  onClick={() => handleCancelBooking(consultation.id)}
                >
                  <FaBan style={{ marginRight: '8px' }} />
                  Отменить
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ color: '#666', marginBottom: '20px' }}>У вас пока нет запланированных консультаций</h3>
          <p style={{ color: '#666' }}>Клиенты смогут записаться к вам через главную страницу сайта</p>
        </div>
      )}
    </div>
  )

  const renderScheduleTab = () => (
    <div>
      <h2 style={{ color: 'white', marginBottom: '20px' }}>Расписание работы</h2>
      
      <div className="card">
        <h3 style={{ marginBottom: '20px', color: '#333' }}>Настройка рабочего времени</h3>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          {schedule.map((day, index) => (
            <div key={index} style={{
              display: 'grid',
              gridTemplateColumns: '150px 100px 100px 100px auto',
              gap: '15px',
              alignItems: 'center',
              padding: '15px',
              border: '1px solid #e1e5e9',
              borderRadius: '8px'
            }}>
              <span style={{ fontWeight: '600' }}>{day.day}</span>
              
              <input
                type="time"
                value={day.start}
                onChange={(e) => {
                  const newSchedule = [...schedule]
                  newSchedule[index].start = e.target.value
                  setSchedule(newSchedule)
                }}
                style={{ padding: '8px', border: '1px solid #e1e5e9', borderRadius: '4px' }}
              />
              
              <input
                type="time"
                value={day.end}
                onChange={(e) => {
                  const newSchedule = [...schedule]
                  newSchedule[index].end = e.target.value
                  setSchedule(newSchedule)
                }}
                style={{ padding: '8px', border: '1px solid #e1e5e9', borderRadius: '4px' }}
              />
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={day.available}
                  onChange={(e) => {
                    const newSchedule = [...schedule]
                    newSchedule[index].available = e.target.checked
                    setSchedule(newSchedule)
                  }}
                />
                Работаю
              </label>
            </div>
          ))}
        </div>
        
        <button className="btn btn-primary" style={{ marginTop: '20px', background: '#6c757d', borderColor: '#6c757d' }}>
          Сохранить расписание
        </button>
      </div>
    </div>
  )

  const renderNewsTab = () => (
    <div>
      <h2 style={{ color: 'white', marginBottom: '20px' }}>Лента новостей</h2>

      <div className="card" style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '20px', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaNewspaper />
          {editingPostId ? 'Редактировать публикацию' : 'Создать новость'}
        </h3>

        <form onSubmit={handlePostSubmit}>
          <div className="form-group">
            <label>Заголовок</label>
            <input
              type="text"
              value={postForm.title}
              onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              placeholder="Например, «Прогноз на декабрь»"
            />
          </div>

          <div className="form-group">
            <label>Изображение (необязательно)</label>
            <input
              type="url"
              value={postForm.imageUrl}
              onChange={(e) => setPostForm({ ...postForm, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>Текст новости</label>
            <textarea
              rows="6"
              value={postForm.content}
              onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
              placeholder="Поделитесь важными новостями, прогнозами или приглашением на эфир"
            />
          </div>

          {postError && (
            <div style={{ background: '#fdecea', color: '#c62828', padding: '10px 14px', borderRadius: '8px', marginBottom: '15px' }}>
              {postError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={isSavingPost}>
              {isSavingPost ? 'Сохраняем...' : editingPostId ? 'Обновить' : 'Опубликовать'}
            </button>
            {editingPostId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetPostForm}
                disabled={isSavingPost}
              >
                Отменить редактирование
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '20px', color: '#333' }}>Мои публикации</h3>
        {newsLoading && <p style={{ color: '#666' }}>Загружаем публикации…</p>}
        {newsError && (
          <p style={{ color: '#d32f2f' }}>
            {newsError}
          </p>
        )}
        {!newsLoading && !newsError && myPosts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            У вас пока нет новостей. Поделитесь чем-то важным с клиентами!
          </div>
        )}

        {!newsLoading && !newsError && myPosts.length > 0 && (
          <div className="news-grid">
            {myPosts.map(post => (
              <div key={post.id} className="news-card" style={{ position: 'relative' }}>
                {post.localOnly && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#fff3cd',
                    color: '#856404',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    zIndex: 10,
                    border: '1px solid #ffc107'
                  }} title="Новость сохранена локально и будет синхронизирована с сервером автоматически">
                    <FaCloudUploadAlt />
                    <span>Локально</span>
                  </div>
                )}
                <div className="news-card__header">
                  <div>
                    <p className="news-card__author">{post.title}</p>
                    <p className="news-card__date">
                      {new Date(post.updatedAt || post.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px' }}
                      onClick={() => handleEditPost(post)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', background: '#ffeaea', color: '#d32f2f', border: 'none' }}
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {post.imageUrl && (
                  <div className="news-card__image-wrapper">
                    <img src={post.imageUrl} alt={post.title} className="news-card__image" />
                  </div>
                )}

                <p className="news-card__content">{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const handleAddStoreProduct = (productData) => {
    if (!user) {
      alert('Сначала войдите в аккаунт')
      return
    }
    addProductToStore({
      ...productData,
      ownerId: user.id,
      ownerName: profile.name,
      ownerAvatar: user.profileImage || ''
    })
  }

  const handleUpdateStoreProduct = (productData) => {
    updateProductInStore({
      ...productData,
      ownerId: productData.ownerId || user?.id,
      ownerName: productData.ownerName || profile.name,
      ownerAvatar: productData.ownerAvatar || user?.profileImage || ''
    })
  }

  const handleDeleteStoreProduct = (productId) => {
    if (!window.confirm('Удалить товар?')) return
    deleteProductFromStore(productId)
  }

  const renderStoreTab = () => (
    <div>
      <h2 style={{ color: 'white', marginBottom: '20px' }}>Мои товары</h2>
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '10px', color: '#333' }}>Статистика магазина</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 180px' }}>
            <p style={{ margin: 0, color: '#666' }}>Всего товаров</p>
            <strong style={{ fontSize: '1.5rem' }}>{myStoreStats?.total || myProducts.length}</strong>
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <p style={{ margin: 0, color: '#666' }}>В наличии</p>
            <strong style={{ fontSize: '1.5rem', color: '#27ae60' }}>{myStoreStats?.inStock || myProducts.filter(p => p.inStock).length}</strong>
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <p style={{ margin: 0, color: '#666' }}>Нет в наличии</p>
            <strong style={{ fontSize: '1.5rem', color: '#e74c3c' }}>{myStoreStats?.outOfStock || myProducts.filter(p => !p.inStock).length}</strong>
          </div>
        </div>
      </div>

      <ProductAdmin
        products={myProducts}
        onAddProduct={handleAddStoreProduct}
        onUpdateProduct={handleUpdateStoreProduct}
        onDeleteProduct={handleDeleteStoreProduct}
        owner={
          user
            ? {
                id: user.id,
                name: profile.name,
                profileImage: user.profileImage
              }
            : null
        }
      />
    </div>
  )

  const renderArchiveTab = () => (
    <div>
      <h2 style={{ color: 'white', marginBottom: '20px' }}>Архив клиентов и натальных карт</h2>

      <div className="card" style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaFolderPlus color="#8b5cf6" />
          Создать папку
        </h3>
        <form onSubmit={handleArchiveFolderCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '20px' }}>
            <div className="form-group">
              <label>Название папки</label>
              <input
                type="text"
                value={newArchiveFolder.name}
                onChange={(e) => setNewArchiveFolder({ ...newArchiveFolder, name: e.target.value })}
                placeholder="Например, «Постоянные клиенты»"
                required
              />
            </div>
            <div className="form-group">
              <label>Цвет</label>
              <input
                type="color"
                value={newArchiveFolder.color}
                onChange={(e) => setNewArchiveFolder({ ...newArchiveFolder, color: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '15px' }}>
            <label>Описание (необязательно)</label>
            <textarea
              value={newArchiveFolder.description}
              onChange={(e) => setNewArchiveFolder({ ...newArchiveFolder, description: e.target.value })}
              placeholder="Добавьте краткую заметку о содержимом"
              rows="2"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>
            <FaPlus style={{ marginRight: '8px' }} />
            Сохранить папку
          </button>
        </form>
      </div>

      {archiveFolders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>Пока нет сохранённых папок</h3>
          <p style={{ color: '#666' }}>Создайте папку, чтобы фиксировать натальные карты и заметки клиентов</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'flex-start' }}>
          <div>
            <h4 style={{ color: '#333', marginBottom: '15px' }}>Мои папки</h4>
            <div className="specialists-grid" style={{ gridTemplateColumns: '1fr', gap: '15px' }}>
              {archiveFolders.map(folder => (
                <div
                  key={folder.id}
                  className="specialist-card"
                  style={{
                    borderColor: folder.id === selectedArchiveFolderId ? folder.color : '#e1e5e9',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedArchiveFolderId(folder.id)}
                >
                  <div className="specialist-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 className="specialist-name" style={{ color: folder.color }}>
                          <FaFolderOpen style={{ marginRight: '8px' }} />
                          {folder.name}
                        </h3>
                        <p style={{ color: '#666', marginBottom: '5px' }}>
                          Материалов: {folder.charts.length}
                        </p>
                        {folder.description && (
                          <p style={{ color: '#999', fontSize: '13px' }}>
                            {folder.description}
                          </p>
                        )}
                        <p style={{ color: '#aaa', fontSize: '12px', marginTop: '8px' }}>
                          Создано: {new Date(folder.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ background: '#eef2ff', color: folder.color, border: 'none', padding: '6px 10px' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleArchiveFolderExport(folder)
                          }}
                        >
                          <FaDownload />
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ background: '#ffeaea', color: '#d9534f', border: 'none', padding: '6px 10px' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleArchiveFolderDelete(folder.id)
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {selectedArchiveFolder ? (
              <div className="card">
                <h3 style={{ marginBottom: '15px', color: selectedArchiveFolder.color }}>
                  <FaFolderOpen style={{ marginRight: '8px' }} />
                  {selectedArchiveFolder.name}
                </h3>

                <form onSubmit={handleArchiveChartCreate} style={{ marginBottom: '25px' }}>
                  <h4 style={{ color: '#333', marginBottom: '10px' }}>Добавить натальную карту или консультацию</h4>
                  <div className="form-group">
                    <label>Имя клиента / название кейса</label>
                    <input
                      type="text"
                      value={archiveChartForm.title}
                      onChange={(e) => setArchiveChartForm({ ...archiveChartForm, title: e.target.value })}
                      placeholder="Например, «Анна · апрельский прогноз»"
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                    <div className="form-group">
                      <label>Дата рождения</label>
                      <input
                        type="date"
                        value={archiveChartForm.birthDate}
                        onChange={(e) => setArchiveChartForm({ ...archiveChartForm, birthDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Время (если известно)</label>
                      <input
                        type="time"
                        value={archiveChartForm.birthTime}
                        onChange={(e) => setArchiveChartForm({ ...archiveChartForm, birthTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Место</label>
                    <input
                      type="text"
                      value={archiveChartForm.location}
                      onChange={(e) => setArchiveChartForm({ ...archiveChartForm, location: e.target.value })}
                      placeholder="Город, страна"
                    />
                  </div>
                  <div className="form-group">
                    <label>Заметки</label>
                    <textarea
                      value={archiveChartForm.notes}
                      onChange={(e) => setArchiveChartForm({ ...archiveChartForm, notes: e.target.value })}
                      placeholder="Результаты консультации, ссылки на расчеты, чек-листы"
                      rows="3"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    <FaFileAlt style={{ marginRight: '8px' }} />
                    Сохранить в архив
                  </button>
                </form>

                <div>
                  <h4 style={{ color: '#333', marginBottom: '15px' }}>Сохранённые материалы</h4>
                  {selectedArchiveFolder.charts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9ff', borderRadius: '8px', color: '#666' }}>
                      Пока нет сохранённых записей
                    </div>
                  ) : (
                    <div className="specialists-grid" style={{ gridTemplateColumns: '1fr', gap: '15px' }}>
                      {selectedArchiveFolder.charts.map(chart => (
                        <div key={chart.id} className="specialist-card">
                          <div className="specialist-info">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <h3 className="specialist-name" style={{ color: selectedArchiveFolder.color }}>
                                  <FaFileAlt style={{ marginRight: '8px' }} />
                                  {chart.title}
                                </h3>
                                <p style={{ color: '#666', marginBottom: '5px' }}>
                                  <strong>Дата:</strong> {new Date(chart.birthDate).toLocaleDateString('ru-RU')}
                                </p>
                                {chart.birthTime && (
                                  <p style={{ color: '#666', marginBottom: '5px' }}>
                                    <strong>Время:</strong> {chart.birthTime}
                                  </p>
                                )}
                                {chart.location && (
                                  <p style={{ color: '#666', marginBottom: '5px' }}>
                                    <strong>Место:</strong> {chart.location}
                                  </p>
                                )}
                                {chart.notes && (
                                  <p style={{ color: '#666', marginTop: '8px', whiteSpace: 'pre-line' }}>
                                    {chart.notes}
                                  </p>
                                )}
                                <p style={{ color: '#aaa', fontSize: '12px', marginTop: '10px' }}>
                                  Добавлено: {new Date(chart.createdAt).toLocaleString('ru-RU')}
                                </p>
                              </div>
                              <button
                                className="btn btn-secondary"
                                style={{ background: '#ffeaea', color: '#d9534f', border: 'none' }}
                                onClick={() => handleArchiveChartDelete(selectedArchiveFolder.id, chart.id)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ color: '#666' }}>Выберите папку слева, чтобы просмотреть содержимое</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <div className="dashboard-overlay" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: 'white', fontSize: '3rem', marginBottom: 0 }}>
            {translate('Кабинет астролога', 'Astrologer Dashboard')}
          </h1>
        </div>
        
        <div className="card" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt="Profile" 
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #667eea'
                }}
              />
            ) : (
              <div style={{ 
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                border: '3px solid #667eea'
              }}>
                <FaUser />
              </div>
            )}
            <div>
              <h2 style={{ margin: 0, color: '#333' }}>
                {translate('Добро пожаловать', 'Welcome')}, {profile.name}!
              </h2>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                {translate('Управляйте своим профилем и расписанием', 'Manage your profile and schedule')}
              </p>
            </div>
          </div>
        </div>

        {/* Табы */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
            style={activeTab === 'profile' ? { background: '#2196F3', borderColor: '#2196F3' } : {}}
            onClick={() => setActiveTab('profile')}
          >
            <FaEdit style={{ marginRight: '8px' }} />
            {translate('Профиль', 'Profile')}
          </button>
          <button
            className={`btn ${activeTab === 'consultations' ? 'btn-primary' : 'btn-secondary'}`}
            style={activeTab === 'consultations' ? { background: '#2196F3', borderColor: '#2196F3' } : {}}
            onClick={() => setActiveTab('consultations')}
          >
            <FaVideo style={{ marginRight: '8px' }} />
            {translate('Консультации', 'Consultations')}
          </button>
          <button
            className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
            style={activeTab === 'schedule' ? { background: '#2196F3', borderColor: '#2196F3' } : {}}
            onClick={() => setActiveTab('schedule')}
          >
            <FaCalendarAlt style={{ marginRight: '8px' }} />
            {translate('Расписание', 'Schedule')}
          </button>
          <button
            className={`btn ${activeTab === 'news' ? 'btn-primary' : 'btn-secondary'}`}
            style={activeTab === 'news' ? { background: '#2196F3', borderColor: '#2196F3' } : {}}
            onClick={() => setActiveTab('news')}
          >
            <FaNewspaper style={{ marginRight: '8px' }} />
            {translate('Новости', 'News')}
          </button>
          <button
            className={`btn ${activeTab === 'store' ? 'btn-primary' : 'btn-secondary'}`}
            style={activeTab === 'store' ? { background: '#2196F3', borderColor: '#2196F3' } : {}}
            onClick={() => setActiveTab('store')}
          >
            <FaShoppingBag style={{ marginRight: '8px' }} />
            {translate('Магазин', 'Store')}
          </button>
          <button
            className={`btn ${activeTab === 'lessons' ? 'btn-primary' : 'btn-secondary'}`}
            style={activeTab === 'lessons' ? { background: '#2196F3', borderColor: '#2196F3' } : {}}
            onClick={() => setActiveTab('lessons')}
          >
            <FaBook style={{ marginRight: '8px' }} />
            {translate('Уроки', 'Lessons')}
          </button>
          <button
            className={`btn ${activeTab === 'archive' ? 'btn-primary' : 'btn-secondary'}`}
            style={activeTab === 'archive' ? { background: '#2196F3', borderColor: '#2196F3' } : {}}
            onClick={() => setActiveTab('archive')}
          >
            <FaFolder style={{ marginRight: '8px' }} />
            {translate('Архив', 'Archive')}
          </button>
        </div>

        {/* Содержимое табов */}
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'consultations' && renderConsultationsTab()}
        {activeTab === 'schedule' && renderScheduleTab()}
        {activeTab === 'news' && renderNewsTab()}
        {activeTab === 'store' && renderStoreTab()}
        {activeTab === 'lessons' && renderLessonsTab()}
        {activeTab === 'archive' && renderArchiveTab()}
      </div>
    </div>
  )
}

export default AstrologerDashboard
