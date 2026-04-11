import React, { useState, useRef, useEffect, useCallback } from 'react'
import './index.css'

/* ── Voice Components & Utils ── */
const SpeakerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.08"/>
  </svg>
)

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

const AGENT_CONFIG = {
  therapist:   { label: 'Therapist',   emoji: '🧠', color: '#a78bfa', desc: 'Emotional support & talk therapy' },
  mindfulness: { label: 'Mindfulness', emoji: '🌿', color: '#38bdf8', desc: 'Breathing, meditation & calm' },
  knowledge:   { label: 'Knowledge',   emoji: '📚', color: '#e879f9', desc: 'Mental health facts & education' },
  journal:     { label: 'Journal',     emoji: '📓', color: '#fbbf24', desc: 'Guided journaling & reflection' },
}

const STARTER_PROMPTS = [
  "I've been feeling really anxious lately",
  "Guide me through a breathing exercise",
  "What is cognitive behavioural therapy?",
  "Help me journal about my day",
]

/* ── Agent Pill (header bar) ── */
function AgentPill({ name, pinnedAgent, lastAgent }) {
  const cfg = AGENT_CONFIG[name]
  const isPinned = pinnedAgent === name
  const isLast   = !pinnedAgent && lastAgent === name
  return (
    <div
      className={`agent-pill${isPinned ? ' pinned' : isLast ? ' active' : ''}`}
      style={{ '--agent-color': cfg.color }}
    >
      <span className="agent-pill-dot" />
      {cfg.emoji} {cfg.label}
      {isPinned && <span className="agent-pill-pin">📌</span>}
    </div>
  )
}

/* ── "Set as Main Agent" inline prompt ── */
function PinPrompt({ agent, onPin, onDismiss }) {
  const cfg = AGENT_CONFIG[agent]
  return (
    <div className="pin-prompt" style={{ '--agent-color': cfg.color }}>
      <span className="pin-prompt-text">
        {cfg.emoji} Looks like the <strong>{cfg.label}</strong> agent suits you best.
        Want to make it your main agent?
      </span>
      <div className="pin-prompt-actions">
        <button
          id={`pin-btn-${agent}`}
          className="pin-btn"
          onClick={onPin}
        >
          📌 Set as Main Agent
        </button>
        <button className="pin-dismiss" onClick={onDismiss}>Not now</button>
      </div>
    </div>
  )
}

/* ── /switch Modal ── */
function SwitchModal({ currentPinned, onSelect, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="switch-modal" onClick={e => e.stopPropagation()}>
        <div className="switch-modal-header">
          <h3>Choose Your Agent</h3>
          <p>Select an agent to take over this conversation</p>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="switch-modal-grid">
          {Object.entries(AGENT_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              id={`switch-agent-${key}`}
              className={`switch-agent-card${currentPinned === key ? ' selected' : ''}`}
              style={{ '--agent-color': cfg.color }}
              onClick={() => onSelect(key)}
            >
              <span className="switch-agent-emoji">{cfg.emoji}</span>
              <span className="switch-agent-label">{cfg.label}</span>
              <span className="switch-agent-desc">{cfg.desc}</span>
              {currentPinned === key && <span className="switch-current-badge">Current</span>}
            </button>
          ))}
        </div>
        <p className="switch-hint">Tip: Type <code>/switch</code> anytime to come back here</p>
      </div>
    </div>
  )
}

/* ── Message Bubble ── */
function MessageBubble({ msg, onPin, onDismissPin, onSpeak, isSpeaking }) {
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
            <button 
              className={`voice-btn speaker-btn ${isSpeaking ? 'active' : ''}`}
              style={{ '--agent-color': cfg.color }}
              onClick={() => onSpeak(msg.content, msg.id || msg.time)}
              title="Read aloud"
            >
              <SpeakerIcon />
            </button>
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
          {msg.format === 'problem_summary' ? (
            <AnalysisBoard data={msg.data} />
          ) : msg.format === 'cbt_analysis' ? (
            <CBTAnalysis data={msg.data} />
          ) : (
            msg.content
          )}
        </div>
        {/* Pin prompt appears below the first assistant message that triggers a new agent */}
        {msg.showPinPrompt && (
          <PinPrompt
            agent={msg.agent}
            onPin={() => onPin(msg.agent)}
            onDismiss={onDismissPin}
          />
        )}
      </div>
    </div>
  )
}

