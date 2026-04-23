import { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import '../../../App.css'


const DUST_VERTEX_SHADER = `
attribute float aSize;
attribute float aTwinkle;
uniform float uPixelRatio;
uniform float uTime;
varying float vTwinkle;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Perspective-correct sprite size so particles feel naturally spatial.
    float perspective = 95.0 / max(0.0001, -mvPosition.z);
    float pulse = 0.8 + 0.2 * sin(uTime * 1.4 + aTwinkle * 9.0);
    gl_PointSize = aSize * perspective * uPixelRatio * pulse;

    vTwinkle = aTwinkle;
    gl_Position = projectionMatrix * mvPosition;
}
`;

const DUST_FRAGMENT_SHADER = `
varying float vTwinkle;

void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    float core = smoothstep(0.46, 0.0, dist);
    float halo = smoothstep(0.5, 0.0, dist * 1.6);

    vec3 base = mix(vec3(0.3, 0.9, 0.75), vec3(0.85, 1.0, 1.0), vTwinkle);
    float alpha = core * 0.8 + halo * 0.25;

    gl_FragColor = vec4(base, alpha);
}
`;

function clamp01(value) {
    return THREE.MathUtils.clamp(value, 0, 1);
}

function easeOutCubic(value) {
    const t = clamp01(value);
    return 1 - Math.pow(1 - t, 3);
}

function pseudoRandom01(seed) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function createGuestCloud(guestCount, minRadius, maxRadius) {
    const positions = new Float32Array(guestCount * 3);
    const scales = new Float32Array(guestCount);
    const axisJitter = new Float32Array(guestCount);

    for (let i = 0; i < guestCount; i += 1) {
        // Uniform random direction in spherical coordinates.
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);

        // Cubic root gives even density in volume instead of overpopulating the shell.
        const radius = lerp(minRadius, maxRadius, Math.cbrt(Math.random()));

        const sinPhi = Math.sin(phi);
        const x = radius * sinPhi * Math.cos(theta) * 1.05;
        const y = radius * sinPhi * Math.sin(theta) * 0.72;
        const z = radius * Math.cos(phi);

        const index = i * 3;
        positions[index] = x;
        positions[index + 1] = y;
        positions[index + 2] = z;

        scales[i] = 0.07 + pseudoRandom01(i + 11) * 0.12;
        axisJitter[i] = pseudoRandom01(i + 31);
    }

    return { positions, scales, axisJitter };
}

function createDustField(dustCount, innerRadius, outerRadius) {
    const positions = new Float32Array(dustCount * 3);
    const sizes = new Float32Array(dustCount);
    const twinkle = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i += 1) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);

        const radius = lerp(innerRadius, outerRadius, Math.cbrt(Math.random()));

        const sinPhi = Math.sin(phi);
        const x = radius * sinPhi * Math.cos(theta) * 1.08;
        const y = radius * sinPhi * Math.sin(theta) * 0.76;
        const z = radius * Math.cos(phi);

        const index = i * 3;
        positions[index] = x;
        positions[index + 1] = y;
        positions[index + 2] = z;

        sizes[i] = 2.2 + pseudoRandom01(i + 61) * 2.8;
        twinkle[i] = pseudoRandom01(i + 83);
    }

    return { positions, sizes, twinkle };
}

