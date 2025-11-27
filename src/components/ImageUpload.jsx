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

  const isSingleMode = single || typeof onImageChange === 'function'
  const displayedImages = isSingleMode
    ? (currentImage ? [{ id: 'single', preview: currentImage, name: 'image', size: 0 }] : [])
    : images

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      if (!acceptedTypes.includes(file.type)) {
        alert(`Файл ${file.name} не поддерживается. Используйте JPEG, PNG, WebP или GIF.`)
        return false
      }
      if (file.size > maxSize) {
        alert(`Файл ${file.name} слишком большой. Максимальный размер: ${maxSize / 1024 / 1024}MB`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    const currentCount = displayedImages.length
    const limit = isSingleMode ? 1 : maxImages

    if (currentCount + validFiles.length > limit) {
      alert(`Максимальное количество изображений: ${limit}`)
      return
    }

    setUploading(true)
    
    // Конвертируем файлы в base64
    const promises = validFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve({
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target.result,
            name: file.name,
            size: file.size
          })
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(promises).then(newImages => {
      if (isSingleMode) {
        const image = newImages[0]
        if (onImageChange) {
          onImageChange(image.preview, image)
        }
      } else if (onImagesChange) {
        onImagesChange([...images, ...newImages])
      }
      setUploading(false)
    }).catch(() => setUploading(false))
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
      onImageChange && onImageChange(null)
    } else if (onImagesChange) {
      onImagesChange(images.filter(img => img.id !== imageId))
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="image-upload">
      <div className="upload-header">
        <h4>📸 Фотографии товара</h4>
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
          multiple
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
            <h3>Перетащите изображения сюда</h3>
            <p>или нажмите для выбора файлов</p>
            <div className="upload-info">
              <p>Поддерживаемые форматы: JPEG, PNG, WebP, GIF</p>
              <p>Максимальный размер: {maxSize / 1024 / 1024}MB</p>
              <p>Максимум изображений: {isSingleMode ? 1 : maxImages}</p>
            </div>
            <button type="button" className="upload-btn">
              <FaPlus /> Выбрать файлы
            </button>
          </div>
        )}
      </div>

      {/* Список загруженных изображений */}
      {displayedImages.length > 0 && (
        <div className="images-grid">
          {displayedImages.map((image, index) => (
            <div key={image.id} className="image-item">
              <div className="image-preview">
                <img src={image.preview} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => removeImage(image.id)}
                  title="Удалить изображение"
                >
                  <FaTrash />
                </button>
              </div>
              <div className="image-info">
                <p className="image-name" title={image.name}>
                  {image.name.length > 20 ? `${image.name.substring(0, 20)}...` : image.name}
                </p>
                <p className="image-size">{formatFileSize(image.size)}</p>
              </div>
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