/* ── Analysis Board ── */
function AnalysisBoard({ data }) {
  return (
    <div className="analysis-container">
      <p style={{ marginBottom: '8px' }}>Here's what I've gathered about your situation:</p>
      <div className="problem-summary">
        <div className="summary-item" style={{ '--accent-color': '#a78bfa' }}>
          <div className="summary-label">
            <span className="summary-icon">🎯</span> Core Issue
          </div>
          <div className="summary-content">{data.core_issue}</div>
        </div>
        <div className="summary-item" style={{ '--accent-color': '#f87171' }}>
          <div className="summary-label">
            <span className="summary-icon">⚡</span> Trigger
          </div>
          <div className="summary-content">{data.trigger}</div>
        </div>
        <div className="summary-item" style={{ '--accent-color': '#38bdf8' }}>
          <div className="summary-label">
            <span className="summary-icon">🌍</span> Context
          </div>
          <div className="summary-content">{data.context}</div>
        </div>
      </div>
      <div className="analysis-footer">
        {data.closing}
      </div>
    </div>
  )
}

/* ── CBT Analysis display ── */
function CBTAnalysis({ data }) {
  const intensity = parseInt(data.severity) || 5
  return (
    <div className="distortion-card">
      <div className="distortion-header">
        <div className="distortion-name">{data.distortion}</div>
        <div className="distortion-badge">Cognitive Distortion</div>
      </div>
      <div className="distortion-explanation">
        {data.explanation}
      </div>
      <div className="session-progress-container" style={{ margin: 0 }}>
        <div className="progress-label">
          <span>Emotional Intensity</span>
          <span>{data.severity}</span>
        </div>
        <div className="intensity-meter">
          <div className="intensity-fill" style={{ width: `${intensity * 10}%` }} />
        </div>
      </div>
      <div className="analysis-footer" style={{ border: 'none', margin: 0, padding: 0 }}>
        {data.closing}
      </div>
    </div>
  )
}



/* ── Pinned Agent Banner ── */
function PinnedBanner({ agent, onSwitch, onStartSession, isSessionActive }) {
  const cfg = AGENT_CONFIG[agent]
  return (
    <div className="pinned-banner" style={{ '--agent-color': cfg.color }}>
      <span>📌 Chatting with <strong>{cfg.emoji} {cfg.label}</strong></span>
      <div className="session-header-actions">
        {agent === 'therapist' && !isSessionActive && (
          <button className="session-start-btn" onClick={onStartSession}>
            ✨ Start Guided Session
          </button>
        )}
        <button id="switch-banner-btn" className="pinned-switch-btn" onClick={onSwitch}>
          /switch agent
        </button>
      </div>
    </div>
  )
}

