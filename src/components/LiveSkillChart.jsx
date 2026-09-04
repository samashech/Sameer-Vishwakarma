import { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import './LiveSkillChart.css';

const CACHE_KEY = 'samashech-github-skills';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 1 day

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`${payload[0].payload.name}`}</p>
        <p className="tooltip-value">{`${payload[0].value}% of recent codebase`}</p>
      </div>
    );
  }
  return null;
};

const LiveSkillChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { timestamp, skills } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setData(skills);
          setLoading(false);
          return;
        }
      }

      try {
        const reposRes = await fetch('https://api.github.com/users/samashech/repos?sort=pushed&per_page=10');
        if (!reposRes.ok) throw new Error('Failed to fetch repos');
        const repos = await reposRes.json();

        const langPromises = repos.map(repo => 
          fetch(repo.languages_url).then(r => r.json()).catch(() => ({}))
        );
        const langsArray = await Promise.all(langPromises);

        const totals = {};
        let totalBytes = 0;

        langsArray.forEach(langs => {
          Object.entries(langs).forEach(([lang, bytes]) => {
            if (['HTML', 'CSS', 'Jupyter Notebook', 'SCSS'].includes(lang)) return;
            totals[lang] = (totals[lang] || 0) + bytes;
            totalBytes += bytes;
          });
        });

        const formatted = Object.entries(totals)
          .map(([name, bytes]) => ({
            name,
            value: Math.round((bytes / totalBytes) * 100)
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);

        if (formatted.length > 0) {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), skills: formatted }));
          setData(formatted);
        }
      } catch (e) {
        console.error('Error fetching skills chart:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if (loading) {
    return <div className="skill-chart-loading">Loading live skill data...</div>;
  }

  if (data.length === 0) return null;

  return (
    <div className="live-skill-chart-container">
      <h3 className="chart-title">Recent Language Usage</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart cx="50%" cy="50%" outerRadius="55%" data={data}>
            <PolarGrid stroke="var(--lightest-navy)" />
            <PolarAngleAxis 
              dataKey="name" 
              tick={{ fill: 'var(--light-slate)', fontSize: 10, fontFamily: 'var(--font-mono, monospace)' }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Skills"
              dataKey="value"
              stroke="var(--green-bright, #64ffda)"
              strokeWidth={2}
              fill="var(--green-bright, #64ffda)"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-caption">Auto-generated from recent GitHub activity.</p>
    </div>
  );
};

export default LiveSkillChart;
