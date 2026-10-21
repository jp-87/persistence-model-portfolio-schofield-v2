import React from 'react';

export interface NavItemDef {
  id: string;
  label: string;
}

interface SidebarNavProps {
  activeSection: string;
  accent: string;
  onNavigate: (id: string) => void;
  lines: string;
  tests: number;
  published?: boolean;
  repoUrl?: string;
  onOpenReport?: (tab: 'report' | 'diagnostics') => void;
}

export const navItemsList: NavItemDef[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'problem', label: 'The problem' },
  { id: 'method', label: 'The method' },
  { id: 'backtest', label: 'Backtest' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'scenarios', label: 'Scenarios' },
  { id: 'calc', label: 'Calculator' },
  { id: 'code', label: 'The code' },
  { id: 'cohorts', label: 'Cohorts and risk' },
  { id: 'limits', label: 'Limitations' },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeSection,
  accent,
  onNavigate,
  lines,
  tests,
  published = true,
  repoUrl = 'https://github.com/jp-87/student-persistence-model',
  onOpenReport,
}) => {
  return (
    <aside className="sticky top-[84px] self-start hidden lg:block w-[228px]">
      <div className="text-[10.5px] font-bold tracking-[1.6px] text-[#a9a79d] uppercase mb-4">
        Contents
      </div>

      <nav className="flex flex-col gap-0.5">
        {navItemsList.map((item) => {
          const isActive = item.id === activeSection;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="group flex items-center gap-3 text-left py-1.5 cursor-pointer bg-transparent border-none transition-colors w-full"
            >
              <span
                className="w-[22px] h-[2px] rounded-xs shrink-0 transition-all duration-200"
                style={{
                  backgroundColor: isActive ? accent : '#dcdacf',
                  transform: isActive ? 'scaleX(1.15)' : 'none',
                }}
              />
              <span
                className="text-[13px] transition-colors duration-200"
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

      <div className="mt-6.5 pt-5.5 border-t border-[#e6e4dc] flex flex-col gap-2">
        <div className="text-[12px] text-[#6f6d64] leading-[1.5]">
          {lines} lines of Python
          <br />
          {tests} tests
        </div>

        {onOpenReport && (
          <div className="flex flex-col gap-1.5 mt-2 pt-3 border-t border-[#eeece4]">
            <button
              type="button"
              onClick={() => onOpenReport('report')}
              className="cursor-pointer text-left text-[12.5px] font-bold text-[#0d4f30] hover:underline bg-transparent border-none p-0"
            >
              Standing report →
            </button>
            <button
              type="button"
              onClick={() => onOpenReport('diagnostics')}
              className="cursor-pointer text-left text-[12.5px] font-bold text-[#0d4f30] hover:underline bg-transparent border-none p-0"
            >
              Diagnostics →
            </button>
          </div>
        )}

        {(published || repoUrl) && (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-1.5 text-[12.5px] font-bold text-[#0d4f30] hover:underline"
          >
            Open repository ↗
          </a>
        )}
      </div>
    </aside>
  );
};
