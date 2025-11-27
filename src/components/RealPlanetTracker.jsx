import React, { useState, useEffect } from 'react'
import { FaGlobe, FaSync, FaInfoCircle, FaClock } from 'react-icons/fa'
import { realAstrologyAPI } from '../utils/realAstrology'

const RealPlanetTracker = () => {
  const [planetData, setPlanetData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const planetNames = {
    sun: { name: 'Солнце', symbol: '☉', color: '#FFD700' },
    moon: { name: 'Луна', symbol: '☽', color: '#C0C0C0' },
    mercury: { name: 'Меркурий', symbol: '☿', color: '#8C7853' },
    venus: { name: 'Венера', symbol: '♀', color: '#FFC649' },
    mars: { name: 'Марс', symbol: '♂', color: '#CD5C5C' },
    jupiter: { name: 'Юпитер', symbol: '♃', color: '#D2691E' },
    saturn: { name: 'Сатурн', symbol: '♄', color: '#FAD5A5' },
    uranus: { name: 'Уран', symbol: '♅', color: '#4FD0E7' },
    neptune: { name: 'Нептун', symbol: '♆', color: '#4B70DD' },
    pluto: { name: 'Плутон', symbol: '♇', color: '#8B008B' }
  }

  const zodiacSigns = [
    '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'
  ]

  const getZodiacSign = (longitude) => {
    const signIndex = Math.floor(longitude / 30)
    return zodiacSigns[signIndex] || zodiacSigns[0]
  }

  const getDegreesInSign = (longitude) => {
    return longitude % 30
  }

  const formatLongitude = (longitude) => {
    const degrees = Math.floor(longitude)
    const minutes = Math.floor((longitude - degrees) * 60)
    const seconds = Math.floor(((longitude - degrees) * 60 - minutes) * 60)
    return `${degrees}°${minutes}'${seconds}"`
  }

  const loadPlanetData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await realAstrologyAPI.getAllAstrologicalData()
      setPlanetData(data)
      setLastUpdate(new Date())
    } catch (err) {
      setError('Ошибка загрузки данных о планетах')
      console.error('Ошибка:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlanetData()
    
    // Обновляем данные каждые 5 минут
    const interval = setInterval(loadPlanetData, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading && !planetData) {
    return (
      <div className="real-planet-tracker">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка данных о планетах...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="real-planet-tracker">
        <div className="error-container">
          <p>❌ {error}</p>
          <button onClick={loadPlanetData} className="retry-btn">
            <FaSync /> Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="real-planet-tracker">
      <div className="tracker-header">
        <div className="tracker-title">
          <FaGlobe className="globe-icon" />
          <h3>🌍 Реальное положение планет</h3>
        </div>
        <div className="tracker-controls">
          <button onClick={loadPlanetData} className="refresh-btn" disabled={loading}>
            <FaSync className={loading ? 'spinning' : ''} />
          </button>
          <div className="last-update">
            <FaClock />
            <span>
              {lastUpdate ? lastUpdate.toLocaleTimeString('ru-RU') : 'Не обновлено'}
            </span>
          </div>
        </div>
      </div>

      <div className="tracker-content">
        <div className="planets-grid">
          {Object.entries(planetData?.planets || {}).map(([planetKey, planet]) => {
            const planetInfo = planetNames[planetKey]
            if (!planetInfo) return null

            const zodiacSign = getZodiacSign(planet.longitude)
            const degreesInSign = getDegreesInSign(planet.longitude)
            const formattedLongitude = formatLongitude(planet.longitude)

            return (
              <div key={planetKey} className="planet-card">
                <div className="planet-header">
                  <div 
                    className="planet-symbol"
                    style={{ color: planetInfo.color }}
                  >
                    {planetInfo.symbol}
                  </div>
                  <div className="planet-name">{planetInfo.name}</div>
                </div>
                
                <div className="planet-data">
                  <div className="planet-position">
                    <div className="longitude">
                      <span className="label">Долгота:</span>
                      <span className="value">{formattedLongitude}</span>
                    </div>
                    <div className="zodiac">
                      <span className="label">Знак:</span>
                      <span className="value">
                        {zodiacSign} {degreesInSign.toFixed(1)}°
                      </span>
                    </div>
                  </div>
                  
                  <div className="planet-physics">
                    <div className="distance">
                      <span className="label">Расстояние:</span>
                      <span className="value">
                        {planet.distance ? `${planet.distance.toFixed(3)} а.е.` : 'N/A'}
                      </span>
                    </div>
                    <div className="speed">
                      <span className="label">Скорость:</span>
                      <span className="value">
                        {planet.speed ? `${planet.speed.toFixed(3)}°/день` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {planetData?.houses && (
          <div className="houses-section">
            <h4>Дома (Плацидус)</h4>
            <div className="houses-grid">
              {planetData.houses.slice(0, 6).map((house, index) => {
                const zodiacSign = getZodiacSign(house.longitude)
                const degreesInSign = getDegreesInSign(house.longitude)
                const formattedLongitude = formatLongitude(house.longitude)
                
                return (
                  <div key={index} className="house-card">
                    <div className="house-number">
                      {index === 0 ? 'Asc' : index === 3 ? 'IC' : `${index + 1}`}
                    </div>
                    <div className="house-position">
                      <span className="zodiac-sign">{zodiacSign}</span>
                      <span className="degrees">{degreesInSign.toFixed(1)}°</span>
                    </div>
                    <div className="house-longitude">{formattedLongitude}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {planetData?.aspects && planetData.aspects.length > 0 && (
          <div className="aspects-section">
            <h4>Аспекты</h4>
            <div className="aspects-list">
              {planetData.aspects.map((aspect, index) => {
                const planet1Info = planetNames[aspect.planet1]
                const planet2Info = planetNames[aspect.planet2]
                
                return (
                  <div key={index} className="aspect-item">
                    <div className="aspect-planets">
                      <span className="planet1">{planet1Info?.symbol} {planet1Info?.name}</span>
                      <span className="aspect-type" style={{ color: aspect.color }}>
                        {aspect.type}
                      </span>
                      <span className="planet2">{planet2Info?.symbol} {planet2Info?.name}</span>
                    </div>
                    <div className="aspect-angle">{aspect.angle}°</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RealPlanetTracker

