const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const translate = require('@vitalets/google-translate-api')
const { Pool } = require('pg')

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
// Увеличиваем лимит размера тела запроса до 50MB для больших новостей с изображениями
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(express.static(path.join(__dirname, '../dist')))

// Middleware для логирования всех HTTP запросов
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path}`)
  if (req.method === 'POST' || req.method === 'PUT') {
    // Логируем тело запроса (без паролей)
    const body = { ...req.body }
    if (body.password) {
      body.password = '***HIDDEN***'
    }
    console.log(`[${timestamp}] Request body:`, JSON.stringify(body, null, 2))
  }
  next()
})

// Подключение к PostgreSQL (если доступно)
let db = null
const usePostgreSQL = !!process.env.DATABASE_URL

if (usePostgreSQL) {
  try {
    db = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false
    })
    console.log('✅ Подключение к PostgreSQL установлено')
  } catch (error) {
    console.error('❌ Ошибка подключения к PostgreSQL:', error)
    db = null
  }
} else {
  console.log('⚠️ DATABASE_URL не найден, используется файловое хранилище')
}

// Инициализация таблиц PostgreSQL
const initDatabase = async () => {
  if (!db) return

  try {
    // Таблица пользователей
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'client',
        phone TEXT,
        avatar TEXT,
        bio TEXT,
        specialties TEXT[],
        rating REAL DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Таблица новостей
    await db.query(`
      CREATE TABLE IF NOT EXISTS news (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image TEXT,
        author_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Таблица бронирований
    await db.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        client_name TEXT NOT NULL,
        client_email TEXT NOT NULL,
        client_phone TEXT NOT NULL,
        specialist_id TEXT NOT NULL,
        specialist_name TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        reminder_sent BOOLEAN DEFAULT FALSE,
        reminder_sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('✅ Таблицы PostgreSQL созданы/проверены')
  } catch (error) {
    console.error('❌ Ошибка создания таблиц PostgreSQL:', error)
  }
}

if (db) {
  initDatabase().catch(console.error)
}

// Локальное хранилище новостей (fallback)
// Используем Railway Volume, если он доступен, иначе локальную папку
const DATA_BASE_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || path.join(__dirname, 'data')
const NEWS_DIR = path.join(DATA_BASE_DIR, 'news')
const NEWS_FILE = path.join(NEWS_DIR, 'news.json')

const ensureNewsStorage = () => {
  try {
    if (!fs.existsSync(NEWS_DIR)) {
      fs.mkdirSync(NEWS_DIR, { recursive: true })
      console.log(`✅ Создана папка для новостей: ${NEWS_DIR}`)
    }
    if (!fs.existsSync(NEWS_FILE)) {
      fs.writeFileSync(NEWS_FILE, JSON.stringify([]))
      console.log(`✅ Создан файл новостей: ${NEWS_FILE}`)
    }
  } catch (error) {
    console.error('❌ Ошибка при создании хранилища новостей:', error)
    console.error('⚠️ Продолжаем работу без постоянного хранилища (данные будут теряться при перезапуске)')
    // Не бросаем ошибку, чтобы сервер мог запуститься
  }
}

