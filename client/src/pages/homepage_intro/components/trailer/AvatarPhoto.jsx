import React from 'react';

const AvatarPhoto = React.forwardRef((props, ref) => (
    <group ref={ref} {...props}>
        <mesh position={[0, 0, 0]}>
            <planeGeometry args={[2.5, 2.5]} />
            <meshBasicMaterial color="#10b981" />
        </mesh>

        <mesh position={[0, 0.3, 0.01]}>
            <circleGeometry args={[0.5, 32]} />
            <meshBasicMaterial color="#ffffff" />
        </mesh>

        <mesh position={[0, -0.8, 0.01]}>
            <circleGeometry args={[0.9, 32, 0, Math.PI]} />
            <meshBasicMaterial color="#ffffff" />
        </mesh>
    </group>
));

AvatarPhoto.displayName = 'AvatarPhoto';

export default AvatarPhoto;
