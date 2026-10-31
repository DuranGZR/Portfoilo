'use client';

import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface IntroSequenceProps {
    onComplete: () => void;
    skip?: boolean;
}

const CAMERA_PATH = {
    start: new THREE.Vector3(0, 80, 200),
    control1: new THREE.Vector3(-50, 50, 100),
    control2: new THREE.Vector3(30, 25, 50),
    end: new THREE.Vector3(0, 15, 32),
};

const LOOK_AT_PATH = {
    start: new THREE.Vector3(0, 0, -100),
    control1: new THREE.Vector3(0, 0, -20),
    control2: new THREE.Vector3(0, 0, 0),
    end: new THREE.Vector3(0, 0, 0),
};

const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

function writeCubicBezier(
    out: THREE.Vector3,
    t: number,
    p0: THREE.Vector3,
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    p3: THREE.Vector3
): THREE.Vector3 {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    out.set(
        p0.x * uuu + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
        p0.y * uuu + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
        p0.z * uuu + 3 * uu * t * p1.z + 3 * u * tt * p2.z + ttt * p3.z
    );
    return out;
}

export default function IntroSequence({ onComplete, skip = false }: IntroSequenceProps) {
    const { camera } = useThree();
    const [isComplete, setIsComplete] = useState(false);
    const startTimeRef = useRef<number | null>(null);
    const posScratch = useRef(new THREE.Vector3());
    const lookScratch = useRef(new THREE.Vector3());

    const INTRO_DURATION = 3.6;

    useEffect(() => {
        if (skip && !isComplete) {
            camera.position.copy(CAMERA_PATH.end);
            camera.lookAt(LOOK_AT_PATH.end);
            setIsComplete(true);
            onComplete();
        }
    }, [skip, isComplete, camera, onComplete]);

    useFrame((state) => {
        if (isComplete || skip) return;

        if (startTimeRef.current === null) {
            startTimeRef.current = state.clock.elapsedTime;
        }

        const elapsed = state.clock.elapsedTime - startTimeRef.current;
        const rawProgress = Math.min(elapsed / INTRO_DURATION, 1);
        const t = easeInOutCubic(rawProgress);

        writeCubicBezier(
            posScratch.current,
            t,
            CAMERA_PATH.start,
            CAMERA_PATH.control1,
            CAMERA_PATH.control2,
            CAMERA_PATH.end
        );
        writeCubicBezier(
            lookScratch.current,
            t,
            LOOK_AT_PATH.start,
            LOOK_AT_PATH.control1,
            LOOK_AT_PATH.control2,
            LOOK_AT_PATH.end
        );

        camera.position.copy(posScratch.current);
        camera.lookAt(lookScratch.current);

        if (rawProgress >= 1 && !isComplete) {
            setIsComplete(true);
            onComplete();
        }
    });

    return null;
}
