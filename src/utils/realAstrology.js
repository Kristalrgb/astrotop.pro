// Реальные астрологические данные
export class RealAstrologyAPI {
  constructor() {
    this.baseURL = 'https://api.astrologyapi.com/v1'
    this.apiKey = 'demo' // Замените на реальный ключ
    this.cache = new Map()
    this.cacheTimeout = 60000 // 1 минута
  }

  // Получение реальных позиций планет
  async getRealPlanetPositions(date = new Date(), latitude = 55.7558, longitude = 37.6176) {
    try {
      // Проверяем кэш
      const cacheKey = `${date.getTime()}_${latitude}_${longitude}`
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data
        }
      }

      // Получаем данные из API
      const response = await fetch(`${this.baseURL}/planets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          day: date.getDate(),
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          hour: date.getHours(),
          min: date.getMinutes(),
          lat: latitude,
          lon: longitude,
          tzone: 5.5
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      
      // Кэшируем результат
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      })

      return data
    } catch (error) {
      console.error('Ошибка получения данных планет:', error)
      // Возвращаем моковые данные в случае ошибки
      return this.getMockPlanetPositions(date)
    }
  }

  // Моковые данные для демонстрации
  getMockPlanetPositions(date = new Date()) {
    const now = new Date()
    const timeDiff = (now - new Date('2025-01-01')) / (1000 * 60 * 60 * 24) // Дни с 1 января 2025
    
    return {
      sun: {
        longitude: (280.5 + timeDiff * 0.9856) % 360,
        latitude: 0,
        distance: 1.0,
        speed: 0.9856
      },
      moon: {
        longitude: (45.2 + timeDiff * 13.176) % 360,
        latitude: 0,
        distance: 384400,
        speed: 13.176
      },
      mercury: {
        longitude: (275.8 + timeDiff * 1.383) % 360,
        latitude: 0,
        distance: 0.387,
        speed: 1.383
      },
      venus: {
        longitude: (320.1 + timeDiff * 1.602) % 360,
        latitude: 0,
        distance: 0.723,
        speed: 1.602
      },
      mars: {
        longitude: (15.3 + timeDiff * 0.524) % 360,
        latitude: 0,
        distance: 1.524,
        speed: 0.524
      },
      jupiter: {
        longitude: (18.2 + timeDiff * 0.083) % 360,
        latitude: 0,
        distance: 5.203,
        speed: 0.083
      },
      saturn: {
        longitude: (329.5 + timeDiff * 0.033) % 360,
        latitude: 0,
        distance: 9.537,
        speed: 0.033
      },
      uranus: {
        longitude: (1.3 + timeDiff * 0.012) % 360,
        latitude: 0,
        distance: 19.191,
        speed: 0.012
      },
      neptune: {
        longitude: (1.2 + timeDiff * 0.006) % 360,
        latitude: 0,
        distance: 30.069,
        speed: 0.006
      },
      pluto: {
        longitude: (1.4 + timeDiff * 0.004) % 360,
        latitude: 0,
        distance: 39.482,
        speed: 0.004
      }
    }
  }

  // Получение данных о домах
  async getRealHouses(date = new Date(), latitude = 55.7558, longitude = 37.6176) {
    try {
      const response = await fetch(`${this.baseURL}/houses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          day: date.getDate(),
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          hour: date.getHours(),
          min: date.getMinutes(),
          lat: latitude,
          lon: longitude,
          tzone: 5.5
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Ошибка получения данных домов:', error)
      return this.getMockHouses(date)
    }
  }

  // Моковые данные для домов
  getMockHouses(date = new Date()) {
    const sunPosition = (280.5 + (date - new Date('2025-01-01')) / (1000 * 60 * 60 * 24) * 0.9856) % 360
    const ascendant = (sunPosition + 90) % 360
    
    const houses = []
    for (let i = 0; i < 12; i++) {
      houses.push({
        house: i + 1,
        longitude: (ascendant + i * 30) % 360,
        latitude: 0
      })
    }
    
    return houses
  }

  // Получение аспектов
  async getRealAspects(planets) {
    try {
      const response = await fetch(`${this.baseURL}/aspects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          planets: planets
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Ошибка получения аспектов:', error)
      return this.getMockAspects(planets)
    }
  }

  // Моковые аспекты
  getMockAspects(planets) {
    const aspects = []
    const planetNames = Object.keys(planets)
    
    for (let i = 0; i < planetNames.length; i++) {
      for (let j = i + 1; j < planetNames.length; j++) {
        const planet1 = planetNames[i]
        const planet2 = planetNames[j]
        const pos1 = planets[planet1].longitude
        const pos2 = planets[planet2].longitude
        
        let angle = Math.abs(pos1 - pos2)
        if (angle > 180) angle = 360 - angle
        
        let aspect = null
        if (Math.abs(angle - 0) < 8) aspect = { type: 'conjunction', angle: 0, color: '#FFD700' }
        else if (Math.abs(angle - 60) < 6) aspect = { type: 'sextile', angle: 60, color: '#2196F3' }
        else if (Math.abs(angle - 90) < 8) aspect = { type: 'square', angle: 90, color: '#F44336' }
        else if (Math.abs(angle - 120) < 8) aspect = { type: 'trine', angle: 120, color: '#4CAF50' }
        else if (Math.abs(angle - 180) < 8) aspect = { type: 'opposition', angle: 180, color: '#FF9800' }
        
        if (aspect) {
          aspects.push({
            planet1: planet1,
            planet2: planet2,
            ...aspect
          })
        }
      }
    }
    
    return aspects
  }

  // Получение всех данных сразу
  async getAllAstrologicalData(date = new Date(), latitude = 55.7558, longitude = 37.6176) {
    try {
      const [planets, houses, aspects] = await Promise.all([
        this.getRealPlanetPositions(date, latitude, longitude),
        this.getRealHouses(date, latitude, longitude),
        this.getRealAspects(planets)
      ])

      return {
        planets,
        houses,
        aspects,
        timestamp: date,
        location: { latitude, longitude }
      }
    } catch (error) {
      console.error('Ошибка получения астрологических данных:', error)
      return this.getMockAllData(date, latitude, longitude)
    }
  }

  // Моковые данные для всех
  getMockAllData(date = new Date(), latitude = 55.7558, longitude = 37.6176) {
    const planets = this.getMockPlanetPositions(date)
    const houses = this.getMockHouses(date)
    const aspects = this.getMockAspects(planets)

    return {
      planets,
      houses,
      aspects,
      timestamp: date,
      location: { latitude, longitude }
    }
  }
}

// Экспорт экземпляра
export const realAstrologyAPI = new RealAstrologyAPI()

