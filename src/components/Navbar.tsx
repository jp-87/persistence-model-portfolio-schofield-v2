import React from 'react';

interface NavbarProps {
  accent: string;
  paper: string;
  repoUrl?: string;
  linkedinUrl?: string;
  published?: boolean;
  onNavigate?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  accent,
  paper,
  repoUrl = 'https://github.com/jp-87/persistence-model-portfolio-schofield-v2',
  linkedinUrl = 'https://www.linkedin.com/in/john-schofield',
  published = true,
  onNavigate,
}) => {
  const navLinks = [
    { id: 'scenarios', label: '2030 Fall NTR' },
    { id: 'inspector', label: 'Cohort Inspector' },
    { id: 'calc', label: '4-Year NTR Calculator' },
    { id: 'method', label: 'Terminology Guide' },
    { id: 'cohorts', label: 'Standing Report' },
  ];

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md border-b border-[#e6e4dc] transition-colors"
      style={{
        backgroundColor: `color-mix(in srgb, ${paper} 92%, transparent)`,
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-3 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#overview"
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate('overview');
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
            John Schofield{' '}
            <span className="text-[#8c8a7e] font-sans font-normal mx-1.5">
              |
            </span>{' '}
            Student Persistence Model
          </span>
        </a>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-5 text-[12.5px] font-semibold text-[#54564c]"
        >
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onNavigate && onNavigate(link.id)}
              className="cursor-pointer py-1 bg-transparent border-none text-[#54564c] hover:text-[#1b1c18] transition-colors whitespace-nowrap shrink-0"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Just LinkedIn and GitHub Logos */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn Profile"
            aria-label="LinkedIn Profile"
            className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center text-[#0a66c2] bg-[#f0f4f9] hover:bg-[#e1ecf6] border border-[#d2def0] transition-colors shrink-0 shadow-xs"
          >
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.68 1.68 0 1 0-.02-3.36 1.68 1.68 0 0 0 .02 3.36m1.39 9.74v-8.37H5.07v8.37h2.78z" />
            </svg>
          </a>

          {(published || repoUrl) && (
            <a
              href={repoUrl || 'https://github.com/jp-87/persistence-model-portfolio-schofield-v2'}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub Repository"
              aria-label="GitHub Repository"
              className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center text-white transition-opacity hover:opacity-90 shrink-0 shadow-xs"
              style={{ backgroundColor: accent }}
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
