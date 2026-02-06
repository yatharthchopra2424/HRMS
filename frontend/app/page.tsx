'use client'

import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei'
import { useRouter } from 'next/navigation'
import * as THREE from 'three'
import { ArrowRight, Users, Calendar, TrendingUp } from 'lucide-react'

// Animated floating sphere
function FloatingSphere({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = React.useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.3
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <Sphere
      ref={meshRef}
      args={[1, 64, 64]}
      scale={hovered ? scale * 1.2 : scale}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  )
}

// Multiple floating spheres
function FloatingObjects() {
  return (
    <>
      <FloatingSphere position={[-3, 0, -2]} color="#0ea5e9" scale={1.2} />
      <FloatingSphere position={[3, 1, -3]} color="#8b5cf6" scale={0.8} />
      <FloatingSphere position={[0, -2, -4]} color="#10b981" scale={1} />
      <FloatingSphere position={[-2, 2, -1]} color="#f59e0b" scale={0.6} />
      <FloatingSphere position={[2, -1, -2]} color="#ef4444" scale={0.7} />
    </>
  )
}

export default function HomePage() {
  const router = useRouter()

  const features = [
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Add, view, and manage employee records efficiently',
    },
    {
      icon: Calendar,
      title: 'Attendance Tracking',
      description: 'Mark and monitor daily attendance with ease',
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      description: 'View insights and attendance statistics',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Three.js Background */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} color="#8b5cf6" intensity={0.5} />
          <FloatingObjects />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="container mx-auto px-6 py-6">
          <nav className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-500 bg-clip-text text-transparent">
              HRMS Lite
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg hover:bg-opacity-20 transition-all"
            >
              Go to Dashboard
            </button>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 flex-1 flex flex-col justify-center items-center text-center">
          <div className="max-w-4xl space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Modern HR Management
              <span className="block bg-gradient-to-r from-primary-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
              Streamline your employee management and attendance tracking with our lightweight, powerful HRMS solution.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <button
                onClick={() => router.push('/dashboard')}
                className="group px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl hover:from-primary-600 hover:to-primary-800 transition-all shadow-lg hover:shadow-primary-500/50 flex items-center space-x-2 text-lg font-semibold"
              >
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => window.open('https://github.com', '_blank')}
                className="px-8 py-4 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl hover:bg-opacity-20 transition-all text-lg font-semibold"
              >
                View on GitHub
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-6 hover:bg-opacity-10 transition-all hover:scale-105 hover:shadow-xl"
                >
                  <div className="bg-gradient-to-br from-primary-500 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-6 text-center text-gray-400 text-sm">
          <p>Built with Next.js, FastAPI, and Supabase • © 2026 HRMS Lite</p>
        </footer>
      </div>
    </div>
  )
}
