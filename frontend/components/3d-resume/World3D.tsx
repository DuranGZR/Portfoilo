'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useLocale } from 'next-intl';
import Island from './Island';
import Environment3D from './Environment3D';
import CameraController from './CameraController';
import DetailPanel from './DetailPanel';
import IntroSequence from './IntroSequence';

interface IslandItem {
    title: string;
    description: string;
    date?: string;
    tags?: string[];
}

interface Island3DData {
    id: string;
    title: string;
    position: [number, number, number];
    color: string;
    icon: string;
    items: IslandItem[];
}

interface World3DProps {
    selectedIsland: string | null;
    onIslandSelect: (id: string | null) => void;
    introComplete?: boolean;
    skipIntro?: boolean;
    onIntroComplete?: () => void;
}

const ISLAND_LABELS = {
    tr: {
        titles: {
            about: 'Hakkımda',
            education: 'Eğitim',
            experience: 'Deneyim',
            skills: 'Yetenekler',
            projects: 'Projeler',
        },
        tooltips: {
            about: 'Kim olduğumu ve vizyonumu keşfet',
            education: 'Akademik geçmişim ve müfredatım',
            experience: 'Topluluk rollerim ve sertifikalarım',
            skills: 'Teknik yeteneklerim ve araçlar',
            projects: 'Geliştirdiğim öne çıkan projeler',
        },
        cta: 'Tıkla ve keşfet',
    },
    en: {
        titles: {
            about: 'About Me',
            education: 'Education',
            experience: 'Experience',
            skills: 'Skills',
            projects: 'Projects',
        },
        tooltips: {
            about: 'Discover my profile and engineering focus',
            education: 'Academic background and coursework',
            experience: 'Community roles and certifications',
            skills: 'Technical stack and engineering tools',
            projects: 'Featured AI, Backend & Mobile projects',
        },
        cta: 'Click to explore',
    },
} as const;

