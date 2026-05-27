import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { FaGlobe } from 'react-icons/fa'

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const languages = [
    { code: 'ru', codeUpper: 'RU', name: 'Русский' },
    { code: 'en', codeUpper: 'EN', name: 'English' }
  ]

  const currentLang = languages.find(lang => lang.code === currentLanguage)

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode)
    setIsOpen(false)
  }

  return (
    <div className="language-switcher" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        className="language-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '5px 10px',
          color: '#333',
          fontSize: '16px',
          fontFamily: 'inherit'
        }}
      >
        <FaGlobe style={{ fontSize: '16px' }} />
        <span>{currentLang?.codeUpper} {currentLang?.name}</span>
      </button>
      
      {isOpen && (
        <div 
          className="language-options"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '5px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: '150px',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          {languages.map(language => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 15px',
                background: currentLanguage === language.code ? '#f0f0f0' : 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                textAlign: 'left',
                transition: 'background 0.2s',
                color: '#333'
              }}
              onMouseEnter={(e) => {
                if (currentLanguage !== language.code) {
                  e.target.style.background = '#f8f8f8'
                }
              }}
              onMouseLeave={(e) => {
                if (currentLanguage !== language.code) {
                  e.target.style.background = 'white'
                }
              }}
            >
              <span>{language.codeUpper} {language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
