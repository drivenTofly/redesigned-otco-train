import { useState } from 'react'
import './App.css'

type OutlineSection = {
  id: number
  heading: string
  note: string
}

type Stage = 'topic' | 'outline' | 'draft'
type BlogStyle = 'Funny' | 'Serious' | 'Persuasive'
type DomainExpertise = 'History' | 'Technology' | 'Math'

const blogStyles: BlogStyle[] = ['Funny', 'Serious', 'Persuasive']
const expertiseOptions: DomainExpertise[] = ['History', 'Technology', 'Math']

const outlineAngles: Record<BlogStyle, string[]> = {
  Funny: [
    'The everyday absurdity of {topic}',
    'Why it deserves a closer look',
    'The part that might actually work',
    'What happens when we take it seriously',
  ],
  Serious: [
    'The context behind {topic}',
    'What the evidence and experience suggest',
    'The practical implications',
    'Questions worth carrying forward',
  ],
  Persuasive: [
    'The case for paying attention to {topic}',
    'The strongest case for a closer look',
    'A practical path toward change',
    'The next step readers can take',
  ],
}

const sectionPrompts: Record<DomainExpertise, string[]> = {
  History: [
    'Place the topic in its time and place. Identify the conditions and choices that shaped it.',
    'Trace a significant person, event, or turning point and explain what changed as a result.',
    'Compare what persisted with what shifted, using specific examples rather than treating the past as a single story.',
    'Connect the historical perspective to a question readers can consider today without assuming history repeats itself.',
  ],
  Technology: [
    'Explain the system in plain language, including the problem it is designed to solve.',
    'Show how the people, data, or processes interact within the system.',
    'Examine the benefits alongside limitations, risks, and practical trade-offs.',
    'Look ahead to possible developments while distinguishing evidence from speculation.',
  ],
  Math: [
    'State the question, define the variables, and make the assumptions explicit.',
    'Show the relationship or calculation step by step, using a small example.',
    'Check the result and explain what the units, scale, or possible error mean.',
    'Interpret the result in context and state what the model does not capture.',
  ],
}

function makeDraft(topic: string, sections: OutlineSection[], audience: string, style: BlogStyle, expertise: DomainExpertise) {
  const expertiseOpenings: Record<DomainExpertise, string> = {
    History: `A useful way to understand ${topic} is to trace the people, events, and forces that shaped it over time.`,
    Technology: `To understand ${topic}, look at the problem it addresses, how its parts interact, and who is affected.`,
    Math: `A clear analysis of ${topic} starts with a well-defined question, explicit assumptions, and careful interpretation of the result.`,
  }
  const openings: Record<BlogStyle, string> = {
    Funny: `Every subject has a backstory, a few surprises, and at least one detail that sounds made up. ${expertiseOpenings[expertise]}`,
    Serious: `Begin with the fundamentals. ${expertiseOpenings[expertise]}`,
    Persuasive: `The strongest case begins with how a subject works and why it matters. ${expertiseOpenings[expertise]}`,
  }
  const styleDirections: Record<BlogStyle, string> = {
    Funny: 'Keep the explanation lively without sacrificing accuracy.',
    Serious: 'Be precise and measured, separating evidence from interpretation.',
    Persuasive: 'Connect this point to the case you want readers to consider.',
  }
  const expertiseClosings: Record<DomainExpertise, string> = {
    History: 'Use past patterns as perspective, not as a prediction.',
    Technology: 'Judge the system by its evidence, trade-offs, and real-world outcomes.',
    Math: 'Check the assumptions and units before applying the result.',
  }
  const closings: Record<BlogStyle, string> = {
    Funny: `For ${audience.toLowerCase()}, the point is not to take every detail solemnly. It is to notice what matters, laugh at what deserves it, and keep asking better questions about ${topic}.`,
    Serious: `For ${audience.toLowerCase()}, the next step is to weigh the evidence, keep the trade-offs in view, and continue the conversation about ${topic} with care.`,
    Persuasive: `For ${audience.toLowerCase()}, the next step is clear: choose one practical action and invite others to join.`,
  }
  const body = sections
    .map(({ heading, note }, index) => {
      const detail = note.trim() || `${styleDirections[style]} ${sectionPrompts[expertise][index % sectionPrompts[expertise].length]}`
      return `${heading}\n\n${detail}`
    })
    .join('\n\n')
  return `${topic}\n\n${openings[style]}\n\n${body}\n\n${closings[style]} ${expertiseClosings[expertise]}`
}

function App() {
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('Curious readers')
  const [style, setStyle] = useState<BlogStyle>('Serious')
  const [expertise, setExpertise] = useState<DomainExpertise>('Technology')
  const [stage, setStage] = useState<Stage>('topic')
  const [outline, setOutline] = useState<OutlineSection[]>([])
  const [draft, setDraft] = useState('')
  const [copied, setCopied] = useState(false)

  function generateOutline() {
    const cleanedTopic = topic.trim()
    if (!cleanedTopic) return
    setTopic(cleanedTopic)
    setOutline(
      outlineAngles[style].map((angle, index) => ({
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
    setDraft(makeDraft(topic, outline, audience, style, expertise))
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
                  <fieldset className="choice-field">
                    <legend>STYLE</legend>
                    <div className="choice-options">
                      {blogStyles.map((option) => (
                        <label className={`choice-option ${style === option ? 'selected' : ''}`} key={option}>
                          <input type="radio" name="blog-style" value={option} checked={style === option} onChange={() => setStyle(option)} />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="choice-field">
                    <legend>EXPERTISE</legend>
                    <div className="choice-options">
                      {expertiseOptions.map((option) => (
                        <label className={`choice-option ${expertise === option ? 'selected' : ''}`} key={option}>
                          <input type="radio" name="domain-expertise" value={option} checked={expertise === option} onChange={() => setExpertise(option)} />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
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
                      <textarea aria-label={`Notes for section ${index + 1}`} rows={2} placeholder={`${sectionPrompts[expertise][index % sectionPrompts[expertise].length]} (optional)`} value={section.note} onChange={(event) => updateSection(section.id, 'note', event.target.value)} />
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
              <div className="draft-meta"><span>{style.toUpperCase()} STYLE</span><span>{expertise.toUpperCase()} LENS</span><span>FOR {audience.toUpperCase()}</span><button type="button" onClick={() => setStage('outline')}>← Edit outline</button></div>
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