const readNews = async () => {
  if (db) {
    try {
      const result = await db.query('SELECT * FROM news ORDER BY created_at DESC')
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        imageUrl: row.image || '',
        image: row.image || '',
        authorId: row.author_id,
        authorName: row.author_name,
        authorAvatar: '',
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    } catch (error) {
      console.error('Ошибка чтения новостей из PostgreSQL:', error)
      return []
    }
  }

  // Fallback на файловое хранилище
  try {
    const raw = fs.readFileSync(NEWS_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Ошибка чтения новостей:', error)
    return []
  }
}

const writeNews = async (news) => {
  if (db) {
    try {
      // Удаляем все существующие новости
      await db.query('DELETE FROM news')
      // Вставляем новые
      for (const item of news) {
        await db.query(
          'INSERT INTO news (id, title, content, image, author_id, author_name, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [item.id, item.title, item.content, item.image || null, item.authorId, item.authorName, item.createdAt || new Date(), item.updatedAt || new Date()]
        )
      }
      return
    } catch (error) {
      console.error('Ошибка записи новостей в PostgreSQL:', error)
      // Fallback на файловое хранилище
    }
  }

  // Fallback на файловое хранилище
  fs.writeFileSync(NEWS_FILE, JSON.stringify(news, null, 2))
}

const generatePostId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

ensureNewsStorage()

// Хранение бронирований
const BOOKINGS_DIR = path.join(DATA_BASE_DIR, 'bookings')
const BOOKINGS_FILE = path.join(BOOKINGS_DIR, 'bookings.json')

const ensureBookingsStorage = () => {
  try {
    if (!fs.existsSync(BOOKINGS_DIR)) {
      fs.mkdirSync(BOOKINGS_DIR, { recursive: true })
      console.log(`✅ Создана папка для бронирований: ${BOOKINGS_DIR}`)
    }
    if (!fs.existsSync(BOOKINGS_FILE)) {
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([]))
      console.log(`✅ Создан файл бронирований: ${BOOKINGS_FILE}`)
    }
  } catch (error) {
    console.error('❌ Ошибка при создании хранилища бронирований:', error)
    console.error('⚠️ Продолжаем работу без постоянного хранилища (данные будут теряться при перезапуске)')
    // Не бросаем ошибку, чтобы сервер мог запуститься
  }
}

