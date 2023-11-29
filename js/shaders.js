const perlinNoiseShader = {
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform float time;
        
        // Perlin noise function
        float noise(vec2 p) {
            return sin(p.x * 10.0 + p.y * 10.0) * 0.5 + 0.5;
        }

        void main() {
            vec2 uv = vUv * 5.0;  // Adjust the frequency by changing the multiplier
            float n = noise(uv + time);
            gl_FragColor = vec4(vec3(n), 1.0);
        }
    `
};

export {perlinNoiseShader}