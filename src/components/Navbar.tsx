import React from 'react';

interface NavbarProps {
  accent: string;
  paper: string;
  repoUrl?: string;
  published?: boolean;
  activeView?: 'portfolio' | 'report' | 'diagnostics';
  onSelectView?: (view: 'portfolio' | 'report' | 'diagnostics') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  accent,
  paper,
  repoUrl = 'https://github.com/jp-87/student-persistence-model',
  published = true,
  activeView = 'portfolio',
  onSelectView,
}) => {
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md border-b border-[#e6e4dc] transition-colors"
      style={{
        backgroundColor: `color-mix(in srgb, ${paper} 92%, transparent)`,
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#overview"
          onClick={(e) => {
            if (onSelectView && activeView !== 'portfolio') {
              e.preventDefault();
              onSelectView('portfolio');
            }
          }}
          className="inline-flex items-center gap-2.5 font-serif text-[17px] font-medium tracking-tight text-[#1b1c18] whitespace-nowrap shrink-0 no-underline hover:text-[#0d4f30] transition-colors"
        >
          <img
            src="figures/logo.png"
            alt="John Schofield logo"
            className="w-7 h-7 rounded-[6px] object-cover border border-[#1b1c18]/15 shrink-0"
          />
          <span>
            John Schofield <span className="text-[#8c8a7e] font-sans font-normal mx-1.5">|</span> Student Persistence Model
          </span>
        </a>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        {onSelectView && (
          <nav
            aria-label="Primary view navigation"
            className="flex items-center gap-6 text-[13px] font-semibold"
          >
            <button
              type="button"
              onClick={() => onSelectView('portfolio')}
              className="cursor-pointer py-1 bg-transparent border-b-2 transition-colors whitespace-nowrap shrink-0"
              style={{
                borderColor:
                  activeView === 'portfolio' ? accent : 'transparent',
                color: activeView === 'portfolio' ? accent : '#54564c',
              }}
            >
              Portfolio Case Study
            </button>
            <button
              type="button"
              onClick={() => onSelectView('report')}
              className="cursor-pointer py-1 bg-transparent border-b-2 transition-colors whitespace-nowrap shrink-0"
              style={{
                borderColor: activeView === 'report' ? accent : 'transparent',
                color: activeView === 'report' ? accent : '#54564c',
              }}
            >
              Standing Report
            </button>
            <button
              type="button"
              onClick={() => onSelectView('diagnostics')}
              className="cursor-pointer py-1 bg-transparent border-b-2 transition-colors whitespace-nowrap shrink-0"
              style={{
                borderColor:
                  activeView === 'diagnostics' ? accent : 'transparent',
                color: activeView === 'diagnostics' ? accent : '#54564c',
              }}
            >
              Model Diagnostics
            </button>
          </nav>
        )}

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          {(published || repoUrl) && (
            <a
              href={repoUrl || 'https://github.com/jp-87/student-persistence-model'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12.5px] font-semibold text-white px-3.5 py-1.5 rounded-[6px] transition-opacity hover:opacity-90 whitespace-nowrap shrink-0"
              style={{ backgroundColor: accent }}
            >
              View Repository ↗
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
