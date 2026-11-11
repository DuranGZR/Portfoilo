import { useId } from 'react';

export default function HeroWritingArm() {
  const metal = useId();
  return (
    <svg className="hero-writing-arm" viewBox="0 0 74 67" aria-hidden="true" fill="none">
      <defs>
        <linearGradient id={metal} x1="0" x2="1" y2="1">
          <stop stopColor="var(--hero-arm-highlight)" />
          <stop offset="1" stopColor="var(--hero-arm-shade)" />
        </linearGradient>
      </defs>
      <path d="M50 37 Q58 35 61 43 L64 53" stroke="#182930" strokeWidth="9" strokeLinecap="round" />
      <path d="M50 37 Q58 35 61 43 L64 53" stroke={`url(#${metal})`} strokeWidth="6" strokeLinecap="round" />
      <g transform="translate(64 53)">
        <g className="hero-arm-shaft">
          <path d="M0 0v24" stroke="#182930" strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d="M0 0v24" stroke={`url(#${metal})`} strokeWidth="4" vectorEffect="non-scaling-stroke" />
          <path d="M-1 4v17" stroke="var(--hero-arm-highlight)" strokeWidth=".7" opacity=".65" vectorEffect="non-scaling-stroke" />
        </g>
      </g>
      <circle cx="64" cy="53" r="4.3" fill={`url(#${metal})`} stroke="#263d46" strokeWidth="1.2" />
      <circle cx="64" cy="53" r="1.5" fill="var(--hero-arm-light)" />
      <g className="hero-arm-hand">
        <path d="M-3.5-2h5l3 3.5-1 3.8H.7L-.5 3H-3z" fill={`url(#${metal})`} stroke="#263d46" strokeWidth="1" />
        <path d="m1 3 2 5" stroke="var(--hero-arm-light)" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  );
}
