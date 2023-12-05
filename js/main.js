import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import gsap from "gsap";
import '../style.css';
import {Planet} from './classes/Planet.js';
// import { perlinNoiseShader } from './shaders';
import {generateRandomValues, generateIntenseColor} from './utils.js'
import starsTexture from '../assets/textures/stars_sqr.jpg';
import * as TWEEN from '@tweenjs/tween.js';
import backgroundTexture from '../assets/textures/galaxy1.png'; // Replace with the path to your background image

import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {OutputPass} from "three/examples/jsm/postprocessing/OutputPass.js";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass.js";

const vertexshader = document.getElementById('vertexshader');
const fragmentshader = document.getElementById('fragmentshader');
const menuToggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');
const content = document.getElementById("content");
const display = document.getElementById('webgl');
const hoverTextElement = document.getElementById('hoverText');
const miniDisplayText = document.getElementById('mini-display-text');
const miniDisplayImage = document.getElementById('mini-display-image');

//CONSTS
const size = {
  width: window.innerWidth,
  height: window.innerHeight
}

const BLOOM_SCENE = 1;

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

let currentQuaternion = new THREE.Quaternion();
let targetQuaternion = new THREE.Quaternion();

let rotationInterpolationFactor = 0.01;
let rotationInterpolationSpeed = 0.05;

let zoomInterpolationFactor = 0.01;
let zoomInterpolationSpeed = 0.05;

const clock = new THREE.Clock();

let followedObject = null;
var targetPosition = new THREE.Vector3(0, 10, -15);

let projectNum = null;

let info = {};

let menuOn = false;
let events = true;

menu.addEventListener("mouseenter", () => (events = false));
menu.addEventListener("mouseleave", () => (events = true));


await fetch('js/data.json')
  .then(response => response.json())
  .then(data => {
    info = data;
  })
  .catch(error => {
    console.error('Error loading the JSON file: ', error);
});

// content.innerHTML = info.description.name + info.description.description;

//Scene
const scene = new THREE.Scene();

//Main Group
const group = new THREE.Group();

//Resize
window.addEventListener('resize', () => {
  //Update sizes
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  //Update camera
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);
  bloomComposer.setSize(size.width, size.height);
  finalComposer.setSize(size.width, size.height);

  menu.style.transition = '0s';

  if (menuOn) {
    showMenu();
  } else {
    hideMenu();
  }
})

//Camera
const camera = new THREE.PerspectiveCamera(45, size.width/size.height, 0.001, 10000);
camera.useQuaternion = true;
camera.position.set(0, 100, 100);
camera.lookAt(0, 0, 0);
group.add(camera)


//Render
const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(2);
renderer.setClearColor(0x000000, 0.0);
renderer.autoClear = false; // Make sure autoClear is set to false
renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.render(scene, camera);

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(size.width, size.height),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = 0;
bloomPass.strength = 0.9;
bloomPass.radius = 0.1;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(size.width, size.width);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const mixPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      baseTexture: {value: null},
      bloomTexture: {value: bloomComposer.renderTarget2.texture}
    },
    vertexShader: vertexshader.textContent,
    fragmentShader: fragmentshader.textContent,
  }), 'baseTexture'
);

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderScene);
finalComposer.addPass(mixPass);

const outputPass = new OutputPass();
finalComposer.addPass(outputPass);

const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);
const darkMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
const materials = {};

function nonBloomed(obj) {
  if(obj.isMesh && bloomLayer.test(obj.layers) === false) {
    materials[obj.uuid] = obj.material;
    obj.material = darkMaterial;
  }
}

function restoreMaterial(obj) {
  if(materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }
}


renderer.setSize(size.width, size.height);
bloomComposer.setSize(size.width, size.height);
finalComposer.setSize(size.width, size.height);

//Lighting

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
group.add(ambientLight);

////Planetary System

//Sun
const sun = new Planet("#FDB813", 4, 0, 0);
sun.mesh.layers.toggle(BLOOM_SCENE);
group.add(sun.mesh);

//Planets
var planets = [sun];
const nPlanets =  info.projects.length;//5;
// const nPlanets = 8;
const orbits = generateRandomValues(nPlanets, 15, 15, 30);

for(let i=0; i<nPlanets; i++){
  let color = generateIntenseColor();
  let planetRadius = 2;

  let orbitRadius = orbits[i];

  let orbitSpeed = Math.max((Math.random() * 0.4) / orbitRadius, 0.004)/10;
  const planet = new Planet(color, planetRadius, orbitRadius, orbitSpeed);
  planets.push(planet);
  planet.mesh.layers.toggle(BLOOM_SCENE);

  group.add(planet.mesh);
  group.add(planet.line);
}

//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.autoRotate = false;
controls.target.set(0, 0, 0);

//Actions
function updateMiniDisplay(){
  if (projectNum < 0){
    hoverTextElement.innerHTML = info.description.name + info.description.description;
  } else {
    hoverTextElement.innerHTML = info.projects[projectNum].name + info.projects[projectNum].description;
  }
}

