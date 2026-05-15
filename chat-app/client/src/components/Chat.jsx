import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import '../styles/Chat.css';

const SOCKET_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
const socket = io(SOCKET_URL);

function getAvatarColor(name) {
  const colors = [
    { bg: '#CECBF6', text: '#3C3489' },
    { bg: '#9FE1CB', text: '#085041' },
    { bg: '#F5C4B3', text: '#712B13' },
    { bg: '#B5D4F4', text: '#0C447C' },
    { bg: '#FAC775', text: '#633806' },
    { bg: '#F4C0D1', text: '#72243E' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
}

function Avatar({ name, size = 32 }) {
  const color = getAvatarColor(name);
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35, background: color.bg, color: color.text }}>
      {initials}
    </div>
  );
}

function Chat({ username, room: initialRoom, allRooms }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState([]);
  const [typingUser, setTypingUser] = useState('');
  const [currentRoom, setCurrentRoom] = useState(initialRoom);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    socket.emit('join_room', { username, room: currentRoom });

    const onHistory = (history) => setMessages(history);
    const onMessage = (data) => setMessages(prev => [...prev, data]);
    const onUserList = (userList) => setUsers(userList);
    const onTyping = (name) => setTypingUser(name);
    const onStopTyping = () => setTypingUser('');

    socket.on('message_history', onHistory);
    socket.on('receive_message', onMessage);
    socket.on('user_list', onUserList);
    socket.on('user_typing', onTyping);
    socket.on('user_stop_typing', onStopTyping);

    return () => {
      socket.emit('leave_room', { username, room: currentRoom });
      socket.off('message_history', onHistory);
      socket.off('receive_message', onMessage);
      socket.off('user_list', onUserList);
      socket.off('user_typing', onTyping);
      socket.off('user_stop_typing', onStopTyping);
    };
  }, [currentRoom, username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const switchRoom = (newRoom) => {
    if (newRoom === currentRoom) return;
    socket.emit('leave_room', { username, room: currentRoom });
    setMessages([]);
    setUsers([]);
    setTypingUser('');
    setCurrentRoom(newRoom);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('send_message', { room: currentRoom, message: input.trim() });
    socket.emit('stop_typing', { room: currentRoom });
    setInput('');
    inputRef.current?.focus();
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket.emit('typing', { room: currentRoom, username });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', { room: currentRoom });
    }, 1500);
  };

  return (
    <div className="chat-app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo-icon">💬</span>
          <span className="logo-text">ChatRoom</span>
        </div>

        <div className="section-label">Rooms</div>
        {allRooms.map(r => (
          <button key={r} className={`room-item ${r === currentRoom ? 'active' : ''}`} onClick={() => switchRoom(r)}>
            <span className="room-hash">#</span>
            <span className="room-name">{r}</span>
          </button>
        ))}

        <div className="section-label" style={{ marginTop: 'auto' }}>Online — {users.length}</div>
        <div className="user-list">
          {users.map(u => (
            <div key={u.id} className="user-item">
              <Avatar name={u.username} size={26} />
              <span className="user-item-name">{u.username}</span>
              <span className="online-dot" />
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <Avatar name={username} size={28} />
          <span className="self-name">{username}</span>
          <span className="you-badge">You</span>
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-header">
          <div className="header-left">
            <span className="header-hash">#</span>
            <span className="header-room">{currentRoom}</span>
          </div>
          <div className="header-right">
            <span className="user-count-pill">{users.length} online</span>
          </div>
        </header>

        <div className="messages-area">
          {messages.length === 0 && (
            <div className="empty-state"><p>No messages yet. Say hello! 👋</p></div>
          )}
          {messages.map((msg, i) => {
            const isSelf = msg.username === username;
            const isSystem = msg.type === 'system';

            if (isSystem) {
              return (
                <div key={i} className="system-msg">
                  <span>{msg.message}</span>
                  <span className="sys-time">{msg.time}</span>
                </div>
              );
            }

            return (
              <div key={i} className={`message-row ${isSelf ? 'self' : ''}`}>
                {!isSelf && <Avatar name={msg.username} size={32} />}
                <div className="message-content">
                  <div className="message-meta">
                    <span className="msg-username">{isSelf ? 'You' : msg.username}</span>
                    <span className="msg-time">{msg.time}</span>
                  </div>
                  <div className={`bubble ${isSelf ? 'bubble-self' : 'bubble-other'}`}>
                    {msg.message}
                  </div>
                </div>
                {isSelf && <Avatar name={msg.username} size={32} />}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className={`typing-bar ${typingUser ? 'visible' : ''}`}>
          <span className="typing-dots"><span /><span /><span /></span>
          <span className="typing-text">{typingUser} is typing...</span>
        </div>

        <div className="input-area">
          <input
            ref={inputRef}
            className="msg-input"
            value={input}
            onChange={handleTyping}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder={`Message #${currentRoom}`}
          />
          <button className="send-btn" onClick={sendMessage} disabled={!input.trim()}>
            Send ↑
          </button>
        </div>
      </main>
    </div>
  );
}

export default Chat;