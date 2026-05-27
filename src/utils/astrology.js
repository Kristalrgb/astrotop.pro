// Астрологические расчеты для живой карты
export class AstrologyCalculator {
  constructor() {
    this.planets = {
      sun: { symbol: '☉', name: 'Солнце', speed: 0.9856 }, // градусов в день
      moon: { symbol: '☽', name: 'Луна', speed: 13.176 }, // градусов в день
      mercury: { symbol: '☿', name: 'Меркурий', speed: 1.383 },
      venus: { symbol: '♀', name: 'Венера', speed: 1.602 },
      mars: { symbol: '♂', name: 'Марс', speed: 0.524 },
      jupiter: { symbol: '♃', name: 'Юпитер', speed: 0.083 },
      saturn: { symbol: '♄', name: 'Сатурн', speed: 0.033 },
      uranus: { symbol: '♅', name: 'Уран', speed: 0.012 },
      neptune: { symbol: '♆', name: 'Нептун', speed: 0.006 },
      pluto: { symbol: '♇', name: 'Плутон', speed: 0.004 }
    };

    this.signs = [
      { name: 'Овен', symbol: '♈', element: 'fire', quality: 'cardinal' },
      { name: 'Телец', symbol: '♉', element: 'earth', quality: 'fixed' },
      { name: 'Близнецы', symbol: '♊', element: 'air', quality: 'mutable' },
      { name: 'Рак', symbol: '♋', element: 'water', quality: 'cardinal' },
      { name: 'Лев', symbol: '♌', element: 'fire', quality: 'fixed' },
      { name: 'Дева', symbol: '♍', element: 'earth', quality: 'mutable' },
      { name: 'Весы', symbol: '♎', element: 'air', quality: 'cardinal' },
      { name: 'Скорпион', symbol: '♏', element: 'water', quality: 'fixed' },
      { name: 'Стрелец', symbol: '♐', element: 'fire', quality: 'mutable' },
      { name: 'Козерог', symbol: '♑', element: 'earth', quality: 'cardinal' },
      { name: 'Водолей', symbol: '♒', element: 'air', quality: 'fixed' },
      { name: 'Рыбы', symbol: '♓', element: 'water', quality: 'mutable' }
    ];

    // Базовые позиции планет на 1 января 2025 года (эпоха J2000.0)
    this.basePositions = {
      sun: 280.5, // Козерог
      moon: 45.2, // Телец
      mercury: 275.8, // Козерог
      venus: 320.1, // Водолей
      mars: 15.3, // Овен
      jupiter: 18.2, // Овен
      saturn: 329.5, // Водолей
      uranus: 1.3, // Телец
      neptune: 1.2, // Овен
      pluto: 1.4, // Водолей
      node: 18.2, // Северный узел
      chiron: 17.9 // Скорпион
    };
  }

  // Расчет позиции планеты в реальном времени
  calculatePlanetPosition(planet, date = new Date()) {
    const baseDate = new Date('2025-01-01T00:00:00Z');
    const daysDiff = (date - baseDate) / (1000 * 60 * 60 * 24);
    
    const basePosition = this.basePositions[planet] || 0;
    const speed = this.planets[planet]?.speed || 0;
    
    let position = basePosition + (speed * daysDiff);
    
    // Нормализация в диапазон 0-360
    position = ((position % 360) + 360) % 360;
    
    return position;
  }

  // Получение знака зодиака по позиции
  getSignByPosition(position) {
    const signIndex = Math.floor(position / 30);
    return this.signs[signIndex] || this.signs[0];
  }

  // Расчет градусов в знаке
  getDegreesInSign(position) {
    return position % 30;
  }

  // Форматирование позиции планеты
  formatPlanetPosition(position) {
    const degrees = Math.floor(position);
    const minutes = Math.floor((position - degrees) * 60);
    const seconds = Math.floor(((position - degrees) * 60 - minutes) * 60);
    
    return `${degrees}°${minutes}'${seconds}"`;
  }

