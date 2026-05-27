import React, { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useSpecialists } from '../contexts/SpecialistsContext'
import SpecialistCard from '../components/SpecialistCard'
import { FaStar, FaFilter, FaSearch, FaVideo, FaHeadphones } from 'react-icons/fa'
import AdBanner from '../components/AdBanner'

const Specialists = () => {
  const { t, currentLanguage } = useLanguage()
  const isEnglish = currentLanguage === 'en'
  const { specialists: allSpecialists } = useSpecialists()
  const [filteredSpecialists, setFilteredSpecialists] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [sortBy, setSortBy] = useState('rating')
  const [showFilters, setShowFilters] = useState(true)
  const [onlineOnly, setOnlineOnly] = useState(false)

  // Обновляем отфильтрованных специалистов при изменении списка
  useEffect(() => {
    console.log('Список специалистов обновлен:', allSpecialists)
    if (allSpecialists && allSpecialists.length > 0) {
      setFilteredSpecialists(allSpecialists)
    }
  }, [allSpecialists])

  const specialties = ['all', 'Астролог', 'Таролог', 'Астролог-нумеролог', 'Таролог-медиум']

  // Простая функция фильтрации
  const filterSpecialists = () => {
    console.log('=== ФИЛЬТРАЦИЯ ===')
    console.log('selectedSpecialty:', selectedSpecialty)
    console.log('onlineOnly:', onlineOnly)
    console.log('allSpecialists count:', allSpecialists.length)
    
    if (!allSpecialists || allSpecialists.length === 0) {
      console.log('Нет специалистов для фильтрации')
      setFilteredSpecialists([])
      return
    }
    
    let result = allSpecialists
    
    // Фильтр по специализации
    if (selectedSpecialty !== 'all') {
      result = result.filter(specialist => specialist.specialty === selectedSpecialty)
      console.log('После фильтра по специализации:', result.length)
    }
    
    // Фильтр по поиску
    if (searchTerm) {
      result = result.filter(specialist => 
        specialist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specialist.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
      console.log('После фильтра по поиску:', result.length)
    }
    
    // Фильтр "Онлайн" - показываем только тех, кто готов к консультации
    if (onlineOnly) {
      result = result.filter(specialist => specialist.isOnline === true)
      console.log('После фильтра "Онлайн":', result.length)
    }
    
    // Сортировка
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating
        case 'price': return a.price - b.price
        case 'experience': return parseInt(b.experience) - parseInt(a.experience)
        case 'reviews': return b.reviews - a.reviews
        default: return 0
      }
    })
    
    console.log('Финальный результат:', result.length)
    setFilteredSpecialists(result)
  }

  // Запускаем фильтрацию при изменении параметров
  useEffect(() => {
    filterSpecialists()
  }, [allSpecialists, searchTerm, selectedSpecialty, sortBy, onlineOnly])

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`star ${i < Math.floor(rating) ? '' : 'empty'}`}>
        ★
      </span>
    ))
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        {/* Реклама вверху страницы специалистов */}
        <AdBanner 
          size="banner" 
          position="top" 
          id="specialists-top-ad" 
          showLabel={true}
        />
        
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '40px', 
          color: 'white', 
          fontSize: '3rem',
          WebkitTextStroke: '1.6px black',
          textStroke: '1.6px black'
        }}>
          {t('specialists.title')}
        </h1>

                 {/* Отладочная информация */}
         <div style={{ 
           background: 'rgba(0, 0, 0, 0.5)', 
           padding: '15px', 
           borderRadius: '8px', 
           marginBottom: '20px',
           color: 'white',
           fontSize: '14px',
           border: '2px solid rgba(255, 255, 255, 0.3)'
         }}>
           <strong style={{color: '#ff6b6b'}}>
             {isEnglish ? '🔍 FILTER DEBUG:' : '🔍 ОТЛАДКА ФИЛЬТРАЦИИ:'}
           </strong>
           <br />
           {isEnglish ? '• Search' : '• Поиск'}: <strong>"{searchTerm}"</strong>
           <br />
           {isEnglish ? '• Specialty' : '• Специализация'}: <strong>"{selectedSpecialty}"</strong>
           <br />
           {isEnglish ? '• Online only' : '• Только онлайн'}:{' '}
           <strong>{onlineOnly ? (isEnglish ? 'Yes' : 'Да') : (isEnglish ? 'No' : 'Нет')}</strong>
           <br />
           {isEnglish ? '• Total specialists' : '• Всего специалистов'}: <strong>{allSpecialists.length}</strong>
           <br />
           {isEnglish ? '• Filtered' : '• Отфильтровано'}: <strong>{filteredSpecialists.length}</strong>
           <br />
           <strong style={{color: '#4ecdc4'}}>
             {isEnglish ? '📋 Available specialties:' : '📋 Доступные специализации:'}
           </strong>{' '}
           {specialties.join(', ')}
           <br />
           <strong style={{color: '#45b7d1'}}>
             {isEnglish ? '👥 Specialists:' : '👥 Специалисты:'}
           </strong>{' '}
           {allSpecialists.map(s => `${s.name} (${s.specialty})`).join(', ')}
           <br />
           <br />
                       <button 
                             onClick={() => {
                 console.log('=== ТЕСТ ФИЛЬТРАЦИИ ===')
                 console.log('selectedSpecialty:', selectedSpecialty)
                 console.log('allSpecialists:', allSpecialists)
                 console.log('filteredSpecialists:', filteredSpecialists)
                 alert(`Специализация: ${selectedSpecialty}\nВсего: ${allSpecialists.length}\nОтфильтровано: ${filteredSpecialists.length}`)
               }}
              style={{
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                marginRight: '10px'
              }}
            >
              🧪 ТЕСТ ФИЛЬТРАЦИИ
            </button>
            <button 
                             onClick={() => {
                 console.log('=== ПРИНУДИТЕЛЬНАЯ ФИЛЬТРАЦИЯ ===')
                 filterSpecialists()
               }}
              style={{
                background: '#4ecdc4',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
                             🔄 ПРИНУДИТЕЛЬНАЯ ФИЛЬТРАЦИЯ
             </button>
             <button 
               onClick={() => {
                 console.log('=== ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ СПИСКА ===')
                 console.log('Текущие специалисты:', allSpecialists)
                 console.log('localStorage specialists:', localStorage.getItem('specialists'))
                 window.location.reload()
               }}
               style={{
                 background: '#ffa500',
                 color: 'white',
                 border: 'none',
                 padding: '8px 16px',
                 borderRadius: '4px',
                 cursor: 'pointer',
                 fontSize: '12px',
                 marginLeft: '10px'
               }}
             >
                               🔄 ОБНОВИТЬ СТРАНИЦУ
              </button>
              <button 
                onClick={() => {
                  console.log('=== ПРИНУДИТЕЛЬНАЯ ЗАГРУЗКА СПЕЦИАЛИСТОВ ===')
                  console.log('localStorage user:', localStorage.getItem('user'))
                  console.log('localStorage specialists:', localStorage.getItem('specialists'))
                  console.log('Текущие специалисты в контексте:', allSpecialists)
                  // Принудительно обновляем страницу
                  window.location.reload()
                }}
                style={{
                  background: '#9c27b0',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginLeft: '10px'
                }}
              >
                🔄 ПЕРЕЗАГРУЗИТЬ ДАННЫЕ
              </button>
         </div>

         {/* Поиск и фильтры */}
         <div className="card" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ position: 'relative' }}>
                <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                  type="text"
                  placeholder={t('specialists.search')}
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
              {t('specialists.filter')}
            </button>
          </div>

          {showFilters && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e1e5e9' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="form-group">
                  <label>{t('specialists.specialty')}</label>
                                     <select
                     value={selectedSpecialty}
                     onChange={(e) => {
                       const newValue = e.target.value
                       console.log('=== ИЗМЕНЕНИЕ СПЕЦИАЛИЗАЦИИ ===')
                       console.log('Новое значение:', newValue)
                       console.log('Предыдущее значение:', selectedSpecialty)
                       setSelectedSpecialty(newValue)
                       console.log('Значение установлено:', newValue)
                       console.log('===============================')
                     }}
                   >
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>
                        {specialty === 'all' ? t('specialists.allSpecialties') : specialty}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>{t('specialists.sort')}</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="rating">{t('specialists.byRating')}</option>
                    <option value="price">{t('specialists.byPrice')}</option>
                    <option value="experience">{t('specialists.byExperience')}</option>
                    <option value="reviews">{t('specialists.byReviews')}</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={onlineOnly}
                      onChange={(e) => {
                        console.log('=== ИЗМЕНЕНИЕ ФИЛЬТРА "Онлайн" ===')
                        console.log('Новое значение:', e.target.checked)
                        setOnlineOnly(e.target.checked)
                        console.log('===============================')
                      }}
                      style={{ margin: 0 }}
                    />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: '#4CAF50',
                        animation: 'pulse 2s infinite'
                      }}></span>
                      Только онлайн
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Список специалистов */}
        <div className="specialists-grid">
          {filteredSpecialists.map((specialist, index) => (
            <React.Fragment key={specialist.id}>
              <SpecialistCard specialist={specialist} />
              {/* Реклама после каждого 3-го специалиста */}
              {(index + 1) % 3 === 0 && (index + 1) < filteredSpecialists.length && (
                <div style={{ gridColumn: '1 / -1', width: '100%' }}>
                  <AdBanner 
                    size="banner" 
                    position="inline" 
                    id={`specialists-inline-ad-${index}`} 
                    showLabel={true}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {filteredSpecialists.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ color: 'white', marginBottom: '20px' }}>{t('specialists.notFound')}</h3>
            <p style={{ color: 'white', opacity: 0.8 }}>
              {t('specialists.tryChangeFilters')}
            </p>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default Specialists