const readBookings = async () => {
  if (db) {
    try {
      const result = await db.query('SELECT * FROM bookings ORDER BY created_at DESC')
      return result.rows.map(row => ({
        id: row.id,
        clientId: row.client_id,
        clientName: row.client_name,
        clientEmail: row.client_email,
        clientPhone: row.client_phone,
        specialistId: row.specialist_id,
        specialistName: row.specialist_name,
        date: row.date,
        time: row.time,
        status: row.status,
        reminderSent: row.reminder_sent,
        reminderSentAt: row.reminder_sent_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    } catch (error) {
      console.error('Ошибка чтения бронирований из PostgreSQL:', error)
      return []
    }
  }

  // Fallback на файловое хранилище
  try {
    const raw = fs.readFileSync(BOOKINGS_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Ошибка чтения бронирований:', error)
    return []
  }
}

const writeBookings = async (bookings) => {
  if (db) {
    try {
      // Удаляем все бронирования
      await db.query('DELETE FROM bookings')
      // Вставляем новые
      for (const booking of bookings) {
        await db.query(
          'INSERT INTO bookings (id, client_id, client_name, client_email, client_phone, specialist_id, specialist_name, date, time, status, reminder_sent, reminder_sent_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
          [
            booking.id,
            booking.clientId,
            booking.clientName,
            booking.clientEmail,
            booking.clientPhone,
            booking.specialistId,
            booking.specialistName,
            booking.date,
            booking.time,
            booking.status || 'pending',
            booking.reminderSent || false,
            booking.reminderSentAt || null,
            booking.createdAt || new Date(),
            booking.updatedAt || new Date()
          ]
        )
      }
      return
    } catch (error) {
      console.error('Ошибка записи бронирований в PostgreSQL:', error)
      // Fallback на файловое хранилище
    }
  }

  // Fallback на файловое хранилище
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
}

ensureBookingsStorage()

// Хранение пользователей
const USERS_DIR = path.join(DATA_BASE_DIR, 'users')
const USERS_FILE = path.join(USERS_DIR, 'users.json')

const ensureUsersStorage = () => {
  try {
    if (!fs.existsSync(USERS_DIR)) {
      fs.mkdirSync(USERS_DIR, { recursive: true })
      console.log(`✅ Создана папка для пользователей: ${USERS_DIR}`)
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([]))
      console.log(`✅ Создан файл пользователей: ${USERS_FILE}`)
    }
  } catch (error) {
    console.error('❌ Ошибка при создании хранилища пользователей:', error)
    console.error('⚠️ Продолжаем работу без постоянного хранилища (данные будут теряться при перезапуске)')
    // Не бросаем ошибку, чтобы сервер мог запуститься
  }
}

const readUsers = async () => {
  if (db) {
    try {
      const result = await db.query('SELECT * FROM users ORDER BY created_at DESC')
      return result.rows.map(row => ({
        id: row.id,
        email: row.email,
        password: row.password,
        name: row.name,
        role: row.role,
        phone: row.phone,
        avatar: row.avatar,
        bio: row.bio,
        specialties: row.specialties || [],
        rating: row.rating,
        reviewsCount: row.reviews_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    } catch (error) {
      console.error('Ошибка чтения пользователей из PostgreSQL:', error)
      return []
    }
  }

  // Fallback на файловое хранилище
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Ошибка чтения пользователей:', error)
    return []
  }
}

const writeUsers = async (users) => {
  if (db) {
    try {
      // Удаляем всех пользователей
      await db.query('DELETE FROM users')
      // Вставляем новых
      for (const user of users) {
        await db.query(
          'INSERT INTO users (id, email, password, name, role, phone, avatar, bio, specialties, rating, reviews_count, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
          [
            user.id,
            user.email,
            user.password,
            user.name,
            user.role || 'client',
            user.phone || null,
            user.avatar || null,
            user.bio || null,
            user.specialties || [],
            user.rating || 0,
            user.reviewsCount || 0,
            user.createdAt || new Date(),
            user.updatedAt || new Date()
          ]
        )
      }
      return
    } catch (error) {
      console.error('Ошибка записи пользователей в PostgreSQL:', error)
      // Fallback на файловое хранилище
    }
  }

  // Fallback на файловое хранилище
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

ensureUsersStorage()

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
  const bookings = await readBookings()
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
        .then(async () => {
          // Отмечаем, что напоминание отправлено
          booking.reminderSent = true
          booking.reminderSentAt = new Date().toISOString()
          await writeBookings(bookings)
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
app.get('/api/news', async (req, res) => {
  try {
    const news = await readNews()
    const sorted = news.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(sorted)
  } catch (error) {
    console.error('Ошибка получения новостей:', error)
    res.status(500).json({ error: 'Ошибка получения новостей' })
  }
})

app.get('/api/news/:id', async (req, res) => {
  try {
    const news = await readNews()
    const post = news.find(item => item.id === req.params.id)
    if (!post) {
      return res.status(404).json({ error: 'Публикация не найдена' })
    }
    res.json(post)
  } catch (error) {
    console.error('Ошибка получения новости:', error)
    res.status(500).json({ error: 'Ошибка получения новости' })
  }
})

app.post('/api/news', async (req, res) => {
  try {
    const { title, content, imageUrl, authorId, authorName, authorAvatar } = req.body

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'Заполните заголовок и текст новости' })
    }

    if (!authorId || !authorName) {
      return res.status(400).json({ error: 'Требуются данные автора' })
    }

    const news = await readNews()
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
    await writeNews(news)

    res.status(201).json(newPost)
  } catch (error) {
    console.error('Ошибка создания новости:', error)
    res.status(500).json({ error: 'Ошибка создания новости' })
  }
})

app.put('/api/news/:id', async (req, res) => {
  try {
    const { title, content, imageUrl, authorId } = req.body
    if (!authorId) {
      return res.status(400).json({ error: 'authorId обязателен' })
    }

    const news = await readNews()
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

    await writeNews(news)
    res.json(news[index])
  } catch (error) {
    console.error('Ошибка обновления новости:', error)
    res.status(500).json({ error: 'Ошибка обновления новости' })
  }
})

app.delete('/api/news/:id', async (req, res) => {
  try {
    const { authorId } = req.query
    if (!authorId) {
      return res.status(400).json({ error: 'authorId обязателен' })
    }

    const news = await readNews()
    const index = news.findIndex(item => item.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ error: 'Публикация не найдена' })
    }

    if (String(news[index].authorId) !== String(authorId)) {
      return res.status(403).json({ error: 'Можно удалять только собственные публикации' })
    }

    const [removed] = news.splice(index, 1)
    await writeNews(news)
    res.json({ success: true, id: removed.id })
  } catch (error) {
    console.error('Ошибка удаления новости:', error)
    res.status(500).json({ error: 'Ошибка удаления новости' })
  }
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
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body

    if (!bookingData.specialistId || !bookingData.clientId || !bookingData.date || !bookingData.time) {
      console.log('❌ ОШИБКА БРОНИРОВАНИЯ: Не все обязательные поля заполнены')
      return res.status(400).json({ error: 'Не все обязательные поля заполнены' })
    }

    const bookings = await readBookings()
    const newBooking = {
      id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...bookingData,
      createdAt: new Date().toISOString(),
      reminderSent: false
    }

    bookings.push(newBooking)
    await writeBookings(bookings)

    // Логируем успешное бронирование
    console.log(`✅ БРОНИРОВАНИЕ СОЗДАНО: Клиент ${bookingData.clientName} → Астролог ID: ${bookingData.specialistId}, Дата: ${bookingData.date} ${bookingData.time}`)
    console.log(`📊 Всего бронирований: ${bookings.length}`)

    // Планируем проверку напоминания для этого бронирования
    setTimeout(() => checkAndSendReminders(), 1000)

    res.status(201).json(newBooking)
  } catch (error) {
    console.error('Ошибка создания бронирования:', error)
    res.status(500).json({ error: 'Ошибка создания бронирования' })
  }
})

app.get('/api/bookings', async (req, res) => {
  try {
    const { clientId, specialistId } = req.query
    let bookings = await readBookings()

    if (clientId) {
      bookings = bookings.filter(b => String(b.clientId) === String(clientId))
    }

    if (specialistId) {
      bookings = bookings.filter(b => String(b.specialistId) === String(specialistId))
    }

    res.json(bookings.sort((a, b) => new Date(a.date) - new Date(b.date)))
  } catch (error) {
    console.error('Ошибка получения бронирований:', error)
    res.status(500).json({ error: 'Ошибка получения бронирований' })
  }
})

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const bookings = await readBookings()
    const booking = bookings.find(b => b.id === req.params.id)

    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' })
    }

    res.json(booking)
  } catch (error) {
    console.error('Ошибка получения бронирования:', error)
    res.status(500).json({ error: 'Ошибка получения бронирования' })
  }
})

