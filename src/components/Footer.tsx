import React from 'react';

interface FooterProps {
  repoUrl?: string;
  published?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  repoUrl = 'https://github.com/jp-87/student-persistence-model',
  published = true,
}) => {
  return (
    <footer className="border-t border-[#e6e4dc] pt-5 mt-6 flex flex-wrap items-center justify-between gap-4">
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
          <div className="text-[11.5px] text-[#8a887e]">
            Enrollment &amp; Net Tuition Revenue Forecasting Portfolio
          </div>
        </div>
      </div>

      {(published || repoUrl) && (
        <div className="flex flex-wrap items-center gap-4 text-[12.5px] font-bold">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0d4f30] hover:underline"
          >
            GitHub Repository ↗
          </a>
        </div>
      )}
    </footer>
  );
};

