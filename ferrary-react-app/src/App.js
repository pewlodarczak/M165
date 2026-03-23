import React, { useEffect, useState } from 'react';
import { functions } from './appwrite';
import './App.css'; // We'll create this CSS file

function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});

  const loadFerraris = async () => {
    try {
      const execution = await functions.createExecution(
        '69be90a200394182f3c3',
        '',
        false,
        '/',
        'GET'
      );

      const data = JSON.parse(execution.responseBody);
      console.log('Response data:', data);

      if (data.error) {
        setError(data.error);
        return;
      }

      setCars(data.cars || []);
    } catch (error) {
      console.error("Error loading:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (carId) => {
    setLikedPosts(prev => ({
      ...prev,
      [carId]: !prev[carId]
    }));
  };

  const handleSave = (carId) => {
    setSavedPosts(prev => ({
      ...prev,
      [carId]: !prev[carId]
    }));
  };

  useEffect(() => {
    loadFerraris();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Ferrari feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={loadFerraris} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="instagram-container">
      {/* Header */}
      <header className="instagram-header">
        <div className="header-content">
          <h1 className="logo">
            <span className="logo-icon">🏎️</span>
            DriveGram
          </h1>
          <div className="header-icons">
            <button className="header-icon">❤️</button>
            <button className="header-icon">💬</button>
            <button className="header-icon">👤</button>
          </div>
        </div>
      </header>

      {/* Stories Bar */}
      <div className="stories-container">
        <div className="stories-wrapper">
          <div className="story-item">
            <div className="story-ring">
              <div className="story-avatar">
                <span>🏎️</span>
              </div>
            </div>
            <span className="story-username">Ferrari</span>
          </div>
          <div className="story-item">
            <div className="story-ring">
              <div className="story-avatar">
                <span>🔴</span>
              </div>
            </div>
            <span className="story-username">Scuderia</span>
          </div>
          <div className="story-item">
            <div className="story-ring">
              <div className="story-avatar">
                <span>🏁</span>
              </div>
            </div>
            <span className="story-username">Racing</span>
          </div>
          <div className="story-item">
            <div className="story-ring">
              <div className="story-avatar">
                <span>⚡</span>
              </div>
            </div>
            <span className="story-username">Hypercars</span>
          </div>
          <div className="story-item">
            <div className="story-ring">
              <div className="story-avatar">
                <span>🇮🇹</span>
              </div>
            </div>
            <span className="story-username">Italian</span>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="feed">
        {cars.length === 0 ? (
          <div className="empty-feed">
            <p>No Ferraris found in the feed</p>
          </div>
        ) : (
          cars.map((car) => (
            <article key={car.id} className="post">
              {/* Post Header */}
              <div className="post-header">
                <div className="post-user-info">
                  <div className="post-avatar">
                    <img
                      src={car.image_url || 'https://via.placeholder.com/40'}
                      alt={car.brand}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/40';
                      }}
                    />
                  </div>
                  <div className="post-user-details">
                    <span className="post-username">{car.brand} {car.model}</span>
                    <span className="post-location">Ferrari • {car.year || '2024'}</span>
                  </div>
                </div>
                <button className="post-more">•••</button>
              </div>

              {/* Post Image */}
              <div className="post-image-container">
                {car.image_url ? (
                  <img
                    src={car.image_url}
                    alt={`${car.brand} ${car.model}`}
                    className="post-image"
                    onError={(e) => {
                      console.error(`Failed to load image: ${car.image_url}`);
                      e.target.src = 'https://via.placeholder.com/600x600?text=Ferrari';
                    }}
                  />
                ) : (
                  <div className="post-image-placeholder">
                    <span>🏎️</span>
                    <p>Ferrari {car.model}</p>
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="post-actions">
                <div className="action-buttons">
                  <button
                    className={`action-btn ${likedPosts[car.id] ? 'liked' : ''}`}
                    onClick={() => handleLike(car.id)}
                  >
                    {likedPosts[car.id] ? '❤️' : '🤍'}
                  </button>
                  <button className="action-btn">💬</button>
                  <button className="action-btn">📤</button>
                </div>
                <button
                  className={`action-btn save-btn ${savedPosts[car.id] ? 'saved' : ''}`}
                  onClick={() => handleSave(car.id)}
                >
                  {savedPosts[car.id] ? '📌' : '🔖'}
                </button>
              </div>

              {/* Likes count */}
              <div className="post-likes">
                <strong>{Math.floor(Math.random() * 1000) + (likedPosts[car.id] ? 1 : 0)} likes</strong>
              </div>

              {/* Caption */}
              <div className="post-caption">
                <span className="caption-username">{car.brand} {car.model}</span>
                <span className="caption-text">{car.title}</span>
              </div>

              {/* Comments section */}
              <div className="post-comments">
                <button className="view-comments">View all {Math.floor(Math.random() * 50)} comments</button>
                <div className="comment-input">
                  <input type="text" placeholder="Add a comment..." />
                  <button className="post-comment-btn">Post</button>
                </div>
              </div>

              {/* Timestamp */}
              <div className="post-timestamp">
                {Math.floor(Math.random() * 24)} hours ago
              </div>
            </article>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className="nav-item active">🏠</button>
        <button className="nav-item">🔍</button>
        <button className="nav-item">➕</button>
        <button className="nav-item">❤️</button>
        <button className="nav-item">👤</button>
      </nav>
    </div>
  );
}

export default App;