  // Расчет всех планетарных позиций
  getAllPlanetPositions(date = new Date()) {
    const positions = {};
    
    Object.keys(this.planets).forEach(planet => {
      const position = this.calculatePlanetPosition(planet, date);
      const sign = this.getSignByPosition(position);
      const degrees = this.getDegreesInSign(position);
      
      positions[planet] = {
        position: position,
        degrees: degrees,
        sign: sign,
        formatted: this.formatPlanetPosition(position),
        symbol: this.planets[planet].symbol,
        name: this.planets[planet].name
      };
    });

    // Добавляем узлы и хирон
    positions.node = {
      position: this.calculatePlanetPosition('node', date),
      degrees: this.getDegreesInSign(this.calculatePlanetPosition('node', date)),
      sign: this.getSignByPosition(this.calculatePlanetPosition('node', date)),
      formatted: this.formatPlanetPosition(this.calculatePlanetPosition('node', date)),
      symbol: '☊',
      name: 'Северный узел'
    };

    positions.chiron = {
      position: this.calculatePlanetPosition('chiron', date),
      degrees: this.getDegreesInSign(this.calculatePlanetPosition('chiron', date)),
      sign: this.getSignByPosition(this.calculatePlanetPosition('chiron', date)),
      formatted: this.formatPlanetPosition(this.calculatePlanetPosition('chiron', date)),
      symbol: '⚷',
      name: 'Хирон'
    };

    return positions;
  }

  // Расчет силы планеты (упрощенный)
  calculatePlanetStrength(planet, position) {
    const sign = this.getSignByPosition(position);
    const degrees = this.getDegreesInSign(position);
    
    // Базовые силы в знаках
    const signStrengths = {
      sun: { fire: 100, earth: 80, air: 70, water: 60 },
      moon: { water: 100, earth: 90, fire: 70, air: 60 },
      mercury: { air: 100, earth: 90, fire: 70, water: 60 },
      venus: { earth: 100, water: 90, air: 80, fire: 70 },
      mars: { fire: 100, earth: 80, air: 60, water: 50 },
      jupiter: { fire: 100, water: 90, air: 80, earth: 70 },
      saturn: { earth: 100, air: 80, water: 70, fire: 60 },
      uranus: { air: 100, fire: 80, water: 70, earth: 60 },
      neptune: { water: 100, earth: 80, fire: 70, air: 60 },
      pluto: { water: 100, earth: 90, fire: 70, air: 60 }
    };

    const baseStrength = signStrengths[planet]?.[sign.element] || 50;
    
    // Корректировка по градусам (критические градусы)
    let degreeModifier = 0;
    if (degrees < 5 || degrees > 25) degreeModifier = 20; // Критические градусы
    else if (degrees > 10 && degrees < 20) degreeModifier = 10; // Сильные градусы
    
    return Math.min(200, Math.max(-200, baseStrength + degreeModifier));
  }

  // Расчет домов (упрощенная система)
  calculateHouses(date = new Date(), latitude = 38.5, longitude = 68.8) {
    // Упрощенный расчет домов по системе Плацидус
    const sunPosition = this.calculatePlanetPosition('sun', date);
    const ascendant = (sunPosition + 90) % 360; // Упрощение
    
    const houses = [];
    for (let i = 0; i < 12; i++) {
      const houseCusp = (ascendant + (i * 30)) % 360;
      const sign = this.getSignByPosition(houseCusp);
      const degrees = this.getDegreesInSign(houseCusp);
      
      houses.push({
        number: i + 1,
        cusp: houseCusp,
        sign: sign,
        degrees: degrees,
        formatted: this.formatPlanetPosition(houseCusp)
      });
    }
    
    return houses;
  }

  // Расчет аспектов между планетами
  calculateAspects(positions) {
    const aspects = [];
    const planetNames = Object.keys(positions);
    
    for (let i = 0; i < planetNames.length; i++) {
      for (let j = i + 1; j < planetNames.length; j++) {
        const planet1 = planetNames[i];
        const planet2 = planetNames[j];
        const pos1 = positions[planet1].position;
        const pos2 = positions[planet2].position;
        
        let angle = Math.abs(pos1 - pos2);
        if (angle > 180) angle = 360 - angle;
        
        // Определение аспекта
        let aspect = null;
        if (Math.abs(angle - 0) < 8) aspect = { type: 'conjunction', angle: 0, color: '#FFD700' };
        else if (Math.abs(angle - 60) < 6) aspect = { type: 'sextile', angle: 60, color: '#2196F3' };
        else if (Math.abs(angle - 90) < 8) aspect = { type: 'square', angle: 90, color: '#F44336' };
        else if (Math.abs(angle - 120) < 8) aspect = { type: 'trine', angle: 120, color: '#4CAF50' };
        else if (Math.abs(angle - 180) < 8) aspect = { type: 'opposition', angle: 180, color: '#FF9800' };
        
        if (aspect) {
          aspects.push({
            planet1: planet1,
            planet2: planet2,
            ...aspect
          });
        }
      }
    }
    
    return aspects;
  }
}

// Экспорт экземпляра калькулятора
export const astrologyCalculator = new AstrologyCalculator();

