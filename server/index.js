const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const translate = require('@vitalets/google-translate-api')

const app = express()
const server = http.createServer(app)
// Настройка CORS для продакшена
const allowedOrigins = [
  'http://localhost:3000',
  'https://astrotoppro.vercel.app',
  'https://astrotop.pro',
  process.env.FRONTEND_URL
].filter(Boolean)

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
})

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Разрешаем запросы без origin (например, от мобильных приложений или Postman)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true)
    } else {
      callback(null, true) // Временно разрешаем все для тестирования
      // В продакшене можно ужесточить:
      // callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())
app.use(express.static(path.join(__dirname, '../dist')))

// Локальное хранилище новостей
const NEWS_DIR = path.join(__dirname, 'data')
const NEWS_FILE = path.join(NEWS_DIR, 'news.json')

const ensureNewsStorage = () => {
  if (!fs.existsSync(NEWS_DIR)) {
    fs.mkdirSync(NEWS_DIR, { recursive: true })
  }
  if (!fs.existsSync(NEWS_FILE)) {
    fs.writeFileSync(NEWS_FILE, JSON.stringify([]))
  }
}

const readNews = () => {
  try {
    const raw = fs.readFileSync(NEWS_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Ошибка чтения новостей:', error)
    return []
  }
}

const writeNews = (news) => {
  fs.writeFileSync(NEWS_FILE, JSON.stringify(news, null, 2))
}

const generatePostId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

ensureNewsStorage()

// Хранение бронирований
const BOOKINGS_DIR = path.join(__dirname, 'data')
const BOOKINGS_FILE = path.join(BOOKINGS_DIR, 'bookings.json')

const ensureBookingsStorage = () => {
  if (!fs.existsSync(BOOKINGS_DIR)) {
    fs.mkdirSync(BOOKINGS_DIR, { recursive: true })
  }
  if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([]))
  }
}

const readBookings = () => {
  try {
    const raw = fs.readFileSync(BOOKINGS_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Ошибка чтения бронирований:', error)
    return []
  }
}

const writeBookings = (bookings) => {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
}

ensureBookingsStorage()

// Функция отправки SMS напоминания (моковая - в продакшене использовать реальный SMS API)
const sendSMSReminder = async (phoneNumber, bookingData) => {
  console.log(`📱 Отправка SMS на ${phoneNumber}:`)
  console.log(`   Напоминание: Консультация ${bookingData.date} в ${bookingData.time}`)
  console.log(`   Специалист: ${bookingData.specialistName}`)
  
  // TODO: Интегрировать реальный SMS API (Twilio, Sms.ru, и т.д.)
  // Пример:
  // const message = `Напоминание: Ваша консультация с ${bookingData.specialistName} завтра в ${bookingData.time}`
  // await smsAPI.send(phoneNumber, message)
  
  return true
}

// Проверка и отправка напоминаний (запускается периодически)
const checkAndSendReminders = async () => {
  const bookings = readBookings()
  const now = new Date()
  const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000) // +24 часа
  
  bookings.forEach(booking => {
    if (booking.status !== 'pending' || booking.reminderSent) {
      return
    }
    
    const bookingDateTime = new Date(`${booking.date}T${booking.time}`)
    
    // Проверяем, что до консультации осталось примерно 24 часа (±1 час)
    const timeDiff = bookingDateTime.getTime() - now.getTime()
    const hoursUntilBooking = timeDiff / (1000 * 60 * 60)
    
    if (hoursUntilBooking >= 23 && hoursUntilBooking <= 25) {
      // Отправляем напоминание
      sendSMSReminder(booking.phoneNumber, booking)
        .then(() => {
          // Отмечаем, что напоминание отправлено
          booking.reminderSent = true
          booking.reminderSentAt = new Date().toISOString()
          writeBookings(bookings)
          console.log(`✅ Напоминание отправлено для бронирования ${booking.id}`)
        })
        .catch(error => {
          console.error(`❌ Ошибка отправки напоминания для ${booking.id}:`, error)
        })
    }
  })
}

// Запускаем проверку напоминаний каждые 30 минут
setInterval(checkAndSendReminders, 30 * 60 * 1000)
// Также проверяем сразу при запуске
checkAndSendReminders()

// Хранение активных сессий
const activeSessions = new Map()
const userSessions = new Map()
const userLanguages = new Map() // Хранение языковых предпочтений пользователей

