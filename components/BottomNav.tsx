'use client';
import { useRef, useEffect } from 'react';

const tabs = [
  { id: 'home', label: 'Home', icon: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" /> },
  { id: 'tarot', label: 'Tarot', icon: <path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z" /> },
  { id: 'chart', label: 'Chart', icon: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><line x1="12" y1="3" x2="12" y2="8" /><line x1="12" y1="16" x2="12" y2="21" /><line x1="3" y1="12" x2="8" y2="12" /><line x1="16" y1="12" x2="21" y2="12" /></> },
  { id: 'chat', label: 'Luna', icon: <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
  { id: 'explore', label: 'Explore', icon: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> },
  { id: 'profile', label: 'Profile', icon: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!navRef.current || !svgRef.current) return;
    const items = navRef.current.querySelectorAll('.nav-item');
    const svg = svgRef.current;
    const rect = navRef.current.getBoundingClientRect();

    // Draw constellation lines
    let paths = '';
    let dots = '';
    const activeIdx = tabs.findIndex(t => t.id === activeTab);

    items.forEach((item, i) => {
      const r = item.getBoundingClientRect();
      const cx = r.left - rect.left + r.width / 2;
      const cy = r.top - rect.top + r.height / 2 - 4;

      dots += `<circle cx="${cx}" cy="${cy}" r="2" class="constellation-dot ${i === activeIdx ? 'active' : ''}" />`;

      if (i < items.length - 1) {
        const next = items[i + 1].getBoundingClientRect();
        const nx = next.left - rect.left + next.width / 2;
        const ny = next.top - rect.top + next.height / 2 - 4;
        const isActive = i === activeIdx || i + 1 === activeIdx;
        paths += `<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" class="constellation-line ${isActive ? 'active' : ''}" />`;
      }
    });

    svg.innerHTML = paths + dots;
  }, [activeTab]);

  return (
    <div className="bottom-nav">
      <div className="nav-inner" ref={navRef}>
        <svg ref={svgRef} className="constellation-lines" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <svg viewBox="0 0 24 24">{tab.icon}</svg>
            <span>{tab.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
