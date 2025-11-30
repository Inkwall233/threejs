import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 400 })

// Canvas
const canvas: HTMLElement = document.querySelector('canvas.webgl')!

// Scene
const scene = new THREE.Scene()

// Texture Loader
const textureLoader = new THREE.TextureLoader()

/**
 * Galaxy
 */

// galaxy parameters
const parameters = {
  count: 10000,
  size: 0.02,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  inColor: '#ff6030',
  outColor: '#1b3984',
}

let geometry: THREE.BufferGeometry | null = null
let galaxyMaterial: THREE.PointsMaterial | null = null
let points: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> | null =
  null

const generateGalaxy = () => {
  if (points !== null) {
    geometry!.dispose()
    galaxyMaterial!.dispose()
    scene.remove(points)
  }

  // 1. create geometry
  geometry = new THREE.BufferGeometry()
  const vertices = new Float32Array(parameters.count * 3)
  const colors = new Float32Array(parameters.count * 3)
  // 2. create material
  galaxyMaterial = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  })
  const inColor = new THREE.Color(parameters.inColor)
  const outColor = new THREE.Color(parameters.outColor)

  // 3. create points
  for (let i = 0; i < parameters.count; i++) {
    const radius = Math.random() * parameters.radius

    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2
    const spinAngle = radius * parameters.spin

    const randomX = Math.random() * parameters.randomness
    const randomY = Math.random() * parameters.randomness
    const randomZ = Math.random() * parameters.randomness

    const x = radius * Math.cos(branchAngle + spinAngle) + randomX
    const y = randomY
    const z = radius * Math.sin(branchAngle + spinAngle) + randomZ
    vertices[i * 3] = x
    vertices[i * 3 + 1] = y
    vertices[i * 3 + 2] = z

    /**
     * Color
     */
    const mixedColor = inColor.clone()
    mixedColor.lerp(outColor, radius / parameters.radius)

    colors[i * 3 + 0] = mixedColor.r
    colors[i * 3 + 1] = mixedColor.g
    colors[i * 3 + 2] = mixedColor.b
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  points = new THREE.Points(geometry, galaxyMaterial)

  scene.add(points)
}

generateGalaxy()

gui
  .add(parameters, 'count')
  .min(100)
  .max(100000)
  .step(100)
  .onFinishChange(generateGalaxy)

gui
  .add(parameters, 'size')
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy)

gui
  .add(parameters, 'radius')
  .min(0.1)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy)

gui
  .add(parameters, 'branches')
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'spin')
  .min(-5)
  .max(5)
  .step(0.001)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'randomness')
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxy)

// Size
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}
console.log(sizes)

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  // console.log(elapsedTime)
  points!.rotation.y = elapsedTime * 0.1
  controls.update()

  renderer.render(scene, camera)
  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}
tick()
