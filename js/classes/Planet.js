import * as THREE from 'three';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';

class Planet {
    constructor(color, sphereRadius, orbitRadius, orbitSpeed, initialOrbitAngle=Math.random() * Math.PI * 2) {
        this.geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
        console.log(color);
        this.color = color;
        this.material = new THREE.MeshStandardMaterial({ color: color }); // MeshBasicMaterial
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = orbitSpeed;
        this.initialOrbitAngle = initialOrbitAngle;
        this.angle = initialOrbitAngle;
    
        this.mesh.position.x = Math.cos(this.angle) * this.orbitRadius;
        this.mesh.position.z = Math.sin(this.angle) * this.orbitRadius;
    
        this.mesh.rotation.y = Math.random() * Math.PI * 2;

        this.points = [];
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

    update(alpha) {
        // Update the angle with the custom rotation speed
        if(this.angle >= 4 * Math.PI){
            this.angle -= 2 * Math.PI;
        }
        this.angle += this.orbitSpeed;

        // Calculate the new position of the planet on the orbit
        // this.mesh.position.set(newPosition);
        this.mesh.position.x = Math.cos(this.angle) * this.orbitRadius;
        this.mesh.position.z = Math.sin(this.angle) * this.orbitRadius;

        // Rotate the entire orbit around the x-axis
        // const orbitRotationX = 0.01; // Adjust the rotation speed as needed
        // this.mesh.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), orbitRotationX);

        // Rotate the sphere to make it face the center
        // this.mesh.rotation.y += 0.02; // You can adjust this if needed

        // Update the orbit path
        const point = [this.mesh.position.x, this.mesh.position.y, this.mesh.position.z];
        this.points.push(point);

        console.log();

        if(this.LINE_HALF_FLAG){
            this.points.shift();

        } else {
            if (this.angle - this.initialOrbitAngle > Math.PI*1.3) {
                console.log("Sphere has moved halfway around the orbit!");
                this.LINE_HALF_FLAG = true;
            }
        }

        // const existingColor = this.lineMaterial.color.getHSL();
        // console.log(alpha);
        // console.log(this.lineMaterial.color.r);
        this.lineMaterial.opacity = alpha;
        // this.lineMaterial.color = new THREE.Color(this.lineMaterial.color.r, this.lineMaterial.color.g, this.lineMaterial.color.b, alpha);
        this.lineGeometry.setPoints(this.points.flat());
    }
}

export { Planet };


//Dodac maksymalna ilosc punktow i dodac rotacje po y w planetach
// glow slonca i dodac zmiane rotacji orbity po osi x y zeby nie wszystkie byly tak samo aligned