// API для подтверждения бронирования
app.put('/api/bookings/:id/confirm', async (req, res) => {
  try {
    const bookings = await readBookings()
    const bookingIndex = bookings.findIndex(b => b.id === req.params.id)

    if (bookingIndex === -1) {
      return res.status(404).json({ error: 'Бронирование не найдено' })
    }

    bookings[bookingIndex].status = 'confirmed'
    bookings[bookingIndex].updatedAt = new Date().toISOString()
    await writeBookings(bookings)
    
    console.log(`✅ БРОНИРОВАНИЕ ПОДТВЕРЖДЕНО: ${bookings[bookingIndex].id}`)
    res.json({ success: true, booking: bookings[bookingIndex] })
  } catch (error) {
    console.error('Ошибка подтверждения бронирования:', error)
    res.status(500).json({ error: 'Ошибка подтверждения бронирования', details: error.message })
  }
})

// API для отмены бронирования
app.put('/api/bookings/:id/cancel', async (req, res) => {
  try {
    const bookings = await readBookings()
    const bookingIndex = bookings.findIndex(b => b.id === req.params.id)

    if (bookingIndex === -1) {
      return res.status(404).json({ error: 'Бронирование не найдено' })
    }

    bookings[bookingIndex].status = 'cancelled'
    bookings[bookingIndex].updatedAt = new Date().toISOString()
    await writeBookings(bookings)
    
    console.log(`❌ БРОНИРОВАНИЕ ОТМЕНЕНО: ${bookings[bookingIndex].id}`)
    res.json({ success: true, booking: bookings[bookingIndex] })
  } catch (error) {
    console.error('Ошибка отмены бронирования:', error)
    res.status(500).json({ error: 'Ошибка отмены бронирования', details: error.message })
  }
})