// Поддерживаемые языки
const SUPPORTED_LANGUAGES = {
  'en': 'Английский',
  'de': 'Немецкий',
  'fr': 'Французский',
  'ka': 'Грузинский',
  'it': 'Итальянский',
  'es': 'Испанский',
  'ru': 'Русский',
  'vi': 'Вьетнамский',
  'zh': 'Китайский'
}

// Функция перевода текста
const translateText = async (text, targetLang, sourceLang = 'auto') => {
  try {
    if (!text || !text.trim()) {
      return { text: '', error: null }
    }
    
    const result = await translate(text, { 
      to: targetLang,
      from: sourceLang === 'auto' ? undefined : sourceLang
    })
    
    return {
      text: result.text,
      sourceLang: result.from.language.iso,
      targetLang: targetLang,
      error: null
    }
  } catch (error) {
    console.error('Ошибка перевода:', error)
    return {
      text: text, // Возвращаем оригинальный текст при ошибке
      error: error.message
    }
  }
}

// Socket.IO обработчики
io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id)

  // Присоединение к сессии
  socket.on('join-session', (data) => {
    const { sessionId, userId, userName, userRole, userLanguage } = data
    
    // Сохраняем языковые предпочтения пользователя
    if (userLanguage && SUPPORTED_LANGUAGES[userLanguage]) {
      userLanguages.set(socket.id, userLanguage)
    } else {
      userLanguages.set(socket.id, 'ru') // По умолчанию русский
    }
    
    // Добавляем пользователя в сессию
    if (!activeSessions.has(sessionId)) {
      activeSessions.set(sessionId, new Map())
    }
    
    const session = activeSessions.get(sessionId)
    session.set(socket.id, { userId, userName, userRole, language: userLanguages.get(socket.id) })
    userSessions.set(socket.id, sessionId)
    
    // Присоединяем сокет к комнате сессии
    socket.join(sessionId)
    
    // Уведомляем других участников о новом пользователе
    socket.to(sessionId).emit('user-joined', { 
      userId, 
      userName, 
      userRole,
      language: userLanguages.get(socket.id)
    })
    
    console.log(`Пользователь ${userName} присоединился к сессии ${sessionId} с языком ${userLanguages.get(socket.id)}`)
  })

  // Обновление языковых предпочтений
  socket.on('set-language', async (data) => {
    const { sessionId, language } = data
    
    if (SUPPORTED_LANGUAGES[language]) {
      userLanguages.set(socket.id, language)
      
      const session = activeSessions.get(sessionId)
      if (session && session.has(socket.id)) {
        const userInfo = session.get(socket.id)
        session.set(socket.id, { ...userInfo, language })
      }
      
      socket.emit('language-updated', { language })
      console.log(`Язык пользователя ${socket.id} изменен на ${language}`)
    }
  })

  // WebRTC сигналинг
  socket.on('offer', (data) => {
    const { sessionId, targetUserId, offer } = data
    socket.to(sessionId).emit('offer', {
      userId: userSessions.get(socket.id),
      targetUserId,
      offer
    })
  })

  socket.on('answer', (data) => {
    const { sessionId, targetUserId, answer } = data
    socket.to(sessionId).emit('answer', {
      userId: userSessions.get(socket.id),
      targetUserId,
      answer
    })
  })

  socket.on('ice-candidate', (data) => {
    const { sessionId, targetUserId, candidate } = data
    socket.to(sessionId).emit('ice-candidate', {
      userId: userSessions.get(socket.id),
      targetUserId,
      candidate
    })
  })

  // Чат сообщения с переводом
  socket.on('chat-message', async (data) => {
    const { sessionId, message } = data
    
    if (!activeSessions.has(sessionId)) {
      return
    }
    
    const session = activeSessions.get(sessionId)
    const senderLanguage = userLanguages.get(socket.id) || 'ru'
    const senderInfo = session.get(socket.id)
    
    // Получаем список всех языков участников для перевода
    const targetLanguages = new Set()
    session.forEach((userInfo, socketId) => {
      if (socketId !== socket.id) {
        const lang = userLanguages.get(socketId) || 'ru'
        if (lang !== senderLanguage) {
          targetLanguages.add(lang)
        }
      }
    })
    
    // Переводим сообщение для всех языков
    const translations = {}
    if (targetLanguages.size > 0) {
      const translationPromises = Array.from(targetLanguages).map(async (targetLang) => {
        const translated = await translateText(message.message, targetLang, senderLanguage)
        return { lang: targetLang, translation: translated }
      })
      
      const results = await Promise.all(translationPromises)
      results.forEach(({ lang, translation }) => {
        translations[lang] = translation.text
      })
    }
    
    // Отправляем оригинальное сообщение всем участникам
    const messageWithTranslations = {
      ...message,
      originalLanguage: senderLanguage,
      translations: translations
    }
    
    // Отправляем сообщение с переводами всем участникам сессии
    io.to(sessionId).emit('chat-message', messageWithTranslations)
  })
  
  // Запрос перевода текста
  socket.on('translate-request', async (data) => {
    const { text, targetLang, sourceLang } = data
    
    if (!text || !SUPPORTED_LANGUAGES[targetLang]) {
      socket.emit('translate-response', { error: 'Неверные параметры перевода' })
      return
    }
    
    const result = await translateText(text, targetLang, sourceLang)
    socket.emit('translate-response', result)
  })
  
  // Реальный перевод речи (текст в реальном времени)
  socket.on('speech-translation', async (data) => {
    const { sessionId, text, sourceLang } = data
    
    if (!activeSessions.has(sessionId) || !text || !text.trim()) {
      return
    }
    
    const session = activeSessions.get(sessionId)
    
    // Переводим для всех участников, кроме отправителя
    session.forEach((userInfo, socketId) => {
      if (socketId !== socket.id) {
        const targetLang = userLanguages.get(socketId) || 'ru'
        
        if (targetLang !== sourceLang) {
          translateText(text, targetLang, sourceLang).then(result => {
            io.to(socketId).emit('speech-translated', {
              text: result.text,
              originalText: text,
              sourceLang: sourceLang,
              targetLang: targetLang
            })
          })
        } else {
          // Если языки совпадают, отправляем оригинал
          io.to(socketId).emit('speech-translated', {
            text: text,
            originalText: text,
            sourceLang: sourceLang,
            targetLang: targetLang
          })
        }
      }
    })
  })

  // Отключение пользователя
  socket.on('disconnect', () => {
    const sessionId = userSessions.get(socket.id)
    
    if (sessionId && activeSessions.has(sessionId)) {
      const session = activeSessions.get(sessionId)
      const userInfo = session.get(socket.id)
      
      if (userInfo) {
        // Уведомляем других участников о выходе пользователя
        socket.to(sessionId).emit('user-left', userInfo.userId)
        
        // Удаляем пользователя из сессии
        session.delete(socket.id)
        
        // Если сессия пуста, удаляем её
        if (session.size === 0) {
          activeSessions.delete(sessionId)
        }
        
        console.log(`Пользователь ${userInfo.userName} покинул сессию ${sessionId}`)
      }
    }
    
    userSessions.delete(socket.id)
    userLanguages.delete(socket.id)
    console.log('Пользователь отключился:', socket.id)
  })
})

