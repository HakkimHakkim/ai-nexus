
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Sparkles, Brain, Bot, Code2, ShieldCheck,
  Layers3, Zap, MessageSquare, GitCompare, Database,
  Cpu, Menu, X, Check, Globe2
} from 'lucide-react'
import './landing.css'

const models = [
  {
    name: 'Gemini 3.6',
    provider: 'Google',
    description: 'Explore intelligent responses, reasoning and creative assistance.',
    icon: Brain,
    color: 'blue',
    type: 'AI MODEL'
  },
  {
    name: 'GPT-OSS 120B',
    provider: 'Open-weight model',
    description: 'A large open-weight model for complex tasks and detailed responses.',
    icon: Cpu,
    color: 'purple',
    type: 'LARGE MODEL'
  },
  {
    name: 'GPT-OSS 20B',
    provider: 'Open-weight model',
    description: 'A compact model for general-purpose AI interactions.',
    icon: Zap,
    color: 'orange',
    type: 'COMPACT MODEL'
  },
  {
    name: 'Qwen3.6 27B',
    provider: 'Qwen',
    description: 'An AI model for coding, reasoning and everyday tasks.',
    icon: Code2,
    color: 'green',
    type: 'AI MODEL'
  },
  {
    name: 'Llama Offline',
    provider: 'Local AI option',
    description: 'An option for exploring locally hosted AI capabilities.',
    icon: Bot,
    color: 'pink',
    type: 'LOCAL OPTION'
  }
]

const features = [
  {
    icon: Layers3,
    title: 'Multiple AI Models',
    description: 'Access different AI models from one unified workspace.',
    color: 'blue'
  },
  {
    icon: GitCompare,
    title: 'Compare Responses',
    description: 'Explore answers from multiple selected models side by side.',
    color: 'purple'
  },
  {
    icon: MessageSquare,
    title: 'Smart Conversations',
    description: 'Keep your conversations organized with chat history.',
    color: 'orange'
  },
  {
    icon: ShieldCheck,
    title: 'Personal Workspace',
    description: 'Manage your account, preferences and saved conversations.',
    color: 'green'
  },
  {
    icon: Code2,
    title: 'Coding Assistance',
    description: 'Explore programming concepts, code and technical questions.',
    color: 'pink'
  },
  {
    icon: Zap,
    title: 'Simple Experience',
    description: 'Switch models and explore AI without changing platforms.',
    color: 'yellow'
  }
]

