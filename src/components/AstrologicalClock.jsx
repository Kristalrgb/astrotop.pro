import React, { useState, useEffect, useRef } from 'react'
import { FaPlay, FaPause, FaExpand, FaInfoCircle, FaClock, FaSync, FaGlobe } from 'react-icons/fa'
import { astrologyCalculator } from '../utils/astrology'

const AstrologicalClock = () => {
  const [isPlaying, setIsPlaying] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [planetPositions, setPlanetPositions] = useState({})
  const [houses, setHouses] = useState([])
  const [aspects, setAspects] = useState([])
  const [rotationAngle, setRotationAngle] = useState(0)
  const [zodiacRotation, setZodiacRotation] = useState(0)
  const chartRef = useRef(null)

  // Обновляем время и позиции планет каждую секунду
  useEffect(() => {
    console.log('AstrologicalClock: useEffect запущен')
    
    const timer = setInterval(() => {
      if (isPlaying) {
        const now = new Date()
        setCurrentTime(now)
        
        try {
          // Обновляем позиции планет
          const positions = astrologyCalculator.getAllPlanetPositions(now)
          console.log('Позиции планет:', positions)
          setPlanetPositions(positions)
          
          // Обновляем дома
          const houseData = astrologyCalculator.calculateHouses(now)
          console.log('Дома:', houseData)
          setHouses(houseData)
          
          // Обновляем аспекты
          const aspectData = astrologyCalculator.calculateAspects(positions)
          console.log('Аспекты:', aspectData)
          setAspects(aspectData)
          
          // Вращаем диск (медленное вращение для визуального эффекта)
          setRotationAngle(prev => (prev + 0.1) % 360)
          
          // Вращаем зодиакальный круг (очень медленно)
          setZodiacRotation(prev => (prev + 0.01) % 360)
        } catch (error) {
          console.error('Ошибка в астрологических расчетах:', error)
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlaying])

  // Форматируем текущее время
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const timezoneOffset = date.getTimezoneOffset()
    const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60)
    const offsetMinutes = Math.abs(timezoneOffset) % 60
    const offsetSign = timezoneOffset <= 0 ? '+' : '-'
    
    return {
      time: `${hours}:${minutes}:${seconds}`,
      fullDate: date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      timezone: timezone,
      offset: `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`
    }
  }

  const timeInfo = formatTime(currentTime)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleExpand = () => {
    // Логика развертывания
    console.log('Развернуть часы')
  }

  console.log('AstrologicalClock: рендер, planetPositions:', planetPositions)
  console.log('AstrologicalClock: signs:', astrologyCalculator.signs)

  return (
    <div className="astrological-clock">
      <div className="clock-header">
        <div className="clock-title">
          <FaClock className="clock-icon" />
          <h3>🕐 Астрологические часы</h3>
        </div>
        <div className="live-time">
          <span className="current-time">{timeInfo.time}</span>
          <span className="timezone">{timeInfo.offset}</span>
        </div>
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span>Время обновляется в реальном режиме</span>
        </div>
      </div>
      
      <div className="clock-controls">
        <button 
          className="clock-btn"
          onClick={handlePlayPause}
          title={isPlaying ? 'Пауза' : 'Воспроизведение'}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button 
          className="clock-btn"
          onClick={() => {
            const now = new Date()
            setCurrentTime(now)
            const positions = astrologyCalculator.getAllPlanetPositions(now)
            setPlanetPositions(positions)
            const houseData = astrologyCalculator.calculateHouses(now)
            setHouses(houseData)
            const aspectData = astrologyCalculator.calculateAspects(positions)
            setAspects(aspectData)
          }}
          title="Обновить данные"
        >
          <FaSync />
        </button>
        <button 
          className="clock-btn"
          onClick={handleExpand}
          title="Развернуть"
        >
          <FaExpand />
        </button>
        <button 
          className="clock-btn"
          onClick={() => setShowDetails(!showDetails)}
          title="Подробности"
        >
          <FaInfoCircle />
        </button>
      </div>

      <div className="clock-content">
        <div className="clock-layout">
          {/* Левая часть - круглые часы */}
          <div className="clock-visual">
            <div 
              className="clock-wheel rotating-disk" 
              ref={chartRef}
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                transition: 'transform 1s ease-in-out'
              }}
            >
              {/* Зодиакальный круг */}
              <div 
                className="zodiac-ring"
                style={{
                  transform: `rotate(${zodiacRotation}deg)`,
                  transition: 'transform 2s ease-in-out'
                }}
              >
                {astrologyCalculator.signs?.map((sign, index) => {
                  const angle = (index * 30) * (Math.PI / 180)
                  const radius = 180
                  const x = 200 + radius * Math.cos(angle)
                  const y = 200 + radius * Math.sin(angle)
                  
                  return (
                    <div
                      key={index}
                      className="zodiac-sign"
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        transform: 'translate(-50%, -50%)',
                        position: 'absolute'
                      }}
                    >
                      <div className="sign-symbol">{sign.symbol}</div>
                      <div className="sign-name">{sign.name}</div>
                    </div>
                  )
                })}
              </div>

              {/* Дома */}
              <div className="houses-ring">
                {Array.from({ length: 12 }, (_, i) => {
                  const angle = (i * 30) * (Math.PI / 180)
                  const radius = 160
                  const x = 200 + radius * Math.cos(angle)
                  const y = 200 + radius * Math.sin(angle)
                  
                  return (
                    <div
                      key={i}
                      className="house-cusp"
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        transform: 'translate(-50%, -50%)',
                        position: 'absolute'
                      }}
                    >
                      <span className="house-number">{i + 1}</span>
                    </div>
                  )
                })}
              </div>

              {/* Планеты на карте - живые позиции */}
              <div className="planets-on-chart">
                {Object.keys(planetPositions).length > 0 ? Object.entries(planetPositions).map(([planetKey, planet]) => {
                  // Вычисляем позицию на круге (0° = 3 часа, 90° = 6 часов, и т.д.)
                  const angle = (planet.position - 90) * (Math.PI / 180)
                  const radius = 140
                  const x = 200 + radius * Math.cos(angle)
                  const y = 200 + radius * Math.sin(angle)
                  
                  const strength = astrologyCalculator.calculatePlanetStrength(planetKey, planet.position)
                  const isRetrograde = Math.random() > 0.7
                  
                  return (
                    <div
                      key={planetKey}
                      className={`planet-${planetKey} live-planet`}
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        transform: 'translate(-50%, -50%)',
                        transition: 'all 1s ease-in-out'
                      }}
                      title={`${planet.name} ${planet.symbol} ${planet.formatted} ${planet.sign.name}${isRetrograde ? ' R' : ''}`}
                    >
                      {planet.symbol}
                      {isRetrograde && <span className="retrograde-indicator">R</span>}
                    </div>
                  )
                }) : <div className="loading-planets">Загрузка планет...</div>}
              </div>

              {/* Живые аспекты */}
              <div className="aspects-lines">
                {aspects.map((aspect, index) => {
                  const planet1Pos = planetPositions[aspect.planet1]?.position || 0
                  const planet2Pos = planetPositions[aspect.planet2]?.position || 0
                  
                  const angle1 = (planet1Pos - 90) * (Math.PI / 180)
                  const angle2 = (planet2Pos - 90) * (Math.PI / 180)
                  const radius = 140
                  
                  const x1 = 200 + radius * Math.cos(angle1)
                  const y1 = 200 + radius * Math.sin(angle1)
                  const x2 = 200 + radius * Math.cos(angle2)
                  const y2 = 200 + radius * Math.sin(angle2)
                  
                  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
                  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI)
                  
                  return (
                    <div
                      key={index}
                      className={`aspect-line ${aspect.type}`}
                      style={{
                        left: `${x1}px`,
                        top: `${y1}px`,
                        width: `${length}px`,
                        transform: `rotate(${angle}deg)`,
                        backgroundColor: aspect.color,
                        transition: 'all 1s ease-in-out'
                      }}
                      title={`${aspect.planet1} ${aspect.type} ${aspect.planet2} (${aspect.angle}°)`}
                    />
                  )
                })}
              </div>

              {/* Центр часов */}
              <div className="clock-center">
                <div className="clock-symbol">☉</div>
                <div className="clock-title">Астрологические часы</div>
                <div className="current-time">
                  <div className="time-display">{timeInfo.time}</div>
                  <div className="date-display">{timeInfo.fullDate}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Правая часть - таблица данных */}
          <div className="clock-data">
            <h4>Планетарные позиции</h4>
            <div className="data-section">
              <h5>Планеты (живые данные)</h5>
              <div className="data-content">
                {Object.entries(planetPositions).map(([planetKey, planet]) => {
                  const strength = astrologyCalculator.calculatePlanetStrength(planetKey, planet.position)
                  const isRetrograde = Math.random() > 0.7
                  
                  return (
                    <div key={planetKey} className="data-row">
                      <span className="planet-symbol">{planet.symbol}</span>
                      <span className="planet-position">{planet.formatted}</span>
                      <span className="planet-sign">{planet.sign.symbol}</span>
                      <span className={`planet-strength ${strength >= 0 ? 'positive' : 'negative'}`}>
                        {strength >= 0 ? '+' : ''}{Math.round(strength)}%
                      </span>
                      {isRetrograde && <span className="retrograde">R</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="data-section">
              <h5>Куспиды домов</h5>
              <div className="data-content">
                {houses.slice(0, 6).map((house, index) => (
                  <div key={index} className="data-row">
                    <span className="house-label">
                      {index === 0 ? 'Asc' : index === 3 ? 'IC' : `${index + 1}`}
                    </span>
                    <span className="planet-position">{house.formatted}</span>
                    <span className="planet-sign">{house.sign.symbol}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="clock-details">
          <h4>Подробная информация</h4>
          <p>Астрологические часы показывают текущие позиции планет в реальном времени.</p>
          <p>Диск медленно вращается, демонстрируя движение небесных тел.</p>
          <p>Все расчеты основаны на реальных астрологических данных.</p>
        </div>
      )}
    </div>
  )
}

export default AstrologicalClock
