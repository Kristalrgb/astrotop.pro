import React from 'react'
import { Link } from 'react-router-dom'
import { FaNewspaper, FaUser } from 'react-icons/fa'
import { useNews } from '../contexts/NewsContext'

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return value
  }
}

const NewsFeed = ({ limit, showManageLink = false, emptyText = 'Публикаций пока нет' }) => {
  const { posts, loading, error } = useNews()
  const items = limit ? posts.slice(0, limit) : posts

  return (
    <div className="news-feed">
      <div className="news-feed__header">
        <div>
          <p className="news-feed__subtitle">Новости астрологов платформы</p>
          <h3 className="news-feed__title">
            <FaNewspaper style={{ marginRight: '10px' }} />
            Лента новостей
          </h3>
        </div>
        {showManageLink && (
          <Link to="/astrologer-dashboard" className="btn btn-secondary">
            Опубликовать новость
          </Link>
        )}
      </div>

      {loading && (
        <div className="news-feed__state">Загружаем свежие новости…</div>
      )}

      {error && (
        <div className="news-feed__state news-feed__state--error">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="news-feed__state">{emptyText}</div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="news-grid">
          {items.map(post => (
            <article key={post.id} className="news-card">
            <div className="news-card__header">
              {post.authorAvatar ? (
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="news-card__avatar"
                />
              ) : (
                <div className="news-card__avatar news-card__avatar--placeholder">
                  <FaUser />
                </div>
              )}
              <div>
                <p className="news-card__author">{post.authorName}</p>
                <p className="news-card__date">{formatDate(post.createdAt)}</p>
              </div>
            </div>

            <h4 className="news-card__title">{post.title}</h4>

            {post.imageUrl && (
              <div className="news-card__image-wrapper">
                <img src={post.imageUrl} alt={post.title} className="news-card__image" />
              </div>
            )}

            <p className="news-card__content">{post.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default NewsFeed



