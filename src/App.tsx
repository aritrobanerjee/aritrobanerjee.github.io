import React, { useState, useEffect } from 'react';
import profileData from './data/profile.json';
import { ProfileData } from './types/profile';
import { projects } from './data/projects';
import { Header } from './components/Header';
import { Experience } from './components/Experience';
import { Focus } from './components/Focus';
import { Education } from './components/Education';
import { OpenSource } from './components/OpenSource';
import { Connect } from './components/Connect';
import { CardDeckBackground } from './components/CardDeckBackground';
import { WritingSection } from './components/WritingSection';
import { EssayReader } from './components/EssayReader';

const profile: ProfileData = profileData as ProfileData;

export const App: React.FC = () => {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    const handleLocationChange = () => {
      // 1. Clean up legacy hash routing if a user visits an old bookmarked hash link
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) {
        const matchingProject = projects.find(
          (p) => hash.includes(p.slug) || hash.includes(p.id)
        );
        if (matchingProject) {
          window.history.replaceState(null, '', `/writing/${matchingProject.slug}`);
          setActiveSlug(matchingProject.slug);
          return;
        }
      }

      // 2. Check URL pathname (strip trailing slashes)
      const path = window.location.pathname.replace(/\/$/, '');
      if (path.startsWith('/writing/')) {
        const slug = path.replace('/writing/', '');
        const matchingProject = projects.find((p) => p.slug === slug);
        if (matchingProject) {
          setActiveSlug(matchingProject.slug);
          return;
        }
      }

      setActiveSlug(null);
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateToArticle = (articleId: string) => {
    const project = projects.find((p) => p.slug === articleId || p.id === articleId);
    if (project) {
      window.history.pushState(null, '', `/writing/${project.slug}`);
      setActiveSlug(project.slug);
      window.scrollTo(0, 0);
    }
  };

  const navigateToHome = () => {
    window.history.pushState(null, '', '/');
    setActiveSlug(null);
    window.scrollTo(0, 0);
  };

  const activeProject = activeSlug
    ? projects.find((p) => p.slug === activeSlug)
    : null;

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-[#ededed] selection:bg-zinc-800 selection:text-zinc-100 font-sans">
      {/* Interactive Flipping Card Deck Background */}
      <CardDeckBackground />

      {/* Main Content Container */}
      <main
        id="portfolio-content"
        className="relative z-10 mx-auto px-6 py-16 md:py-24 xl:py-28 max-w-[720px] lg:max-w-[960px] xl:max-w-[1040px] space-y-12 md:space-y-14"
      >
        {/* Header Section (Persistent on both Home and Essay views, bio hidden on essay) */}
        <Header profile={profile} showBio={!activeProject} />

        {!activeProject && (
          <>
            {/* Writing & Case Studies Section */}
            <WritingSection onSelectArticle={navigateToArticle} />

            {/* Experience Section */}
            <Experience items={profile.experience} />

            {/* Focus / Competencies Section */}
            <Focus items={profile.focus} />

            {/* Education & Recognition Section */}
            <Education items={profile.education} />

            {/* Open Source Section */}
            <OpenSource />

            {/* Footer / Connect Section */}
            <Connect
              links={profile.links}
              name={profile.name}
              disclaimer={profile.disclaimer}
            />
          </>
        )}

        {activeProject && (
          <EssayReader
            markdown={activeProject.markdown}
            icon={activeProject.icon}
            onBack={navigateToHome}
          />
        )}
      </main>
    </div>
  );
};

export default App;
