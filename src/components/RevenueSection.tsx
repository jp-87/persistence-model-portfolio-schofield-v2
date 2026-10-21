import React from 'react';

interface RevenueSectionProps {
  accent: string;
  paper: string;
  ntr1: string;
  ntr4: string;
  driftText: string;
}

const AID_BAND_TIERS = [
  {
    tier: 'No Award',
    ratio: 'discount < 0.15',
    retentionEffect: 'Baseline hazard (1.00×)',
    statisticalRole: 'Reference stratum (unassisted tuition payer)',
  },
  {
    tier: 'Minimal Aid',
    ratio: '0.15 ≤ discount < 0.35',
    retentionEffect: 'Base continuation curve',
    statisticalRole: 'Low-discount stratum (high per-term NTR weight)',
  },
  {
    tier: 'Partial Aid',
    ratio: '0.35 ≤ discount < 0.60',
    retentionEffect: 'Base → +10% continuation lift (>0.50)',
    statisticalRole: 'Inflection stratum (crosses 0.50 aid-retention threshold)',
  },
  {
    tier: 'Substantial Aid',
    ratio: '0.60 ≤ discount < 0.80',
    retentionEffect: '+10% continuation lift (1.10×)',
    statisticalRole: 'High-persistence / lower per-student NTR stratum',
  },
  {
    tier: 'Near-Full Aid',
    ratio: 'discount ≥ 0.80 (capped 85%)',
    retentionEffect: '+10% continuation lift (1.10×)',
    statisticalRole: 'Maximum discount stratum (anchor for compositional drift)',
  },
];

export const RevenueSection: React.FC<RevenueSectionProps> = ({
  accent,
  paper,
  ntr1,
  ntr4,
  driftText,
}) => {
  return (
    <section data-section="revenue" className="scroll-mt-24">
      <div
        className="text-[11px] font-bold tracking-[1.6px] uppercase"
        style={{ color: accent }}
      >
        04, From headcount to revenue
      </div>

      <h2 className="font-serif font-normal text-[28px] md:text-[33px] leading-[1.12] tracking-[-0.4px] mt-3.5 text-[#1b1c18]">
        Net tuition revenue and aid-band conditioning
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 mt-6">
        {/* Metric card */}
        <div className="border border-[#e3e1d9] rounded-[10px] p-5.5 md:p-6 bg-white/70">
          <div className="flex items-baseline gap-3.5">
            <div
              className="text-[42px] font-extrabold tracking-tight leading-none"
              style={{ color: accent }}
            >
              {ntr1}
              <span className="text-[22px]">%</span>
            </div>
            <div className="text-[13px] text-[#54564c] leading-[1.4]">
              absolute error of total net tuition revenue
              <br />
              one term out{' '}
              <span className="text-[#a9a79d]">· {ntr4}% at four</span>
            </div>
          </div>
          <p className="text-[13.5px] leading-[1.6] text-[#5a5b50] mt-4">
            Each cohort&apos;s mean NTR (<code className="font-mono text-[12px]">ntr = (tuition_charge + comp_fee) − institutional_grant</code>) enters the projection as a weight inside the
            Monte Carlo draws, so revenue intervals come from summed draws, not
            from adding quantiles.
          </p>
          <div className="mt-3 pt-2.5 border-t border-[#efede6] font-mono text-[11.5px] text-[#6f6d64] leading-[1.5]">
            <div>
              <strong>Institutional KPIs:</strong> revenue_potential = enrollment_volume × avg_ntr · aid_efficiency = 1 − discount_rate (net tuition retention ratio)
            </div>
            <div>
              <strong>Statistical Estimator:</strong> E[NTR(h)] = Σ_c E_c(d_c + h) · μ_NTR(c, aid_band)
            </div>
          </div>
        </div>

        {/* Aid-band conditioning card */}
        <div
          className="border border-[#e3e1d9] rounded-[10px] p-5.5 md:p-6"
          style={{
            backgroundColor: `color-mix(in srgb, ${accent} 5%, ${paper})`,
          }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="text-[13.5px] font-bold text-[#1b1c18]">
              Aid-band conditioning (discount_description × Hazard Stratification)
            </div>
          </div>
          <p className="text-[13.5px] leading-[1.6] text-[#444538] mt-2.5">
            {driftText}
          </p>
          <p className="text-[12.5px] leading-[1.55] text-[#5a5b50] mt-3 pt-2.5 border-t border-[#e3e1d9]">
            <strong className="font-semibold text-[#1b1c18]">
              Why unconditioned NTR drifts (Simpson&apos;s Paradox):
            </strong>{' '}
            Because higher institutional grant ratios (<code className="font-mono text-[11.5px]">discount &gt; 0.50</code>) carry a positive persistence multiplier (1.10× in the synthetic DGP) while lowering per-student <code className="font-mono text-[11.5px]">ntr</code>, surviving upper-duration cohorts become progressively enriched in higher-discount tiers. Conditioning transition matrices on <code className="font-mono text-[11.5px]">discount_description</code> isolates survival from compositional shift.
          </p>
        </div>
      </div>

      {/* Institutional Aid Award Schedule (discount_description) */}
      <div className="border border-[#e3e1d9] rounded-[10px] p-4.5 md:p-5 bg-white/70 mt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2.5">
          <div className="text-[13px] font-bold text-[#1b1c18]">
            Institutional Financial Aid Award Schedule (<code className="font-mono text-[12px]">discount_description</code>) &amp; Survival Conditioning
          </div>
          <span className="font-mono text-[11px] text-[#6f6d64]">
            discount = institutional_grant / tuition_charge
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-[#e3e1d9] text-left text-[10.5px] uppercase tracking-[0.6px] text-[#6f6d64]">
                <th className="py-1.5 pr-3 font-semibold">
                  Institutional Award Tier (discount_description)
                </th>
                <th className="py-1.5 px-3 font-semibold">
                  Discount Band (discount)
                </th>
                <th className="py-1.5 px-3 font-semibold">
                  Persistence Mechanism (DGP)
                </th>
                <th className="py-1.5 pl-3 font-semibold">
                  Statistical Conditioning Role
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efede6]">
              {AID_BAND_TIERS.map((b) => (
                <tr key={b.tier}>
                  <td className="py-2 pr-3 font-semibold text-[#1b1c18] whitespace-nowrap">
                    {b.tier}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11.5px] text-[#44453a] whitespace-nowrap">
                    {b.ratio}
                  </td>
                  <td className="py-2 px-3 text-[#44453a]">{b.retentionEffect}</td>
                  <td className="py-2 pl-3 text-[#5a5b50]">{b.statisticalRole}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
