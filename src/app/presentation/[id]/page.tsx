'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiZap, FiArrowLeft, FiChevronLeft, FiChevronRight, FiDownload } from 'react-icons/fi'

interface Slide {
  title: string
  content: string[]
  notes?: string
}

interface Presentation {
  id: string
  title: string
  description: string | null
  slides: Slide[]
  createdAt: string
}

export default function PresentationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session && params.id) {
      fetchPresentation()
    }
  }, [session, params.id])

  const fetchPresentation = async () => {
    try {
      const res = await fetch('/api/presentations/' + params.id)
      if (!res.ok) throw new Error('Presentazione non trovata')
      const data = await res.json()
      setPresentation(data)
    } catch (error) {
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    if (presentation && currentSlide < presentation.slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide()
      if (e.key === 'ArrowLeft') prevSlide()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide, presentation])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!presentation) return null

  const slide = presentation.slides[currentSlide]

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <nav className="flex justify-between items-center px-6 py-3 bg-gray-800">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <FiZap className="w-6 h-6 text-primary-500" />
            <span className="text-white font-medium">{presentation.title}</span>
          </div>
        </div>
        <div className="text-gray-400">
          Slide {currentSlide + 1} di {presentation.slides.length}
        </div>
      </nav>

      {/* Slide Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-5xl aspect-video bg-white rounded-2xl shadow-2xl p-12 flex flex-col">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            {slide.title}
          </h2>
          <ul className="flex-1 space-y-4">
            {slide.content.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary-500 mt-3 flex-shrink-0"></span>
                <span className="text-xl text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* Navigation */}
      <div className="flex justify-center items-center gap-4 py-6">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="p-3 rounded-full bg-gray-800 text-white disabled:opacity-30 hover:bg-gray-700 transition-colors"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>
        
        {/* Slide indicators */}
        <div className="flex gap-2">
          {presentation.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={\`w-3 h-3 rounded-full transition-colors \${
                index === currentSlide ? 'bg-primary-500' : 'bg-gray-600 hover:bg-gray-500'
              }\`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === presentation.slides.length - 1}
          className="p-3 rounded-full bg-gray-800 text-white disabled:opacity-30 hover:bg-gray-700 transition-colors"
        >
          <FiChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}