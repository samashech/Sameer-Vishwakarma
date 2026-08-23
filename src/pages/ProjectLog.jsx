import React, { useState, useEffect } from 'react';
import { GitCommit, GitPullRequest, Tag, Clock, Circle } from 'lucide-react';
import './ProjectLog.css';

// Session cache to prevent rate-limiting across component remounts
let githubActivityCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

const MILESTONES = [
  {
    id: 'm1',
    date: 'August 2026',
    title: 'Shipped Trackly AI v2.0',
    description: 'Completely revamped the Gemini vision integration for real-time habit verification. Latency dropped by 40%.',
    type: 'milestone'
  },
  {
    id: 'm2',
    date: 'July 2026',
    title: 'Joined RAIoT Labs',
    description: 'Started as a Junior Developer, working on bridging sensor hardware with full-stack dashboards.',
    type: 'milestone'
  }
];

const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  return Math.floor(seconds) + 's ago';
};

const getEventIcon = (type) => {
  switch (type) {
    case 'PushEvent': return <GitCommit size={16} className="timeline-icon push" />;
    case 'PullRequestEvent': return <GitPullRequest size={16} className="timeline-icon pr" />;
    case 'ReleaseEvent': return <Tag size={16} className="timeline-icon release" />;
    default: return <Circle size={16} className="timeline-icon default" />;
  }
};

const formatEventMessage = (event) => {
  if (event.type === 'PushEvent') {
    const commits = event.payload.commits;
    return commits && commits.length > 0 ? commits[0].message.split('\n')[0] : 'Pushed code';
  }
  if (event.type === 'PullRequestEvent') {
    return `${event.payload.action} PR: ${event.payload.pull_request.title}`;
  }
  if (event.type === 'ReleaseEvent') {
    return `Published release ${event.payload.release.tag_name}`;
  }
  return 'Activity event';
};

const ProjectLog = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGitHubActivity = async () => {
      const now = Date.now();
      if (githubActivityCache && (now - lastFetchTime < CACHE_DURATION)) {
        setEvents(githubActivityCache);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('https://api.github.com/users/samashech/events/public');
        if (!response.ok) throw new Error('Rate limited or network error');
        
        const data = await response.json();
        
        // Filter for meaningful events: Push, PR, Release
        const filteredEvents = data.filter(e => 
          ['PushEvent', 'PullRequestEvent', 'ReleaseEvent'].includes(e.type)
        ).slice(0, 15);
        
        githubActivityCache = filteredEvents;
        lastFetchTime = now;
        
        setEvents(filteredEvents);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching GitHub activity:', err);
        setError('Failed to load live activity stream.');
        setLoading(false);
        // Fallback to cache if available even if expired
        if (githubActivityCache) setEvents(githubActivityCache);
      }
    };

    fetchGitHubActivity();
  }, []);

  return (
    <div className="project-log-container">
      <div className="project-log-header">
        <h1 className="section-heading">/ project log</h1>
        <p className="log-subtitle">A mix of major milestones and a live feed of my recent GitHub activity.</p>
      </div>

      <div className="timeline">
        {/* Hand-written Milestones */}
        <div className="timeline-section-title">Milestones</div>
        {MILESTONES.map((milestone) => (
          <div key={milestone.id} className="timeline-item milestone-item">
            <div className="timeline-marker">
              <Circle size={16} className="timeline-icon milestone-icon" />
            </div>
            <div className="timeline-content">
              <div className="timeline-meta">
                <span className="timeline-date"><Clock size={12} /> {milestone.date}</span>
              </div>
              <h3 className="timeline-title">{milestone.title}</h3>
              <p className="timeline-desc">{milestone.description}</p>
            </div>
          </div>
        ))}

        {/* GitHub Live Feed */}
        <div className="timeline-section-title live-feed-title">
          Live GitHub Activity
          {loading && <span className="loading-pulse" />}
        </div>
        
        {error && !events.length && (
          <div className="timeline-error">{error}</div>
        )}

        {!loading && events.length === 0 && !error && (
          <div className="timeline-empty">No recent public activity found.</div>
        )}

        {events.map((event) => (
          <div key={event.id} className="timeline-item github-item">
            <div className="timeline-marker">
              {getEventIcon(event.type)}
            </div>
            <div className="timeline-content">
              <div className="timeline-meta">
                <span className="timeline-repo">{event.repo.name.replace('samashech/', '')}</span>
                <span className="timeline-date">{timeAgo(event.created_at)}</span>
              </div>
              <p className="timeline-desc git-message">{formatEventMessage(event)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectLog;
