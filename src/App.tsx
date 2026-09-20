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
    const handleLocationChange = () => {
      // Clean up legacy hash routing if a user visits an old bookmarked hash link
      if (window.location.hash.includes('causal-measurement')) {
        window.history.replaceState(null, '', '/writing/causal-measurement');
        setCurrentView('causal-measurement');
        return;
      }

      // Check URL pathname (strip trailing slashes)
      const path = window.location.pathname.replace(/\/$/, '');
      if (path === '/writing/causal-measurement') {
        setCurrentView('causal-measurement');
      } else {
        setCurrentView('home');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateToArticle = (articleId: string) => {
    if (articleId === 'causal-measurement') {
      window.history.pushState(null, '', '/writing/causal-measurement');
      setCurrentView('causal-measurement');
      window.scrollTo(0, 0);
    }
  };

  const navigateToHome = () => {
    window.history.pushState(null, '', '/');
    setCurrentView('home');
    window.scrollTo(0, 0);
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-[#ededed] selection:bg-zinc-800 selection:text-zinc-100 font-sans">
      {/* Interactive Flipping Card Deck Background */}
      <CardDeckBackground />

      {/* Main Content Container */}
      <main
        id="portfolio-content"
        className="relative z-10 mx-auto px-6 py-16 md:py-24 xl:py-28 max-w-[720px] lg:max-w-[960px] xl:max-w-[1040px] space-y-12 md:space-y-14"
      >
        {/* Header Section (Persistent on both Home and Essay views) */}
        <Header profile={profile} />

        {currentView === 'home' ? (
          <>
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
