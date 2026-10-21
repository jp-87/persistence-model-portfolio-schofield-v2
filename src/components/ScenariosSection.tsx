import React from 'react';
import { SiteData } from '../data/types';

interface ScenariosSectionProps {
  accent: string;
  paper: string;
  endYear: string;
  scenarioNote: string;
  y1Label: string;
  y2Label: string;
  siteData: SiteData;
  activeScenario: 'flat' | 'cliff' | 'northeast';
  onSelectScenario: (scenario: 'flat' | 'cliff' | 'northeast') => void;
}

export const ScenariosSection: React.FC<ScenariosSectionProps> = ({
  accent,
  endYear,
  scenarioNote,
  y1Label,
  y2Label,
  siteData,
  activeScenario,
  onSelectScenario,
}) => {
  const scenarioDescs = {
    flat: 'Entering classes held at the recent-average size.',
    cliff: 'Entering classes scaled by the WICHE 11th-edition national graduate series.',
    northeast: 'Entering classes scaled by the WICHE 11th-edition Northeast graduate series.',
  };

  const scenarioLabels = {
    flat: 'Flat',
    cliff: 'Cliff',
    northeast: 'Northeast',
  };

  const names: Array<'flat' | 'cliff' | 'northeast'> = ['flat', 'cliff', 'northeast'];
  const allPoints = names.flatMap((n) => siteData.scenarios[n] || []);
  const lo = Math.floor(Math.min(...allPoints.map((r) => r.p10_m)) - 1);
  const hi = Math.ceil(Math.max(...allPoints.map((r) => r.p90_m)) + 1);

  const falls = (siteData.scenarios.flat || []).map((r) => r.fall);
  const X = (i: number) => 70 + i * (320 / Math.max(1, falls.length - 1));
  const Y = (v: number) => 32 + (hi - v) * (168 / Math.max(1, hi - lo));

  const line = (n: 'flat' | 'cliff' | 'northeast') => {
    const pts = siteData.scenarios[n] || [];
    return 'M' + pts.map((r, i) => `${X(i).toFixed(1)},${Y(r.ntr_m).toFixed(1)}`).join(' L');
  };

  const bandOf = (n: 'flat' | 'cliff' | 'northeast') => {
    const rs = siteData.scenarios[n] || [];
    if (!rs.length) return '';
    const top = rs.map((r, i) => `${X(i).toFixed(1)},${Y(r.p90_m).toFixed(1)}`).join(' L');
    const bottom = rs
      .map((r, i) => [X(i), Y(r.p10_m)])
      .reverse()
      .map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)
      .join(' L');
    return `M${top} L${bottom} Z`;
  };

  const activePoints = siteData.scenarios[activeScenario] || [];
  const n2028 = activePoints.length >= 3 ? activePoints[activePoints.length - 3].ntr_m.toFixed(1) : '—';
  const n2030 = activePoints.length >= 1 ? activePoints[activePoints.length - 1].ntr_m.toFixed(1) : '—';

  const endX = X(falls.length - 1);
  const activeEndY = activePoints.length ? Y(activePoints[falls.length - 1]?.ntr_m ?? 0) : 0;

  const bandFill =
    activeScenario === 'northeast'
      ? '#b06a3a'
      : activeScenario === 'flat'
      ? '#9a988e'
      : accent;

  return (
    <section data-section="scenarios" className="scroll-mt-24">
      <div
        className="text-[11px] font-bold tracking-[1.6px] uppercase"
        style={{ color: accent }}
      >
        05, Scenarios to {endYear}
      </div>

      <h2 className="font-serif font-normal text-[28px] md:text-[33px] leading-[1.12] tracking-[-0.4px] mt-3.5 text-[#1b1c18]">
        Entering-class size paths enter as labeled assumptions
      </h2>

      <p className="text-[15px] leading-[1.65] text-[#54564c] mt-3.5 max-w-[46em]">
        Projected fall net tuition revenue. Entering-class size paths are
        injected as labeled assumptions and flow through the same fitted hazards
        and process noise as existing students. {scenarioNote}
      </p>

      <div className="border border-[#e3e1d9] rounded-[10px] p-5.5 md:p-6 mt-5.5 grid grid-cols-1 md:grid-cols-[1fr_1.25fr] gap-8 md:gap-9 items-center bg-white/70">
        <div>
          <div className="flex gap-2 mb-5">
            {names.map((k) => {
              const on = k === activeScenario;
              return (
                <button
                  key={k}
                  onClick={() => onSelectScenario(k)}
                  className="cursor-pointer text-[12.5px] font-bold px-3.5 py-2 rounded-[7px] border transition-all duration-200"
                  style={{
                    backgroundColor: on ? accent : 'transparent',
                    color: on ? '#fff' : '#5a5b50',
                    borderColor: on ? accent : '#d8d6cc',
                  }}
                >
                  {scenarioLabels[k]}
                </button>
              );
            })}
          </div>

          <div className="font-serif text-[15px] italic text-[#6f6d64] leading-[1.5] min-h-[3em]">
            {scenarioDescs[activeScenario]}
          </div>

          <div className="flex gap-7 mt-5.5 pt-5 border-t border-[#eeece4]">
            <div>
              <div className="text-[11px] text-[#8a887e] font-bold tracking-[0.5px]">
                {y1Label}
              </div>
              <div className="text-[30px] font-extrabold tracking-tight text-[#1b1c18] mt-1 leading-none">
                ${n2028}
                <span className="text-[15px] text-[#a9a79d]">M</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#8a887e] font-bold tracking-[0.5px]">
                {y2Label}
              </div>
              <div
                className="text-[30px] font-extrabold tracking-tight mt-1 leading-none"
                style={{ color: accent }}
              >
                ${n2030}
                <span className="text-[15px] text-[#a9a79d]">M</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Chart */}
        <div>
          <svg viewBox="0 0 420 240" className="w-full h-auto">
            {/* Grid lines */}
            <g stroke="#ecebe3" strokeWidth="1">
              <line x1="44" y1="40" x2="404" y2="40" />
              <line x1="44" y1="100" x2="404" y2="100" />
              <line x1="44" y1="160" x2="404" y2="160" />
            </g>
            <line x1="44" y1="20" x2="44" y2="200" stroke="#cdcbc1" strokeWidth="1.1" />
            <line x1="44" y1="200" x2="404" y2="200" stroke="#cdcbc1" strokeWidth="1.1" />

            {/* Y labels */}
            <g fill="#9a988e" fontFamily="Open Sans, sans-serif" fontSize="10.5" textAnchor="end">
              <text x="38" y={Y(hi) + 4}>
                ${hi}M
              </text>
              <text x="38" y={Y(lo) + 4}>
                ${lo}M
              </text>
            </g>

            {/* X labels */}
            <g fill="#9a988e" fontFamily="Open Sans, sans-serif" fontSize="10.5" textAnchor="middle">
              {falls.map((f, i) => (
                <text key={i} x={X(i)} y="218">
                  {f}
                </text>
              ))}
            </g>

            {/* Confidence Band */}
            <path
              d={bandOf(activeScenario)}
              fill={bandFill}
              opacity="0.16"
              stroke="none"
            />

            {/* Paths */}
            <path
              d={line('flat')}
              fill="none"
              stroke={activeScenario === 'flat' ? accent : '#bbb9af'}
              strokeWidth={activeScenario === 'flat' ? 3.4 : 1.8}
              strokeDasharray="5 4"
              className="transition-all duration-200"
            />
            <path
              d={line('cliff')}
              fill="none"
              stroke={activeScenario === 'cliff' ? accent : '#bbb9af'}
              strokeWidth={activeScenario === 'cliff' ? 3.4 : 1.8}
              className="transition-all duration-200"
            />
            <path
              d={line('northeast')}
              fill="none"
              stroke={activeScenario === 'northeast' ? '#b06a3a' : '#cfcdc3'}
              strokeWidth={activeScenario === 'northeast' ? 3.4 : 1.8}
              className="transition-all duration-200"
            />

            {/* Marker on active endpoint */}
            <circle
              cx={endX}
              cy={activeEndY}
              r="4.6"
              fill="#fff"
              stroke={accent}
              strokeWidth="2"
              className="transition-all duration-200"
            />
          </svg>

          <div className="flex gap-4 text-[11px] text-[#6f6d64] pt-1 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-[2px] bg-[#9a988e] inline-block" />
              flat (recruitment held)
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-[3px] inline-block"
                style={{ backgroundColor: accent }}
              />
              cliff (WICHE national)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-[2px] bg-[#b06a3a] inline-block" />
              northeast (WICHE Northeast)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
