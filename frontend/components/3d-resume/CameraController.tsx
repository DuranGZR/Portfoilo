'use client';

import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type CameraMode = 'intro' | 'overview' | 'transitioning' | 'focused';

interface Island3DData {
    id: string;
    title: string;
    position: [number, number, number];
    color: string;
    icon: string;
    items: { title: string; description: string; date?: string; tags?: string[] }[];
}

interface CameraControllerProps {
    selectedIsland: string | null;
    islands: Island3DData[];
    introComplete?: boolean;
}

const easeOutExpo = (t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export default function CameraController({
    selectedIsland,
    islands,
    introComplete = true,
}: CameraControllerProps) {
    const { camera } = useThree();
    const [mode, setMode] = useState<CameraMode>(introComplete ? 'overview' : 'intro');

    // Pre-allocated vectors (zero GC allocations inside useFrame)
    const targetPosition = useRef(new THREE.Vector3(0, 15, 32));
    const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
    const startPosition = useRef(new THREE.Vector3());
    const startLookAt = useRef(new THREE.Vector3());
    const currentLookAt = useRef(new THREE.Vector3());
    const scratchPosition = useRef(new THREE.Vector3());
    const orbitCenter = useRef(new THREE.Vector3());

    const transitionDuration = useRef(0.9);
    const transitionStartTime = useRef<number | null>(null);

    useEffect(() => {
        if (introComplete && mode === 'intro') {
            setMode('overview');
        }
    }, [introComplete, mode]);

    useEffect(() => {
        if (mode === 'intro') return;

        if (selectedIsland) {
            const island = islands.find((i) => i.id === selectedIsland);
            if (island) {
                const [x, y, z] = island.position;

                startPosition.current.copy(camera.position);
                startLookAt.current.copy(targetLookAt.current);

                targetPosition.current.set(x + 4, y + 6, z + 14);
                targetLookAt.current.set(x, y + 0.5, z);
                orbitCenter.current.set(x, y + 0.5, z);

                transitionStartTime.current = null;
                transitionDuration.current = 0.85;
                setMode('transitioning');
            }
        } else if (mode === 'focused' || mode === 'transitioning') {
            startPosition.current.copy(camera.position);
            startLookAt.current.copy(targetLookAt.current);

            targetPosition.current.set(0, 15, 32);
            targetLookAt.current.set(0, 0, 0);

            transitionStartTime.current = null;
            transitionDuration.current = 0.8;
            setMode('transitioning');
        }
    }, [selectedIsland, islands, mode, camera]);

    useFrame((state) => {
        if (mode === 'intro') return;

        const time = state.clock.elapsedTime;

        if (mode === 'transitioning') {
            if (transitionStartTime.current === null) {
                transitionStartTime.current = time;
            }

            const elapsed = time - transitionStartTime.current;
            const rawProgress = Math.min(elapsed / transitionDuration.current, 1);
            const eased = easeOutExpo(rawProgress);

            camera.position.lerpVectors(startPosition.current, targetPosition.current, eased);
            currentLookAt.current.lerpVectors(startLookAt.current, targetLookAt.current, eased);
            camera.lookAt(currentLookAt.current);

            if (rawProgress >= 1) {
                setMode(selectedIsland ? 'focused' : 'overview');
            }
        } else if (mode === 'overview') {
            const breathe = Math.sin(time * 0.3) * 0.4;
            scratchPosition.current.set(
                targetPosition.current.x,
                targetPosition.current.y + breathe,
                targetPosition.current.z
            );
            camera.position.lerp(scratchPosition.current, 0.025);
        }
        // When `mode === 'focused'`, hold camera steady so UI scrolling inside DetailPanel has zero GPU/matrix contention
    });

    return null;
}
