import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaGithub, FaDatabase, FaFileAlt, FaDocker, FaCode, FaFolderOpen, FaChevronRight } from 'react-icons/fa'

const Deploy = () => {
  const navigate = useNavigate()
  const [selectedOption, setSelectedOption] = useState(null)

  const deploymentOptions = [
    {
      id: 'github',
      title: 'GitHub Repository',
      icon: <FaGithub />,
      description: 'Deploy from GitHub repo',
      color: '#24292e'
    },
    {
      id: 'database',
      title: 'Database',
      icon: <FaDatabase />,
      description: 'Deploy a database',
      color: '#4CAF50'
    },
    {
      id: 'template',
      title: 'Template',
      icon: <FaFileAlt />,
      description: 'Start from a template',
      color: '#2196F3'
    },
    {
      id: 'docker',
      title: 'Docker Image',
      icon: <FaDocker />,
      description: 'Deploy a Docker container',
      color: '#0db7ed'
    },
    {
      id: 'function',
      title: 'Function',
      icon: <FaCode />,
      description: 'Deploy a serverless function',
      color: '#FF9800'
    },
    {
      id: 'empty',
      title: 'Empty Project',
      icon: <FaFolderOpen />,
      description: 'Start with an empty project',
      color: '#9E9E9E'
    }
  ]

  const handleSelect = (option) => {
    setSelectedOption(option.id)
    // Здесь можно добавить логику навигации или открытия модального окна
    if (option.id === 'github') {
      // Логика для деплоя из GitHub
      console.log('Deploying from GitHub repository...')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Фоновый паттерн */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        opacity: 0.3
      }} />

      {/* Иконка в правом верхнем углу */}
      <div style={{
        position: 'absolute',
        top: '30px',
        right: '30px',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9c27b0',
        fontSize: '24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2px',
          width: '100%',
          height: '100%'
        }}>
          <div style={{ background: 'currentColor', borderRadius: '4px 0 0 0' }} />
          <div style={{ background: 'currentColor', borderRadius: '0 4px 0 0' }} />
          <div style={{ background: 'currentColor', borderRadius: '0 0 0 4px' }} />
          <div style={{ background: 'currentColor', borderRadius: '0 0 4px 0', position: 'relative' }}>
            <span style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>+</span>
          </div>
        </div>
      </div>

      {/* Заголовок */}
      <div style={{
        textAlign: 'center',
        marginBottom: '50px',
        zIndex: 1
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '3rem',
          fontWeight: 'bold',
          margin: '0 0 15px 0',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          New project
        </h1>
        <p style={{
          color: '#b0b0b0',
          fontSize: '1.2rem',
          margin: 0
        }}>
          Let's deploy your first service to production.
        </p>
      </div>

      {/* Панель с опциями */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        background: 'rgba(30, 30, 30, 0.9)',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        zIndex: 1
      }}>
        <h2 style={{
          color: '#b0b0b0',
          fontSize: '1.1rem',
          fontWeight: 'normal',
          margin: '0 0 25px 0'
        }}>
          What would you like to deploy today?
        </h2>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {deploymentOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleSelect(option)}
              onMouseEnter={(e) => {
                if (selectedOption !== option.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedOption !== option.id) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: selectedOption === option.id ? 'rgba(156, 39, 176, 0.2)' : 'transparent',
                border: selectedOption === option.id ? '1px solid rgba(156, 39, 176, 0.5)' : '1px solid transparent'
              }}
            >
              <div style={{
                color: 'white',
                fontSize: '24px',
                marginRight: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px'
              }}>
                {option.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginBottom: '4px'
                }}>
                  {option.title}
                </div>
                {option.id === 'github' && (
                  <div style={{
                    color: '#888',
                    fontSize: '0.85rem'
                  }}>
                    Deploy from GitHub repo
                  </div>
                )}
              </div>
              <div style={{
                color: '#888',
                fontSize: '18px',
                marginLeft: '12px'
              }}>
                <FaChevronRight />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Deploy




