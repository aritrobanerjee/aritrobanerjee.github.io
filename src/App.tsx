import React, { useState, useEffect } from 'react';
import profileData from './data/profile.json';
import { ProfileData } from './types/profile';
import { Header } from './components/Header';
import { Experience } from './components/Experience';
import { Focus } from './components/Focus';
import { Education } from './components/Education';
import { Connect } from './components/Connect';
import { CardDeckBackground } from './components/CardDeckBackground';
import { WritingSection } from './components/WritingSection';
import { CausalMeasurementEssay } from './components/CausalMeasurementEssay';

const profile: ProfileData = profileData as ProfileData;

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'causal-measurement'>('home');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/writing/causal-measurement' || hash === '#causal-measurement') {
        setCurrentView('causal-measurement');
      } else {
        setCurrentView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToArticle = (articleId: string) => {
    if (articleId === 'causal-measurement') {
      window.location.hash = '#/writing/causal-measurement';
      setCurrentView('causal-measurement');
    }
  };

  const navigateToHome = () => {
    window.location.hash = '';
    setCurrentView('home');
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-[#ededed] selection:bg-zinc-800 selection:text-zinc-100 font-sans">
      {/* Interactive Flipping Card Deck Background */}
      <CardDeckBackground />

      {/* Main Content Container */}
      <main
        id="portfolio-content"
        className={`relative z-10 mx-auto px-6 py-16 md:py-24 xl:py-28 max-w-[720px] lg:max-w-[960px] xl:max-w-[1040px] ${
          currentView === 'home' ? 'space-y-12 md:space-y-14' : ''
        }`}
      >
        {currentView === 'home' ? (
          <>
            {/* Header Section */}
            <Header profile={profile} />

            {/* Writing & Case Studies Section */}
            <WritingSection onSelectArticle={navigateToArticle} />

            {/* Experience Section */}
            <Experience items={profile.experience} />

            {/* Focus / Competencies Section */}
            <Focus items={profile.focus} />

            {/* Education & Recognition Section */}
            <Education items={profile.education} />

            {/* Footer / Connect Section */}
            <Connect links={profile.links} />
          </>
        ) : (
          /* Case Study View */
          <CausalMeasurementEssay onBack={navigateToHome} />
        )}
      </main>
    </div>
  );
};

export default App;
