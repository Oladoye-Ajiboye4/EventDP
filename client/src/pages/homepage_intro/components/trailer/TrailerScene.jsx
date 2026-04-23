import { useFrame } from '@react-three/fiber';
import { Environment, Sparkles, Text, useScroll } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import AvatarPhoto from './AvatarPhoto';
import ViralNetwork from '../ViralNetwork';

function mapLinearClamped(value, inMin, inMax, outMin, outMax) {
    const clamped = THREE.MathUtils.clamp(value, inMin, inMax);
    return THREE.MathUtils.mapLinear(clamped, inMin, inMax, outMin, outMax);
}

function createFrameGeometry() {
    const shape = new THREE.Shape();
    const width = 3.5;
    const height = 5;
    const radius = 0.3;

    shape.moveTo(-width / 2 + radius, -height / 2);
    shape.lineTo(width / 2 - radius, -height / 2);
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
    shape.lineTo(width / 2, height / 2 - radius);
    shape.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
    shape.lineTo(-width / 2 + radius, height / 2);
    shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);
    shape.lineTo(-width / 2, -height / 2 + radius);
    shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);

    const hole = new THREE.Path();
    hole.absarc(0, 0.5, 1.2, 0, Math.PI * 2, false);
    shape.holes.push(hole);

    return new THREE.ExtrudeGeometry(shape, {
        depth: 0.1,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.02,
    });
}