const technologies = ['React', 'Vite', 'Python', 'FastAPI', 'SQLite', 'AI Model APIs']

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="landing-page">

      {/* Navigation */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo" onClick={closeMenu}>
            <span className="logo-symbol"><Brain size={23} /></span>
            <span>AI <strong>Nexus</strong></span>
          </Link>

          <nav className={`landing-links ${menuOpen ? 'menu-open' : ''}`}>
            <a href="#about" onClick={closeMenu}>About</a>
            <a href="#models" onClick={closeMenu}>AI Models</a>
            <a href="#how-it-works" onClick={closeMenu}>How It Works</a>
            <a href="#features" onClick={closeMenu}>Features</a>
            <Link to="/login" className="mobile-login" onClick={closeMenu}>
              Sign In <ArrowRight size={16} />
            </Link>
          </nav>

          <div className="nav-actions">
            <Link to="/login" className="nav-login">Sign In</Link>
            <Link to="/login" className="nav-cta">
              Get Started <ArrowRight size={16} />
            </Link>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-container">

          <div className="hero-content">
            <div className="hero-label">
              <Sparkles size={15} />
              <span>YOUR MULTI-MODEL AI WORKSPACE</span>
            </div>

            <h1>
              Discover a Smarter Way
              to Work with <span>AI.</span>
            </h1>

            <p className="hero-description">
              One platform. Multiple AI models. Endless possibilities.
              Explore, compare and interact with different AI technologies
              through one unified workspace.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="primary-cta">
                Explore AI Nexus <ArrowRight size={18} />
              </Link>
              <a href="#models" className="secondary-cta">
                Discover Models
              </a>
            </div>

            <div className="hero-trust">
              <div className="trust-icons">
                <span><Brain size={17} /></span>
                <span><Code2 size={17} /></span>
                <span><Sparkles size={17} /></span>
              </div>
              <p>Multiple models. One unified experience.</p>
            </div>
          </div>

          {/* CSS 3D illustration */}
          <div className="hero-visual">
            <div className="visual-glow" />
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <div className="hero-core">
              <div className="core-inner">
                <Brain size={86} strokeWidth={1.2} />
                <span>AI</span>
              </div>
            </div>

            <div className="floating-card card-model">
              <span className="floating-icon blue-icon"><Sparkles size={19} /></span>
              <div>
                <strong>Multiple Models</strong>
                <small>Explore AI technologies</small>
              </div>
            </div>

            <div className="floating-card card-code">
              <span className="floating-icon orange-icon"><Code2 size={19} /></span>
              <div>
                <strong>Code Assistance</strong>
                <small>Build and explore</small>
              </div>
            </div>

            <div className="floating-card card-chat">
              <span className="floating-icon green-icon"><MessageSquare size={19} /></span>
              <div>
                <strong>Smart Chat</strong>
                <small>Start a conversation</small>
              </div>
            </div>

            <div className="visual-decoration decoration-one">✦</div>
            <div className="visual-decoration decoration-two">✧</div>
          </div>

        </div>
      </section>

      {/* Introduction strip */}
      <section className="intro-strip">
        <div className="intro-inner">
          <div><strong>01</strong><span>One Unified Platform</span></div>
          <div><strong>02</strong><span>Multiple AI Models</span></div>
          <div><strong>03</strong><span>Smarter Interactions</span></div>
        </div>
      </section>

      {/* About */}
      <section className="landing-section about-section" id="about">
        <div className="section-container about-grid">

          <div className="about-visual">
            <div className="about-art">
              <div className="about-art-circle">
                <Brain size={100} strokeWidth={1.1} />
              </div>
              <div className="about-mini about-mini-one"><Cpu size={24} /></div>
              <div className="about-mini about-mini-two"><Sparkles size={24} /></div>
              <div className="about-mini about-mini-three"><Globe2 size={24} /></div>
              <div className="about-art-caption">Connecting AI possibilities</div>
            </div>
          </div>

          <div className="about-content">
            <span className="section-eyebrow">ABOUT AI NEXUS</span>
            <h2>
              Bringing different AI
              technologies <span>together.</span>
            </h2>
            <p>
              AI Nexus is a multi-model AI platform designed to make
              artificial intelligence more accessible and convenient.
              Instead of switching between different tools, users can
              explore multiple AI models in one workspace.
            </p>
            <p>
              From everyday questions to coding assistance and model
              comparisons, AI Nexus provides a unified environment
              for exploring AI capabilities.
            </p>
            <Link to="/login" className="text-link">
              Explore the platform <ArrowRight size={17} />
            </Link>
          </div>

        </div>
      </section>

      {/* Models */}
      <section className="landing-section models-section" id="models">
        <div className="section-container">
          <div className="section-heading">
            <span className="section-eyebrow">POWERED BY AI</span>
            <h2>Explore the AI models <span>behind Nexus.</span></h2>
            <p>
              Discover different AI technologies and choose models
              based on your tasks and preferences.
            </p>
          </div>

          <div className="models-grid">
            {models.map((model) => {
              const Icon = model.icon
              return (
                <article className={`model-card model-${model.color}`} key={model.name}>
                  <div className="model-card-top">
                    <div className="model-icon"><Icon size={27} /></div>
                    <span className="model-type">{model.type}</span>
                  </div>
                  <h3>{model.name}</h3>
                  <span className="model-provider">{model.provider}</span>
                  <p>{model.description}</p>
                  <Link to="/login" className="model-link">
                    Explore model <ArrowRight size={16} />
                  </Link>
                </article>
              )
            })}
          </div>
          <p className="models-note">
            Model availability depends on backend configuration and runtime status.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section workflow-section" id="how-it-works">
        <div className="section-container">
          <div className="section-heading">
            <span className="section-eyebrow">SIMPLE WORKFLOW</span>
            <h2>How does AI Nexus <span>work?</span></h2>
            <p>Start exploring artificial intelligence in three simple steps.</p>
          </div>

          <div className="workflow-grid">
            <div className="workflow-card">
              <div className="workflow-number">01</div>
              <div className="workflow-icon workflow-blue"><Layers3 size={31} /></div>
              <h3>Choose a Model</h3>
              <p>Select one or more AI models from the available options.</p>
            </div>

            <div className="workflow-card">
              <div className="workflow-number">02</div>
              <div className="workflow-icon workflow-orange"><MessageSquare size={31} /></div>
              <h3>Ask Your Question</h3>
              <p>Enter a prompt, ask questions or explore your ideas.</p>
            </div>

            <div className="workflow-card">
              <div className="workflow-number">03</div>
              <div className="workflow-icon workflow-green"><Sparkles size={31} /></div>
              <h3>Explore Responses</h3>
              <p>Read AI-generated answers and compare different responses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chat preview */}
      <section className="landing-section preview-section">
        <div className="section-container preview-grid">

          <div className="preview-content">
            <span className="section-eyebrow">YOUR AI WORKSPACE</span>
            <h2>
              One question.
              <span> Multiple perspectives.</span>
            </h2>
            <p>
              Interact with multiple selected AI models from a single
              conversation. Explore their responses and discover
              different approaches to the same question.
            </p>

            <ul className="preview-checks">
              <li><Check size={17} /> Select multiple AI models</li>
              <li><Check size={17} /> View responses side by side</li>
              <li><Check size={17} /> Save conversations for later</li>
              <li><Check size={17} /> Manage your chat history</li>
            </ul>

            <Link to="/login" className="primary-cta">
              Try AI Nexus <ArrowRight size={18} />
            </Link>
          </div>

          <div className="chat-preview">
            <div className="preview-window">
              <div className="preview-window-header">
                <div className="preview-dots"><i /><i /><i /></div>
                <span>AI Nexus Workspace</span>
                <span className="preview-status">Workspace preview</span>
              </div>

              <div className="preview-models">
                <span>Gemini</span>
                <span>GPT-OSS</span>
                <span>Qwen</span>
              </div>

              <div className="preview-question">
                How can AI help developers build better applications?
              </div>

              <div className="preview-answer">
                <div className="answer-heading">
                  <span className="answer-icon"><Brain size={17} /></span>
                  <strong>AI Response</strong>
                  <small>Example preview</small>
                </div>
                <p>
                  AI can assist developers with code generation,
                  debugging, documentation and exploring different
                  solutions to technical problems.
                </p>
                <div className="answer-lines"><i /><i /><i /></div>
              </div>

              <div className="preview-input">
                <span>Ask something about AI...</span>
                <span className="preview-send"><ArrowRight size={17} /></span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="landing-section features-section" id="features">
        <div className="section-container">
          <div className="section-heading">
            <span className="section-eyebrow">WHAT YOU CAN DO</span>
            <h2>Everything you need in <span>one workspace.</span></h2>
            <p>Useful tools designed to make AI interactions simple and organized.</p>
          </div>

          <div className="features-grid">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <article className="feature-card" key={feature.title}>
                  <div className={`feature-icon feature-${feature.color}`}>
                    <Icon size={25} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="landing-section technology-section">
        <div className="section-container technology-inner">
          <div>
            <span className="section-eyebrow">BUILT WITH TECHNOLOGY</span>
            <h2>Powered by modern <span>technologies.</span></h2>
            <p>
              AI Nexus combines modern frontend technologies,
              backend services and AI integrations to deliver
              a unified experience.
            </p>
          </div>

          <div className="technology-tags">
            {technologies.map((tech) => (
              <span key={tech}><Check size={15} /> {tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-section final-cta-section">
        <div className="final-cta">
          <div className="cta-sparkle"><Sparkles size={32} /></div>
          <span className="section-eyebrow">START EXPLORING</span>
          <h2>Ready to explore the world of AI?</h2>
          <p>
            Discover different AI models and bring your ideas
            into one intelligent workspace.
          </p>
          <Link to="/login" className="primary-cta">
            Get Started with AI Nexus <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="section-container footer-inner">
          <Link to="/" className="landing-logo">
            <span className="logo-symbol"><Brain size={22} /></span>
            <span>AI <strong>Nexus</strong></span>
          </Link>
          <p>One platform. Multiple AI minds. Smarter possibilities.</p>
          <span className="footer-copy">© 2026 AI Nexus. All rights reserved.</span>
        </div>
      </footer>

    </div>
  )
}
