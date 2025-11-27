import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { FaGlobe, FaFlag } from 'react-icons/fa'

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguage()

  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ]

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode)
  }

  return (
    <div className="language-switcher">
      <div className="language-dropdown">
        <button className="language-toggle">
          <FaGlobe />
          <span className="current-flag">
            {languages.find(lang => lang.code === currentLanguage)?.flag}
          </span>
          <span className="current-name">
            {languages.find(lang => lang.code === currentLanguage)?.name}
          </span>
        </button>
        
        <div className="language-options">
          {languages.map(language => (
            <button
              key={language.code}
              className={`language-option ${currentLanguage === language.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(language.code)}
            >
              <span className="flag">{language.flag}</span>
              <span className="name">{language.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LanguageSwitcher
