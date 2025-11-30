import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl')!

// Scene
const scene = new THREE.Scene()

// Texture Loader
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/2.png')

/**
 * Particles
 */
// Geomety 几何体
const particlesGeometry = new THREE.BufferGeometry()

// alphaTest 透明度测试
// 因为有些粒子会挡住粒子，webgl绘制粒子时，会判断该粒子是在前面还是后面，如果粒子在后面，
//  就不会绘制该粒子，从而导致粒子消失

// Material 材质
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.02,
  sizeAttenuation: true,
  // color: new THREE.Color(0xff0000),
  // map: particleTexture,
  alphaMap: textureLoader.load('/textures/particles/2.png'),
  transparent: true,
  // alphaTest: 0.001,
  // depthTest: false, // 深度测试，同一种材质的粒子不会互相遮挡
  depthWrite: false, // 关闭深度写入
  blending: THREE.AdditiveBlending, // 使用加法混合，颜色会叠加，产生发光效果
  vertexColors: true,
})

// Cube
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial()
)
// scene.add(cube)

const particlesCount = 5000
// 顶点数据 每个点有3个坐标值，所以总共有particlesCount * 3个值
const vertices = new Float32Array(particlesCount * 3)
for (let i = 0; i < particlesCount * 3; i++) {
  //   vertices[i] = (Math.random() - 0.5) * 5
  vertices[i] = Math.sin(i) * Math.random() * 2
}

const colors = new Float32Array(particlesCount * 3)
for (let i = 0; i < particlesCount; i++) {
  colors[i * 3 + 0] = Math.random() // Red
  colors[i * 3 + 1] = Math.random() // Green
  colors[i * 3 + 2] = Math.random() // Blue
}
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
particlesGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(vertices, 3)
)
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

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
  // Update particles
  // particles.rotation.y = -elapsedTime * 0.1
  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3
    const x = particlesGeometry.attributes.position.array[i3]
    particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(
      elapsedTime + x
    )
  }

  particlesGeometry.attributes.position.needsUpdate = true

  controls.update()

  renderer.render(scene, camera)
  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}
tick()