/* ── Session Check-in Card ── */
function SessionCard({ step, results, onNext, onCancel }) {
  // Step 1 states
  const [mood, setMood] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [text, setText] = useState('')

  // Step 2 states
  const [pStep, setPStep] = useState(0)
  const [problems, setProblems] = useState({ q1: '', q2: '', q3: '' })

  // Step 3 states
  const [cStep, setCStep] = useState(0)
  const [cbtData, setCbtData] = useState({ situation: '', thought: '', intensity: 5 })

  if (step === 'checkin') {
    const progress = 20
    return (
      <div className="session-card">
        <div className="session-progress-container">
          <div className="progress-label">
            <span>Session Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progress}%`, '--agent-color': AGENT_CONFIG.therapist.color }} />
          </div>
        </div>

        <h3>Step 1: Emotional Check-in</h3>
        
        <div className="session-field">
          <div className="emoji-labels">
            <span>😔</span><span>😐</span><span>😊</span>
          </div>
          <input 
            type="range" min="1" max="5" value={mood} 
            onChange={(e) => setMood(parseInt(e.target.value))} 
            className="range-slider"
          />
          <div className="slider-labels">
            <span>Low Mood</span><span>Feeling Great</span>
          </div>
        </div>

        <div className="session-field">
          <label>Energy Level</label>
          <input 
            type="range" min="1" max="5" value={energy} 
            onChange={(e) => setEnergy(parseInt(e.target.value))} 
            className="range-slider"
          />
          <div className="slider-labels">
            <span>Exhausted</span><span>Vibrant</span>
          </div>
        </div>

        <div className="session-field">
          <label>What's on your mind? (Optional)</label>
          <textarea 
            className="session-input" 
            rows="3" 
            placeholder="I've been thinking about..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="session-btn-group">
          <button className="session-submit-btn" onClick={() => onNext({ type: 'checkin', data: { mood, energy, text } })}>
            Continue Session
          </button>
          <button className="session-cancel-btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    )
  }

  if (step === 'problem') {
    const questions = [
      { id: 'q1', label: 'What happened?', placeholder: 'Briefly describe the situation...' },
      { id: 'q2', label: 'When did this start?', placeholder: 'e.g., this morning, yesterday, an hour ago...' },
      { id: 'q3', label: 'What triggered it?', placeholder: 'Was there a specific event, person, or thought?' },
    ]
    const curQ = questions[pStep]
    const progress = 25 + (pStep * 15)

    return (
      <div className="session-card">
        <div className="session-progress-container">
          <div className="progress-label">
            <span>Session Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progress}%`, '--agent-color': AGENT_CONFIG.therapist.color }} />
          </div>
        </div>

        <h3>Step 2: Identifying the Issue</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '20px' }}>
          Let's narrow down what's going on.
        </p>

        <div className="session-field">
          <label>{curQ.label}</label>
          <textarea 
            className="session-input" 
            rows="4" 
            placeholder={curQ.placeholder}
            value={problems[curQ.id]}
            onChange={(e) => setProblems({ ...problems, [curQ.id]: e.target.value })}
            autoFocus
          />
        </div>

        <div className="session-btn-group">
          <button 
            className="session-submit-btn" 
            onClick={() => {
              if (pStep < 2) setPStep(pStep + 1)
              else onNext({ type: 'problem', data: problems })
            }}
            disabled={!problems[curQ.id].trim()}
          >
            {pStep < 2 ? 'Next Question' : 'Finish Identification'}
          </button>
          {pStep > 0 && <button className="session-cancel-btn" onClick={() => setPStep(pStep - 1)}>Back</button>}
          {pStep === 0 && (
            <button className="session-cancel-btn" onClick={onCancel}>Cancel Session</button>
          )}
        </div>
      </div>
    )
  }


  if (step === 'cbt') {
    const cbtQuestions = [
      { id: 'situation', label: 'The Situation', placeholder: 'Just the facts: Who, what, where...', type: 'text' },
      { id: 'thought', label: 'Automatic Thought', placeholder: 'What was going through your mind?', type: 'text' },
      { id: 'intensity', label: 'Initial Intensity', type: 'slider' },
    ]
    const curQ = cbtQuestions[cStep]
    const progress = 70 + (cStep * 10)

    return (
      <div className="session-card">
        <div className="session-progress-container">
          <div className="progress-label">
            <span>Session Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progress}%`, '--agent-color': AGENT_CONFIG.therapist.color }} />
          </div>
        </div>

        <h3>Step 3: Thought Breakdown</h3>
        
        <div className="session-field text-center">
          <label>{curQ.label}</label>
          {curQ.type === 'text' ? (
            <textarea 
              className="session-input" 
              rows="4" 
              placeholder={curQ.placeholder}
              value={cbtData[curQ.id]}
              onChange={(e) => setCbtData({ ...cbtData, [curQ.id]: e.target.value })}
              autoFocus
            />
          ) : (
            <>
              <div className="emoji-labels">
                <span>😟</span><span>😰</span><span>🔥</span>
              </div>
              <input 
                type="range" min="1" max="10" value={cbtData.intensity} 
                onChange={(e) => setCbtData({ ...cbtData, intensity: parseInt(e.target.value) })} 
                className="range-slider"
                style={{ '--color-therapist': '#f87171' }}
              />
              <div className="slider-labels">
                <span>Mild</span><span>Intense (10/10)</span>
              </div>
            </>
          )}
        </div>

        <div className="session-btn-group">
          <button 
            className="session-submit-btn" 
            style={cStep === 2 ? { background: 'var(--gradient-brand)' } : {}}
            onClick={() => {
              if (cStep < 2) setCStep(cStep + 1)
              else onNext({ type: 'cbt', data: cbtData })
            }}
            disabled={curQ.type === 'text' && !cbtData[curQ.id].trim()}
          >
            {cStep < 2 ? 'Next' : 'Analyze Patterns'}
          </button>
          {cStep > 0 && <button className="session-cancel-btn" onClick={() => setCStep(cStep - 1)}>Back</button>}
        </div>
      </div>
    )
  }

  if (step === 'reframe') {
    const [localReframe, setLocalReframe] = useState(results.reframe || '')
    const [isEditing, setIsEditing] = useState(false)
    const [fetching, setFetching] = useState(false)

    const fetchReframe = async (believable = false) => {
      setFetching(true)
      try {
        const res = await fetch('http://localhost:8000/api/session/reframe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            thought: results.negative_thought, 
            distortion: results.distortion,
            believable
          }),
        })
        const resData = await res.json()
        setLocalReframe(resData.data.reframe)
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }

    useEffect(() => {
      if (!results.reframe) fetchReframe()
    }, [])

    return (
      <div className="session-card" style={{ maxWidth: '800px' }}>
        <div className="session-progress-container">
          <div className="progress-label">
            <span>Session Progress</span>
            <span>85%</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: '85%', '--agent-color': AGENT_CONFIG.therapist.color }} />
          </div>
        </div>

        <h3>Step 4: Reframing Your Thought</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Let's look at this through a more balanced lens.
        </p>

        <div className="reframe-split">
          <div className="reframe-card">
            <span className="reframe-badge negative">Negative Thought</span>
            <div className="reframe-text">"{results.negative_thought}"</div>
            <div className="reframe-rationale">Pattern: {results.distortion}</div>
          </div>

          <div className="reframe-card positive">
            <span className="reframe-badge balanced">AI Suggested Reframe</span>
            {isEditing ? (
              <textarea 
                className="session-input" 
                rows="4"
                value={localReframe}
                onChange={(e) => setLocalReframe(e.target.value)}
                autoFocus
              />
            ) : (
              <div className="reframe-text">
                {fetching ? "Thinking..." : `"${localReframe}"`}
              </div>
            )}
          </div>
        </div>

        <div className="reframe-actions">
          {!isEditing ? (
            <>
              <button 
                className="reframe-btn primary" 
                onClick={() => onNext({ type: 'reframe', data: { reframe: localReframe } })}
              >
                Accept & Continue
              </button>
              <button className="reframe-btn" onClick={() => setIsEditing(true)}>Edit</button>
              <button className="reframe-btn" onClick={() => fetchReframe(false)}>Regenerate</button>
              <button 
                className="reframe-btn believable" 
                onClick={() => fetchReframe(true)}
                title="Make it more realistic and dialed-down"
              >
                ✨ Make it believable
              </button>
            </>
          ) : (
            <>
              <button className="reframe-btn primary" onClick={() => setIsEditing(false)}>Done Editing</button>
              <button className="reframe-btn" onClick={() => setIsEditing(false)}>Cancel</button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (step === 'regulation') {
    const category = results.category?.toLowerCase() || 'anxiety'
    const progress = 90

    return (
      <div className="session-card">
        <div className="session-progress-container">
          <div className="progress-label">
            <span>Session Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progress}%`, '--agent-color': AGENT_CONFIG.therapist.color }} />
          </div>
        </div>

        <h3>Step 5: Regulation Technique</h3>
        
        {category === 'anxiety' || category === 'overthinking' ? (
          <BreathingExercise onFinish={() => onNext({ type: 'regulation', data: {} })} />
        ) : category === 'sadness' || category === 'burnout' ? (
          <GroundingExercise onFinish={() => onNext({ type: 'regulation', data: {} })} />
        ) : (
          <CoolingTimer onFinish={() => onNext({ type: 'regulation', data: {} })} />
        )}
      </div>
    )
  }

  if (step === 'actionplan') {
    const [localActions, setLocalActions] = useState(results.actions || [])
    const [fetching, setFetching] = useState(false)
    const [checked, setChecked] = useState([])

    useEffect(() => {
      const fetchActions = async () => {
        setFetching(true)
        try {
          const res = await fetch('http://localhost:8000/api/session/action-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ core_issue: results.core_issue, mood: results.summary }),
          })
          const resData = await res.json()
          setLocalActions(resData.data.actions)
        } catch (err) {
          console.error(err)
        } finally {
          setFetching(false)
        }
      }
      if (!results.actions) fetchActions()
    }, [])

    return (
      <div className="session-card">
        <h3>Step 7: Your Action Plan</h3>
        <p style={{ textAlign: 'center', marginBottom: '20px' }}>Small, meaningful steps for the next 24 hours.</p>
        
        {fetching ? (
          <div className="text-center">Drafting actions...</div>
        ) : (
          <div className="grounding-list">
            {localActions.map((action, i) => (
              <div 
                key={i} 
                className={`grounding-item ${checked.includes(i) ? 'checked' : ''}`}
                onClick={() => setChecked(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
              >
                <div className="grounding-num">{i + 1}</div>
                <div className="grounding-text">{action}</div>
              </div>
            ))}
          </div>
        )}

        <button 
          className="reframe-btn primary" 
          onClick={() => onNext({ type: 'actionplan', data: { actions: localActions } })}
          style={{ width: '100%', marginTop: '20px' }}
        >
          Finalize Plan
        </button>
      </div>
    )
  }

  if (step === 'summary') {
    return (
      <div className="session-card summary-print-view" id="printable-summary">
        <div className="text-center" style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '2rem' }}>🏆</div>
          <h3>Session Complete</h3>
          <p>You've done some incredible work today.</p>
        </div>

        <div className="problem-summary" style={{ gridTemplateColumns: '1fr' }}>
          <div className="summary-item">
            <div className="summary-label">Insights</div>
            <div className="summary-content">
              <strong>Core Issue:</strong> {results.core_issue}<br/>
              <strong>Pattern:</strong> {results.distortion}
            </div>
          </div>
          <div className="summary-item" style={{ '--accent-color': '#10b981' }}>
            <div className="summary-label">The New Perspective</div>
            <div className="summary-content">"{results.reframe}"</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Next Steps</div>
            <div className="summary-content">
              <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                {results.actions?.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="session-btn-group no-print">
          <button className="reframe-btn primary" onClick={() => window.print()}>
            📁 Save to Device (PDF)
          </button>
          <button className="reframe-btn" onClick={() => onNext({ type: 'finish', data: {} })}>
            Close Session
          </button>
        </div>
      </div>
    )
  }

  return null
}

