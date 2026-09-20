import React from 'react';
import { ProfileData } from '../types/profile';

interface HeaderProps {
  profile: ProfileData;
  showBio?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ profile, showBio = true }) => {
  return (
    <header className={showBio ? "space-y-5" : ""}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0 group">
            <img
              src={profile.avatarUrl || "/avatar.jpg"}
              alt={profile.name}
              className="w-12 h-12 rounded-full object-cover grayscale contrast-[1.08] brightness-[0.96] border border-[#27272a] bg-[#121214] transition-all duration-300 group-hover:border-[#3f3f46] group-hover:brightness-105"
            />
          </div>

          <div>
            <h1 className="text-[18px] font-medium tracking-tight text-[#ededed]">
              {profile.name}
            </h1>
            <p className="text-[13px] text-[#8e8e93] font-mono mt-0.5 tracking-tight">
              {profile.title} at {profile.company}
            </p>
          </div>
        </div>

        {profile.location && (
          <div className="flex items-center gap-2 text-[11.5px] font-mono text-[#a1a1aa] border border-[#222225] px-2.5 py-0.5 rounded-full bg-[#111113] shrink-0 mt-0.5">
            <span className="relative flex h-1.5 w-1.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white/30 animate-pulse"></span>
              <span
                className="relative inline-block h-1.5 w-1.5 rounded-full bg-white"
                style={{
                  boxShadow: '0 0 6px 1px rgba(255, 255, 255, 0.85), 0 0 12px 2px rgba(255, 255, 255, 0.3)',
                }}
              ></span>
            </span>
            <span>{profile.location}</span>
          </div>
        )}
      </div>

      {showBio && (
        <p className="text-[14px] leading-[1.7] text-[#a1a1aa]">
          {profile.bio}
        </p>
      )}
    </header>
  );
};
