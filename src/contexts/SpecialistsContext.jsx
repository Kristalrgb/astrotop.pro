import React, { createContext, useContext, useState, useEffect } from 'react'

const SpecialistsContext = createContext()

export const useSpecialists = () => {
  const context = useContext(SpecialistsContext)
  if (!context) {
    throw new Error('useSpecialists must be used within a SpecialistsProvider')
  }
  return context
}

export const SpecialistsProvider = ({ children }) => {
  const [specialists, setSpecialists] = useState([])

  // Инициализация моковых данных специалистов
  useEffect(() => {
    console.log('=== ИНИЦИАЛИЗАЦИЯ СПЕЦИАЛИСТОВ ===')
    
    const mockSpecialists = [
      {
        id: 1,
        name: 'Елена Петрова',
        specialty: 'Астролог',
        rating: 4.9,
        reviews: 127,
        price: 3000,
        pricePerMinute: 50,
        experience: '15 лет',
        consultations: 127,
        languages: ['Русский', 'Английский'],
        services: ['Натальная карта', 'Синастрия', 'Прогнозы'],
        description: 'Опытный астролог с 15-летним стажем. Специализируюсь на натальной астрологии, синастрии и прогнозировании. Помогу разобраться в вашей карте рождения, понять совместимость с партнером и получить прогнозы на будущее. Работаю с клиентами по всему миру.',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=200&fit=crop&crop=face',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=200&fit=crop&crop=face',
        tags: ['Натальная карта', 'Синастрия', 'Прогнозы', 'YouTube', 'Telegram', 'WhatsApp'],
        available: true,
        isOnline: true
      },
      {
        id: 2,
        name: 'Михаил Сидоров',
        specialty: 'Таролог',
        rating: 4.8,
        reviews: 89,
        price: 2500,
        pricePerMinute: 42,
        experience: '12 лет',
        consultations: 89,
        languages: ['Русский'],
        services: ['Таро-чтение', 'Расклады', 'Предсказания'],
        description: 'Профессиональный таролог с 12-летним опытом работы. Использую классические колоды Таро для точных раскладов и предсказаний. Помогу найти ответы на важные вопросы жизни, разобраться в сложных ситуациях и увидеть возможные пути развития событий.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=face',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=face',
        tags: ['Таро-чтение', 'Расклады', 'Предсказания', 'Instagram', 'VK', 'TikTok'],
        available: true,
        isOnline: false
      },
      {
        id: 3,
        name: 'Анна Козлова',
        specialty: 'Астролог-нумеролог',
        rating: 4.7,
        reviews: 156,
        price: 3500,
        pricePerMinute: 58,
        experience: '18 лет',
        consultations: 156,
        languages: ['Русский', 'Английский', 'Французский'],
        services: ['Нумерология', 'Астрология', 'Совместимость'],
        description: 'Астролог и нумеролог с 18-летним опытом. Уникальный подход, сочетающий астрологию и нумерологию для более глубокого понимания личности и жизненного пути. Специализируюсь на анализе совместимости партнеров и прогнозировании важных событий.',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=200&fit=crop&crop=face',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=200&fit=crop&crop=face',
        tags: ['Нумерология', 'Астрология', 'Совместимость', 'YouTube', 'Telegram', 'Instagram'],
        available: true,
        isOnline: true
      },
      {
        id: 4,
        name: 'Дмитрий Волков',
        specialty: 'Астролог',
        rating: 4.6,
        reviews: 73,
        price: 2800,
        pricePerMinute: 47,
        experience: '10 лет',
        consultations: 73,
        languages: ['Русский', 'Украинский'],
        services: ['Хорарная астрология', 'Элективная астрология'],
        description: 'Специалист по хорарной и элективной астрологии. Помогу найти ответы на конкретные вопросы и выбрать лучшее время для важных событий. Работаю с клиентами из России и Украины.',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop&crop=face',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop&crop=face',
        tags: ['Хорарная астрология', 'Элективная астрология'],
        available: false,
        isOnline: false
      },
      {
        id: 5,
        name: 'Мария Иванова',
        specialty: 'Таролог-медиум',
        rating: 4.5,
        reviews: 94,
        price: 3200,
        pricePerMinute: 53,
        experience: '14 лет',
        consultations: 94,
        languages: ['Русский'],
        services: ['Медиумизм', 'Таро', 'Энергетическая чистка'],
        description: 'Таролог и медиум с 14-летним опытом. Сочетаю таро-чтение с медиумическими способностями для более глубокого понимания ситуаций. Специализируюсь на энергетической чистке и работе с кармическими вопросами.',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=200&fit=crop&crop=face',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=200&fit=crop&crop=face',
        tags: ['Медиумизм', 'Таро', 'Энергетическая чистка'],
        available: true,
        isOnline: true
      }
    ]

    console.log('Моковые специалисты:', mockSpecialists)

    // Загружаем сохраненных специалистов из localStorage
    const savedSpecialists = localStorage.getItem('specialists')
    console.log('Сохраненные специалисты из localStorage:', savedSpecialists)
    
    if (savedSpecialists && savedSpecialists !== 'null') {
      try {
        const parsedSpecialists = JSON.parse(savedSpecialists)
        console.log('Распарсенные специалисты:', parsedSpecialists)
        const allSpecialists = [...mockSpecialists, ...parsedSpecialists]
        console.log('Итоговый список специалистов:', allSpecialists)
        setSpecialists(allSpecialists)
      } catch (error) {
        console.log('Ошибка при парсинге специалистов из localStorage:', error)
        setSpecialists(mockSpecialists)
      }
    } else {
      console.log('Нет сохраненных специалистов, используем только моковые')
      setSpecialists(mockSpecialists)
    }
  }, [])

  // Функция для добавления нового специалиста
  const addSpecialist = (userData) => {
    console.log('=== ДОБАВЛЕНИЕ СПЕЦИАЛИСТА ===')
    console.log('Данные пользователя:', userData)
    console.log('Текущий список специалистов:', specialists)
    
    const newSpecialist = {
      id: userData.id,
      name: userData.name,
      specialty: 'Астролог', // По умолчанию для новых астрологов
      rating: 0, // Новый специалист без рейтинга
      reviews: 0,
      price: 2000, // Базовая цена
      pricePerMinute: 33,
      experience: 'Новый специалист',
      consultations: 0,
      languages: ['Русский'],
      services: ['Астрологические консультации'],
      image: userData.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop&crop=face',
      avatar: userData.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop&crop=face',
      tags: ['Астрологические консультации'],
      available: true,
      email: userData.email,
      phone: userData.phone
    }
    
    console.log('Новый специалист:', newSpecialist)

    const updatedSpecialists = [...specialists, newSpecialist]
    console.log('Обновленный список специалистов:', updatedSpecialists)
    setSpecialists(updatedSpecialists)
    
    // Сохраняем в localStorage только новых специалистов (без моковых)
    const newSpecialists = updatedSpecialists.slice(5) // Исключаем первые 5 моковых
    console.log('Специалисты для сохранения в localStorage:', newSpecialists)
    localStorage.setItem('specialists', JSON.stringify(newSpecialists))
    
    console.log('Специалист успешно добавлен!')
  }

  // Функция для обновления специалиста
  const updateSpecialist = (userData) => {
    console.log('=== ОБНОВЛЕНИЕ СПЕЦИАЛИСТА ===')
    console.log('Данные пользователя для обновления:', userData)
    console.log('Текущий список специалистов:', specialists)
    console.log('ID пользователя:', userData.id)
    
    // Проверяем, есть ли специалист с таким ID
    const existingSpecialist = specialists.find(s => s.id === userData.id)
    console.log('Найденный специалист:', existingSpecialist)
    
    if (!existingSpecialist) {
      console.log('Специалист не найден, добавляем нового...')
      addSpecialist(userData)
      return
    }
    
    const updatedSpecialists = specialists.map(specialist => {
      if (specialist.id === userData.id) {
        const updated = {
          ...specialist,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          image: userData.profileImage || specialist.image,
          avatar: userData.profileImage || specialist.avatar,
          specialty: userData.specialty || specialist.specialty,
          experience: userData.experience || specialist.experience,
          description: userData.description || specialist.description,
          price: userData.price || specialist.price,
          pricePerMinute: userData.pricePerMinute || (userData.price ? Math.round(userData.price / 60) : specialist.pricePerMinute),
          languages: userData.languages || specialist.languages,
          services: userData.services || specialist.services,
          tags: userData.services || userData.tags || specialist.tags
        }
        console.log('Обновленный специалист:', updated)
        return updated
      }
      return specialist
    })
    
    console.log('Обновленный список специалистов:', updatedSpecialists)
    setSpecialists(updatedSpecialists)
    
    // Обновляем в localStorage
    const newSpecialists = updatedSpecialists.slice(5) // Исключаем первые 5 моковых
    console.log('Специалисты для сохранения в localStorage:', newSpecialists)
    localStorage.setItem('specialists', JSON.stringify(newSpecialists))
    
    console.log('Специалист успешно обновлен!')
  }

  // Функция для получения всех специалистов
  const getAllSpecialists = () => {
    return specialists
  }

  // Функция для удаления специалиста
  const deleteSpecialist = (userId) => {
    console.log('=== УДАЛЕНИЕ СПЕЦИАЛИСТА ===')
    console.log('ID пользователя для удаления:', userId)
    
    const updatedSpecialists = specialists.filter(s => s.id !== userId)
    console.log('Обновленный список специалистов:', updatedSpecialists)
    
    setSpecialists(updatedSpecialists)
    
    // Обновляем в localStorage
    const newSpecialists = updatedSpecialists.slice(5) // Исключаем первые 5 моковых
    console.log('Специалисты для сохранения в localStorage:', newSpecialists)
    localStorage.setItem('specialists', JSON.stringify(newSpecialists))
    
    console.log('Специалист успешно удален!')
  }

  // Функция для удаления всех астрологов
  const deleteAllAstrologers = () => {
    console.log('=== УДАЛЕНИЕ ВСЕХ АСТРОЛОГОВ ===')
    console.log('Текущий список специалистов:', specialists)
    
    // Оставляем только моковых специалистов (первые 5)
    const mockSpecialistsOnly = specialists.slice(0, 5)
    console.log('Список только моковых специалистов:', mockSpecialistsOnly)
    
    setSpecialists(mockSpecialistsOnly)
    
    // Очищаем localStorage от всех дополнительных специалистов
    localStorage.removeItem('specialists')
    console.log('localStorage specialists очищен')
    
    console.log('Все астрологи успешно удалены!')
  }

  const value = {
    specialists,
    addSpecialist,
    updateSpecialist,
    deleteSpecialist,
    deleteAllAstrologers,
    getAllSpecialists
  }

  return (
    <SpecialistsContext.Provider value={value}>
      {children}
    </SpecialistsContext.Provider>
  )
}
