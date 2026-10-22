import React from 'react';

export interface NavItemDef {
  id: string;
  label: string;
}

interface SidebarNavProps {
  activeSection: string;
  accent: string;
  onNavigate: (id: string) => void;
  published?: boolean;
  repoUrl?: string;
  linkedinUrl?: string;
}

export const navItemsList: NavItemDef[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'scenarios', label: '1. Fall NTR to 2030' },
  { id: 'inspector', label: '2. Cohort Inspector' },
  { id: 'calc', label: '3. 4-Year NTR Calculator' },
  { id: 'method', label: '4. Terminology Guide' },
  { id: 'cohorts', label: '5. Standing Report' },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeSection,
  accent,
  onNavigate,
  published = true,
  repoUrl = 'https://github.com/jp-87/persistence-model-portfolio-schofield-v2',
  linkedinUrl = 'https://www.linkedin.com/in/john-schofield',
}) => {
  return (
    <aside className="sticky top-[72px] self-start hidden lg:block w-[200px]">
      <div className="text-[10.5px] font-bold tracking-[1.6px] text-[#a9a79d] uppercase mb-3">
        Sections
      </div>

      <nav className="flex flex-col gap-0.5">
        {navItemsList.map((item) => {
          const isActive = item.id === activeSection;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="group flex items-center gap-2.5 text-left py-1 cursor-pointer bg-transparent border-none transition-colors w-full"
            >
              <span
                className="w-[18px] h-[2px] rounded-xs shrink-0 transition-all duration-200"
                style={{
                  backgroundColor: isActive ? accent : '#dcdacf',
                  transform: isActive ? 'scaleX(1.15)' : 'none',
                }}
              />
              <span
                className="text-[12.5px] transition-colors duration-200"
                style={{
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? accent : '#7a7870',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-5 pt-4 border-t border-[#e6e4dc] flex items-center gap-2">
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn Profile"
          aria-label="LinkedIn Profile"
          className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center text-[#0a66c2] bg-[#f0f4f9] hover:bg-[#e1ecf6] border border-[#d2def0] transition-colors shrink-0 shadow-xs"
        >
          <svg
            className="w-4 h-4 fill-current shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.68 1.68 0 1 0-.02-3.36 1.68 1.68 0 0 0 .02 3.36m1.39 9.74v-8.37H5.07v8.37h2.78z" />
          </svg>
        </a>

        {(published || repoUrl) && (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repository"
            aria-label="GitHub Repository"
            className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center text-[#1b1c18] bg-[#f0eee4] hover:bg-[#e5e2d6] border border-[#dcdad0] transition-colors shrink-0 shadow-xs"
          >
            <svg
              className="w-4 h-4 fill-current shrink-0"
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
    </aside>
  );
};