// API для переноса бронирования
app.put('/api/bookings/:id/reschedule', async (req, res) => {
  try {
    const { date, time } = req.body

    if (!date || !time) {
      return res.status(400).json({ error: 'Укажите новую дату и время' })
    }

    const bookings = await readBookings()
    const bookingIndex = bookings.findIndex(b => b.id === req.params.id)

    if (bookingIndex === -1) {
      return res.status(404).json({ error: 'Бронирование не найдено' })
    }

    bookings[bookingIndex].date = date
    bookings[bookingIndex].time = time
    bookings[bookingIndex].updatedAt = new Date().toISOString()
    await writeBookings(bookings)

    console.log(`📅 БРОНИРОВАНИЕ ПЕРЕНЕСЕНО: ${bookings[bookingIndex].id} → ${date} ${time}`)
    res.json({ success: true, booking: bookings[bookingIndex] })
  } catch (error) {
    console.error('Ошибка переноса бронирования:', error)
    res.status(500).json({ error: 'Ошибка переноса бронирования', details: error.message })
  }
})

// Хранение сообщений по бронированиям
const BOOKING_MESSAGES_DIR = path.join(DATA_BASE_DIR, 'booking-messages')
const BOOKING_MESSAGES_FILE = path.join(BOOKING_MESSAGES_DIR, 'messages.json')

const ensureBookingMessagesStorage = () => {
  try {
    if (!fs.existsSync(BOOKING_MESSAGES_DIR)) {
      fs.mkdirSync(BOOKING_MESSAGES_DIR, { recursive: true })
    }
    if (!fs.existsSync(BOOKING_MESSAGES_FILE)) {
      fs.writeFileSync(BOOKING_MESSAGES_FILE, JSON.stringify([]))
    }
  } catch (error) {
    console.error('Ошибка создания хранилища сообщений:', error)
  }
}

ensureBookingMessagesStorage()

const readBookingMessages = () => {
  try {
    const raw = fs.readFileSync(BOOKING_MESSAGES_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Ошибка чтения сообщений:', error)
    return []
  }
}

const writeBookingMessages = (messages) => {
  fs.writeFileSync(BOOKING_MESSAGES_FILE, JSON.stringify(messages, null, 2))
}

app.get('/api/bookings/:id/messages', (req, res) => {
  try {
    const messages = readBookingMessages().filter(m => m.bookingId === req.params.id)
    res.json(messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)))
  } catch (error) {
    console.error('Ошибка получения сообщений:', error)
    res.status(500).json({ error: 'Ошибка получения сообщений' })
  }
})

app.post('/api/bookings/:id/messages', async (req, res) => {
  try {
    const { fromUserId, fromUserName, message } = req.body

    if (!fromUserId || !message?.trim()) {
      return res.status(400).json({ error: 'Заполните сообщение' })
    }

    const bookings = await readBookings()
    const booking = bookings.find(b => b.id === req.params.id)

    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' })
    }

    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      bookingId: req.params.id,
      fromUserId,
      fromUserName: fromUserName || 'Специалист',
      toUserId: booking.clientId,
      message: message.trim(),
      createdAt: new Date().toISOString()
    }

    const messages = readBookingMessages()
    messages.push(newMessage)
    writeBookingMessages(messages)

    console.log(`💬 Сообщение клиенту ${booking.clientName} по бронированию ${req.params.id}`)
    res.status(201).json(newMessage)
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error)
    res.status(500).json({ error: 'Ошибка отправки сообщения', details: error.message })
  }
})

// API для ручной отправки напоминаний (для тестирования)
app.post('/api/bookings/:id/send-reminder', async (req, res) => {
  try {
    const bookings = await readBookings()
    const booking = bookings.find(b => b.id === req.params.id)

    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' })
    }

    if (booking.phoneNumber) {
      await sendSMSReminder(booking.phoneNumber, booking)
      booking.reminderSent = true
      booking.reminderSentAt = new Date().toISOString()
      await writeBookings(bookings)
    }
    
    res.json({ success: true, message: 'Напоминание отправлено' })
  } catch (error) {
    console.error('Ошибка отправки напоминания:', error)
    res.status(500).json({ error: 'Ошибка отправки напоминания', details: error.message })
  }
})

