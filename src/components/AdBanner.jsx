import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'

/**
 * Компонент для отображения рекламных баннеров
 * @param {Object} props
 * @param {string} props.size - Размер баннера: 'banner' (728x90), 'square' (250x250), 'rectangle' (300x250), 'skyscraper' (160x600), 'mobile' (320x100)
 * @param {string} props.position - Позиция: 'top', 'bottom', 'sidebar', 'inline'
 * @param {string} props.id - Уникальный ID рекламного блока
 * @param {boolean} props.showLabel - Показывать ли метку "Реклама"
 */
const AdBanner = ({ 
  size = 'banner', 
  position = 'inline',
  id = 'ad-block-1',
  showLabel = true 
}) => {
  const { currentLanguage } = useLanguage()
  const isEnglish = currentLanguage === 'en'

  // Размеры для разных форматов рекламы
  const adSizes = {
    banner: { width: '728px', height: '90px', maxWidth: '100%' }, // Leaderboard
    square: { width: '250px', height: '250px', maxWidth: '100%' }, // Square
    rectangle: { width: '300px', height: '250px', maxWidth: '100%' }, // Medium Rectangle
    skyscraper: { width: '160px', height: '600px', maxWidth: '100%' }, // Wide Skyscraper
    mobile: { width: '320px', height: '100px', maxWidth: '100%' }, // Mobile Banner
    large: { width: '970px', height: '250px', maxWidth: '100%' }, // Billboard
    halfpage: { width: '300px', height: '600px', maxWidth: '100%' } // Half Page
  }

  const currentSize = adSizes[size] || adSizes.banner

  // Стили для разных позиций
  const positionStyles = {
    top: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '20px',
      padding: '10px 0'
    },
    bottom: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20px',
      padding: '10px 0'
    },
    sidebar: {
      display: 'flex',
      justifyContent: 'center',
      margin: '20px 0'
    },
    inline: {
      display: 'flex',
      justifyContent: 'center',
      margin: '20px auto'
    }
  }

  // Здесь можно интегрировать с рекламными сетями (Google AdSense, Yandex Direct и т.д.)
  // Пока что показываем placeholder
  const renderAdContent = () => {
    return (
      <div
        style={{
          ...currentSize,
          backgroundColor: '#f8f9fa',
          border: '2px dashed #dee2e6',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6c757d',
          fontSize: '14px',
          textAlign: 'center',
          padding: '10px',
          boxSizing: 'border-box',
          position: 'relative',
          minHeight: currentSize.height
        }}
        id={id}
        className="ad-banner"
      >
        {showLabel && (
          <div
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              fontSize: '10px',
              color: '#999',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}
          >
            {isEnglish ? 'Ad' : 'Реклама'}
          </div>
        )}
        
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>📢</div>
        <div style={{ fontWeight: '600', marginBottom: '5px' }}>
          {isEnglish ? 'Advertisement Space' : 'Место для рекламы'}
        </div>
        <div style={{ fontSize: '12px' }}>
          {size} - {currentSize.width} × {currentSize.height}
        </div>
        
        {/* 
          TODO: Здесь можно добавить интеграцию с рекламными сетями:
          
          Пример для Google AdSense:
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
          <ins className="adsbygoogle"
               style={{display:'block'}}
               data-ad-client="ca-pub-XXXXXXXXXX"
               data-ad-slot="XXXXXXXXXX"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script>
            (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
          
          Пример для Yandex Direct:
          <div id="yandex_rtb_R-XXXXXXXX-1"></div>
          <script>
            window.yaContextCb.push(() => {
              Ya.Context.AdvManager.render({
                blockId: "R-XXXXXXXX-1",
                renderTo: "yandex_rtb_R-XXXXXXXX-1"
              })
            })
          </script>
        */}
      </div>
    )
  }

  return (
    <div style={positionStyles[position] || positionStyles.inline}>
      {renderAdContent()}
    </div>
  )
}

export default AdBanner