/* ── Regulation: Breathing ── */
function BreathingExercise({ onFinish }) {
  const [phase, setPhase] = useState('inhale')
  const [count, setCount] = useState(4)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev === 1) {
          if (phase === 'inhale') { setPhase('hold'); return 7 }
          if (phase === 'hold') { setPhase('exhale'); return 8 }
          if (phase === 'exhale') { setPhase('inhale'); return 4 }
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase])

  return (
    <div className="breathing-container">
      <div className={`breathing-circle ${phase}`}>
        {phase}
      </div>
      <div className="timer-display" style={{ fontSize: '2rem' }}>{count}s</div>
      <p style={{ color: 'var(--text-secondary)' }}>
        {phase === 'inhale' && "Deep breath in..."}
        {phase === 'hold' && "Hold it gently..."}
        {phase === 'exhale' && "Slowly release..."}
      </p>
      <button className="reframe-btn primary" onClick={onFinish} style={{ marginTop: '20px' }}>
        I feel calmer
      </button>
    </div>
  )
}

/* ── Regulation: Grounding ── */
function GroundingExercise({ onFinish }) {
  const items = [
    { id: 1, text: "5 things you can SEE" },
    { id: 2, text: "4 things you can TOUCH" },
    { id: 3, text: "3 things you can HEAR" },
    { id: 4, text: "2 things you can SMELL" },
    { id: 5, text: "1 thing you can TASTE" },
  ]
  const [checked, setChecked] = useState([])

  const toggle = (id) => {
    if (checked.includes(id)) setChecked(checked.filter(i => i !== id))
    else setChecked([...checked, id])
  }

  return (
    <div className="grounding-list">
      <p style={{ textAlign: 'center', marginBottom: '15px' }}>Let's ground ourselves in the present moment.</p>
      {items.map(item => (
        <div 
          key={item.id} 
          className={`grounding-item ${checked.includes(item.id) ? 'checked' : ''}`}
          onClick={() => toggle(item.id)}
        >
          <div className="grounding-num">{6 - item.id}</div>
          <div className="grounding-text">{item.text}</div>
          {checked.includes(item.id) && <span>✅</span>}
        </div>
      ))}
      <button 
        className="reframe-btn primary" 
        onClick={onFinish} 
        style={{ marginTop: '20px' }}
        disabled={checked.length < 5}
      >
        I'm back in the present
      </button>
    </div>
  )
}

