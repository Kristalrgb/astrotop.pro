import React, { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'astrology-school-lectures'

const LecturesContext = createContext()

export const useLectures = () => {
  const context = useContext(LecturesContext)
  if (!context) {
    throw new Error('useLectures must be used within a LecturesProvider')
  }
  return context
}

export const LecturesProvider = ({ children }) => {
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Загружаем лекции из localStorage при инициализации
  useEffect(() => {
    try {
      console.log('LecturesContext: Инициализация контекста лекций')
      const savedLectures = localStorage.getItem(STORAGE_KEY)
      if (savedLectures) {
        try {
          const parsedLectures = JSON.parse(savedLectures)
          console.log('LecturesContext: Загружены лекции из localStorage:', parsedLectures)
          const normalized = parsedLectures.filter(Boolean)
          setLectures(normalized)
        } catch (error) {
          console.error('Ошибка загрузки лекций:', error)
          setError('Ошибка загрузки лекций из localStorage')
          loadDefaultLectures()
        }
      } else {
        console.log('LecturesContext: Лекции не найдены в localStorage, загружаем по умолчанию')
        loadDefaultLectures()
      }
    } catch (error) {
      console.error('Критическая ошибка в LecturesContext:', error)
      setError('Критическая ошибка загрузки лекций')
      loadDefaultLectures()
    } finally {
      setLoading(false)
    }
  }, [])

  // Сохраняем лекции в localStorage при изменении
  useEffect(() => {
    if (!loading) {
      console.log('LecturesContext: Сохраняем лекции в localStorage:', lectures)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lectures))
    }
  }, [lectures, loading])

  const loadDefaultLectures = () => {
    console.log('LecturesContext: Загружаем лекции по умолчанию')
    const defaultLectures = [
      {
        id: 1,
        title: 'Введение в астрологию',
        titleEn: 'Introduction to Astrology',
        description: 'Базовый курс по астрологии для начинающих. Изучите основы знаков зодиака, планет и домов.',
        descriptionEn: 'Basic astrology course for beginners. Learn the basics of zodiac signs, planets and houses.',
        author: 'Елена Петрова',
        authorId: 1,
        authorSpecialty: 'Астролог',
        price: 2500,
        priceUSD: 28,
        priceEUR: 26,
        duration: '2 часа',
        durationEn: '2 hours',
        rating: 4.8,
        reviews: 45,
        image: '📚',
        category: 'basics',
        categoryName: 'Основы',
        categoryNameEn: 'Basics',
        purchased: false
      },
      {
        id: 2,
        title: 'Таро для начинающих',
        titleEn: 'Tarot for Beginners',
        description: 'Научитесь читать карты Таро с нуля. Полное руководство по работе с колодой Райдера-Уэйта.',
        descriptionEn: 'Learn to read Tarot cards from scratch. Complete guide to working with the Rider-Waite deck.',
        author: 'Михаил Сидоров',
        authorId: 2,
        authorSpecialty: 'Таролог',
        price: 3000,
        priceUSD: 34,
        priceEUR: 32,
        duration: '3 часа',
        durationEn: '3 hours',
        rating: 4.9,
        reviews: 67,
        image: '🃏',
        category: 'tarot',
        categoryName: 'Таро',
        categoryNameEn: 'Tarot',
        purchased: false
      },
      {
        id: 3,
        title: 'Натальная карта: чтение и интерпретация',
        titleEn: 'Natal Chart: Reading and Interpretation',
        description: 'Углубленный курс по работе с натальными картами. Научитесь составлять и читать карты рождения.',
        descriptionEn: 'Advanced course on working with natal charts. Learn to create and read birth charts.',
        author: 'Анна Козлова',
        authorId: 3,
        authorSpecialty: 'Астролог-нумеролог',
        price: 4500,
        priceUSD: 51,
        priceEUR: 48,
        duration: '4 часа',
        durationEn: '4 hours',
        rating: 4.7,
        reviews: 32,
        image: '🌟',
        category: 'advanced',
        categoryName: 'Продвинутый уровень',
        categoryNameEn: 'Advanced',
        purchased: false
      },
      {
        id: 4,
        title: 'Нумерология: секреты чисел',
        titleEn: 'Numerology: Secrets of Numbers',
        description: 'Изучите влияние чисел на судьбу человека. Практические техники расчета и интерпретации.',
        descriptionEn: 'Study the influence of numbers on human destiny. Practical calculation and interpretation techniques.',
        author: 'Анна Козлова',
        authorId: 3,
        authorSpecialty: 'Астролог-нумеролог',
        price: 3500,
        priceUSD: 40,
        priceEUR: 38,
        duration: '3.5 часа',
        durationEn: '3.5 hours',
        rating: 4.6,
        reviews: 28,
        image: '🔢',
        category: 'numerology',
        categoryName: 'Нумерология',
        categoryNameEn: 'Numerology',
        purchased: false
      },
      {
        id: 5,
        title: 'Прогнозирование в астрологии',
        titleEn: 'Forecasting in Astrology',
        description: 'Научитесь делать точные прогнозы на основе астрологических транзитов и прогрессий.',
        descriptionEn: 'Learn to make accurate predictions based on astrological transits and progressions.',
        author: 'Елена Петрова',
        authorId: 1,
        authorSpecialty: 'Астролог',
        price: 5000,
        priceUSD: 57,
        priceEUR: 53,
        duration: '5 часов',
        durationEn: '5 hours',
        rating: 4.9,
        reviews: 52,
        image: '🔮',
        category: 'advanced',
        categoryName: 'Продвинутый уровень',
        categoryNameEn: 'Advanced',
        purchased: false
      }
    ]
    console.log('LecturesContext: Установлены лекции по умолчанию:', defaultLectures)
    setLectures(defaultLectures)
  }

  const addLecture = (lectureData) => {
    try {
      console.log('LecturesContext: Получены данные лекции:', lectureData)
      
      const newLecture = {
        id: Date.now(),
        ...lectureData,
        purchased: false
      }
      
      setLectures(prev => [...prev, newLecture])
      console.log('LecturesContext: Лекция добавлена:', newLecture)
      return newLecture
    } catch (error) {
      console.error('Ошибка добавления лекции:', error)
      setError('Ошибка добавления лекции')
      throw error
    }
  }

  const updateLecture = (lectureId, lectureData) => {
    try {
      setLectures(prev => prev.map(lecture => 
        lecture.id === lectureId ? { ...lecture, ...lectureData } : lecture
      ))
      console.log('LecturesContext: Лекция обновлена:', lectureId)
    } catch (error) {
      console.error('Ошибка обновления лекции:', error)
      setError('Ошибка обновления лекции')
      throw error
    }
  }

  const deleteLecture = (lectureId) => {
    try {
      setLectures(prev => prev.filter(lecture => lecture.id !== lectureId))
      console.log('LecturesContext: Лекция удалена:', lectureId)
    } catch (error) {
      console.error('Ошибка удаления лекции:', error)
      setError('Ошибка удаления лекции')
      throw error
    }
  }

  const getLecture = (lectureId) => {
    return (lectures || []).find(lecture => lecture && lecture.id === lectureId)
  }

  const getLecturesByCategory = (category) => {
    if (category === 'all') return lectures || []
    return (lectures || []).filter(lecture => lecture && lecture.category === category)
  }

  const getLecturesByAuthor = (authorId) => {
    if (!authorId) return lectures || []
    return (lectures || []).filter(lecture => lecture && String(lecture.authorId) === String(authorId))
  }

  const searchLectures = (query) => {
    if (!query) return lectures || []
    return (lectures || []).filter(lecture => 
      lecture && (
        (lecture.title && lecture.title.toLowerCase().includes(query.toLowerCase())) ||
        (lecture.titleEn && lecture.titleEn.toLowerCase().includes(query.toLowerCase())) ||
        (lecture.description && lecture.description.toLowerCase().includes(query.toLowerCase())) ||
        (lecture.descriptionEn && lecture.descriptionEn.toLowerCase().includes(query.toLowerCase())) ||
        (lecture.author && lecture.author.toLowerCase().includes(query.toLowerCase()))
      )
    )
  }

  const getCategories = () => {
    const categoriesMap = new Map()
    ;(lectures || []).forEach(lecture => {
      if (lecture && lecture.category) {
        if (!categoriesMap.has(lecture.category)) {
          categoriesMap.set(lecture.category, {
            id: lecture.category,
            name: lecture.categoryName || lecture.category,
            nameEn: lecture.categoryNameEn || lecture.category,
            icon: '📚'
          })
        }
      }
    })
    return Array.from(categoriesMap.values())
  }

  const purchaseLecture = (lectureId) => {
    setLectures(prev => prev.map(lecture => 
      lecture.id === lectureId ? { ...lecture, purchased: true } : lecture
    ))
  }

  const value = {
    lectures,
    loading,
    error,
    addLecture,
    updateLecture,
    deleteLecture,
    getLecture,
    getLecturesByCategory,
    getLecturesByAuthor,
    searchLectures,
    getCategories,
    purchaseLecture
  }

  return (
    <LecturesContext.Provider value={value}>
      {children}
    </LecturesContext.Provider>
  )
}



