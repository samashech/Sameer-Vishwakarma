import { useRef } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { ExternalLink, Code, ChevronLeft, ChevronRight } from 'lucide-react';
import { FadeInSection } from '../components/FadeInSection';
import AsciiPortrait from '../components/AsciiPortrait';
import CanvasText from '../components/CanvasText';
import './Home.css';

const Home = () => {
  const sliderRef = useRef(null);

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const skills = [
    'Python', 'JavaScript', 'TypeScript', 'C', 'HTML5/CSS', 'Rust (basic)',
    'React.js', 'Next.js', 'Node.js', 'FastAPI', 'Flask', 'Tailwind CSS',
    'PostgreSQL (Prisma)', 'SQLite', 'Redis', 'Supabase', 'Firebase',
    'Docker', 'Linux', 'TensorFlow', 'MediaPipe'
  ];

  const experience = [
    {
      title: 'Junior Developer',
      company: 'RAIoT Labs (Amity University)',
      date: '2025 - Present',
      location: 'Jaipur',
      highlights: [
        'Build and deploy IoT hardware/software projects bridging sensors with full-stack real-time dashboards',
        'Lead student teams in hackathons, robowars, and autonomous flight competitions',
        'Maintain and contribute to open-source repos (documentation, code review)'
      ]
    }
  ];

  const projects = [
    {
      title: 'Trackly AI — Productivity Platform',
      desc: 'Full-stack productivity app with a Chrome extension that blocks distracting sites when deadlines are missed; integrates Gemini 2.5 Flash vision + language for real-time habit verification and AI check-ins; frontend on Firebase, backend on Hugging Face Spaces.',
      stack: ['Python', 'FastAPI', 'React', 'Gemini', 'Firebase'],
      github: '#',
      live: '#',
      image: '/assets/trackly.png'
    },
    {
      title: 'Align — AI Resume Analyzer',
      desc: 'Matches candidate resumes to live job postings via PyPDF2 parsing + NLP skill extraction; a Matplotlib/Seaborn/Pandas pipeline visualizes skill-gap trends against market demand, served through a Next.js frontend and Flask API.',
      stack: ['Next.js', 'Python', 'Flask', 'Playwright', 'Tailwind'],
      github: '#',
      live: '#',
      image: '/assets/align.png'
    },
    {
      title: 'AI Sign Language Translator',
      desc: 'Multi-layer LSTM model translating continuous sign language into text for medical/emergency phrases, processing 1,692 spatial landmarks per 30-frame sequence via MediaPipe; uses a Gemini LLM to turn isolated gesture classifications into grammatically correct sentences.',
      stack: ['Python', 'TensorFlow', 'MediaPipe', 'LSTM', 'LLM API'],
      github: '#',
      live: '#',
      image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'EduRep — Education Transparency Tracker',
      desc: 'Transparency platform tracking education budgets, court mandates, and RTI responses on a custom Prisma/SQLite schema, with an interactive evidence room and protest timeline.',
      stack: ['Next.js', 'Prisma', 'SQLite', 'Tailwind CSS'],
      github: '#',
      live: '#',
      image: '/assets/edurep.png'
    }
  ];

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section id="hero" className="hero-section">
        <div className="hero-content">
          <FadeInSection delay="100ms">
            <h1 className="hero-greeting">
              <CanvasText 
                text="Hi, my name is" 
                font="normal 16px Menlo, Consolas, Monaco, 'Courier New', monospace" 
                color="var(--green-bright)" 
                lineHeight={24}
              />
            </h1>
          </FadeInSection>
          <FadeInSection delay="200ms">
            <h2 className="hero-name">Sameer Vishwakarma.</h2>
          </FadeInSection>
          <FadeInSection delay="300ms">
            <h3 className="hero-subtitle">
              <TypeAnimation
                sequence={[
                  'I build full-stack web apps.', 2000,
                  'I integrate AI tools.', 2000,
                  'I design IoT systems.', 2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </h3>
          </FadeInSection>
          <FadeInSection delay="400ms">
            <div className="hero-bio">
              <CanvasText 
                text="Software engineer building full-stack web apps, AI-integrated tools, and IoT systems. Currently building production IoT and data-visualization projects at RAIoT Labs while leading student teams through hackathons and technical competitions."
                font="normal 18px Calibre, Inter, San Francisco, SF Pro Text, -apple-system, system-ui, sans-serif"
                color="var(--slate)"
                lineHeight={28}
                delay={200}
              />
            </div>
          </FadeInSection>
          <FadeInSection delay="500ms">
            <a href="mailto:sameervishwakarmaa12@gmail.com" className="btn hero-btn">Say hi</a>
          </FadeInSection>
        </div>
        <div className="hero-visual">
          <FadeInSection delay="600ms">
            <AsciiPortrait />
          </FadeInSection>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="about-section">
        <FadeInSection>
          <h2 className="section-heading">/ about me</h2>
        </FadeInSection>
        <div className="about-content">
          <div className="about-text">
            <FadeInSection delay="100ms">
              <p>
                Currently a Junior Developer at RAIoT Labs, Amity University, Jaipur (2025–Present): 
                building and deploying IoT hardware/software projects, bridging sensor hardware with 
                full-stack dashboards for real-time data visualization; leading cross-functional student 
                teams through hackathons, robowars, and autonomous flight events; maintaining/contributing 
                to open-source repos through documentation and code review.
              </p>
            </FadeInSection>
            <ul className="skills-list">
              {skills.map((skill, i) => (
                <li key={i}>
                  <FadeInSection delay={`${(i % 5) * 100}ms`}>
                    <span className="skill-pill">{skill}</span>
                  </FadeInSection>
                </li>
              ))}
            </ul>
          </div>
          <div className="about-image-wrapper">
             <FadeInSection delay="200ms">
                <div className="about-image-placeholder">
                  <img src="/assets/god.jpeg" alt="Sameer Vishwakarma" className="about-image" />
                </div>
             </FadeInSection>
          </div>
        </div>
      </section>

      {/* EXPERIENCE SECTION */}
      <section id="experience" className="experience-section">
        <FadeInSection>
          <h2 className="section-heading">/ experience</h2>
        </FadeInSection>
        <div className="experience-list">
          {experience.map((job, i) => (
            <FadeInSection key={i} delay="100ms">
              <div className="job-card">
                <div className="job-header">
                  <h3 className="job-title">
                    {job.title} <span className="highlight">@ {job.company}</span>
                  </h3>
                  <span className="job-date">{job.date} | {job.location}</span>
                </div>
                <ul className="job-highlights">
                  {job.highlights.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section id="projects" className="projects-section">
        <FadeInSection>
          <h2 className="section-heading">/ projects</h2>
        </FadeInSection>
        
        <div className="slider-container">
          <button className="slider-btn left" onClick={() => scrollSlider('left')} aria-label="Scroll left">
            <ChevronLeft size={24} />
          </button>
          
          <div className="projects-slider" ref={sliderRef}>
            {projects.map((project, i) => (
              <div key={i} className="project-card">
                <div className="project-image" style={{ backgroundImage: `url(${project.image})` }}></div>
                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <div className="project-desc">
                    <p>{project.desc}</p>
                  </div>
                  <ul className="project-stack">
                    {project.stack.map((tech, j) => (
                      <li key={j}>{tech}</li>
                    ))}
                  </ul>
                  <div className="project-links">
                    <a href={project.github} aria-label="GitHub Link"><Code size={20} /></a>
                    <a href={project.live} aria-label="External Link"><ExternalLink size={20} /></a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="slider-btn right" onClick={() => scrollSlider('right')} aria-label="Scroll right">
            <ChevronRight size={24} />
          </button>
        </div>

        <FadeInSection delay="200ms">
          <div className="other-projects">
            <h3>Other Noteworthy Projects</h3>
            <ul className="other-projects-list">
              <li>
                <strong>NutriLens</strong> — Dockerized health app pairing a React frontend with an ML backend for nutritional analysis. (Next.js, Docker, Python)
              </li>
            </ul>
          </div>
        </FadeInSection>
      </section>
      
      {/* EDUCATION SECTION */}
      <section id="education" className="education-section">
        <FadeInSection>
          <h2 className="section-heading">/ education</h2>
        </FadeInSection>
        <FadeInSection delay="100ms">
          <div className="education-card">
            <h3 className="edu-degree">B.Tech, Computer Science & Engineering</h3>
            <p className="edu-school">Amity University, Jaipur, Rajasthan</p>
            <span className="edu-date">Expected 2029</span>
          </div>
        </FadeInSection>
        <FadeInSection delay="200ms">
          <div className="education-card">
            <h3 className="edu-degree">High School Diploma</h3>
            <p className="edu-school">Best Higher Secondary School, Ahmedabad, Gujarat</p>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
};

export default Home;
