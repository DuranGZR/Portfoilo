'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

interface SkillVisualProps {
  image: string;
  lightImage: string;
  poster: string;
  lightPoster: string;
}

const subscribeTheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-hero-theme'] });
  return () => observer.disconnect();
};
const isLight = () => document.documentElement.dataset.heroTheme === 'light';
const serverLight = () => false;

export default function SkillVisual({ image, lightImage, poster, lightPoster }: SkillVisualProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [playing, setPlaying] = useState(false);
  const light = useSyncExternalStore(subscribeTheme, isLight, serverLight);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => setPlaying(visible && !document.hidden && !reduced.matches);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener('visibilitychange', update);
    reduced.addEventListener('change', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
      reduced.removeEventListener('change', update);
    };
  }, []);

  const src = light ? (playing ? lightImage : lightPoster) : (playing ? image : poster);
  return <img ref={ref} src={src} alt="" width={360} height={160} loading="lazy" decoding="async" className="h-16 sm:h-20 w-auto object-contain" draggable={false} />;
}
