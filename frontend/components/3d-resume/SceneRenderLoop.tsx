'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

export default function SceneRenderLoop({ paused }: { paused: boolean }) {
    const advance = useThree(state => state.advance);
    const elapsed = useRef(0);

    useEffect(() => {
        if (paused) return;
        let frame = 0;
        let lastTick = performance.now();

        const render = (now: number) => {
            frame = 0;
            if (document.hidden) return;
            // Follow the display refresh rate without jumping ahead after a pause.
            elapsed.current += Math.min((now - lastTick) / 1000, 0.05);
            lastTick = now;
            advance(elapsed.current);
            frame = requestAnimationFrame(render);
        };
        const start = () => {
            if (frame || document.hidden) return;
            lastTick = performance.now();
            frame = requestAnimationFrame(render);
        };
        const stop = () => { cancelAnimationFrame(frame); frame = 0; };
        const visibility = () => { if (document.hidden) stop(); else start(); };
        document.addEventListener('visibilitychange', visibility);
        start();
        return () => {
            stop();
            document.removeEventListener('visibilitychange', visibility);
        };
    }, [advance, paused]);

    return null;
}
