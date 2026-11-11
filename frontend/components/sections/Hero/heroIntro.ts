import { playSyllableBlip, unlockMascotAudio } from '@/components/widgets/Mascot/botVoice';

export const HERO_INTRO_READY = 'portfolio-hero-ready';
export const HERO_LANDING = 'portfolio-hero-landing';

export type HeroLanding = { x: number; y: number; signal: AbortSignal };

export function isAtHeroStart() {
  return window.scrollY <= 24 && (!window.location.hash || window.location.hash === '#hero');
}

function getTypingLine(hero: HTMLElement, selector: string, byGroup = false) {
  const line = hero.querySelector<HTMLElement>(selector);
  const ink = line?.querySelector<HTMLElement>('.hero-ink');
  const pen = line?.querySelector<HTMLElement>('.hero-pen');
  const text = ink?.firstChild;
  if (!line || !ink || !pen || !(text instanceof Text)) return;

  const range = document.createRange();
  range.selectNodeContents(ink);
  if (range.getClientRects().length !== 1) return;

  const rect = ink.getBoundingClientRect();
  if (!rect.width) return;

  const reveal: Keyframe[] = [{ clipPath: 'inset(0 100% 0 0)', offset: 0, easing: 'step-end' }];
  const syllables: { offset: number; code: number }[] = [];
  let end = 0;
  const units = byGroup ? text.data.split(/(?=•)/u) : text.data;
  for (const unit of units) {
    end += unit.length;
    range.setEnd(text, end);
    const progress = (range.getBoundingClientRect().right - rect.left) / rect.width;
    const vowel = unit.match(/[aeıioöuü]/iu)?.[0];
    if (vowel) syllables.push({ offset: Math.min(1, progress), code: vowel.charCodeAt(0) });
    if (progress <= (reveal.at(-1)?.offset ?? 0) || progress >= 1) continue;
    reveal.push({ clipPath: `inset(-4px ${(1 - progress) * 100}% -4px -4px)`, offset: progress, easing: 'step-end' });
  }
  reveal.push({ clipPath: 'inset(-4px)', offset: 1 });

  return { ink, pen, rect, reveal, syllables };
}