// API для пользователей
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, phone, password, role, profileImage } = req.body

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' })
    }

    const users = await readUsers()
    
    // Проверяем, не существует ли уже пользователь с таким email
    const normalizedEmail = email.toLowerCase().trim()
    const existingUser = users.find(u => u.email.toLowerCase().trim() === normalizedEmail)
    
    if (existingUser) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' })
    }

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || '',
      password: password, // В продакшене нужно хешировать пароль!
      role: role || 'client',
      profileImage: profileImage || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    users.push(newUser)
    await writeUsers(users)

    // Логируем успешную регистрацию
    console.log(`✅ ПОЛЬЗОВАТЕЛЬ ЗАРЕГИСТРИРОВАН: ${newUser.name} (${newUser.email}), роль: ${newUser.role}, ID: ${newUser.id}`)
    console.log(`📊 Всего пользователей: ${users.length}`)

    // Удаляем пароль из ответа
    const { password: _, ...userResponse } = newUser
    res.status(201).json(userResponse)
  } catch (error) {
    console.error('Ошибка регистрации пользователя:', error)
    res.status(500).json({ error: 'Ошибка регистрации пользователя' })
  }
})

app.get('/api/users', async (req, res) => {
  try {
    const { email, role } = req.query
    let users = await readUsers()

    if (email) {
      const normalizedEmail = email.toLowerCase().trim()
      users = users.filter(u => u.email.toLowerCase().trim() === normalizedEmail)
    }

    if (role) {
      users = users.filter(u => u.role === role)
    }

    // Удаляем пароли из ответа
    const usersWithoutPasswords = users.map(({ password, ...user }) => user)
    res.json(usersWithoutPasswords)
  } catch (error) {
    console.error('Ошибка получения пользователей:', error)
    res.status(500).json({ error: 'Ошибка получения пользователей' })
  }
})

app.get('/api/users/:id', async (req, res) => {
  try {
    const users = await readUsers()
    const user = users.find(u => u.id === req.params.id)

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    // Удаляем пароль из ответа
    const { password, ...userResponse } = user
    res.json(userResponse)
  } catch (error) {
    console.error('Ошибка получения пользователя:', error)
    res.status(500).json({ error: 'Ошибка получения пользователя' })
  }
})

app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, phone, profileImage, specialty, experience, description, price, languages, services } = req.body
    const users = await readUsers()
    const index = users.findIndex(u => u.id === req.params.id)

    if (index === -1) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    const updatedUser = {
      ...users[index],
      ...(name && { name: name.trim() }),
      ...(phone && { phone: phone.trim() }),
      ...(profileImage && { profileImage }),
      ...(specialty && { specialty }),
      ...(experience && { experience }),
      ...(description && { description }),
      ...(price && { price }),
      ...(languages && { languages }),
      ...(services && { services }),
      updatedAt: new Date().toISOString()
    }

    users[index] = updatedUser
    await writeUsers(users)

    // Удаляем пароль из ответа
    const { password, ...userResponse } = updatedUser
    res.json(userResponse)
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error)
    res.status(500).json({ error: 'Ошибка обновления пользователя' })
  }
})

app.delete('/api/users/:id', async (req, res) => {
  try {
    const users = await readUsers()
    const index = users.findIndex(u => u.id === req.params.id)

    if (index === -1) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    const [removed] = users.splice(index, 1)
    await writeUsers(users)

    // Удаляем пароль из ответа
    const { password, ...userResponse } = removed
    res.json({ success: true, user: userResponse })
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error)
    res.status(500).json({ error: 'Ошибка удаления пользователя' })
  }
})

