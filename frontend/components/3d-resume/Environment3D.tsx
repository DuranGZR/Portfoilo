'use client';

import React, { memo, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const Environment3D = memo(function Environment3D() {
    const nebulaRef = useRef<THREE.Points>(null);
    const dustRef = useRef<THREE.Points>(null);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        if (nebulaRef.current) {
            nebulaRef.current.rotation.y = time * 0.0018;
        }
        if (dustRef.current) {
            dustRef.current.rotation.y = time * 0.0025;
        }
    });

    // Optimized nebula clouds (1500 instead of 4000)
    const nebula = useMemo(() => {
        const count = 1500;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const nebulaColors = [
            new THREE.Color('#2a0a4e'),
            new THREE.Color('#0a2a5e'),
            new THREE.Color('#4a1a4e'),
            new THREE.Color('#1a3a6e'),
            new THREE.Color('#0a4a6e'),
        ];

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const baseRadius = 250 + Math.random() * 340;
            const clusterAngle = Math.floor(Math.random() * 5) * ((Math.PI * 2) / 5);
            const clusterOffset = Math.sin(theta * 4 + clusterAngle) * 75 + Math.cos(phi * 3) * 55;
            const radius = baseRadius + clusterOffset;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const colorIndex = Math.floor((theta / (Math.PI * 2)) * nebulaColors.length);
            const color = nebulaColors[colorIndex % nebulaColors.length];
            const variation = 0.8 + Math.random() * 0.4;

            colors[i * 3] = color.r * variation;
            colors[i * 3 + 1] = color.g * variation;
            colors[i * 3 + 2] = color.b * variation;
        }

        return { positions, colors };
    }, []);

    // Optimized cosmic dust (500 instead of 1500)
    const dust = useMemo(() => {
        const count = 500;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const radius = 80 + Math.random() * 200;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const brightness = 0.3 + Math.random() * 0.38;
            colors[i * 3] = brightness;
            colors[i * 3 + 1] = brightness * 0.9;
            colors[i * 3 + 2] = brightness * 0.7;
        }

        return { positions, colors };
    }, []);

    // Bright colored accent stars (240 instead of 500)
    const brightStars = useMemo(() => {
        const count = 240;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const starColors = [
            new THREE.Color('#ffffff'),
            new THREE.Color('#fff5e0'),
            new THREE.Color('#e0e8ff'),
            new THREE.Color('#ffd4a8'),
            new THREE.Color('#a8d4ff'),
        ];

        for (let i = 0; i < count; i++) {
            const radius = 150 + Math.random() * 350;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const color = starColors[Math.floor(Math.random() * starColors.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        return { positions, colors };
    }, []);

    return (
        <>
            <color attach="background" args={['#020209']} />

            {/* Single unified star field instead of 3 overlapping heavy shader passes */}
            <Stars
                radius={520}
                depth={220}
                count={4200}
                factor={4.2}
                saturation={0.15}
                fade
                speed={0.04}
            />

            {/* Nebula clouds */}
            <points ref={nebulaRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[nebula.positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[nebula.colors, 3]} />
                </bufferGeometry>
                <pointsMaterial
                    size={3.2}
                    vertexColors
                    transparent
                    opacity={0.15}
                    sizeAttenuation
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Bright colored stars */}
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[brightStars.positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[brightStars.colors, 3]} />
                </bufferGeometry>
                <pointsMaterial
                    size={1.6}
                    vertexColors
                    transparent
                    opacity={0.88}
                    sizeAttenuation
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Cosmic dust */}
            <points ref={dustRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[dust.positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[dust.colors, 3]} />
                </bufferGeometry>
                <pointsMaterial
                    size={0.42}
                    vertexColors
                    transparent
                    opacity={0.24}
                    sizeAttenuation
                    depthWrite={false}
                />
            </points>

            {/* Distant Celestial Bodies (LOD-optimized segments for high FPS) */}
            <RealisticSun position={[180, 80, -250]} size={18} />

            <RingedPlanet
                position={[140, -20, -160]}
                size={12}
                color="#c9a962"
                ringColor="#d4c4a0"
            />

            <GasGiant position={[-120, 40, -180]} size={15} />

            <RealisticPlanet
                position={[-280, 30, -100]}
                size={8}
                color="#c1440e"
                hasAtmosphere
                atmosphereColor="#ff6b4a"
            />

            <RealisticPlanet
                position={[320, 50, -80]}
                size={10}
                color="#1e4d6e"
                hasAtmosphere
                atmosphereColor="#5ea8d4"
            />

            <RealisticPlanet
                position={[-50, 150, -300]}
                size={11}
                color="#5a4a7a"
                hasAtmosphere
                atmosphereColor="#8a7aaa"
            />

            <RealisticPlanet position={[80, -100, -200]} size={5} color="#6a6a6a" />

            <RingedPlanet
                position={[-300, 20, 200]}
                size={10}
                color="#7a8a9a"
                ringColor="#a0b0c0"
            />
        </>
    );
});

export default Environment3D;

function RealisticSun({ position, size }: { position: [number, number, number]; size: number }) {
    return (
        <group position={position}>
            <mesh>
                <sphereGeometry args={[size, 20, 20]} />
                <meshBasicMaterial color="#fffff8" />
            </mesh>
            <mesh>
                <sphereGeometry args={[size * 1.35, 16, 16]} />
                <meshBasicMaterial color="#fff8e0" transparent opacity={0.45} depthWrite={false} />
            </mesh>
            <mesh>
                <sphereGeometry args={[size * 2.1, 16, 16]} />
                <meshBasicMaterial color="#ffeecc" transparent opacity={0.16} depthWrite={false} />
            </mesh>
        </group>
    );
}

function RealisticPlanet({
    position,
    size,
    color,
    hasAtmosphere = false,
    atmosphereColor = '#ffffff',
}: {
    position: [number, number, number];
    size: number;
    color: string;
    hasAtmosphere?: boolean;
    atmosphereColor?: string;
}) {
    return (
        <group position={position}>
            <mesh>
                <sphereGeometry args={[size, 24, 24]} />
                <meshStandardMaterial color={color} metalness={0.05} roughness={0.9} />
            </mesh>
            {hasAtmosphere && (
                <mesh>
                    <sphereGeometry args={[size * 1.09, 18, 18]} />
                    <meshBasicMaterial
                        color={atmosphereColor}
                        transparent
                        opacity={0.14}
                        depthWrite={false}
                    />
                </mesh>
            )}
        </group>
    );
}

function RingedPlanet({
    position,
    size,
    color,
    ringColor,
}: {
    position: [number, number, number];
    size: number;
    color: string;
    ringColor: string;
}) {
    return (
        <group position={position} rotation={[0.2, 0, 0.1]}>
            <mesh>
                <sphereGeometry args={[size, 24, 24]} />
                <meshStandardMaterial color={color} metalness={0.1} roughness={0.8} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[size * 1.4, size * 1.72, 48]} />
                <meshBasicMaterial
                    color={ringColor}
                    transparent
                    opacity={0.58}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[size * 1.78, size * 2.25, 48]} />
                <meshBasicMaterial
                    color={ringColor}
                    transparent
                    opacity={0.32}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}

function GasGiant({ position, size }: { position: [number, number, number]; size: number }) {
    return (
        <group position={position}>
            <mesh>
                <sphereGeometry args={[size, 24, 24]} />
                <meshStandardMaterial color="#c4a574" metalness={0.05} roughness={0.82} />
            </mesh>
            <mesh>
                <sphereGeometry args={[size * 1.05, 18, 18]} />
                <meshBasicMaterial color="#e8d4a8" transparent opacity={0.08} depthWrite={false} />
            </mesh>
        </group>
    );
}
