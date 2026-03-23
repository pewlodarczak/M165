import React, { useEffect, useState } from 'react';
import { functions } from './appwrite';
import './App.css';

function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [filter, setFilter] = useState('all');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [totalCars, setTotalCars] = useState(0);

  const loadFerraris = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setOffset(0);
        setCars([]);
      }

      // Try to get all cars with pagination parameters
      const execution = await functions.createExecution(
        '69be90a200394182f3c3',
        JSON.stringify({
          limit: 12,
          offset: isLoadMore ? offset : 0
        }),
        false,
        '/',
        'POST'
      );

      const data = JSON.parse(execution.responseBody);
      console.log('Response data:', data);

      if (data.error) {
        setError(data.error);
        return;
      }

      const newCars = data.cars || [];
      const total = data.total || newCars.length;

      if (isLoadMore) {
        setCars(prevCars => [...prevCars, ...newCars]);
        setOffset(prevOffset => prevOffset + newCars.length);
      } else {
        setCars(newCars);
        setOffset(newCars.length);
      }

      setTotalCars(total);
      setHasMore(offset + newCars.length < total);

    } catch (error) {
      console.error("Error loading Ferraris:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Alternative: If your function doesn't support pagination, try to get all data at once
  const loadAllFerraris = async () => {
    try {
      setLoading(true);

      // Try to get all cars without limit
      const execution = await functions.createExecution(
        '69be90a200394182f3c3',
        '',
        false,
        '/',
        'GET'
      );

      const data = JSON.parse(execution.responseBody);
      console.log('All Ferraris loaded:', data);

      if (data.error) {
        setError(data.error);
        return;
      }

      // Make sure we're getting all cars
      const allCars = data.cars || [];
      setCars(allCars);
      setTotalCars(allCars.length);
      setHasMore(false);

    } catch (error) {
      console.error("Error loading Ferraris:", error);
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
    // Use loadAllFerraris if your function returns all cars
    loadAllFerraris();

    // Or use loadFerraris with pagination if supported
    // loadFerraris(false);
  }, []);

  // Filter cars based on selected filter
  const filteredCars = filter === 'all'
    ? cars
    : filter === 'liked'
      ? cars.filter(car => likedPosts[car.id])
      : filter === 'saved'
        ? cars.filter(car => savedPosts[car.id])
        : cars;

  // Calculate statistics
  const totalLikes = Object.values(likedPosts).filter(Boolean).length;
  const totalSaved = Object.values(savedPosts).filter(Boolean).length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Ferrari Collection... 🏎️</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>⚠️ Error loading Ferraris: {error}</p>
        <button onClick={loadAllFerraris} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>
          <span className="logo-icon">🏎️</span>
          DriveGram
        </h1>
        <p>Discover the world's most beautiful Ferraris</p>
      </header>

      {/* Statistics Bar */}
      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-number">{cars.length}</span>
          <span className="stat-label">Total Ferraris</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totalLikes}</span>
          <span className="stat-label">Likes</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totalSaved}</span>
          <span className="stat-label">Saved</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Cars ({cars.length})
        </button>
        <button
          className={`filter-btn ${filter === 'liked' ? 'active' : ''}`}
          onClick={() => setFilter('liked')}
        >
          Liked ❤️ ({totalLikes})
        </button>
        <button
          className={`filter-btn ${filter === 'saved' ? 'active' : ''}`}
          onClick={() => setFilter('saved')}
        >
          Saved 🔖 ({totalSaved})
        </button>
      </div>

      {/* Cars Grid */}
      {filteredCars.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏎️</div>
          <h3>No Ferraris Found</h3>
          <p>
            {filter === 'liked'
              ? "You haven't liked any Ferraris yet. Click the heart button on cars you love!"
              : filter === 'saved'
                ? "You haven't saved any Ferraris yet. Click the bookmark button to save your favorites!"
                : "No Ferraris available in the feed."}
          </p>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="filter-btn active">
              View All Cars
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="cars-grid">
            {filteredCars.map((car, index) => (
              <div key={car.id || index} className="car-card">
                <div className="car-image-container">
                  {car.image_url ? (
                    <img
                      src={car.image_url}
                      alt={`${car.brand} ${car.model}`}
                      className="car-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Ferrari';
                      }}
                    />
                  ) : (
                    <div className="car-image" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '64px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      height: '250px'
                    }}>
                      🏎️
                    </div>
                  )}
                  <div className="car-badge">
                    {car.year || '2024'}
                  </div>
                </div>

                <div className="car-content">
                  <h2 className="car-title">{car.model}</h2>
                  <div className="car-brand">{car.brand}</div>
                  <p className="car-description">
                    {car.title || `Experience the thrill of the ${car.brand} ${car.model}. A masterpiece of Italian engineering and design.`}
                  </p>

                  <div className="car-specs">
                    <div className="spec-item">
                      <span className="spec-value">🏎️</span>
                      <span className="spec-label">Model</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-value">{car.year || '2024'}</span>
                      <span className="spec-label">Year</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-value">🇮🇹</span>
                      <span className="spec-label">Origin</span>
                    </div>
                  </div>

                  <div className="car-actions">
                    <button
                      className={`action-btn like-btn ${likedPosts[car.id] ? 'liked' : ''}`}
                      onClick={() => handleLike(car.id)}
                    >
                      {likedPosts[car.id] ? '❤️ Liked' : '🤍 Like'}
                    </button>
                    <button
                      className={`action-btn save-btn ${savedPosts[car.id] ? 'saved' : ''}`}
                      onClick={() => handleSave(car.id)}
                    >
                      {savedPosts[car.id] ? '🔖 Saved' : '📌 Save'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
              <button
                onClick={() => loadFerraris(true)}
                className="filter-btn active"
                disabled={loadingMore}
                style={{ padding: '12px 30px', fontSize: '16px' }}
              >
                {loadingMore ? 'Loading...' : 'Load More Cars 🏎️'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          Total Cars: {cars.length} | Filtered: {filteredCars.length} | Has More: {hasMore ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
}

export default App;