'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import { FiZap, FiArrowLeft, FiUpload, FiFile, FiX, FiSend } from 'react-icons/fi'

export default function GeneratePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [numSlides, setNumSlides] = useState(5)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!prompt && !file) {
      toast.error('Inserisci un prompt o carica un documento')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('prompt', prompt)
      formData.append('numSlides', numSlides.toString())
      if (file) {
        formData.append('file', file)
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la generazione')
      }

      toast.success('Presentazione generata!')
      router.push('/presentation/' + data.id)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">
            <FiArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <FiZap className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-800">AI Slides</span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Crea una Nuova Presentazione
        </h1>
        <p className="text-gray-600 mb-8">
          Descrivi cosa vuoi presentare o carica un documento da trasformare in slide.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prompt Input */}
          <div className="card">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              Descrivi la tua presentazione
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="input-field min-h-[150px] resize-none"
              placeholder="Es: Crea una presentazione sul marketing digitale per una startup, includendo strategie social media, SEO e advertising..."
            />
          </div>

          {/* File Upload */}
          <div className="card">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              Oppure carica un documento
            </label>
            
            {file ? (
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiFile className="w-8 h-8 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-2 text-gray-500 hover:text-red-500"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                <input {...getInputProps()} />
                <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  {isDragActive ? 'Rilascia il file qui...' : 'Trascina un file o clicca per selezionarlo'}
                </p>
                <p className="text-sm text-gray-400">
                  Formati supportati: PDF, DOCX, DOC
                </p>
              </div>
            )}
          </div>

          {/* Number of Slides */}
          <div className="card">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              Numero di slide
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="3"
                max="15"
                value={numSlides}
                onChange={(e) => setNumSlides(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-xl font-bold text-primary-600 w-8 text-center">
                {numSlides}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (!prompt && !file)}
            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Generazione in corso...
              </>
            ) : (
              <>
                <FiSend />
                Genera Presentazione
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  )
}