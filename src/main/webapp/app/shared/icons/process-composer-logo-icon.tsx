import React from 'react';

type ProcessComposerLogoIconProps = React.SVGProps<SVGSVGElement>;

/**
 * Logo da plataforma (M + fluxo quadrado → círculo) para uso inline, ex.: menu lateral.
 */
export const ProcessComposerLogoIcon = ({ className, ...rest }: ProcessComposerLogoIconProps) => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...rest}>
    <path d="M28 52 V26 L50 44 L72 26 V52" stroke="#6C4FF2" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="24" y="60" width="14" height="14" rx="2" stroke="#6C4FF2" strokeWidth="4" />
    <line x1="38" y1="67" x2="56" y2="67" stroke="#6C4FF2" strokeWidth="4" strokeLinecap="round" />
    <path d="M51 61 L58 67 L51 73" stroke="#6C4FF2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="70" cy="67" r="8" stroke="#6C4FF2" strokeWidth="4" />
  </svg>
);

export default ProcessComposerLogoIcon;
