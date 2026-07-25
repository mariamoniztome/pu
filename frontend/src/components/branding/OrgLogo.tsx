import { useState } from 'react';
import { fileUrl } from '../../lib/fileUrl';

interface OrgLogoProps {
  variant: 'mark' | 'full';
  clinicName?: string;
  logoMark?: string;
  logoFull?: string;
  className?: string;
}

function InitialsMark({ initial, className }: { initial: string; className?: string }) {
  return (
    <div
      className={
        className ||
        'w-12 h-12 bg-gradient-to-br from-primary-300 to-lilac-300 rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0'
      }
    >
      <span className="text-white font-bold text-xl">{initial}</span>
    </div>
  );
}

/**
 * Renders the org's branding with a graceful fallback chain so the app looks
 * right whether or not an owner has configured anything yet:
 * mark  -> branding.logoMark -> branding.logoFull -> initials-on-gradient square
 * full  -> branding.logoFull -> mark + clinic name text
 * Falls back to initials on a broken/deleted image (onError), not just a
 * missing value.
 */
export function OrgLogo({ variant, clinicName, logoMark, logoFull, className }: OrgLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const name = clinicName || 'Mindcare';
  const initial = name[0]?.toUpperCase() || 'M';

  if (variant === 'mark') {
    const src = logoMark || logoFull;
    if (src && !imgFailed) {
      return (
        <img
          src={fileUrl(src)}
          alt={name}
          className={className || 'w-12 h-12 rounded-3xl object-contain flex-shrink-0 bg-white'}
          onError={() => setImgFailed(true)}
        />
      );
    }
    return <InitialsMark initial={initial} className={className} />;
  }

  if (logoFull && !imgFailed) {
    return (
      <img
        src={fileUrl(logoFull)}
        alt={name}
        className={className || 'h-10 max-w-[160px] object-contain'}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div className="flex items-center gap-3 min-w-0">
      <InitialsMark
        initial={initial}
        className="w-10 h-10 bg-gradient-to-br from-primary-300 to-lilac-300 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
      />
      <span className="text-xl font-bold text-gray-800 whitespace-nowrap truncate">{name}</span>
    </div>
  );
}
