import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useSpecialists } from '../contexts/SpecialistsContext'
import { FaCalendarAlt, FaVideo, FaDownload, FaUsers, FaClock, FaStar, FaUser, FaFilter, FaSearch, FaFolderPlus, FaFolder, FaFolderOpen, FaPlus, FaStickyNote, FaTrash, FaRegCalendarAlt } from 'react-icons/fa'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

const ClientDashboard = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { specialists: allSpecialists } = useSpecialists()
  const [activeTab, setActiveTab] = useState('consultations')
  const [selectedSpecialists, setSelectedSpecialists] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState('')
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const [consultations, setConsultations] = useState([])
  const [recordings, setRecordings] = useState([])
  const [filteredSpecialists, setFilteredSpecialists] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [showFilters, setShowFilters] = useState(true)
  const [folders, setFolders] = useState(() => {
    const createLecturesFolder = () => ({
      id: 'folder-lectures-default',
      name: 'Мои лекции',
      color: '#f4b400',
      description: 'Сохраняйте материалы, записи и даты лекций',
      createdAt: new Date().toISOString(),
      charts: []
    })

    if (typeof window === 'undefined') {
      return [createLecturesFolder()]
    }

    try {
      const stored = localStorage.getItem('natalFolders')
      let parsed = stored ? JSON.parse(stored) : []
      const hasLectures = parsed.some(folder => folder.name === 'Мои лекции')
      if (!hasLectures) {
        parsed = [createLecturesFolder(), ...parsed]
      }
      return parsed.length ? parsed : [createLecturesFolder()]
    } catch {
      return [createLecturesFolder()]
    }
  })
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const [newFolder, setNewFolder] = useState({
    name: '',
    color: '#667eea',
    description: ''
  })
  const [chartForm, setChartForm] = useState({
    title: '',
    birthDate: '',
    birthTime: '',
    location: '',
    notes: ''
  })

  // Загрузка консультаций с бэкенда
  useEffect(() => {
    const loadConsultations = async () => {
      if (!user || !user.id) {
        console.log('Пользователь не найден, используем пустой список')
        setConsultations([])
        return
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || ''
      
      if (API_BASE_URL) {
        try {
          // Загружаем бронирования клиента
          console.log('Загрузка бронирований для клиента (user.id):', user.id)
          const response = await fetch(`${API_BASE_URL}/api/bookings?clientId=${user.id}`)
          
          if (response.ok) {
            const bookings = await response.json()
            console.log('Бронирования загружены:', bookings)
            
            // Преобразуем бронирования в формат консультаций
            const consultationsData = bookings.map(booking => ({
              id: booking.id,
              specialists: [booking.specialistName || 'Астролог'],
              date: booking.date,
              time: booking.time,
              duration: booking.duration || 60,
              status: booking.status === 'pending' ? 'upcoming' : booking.status === 'confirmed' ? 'upcoming' : booking.status === 'completed' ? 'completed' : booking.status === 'cancelled' ? 'cancelled' : 'upcoming',
              type: booking.type === 'group' ? 'group' : 'individual',
              specialistId: booking.specialistId,
              specialistName: booking.specialistName
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
            console.warn('Ошибка загрузки бронирований:', response.status)
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

  // Моковые данные для записей (пока нет API)
  useEffect(() => {
    const mockRecordings = [
      {
        id: 1,
        title: 'Консультация по натальной карте',
        specialists: ['Елена Петрова'],
        date: '2024-01-10',
        duration: '45 мин',
        downloadUrl: '#'
      }
    ]
    setRecordings(mockRecordings)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('natalFolders', JSON.stringify(folders))
  }, [folders])

  useEffect(() => {
    if (!selectedFolderId && folders.length > 0) {
      setSelectedFolderId(folders[0].id)
    }
  }, [folders, selectedFolderId])

  const specialties = ['all', 'Астролог', 'Таролог', 'Астролог-нумеролог', 'Таролог-медиум']

  // Фильтрация специалистов
  const filterSpecialists = () => {
    let result = allSpecialists

    if (selectedSpecialty !== 'all') {
      result = result.filter(specialist => specialist.specialty === selectedSpecialty)
    }

    if (searchTerm) {
      result = result.filter(specialist =>
        specialist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specialist.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredSpecialists(result)
  }

  // Запускаем фильтрацию при изменении параметров
  useEffect(() => {
    filterSpecialists()
  }, [allSpecialists, searchTerm, selectedSpecialty])

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ]

  const handleSpecialistToggle = (specialist) => {
    if (selectedSpecialists.find(s => s.id === specialist.id)) {
      setSelectedSpecialists(selectedSpecialists.filter(s => s.id !== specialist.id))
    } else {
      setSelectedSpecialists([...selectedSpecialists, specialist])
    }
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setSelectedTime('')
    // Здесь должна быть логика проверки доступности времени для выбранных специалистов
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
  }

  const handleBooking = async () => {
    if (selectedSpecialists.length === 0 || !selectedDate || !selectedTime) {
      alert('Пожалуйста, выберите специалистов, дату и время')
      return
    }

    if (!user) {
      alert('Пожалуйста, войдите в систему для бронирования')
      return
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || ''
      
      // Создаем бронирование для каждого выбранного специалиста
      for (const specialist of selectedSpecialists) {
        const bookingData = {
          specialistId: specialist.id,
          specialistName: specialist.name,
          clientId: user.id,
          clientName: user.name,
          clientEmail: user.email || '',
          clientPhone: user.phone || '',
          date: selectedDate.toISOString().split('T')[0], // Формат YYYY-MM-DD
          time: selectedTime,
          duration: 60, // По умолчанию 60 минут
          type: 'individual',
          language: 'ru',
          phoneNumber: user.phone || null, // Телефон для напоминаний (необязательно)
          basePrice: specialist.price || specialist.pricePerMinute * 60 || 2000,
          finalPrice: specialist.price || specialist.pricePerMinute * 60 || 2000,
          status: 'pending',
          reminderSent: false,
          createdAt: new Date().toISOString()
        }

        console.log('Отправка бронирования:', bookingData)

        if (API_BASE_URL) {
          const response = await fetch(`${API_BASE_URL}/api/bookings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
          })

          if (!response.ok) {
            throw new Error('Ошибка при сохранении бронирования')
          }

          const savedBooking = await response.json()
          console.log('Бронирование сохранено:', savedBooking)
        } else {
          console.warn('API не настроен, бронирование не отправлено на сервер')
        }
      }

      alert(`✅ Консультация забронирована на ${selectedDate.toLocaleDateString('ru-RU')} в ${selectedTime}!\n\n` +
            `Специалист: ${selectedSpecialists.map(s => s.name).join(', ')}\n` +
            `Заявка отправлена и ожидает подтверждения.`)
      
      // Очищаем выбранные данные
      setSelectedSpecialists([])
      setSelectedTime('')
      setSelectedDate(new Date())
      
    } catch (error) {
      console.error('Ошибка сохранения бронирования:', error)
      alert('Ошибка при отправке заявки. Попробуйте еще раз.')
    }
  }

  const downloadRecording = (recording) => {
    alert(`Скачивание записи: ${recording.title}`)
  }

  const handleFolderCreate = (e) => {
    e.preventDefault()
    if (!newFolder.name.trim()) {
      alert('Введите название папки')
      return
    }

    const folder = {
      id: `folder-${Date.now()}`,
      name: newFolder.name.trim(),
      color: newFolder.color,
      description: newFolder.description.trim(),
      createdAt: new Date().toISOString(),
      charts: []
    }

    setFolders([folder, ...folders])
    setSelectedFolderId(folder.id)
    setNewFolder({
      name: '',
      color: '#667eea',
      description: ''
    })
  }

  const handleFolderDelete = (folderId) => {
    if (!window.confirm('Удалить папку вместе с сохранёнными картами?')) return
    setFolders(folders.filter(folder => folder.id !== folderId))
    if (selectedFolderId === folderId) {
      setSelectedFolderId(folders.filter(folder => folder.id !== folderId)[0]?.id || null)
    }
  }

  const handleChartCreate = (e) => {
    e.preventDefault()
    if (!selectedFolderId) {
      alert('Сначала выберите папку')
      return
    }
    if (!chartForm.title.trim() || !chartForm.birthDate) {
      alert('Введите имя и дату')
      return
    }

    const newChart = {
      id: `chart-${Date.now()}`,
      ...chartForm,
      createdAt: new Date().toISOString()
    }

    setFolders(prev =>
      prev.map(folder =>
        folder.id === selectedFolderId
          ? { ...folder, charts: [newChart, ...folder.charts] }
          : folder
      )
    )

    setChartForm({
      title: '',
      birthDate: '',
      birthTime: '',
      location: '',
      notes: ''
    })
  }

  const handleChartDelete = (folderId, chartId) => {
    setFolders(prev =>
      prev.map(folder =>
        folder.id === folderId
          ? { ...folder, charts: folder.charts.filter(chart => chart.id !== chartId) }
          : folder
      )
    )
  }

  const selectedFolder = folders.find(folder => folder.id === selectedFolderId)

  const renderSpecialistCard = (specialist) => {
    const isSelected = selectedSpecialists.find(s => s.id === specialist.id)
    
    return (
      <div
        key={specialist.id}
        className="specialist-card"
        style={{
          border: isSelected ? '3px solid #667eea' : '1px solid #e1e5e9',
          cursor: 'pointer',
          opacity: isSelected ? 1 : 0.8
        }}
        onClick={() => handleSpecialistToggle(specialist)}
      >
        <div className="specialist-info">
          <h3 className="specialist-name">{specialist.name}</h3>
          <p className="specialist-specialty">{specialist.specialty}</p>
          <div className="specialist-rating">
            <div className="rating">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`star ${i < Math.floor(specialist.rating) ? '' : 'empty'}`}>
                  ★
                </span>
              ))}
            </div>
            <span>{specialist.rating}</span>
          </div>
          <p className="specialist-price">{specialist.pricePerMinute ? `${specialist.pricePerMinute} ₽/мин` : `${specialist.price} ₽/час`}</p>
          {specialist.experience && (
            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Опыт: {specialist.experience}
            </p>
          )}
          {isSelected && (
            <div style={{ color: '#667eea', fontWeight: 'bold', marginTop: '10px' }}>
              ✓ Выбран
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderConsultationCard = (consultation) => {
    const isCompleted = consultation.status === 'completed'
    const isUpcoming = consultation.status === 'upcoming'
    
    return (
      <div key={consultation.id} className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
          <div>
            <h3 style={{ marginBottom: '10px' }}>
              {consultation.type === 'group' ? 'Групповая консультация' : 'Индивидуальная консультация'}
            </h3>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              <strong>Специалисты:</strong> {consultation.specialists.join(', ')}
            </p>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              <strong>Дата:</strong> {consultation.date} в {consultation.time}
            </p>
            <p style={{ color: '#666' }}>
              <strong>Длительность:</strong> {consultation.duration} минут
            </p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <span style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              background: isCompleted ? '#28a745' : isUpcoming ? '#ffc107' : '#6c757d',
              color: 'white'
            }}>
              {isCompleted ? 'Завершена' : isUpcoming ? 'Предстоит' : 'Отменена'}
            </span>
          </div>
        </div>
        
        {isCompleted && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-gray">
              <FaVideo style={{ marginRight: '8px' }} />
              Смотреть запись
            </button>
            <button className="btn btn-secondary">
              <FaDownload style={{ marginRight: '8px' }} />
              Скачать
            </button>
          </div>
        )}
        
        {isUpcoming && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-gray">
              <FaVideo style={{ marginRight: '8px' }} />
              Присоединиться
            </button>
            <button className="btn btn-secondary">
              Отменить
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <div className="dashboard-overlay">
          <h1 style={{ textAlign: 'center', marginBottom: '40px', color: 'white', fontSize: '3rem' }}>
            Личный кабинет
          </h1>
        
        <div className="card" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
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
              <h2 style={{ margin: 0, color: '#333' }}>Добро пожаловать, {user?.name || 'Клиент'}!</h2>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>Управляйте своими консультациями и записями</p>
            </div>
          </div>
        </div>

        {/* Табы */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-gray"
            style={{ opacity: activeTab === 'consultations' ? 1 : 0.8 }}
            onClick={() => setActiveTab('consultations')}
          >
            <FaVideo style={{ marginRight: '8px' }} />
            Консультации
          </button>
          <button
            className={`btn ${activeTab === 'book' ? 'btn-primary book-appointment-btn' : 'btn-secondary'}`}
            onClick={() => setActiveTab('book')}
          >
            <FaCalendarAlt style={{ marginRight: '8px' }} />
            Записаться
          </button>
          <button
            className={`btn ${activeTab === 'recordings' ? 'btn-primary' : 'btn-secondary'} btn-blue-text`}
            onClick={() => setActiveTab('recordings')}
          >
            <FaDownload style={{ marginRight: '8px' }} />
            Записи
          </button>
          <button
            className="btn btn-gray"
            style={{ opacity: activeTab === 'folders' ? 1 : 0.8 }}
            onClick={() => setActiveTab('folders')}
          >
            <FaFolder style={{ marginRight: '8px' }} />
            Архив
          </button>
        </div>

        {/* Консультации */}
        {activeTab === 'consultations' && (
          <div>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Мои консультации</h2>
            {consultations.length > 0 ? (
              consultations.map(renderConsultationCard)
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <h3 style={{ color: '#666', marginBottom: '20px' }}>У вас пока нет консультаций</h3>
                <p style={{ color: '#666' }}>Запишитесь на первую консультацию с нашими специалистами</p>
                <button
                  className="btn btn-primary book-appointment-btn"
                  onClick={() => setActiveTab('book')}
                  style={{ marginTop: '20px' }}
                >
                  Записаться
                </button>
              </div>
            )}
          </div>
        )}

      {/* Папки с натальными картами */}
        {activeTab === 'folders' && (
          <div>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Архив натальных карт</h2>

            <div className="card" style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaFolderPlus color="#667eea" />
                Создать папку
              </h3>
              <form onSubmit={handleFolderCreate}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '20px' }}>
                  <div className="form-group">
                    <label>Название папки</label>
                    <input
                      type="text"
                      value={newFolder.name}
                      onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                      placeholder="Например, 'Семья', 'Клиенты'"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Цвет</label>
                    <input
                      type="color"
                      value={newFolder.color}
                      onChange={(e) => setNewFolder({ ...newFolder, color: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '15px' }}>
                  <label>Описание (необязательно)</label>
                  <textarea
                    value={newFolder.description}
                    onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                    placeholder="Добавьте заметку, чтобы помнить зачем эта папка"
                    rows="2"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>
                  <FaPlus style={{ marginRight: '8px' }} />
                  Сохранить папку
                </button>
              </form>
            </div>

            {folders.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <h3 style={{ color: '#666', marginBottom: '10px' }}>Пока нет сохранённых папок</h3>
                <p style={{ color: '#666' }}>Создайте первую папку, чтобы упорядочить даты и натальные карты</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ color: '#333', marginBottom: '15px' }}>Мои папки</h4>
                  <div className="specialists-grid" style={{ gridTemplateColumns: '1fr', gap: '15px' }}>
                    {folders.map(folder => (
                      <div
                        key={folder.id}
                        className="specialist-card"
                        style={{
                          borderColor: folder.id === selectedFolderId ? folder.color : '#e1e5e9',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedFolderId(folder.id)}
                      >
                        <div className="specialist-info">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <h3 className="specialist-name" style={{ color: folder.color }}>
                                <FaFolderOpen style={{ marginRight: '8px' }} />
                                {folder.name}
                              </h3>
                              <p style={{ color: '#666', marginBottom: '5px' }}>
                                Карты: {folder.charts.length}
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
                            <button
                              className="btn btn-secondary"
                              style={{ background: '#ffeaea', color: '#d9534f', border: 'none' }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleFolderDelete(folder.id)
                              }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  {selectedFolder ? (
                    <div className="card">
                      <h3 style={{ marginBottom: '15px', color: selectedFolder.color }}>
                        <FaFolderOpen style={{ marginRight: '8px' }} />
                        {selectedFolder.name}
                      </h3>

                      <form onSubmit={handleChartCreate} style={{ marginBottom: '25px' }}>
                        <h4 style={{ color: '#333', marginBottom: '10px' }}>Добавить натальную карту</h4>
                        <div className="form-group">
                          <label>Имя или название карты</label>
                          <input
                            type="text"
                            value={chartForm.title}
                            onChange={(e) => setChartForm({ ...chartForm, title: e.target.value })}
                            placeholder="Например, 'Анна, клиент'"
                            required
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                          <div className="form-group">
                            <label>Дата рождения</label>
                            <input
                              type="date"
                              value={chartForm.birthDate}
                              onChange={(e) => setChartForm({ ...chartForm, birthDate: e.target.value })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Время (если известно)</label>
                            <input
                              type="time"
                              value={chartForm.birthTime}
                              onChange={(e) => setChartForm({ ...chartForm, birthTime: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Место</label>
                          <input
                            type="text"
                            value={chartForm.location}
                            onChange={(e) => setChartForm({ ...chartForm, location: e.target.value })}
                            placeholder="Город, страна"
                          />
                        </div>
                        <div className="form-group">
                          <label>Заметки</label>
                          <textarea
                            value={chartForm.notes}
                            onChange={(e) => setChartForm({ ...chartForm, notes: e.target.value })}
                            placeholder="Сохраните важные детали, ссылки, выводы"
                            rows="3"
                          />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                          <FaRegCalendarAlt style={{ marginRight: '8px' }} />
                          Сохранить карту
                        </button>
                      </form>

                      <div>
                        <h4 style={{ color: '#333', marginBottom: '15px' }}>Сохранённые карты</h4>
                        {selectedFolder.charts.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9ff', borderRadius: '8px', color: '#666' }}>
                            Пока нет сохранённых карт
                          </div>
                        ) : (
                          <div className="specialists-grid" style={{ gridTemplateColumns: '1fr', gap: '15px' }}>
                            {selectedFolder.charts.map(chart => (
                              <div key={chart.id} className="specialist-card">
                                <div className="specialist-info">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                      <h3 className="specialist-name" style={{ color: selectedFolder.color }}>
                                        <FaStickyNote style={{ marginRight: '8px' }} />
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
                                      onClick={() => handleChartDelete(selectedFolder.id, chart.id)}
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
        )}

        {/* Запись на консультацию */}
        {activeTab === 'book' && (
          <div>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Запись на консультацию</h2>
            
            <div className="card" style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '20px', color: '#333' }}>
                <FaUsers style={{ marginRight: '10px', color: '#667eea' }} />
                Выберите специалистов
              </h3>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Вы можете выбрать одного или нескольких специалистов для групповой консультации
              </p>
              
              {/* Фильтры для специалистов */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '15px' }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ position: 'relative' }}>
                      <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                      <input
                        type="text"
                        placeholder="Поиск специалистов..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                        className="form-group input"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <FaFilter />
                    Фильтры
                  </button>
                </div>

                {showFilters && (
                  <div style={{ paddingTop: '15px', borderTop: '1px solid #e1e5e9' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      <div className="form-group">
                        <label>Специализация</label>
                        <select
                          value={selectedSpecialty}
                          onChange={(e) => setSelectedSpecialty(e.target.value)}
                        >
                          {specialties.map(specialty => (
                            <option key={specialty} value={specialty}>
                              {specialty === 'all' ? 'Все специализации' : specialty}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Отладочная информация */}
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                padding: '10px', 
                borderRadius: '6px', 
                marginBottom: '15px',
                fontSize: '12px',
                color: '#666'
              }}>
                <strong>Найдено специалистов:</strong> {filteredSpecialists.length} из {allSpecialists.length}
                {selectedSpecialty !== 'all' && ` (фильтр: ${selectedSpecialty})`}
                {searchTerm && ` (поиск: "${searchTerm}")`}
                
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      console.log('=== ОТЛАДКА СПЕЦИАЛИСТОВ ===')
                      console.log('Все специалисты:', allSpecialists)
                      console.log('Отфильтрованные:', filteredSpecialists)
                      console.log('Выбранные:', selectedSpecialists)
                      console.log('localStorage specialists:', localStorage.getItem('specialists'))
                    }}
                    style={{
                      background: '#ff9800',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '10px'
                    }}
                  >
                    🧪 ОТЛАДКА
                  </button>
                  
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedSpecialty('all')
                      setSelectedSpecialists([])
                    }}
                    style={{
                      background: '#9c27b0',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '10px'
                    }}
                  >
                    🔄 СБРОС
                  </button>
                </div>
              </div>

              <div className="specialists-grid">
                {filteredSpecialists.length > 0 ? (
                  filteredSpecialists.map(renderSpecialistCard)
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', gridColumn: '1 / -1' }}>
                    <h4 style={{ color: '#666', marginBottom: '15px' }}>Специалисты не найдены</h4>
                    <p style={{ color: '#666' }}>Попробуйте изменить фильтры или поисковый запрос</p>
                  </div>
                )}
              </div>
            </div>

            {selectedSpecialists.length > 0 && (
              <div className="card" style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '20px', color: '#333' }}>
                  <FaCalendarAlt style={{ marginRight: '10px', color: '#667eea' }} />
                  Выберите дату и время
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                      Дата консультации
                    </label>
                    <Calendar
                      onChange={handleDateChange}
                      value={selectedDate}
                      minDate={new Date()}
                      className="calendar-container"
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                      Время консультации
                    </label>
                    <div className="time-slots">
                      {timeSlots.map(time => (
                        <div
                          key={time}
                          className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                          onClick={() => handleTimeSelect(time)}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9ff', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '15px', color: '#333' }}>Детали консультации:</h4>
                  <p><strong>Выбранные специалисты:</strong> {selectedSpecialists.map(s => s.name).join(', ')}</p>
                  <p><strong>Дата:</strong> {selectedDate.toLocaleDateString('ru-RU')}</p>
                  <p><strong>Время:</strong> {selectedTime || 'Не выбрано'}</p>
                  <p><strong>Общая стоимость:</strong> {selectedSpecialists.reduce((sum, s) => sum + (s.pricePerMinute || s.price), 0)} ₽/мин</p>
                </div>

                <button
                  className="btn btn-primary book-btn"
                  onClick={handleBooking}
                  disabled={!selectedTime}
                  style={{ marginTop: '20px', width: '100%' }}
                >
                  Забронировать консультацию
                </button>
              </div>
            )}
          </div>
        )}

        {/* Записи */}
          {activeTab === 'recordings' && (
            <div>
              <h2 style={{ color: 'white', marginBottom: '20px' }}>Записи консультаций</h2>
              {recordings.length > 0 ? (
                <div className="specialists-grid">
                  {recordings.map(recording => (
                    <div key={recording.id} className="specialist-card">
                      <div className="specialist-info">
                        <h3 className="specialist-name">{recording.title}</h3>
                        <p style={{ color: '#666', marginBottom: '15px' }}>
                          <strong>Специалисты:</strong> {recording.specialists.join(', ')}
                        </p>
                        <p style={{ color: '#666', marginBottom: '15px' }}>
                          <strong>Дата:</strong> {recording.date}
                        </p>
                        <p style={{ color: '#666', marginBottom: '20px' }}>
                          <strong>Длительность:</strong> {recording.duration}
                        </p>
                        <button
                          className="btn btn-primary btn-blue-text"
                          onClick={() => downloadRecording(recording)}
                          style={{ width: '100%' }}
                        >
                          <FaDownload style={{ marginRight: '8px' }} />
                          Скачать запись
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <h3 style={{ color: '#666', marginBottom: '20px' }}>Записи пока недоступны</h3>
                  <p style={{ color: '#666' }}>После завершения консультаций здесь появятся записи для скачивания</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClientDashboard
