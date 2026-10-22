import React from 'react';

interface InteractiveSplitPanelProps {
  controls: React.ReactNode;
  kpiStrip: React.ReactNode;
  summaryTable: React.ReactNode;
  chartTitle: React.ReactNode;
  chartHeaderRight?: React.ReactNode;
  svgChart: React.ReactNode;
  chartLegend: React.ReactNode;
  chartFooterRight?: React.ReactNode;
  className?: string;
}

/**
 * Enforces a strictly uniform 2-column grid layout across all interactive sections:
 * - Left-aligned panel: user-interactive controls, 2-stat KPI strip, and interactive summary table.
 * - Right-aligned panel: framed header, responsive SVG chart visualization, and legend/detail footer.
 */
export const InteractiveSplitPanel: React.FC<InteractiveSplitPanelProps> = ({
  controls,
  kpiStrip,
  summaryTable,
  chartTitle,
  chartHeaderRight,
  svgChart,
  chartLegend,
  chartFooterRight,
  className = 'mt-3.5',
}) => {
  return (
    <div
      className={`border border-[#e3e1d9] rounded-[10px] p-4 md:p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch bg-white/80 ${className}`}
    >
      {/* LEFT-ALIGNED PANEL: Interactive Controls, KPI Strip, and Summary Table */}
      <div className="lg:col-span-5 flex flex-col justify-between min-w-0">
        <div>
          {controls}
          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#eeece4]">
            {kpiStrip}
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-[#eeece4] font-mono tabular-nums text-[11.5px]">
          {summaryTable}
        </div>
      </div>

      {/* RIGHT-ALIGNED PANEL: Responsive SVG Chart Visualization */}
      <div className="lg:col-span-7 flex flex-col justify-between min-w-0 bg-[#faf8f2]/75 border border-[#eeece4] rounded-[8px] p-3.5 md:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-[#e6e4dc]">
          <div className="text-[11.5px] font-bold text-[#1b1c18]">
            {chartTitle}
          </div>
          {chartHeaderRight && (
            <div className="font-mono tabular-nums text-[11px] text-[#54564c]">
              {chartHeaderRight}
            </div>
          )}
        </div>

        <div className="w-full my-auto">{svgChart}</div>

        <div className="flex items-center justify-between gap-3 text-[11px] text-[#6f6d64] pt-2 mt-2 border-t border-[#e6e4dc] flex-wrap">
          <div className="flex gap-3.5 flex-wrap items-center">
            {chartLegend}
          </div>
          {chartFooterRight && (
            <div className="font-mono text-[10.5px] text-[#1b1c18]">
              {chartFooterRight}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