export default function World3D({
    selectedIsland,
    onIslandSelect,
    introComplete = true,
    skipIntro = false,
    onIntroComplete,
}: World3DProps) {
    const rawLocale = useLocale();
    const locale = rawLocale === 'en' ? 'en' : 'tr';
    const copy = ISLAND_LABELS[locale];

    const [internalIntroComplete, setInternalIntroComplete] = useState(introComplete);
    const [hoveredIsland, setHoveredIsland] = useState<string | null>(null);

    const orbitControlsRef = useRef<any>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const pointerCoordsRef = useRef({ x: 0, y: 0 });

    const islands: Island3DData[] = useMemo(
        () => [
            {
                id: 'about',
                title: copy.titles.about,
                position: [0, 1, -8],
                color: '#819fa7',
                icon: 'about',
                items: [],
            },
            {
                id: 'education',
                title: copy.titles.education,
                position: [-10, 0, 4],
                color: '#7a9ea6',
                icon: 'education',
                items: [],
            },
            {
                id: 'experience',
                title: copy.titles.experience,
                position: [-6, -0.5, 12],
                color: '#6a8e96',
                icon: 'experience',
                items: [],
            },
            {
                id: 'skills',
                title: copy.titles.skills,
                position: [10, 0, 4],
                color: '#8ab0b8',
                icon: 'skills',
                items: [],
            },
            {
                id: 'projects',
                title: copy.titles.projects,
                position: [6, -0.5, 12],
                color: '#5a7e86',
                icon: 'projects',
                items: [],
            },
        ],
        [copy]
    );

    useEffect(() => {
        setInternalIntroComplete(introComplete);
    }, [introComplete]);

    const handleIntroComplete = useCallback(() => {
        setInternalIntroComplete(true);
        onIntroComplete?.();
    }, [onIntroComplete]);

    const applyTooltipTransform = useCallback((x: number, y: number) => {
        pointerCoordsRef.current = { x, y };
        if (tooltipRef.current) {
            tooltipRef.current.style.transform = `translate3d(${x + 16}px, ${y + 16}px, 0)`;
        }
    }, []);

    const handleIslandSelect = useCallback(
        (islandId: string) => {
            if (internalIntroComplete) {
                setHoveredIsland(null);
                document.body.style.cursor = 'default';
                onIslandSelect(islandId);
            }
        },
        [internalIntroComplete, onIslandSelect]
    );

    const handleIslandHover = useCallback(
        (islandId: string, isHovered: boolean, position: { x: number; y: number }) => {
            if (isHovered) {
                applyTooltipTransform(position.x, position.y);
                setHoveredIsland(islandId);
            } else {
                setHoveredIsland((prev) => (prev === islandId ? null : prev));
            }
        },
        [applyTooltipTransform]
    );

    useEffect(() => {
        if (hoveredIsland && tooltipRef.current) {
            const { x, y } = pointerCoordsRef.current;
            tooltipRef.current.style.transform = `translate3d(${x + 16}px, ${y + 16}px, 0)`;
        }
    }, [hoveredIsland]);

    useEffect(() => {
        if (orbitControlsRef.current) {
            orbitControlsRef.current.enabled = internalIntroComplete && !selectedIsland;
        }
    }, [internalIntroComplete, selectedIsland]);

    const activeHoverIsland = hoveredIsland
        ? islands.find((i) => i.id === hoveredIsland)
        : null;

    return (
        <>
            <Canvas
                camera={{ position: [0, 80, 200], fov: 55 }}
                gl={{
                    antialias: true,
                    alpha: false,
                    stencil: false,
                    powerPreference: 'high-performance',
                }}
                dpr={[1, 1.35]}
                style={{ background: '#050505' }}
                onPointerMove={(e) => {
                    if (hoveredIsland) {
                        applyTooltipTransform(e.clientX, e.clientY);
                    }
                }}
            >
                <Suspense fallback={null}>
                    {/* Clean two-light setup for fast PBR shading */}
                    <ambientLight intensity={0.34} color="#dfe8ed" />
                    <directionalLight position={[10, 20, 10]} intensity={0.62} color="#f5f8fa" />

                    {/* Memoized Space Environment */}
                    <Environment3D />

                    {/* Intro Sequence */}
                    {!internalIntroComplete && (
                        <IntroSequence onComplete={handleIntroComplete} skip={skipIntro} />
                    )}

                    {/* Islands */}
                    {islands.map((island) => (
                        <Island
                            key={island.id}
                            id={island.id}
                            title={island.title}
                            position={island.position}
                            color={island.color}
                            icon={island.icon}
                            items={island.items}
                            isSelected={selectedIsland === island.id}
                            onSelect={handleIslandSelect}
                            onHover={handleIslandHover}
                        />
                    ))}

                    {/* Camera Controller */}
                    {internalIntroComplete && (
                        <CameraController
                            selectedIsland={selectedIsland}
                            islands={islands}
                            introComplete={internalIntroComplete}
                        />
                    )}

                    {/* Controls */}
                    <OrbitControls
                        ref={orbitControlsRef}
                        enabled={internalIntroComplete && !selectedIsland}
                        enablePan={false}
                        enableZoom={true}
                        minDistance={18}
                        maxDistance={50}
                        minPolarAngle={Math.PI / 5}
                        maxPolarAngle={Math.PI / 2.1}
                        dampingFactor={0.055}
                        rotateSpeed={0.42}
                        enableDamping={true}
                    />
                </Suspense>
            </Canvas>

            {/* Zero-React-Rerender GPU Cursor Tooltip */}
            {activeHoverIsland && !selectedIsland && internalIntroComplete && (
                <div
                    ref={tooltipRef}
                    className="fixed top-0 left-0 pointer-events-none z-40 will-change-transform"
                    style={{
                        transform: `translate3d(${pointerCoordsRef.current.x + 16}px, ${pointerCoordsRef.current.y + 16}px, 0)`,
                    }}
                >
                    <div
                        className="px-4 py-3 rounded-xl border max-w-[215px]"
                        style={{
                            background: 'rgba(10, 12, 16, 0.94)',
                            borderColor: `${activeHoverIsland.color}45`,
                            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.65)',
                        }}
                    >
                        <div
                            className="text-sm font-medium mb-1"
                            style={{ color: activeHoverIsland.color }}
                        >
                            {activeHoverIsland.title}
                        </div>
                        <div className="text-xs text-white/55 leading-snug">
                            {copy.tooltips[activeHoverIsland.id as keyof typeof copy.tooltips]}
                        </div>
                        <div className="text-[10px] text-white/35 mt-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                            {copy.cta}
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Panel */}
            <DetailPanel islandId={selectedIsland} onClose={() => onIslandSelect(null)} />
        </>
    );
}
