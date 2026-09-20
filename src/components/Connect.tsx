import React, { useState } from 'react';
import { LinkItem } from '../types/profile';

interface ConnectProps {
  links: LinkItem[];
  onBack?: () => void;
}

export const Connect: React.FC<ConnectProps> = ({ links, onBack }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (emailStr: string) => {
    const cleanEmail = emailStr.replace('mailto:', '');
    navigator.clipboard.writeText(cleanEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="pt-10 border-t border-[#18181b] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h2 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#82828b] mb-2.5">
            Connect
          </h2>
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[13.5px]">
            {links.map((link, index) => {
              const isEmail = link.url.startsWith('mailto:');
              return (
                <div key={index} className="flex items-center gap-2">
                  <a
                    href={link.url}
                    target={link.isExternal ? '_blank' : undefined}
                    rel={link.isExternal ? 'noopener noreferrer' : undefined}
                    className="text-link font-normal"
                  >
                    {link.label}
                  </a>
                  {isEmail && (
                    <button
                      onClick={() => handleCopyEmail(link.url)}
                      aria-label="Copy email address"
                      className="text-[10.5px] font-mono text-[#82828b] hover:text-[#d4d4d8] px-1.5 py-0.2 rounded bg-[#111113] border border-[#222225] transition-colors"
                      title="Copy email to clipboard"
                    >
                      {copied ? 'copied!' : 'copy'}
                    </button>
                  )}
                  {index < links.length - 1 && (
                    <span className="text-[#27272a]">/</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#18181b]/60 flex items-center justify-between text-[11.5px] font-mono text-[#82828b]">
        <span>© {new Date().getFullYear()} Aritro Banerjee. All rights reserved.</span>
        {onBack && (
          <div className="flex items-center gap-4 text-xs font-mono text-[#8e8e93]">
            <button
              onClick={onBack}
              className="hover:text-white transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition-colors"
            >
              ↑ Back to top
            </button>
          </div>
        )}
      </div>
    </footer>
  );
};
