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
}

export const navItemsList: NavItemDef[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'scenarios', label: '1. Fall NTR to 2030' },
  { id: 'inspector', label: '2. Cohort Inspector' },
  { id: 'calc', label: '3. 4-Year NTR Calculator' },
  { id: 'method', label: 'Terminology Guide' },
  { id: 'cohorts', label: 'Standing Report' },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeSection,
  accent,
  onNavigate,
  published = true,
  repoUrl = 'https://github.com/jp-87/student-persistence-model',
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

      {(published || repoUrl) && (
        <div className="mt-5 pt-4 border-t border-[#e6e4dc]">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[12px] font-bold text-[#0d4f30] hover:underline"
          >
            GitHub Repository ↗
          </a>
        </div>
      )}
    </aside>
  );
};