export default function TrailerScene({ isMobile = false }) {
    const frameGroupRef = useRef(null);
    const slugRef = useRef(null);
    const textRef = useRef(null);
    const photoRef = useRef(null);
    const mosaicRef = useRef(null);
    const viralNetworkRef = useRef(null);

    const scroll = useScroll();
    const frameGeometry = useMemo(() => createFrameGeometry(), []);
    const mosaicItems = useMemo(() => {
        const total = isMobile ? 24 : 40;
        const columns = isMobile ? 6 : 8;
        const spacingX = isMobile ? 2.8 : 3;
        const spacingY = isMobile ? 3.4 : 4;

        return Array.from({ length: total })
            .map((_, index) => {
                const x = (index % columns) * spacingX - ((columns - 1) * spacingX) / 2;
                const y = Math.floor(index / columns) * spacingY - (isMobile ? 5 : 8);
                if (Math.abs(x) < 2 && Math.abs(y) < 2) return null;

                return {
                    key: index,
                    position: [x, y + 0.5, 0],
                    color: `hsl(${(index * 47) % 360}, 60%, 40%)`,
                };
            })
            .filter(Boolean);
    }, [isMobile]);

    useFrame((state) => {
        if (!frameGroupRef.current || !slugRef.current || !photoRef.current || !mosaicRef.current) {
            return;
        }

        const offset = scroll.offset;
        const floatY =
            offset < 0.1
                ? Math.sin(state.clock.elapsedTime) * 0.1 * mapLinearClamped(offset, 0, 0.1, 1, 0)
                : 0;

        frameGroupRef.current.rotation.x = mapLinearClamped(offset, 0, 0.25, 0.2, 0);
        frameGroupRef.current.rotation.y = mapLinearClamped(offset, 0, 0.25, -0.4, 0);

        slugRef.current.position.z = mapLinearClamped(offset, 0, 0.25, 0.05, -3);
        if (slugRef.current.material) {
            slugRef.current.material.opacity = mapLinearClamped(offset, 0, 0.25, 1, 0);
        }

        let cameraZ = mapLinearClamped(offset, 0.25, 0.5, 5, -1.5);
        if (textRef.current) {
            textRef.current.fillOpacity = mapLinearClamped(offset, 0.25, 0.4, 1, 0);
        }

        const frameZ = mapLinearClamped(offset, 0.5, 0.75, 0, -5);
        frameGroupRef.current.position.set(0, floatY, frameZ);
        frameGroupRef.current.visible = offset < 0.38 || offset >= 0.48;

        photoRef.current.position.z = mapLinearClamped(offset, 0.5, 0.75, -10, -5.1);
        const photoScale = mapLinearClamped(offset, 0.5, 0.75, 0, 1);
        photoRef.current.scale.set(photoScale, photoScale, photoScale);
        photoRef.current.visible = offset >= 0.48;

        cameraZ = offset > 0.75 ? mapLinearClamped(offset, 0.75, 1, -1.5, 10) : cameraZ;
        state.camera.position.z = cameraZ;

        mosaicRef.current.visible = offset > 0.6;
        const mosaicScale = mapLinearClamped(offset, 0.75, 1, 0, 1);
        mosaicRef.current.scale.set(mosaicScale, mosaicScale, mosaicScale);

        if (viralNetworkRef.current) {
            const shareIn = mapLinearClamped(offset, 0.36, 0.45, 0, 1);
            const shareOut = 1 - mapLinearClamped(offset, 0.58, 0.68, 0, 1);
            const shareMix = Math.max(0, Math.min(shareIn, shareOut));

            viralNetworkRef.current.visible = shareMix > 0.01;
            viralNetworkRef.current.scale.setScalar(shareMix);
            viralNetworkRef.current.rotation.y = state.clock.elapsedTime * 0.18;
        }
    });

    return (
        <>
            <Environment preset="city" />
            <ambientLight intensity={0.28} />
            <directionalLight position={[10, 10, 5]} intensity={1.35} />
            <pointLight position={[0, 1.5, 2]} intensity={2.2} color="#10b981" distance={14} decay={2} />

            <Sparkles
                position={[0, 0, -5]}
                count={isMobile ? 50 : 100}
                scale={10}
                size={isMobile ? 2.6 : 4}
                speed={0.2}
                color="#10b981"
                opacity={isMobile ? 0.22 : 0.35}
            />

            <group ref={viralNetworkRef} position={[0, 0.2, -6]} scale={0} visible={false}>
                <ViralNetwork
                    guestCount={isMobile ? 45 : 80}
                    minRadius={2.2}
                    maxRadius={isMobile ? 4.8 : 5.8}
                    lineDrawDuration={2.3}
                />
            </group>

            <Text
                ref={textRef}
                position={[0, 0, -2]}
                fontSize={isMobile ? 2.6 : 3.5}
                color="#10b981"
                fontWeight={900}
                letterSpacing={-0.05}
            >
                EVENTDP
            </Text>

            <group ref={frameGroupRef}>
                <mesh geometry={frameGeometry}>
                    <meshPhysicalMaterial
                        roughness={0.06}
                        transmission={1}
                        thickness={0.9}
                        color="#f8fffe"
                        ior={1.32}
                        clearcoat={1}
                        clearcoatRoughness={0.03}
                        metalness={0}
                        attenuationColor="#b6fff0"
                        attenuationDistance={1.4}
                        envMapIntensity={1.2}
                    />
                </mesh>

                <Text
                    position={[0, 2.2, 0.11]}
                    fontSize={0.15}
                    color="#10b981"
                    letterSpacing={0.1}
                    anchorX="center"
                    anchorY="middle"
                >
                    I WILL BE ATTENDING
                </Text>

                <Text
                    position={[0, -1.2, 0.11]}
                    fontSize={0.5}
                    color="#ffffff"
                    fontWeight={900}
                    anchorX="center"
                    anchorY="middle"
                >
                    EVENTDP
                </Text>

                <Text
                    position={[0, -1.8, 0.11]}
                    fontSize={0.25}
                    color="#10b981"
                    fontWeight={700}
                    letterSpacing={0.05}
                    anchorX="center"
                    anchorY="middle"
                >
                    CONFERENCE
                </Text>

                <Text
                    position={[0, -2.3, 0.11]}
                    fontSize={0.12}
                    color="#cbd5e1"
                    letterSpacing={0.05}
                    anchorX="center"
                    anchorY="middle"
                >
                    2026 • LONDON, UK
                </Text>

                <mesh ref={slugRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0.05]}>
                    <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
                    <meshPhysicalMaterial
                        roughness={0.08}
                        transmission={1}
                        thickness={0.6}
                        color="#ffffff"
                        transparent
                        opacity={0.94}
                        clearcoat={1}
                        clearcoatRoughness={0.05}
                    />
                </mesh>
            </group>

            <AvatarPhoto ref={photoRef} position={[0, 0.5, -10]} scale={[0, 0, 0]} />

            <group ref={mosaicRef} position={[0, 0, -15]} visible={false}>
                {mosaicItems.map((item) => (
                    <mesh key={item.key} position={item.position}>
                        <planeGeometry args={[2, 2.5]} />
                        <meshBasicMaterial color={item.color} />
                    </mesh>
                ))}
            </group>
        </>
    );
}