// API маршруты
app.get('/api/news', (req, res) => {
  const news = readNews()
  const sorted = news.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json(sorted)
})

app.get('/api/news/:id', (req, res) => {
  const news = readNews()
  const post = news.find(item => item.id === req.params.id)
  if (!post) {
    return res.status(404).json({ error: 'Публикация не найдена' })
  }
  res.json(post)
})

app.post('/api/news', (req, res) => {
  const { title, content, imageUrl, authorId, authorName, authorAvatar } = req.body

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: 'Заполните заголовок и текст новости' })
  }

  if (!authorId || !authorName) {
    return res.status(400).json({ error: 'Требуются данные автора' })
  }

  const news = readNews()
  const timestamp = new Date().toISOString()
  const newPost = {
    id: generatePostId(),
    title: title.trim(),
    content: content.trim(),
    imageUrl: imageUrl?.trim() || '',
    authorId: String(authorId),
    authorName: authorName.trim(),
    authorAvatar: authorAvatar || '',
    createdAt: timestamp,
    updatedAt: timestamp
  }

  news.push(newPost)
  writeNews(news)

  res.status(201).json(newPost)
})

app.put('/api/news/:id', (req, res) => {
  const { title, content, imageUrl, authorId } = req.body
  if (!authorId) {
    return res.status(400).json({ error: 'authorId обязателен' })
  }

  const news = readNews()
  const index = news.findIndex(item => item.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ error: 'Публикация не найдена' })
  }

  if (String(news[index].authorId) !== String(authorId)) {
    return res.status(403).json({ error: 'Можно редактировать только собственные публикации' })
  }

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: 'Заполните заголовок и текст новости' })
  }

  news[index] = {
    ...news[index],
    title: title.trim(),
    content: content.trim(),
    imageUrl: imageUrl?.trim() || '',
    updatedAt: new Date().toISOString()
  }

  writeNews(news)
  res.json(news[index])
})

