import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scroll, ScrollControls } from '@react-three/drei';
import TrailerScene from './components/trailer/TrailerScene';
import TrailerOverlay from './components/trailer/TrailerOverlay';

export default function TrailerPage() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const sync = () => setIsMobile(mediaQuery.matches);

        sync();
        mediaQuery.addEventListener('change', sync);

        return () => mediaQuery.removeEventListener('change', sync);
    }, []);

    return (
        <div className="w-full h-screen bg-slate-950 text-white font-sans overflow-hidden selection:bg-emerald-500 selection:text-white">
            <Canvas
                dpr={isMobile ? [1, 1.3] : [1, 2]}
                gl={{ antialias: !isMobile, powerPreference: isMobile ? 'low-power' : 'high-performance' }}
            >
                <Suspense fallback={null}>
                    <ScrollControls pages={5} damping={isMobile ? 0.28 : 0.35}>
                        <TrailerScene isMobile={isMobile} />
                        <Scroll html style={{ width: '100%' }}>
                            <TrailerOverlay />
                        </Scroll>
                    </ScrollControls>
                </Suspense>
            </Canvas>
        </div>
    );
}