// API для получения списка астрологов (специалистов)
app.get('/api/astrologers', async (req, res) => {
  try {
    const users = await readUsers()
    const astrologers = users.filter(u => u.role === 'astrologer')
    
    console.log(`📋 ЗАПРОС АСТРОЛОГОВ: Найдено ${astrologers.length} астрологов из ${users.length} пользователей`)
    if (astrologers.length > 0) {
      console.log(`📋 Список астрологов:`, astrologers.map(a => `${a.name} (ID: ${a.id})`).join(', '))
    }

    // Преобразуем пользователей в формат специалистов
    const specialists = astrologers.map(user => ({
      id: user.id,
      name: user.name,
      specialty: user.specialty || 'Астролог',
      rating: user.rating || 0,
      reviews: user.reviews || 0,
      price: user.price || 2000,
      pricePerMinute: user.pricePerMinute || Math.round((user.price || 2000) / 60),
      experience: user.experience || 'Новый специалист',
      consultations: user.consultations || 0,
      languages: user.languages || ['Русский'],
      services: user.services || ['Астрологические консультации'],
      description: user.description || 'Профессиональный астролог',
      image: user.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658f4ff4e?w=300&h=200&fit=crop&crop=face',
      avatar: user.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658f4ff4e?w=300&h=200&fit=crop&crop=face',
      tags: user.services || ['Астрологические консультации'],
      available: user.available !== undefined ? user.available : true,
      isOnline: user.isOnline !== undefined ? user.isOnline : false,
      email: user.email,
      phone: user.phone
    }))

    res.json(specialists)
  } catch (error) {
    console.error('Ошибка получения астрологов:', error)
    res.status(500).json({ error: 'Ошибка получения астрологов' })
  }
})

// API для входа (авторизации)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' })
    }

    const users = await readUsers()
    const normalizedEmail = email.toLowerCase().trim()
    
    const user = users.find(u => u.email.toLowerCase().trim() === normalizedEmail && u.password === password)

    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }

    // Удаляем пароль из ответа
    const { password: _, ...userResponse } = user
    res.json(userResponse)
  } catch (error) {
    console.error('Ошибка входа:', error)
    res.status(500).json({ error: 'Ошибка входа' })
  }
})

// API для восстановления пароля
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email обязателен' })
    }

    const users = await readUsers()
    const normalizedEmail = email.toLowerCase().trim()
    
    const user = users.find(u => u.email.toLowerCase().trim() === normalizedEmail)

    if (!user) {
      return res.status(404).json({ error: 'Пользователь с таким email не найден' })
    }

    // Генерируем новый пароль
    const generatePassword = () => {
      const length = 12
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let password = ''
      password += charset.charAt(Math.floor(Math.random() * 26))
      password += charset.charAt(26 + Math.floor(Math.random() * 26))
      password += charset.charAt(52 + Math.floor(Math.random() * 10))
      
      for (let i = password.length; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length))
      }
      
      return password.split('').sort(() => Math.random() - 0.5).join('')
    }

    const newPassword = generatePassword()

    // Обновляем пароль пользователя
    const userIndex = users.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex].password = newPassword
      users[userIndex].updatedAt = new Date().toISOString()
      await writeUsers(users)
    }

    // Возвращаем новый пароль (в продакшене нужно отправить на email)
    res.json({
      success: true,
      newPassword: newPassword,
      message: 'Новый пароль сгенерирован. В продакшене он будет отправлен на email.'
    })
  } catch (error) {
    console.error('Ошибка восстановления пароля:', error)
    res.status(500).json({ error: 'Ошибка восстановления пароля' })
  }
})

// Обработка всех остальных маршрутов для SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

const PORT = process.env.PORT || 5000

// Обработка ошибок при запуске
process.on('uncaughtException', (error) => {
  console.error('❌ Необработанная ошибка:', error)
  console.error('Stack:', error.stack)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Необработанное отклонение промиса:', reason)
  console.error('Promise:', promise)
})

server.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`)
  console.log(`✅ WebSocket сервер доступен на ws://localhost:${PORT}`)
  console.log(`✅ DATA_BASE_DIR: ${DATA_BASE_DIR}`)
  console.log(`✅ NODE_ENV: ${process.env.NODE_ENV || 'development'}`)
}).on('error', (error) => {
  console.error('❌ Ошибка при запуске сервера:', error)
  process.exit(1)
})
