import React from 'react';
import profileData from './data/profile.json';
import { ProfileData } from './types/profile';
import { Header } from './components/Header';
import { Experience } from './components/Experience';
import { Focus } from './components/Focus';
import { Education } from './components/Education';
import { Connect } from './components/Connect';
import { CardDeckBackground } from './components/CardDeckBackground';

const profile: ProfileData = profileData as ProfileData;

export const App: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-[#ededed] selection:bg-zinc-800 selection:text-zinc-100 font-sans">
      {/* Interactive Flipping Card Deck Background */}
      <CardDeckBackground />

      {/* Main Centered Content */}
      <main
        id="portfolio-content"
        className="relative z-10 max-w-[580px] mx-auto px-6 py-16 md:py-24 space-y-12 md:space-y-14"
      >
        {/* Header Section */}
        <Header profile={profile} />

        {/* Experience Section */}
        <Experience items={profile.experience} />

        {/* Focus / Competencies Section */}
        <Focus items={profile.focus} />

        {/* Education & Recognition Section */}
        <Education items={profile.education} />

        {/* Footer / Connect Section */}
        <Connect links={profile.links} />
      </main>
    </div>
  );
};

export default App;
