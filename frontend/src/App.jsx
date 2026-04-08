import React, { useState, useRef, useEffect } from 'react'
import './index.css'

const AGENT_CONFIG = {
  therapist:   { label: 'Therapist',   emoji: '🧠', color: '#a78bfa' },
  mindfulness: { label: 'Mindfulness', emoji: '🌿', color: '#38bdf8' },
  knowledge:   { label: 'Knowledge',   emoji: '📚', color: '#e879f9' },
  journal:     { label: 'Journal',     emoji: '📓', color: '#fbbf24' },
}

const STARTER_PROMPTS = [
  "I've been feeling really anxious lately",
  "Guide me through a breathing exercise",
  "What is cognitive behavioural therapy?",
  "Help me journal about my day",
]

function AgentPill({ name, activeAgent }) {
  const cfg = AGENT_CONFIG[name]
  const isActive = activeAgent === name
  return (
    <div
      className={`agent-pill${isActive ? ' active' : ''}`}
      style={{ '--agent-color': cfg.color }}
    >
      <span className="agent-pill-dot" />
      {cfg.emoji} {cfg.label}
    </div>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  const cfg = AGENT_CONFIG[msg.agent] || AGENT_CONFIG.therapist

  return (
    <div className={`message ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-avatar">
        {isUser ? '👤' : cfg.emoji}
      </div>
      <div className="message-body">
        {!isUser && (
          <div className="message-meta">
            <span
              className="message-agent-tag"
              style={{ '--agent-color': cfg.color }}
            >
              {cfg.label} Agent
            </span>
            <span>{msg.time}</span>
          </div>
        )}
        {isUser && (
          <div className="message-meta">
            <span>{msg.time}</span>
          </div>
        )}
        <div
          className="message-bubble"
          style={!isUser ? { '--agent-color': cfg.color } : {}}
        >
          {msg.content}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="message assistant" style={{ alignSelf: 'flex-start' }}>
      <div className="message-avatar">🤖</div>
      <div className="message-body">
        <div className="typing-indicator">
          <div className="typing-dots">
            <span /><span /><span />
          </div>
          <span className="typing-text">Finding the right agent for you…</span>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeAgent, setActiveAgent] = useState(null)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const now = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return

    setError(null)
    setInput('')
    setMessages(prev => [
      ...prev,
      { role: 'user', content: userText, time: now() }
    ])
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const data = await res.json()
      setActiveAgent(data.agent)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply, agent: data.agent, time: now() }
      ])
    } catch (err) {
      setError(err.message || 'Failed to reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Auto-resize textarea
  const handleInput = (e) => {
    setInput(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
    }
  }

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-brand">
          <div className="header-icon">🧬</div>
          <div>
            <div className="header-title">MindBridge</div>
            <div className="header-subtitle">Multi-Agent Mental Health Assistant</div>
          </div>
        </div>
        <div className="header-status">
          <span className="status-dot" />
          4 Agents Online
        </div>
      </header>

      {/* ── Agent Pills ── */}
      <div className="agents-bar">
        <span className="agents-label">Agents</span>
        {Object.keys(AGENT_CONFIG).map(name => (
          <AgentPill key={name} name={name} activeAgent={activeAgent} />
        ))}
      </div>

      {/* ── Messages ── */}
      <div className="messages-area">
        {messages.length === 0 && !loading ? (
          <div className="welcome">
            <div className="welcome-orb">🧬</div>
            <h2>How are you feeling today?</h2>
            <p>
              I'll connect you with the right specialist — whether you need emotional
              support, mindfulness guidance, mental health info, or journaling help.
            </p>
            <div className="welcome-chips">
              {STARTER_PROMPTS.map(p => (
                <button
                  key={p}
                  className="welcome-chip"
                  onClick={() => sendMessage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            {error && (
              <div className="error-toast">
                ⚠️ {error}
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div className="input-area">
        <div className="input-container">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder="Share what's on your mind…"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            id="send-button"
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="input-hint">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