export function playHeroIntro(pod: HTMLDivElement, onWritten: () => void, onFinish: () => void, canPlaySound: () => boolean) {
  const hero = document.getElementById('hero');
  const divider = hero?.querySelector('.hero-divider');
  const impact = hero?.querySelector<HTMLElement>('.hero-impact');
  const ring = impact?.querySelector('.hero-impact-ring');
  const titleLight = hero?.querySelector('.hero-title-light');
  const name = hero?.querySelector('.hero-name');
  const opening = hero?.querySelector('.hero-visor-opening');
  const openingEyes = opening?.querySelector('.hero-visor-eye-pair');
  const blink = openingEyes?.querySelector('svg');
  const stage = pod.querySelector<HTMLElement>('.hero-mascot-stage');
  const arm = stage?.querySelector('.hero-writing-arm');
  const shaft = arm?.querySelector('.hero-arm-shaft');
  const hand = arm?.querySelector('.hero-arm-hand');
  const eyes = stage?.querySelector('[data-mascot-eyes]');
  if (!hero || !divider || !impact || !ring || !titleLight || !name || !opening || !openingEyes || !blink || !stage || !arm || !shaft || !hand || !eyes || !isAtHeroStart() || typeof pod.animate !== 'function') {
    onFinish();
    return;
  }

  const showOpening = Number(getComputedStyle(opening).opacity) > 0.5;
  hero.dataset.heroIntro = '';
  const role = getTypingLine(hero, '.hero-role');
  const description = getTypingLine(hero, '.hero-description', true);
  if (!role || !description) {
    onFinish();
    return;
  }
  const dock = pod.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const centerY = (rect: DOMRect) => rect.top + rect.height / 2;
  const ledge = divider.getBoundingClientRect();
  const landingX = ledge.left + ledge.width / 2 + 16;
  const landingY = centerY(ledge) - 54;
  const heroRect = hero.getBoundingClientRect();
  impact.style.left = `${landingX - heroRect.left}px`;
  impact.style.top = `${centerY(ledge) - heroRect.top}px`;
  const firstTip = 77;
  const firstY = centerY(role.rect) - firstTip;
  // A smaller second pose keeps the pod in the gap above the buttons.
  const secondScale = 0.66;
  const secondY = centerY(description.rect) + (firstTip - 2 * 37) * secondScale;
  const dockCenter = dock.left + dock.width / 2;
  const armReach = 70 - dock.width / 2;
  const secondReach = 70 * secondScale - dock.width / 2;
  const turnX = Math.min(role.rect.right + dock.width / 2 + 8, viewportWidth - dock.width / 2 - 4);
  const blinkAnimation = blink.getAnimations()[0];
  const blinkDuration = Number(blinkAnimation?.effect?.getTiming().duration ?? 0);
  const reveal = Math.max(0, blinkDuration - Number(blinkAnimation?.currentTime ?? 0));
  const handoff = reveal + 330;
  const firstBend = reveal + 590;
  const secondBend = reveal + 905;
  const openingOffset = showOpening ? reveal + 850 : 0;
  const landing = 390 + openingOffset;
  const bounce = 510 + openingOffset;
  const settle = 645 + openingOffset;
  const roleStart = 730 + openingOffset;
  const roleEnd = 1630 + openingOffset;
  const descriptionStart = 1900 + openingOffset;
  const written = 2530 + openingOffset;
  const takeoff = 2690 + openingOffset;
  const duration = 3170 + openingOffset;
  const glide = 'cubic-bezier(.3, 0, .23, 1)';

  function point(time: number, x: number, top: number, easing = 'linear'): Keyframe {
    return { translate: `${x - dockCenter}px ${top - dock.top}px`, offset: time / duration, easing };
  }

  const closeupRect = openingEyes.getBoundingClientRect();
  const eyeRect = eyes.getBoundingClientRect();
  const eyeX = eyeRect.left + eyeRect.width / 2 - dock.left;
  const eyeY = centerY(eyeRect) - dock.top;
  const eyeOrigin = `${eyeX}px ${eyeY}px`;
  const closeupX = closeupRect.left + closeupRect.width / 2 - eyeX + dock.width / 2;
  const closeupY = centerY(closeupRect) - eyeY;
  const closeupScale = 3.4;
  const bend = Math.min(160, viewportWidth * .19);
  const approach = showOpening ? [
    point(0, closeupX, closeupY),
    point(handoff, closeupX, closeupY, 'cubic-bezier(.32, 0, .66, .7)'),
    point(firstBend, landingX + bend, landingY - 85, 'cubic-bezier(.35, .15, .65, .85)'),
    point(secondBend, landingX - bend * .57, landingY - 43, 'ease-out'),
  ] : [
    point(0, viewportWidth * 0.75, -dock.height - 24, 'ease-in'),
    point(195, landingX + viewportWidth * 0.09, landingY - 125, 'ease-in'),
  ];
  const motion = pod.animate([
    ...approach,
    point(landing, landingX, landingY, 'ease-out'),
    point(bounce, (landingX + role.rect.left - armReach) / 2, Math.min(landingY, firstY) - 27, 'ease-in'),
    point(settle, role.rect.left - armReach, firstY, 'ease-out'),
    point(roleStart, role.rect.left - armReach, firstY),
    point(roleEnd, role.rect.right - armReach, firstY, 'ease-in-out'),
    point(roleEnd + 70, turnX, firstY - 15, 'ease-in'),
    point(roleEnd + 145, turnX - 7, secondY - 7, 'ease-out'),
    point(descriptionStart, description.rect.left - secondReach, secondY),
    point(written, description.rect.right - secondReach, secondY, 'ease-in-out'),
    point(takeoff, Math.min(dockCenter, Math.max(turnX, description.rect.right + 38)), secondY - 5, glide),
    { translate: '0 0', offset: 1 },
  ], duration);

  function typeLine(line: NonNullable<ReturnType<typeof getTypingLine>>, delay: number, lineDuration: number, accents = false) {
    const tail = accents ? 95 : 0;
    const penDuration = lineDuration + tail;
    const end = lineDuration / penDuration;
    return [
      line.ink.animate(line.reveal, { delay, duration: lineDuration, fill: 'backwards' }),
      line.pen.animate([
        { translate: '-2px -50%', opacity: 0, offset: 0 },
        { translate: `${line.rect.width * 0.08 - 2}px -50%`, opacity: 0.9, offset: 0.08 * end },
        { translate: `${line.rect.width * 0.92 - 2}px -50%`, opacity: 0.9, offset: 0.92 * end },
        { translate: `${line.rect.width - 2}px -50%`, opacity: accents ? 1 : 0, offset: end },
        ...(accents ? [{ translate: `${line.rect.width - 2}px -50%`, opacity: 0, offset: 1 }] : []),
      ], { delay, duration: penDuration }),
      ...(accents ? line.reveal.slice(1).map(({ offset }) => line.pen.animate([
        { scale: '1' }, { scale: '2.5', offset: .25 }, { scale: '1' },
      ], { delay: delay + lineDuration * Number(offset), duration: 95, easing: 'ease-out' })) : []),
    ];
  }

  // The wrist lifts between clusters of glyphs and touches down at their reveal offsets.
  function taps(contacts: Keyframe[], start: number, end: number, liftHeight: number) {
    return contacts.flatMap((frame, index) => {
      const time = start + (end - start) * Number(frame.offset);
      const previous = contacts[index - 1];
      const touch = { time, tip: firstTip };
      if (!previous) return [touch];
      const lift = start + (end - start) * (Number(previous.offset) + Number(frame.offset)) / 2;
      return [{ time: lift, tip: firstTip - liftHeight }, touch];
    });
  }

  const wrist = [
    { time: 0, tip: firstTip - 11 },
    { time: roleStart - 155, tip: firstTip - 11 },
    ...taps(role.reveal.filter((frame, index) => index % 4 === 0 || frame.offset === 1), roleStart, roleEnd, 3),
    { time: (roleEnd + descriptionStart) / 2, tip: firstTip - 9 },
    ...taps(description.reveal, descriptionStart, written, 7),
    { time: takeoff, tip: firstTip - 12 },
    { time: duration, tip: firstTip - 12 },
  ];
  const folded = 'rotate(-54deg) scale(.42, .42)';
  const foldedUp = 'rotate(53deg) scale(.42, -.42)';
  const open = 'rotate(0deg) scale(1, 1)';
  const openUp = 'rotate(0deg) scale(1, -1)';
  const actions = [...hero.querySelectorAll('.hero-actions > a, .hero-socials, .hero-scroll')];
  const actionDelays = [1300 + openingOffset, 1440 + openingOffset, written - 170, written];
  const compactPose = { transform: `scale(${secondScale})`, transformOrigin: '0 0' };
  const sparks = [...impact.querySelectorAll('.hero-impact-spark')].map((spark, index) => {
    const angle = index * 137.5;
    const reach = (viewportWidth < 640 ? 54 : 82) + (index % 3) * 16;
    return spark.animate([
      { opacity: 0, transform: `rotate(${angle}deg) translateX(4px) scaleX(.25)` },
      { opacity: .9, transform: `rotate(${angle}deg) translateX(22px) scaleX(1)`, offset: .23 },
      { opacity: 0, transform: `rotate(${angle}deg) translateX(${reach}px) scaleX(.25)` },
    ], { delay: landing + (index % 3) * 15, duration: 440, easing: 'ease-out' });
  });
  const animations = [
    motion,
    stage.animate([
      { translate: '0 var(--hero-intro-scroll, 0px)', offset: 0 },
      { translate: '0 var(--hero-intro-scroll, 0px)', offset: takeoff / duration, easing: glide },
      { translate: '0 0', offset: 1 },
    ], duration),
    name.animate([
      { opacity: 0, transform: 'translateY(25px)', clipPath: 'inset(85% -10% -40%)' },
      { opacity: 1, transform: 'translateY(0)', clipPath: 'inset(-45% -10% -45%)' },
    ], { delay: showOpening ? reveal + 145 : 60, duration: 710, easing: glide, fill: 'backwards' }),
    ...sparks,
    ring.animate([
      { opacity: 0, transform: 'scale(.12)' },
      { opacity: .7, transform: 'scale(.46)', offset: .24 },
      { opacity: 0, transform: 'scale(1.85)' },
    ], { delay: landing, duration: 540, easing: 'ease-out' }),
    titleLight.animate([
      { opacity: 0, maskPosition: '-100% 0' },
      { opacity: .77, offset: .21 },
      { opacity: .77, offset: .76 },
      { opacity: 0, maskPosition: '200% 0' },
    ], { delay: landing + 55, duration: 620, easing: 'ease-in-out' }),
    stage.animate([
      ...(showOpening ? [
        { transform: `scale(${closeupScale})`, transformOrigin: eyeOrigin, offset: 0 },
        { transform: `scale(${closeupScale})`, transformOrigin: eyeOrigin, offset: handoff / duration },
        { transform: 'rotate(9deg) scale(1.85)', transformOrigin: eyeOrigin, offset: firstBend / duration },
      ] : [{ transform: 'rotate(19deg) scale(.92, 1.08)', offset: 0 }]),
      { transform: 'rotate(-11deg) scale(.94, 1.09)', offset: (landing - 100) / duration },
      { transform: 'rotate(0deg) scale(1.17, .8)', offset: landing / duration },
      { transform: 'rotate(-9deg) scale(.95, 1.05)', offset: bounce / duration },
      { transform: 'rotate(0deg) scale(1)', offset: settle / duration },
      { transform: 'rotate(0deg) scale(1)', offset: roleEnd / duration },
      { transform: 'rotate(-8deg) scale(.97, 1.04)', offset: (roleEnd + descriptionStart) / 2 / duration },
      { ...compactPose, offset: descriptionStart / duration },
      { ...compactPose, offset: written / duration },
      { ...compactPose, offset: takeoff / duration },
      { transform: 'rotate(0deg) scale(1)', offset: 1 },
    ], duration),
    divider.animate([
      { scale: '.12 1', opacity: 0, boxShadow: '0 0 0 transparent' },
      { scale: '1.18 1', opacity: 1, boxShadow: '0 0 12px var(--hero-impact-color)', offset: .38 },
      { scale: '1 1', opacity: 1, boxShadow: '0 0 0 transparent' },
    ], { delay: landing, duration: 420, easing: 'ease-out', fill: 'backwards' }),
    arm.animate([
      { opacity: 0, transform: folded, offset: 0 },
      { opacity: 0, transform: folded, offset: (roleStart - 145) / duration, easing: glide },
      { opacity: 1, transform: open, offset: roleStart / duration },
      { opacity: 1, transform: open, offset: roleEnd / duration, easing: 'ease-in' },
      { opacity: 0, transform: folded, offset: (roleEnd + 105) / duration },
      { opacity: 0, transform: foldedUp, offset: (descriptionStart - 125) / duration, easing: glide },
      { opacity: 1, transform: openUp, offset: descriptionStart / duration },
      { opacity: 1, transform: openUp, offset: (written + 20) / duration, easing: 'ease-in' },
      { opacity: 0, transform: foldedUp, offset: (takeoff - 30) / duration },
      { opacity: 0, transform: foldedUp, offset: 1 },
    ], duration),
    shaft.animate(wrist.map(({ time, tip }) => ({
      transform: `matrix(1, 0, .125, ${(tip - 8 - 53) / 24}, 0, 0)`, offset: time / duration,
    })), duration),
    hand.animate(wrist.map(({ time, tip }) => ({
      transform: `translate(67px, ${tip - 8}px)`, offset: time / duration,
    })), duration),
    eyes.animate([{ translate: '0 0' }, { translate: '0 -3px', offset: 0.13 }, { translate: '0 -3px', offset: 0.8 }, { translate: '0 0' }], {
      delay: descriptionStart - 140, duration: written - descriptionStart + 330, easing: 'ease-in-out',
    }),
    eyes.animate([{ scale: '1 1' }, { scale: '1 .12' }, { scale: '1 1' }], {
      delay: written + 35, duration: 130, easing: 'ease-in-out',
    }),
    ...typeLine(role, roleStart, roleEnd - roleStart),
    ...typeLine(description, descriptionStart, written - descriptionStart, true),
    ...actions.map((element, index) => element.animate(
      [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { delay: actionDelays[index], duration: 420, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' }
    )),
  ];

  if (showOpening) {
    const handoffScale = Math.min(.87, eyeRect.width * closeupScale / (closeupRect.width * .84));
    animations.push(
      opening.animate([{ opacity: 1 }, { opacity: 0 }], {
        delay: reveal + 170, duration: 160, easing: 'ease-in-out', fill: 'both',
      }),
      openingEyes.animate([{ transform: 'scale(1)' }, { transform: `scale(${handoffScale})` }], {
        delay: reveal, duration: 210, easing: glide, fill: 'forwards',
      }),
      stage.animate([{ opacity: 0 }, { opacity: 1 }], {
        delay: reveal + 185, duration: 145, easing: 'ease-out', fill: 'backwards',
      }),
    );
  }

  const events = new AbortController();
  const soundTimers = [
    ...role.syllables.map(({ offset, code }) => ({ time: roleStart + (roleEnd - roleStart) * offset, code })),
    ...description.syllables.map(({ offset, code }) => ({ time: descriptionStart + (written - descriptionStart) * offset, code })),
  ].map(({ time, code }) => window.setTimeout(() => {
    if (canPlaySound() && !document.hidden) playSyllableBlip(code);
  }, time));
  const unlockSound = () => {
    if (canPlaySound()) unlockMascotAudio();
  };
  const initialScroll = window.scrollY;
  const syncScroll = () => {
    stage.style.setProperty('--hero-intro-scroll', `${initialScroll - window.scrollY}px`);
  };
  const landingTimer = window.setTimeout(() => {
    hero.dispatchEvent(new CustomEvent<HeroLanding>(HERO_LANDING, {
      detail: { x: landingX, y: centerY(ledge) + initialScroll - window.scrollY, signal: events.signal },
    }));
  }, landing);
  const writtenTimer = window.setTimeout(onWritten, written);
  const cleanup = () => {
    events.abort();
    soundTimers.forEach((timer) => window.clearTimeout(timer));
    window.clearTimeout(landingTimer);
    window.clearTimeout(writtenTimer);
    animations.forEach((animation) => animation.cancel());
    stage.style.removeProperty('--hero-intro-scroll');
  };
  const finish = () => {
    cleanup();
    onFinish();
  };
  const options = { signal: events.signal };
  window.addEventListener('pointerdown', unlockSound, { ...options, once: true });
  window.addEventListener('keydown', unlockSound, { ...options, once: true });
  motion.addEventListener('finish', finish, options);
  hero.addEventListener('focusin', (event) => {
    if (event.target instanceof HTMLElement && event.target.matches(':focus-visible')) finish();
  }, options);
  window.addEventListener('resize', () => {
    if (document.documentElement.clientWidth !== viewportWidth) finish();
  }, options);
  window.addEventListener('scroll', syncScroll, { ...options, passive: true });

  return cleanup;
}
