import React, { useEffect, useState } from 'react';
import { functions } from './appwrite';
import './App.css';

function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [filter, setFilter] = useState('all');

  const loadAllFerraris = async () => {
    try {
      setLoading(true);
      const execution = await functions.createExecution('69be90a200394182f3c3', '', false, '/', 'GET');
      const data = JSON.parse(execution.responseBody);
      setCars(data.cars || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAllFerraris(); }, []);

  const handleLike = (id) => setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  const handleSave = (id) => setSavedPosts(prev => ({ ...prev, [id]: !prev[id] }));

  const filteredCars = filter === 'all' ? cars :
                       filter === 'liked' ? cars.filter(c => likedPosts[c.id]) :
                       cars.filter(c => savedPosts[c.id]);

  if (loading) return <div className="loader">🏎️ Loading DriveGram...</div>;

  return (
    <div className="mobile-container">
      {/* HEADER */}
      <header className="main-header">
        <div className="logo-section">
          <span className="car-icon">🏎️</span>
          <h1 className="brand-name">DriveGram</h1>
        </div>
        <div className="header-actions">
          <span className="icon">❤️</span>
          <span className="icon">💬</span>
          <span className="icon">👤</span>
        </div>
      </header>

      {/* STORIES (Filter) */}
      <div className="stories-bar">
        {[
          { id: 'all', label: 'Ferrari', img: '🏎️' },
          { id: 'liked', label: 'Scuderia', img: '🔴' },
          { id: 'saved', label: 'Racing', img: '🏁' },
          { id: 'hyper', label: 'Hypercars', img: '⚡' },
          { id: 'italy', label: 'Italian', img: 'IT' }
        ].map(s => (
          <div key={s.id} className={`story ${filter === s.id ? 'active' : ''}`} onClick={() => setFilter(s.id)}>
            <div className="story-ring"><div className="story-circle">{s.img}</div></div>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* FEED */}
      <main className="feed">
        {filteredCars.map(car => (
          <article key={car.id} className="post">
            <div className="post-header">
              <div className="user-info">
                <div className="mini-avatar">🏎️</div>
                <div className="user-text">
                  <span className="username">Ferrari Concepts</span>
                  <span className="location">{car.brand} • {car.year || '2024'}</span>
                </div>
              </div>
              <span className="dots">•••</span>
            </div>

            <img src={car.image_url} alt={car.model} className="post-image" />

            <div className="post-footer">
              <div className="action-bar">
                <div className="left-actions">
                  <button onClick={() => handleLike(car.id)}>{likedPosts[car.id] ? '❤️' : '🤍'}</button>
                  <span>💬</span>
                  <span>📤</span>
                </div>
                <button onClick={() => handleSave(car.id)}>{savedPosts[car.id] ? '📌' : '🔖'}</button>
              </div>
              <div className="likes-count">{Math.floor(Math.random() * 500) + (likedPosts[car.id] ? 1 : 0)} likes</div>
              <div className="caption">
                <span className="username">{car.model}</span> {car.title}
              </div>
            </div>
          </article>
        ))}
      </main>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>🏠</button>
        <button>🔍</button>
        <button className="add-btn">＋</button>
        <button onClick={() => setFilter('liked')}>❤️</button>
        <button>👤</button>
      </nav>
    </div>
  );
}

export default App;