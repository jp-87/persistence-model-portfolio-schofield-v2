import React, { useState, useEffect, useRef } from 'react';
import siteDataRaw from './data/siteData.json';
import { SiteData } from './data/types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SidebarNav, navItemsList } from './components/SidebarNav';
import { MethodSection } from './components/MethodSection';
import { CohortMatrixInspector } from './components/CohortMatrixInspector';
import { ScenariosSection } from './components/ScenariosSection';
import { CalculatorSection } from './components/CalculatorSection';
import { CohortsSection } from './components/CohortsSection';
import { Footer } from './components/Footer';

const D = siteDataRaw as unknown as SiteData;

export const App: React.FC = () => {
  const accent = '#0d4f30';
  const paper = '#f7f4ec';

  const [activeSection, setActiveSection] = useState<string>('overview');
  const [activeScenario, setActiveScenario] = useState<
    'flat' | 'cliff' | 'northeast'
  >('cliff');

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!rootRef.current) return;
      const ids = navItemsList.map((n) => n.id);
      let cur = ids[0];
      for (const id of ids) {
        const el = rootRef.current.querySelector(`[data-section="${id}"]`);
        if (el && el.getBoundingClientRect().top <= 140) {
          cur = id;
        }
      }
      setActiveSection(cur);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (!rootRef.current) return;
    const el = rootRef.current.querySelector(`[data-section="${id}"]`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const T = {
    hero: `Two-stage Higher Education enrollment and Net Tuition Revenue (NTR) cohort survival model. Stage 1 links longitudinal student enrollment records across terms and classifies tuition discount rates into five NACUBO-style financial aid tiers. Stage 2 projects four-year cohort headcount and Net Tuition Revenue across Millbury College of Music (MCM, 3 terms/year) and Millbury College Conservatory (MCC, 2 terms/year).`,
    scenarioNote: `All scenarios start from the same 2026FA 4-year undergraduate baseline (${D.scenarios.flat[0].headcount.toLocaleString('en-US')} students · $${D.scenarios.flat[0].ntr_m.toFixed(1)}M NTR at ~$19,050/student); shaded bands show the 10th–90th percentile empirical continuation-rate spread.`,
    calcTag: `03 · 4-Year Net Tuition Revenue & Tuition Discount Simulator`,
    calcIntro: `Adjust school calendar (MCM 3-Term vs. MCC 2-Term), entering class size, gross tuition per term, institutional grant discount rate (%), and term-to-term return rate shift to project four-year cohort headcount and Net Tuition Revenue.`,
    calcAssume: `Baseline projections use post-COVID historical term-to-term return rates (as of ${D.entrant.as_of}) with Spring-to-Fall offset = 2 on MCM and offset = 1 on MCC.`,
    endYear: D.scenarios.flat[D.scenarios.flat.length - 1].fall.slice(0, 4),
  };

  return (
    <div
      ref={rootRef}
      className="min-h-screen text-[#23241f] selection:bg-[#0d4f30]/20 font-sans"
      style={{
        backgroundColor: paper,
      }}
    >
      <Navbar
        accent={accent}
        paper={paper}
        repoUrl={D.repo_url}
        linkedinUrl={D.linkedin_url}
        published={D.published}
        onNavigate={scrollToSection}
      />

      <Hero heroText={T.hero} />

      {/* Main Container with Sidebar + 4-Year Priority Stream */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-5 pb-14 grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-12 items-start">
        <SidebarNav
          activeSection={activeSection}
          accent={accent}
          onNavigate={scrollToSection}
          published={D.published}
          repoUrl={D.repo_url}
          linkedinUrl={D.linkedin_url}
        />

        <main className="min-w-0 flex flex-col gap-8 md:gap-10">
          {/* 1. Fall Net Tuition Revenue through 2030 */}
          <ScenariosSection
            accent={accent}
            endYear={T.endYear}
            scenarioNote={T.scenarioNote}
            siteData={D}
            activeScenario={activeScenario}
            onSelectScenario={setActiveScenario}
          />

          {/* 2. Longitudinal Cohort Matrix & Diagonal Census Highlight */}
          <CohortMatrixInspector accent={accent} />

          {/* 3. Entering class to four-year Net Tuition Revenue (NTR) */}
          <CalculatorSection
            accent={accent}
            siteData={D}
            calcTag={T.calcTag}
            calcIntro={T.calcIntro}
            calcAssume={T.calcAssume}
          />

          {/* Reference: Two-Stage Methodology & Higher Education Terminology Guide */}
          <MethodSection accent={accent} />

          {/* Standing Report: Entering Classes & NTR by Discount Tier */}
          <CohortsSection accent={accent} siteData={D} />

          <Footer
            repoUrl={D.repo_url}
            linkedinUrl={D.linkedin_url}
            published={D.published}
          />
        </main>
      </div>
    </div>
  );
};

export default App;



