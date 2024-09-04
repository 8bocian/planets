import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from 'three.meshline';

class Planet {
    constructor(color, sphereRadius, orbitRadius, orbitSpeed, initialOrbitAngle=Math.random() * Math.PI * 2) {
        this.geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
        this.color = color;
        this.material = new THREE.MeshStandardMaterial({ color: color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = orbitSpeed;
        this.initialOrbitAngle = initialOrbitAngle;
        this.angle = initialOrbitAngle;
    
        this.mesh.position.x = Math.cos(this.angle) * this.orbitRadius;
        this.mesh.position.z = Math.sin(this.angle) * this.orbitRadius;
    
        this.mesh.rotation.y = Math.random() * Math.PI * 2;

        this.points = [[this.mesh.position.x, this.mesh.position.y, this.mesh.position.z]];
        this.lineGeometry = new MeshLine();
        this.lineGeometry.setPoints(this.points.flat());
        this.lineMaterial = new MeshLineMaterial({ color: color, lineWidth: 0.3, transparent: true });
        this.line = new THREE.Mesh(this.lineGeometry, this.lineMaterial);
        this.initialPosition = new THREE.Vector3();
        this.initialPosition.copy(this.mesh.position);
        
        this.LINE_HALF_FLAG = false;
    }

    getAngle(){
        return this.angle;
    }

    getInitialAngle(){
        return this.initialOrbitAngle;
    }

    update(alpha, addPath) {
        // Update the angle with the custom rotation speed
        if(this.angle >= 4 * Math.PI){
            this.angle -= 2 * Math.PI;
        }
        this.angle += this.orbitSpeed;

        this.mesh.position.x = Math.cos(this.angle) * this.orbitRadius;
        this.mesh.position.z = Math.sin(this.angle) * this.orbitRadius;

        // Rotate the entire orbit around the x-axis
        // const orbitRotationX = 0.01; // Adjust the rotation speed as needed
        // this.mesh.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), orbitRotationX);

        // Rotate the sphere to make it face the center
        // this.mesh.rotation.y += 0.002; // You can adjust this if needed

        // Update the orbit path
        // if()
        // console.log(this.mesh.position.distanceTo(new THREE.Vector3(this.points[-1])));
        if(addPath && this.mesh.position.distanceTo(new THREE.Vector3(this.points[-1])) !== 0) {
            const point = [this.mesh.position.x, this.mesh.position.y, this.mesh.position.z];
            this.points.push(point);
            // if(this.mesh.position.x == 0, this.mesh.position.y == 0, this.mesh.position.z == 0)
            // console.log(this.mesh.position, this.points.length);
    
            if(this.LINE_HALF_FLAG){
                this.points.shift();
    
            } else {
                if (this.angle - this.initialOrbitAngle > Math.PI*1.3) {
                    console.log("Sphere has moved halfway around the orbit!");
                    this.LINE_HALF_FLAG = true;
                }
            }
        }


        this.lineMaterial.opacity = alpha;
        this.lineGeometry.setPoints(this.points.flat());
    }
}

export { Planet };