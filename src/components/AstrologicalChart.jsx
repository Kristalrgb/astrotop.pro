import React, { useState, useEffect, useRef } from 'react'
import { FaPlay, FaPause, FaExpand, FaInfoCircle, FaClock, FaSync } from 'react-icons/fa'
import { astrologyCalculator } from '../utils/astrology'

const AstrologicalChart = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [planetPositions, setPlanetPositions] = useState({})
  const [houses, setHouses] = useState([])
  const [aspects, setAspects] = useState([])
  const [rotationAngle, setRotationAngle] = useState(0)
  const chartRef = useRef(null)

  // Обновляем время и позиции планет каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)
      
      // Обновляем позиции планет
      const positions = astrologyCalculator.getAllPlanetPositions(now)
      setPlanetPositions(positions)
      
      // Обновляем дома
      const houseData = astrologyCalculator.calculateHouses(now)
      setHouses(houseData)
      
      // Обновляем аспекты
      const aspectData = astrologyCalculator.calculateAspects(positions)
      setAspects(aspectData)
      
      // Вращаем диск (медленное вращение для визуального эффекта)
      setRotationAngle(prev => (prev + 0.1) % 360)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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
      timezone: `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`,
      date: date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }),
      fullDate: date.toLocaleDateString('ru-RU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  const timeInfo = formatTime(currentTime)

  const chartData = {
    date: timeInfo.date,
    time: `${timeInfo.time} ${timeInfo.timezone}`,
    location: '38°32\'08" N, 68°46\'44" E',
    planets: [
      { name: 'Солнце', symbol: '☉', position: '11°32\'14"', sign: 'Дева', house: '4', strength: '+98%' },
      { name: 'Луна', symbol: '☽', position: '21°40\'38"', sign: 'Дева', house: '4', strength: '+97%' },
      { name: 'Меркурий', symbol: '☿', position: '2°22\'44"', sign: 'Дева', house: '4', strength: '+158%' },
      { name: 'Венера', symbol: '♀', position: '10°55\'17"', sign: 'Лев', house: '3', strength: '+115%' },
      { name: 'Марс', symbol: '♂', position: '17°44\'0"', sign: 'Весы', house: '5', strength: '+115%' },
      { name: 'Юпитер', symbol: '♃', position: '18°22\'6"', sign: 'Скорпион', house: '6', strength: '+131%' },
      { name: 'Сатурн', symbol: '♄', position: '29°49\'36"', sign: 'Рыбы', house: '10', strength: '-102%', retrograde: true },
      { name: 'Уран', symbol: '♅', position: '1°27\'40"', sign: 'Телец', house: '12', strength: '+5%', retrograde: true },
      { name: 'Нептун', symbol: '♆', position: '1°17\'26"', sign: 'Овен', house: '11', strength: '-119%', retrograde: true },
      { name: 'Плутон', symbol: '♇', position: '1°43\'39"', sign: 'Водолей', house: '9', strength: '-106%', retrograde: true }
    ],
    aspects: [
      { type: 'Трин', planets: ['Солнце', 'Луна'], color: '#4CAF50' },
      { type: 'Квадрат', planets: ['Марс', 'Юпитер'], color: '#F44336' },
      { type: 'Секстиль', planets: ['Венера', 'Меркурий'], color: '#4CAF50' }
    ]
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleExpand = () => {
    // Здесь можно добавить функциональность полноэкранного режима
    console.log('Развернуть карту')
  }

  return (
    <div className="astrological-chart-container">
      <div className="chart-header">
        <div className="chart-info">
          <h3>
            <FaClock style={{ marginRight: '10px', animation: 'pulse 2s infinite' }} />
            Онлайн астрологические часы
          </h3>
          <div className="chart-meta">
            <span className="chart-date">{chartData.date}</span>
            <span className="chart-time live-time">{chartData.time}</span>
            <span className="chart-location">{chartData.location}</span>
          </div>
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span>Время обновляется в реальном режиме</span>
          </div>
        </div>
        <div className="chart-controls">
          <button 
            className="chart-btn"
            onClick={handlePlayPause}
            title={isPlaying ? 'Пауза' : 'Воспроизведение'}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button 
            className="chart-btn"
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
            className="chart-btn"
            onClick={handleExpand}
            title="Развернуть"
          >
            <FaExpand />
          </button>
          <button 
            className="chart-btn"
            onClick={() => setShowDetails(!showDetails)}
            title="Подробности"
          >
            <FaInfoCircle />
          </button>
        </div>
      </div>

      <div className="chart-content">
        <div className="chart-layout">
          {/* Левая часть - круглая карта */}
          <div className="chart-visual">
            <div 
              className="chart-wheel rotating-disk" 
              ref={chartRef}
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                transition: 'transform 1s ease-in-out'
              }}
            >
              <div className="chart-center">
                <div className="chart-symbol">☉</div>
                <div className="chart-title">Астрологические часы</div>
                <div className="current-time">
                  <div className="time-display">{timeInfo.time}</div>
                  <div className="date-display">{timeInfo.fullDate}</div>
                </div>
              </div>
              
              {/* Знаки зодиака по кругу */}
              <div className="zodiac-ring">
                {[
                  { name: 'Близнецы', symbol: 'II', degrees: '29°6\'30"' },
                  { name: 'Рак', symbol: '♋', degrees: '19°43\'10"' },
                  { name: 'Лев', symbol: '♌', degrees: '11°11\'52"' },
                  { name: 'Дева', symbol: '♍', degrees: '7°7\'2"' },
                  { name: 'Весы', symbol: '♎', degrees: '10°51\'5"' },
                  { name: 'Скорпион', symbol: '♏', degrees: '21°18\'40"' },
                  { name: 'Стрелец', symbol: '♐', degrees: '1°' },
                  { name: 'Козерог', symbol: '♑', degrees: '11°' },
                  { name: 'Водолей', symbol: '♒', degrees: '18°' },
                  { name: 'Рыбы', symbol: '♓', degrees: '20°' },
                  { name: 'Овен', symbol: '♈', degrees: '21°' },
                  { name: 'Телец', symbol: '♉', degrees: '29°' }
                ].map((sign, i) => (
                  <div key={sign.name} className={`zodiac-segment zodiac-${i + 1}`}>
                    <div className="zodiac-symbol">{sign.symbol}</div>
                    <div className="zodiac-degrees">{sign.degrees}</div>
                  </div>
                ))}
              </div>

              {/* Дома */}
              <div className="chart-houses">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className={`house house-${i + 1}`}>
                    <span className="house-number">{i + 1}</span>
                  </div>
                ))}
              </div>

              {/* Планеты на карте - живые позиции */}
              <div className="planets-on-chart">
                {Object.entries(planetPositions).map(([planetKey, planet]) => {
                  // Вычисляем позицию на круге (0° = 3 часа, 90° = 6 часов, и т.д.)
                  const angle = (planet.position - 90) * (Math.PI / 180) // Конвертируем в радианы и сдвигаем
                  const radius = 150 // Радиус от центра
                  const x = 200 + radius * Math.cos(angle) // Центр круга 200px
                  const y = 200 + radius * Math.sin(angle)
                  
                  const strength = astrologyCalculator.calculatePlanetStrength(planetKey, planet.position)
                  const isRetrograde = Math.random() > 0.7 // Упрощенная логика ретроградности
                  
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
                })}
              </div>

              {/* Живые аспекты */}
              <div className="aspects-lines">
                {aspects.map((aspect, index) => {
                  const planet1Pos = planetPositions[aspect.planet1]?.position || 0
                  const planet2Pos = planetPositions[aspect.planet2]?.position || 0
                  
                  // Вычисляем позиции планет на круге
                  const angle1 = (planet1Pos - 90) * (Math.PI / 180)
                  const angle2 = (planet2Pos - 90) * (Math.PI / 180)
                  const radius = 150
                  
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
            </div>
          </div>

          {/* Правая часть - таблица Плацидус */}
          <div className="placidus-table">
            <h4>Плацидус</h4>
            <div className="table-section">
              <h5>Планеты (живые данные)</h5>
              <div className="table-content">
                {Object.entries(planetPositions).map(([planetKey, planet]) => {
                  const strength = astrologyCalculator.calculatePlanetStrength(planetKey, planet.position)
                  const isRetrograde = Math.random() > 0.7 // Упрощенная логика
                  
                  return (
                    <div key={planetKey} className="table-row">
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

            <div className="table-section">
              <h5>Куспиды домов (живые)</h5>
              <div className="table-content">
                {houses.slice(0, 6).map((house, index) => (
                  <div key={index} className="table-row">
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

        {showDetails && (
          <div className="chart-details">
            <h4>Планетарные позиции</h4>
            <div className="planets-list">
              {chartData.planets.map((planet, index) => (
                <div key={index} className="planet-item">
                  <div className="planet-symbol">{planet.symbol}</div>
                  <div className="planet-info">
                    <div className="planet-name">
                      {planet.name}
                      {planet.retrograde && <span className="retrograde">R</span>}
                    </div>
                    <div className="planet-position">
                      {planet.position} {planet.sign} (Дом {planet.house})
                    </div>
                  </div>
                  <div className={`planet-strength ${planet.strength.startsWith('+') ? 'positive' : 'negative'}`}>
                    {planet.strength}
                  </div>
                </div>
              ))}
            </div>

            <h4>Аспекты</h4>
            <div className="aspects-list">
              {chartData.aspects.map((aspect, index) => (
                <div key={index} className="aspect-item">
                  <div 
                    className="aspect-line" 
                    style={{ backgroundColor: aspect.color }}
                  ></div>
                  <span className="aspect-type">{aspect.type}</span>
                  <span className="aspect-planets">{aspect.planets.join(' - ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="chart-footer">
        <p>Онлайн астрологические часы с реальным временем и интерактивной натальной картой</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary">
            Получить полный анализ
          </button>
          <button className="btn btn-secondary">
            Создать свою карту
          </button>
        </div>
      </div>
    </div>
  )
}

export default AstrologicalChart
