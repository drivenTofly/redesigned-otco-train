import { useState } from 'react'
import './App.css'

type OutlineSection = {
  id: number
  heading: string
  note: string
}

type Stage = 'topic' | 'outline' | 'draft'

const outlineAngles = [
  'The shift behind {topic}',
  'What most people miss',
  'A more useful way to approach it',
  'What this could mean next',
]

const sectionPrompts = [
  'Start with a concrete example from everyday life. It gives readers something familiar to hold onto before introducing the larger shift.',
  'Look beyond the most obvious explanation. What context, assumption, or quieter perspective changes how this story reads?',
  'Give readers a practical lens they can carry with them. A small, specific next step is more useful than a sweeping prescription.',
  'Close by looking ahead without pretending the outcome is certain. Leave readers with one question worth carrying forward.',
]

function makeDraft(topic: string, sections: OutlineSection[], audience: string, tone: string) {
  const openings: Record<string, string> = {
    Thoughtful: `A useful place to begin with ${topic} is how it shows up in everyday choices.`,
    Conversational: `So what does ${topic} actually look like in everyday life?`,
    Practical: `Start with one practical question about ${topic}: what can people do with it?`,
    Playful: `There is more to ${topic} than meets the eye, especially in everyday life.`,
  }
  const intro = openings[tone] ?? openings.Thoughtful
  const body = sections
    .map(({ heading, note }, index) => {
      const detail = note.trim() || sectionPrompts[index % sectionPrompts.length]
      return `${heading}\n\n${detail}`
    })
    .join('\n\n')
  const close = `For ${audience.toLowerCase()}, the point is not to predict every outcome. It is to stay curious, notice what is working, and make the next decision with intention. That is a grounded way to keep thinking about ${topic}.`
  return `${topic}\n\n${intro}\n\n${body}\n\n${close}`
}