/* ── Regulation: Cooling-off ── */
function CoolingTimer({ onFinish }) {
  const [seconds, setSeconds] = useState(10)

  useEffect(() => {
    if (seconds > 0) {
      const t = setTimeout(() => setSeconds(seconds - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [seconds])

  return (
    <div className="text-center" style={{ padding: '40px 0' }}>
      <p>Let's take a 10-second pause to let the intensity fade.</p>
      <div className="timer-display">{seconds}</div>
      <button 
        className="reframe-btn primary" 
        onClick={onFinish} 
        disabled={seconds > 0}
      >
        {seconds > 0 ? "Wait..." : "I'm ready to continue"}
      </button>
    </div>
  )
}


/* ── Typing Indicator ── */
function TypingIndicator({ pinnedAgent }) {
  const cfg = pinnedAgent ? AGENT_CONFIG[pinnedAgent] : null
  return (
    <div className="message assistant" style={{ alignSelf: 'flex-start' }}>
      <div className="message-avatar">{cfg ? cfg.emoji : '🤖'}</div>
      <div className="message-body">
        <div className="typing-indicator">
          <div className="typing-dots">
            <span /><span /><span />
          </div>
          <span className="typing-text">
            {cfg ? `${cfg.label} is responding…` : 'Finding the right agent for you…'}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Main App ── */
export default function App() {
  const [messages, setMessages]       = useState([])
  const [input, setInput]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [pinnedAgent, setPinnedAgent] = useState(null)   // the locked-in main agent
  const [lastAgent, setLastAgent]     = useState(null)   // last detected agent (for pill highlight)
  const [showSwitch, setShowSwitch]   = useState(false)
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionStep, setSessionStep]     = useState(null) // 'checkin', 'analysis', etc.
  const [sessionResults, setSessionResults] = useState({}) // Stores findings for Step 4-8
  const [error, setError]             = useState(null)
  
  /* Voice State */
  const [autoRead, setAutoRead]       = useState(false)
  const [isSpeaking, setIsSpeaking]   = useState(null) // Stores ID of message being spoken
  
  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const textareaRef    = useRef(null)

  useEffect(() => {
    // Warm up voices
    window.speechSynthesis.getVoices()
    return () => window.speechSynthesis.cancel()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, sessionActive])

  const handleSpeak = useCallback((text, id) => {
    if (isSpeaking === id) {
      window.speechSynthesis.cancel()
      setIsSpeaking(null)
      return
    }

    window.speechSynthesis.cancel()
    setIsSpeaking(id)
    
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    const warmVoice = voices.find(v => v.name.includes('Google US English') && v.name.includes('Female')) || 
                      voices.find(v => v.lang === 'en-US' && v.name.includes('Female')) || 
                      voices[0]
    
    if (warmVoice) utterance.voice = warmVoice
    utterance.pitch = 1
    utterance.rate = 0.95
    
    utterance.onend = () => setIsSpeaking(null)
    utterance.onerror = () => setIsSpeaking(null)
    
    window.speechSynthesis.speak(utterance)
  }, [isSpeaking])

  const now = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  /* Dismiss the pin prompt on the latest assistant message */
  const dismissPin = () => {
    setMessages(prev => {
      const next = [...prev]
      const lastAssistant = [...next].reverse().find(m => m.role === 'assistant' && m.showPinPrompt)
      if (lastAssistant) lastAssistant.showPinPrompt = false
      return next
    })
  }

  /* Pin an agent as main */
  const pinAgent = (agentKey) => {
    setPinnedAgent(agentKey)
    dismissPin()
    setMessages(prev => [
      ...prev,
      {
        role: 'system',
        content: `📌 ${AGENT_CONFIG[agentKey].emoji} ${AGENT_CONFIG[agentKey].label} is now your main agent. Type /switch anytime to change.`,
        time: now(),
      }
    ])
  }

  /* Handle /switch command or agent selection from modal */
  const handleSwitch = (agentKey) => {
    setShowSwitch(false)
    setSessionActive(false)
    setPinnedAgent(agentKey)
    setLastAgent(agentKey)
    setMessages(prev => [
      ...prev,
      {
        role: 'system',
        content: `🔄 Switched to ${AGENT_CONFIG[agentKey].emoji} ${AGENT_CONFIG[agentKey].label} agent.`,
        time: now(),
      }
    ])
  }

  const startSession = () => {
    setSessionActive(true)
    setSessionStep('checkin')
  }

  const handleSessionNext = async ({ type, data }) => {
    setLoading(true)
    setSessionActive(false) // Hide the card while loading AI response
    
    try {
      const endpointMap = {
        'checkin': 'http://localhost:8000/api/session/checkin',
        'problem': 'http://localhost:8000/api/session/problem-identification',
        'cbt': 'http://localhost:8000/api/session/thought-breakdown'
      }
      
      const res = await fetch(endpointMap[type], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to analyze session step')
      
      const resData = await res.json()
      
      // Store relevant data for subsequent steps
      if (type === 'checkin') {
        setSessionResults(prev => ({ ...prev, ...resData.data }))
      } else if (type === 'problem') {
        setSessionResults(prev => ({ ...prev, ...resData.data }))
      } else if (type === 'cbt') {
        // Step 3 (CBT) provides distortion info; we also preserve the original thought for reframing
        setSessionResults(prev => ({ 
          ...prev, 
          ...resData.data, 
          negative_thought: data.thought 
        }))
      } else if (type === 'reframe') {
        setSessionResults(prev => ({ ...prev, reframe: data.reframe }))
      } else if (type === 'actionplan') {
        setSessionResults(prev => ({ ...prev, actions: data.actions }))
      }

      if (autoRead) {
        handleSpeak(resData.reply, resData.id || now())
      }
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: resData.reply,
          data: resData.data,
          format: resData.type,
          agent: 'therapist',
          time: now(),
          id: resData.id || now(),
        }
      ])

      // Sequential navigation
      setTimeout(() => {
        if (type === 'checkin') {
          setSessionStep('problem')
          setSessionActive(true)
        } else if (type === 'problem') {
          setSessionStep('cbt')
          setSessionActive(true)
        } else if (type === 'cbt') {
          setSessionStep('reframe')
          setSessionActive(true)
        } else if (type === 'reframe') {
          setSessionStep('regulation')
          setSessionActive(true)
        } else if (type === 'regulation') {
          setSessionStep('actionplan')
          setSessionActive(true)
        } else if (type === 'actionplan') {
          setSessionStep('summary')
          setSessionActive(true)
        } else {
          setSessionStep(null)
          setSessionActive(false)
        }
      }, 1500)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return

    // Intercept /switch command
    if (userText.toLowerCase() === '/switch') {
      setInput('')
      setShowSwitch(true)
      return
    }

    setError(null)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    setMessages(prev => [
      ...prev,
      { role: 'user', content: userText, time: now() }
    ])
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          agent: pinnedAgent || undefined,   // pass pinned agent to skip router
        }),
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const data = await res.json()
      const detectedAgent = data.agent

      setLastAgent(detectedAgent)

      // Show pin prompt only if: no agent is pinned yet, and this is the first time this agent appeared
      const alreadyPrompted = messages.some(m => m.showPinPrompt)
      const showPinPrompt   = !pinnedAgent && !alreadyPrompted

      if (autoRead) {
        handleSpeak(data.reply, data.id || now())
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          agent: detectedAgent,
          time: now(),
          showPinPrompt,
          id: data.id || now(),
        }
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
      {/* ── /switch Modal ── */}
      {showSwitch && (
        <SwitchModal
          currentPinned={pinnedAgent}
          onSelect={handleSwitch}
          onClose={() => setShowSwitch(false)}
        />
      )}

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
          <div 
            className="header-voice-toggle" 
            onClick={() => setAutoRead(!autoRead)}
            title={autoRead ? "Disable Auto-read" : "Enable Auto-read"}
          >
            <span>Auto-read</span>
            <div className={`toggle-switch ${autoRead ? 'on' : ''}`}>
              <div className="toggle-knob" />
            </div>
          </div>
          <span className="status-dot" style={{ marginLeft: '8px' }} />
          {pinnedAgent
            ? `${AGENT_CONFIG[pinnedAgent].emoji} ${AGENT_CONFIG[pinnedAgent].label} Mode`
            : '4 Agents Online'}
        </div>
      </header>

      {/* ── Agent Pills ── */}
      <div className="agents-bar">
        <span className="agents-label">Agents</span>
        {Object.keys(AGENT_CONFIG).map(name => (
          <AgentPill
            key={name}
            name={name}
            pinnedAgent={pinnedAgent}
            lastAgent={lastAgent}
          />
        ))}
      </div>

      {/* ── Pinned Banner ── */}
      {pinnedAgent && (
        <PinnedBanner 
          agent={pinnedAgent} 
          onSwitch={() => setShowSwitch(true)} 
          onStartSession={startSession}
          isSessionActive={sessionActive}
        />
      )}

      {/* ── Messages ── */}
      <div className="messages-area">
        {messages.length === 0 && !loading && !sessionActive ? (
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
            {messages.map((msg, i) =>
              msg.role === 'system' ? (
                <div key={i} className="system-message">{msg.content}</div>
              ) : (
                <MessageBubble
                  key={i}
                  msg={msg}
                  onPin={pinAgent}
                  onDismissPin={dismissPin}
                  onSpeak={handleSpeak}
                  isSpeaking={isSpeaking === (msg.id || msg.time)}
                />
              )
            )}
            {sessionActive && (
              <SessionCard 
                step={sessionStep}
                results={sessionResults} 
                onNext={handleSessionNext} 
                onCancel={() => setSessionActive(false)} 
              />
            )}
            {loading && <TypingIndicator pinnedAgent={pinnedAgent} />}
            {error && (
              <div className="error-toast">⚠️ {error}</div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div className="input-area">
        <div className="input-container" style={pinnedAgent ? { '--agent-color': AGENT_CONFIG[pinnedAgent].color } : {}}>
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder={pinnedAgent
              ? `Message ${AGENT_CONFIG[pinnedAgent].label}… (type /switch to change agent)`
              : "Share what's on your mind…"}
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
        <p className="input-hint">Enter to send · Shift+Enter for new line · <code>/switch</code> to change agent</p>
      </div>
    </div>
  )
}

