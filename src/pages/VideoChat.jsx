import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaComments, FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaDesktop, FaPhone, FaUsers, FaShare, FaDownload, FaLanguage, FaVolumeUp } from 'react-icons/fa'
import io from 'socket.io-client'

const VideoChat = () => {
  const { sessionId } = useParams() 
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [participants, setParticipants] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [sessionInfo, setSessionInfo] = useState(null)
  const [userLanguage, setUserLanguage] = useState('ru')
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(true)
  const [speechTranslations, setSpeechTranslations] = useState({}) // Переводы речи в реальном времени
  const recognitionRef = useRef(null)
  
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
  
  const localVideoRef = useRef()
  const remoteVideosRef = useRef({})
  const socketRef = useRef()
  const localStreamRef = useRef()
  const peerConnectionsRef = useRef({})

  // Моковые данные сессии
  useEffect(() => {
    const mockSessionInfo = {
      id: sessionId,
      title: 'Консультация по натальной карте',
      specialists: ['Елена Петрова', 'Михаил Сидоров'],
      client: 'Анна Смирнова',
      date: '2024-01-15',
      time: '14:00',
      duration: 60
    }
    setSessionInfo(mockSessionInfo)

    const mockParticipants = [
      { id: 1, name: 'Елена Петрова', role: 'specialist', isVideoEnabled: true, isAudioEnabled: true },
      { id: 2, name: 'Михаил Сидоров', role: 'specialist', isVideoEnabled: true, isAudioEnabled: true },
      { id: 3, name: 'Анна Смирнова', role: 'client', isVideoEnabled: true, isAudioEnabled: true }
    ]
    setParticipants(mockParticipants)
  }, [sessionId])

  useEffect(() => {
    // Инициализация WebRTC и Socket.IO
    initializeVideoChat()
    
    return () => {
      cleanupVideoChat()
    }
  }, [])

  const initializeVideoChat = async () => {
    try {
      // Получаем доступ к камере и микрофону
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Подключаемся к Socket.IO серверу
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
      socketRef.current = io(socketUrl)
      
      socketRef.current.emit('join-session', {
        sessionId,
        userId: user?.id,
        userName: user?.name,
        userRole: user?.role,
        userLanguage: userLanguage
      })

      socketRef.current.on('user-joined', handleUserJoined)
      socketRef.current.on('user-left', handleUserLeft)
      socketRef.current.on('offer', handleOffer)
      socketRef.current.on('answer', handleAnswer)
      socketRef.current.on('ice-candidate', handleIceCandidate)
      socketRef.current.on('chat-message', handleChatMessage)
      socketRef.current.on('speech-translated', handleSpeechTranslated)
      socketRef.current.on('language-updated', handleLanguageUpdated)

    } catch (error) {
      console.error('Ошибка инициализации видео чата:', error)
      alert('Не удалось получить доступ к камере или микрофону')
    }
  }

  const cleanupVideoChat = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
    
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close())
  }

  const handleUserJoined = async (userData) => {
    console.log('Пользователь присоединился:', userData)
    
    // Создаем peer connection для нового пользователя
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    })
    
    peerConnectionsRef.current[userData.userId] = peerConnection
    
    // Добавляем локальный поток
    localStreamRef.current.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStreamRef.current)
    })
    
    // Обработка ICE кандидатов
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          sessionId,
          targetUserId: userData.userId,
          candidate: event.candidate
        })
      }
    }
    
    // Обработка входящих потоков
    peerConnection.ontrack = (event) => {
      if (remoteVideosRef.current[userData.userId]) {
        remoteVideosRef.current[userData.userId].srcObject = event.streams[0]
      }
    }
    
    // Создаем offer
    try {
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      
      socketRef.current.emit('offer', {
        sessionId,
        targetUserId: userData.userId,
        offer
      })
    } catch (error) {
      console.error('Ошибка создания offer:', error)
    }
  }

  const handleUserLeft = (userId) => {
    console.log('Пользователь покинул:', userId)
    
    if (peerConnectionsRef.current[userId]) {
      peerConnectionsRef.current[userId].close()
      delete peerConnectionsRef.current[userId]
    }
    
    if (remoteVideosRef.current[userId]) {
      remoteVideosRef.current[userId].srcObject = null
    }
  }

  const handleOffer = async (data) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    })
    
    peerConnectionsRef.current[data.userId] = peerConnection
    
    localStreamRef.current.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStreamRef.current)
    })
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          sessionId,
          targetUserId: data.userId,
          candidate: event.candidate
        })
      }
    }
    
    peerConnection.ontrack = (event) => {
      if (remoteVideosRef.current[data.userId]) {
        remoteVideosRef.current[data.userId].srcObject = event.streams[0]
      }
    }
    
    try {
      await peerConnection.setRemoteDescription(data.offer)
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)
      
      socketRef.current.emit('answer', {
        sessionId,
        targetUserId: data.userId,
        answer
      })
    } catch (error) {
      console.error('Ошибка обработки offer:', error)
    }
  }

  const handleAnswer = async (data) => {
    const peerConnection = peerConnectionsRef.current[data.userId]
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(data.answer)
      } catch (error) {
        console.error('Ошибка обработки answer:', error)
      }
    }
  }

  const handleIceCandidate = async (data) => {
    const peerConnection = peerConnectionsRef.current[data.userId]
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(data.candidate)
      } catch (error) {
        console.error('Ошибка добавления ICE кандидата:', error)
      }
    }
  }

  const handleChatMessage = (message) => {
    // Проверяем, не является ли это нашим собственным сообщением
    const isOwnMessage = message.userId === user?.id
    
    // Если сообщение уже есть в чате (отправлено нами), обновляем его переводом
    if (isOwnMessage) {
      setChatMessages(prev => prev.map(msg => {
        if (msg.id === message.id) {
          return {
            ...msg,
            translations: message.translations,
            translatedText: message.originalLanguage === userLanguage 
              ? message.message 
              : message.translations?.[userLanguage] || message.message
          }
        }
        return msg
      }))
    } else {
      // Если есть переводы, добавляем перевод для текущего языка пользователя
      if (message.translations && message.translations[userLanguage]) {
        message.translatedText = message.translations[userLanguage]
      } else if (message.originalLanguage === userLanguage) {
        message.translatedText = message.message
      }
      
      setChatMessages(prev => {
        // Проверяем, нет ли уже такого сообщения
        const exists = prev.some(msg => msg.id === message.id)
        if (exists) return prev
        return [...prev, message]
      })
    }
  }
  
  const handleSpeechTranslated = (data) => {
    // Обновляем переводы речи в реальном времени
    setSpeechTranslations(prev => ({
      ...prev,
      [data.targetLang]: data.text
    }))
    
    // Автоматически скрываем перевод через 5 секунд
    setTimeout(() => {
      setSpeechTranslations(prev => {
        const updated = { ...prev }
        delete updated[data.targetLang]
        return updated
      })
    }, 5000)
  }
  
  const handleLanguageUpdated = (data) => {
    console.log('Язык обновлен:', data.language)
  }
  
  // Инициализация распознавания речи
  const initializeSpeechRecognition = () => {
    if (recognitionRef.current) {
      return // Уже инициализировано
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('Распознавание речи не поддерживается в этом браузере')
      return false
    }
    
    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = getLanguageCode(userLanguage)
      
      recognition.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }
        
        // Отправляем финальный текст на перевод
        if (finalTranscript.trim() && socketRef.current) {
          socketRef.current.emit('speech-translation', {
            sessionId,
            text: finalTranscript.trim(),
            sourceLang: userLanguage
          })
        }
      }
      
      recognition.onerror = (event) => {
        console.error('Ошибка распознавания речи:', event.error)
        if (event.error === 'not-allowed') {
          alert('Доступ к микрофону запрещен. Разрешите доступ к микрофону для использования перевода речи.')
        }
      }
      
      recognition.onend = () => {
        // Автоматически перезапускаем, если распознавание было включено
        if (isTranslationEnabled && recognitionRef.current) {
          try {
            recognitionRef.current.start()
          } catch (error) {
            console.error('Ошибка перезапуска распознавания:', error)
          }
        }
      }
      
      recognitionRef.current = recognition
      return true
    } catch (error) {
      console.error('Ошибка инициализации распознавания речи:', error)
      return false
    }
  }
  
  // Проверка поддержки распознавания речи
  const isSpeechRecognitionSupported = () => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  }
  
  const getLanguageCode = (lang) => {
    const langMap = {
      'en': 'en-US',
      'de': 'de-DE',
      'fr': 'fr-FR',
      'ka': 'ka-GE',
      'it': 'it-IT',
      'es': 'es-ES',
      'ru': 'ru-RU',
      'vi': 'vi-VN',
      'zh': 'zh-CN'
    }
    return langMap[lang] || 'ru-RU'
  }
  
  const handleLanguageChange = async (newLanguage) => {
    setUserLanguage(newLanguage)
    setShowLanguageSelector(false)
    
    if (socketRef.current) {
      socketRef.current.emit('set-language', {
        sessionId,
        language: newLanguage
      })
      
      // Обновляем язык распознавания речи
      if (recognitionRef.current) {
        recognitionRef.current.lang = getLanguageCode(newLanguage)
        // Перезапускаем распознавание с новым языком
        if (isTranslationEnabled) {
          try {
            recognitionRef.current.stop()
            setTimeout(() => {
              if (recognitionRef.current && isTranslationEnabled) {
                recognitionRef.current.start()
              }
            }, 100)
          } catch (error) {
            console.error('Ошибка обновления языка распознавания:', error)
          }
        }
      }
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('userLanguage', newLanguage)
  }
  
  const toggleTranslation = () => {
    const newState = !isTranslationEnabled
    
    if (newState && !isSpeechRecognitionSupported()) {
      alert('Распознавание речи не поддерживается в вашем браузере. Используйте Chrome или Edge для этой функции.')
      return
    }
    
    setIsTranslationEnabled(newState)
    
    if (newState) {
      // Включаем распознавание речи
      if (!recognitionRef.current) {
        const initialized = initializeSpeechRecognition()
        if (!initialized) {
          setIsTranslationEnabled(false)
          return
        }
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (error) {
          console.error('Ошибка запуска распознавания речи:', error)
          setIsTranslationEnabled(false)
        }
      }
    } else {
      // Выключаем распознавание речи
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.error('Ошибка остановки распознавания речи:', error)
        }
      }
    }
  }
  
  // Закрытие селектора языка при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageSelector && !event.target.closest('[data-language-selector]')) {
        setShowLanguageSelector(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLanguageSelector])
  
  // Загружаем сохраненный язык при монтировании
  useEffect(() => {
    const savedLanguage = localStorage.getItem('userLanguage')
    if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage]) {
      setUserLanguage(savedLanguage)
    }
  }, [])

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled
        setIsVideoEnabled(!isVideoEnabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled
        setIsAudioEnabled(!isAudioEnabled)
      }
    }
  }

  const toggleScreenSharing = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        })
        
        const videoTrack = screenStream.getVideoTracks()[0]
        const sender = Object.values(peerConnectionsRef.current).find(pc => 
          pc.getSenders().some(s => s.track?.kind === 'video')
        )?.getSenders().find(s => s.track?.kind === 'video')
        
        if (sender) {
          sender.replaceTrack(videoTrack)
        }
        
        setIsScreenSharing(true)
      } else {
        // Возвращаем обычную камеру
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true
        })
        
        const videoTrack = cameraStream.getVideoTracks()[0]
        const sender = Object.values(peerConnectionsRef.current).find(pc => 
          pc.getSenders().some(s => s.track?.kind === 'video')
        )?.getSenders().find(s => s.track?.kind === 'video')
        
        if (sender) {
          sender.replaceTrack(videoTrack)
        }
        
        setIsScreenSharing(false)
      }
    } catch (error) {
      console.error('Ошибка переключения демонстрации экрана:', error)
    }
  }

  const sendChatMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      const message = {
        id: Date.now(),
        userId: user?.id,
        userName: user?.name,
        message: newMessage,
        timestamp: new Date().toLocaleTimeString(),
        language: userLanguage,
        originalLanguage: userLanguage
      }
      
      // Сразу добавляем сообщение в чат
      setChatMessages(prev => [...prev, message])
      
      // Отправляем на сервер для перевода и рассылки
      socketRef.current.emit('chat-message', {
        sessionId,
        message
      })
      
      setNewMessage('')
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    // Здесь должна быть логика записи
    alert('Запись началась')
  }

  const stopRecording = () => {
    setIsRecording(false)
    // Здесь должна быть логика остановки записи
    alert('Запись остановлена')
  }

  const leaveSession = () => {
    if (confirm('Вы уверены, что хотите покинуть сессию?')) {
      cleanupVideoChat()
      navigate('/client-dashboard')
    }
  }

  const downloadRecording = () => {
    // Здесь должна быть логика скачивания записи
    alert('Скачивание записи...')
  }

  if (!sessionInfo) {
    return <div>Загрузка...</div>
  }

  return (
    <div style={{ height: '100vh', background: '#1a1a1a', display: 'flex', flexDirection: 'column' }}>
      {/* Заголовок сессии */}
      <div style={{ 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{sessionInfo.title}</h2>
          <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>
            {sessionInfo.date} в {sessionInfo.time} • {sessionInfo.duration} мин
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ opacity: 0.8 }}>
            <FaUsers style={{ marginRight: '5px' }} />
            {participants.length} участников
          </span>
          
          {isRecording ? (
            <button
              className="btn btn-secondary"
              onClick={stopRecording}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Остановить запись
            </button>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={startRecording}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Начать запись
            </button>
          )}
        </div>
      </div>

      {/* Основной контент */}
      <div style={{ flex: 1, display: 'flex', gap: '20px', padding: '20px', position: 'relative' }}>
        {/* Индикатор переводов речи в реальном времени */}
        {Object.keys(speechTranslations).length > 0 && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '10px',
            zIndex: 1000,
            maxWidth: '600px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <FaVolumeUp style={{ color: '#4CAF50' }} />
              <strong>Перевод в реальном времени:</strong>
            </div>
            {Object.entries(speechTranslations).map(([lang, text]) => (
              <div key={lang} style={{ marginTop: '8px', fontSize: '14px' }}>
                <span style={{ opacity: 0.7 }}>[{SUPPORTED_LANGUAGES[lang] || lang}]:</span> {text}
              </div>
            ))}
          </div>
        )}
        
        {/* Видео участников */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Локальное видео */}
          <div className="video-stream">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="user-name">
              {user?.name || 'Вы'} (Вы)
              <span style={{ marginLeft: '10px', fontSize: '0.8em', opacity: 0.8 }}>
                [{SUPPORTED_LANGUAGES[userLanguage]}]
              </span>
            </div>
          </div>

          {/* Удаленные видео */}
          {participants.filter(p => p.id !== user?.id).map(participant => (
            <div key={participant.id} className="video-stream">
              <video
                ref={el => remoteVideosRef.current[participant.id] = el}
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="user-name">
                {participant.name}
              </div>
            </div>
          ))}
        </div>

        {/* Чат */}
        {showChat && (
          <div style={{ 
            width: '300px', 
            background: 'white', 
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              padding: '15px', 
              borderBottom: '1px solid #e1e5e9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Чат</h3>
              <button
                onClick={() => setShowChat(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            
            <div style={{ flex: 1, padding: '15px', overflowY: 'auto' }}>
              {chatMessages.map(message => (
                <div key={message.id} style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong style={{ color: '#333' }}>{message.userName}</strong>
                    <span style={{ fontSize: '12px', color: '#666' }}>{message.timestamp}</span>
                  </div>
                  {message.originalLanguage !== userLanguage && message.translatedText ? (
                    <>
                      <p style={{ margin: '0 0 5px 0', color: '#555', fontStyle: 'italic', fontSize: '0.9em' }}>
                        {message.translatedText}
                      </p>
                      <p style={{ margin: 0, color: '#999', fontSize: '0.8em' }}>
                        <span style={{ fontSize: '11px' }}>[{SUPPORTED_LANGUAGES[message.originalLanguage] || message.originalLanguage}]:</span> {message.message}
                      </p>
                    </>
                  ) : (
                    <p style={{ margin: 0, color: '#555' }}>{message.message}</p>
                  )}
                </div>
              ))}
            </div>
            
            <div style={{ padding: '15px', borderTop: '1px solid #e1e5e9' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  style={{ flex: 1, padding: '8px', border: '1px solid #e1e5e9', borderRadius: '4px' }}
                />
                <button
                  onClick={sendChatMessage}
                  className="btn btn-primary"
                  style={{ padding: '8px 12px' }}
                >
                  Отправить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Панель управления */}
      <div style={{ 
        background: 'rgba(0,0,0,0.8)', 
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px'
      }}>
        <button
          className={`btn ${isVideoEnabled ? 'btn-secondary' : 'btn-primary'}`}
          onClick={toggleVideo}
          style={{ padding: '12px 20px', borderRadius: '50px' }}
        >
          {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
        </button>
        
        <button
          className={`btn ${isAudioEnabled ? 'btn-secondary' : 'btn-primary'}`}
          onClick={toggleAudio}
          style={{ padding: '12px 20px', borderRadius: '50px' }}
        >
          {isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>
        
        <button
          className={`btn ${isScreenSharing ? 'btn-primary' : 'btn-secondary'}`}
          onClick={toggleScreenSharing}
          style={{ padding: '12px 20px', borderRadius: '50px' }}
        >
          <FaShare />
        </button>
        
        <button
          className="btn btn-secondary"
          onClick={() => setShowChat(!showChat)}
          style={{ padding: '12px 20px', borderRadius: '50px' }}
        >
          <FaComments />
        </button>
        
        <button
          className={`btn ${isTranslationEnabled ? 'btn-primary' : 'btn-secondary'}`}
          onClick={toggleTranslation}
          style={{ padding: '12px 20px', borderRadius: '50px' }}
          title={isTranslationEnabled ? 'Отключить перевод' : 'Включить перевод'}
        >
          <FaVolumeUp />
        </button>
        
        <div style={{ position: 'relative' }} data-language-selector>
          <button
            className="btn btn-secondary"
            onClick={() => setShowLanguageSelector(!showLanguageSelector)}
            style={{ padding: '12px 20px', borderRadius: '50px' }}
            title="Выбрать язык"
          >
            <FaLanguage />
          </button>
          
          {showLanguageSelector && (
            <div 
              data-language-selector
              style={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              marginBottom: '10px',
              background: 'white',
              borderRadius: '8px',
              padding: '10px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              minWidth: '200px',
              zIndex: 1000
            }}>
              <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                Выберите язык:
              </div>
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    marginBottom: '4px',
                    background: userLanguage === code ? '#007bff' : '#f8f9fa',
                    color: userLanguage === code ? 'white' : '#333',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px'
                  }}
                  onMouseOver={(e) => {
                    if (userLanguage !== code) {
                      e.target.style.background = '#e9ecef'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (userLanguage !== code) {
                      e.target.style.background = '#f8f9fa'
                    }
                  }}
                >
                  {name} {userLanguage === code && '✓'}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          className="btn btn-secondary"
          onClick={downloadRecording}
          style={{ padding: '12px 20px', borderRadius: '50px' }}
        >
          <FaDownload />
        </button>
        
        <button
          className="btn btn-primary"
          onClick={leaveSession}
          style={{ padding: '12px 20px', borderRadius: '50px', background: '#dc3545' }}
        >
          <FaPhone />
        </button>
      </div>
    </div>
  )
}

export default VideoChat
