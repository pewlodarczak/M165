import React, { useEffect, useState, useRef, useCallback } from 'react';
import { functions } from './appwrite';
import './App.css';

function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastId, setLastId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [filter, setFilter] = useState('all');

  // Ref für den Observer
  const observer = useRef();

  const loadFerraris = useCallback(async (isInitial = false) => {
    if (loading || (!hasMore && !isInitial)) return;

    setLoading(true);
    try {
      // Bei initialem Laden fangen wir bei null an, sonst nutzen wir die lastId
      const currentLastId = isInitial ? null : lastId;
      const limit = 6; // Kleinere Häppchen für besseres Scrolling-Gefühl
      const queryParams = `?limit=${limit}${currentLastId ? `&last_id=${currentLastId}` : ''}`;

      const execution = await functions.createExecution(
        '69be90a200394182f3c3',
        '',
        false,
        `/${queryParams}`,
        'GET'
      );

      const data = JSON.parse(execution.responseBody);
      const newCars = data.cars || [];

      // Wichtig: Neue Autos an die alten anhängen
      setCars(prev => isInitial ? newCars : [...prev, ...newCars]);

      // Neue lastId aus den Daten setzen
      setLastId(data.lastId);

      // Prüfen, ob es noch mehr gibt (wenn weniger als das Limit geliefert wurde, ist Ende)
      setHasMore(newCars.length === limit);

    } catch (error) {
      console.error("Error loading Ferraris:", error);
    } finally {
      setLoading(false);
    }
  }, [lastId, loading, hasMore]);

  // Das Herzstück des Infinite Scrolling:
  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadFerraris();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadFerraris]);

  useEffect(() => {
    loadFerraris(true); // Erster Aufruf beim Start
  }, []);

  const handleLike = (id) => setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  const handleSave = (id) => setSavedPosts(prev => ({ ...prev, [id]: !prev[id] }));

  // Filterung (berücksichtigt nur die bereits geladenen Cars)
  const filteredCars = filter === 'all' ? cars :
                       filter === 'liked' ? cars.filter(c => likedPosts[c.id]) :
                       cars.filter(c => savedPosts[c.id]);

  return (
    <div className="mobile-container">
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

      <main className="feed">
        {filteredCars.map((car, index) => {
          // Wir prüfen, ob dies das letzte Element in der aktuellen Liste ist
          const isLastElement = filteredCars.length === index + 1;

          return (
            <article
              key={car.id}
              className="post"
              ref={isLastElement ? lastElementRef : null}
            >
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
                <div className="likes-count">
                    {Math.floor(Math.random() * 500) + (likedPosts[car.id] ? 1 : 0)} likes
                </div>
                <div className="caption">
                  <span className="username">{car.model}</span> {car.title}
                </div>
              </div>
            </article>
          );
        })}

        {loading && (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Fetching more Ferraris...</p>
          </div>
        )}
      </main>

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