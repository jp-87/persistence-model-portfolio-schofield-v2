import React from 'react';
import { SiteData } from '../data/types';

interface FooterProps {
  accent: string;
  repoUrl?: string;
  published?: boolean;
  meta: SiteData['meta'];
  dataMd5: string;
  onOpenReport: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  accent,
  repoUrl = 'https://github.com/jp-87/student-persistence-model',
  published = true,
  meta,
  dataMd5,
  onOpenReport,
}) => {
  return (
    <footer className="border-t border-[#e6e4dc] pt-6.5 mt-8 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <img
            src="figures/logo.png"
            alt="John Schofield logo"
            className="w-7 h-7 rounded-[6px] object-cover border border-[#1b1c18]/15 shrink-0"
          />
          <div>
            <div className="text-[13px] font-bold text-[#1b1c18]">
              John Schofield
            </div>
            <div className="text-[12px] text-[#8a887e]">
              Analytics Systems Engineer
            </div>
          </div>
        </div>

        {(published || repoUrl) && (
          <div className="flex flex-wrap items-center gap-4 text-[13px] font-bold">
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0d4f30] hover:underline"
            >
              GitHub Repository ↗
            </a>
            <span className="text-[#c5c2b8]">·</span>
            <a
              href="https://remix-student-persistence-model-9415.ai.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0d4f30] hover:underline"
            >
              Google AI Studio Live ↗
            </a>
          </div>
        )}

        <div className="text-[13px]">
          <button
            onClick={onOpenReport}
            className="cursor-pointer font-bold text-[#0d4f30] hover:underline bg-transparent border-none p-0"
          >
            Standing report and diagnostics (generated) →
          </button>
        </div>
      </div>

      <div className="text-[11.5px] font-mono text-[#8a887e] flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#eeece4] pt-3">
        <span>v{meta.version}</span>
        <span>·</span>
        <span>sha {meta.git_sha}</span>
        <span>·</span>
        <span>data md5 {dataMd5.slice(0, 12)}</span>
        <span>·</span>
        <span>
          Python {meta.python} / NumPy {meta.numpy} / pandas {meta.pandas}
        </span>
      </div>
    </footer>
  );
};