app.delete('/api/news/:id', (req, res) => {
  const { authorId } = req.query
  if (!authorId) {
    return res.status(400).json({ error: 'authorId обязателен' })
  }

  const news = readNews()
  const index = news.findIndex(item => item.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ error: 'Публикация не найдена' })
  }

  if (String(news[index].authorId) !== String(authorId)) {
    return res.status(403).json({ error: 'Можно удалять только собственные публикации' })
  }

  const [removed] = news.splice(index, 1)
  writeNews(news)
  res.json({ success: true, id: removed.id })
})

app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params
  const session = activeSessions.get(sessionId)
  
  if (session) {
    const participants = Array.from(session.values())
    res.json({ sessionId, participants })
  } else {
    res.status(404).json({ error: 'Сессия не найдена' })
  }
})

app.get('/api/sessions', (req, res) => {
  const sessions = Array.from(activeSessions.keys()).map(sessionId => ({
    sessionId,
    participantCount: activeSessions.get(sessionId).size
  }))
  res.json(sessions)
})

// API для перевода
app.post('/api/translate', async (req, res) => {
  const { text, targetLang, sourceLang } = req.body
  
  if (!text || !targetLang || !SUPPORTED_LANGUAGES[targetLang]) {
    return res.status(400).json({ error: 'Неверные параметры перевода' })
  }
  
  const result = await translateText(text, targetLang, sourceLang || 'auto')
  res.json(result)
})

// API для получения списка поддерживаемых языков
app.get('/api/languages', (req, res) => {
  res.json(SUPPORTED_LANGUAGES)
})

// API для бронирований
app.post('/api/bookings', (req, res) => {
  const bookingData = req.body

  if (!bookingData.specialistId || !bookingData.clientId || !bookingData.date || !bookingData.time) {
    return res.status(400).json({ error: 'Не все обязательные поля заполнены' })
  }

  const bookings = readBookings()
  const newBooking = {
    id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...bookingData,
    createdAt: new Date().toISOString(),
    reminderSent: false
  }

  bookings.push(newBooking)
  writeBookings(bookings)

  // Планируем проверку напоминания для этого бронирования
  setTimeout(() => checkAndSendReminders(), 1000)

  res.status(201).json(newBooking)
})

app.get('/api/bookings', (req, res) => {
  const { clientId, specialistId } = req.query
  let bookings = readBookings()

  if (clientId) {
    bookings = bookings.filter(b => b.clientId === clientId)
  }

  if (specialistId) {
    bookings = bookings.filter(b => b.specialistId === specialistId)
  }

  res.json(bookings.sort((a, b) => new Date(a.date) - new Date(b.date)))
})

app.get('/api/bookings/:id', (req, res) => {
  const bookings = readBookings()
  const booking = bookings.find(b => b.id === req.params.id)

  if (!booking) {
    return res.status(404).json({ error: 'Бронирование не найдено' })
  }

  res.json(booking)
})

// API для ручной отправки напоминаний (для тестирования)
app.post('/api/bookings/:id/send-reminder', async (req, res) => {
  const bookings = readBookings()
  const booking = bookings.find(b => b.id === req.params.id)

  if (!booking) {
    return res.status(404).json({ error: 'Бронирование не найдено' })
  }

  try {
    await sendSMSReminder(booking.phoneNumber, booking)
    booking.reminderSent = true
    booking.reminderSentAt = new Date().toISOString()
    writeBookings(bookings)
    
    res.json({ success: true, message: 'Напоминание отправлено' })
  } catch (error) {
    res.status(500).json({ error: 'Ошибка отправки напоминания', details: error.message })
  }
})

// Обработка всех остальных маршрутов для SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`)
  console.log(`WebSocket сервер доступен на ws://localhost:${PORT}`)
})