function App() {
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('Curious readers')
  const [tone, setTone] = useState('Thoughtful')
  const [stage, setStage] = useState<Stage>('topic')
  const [outline, setOutline] = useState<OutlineSection[]>([])
  const [draft, setDraft] = useState('')
  const [copied, setCopied] = useState(false)

  function generateOutline() {
    const cleanedTopic = topic.trim()
    if (!cleanedTopic) return
    setTopic(cleanedTopic)
    setOutline(
      outlineAngles.map((angle, index) => ({
        id: index + 1,
        heading: angle.replace('{topic}', cleanedTopic),
        note: '',
      })),
    )
    setStage('outline')
  }

  function updateSection(id: number, field: 'heading' | 'note', value: string) {
    setOutline((sections) => sections.map((section) => section.id === id ? { ...section, [field]: value } : section))
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= outline.length) return
    setOutline((sections) => {
      const reordered = [...sections]
      ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
      return reordered
    })
  }

  function addSection() {
    setOutline((sections) => [...sections, { id: Date.now(), heading: 'A new section', note: '' }])
  }

  function removeSection(id: number) {
    setOutline((sections) => sections.filter((section) => section.id !== id))
  }

  function startDraft() {
    setDraft(makeDraft(topic, outline, audience, tone))
    setStage('draft')
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(draft)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  function startOver() {
    setTopic('')
    setOutline([])
    setDraft('')
    setStage('topic')
  }

  const steps: { key: Stage; label: string }[] = [
    { key: 'topic', label: 'Topic' },
    { key: 'outline', label: 'Outline' },
    { key: 'draft', label: 'Draft' },
  ]

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Marginalia home">
          <span className="brand-mark">m.</span>
          <span>marginalia</span>
        </a>
        <div className="topbar-right">
          <span className="local-status"><span className="status-dot" />Local draft</span>
          <button className="text-button" onClick={startOver} type="button">New post <span aria-hidden="true">+</span></button>
        </div>
      </header>

      <main id="top" className="workspace">
        <aside className="rail" aria-label="Writing steps">
          <p className="rail-label">YOUR WORKSPACE</p>
          <nav className="step-nav">
            {steps.map((step, index) => {
              const active = stage === step.key
              const complete = steps.findIndex((item) => item.key === stage) > index
              return (
                <div className={`step-item ${active ? 'active' : ''} ${complete ? 'complete' : ''}`} key={step.key}>
                  <span className="step-number">{complete ? '✓' : `0${index + 1}`}</span>
                  <span>{step.label}</span>
                </div>
              )
            })}
          </nav>
          <div className="rail-note">
            <span className="note-rule" />
            <p>A good piece begins with a better question.</p>
            <span className="note-caption">FIELD NOTE 001</span>
          </div>
          <div className="generator-note"><span className="spark">✳</span><span>Local starter generator<br /><small>No external AI or research</small></span></div>
        </aside>

        <section className="canvas" aria-live="polite">
          {stage === 'topic' && (
            <div className="stage-content topic-stage">
              <div className="eyebrow"><span>01</span><span className="eyebrow-line" />FIND YOUR THREAD</div>
              <h1>Every good story<br />starts <em>somewhere.</em></h1>
              <p className="stage-intro">Choose a topic. We’ll shape a clear outline together before a first draft takes form.</p>
              <form className="topic-form" onSubmit={(event) => { event.preventDefault(); generateOutline() }}>
                <label htmlFor="topic">WHAT WOULD YOU LIKE TO WRITE ABOUT?</label>
                <textarea id="topic" rows={2} value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Why neighborhood bookstores still matter" autoFocus />
                <div className="form-options">
                  <label className="select-field">FOR
                    <select value={audience} onChange={(event) => setAudience(event.target.value)}>
                      <option>Curious readers</option><option>Industry peers</option><option>Newcomers</option><option>Busy professionals</option>
                    </select>
                  </label>
                  <label className="select-field">IN A
                    <select value={tone} onChange={(event) => setTone(event.target.value)}>
                      <option>Thoughtful</option><option>Conversational</option><option>Practical</option><option>Playful</option>
                    </select>
                  </label>
                  <span className="length-note">SHORT READ <span>·</span> ~180 WORDS</span>
                </div>
                <button className="primary-button" type="submit" disabled={!topic.trim()}>Shape an outline <span aria-hidden="true">↗</span></button>
              </form>
              <div className="idea-row"><span>NEED A SPARK?</span>
                {['The case for doing one thing at a time', 'A city that makes room for trees'].map((idea) => <button type="button" className="idea-chip" key={idea} onClick={() => setTopic(idea)}>{idea} <span aria-hidden="true">↗</span></button>)}
              </div>
            </div>
          )}

          {stage === 'outline' && (
            <div className="stage-content outline-stage">
              <div className="eyebrow"><span>02</span><span className="eyebrow-line" />MAKE THE SHAPE</div>
              <div className="stage-heading-row"><div><h1>A shape for<br /><em>your thinking.</em></h1><p className="stage-intro">Move things around, sharpen a heading, or add a note. This is your structure.</p></div><span className="section-count">{outline.length} SECTIONS</span></div>
              <div className="outline-list">
                {outline.map((section, index) => (
                  <article className="outline-item" key={section.id}>
                    <span className="outline-index">{String(index + 1).padStart(2, '0')}</span>
                    <div className="outline-fields">
                      <input aria-label={`Section ${index + 1} heading`} value={section.heading} onChange={(event) => updateSection(section.id, 'heading', event.target.value)} />
                      <textarea aria-label={`Notes for section ${index + 1}`} rows={2} placeholder="A note, example, or point to make (optional)" value={section.note} onChange={(event) => updateSection(section.id, 'note', event.target.value)} />
                    </div>
                    <div className="outline-actions">
                      <button type="button" aria-label={`Move section ${index + 1} up`} disabled={index === 0} onClick={() => moveSection(index, -1)}>↑</button>
                      <button type="button" aria-label={`Move section ${index + 1} down`} disabled={index === outline.length - 1} onClick={() => moveSection(index, 1)}>↓</button>
                      <button type="button" aria-label={`Remove section ${index + 1}`} onClick={() => removeSection(section.id)}>×</button>
                    </div>
                  </article>
                ))}
              </div>
              <button type="button" className="add-section" onClick={addSection}><span>+</span> Add a section</button>
              <div className="bottom-actions"><button type="button" className="back-button" onClick={() => setStage('topic')}>← Back to topic</button><button type="button" className="primary-button" disabled={!outline.length || outline.some((section) => !section.heading.trim())} onClick={startDraft}>Write a first draft <span aria-hidden="true">↗</span></button></div>
            </div>
          )}

          {stage === 'draft' && (
            <div className="stage-content draft-stage">
              <div className="eyebrow"><span>03</span><span className="eyebrow-line" />LET IT TAKE FORM</div>
              <div className="draft-title-row"><div><h1>Your first<br /><em>rough draft.</em></h1><p className="stage-intro">A starting point, not the final word. Make it sound like you.</p></div><button className="copy-button" type="button" onClick={copyDraft}>{copied ? 'Copied' : 'Copy draft'} <span aria-hidden="true">↗</span></button></div>
              <div className="draft-meta"><span>{tone.toUpperCase()} TONE</span><span>FOR {audience.toUpperCase()}</span><button type="button" onClick={() => setStage('outline')}>← Edit outline</button></div>
              <textarea className="draft-editor" aria-label="Edit your blog draft" value={draft} onChange={(event) => setDraft(event.target.value)} />
              <div className="bottom-actions draft-bottom"><button type="button" className="back-button" onClick={() => setStage('outline')}>← Back to outline</button><button type="button" className="primary-button" onClick={startOver}>Start a new post <span aria-hidden="true">+</span></button></div>
              <p className="draft-disclaimer">This local starter uses a simple template. It does not research sources or verify claims.</p>
            </div>
          )}
        </section>
      </main>
      <footer className="app-footer"><span>AN OPEN NOTEBOOK FOR IDEAS</span><span>MADE FOR THE NEXT DRAFT <b>✳</b></span></footer>
    </div>
  )
}

export default App