function ViralNetwork({
    guestCount = 88,
    minRadius = 3.2,
    maxRadius = 7.2,
    color = '#10b981',
    lineDrawDuration = 3.2,
    spreadFactor = 1.7,
    showLightHelpers = false,
}) {
    const hostRef = useRef(null);
    const guestMeshRef = useRef(null);
    const hostCoreLightRef = useRef(null);
    const dustMaterialRef = useRef(null);
    const linesRef = useRef(null);
    const linePositionsRef = useRef(null);

    const pixelRatio = useMemo(
        () => (typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio, 2)),
        [],
    );

    const guestCloud = useMemo(
        () => createGuestCloud(guestCount, minRadius, maxRadius),
        [guestCount, minRadius, maxRadius],
    );

    const dustField = useMemo(
        () => createDustField(340, maxRadius + 0.4, maxRadius + 5.4),
        [maxRadius],
    );

    const guestGeometry = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
    const hostGeometry = useMemo(() => new THREE.IcosahedronGeometry(1.35, 2), []);

    const dustGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(dustField.positions, 3));
        geometry.setAttribute('aSize', new THREE.BufferAttribute(dustField.sizes, 1));
        geometry.setAttribute('aTwinkle', new THREE.BufferAttribute(dustField.twinkle, 1));
        return geometry;
    }, [dustField]);

    const guestMaterial = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(color),
                roughness: 0.22,
                metalness: 0.08,
                transmission: 0.08,
                thickness: 0.35,
                clearcoat: 1,
                clearcoatRoughness: 0.12,
                ior: 1.45,
                emissive: new THREE.Color('#0f3a31'),
                emissiveIntensity: 0.55,
                iridescence: 0.75,
                iridescenceIOR: 1.3,
                iridescenceThicknessRange: [120, 360],
                flatShading: true,
            }),
        [color],
    );

    const hostMaterial = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: new THREE.Color('#f8fafc'),
                roughness: 0.15,
                metalness: 0.02,
                transmission: 0.1,
                thickness: 1.35,
                clearcoat: 1,
                clearcoatRoughness: 0.08,
                ior: 1.5,
                attenuationColor: new THREE.Color('#d1fae5'),
                attenuationDistance: 2.2,
                emissive: new THREE.Color('#9ff3dd'),
                emissiveIntensity: 0.22,
                iridescence: 1,
                iridescenceIOR: 1.35,
                iridescenceThicknessRange: [140, 520],
                flatShading: true,
            }),
        [],
    );

    const linesGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();

        // 2 vertices per segment (host -> guest).
        const linePositions = new Float32Array(guestCount * 2 * 3);
        const lineColors = new Float32Array(guestCount * 2 * 3);
        const hostColor = new THREE.Color(color);
        const guestColor = new THREE.Color('#b8fff6');

        // Initialize both vertices to host so lines start hidden (zero length).
        for (let i = 0; i < guestCount; i += 1) {
            const start = i * 6;
            linePositions[start] = 0;
            linePositions[start + 1] = 0;
            linePositions[start + 2] = 0;
            linePositions[start + 3] = 0;
            linePositions[start + 4] = 0;
            linePositions[start + 5] = 0;

            // Vertex colors enable subtle host -> guest gradient for each filament.
            lineColors[start] = hostColor.r;
            lineColors[start + 1] = hostColor.g;
            lineColors[start + 2] = hostColor.b;
            lineColors[start + 3] = guestColor.r;
            lineColors[start + 4] = guestColor.g;
            lineColors[start + 5] = guestColor.b;
        }

        const attribute = new THREE.BufferAttribute(linePositions, 3);
        attribute.setUsage(THREE.DynamicDrawUsage);

        geometry.setAttribute('position', attribute);
        geometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
        geometry.computeBoundingSphere();

        return geometry;
    }, [color, guestCount]);

    useEffect(() => {
        if (!guestMeshRef.current) return;

        const dummy = new THREE.Object3D();

        for (let i = 0; i < guestCount; i += 1) {
            const index = i * 3;
            dummy.position.set(
                guestCloud.positions[index],
                guestCloud.positions[index + 1],
                guestCloud.positions[index + 2],
            );

            const baseScale = guestCloud.scales[i];
            dummy.scale.setScalar(baseScale);

            dummy.rotation.set(
                guestCloud.axisJitter[i] * Math.PI,
                guestCloud.axisJitter[(i + 17) % guestCount] * Math.PI,
                guestCloud.axisJitter[(i + 31) % guestCount] * Math.PI,
            );

            dummy.updateMatrix();
            guestMeshRef.current.setMatrixAt(i, dummy.matrix);
        }

        guestMeshRef.current.instanceMatrix.needsUpdate = true;
    }, [guestCloud, guestCount]);

    useEffect(() => {
        if (!showLightHelpers || !hostCoreLightRef.current) return undefined;

        const coreLightHelper = new THREE.PointLightHelper(hostCoreLightRef.current, 0.35, '#a7fff0');
        linesRef.current.parent.add(coreLightHelper);

        return () => {
            linesRef.current.parent.remove(coreLightHelper);
            coreLightHelper.dispose();
        };
    }, [showLightHelpers]);

    useEffect(() => {
        linePositionsRef.current = linesGeometry.attributes.position.array;
    }, [linesGeometry]);

    useFrame((state) => {
        const elapsed = state.clock.elapsedTime;

        if (hostRef.current) {
            // Subtle breathe: tiny scale oscillation keeps the core alive and premium.
            const hostScale = 1 + Math.sin(elapsed * 1.35) * 0.02;
            hostRef.current.scale.setScalar(hostScale);
            hostRef.current.rotation.y = elapsed * 0.15;
            hostRef.current.rotation.x = Math.sin(elapsed * 0.2) * 0.1;
        }

        if (hostCoreLightRef.current) {
            // Controlled breathing intensity for the positive energetic heart glow.
            hostCoreLightRef.current.intensity = 2.2 + Math.sin(elapsed * 1.6) * 0.35;
        }

        if (dustMaterialRef.current) {
            dustMaterialRef.current.uniforms.uTime.value = elapsed;
        }

        if (!linesRef.current || !linePositionsRef.current) return;

        const flow = clamp01(elapsed / Math.max(0.0001, lineDrawDuration));

        // "Draw head" travels across line indices. spreadFactor > 1 means multiple
        // lines can be in-flight at once, creating a cascading viral spread effect.
        const drawHead = flow * guestCount * spreadFactor;

        const linePositions = linePositionsRef.current;

        for (let i = 0; i < guestCount; i += 1) {
            // localProgress is 0..1 for each line i as the draw head reaches it.
            const localProgress = clamp01(drawHead - i);
            const eased = easeOutCubic(localProgress);

            const guestOffset = i * 3;
            const lineOffset = i * 6;

            // Start point remains at host origin.
            linePositions[lineOffset] = 0;
            linePositions[lineOffset + 1] = 0;
            linePositions[lineOffset + 2] = 0;

            // End point lerps from host to guest with eased progress.
            linePositions[lineOffset + 3] = guestCloud.positions[guestOffset] * eased;
            linePositions[lineOffset + 4] = guestCloud.positions[guestOffset + 1] * eased;
            linePositions[lineOffset + 5] = guestCloud.positions[guestOffset + 2] * eased;
        }

        linesRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <group>
            {/* Studio key light defines the front/top planes of the host crystal. */}
            <directionalLight position={[5, 10, 5]} intensity={1.5} color="#f0fdf4" />

            {/* Rim light from behind to keep silhouette readable on dark backgrounds. */}
            <directionalLight position={[-6, -5, -8]} intensity={0.8} color="#8ee8d6" />

            <ambientLight intensity={0.22} color="#d1fff5" />

            <mesh ref={hostRef} geometry={hostGeometry} material={hostMaterial} frustumCulled={false} />

            <pointLight
                ref={hostCoreLightRef}
                position={[0, 0, 0]}
                intensity={2.2}
                distance={10}
                decay={1.6}
                color="#8bffde"
            />

            <instancedMesh
                ref={guestMeshRef}
                args={[guestGeometry, guestMaterial, guestCount]}
                frustumCulled={false}
            />

            {/* Background dust preserves the subtle starry atmosphere with controlled twinkle. */}
            <points geometry={dustGeometry} frustumCulled={false}>
                <shaderMaterial
                    ref={dustMaterialRef}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    vertexShader={DUST_VERTEX_SHADER}
                    fragmentShader={DUST_FRAGMENT_SHADER}
                    uniforms={{
                        uTime: { value: 0 },
                        uPixelRatio: { value: pixelRatio },
                    }}
                />
            </points>

            <lineSegments ref={linesRef} geometry={linesGeometry} frustumCulled={false}>
                <lineBasicMaterial
                    vertexColors
                    transparent
                    opacity={0.74}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    depthTest={false}
                />
            </lineSegments>
        </group>
    );
}

export default memo(ViralNetwork);
