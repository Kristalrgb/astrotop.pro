import React, { useState, useRef } from 'react'
import { FaUpload, FaImage, FaTrash, FaPlus } from 'react-icons/fa'

const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  single = false,
  currentImage = null,
  onImageChange,
  maxImages = 5, 
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}) => {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Ensure maxSize is a valid number (convert to number if needed, use default if invalid)
  let validMaxSize = 20 * 1024 * 1024 // По умолчанию 20 MB
  if (typeof maxSize === 'number' && !isNaN(maxSize) && maxSize > 0) {
    validMaxSize = maxSize
  } else if (typeof maxSize === 'string') {
    const parsed = parseFloat(maxSize)
    if (!isNaN(parsed) && parsed > 0) {
      validMaxSize = parsed
    }
  }
  console.log('ImageUpload: Инициализация - maxSize prop:', maxSize, 'validMaxSize:', validMaxSize, 'MB:', (validMaxSize / 1024 / 1024).toFixed(2))

  const isSingleMode = single || typeof onImageChange === 'function'
  
  // Для single mode используем currentImage напрямую
  const displayedImages = isSingleMode
    ? (currentImage ? [{ id: 'single', preview: currentImage, name: 'image', size: 0 }] : [])
    : images

  const handleFileSelect = (files) => {
    console.log('ImageUpload: maxSize prop =', maxSize, 'validMaxSize =', validMaxSize, 'bytes =', (validMaxSize / 1024 / 1024).toFixed(2), 'MB')
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      console.log('ImageUpload: Проверка файла', file.name, 'размер:', file.size, 'байт')
      if (!acceptedTypes.includes(file.type)) {
        alert(`Файл ${file.name} не поддерживается. Используйте JPEG, PNG, WebP или GIF.`)
        return false
      }
      console.log('ImageUpload: Файл', file.name, 'размер:', file.size, 'байт (', (file.size / 1024 / 1024).toFixed(2), 'MB), лимит:', validMaxSize, 'байт (', (validMaxSize / 1024 / 1024).toFixed(2), 'MB)')
      if (file.size > validMaxSize) {
        const maxSizeDisplay = formatMaxSize(validMaxSize)
        const fileSizeDisplay = formatFileSize(file.size)
        alert(`Файл ${file.name} слишком большой.\nРазмер файла: ${fileSizeDisplay}\nМаксимальный размер: ${maxSizeDisplay}`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) {
      console.log('ImageUpload: Нет валидных файлов')
      return
    }

    // Для single mode всегда заменяем текущее изображение
    const limit = isSingleMode ? 1 : maxImages
    const currentCount = isSingleMode ? (currentImage ? 1 : 0) : displayedImages.length

    if (!isSingleMode && currentCount + validFiles.length > limit) {
      alert(`Максимальное количество изображений: ${limit}`)
      return
    }

    setUploading(true)
    
    // Конвертируем файлы в base64
    const promises = validFiles.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target.result
          if (result && typeof result === 'string' && result.startsWith('data:image/')) {
            resolve({
              id: Date.now() + Math.random(),
              file: file,
              preview: result,
              name: file.name,
              size: file.size
            })
          } else {
            reject(new Error('Не удалось конвертировать файл в base64'))
          }
        }
        reader.onerror = (error) => {
          console.error('ImageUpload: Ошибка чтения файла:', error)
          reject(new Error('Ошибка при чтении файла'))
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(promises).then(newImages => {
      if (isSingleMode) {
        const image = newImages[0]
        if (onImageChange && image && image.preview) {
          console.log('ImageUpload: Вызываем onImageChange с preview')
          console.log('ImageUpload: preview начало:', image.preview.substring(0, 100))
          console.log('ImageUpload: preview длина:', image.preview.length)
          console.log('ImageUpload: preview тип:', typeof image.preview)
          console.log('ImageUpload: preview валидный base64?', image.preview.startsWith('data:image/'))
          
          // Убеждаемся, что preview - это строка
          if (typeof image.preview === 'string' && image.preview.startsWith('data:image/')) {
            onImageChange(image.preview, image)
            console.log('✅ ImageUpload: onImageChange успешно вызван')
          } else {
            console.error('❌ ImageUpload: preview не валидный base64!')
            alert('Ошибка: не удалось загрузить изображение')
          }
        } else {
          console.error('❌ ImageUpload: onImageChange не доступен или image не валидный')
        }
      } else if (onImagesChange) {
        onImagesChange([...images, ...newImages])
      }
      setUploading(false)
    }).catch((error) => {
      console.error('❌ ImageUpload: Ошибка при обработке изображений:', error)
      setUploading(false)
      alert('Ошибка при загрузке изображения: ' + (error.message || 'Неизвестная ошибка'))
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileInput = (e) => {
    const files = e.target.files
    handleFileSelect(files)
    e.target.value = '' // Сбрасываем input
  }

  const removeImage = (imageId) => {
    if (isSingleMode) {
      if (onImageChange) {
        console.log('ImageUpload: Удаление изображения в single mode')
        onImageChange(null, null)
      }
    } else if (onImagesChange) {
      onImagesChange(images.filter(img => img.id !== imageId))
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0 || isNaN(bytes)) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Helper function to format maxSize for display
  const formatMaxSize = (sizeInBytes) => {
    let size = validMaxSize // По умолчанию используем validMaxSize
    if (typeof sizeInBytes === 'number' && !isNaN(sizeInBytes) && sizeInBytes > 0) {
      size = sizeInBytes
    }
    
    // Защита от некорректных значений
    if (size <= 0 || isNaN(size) || !isFinite(size)) {
      size = 20 * 1024 * 1024 // Фолбэк на 20 MB
    }
    
    if (size < 1024) {
      return Math.round(size) + ' байт'
    } else if (size < 1024 * 1024) {
      return Math.round(size / 1024) + ' KB'
    } else {
      return (size / 1024 / 1024).toFixed(2) + ' MB'
    }
  }

  return (
    <div className="image-upload">
      <div className="upload-header">
        <h4>{isSingleMode ? '📸 Фото профиля' : '📸 Фотографии товара'}</h4>
        <span className="image-count">
          {displayedImages.length} / {isSingleMode ? 1 : maxImages}
        </span>
      </div>

      {/* Область загрузки */}
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={!isSingleMode}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        
        {uploading ? (
          <div className="uploading-content">
            <div className="upload-spinner"></div>
            <p>Загружаем изображения...</p>
          </div>
        ) : (
          <div className="upload-content">
            <FaUpload className="upload-icon" />
            <h3>{isSingleMode ? 'Нажмите, чтобы выбрать фото' : 'Перетащите изображения сюда'}</h3>
            <p>{isSingleMode ? 'или перетащите файл сюда' : 'или нажмите для выбора файлов'}</p>
            <div className="upload-info">
              <p>Поддерживаемые форматы: JPEG, PNG, WebP, GIF</p>
              <p>Максимальный размер: {formatMaxSize(validMaxSize)}</p>
              {!isSingleMode && <p>Максимум изображений: {maxImages}</p>}
            </div>
            <button type="button" className="upload-btn">
              <FaPlus /> {isSingleMode ? 'Выбрать фото' : 'Выбрать файлы'}
            </button>
          </div>
        )}
      </div>

      {/* Список загруженных изображений */}
      {displayedImages.length > 0 && (
        <div className="images-grid" style={isSingleMode ? { maxWidth: '300px', margin: '0 auto' } : {}}>
          {displayedImages.map((image, index) => (
            <div key={image.id} className="image-item" style={isSingleMode ? { width: '100%' } : {}}>
              <div className="image-preview" style={isSingleMode ? { position: 'relative', width: '100%', paddingTop: '100%' } : {}}>
                <img 
                  src={image.preview} 
                  alt={`Preview ${index + 1}`}
                  style={isSingleMode ? {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  } : {}}
                />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => removeImage(image.id)}
                  title="Удалить изображение"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(255, 0, 0, 0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <FaTrash />
                </button>
              </div>
              {!isSingleMode && (
                <div className="image-info">
                  <p className="image-name" title={image.name}>
                    {image.name.length > 20 ? `${image.name.substring(0, 20)}...` : image.name}
                  </p>
                  <p className="image-size">{formatFileSize(image.size)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Кнопка добавления еще изображений */}
      {displayedImages.length < (isSingleMode ? 1 : maxImages) && !uploading && (
        <div className="add-more-images">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaImage /> Добавить еще изображения
          </button>
        </div>
      )}
    </div>
  )
}

export default ImageUpload