window.addEventListener('mousemove', (event) => {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  if(events){
    raycaster.setFromCamera(mouse, camera);
  
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0){
      display.style.cursor = 'pointer';
      const hoveredObject = intersects[0].object;

      // Position the text element based on the mouse coordinates.

      projectNum = planets.findIndex(planet => planet.mesh === hoveredObject)-1;

      if (projectNum < 0){
        miniDisplayText.innerHTML = info.description.name + info.description.short_description;
        miniDisplayImage.innerHTML = info.description.image;
      } else {
        miniDisplayText.innerHTML = info.projects[projectNum].name + info.projects[projectNum].short_description;
        miniDisplayImage.innerHTML = info.projects[projectNum].image;
      }

      hoverTextElement.style.display = 'block';

      hoverTextElement.style.left = event.clientX - 4 + 'px';
      hoverTextElement.style.top = event.clientY - 8 - hoverTextElement.clientHeight + 'px';

      if (event.clientX + hoverTextElement.clientWidth > window.innerWidth) {
        hoverTextElement.style.left = (event.clientX - hoverTextElement.clientWidth + 4) + 'px';
      }

      // Check and adjust for the bottom overflow
      if (event.clientY - hoverTextElement.clientHeight < 0) {
        hoverTextElement.style.top = (event.clientY + 20) + 'px';
      }

    } else if (intersects.length == 0){
      projectNum = null;
      display.style.cursor = 'default';
      hoverTextElement.style.display = 'none';

    }
  }
});

menuToggle.addEventListener('click', toggleMenu);

function toggleMenu() {
  if (menu.style.marginLeft === '0px') {
    hideMenu();
  } else {
    showMenu();
  }
}

function showMenu() {
  menu.style.transition = '1s';
  menu.style.marginLeft = '0px';
  menuOn = true;
  menuToggle.style.transform = 'rotate(180deg)';
}

function hideMenu() {
  menu.style.transition = '1s';
  var width = content.clientWidth;
  var computedStyles = window.getComputedStyle(content);
  var marginRight = parseFloat(computedStyles.marginRight);
  menu.style.marginLeft = `-${width + marginRight}px`;
  menuOn = false;
  menuToggle.style.transform = 'rotate(0)';
}

let clicked = 0;

window.addEventListener('click', () => {
  if(events){
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0){
      const obj = intersects[0].object;
      if(obj !== followedObject){
        clicked = 4;
        showMenu();
        
        // camera.lookAt(followedObject);

        followedObject = obj;
        followedObject.attach(camera);

        // Reset interpolation factors when changing the followed object
        rotationInterpolationFactor = 0.01;
        zoomInterpolationFactor = 0.01;
        // toggleMenu();
        if (projectNum < 0){
          // content.innerHTML = info.description.name + info.description.description;
        } else {
          // content.innerHTML = info.projects[projectNum]['name'] + info.projects[projectNum]['description'];
        }
      }

    }
  }
});

window.addEventListener('keydown', (event) => {
  if(event.keyCode === 27) {
    followedObject = sun.mesh;
    followedObject.attach(camera);
    
    rotationInterpolationFactor = 0.01;
    zoomInterpolationFactor = 0.01;
  }
});


//Add
scene.add(group);


toggleMenu();
toggleMenu();

const transparent_distance_length = 100;
const transparent_distance_min = 50;
const transparent_dirance = transparent_distance_length + transparent_distance_min;
let fpss = [];

// Add scroll event listener
const loop = () => {  
  window.requestAnimationFrame(loop);
  controls.update();

  let alpha = 1;

  while(clicked > 0){
    clicked --;
    // console.log(camera.quaternion);

  }

  if(followedObject){
    var target = new THREE.Vector3(); // create once an reuse it

    camera.getWorldPosition( target );

    var distance = target.distanceTo(followedObject.position);

    if (distance < transparent_dirance){
      alpha = Math.max(Math.min((((distance-transparent_distance_min)/transparent_distance_length)), 1), 0);
    }

    if (!Number.isInteger(rotationInterpolationFactor)){
      currentQuaternion.copy(camera.quaternion);
      camera.lookAt(followedObject.position);
      targetQuaternion.copy(camera.quaternion);

      camera.quaternion.copy(currentQuaternion);
      

      rotationInterpolationFactor += rotationInterpolationSpeed;
      rotationInterpolationFactor = Math.min(rotationInterpolationFactor, 1);
      
      camera.quaternion.copy(currentQuaternion).slerp(targetQuaternion, rotationInterpolationFactor);

    } else {
      if (zoomInterpolationFactor < 1){
        zoomInterpolationFactor += zoomInterpolationSpeed;
        camera.position.lerp(targetPosition, zoomInterpolationFactor);
        
      }
      camera.lookAt(followedObject.position);

      }

  }


  planets.forEach(planet => {
    planet.update(alpha, fpss.length%5==0);
  });

  const delta = clock.getDelta();
  const fps = 1 / delta;
  if(fps !== Infinity){
    fpss.push(fps);
  }
  if(fpss.length%60==0){
    let averageFps = fpss.reduce((a, b) => a + b, 0) / fpss.length;
    // console.log(`FPS mea: ${averageFps}`)
    fpss = [];
  }

  TWEEN.update();
  scene.traverse(nonBloomed);
  bloomComposer.render();
  scene.traverse(restoreMaterial);

  finalComposer.render();

}

loop()

const tl = gsap.timeline({defaults: {duration: 3}});
planets.forEach(children => {
  tl.fromTo(children.mesh.scale, {z: 0, x: 0, y: 0}, {z: 1, x: 1, y: 1}, 0)
});


// NAPRAWIC TE PIERDOLONE SLERPY CO SIE OD SLONCA ZACZYNAJA, dodac hovera