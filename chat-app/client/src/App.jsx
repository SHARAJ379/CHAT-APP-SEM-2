import { useState } from 'react';
import Chat from './components/Chat';
import './styles/App.css';

const ROOMS = ['general', 'tech-talk', 'random', 'announcements'];

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('general');
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = () => {
    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }
    if (username.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setJoined(true);
  };

  if (!joined) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-icon">💬</div>
          <h1 className="login-title">ChatRoom</h1>
          <p className="login-sub">Real-time messaging, powered by Socket.io</p>

          <div className="form-group">
            <label className="form-label">Your name</label>
            <input
              className="form-input"
              placeholder="e.g. Sharaj"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Choose a room</label>
            <div className="room-grid">
              {ROOMS.map(r => (
                <button
                  key={r}
                  className={`room-btn ${room === r ? 'active' : ''}`}
                  onClick={() => setRoom(r)}
                >
                  # {r}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button className="join-btn" onClick={handleJoin}>
            Join Room →
          </button>
        </div>
      </div>
    );
  }

  return <Chat username={username} room={room} allRooms={ROOMS} />;
}

export default App;