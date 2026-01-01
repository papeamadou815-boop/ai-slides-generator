'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FiZap, FiPlus, FiTrash2, FiEdit, FiLogOut, FiClock, FiLayout } from 'react-icons/fi'

interface Presentation {
  id: string
  title: string
  description: string | null
  createdAt: string
  slides: any[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchPresentations()
    }
  }, [session])

  const fetchPresentations = async () => {
    try {
      const res = await fetch('/api/presentations')
      const data = await res.json()
      setPresentations(data)
    } catch (error) {
      toast.error('Errore nel caricamento delle presentazioni')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa presentazione?')) return

    try {
      const res = await fetch(\`/api/presentations/\${id}\`, { method: 'DELETE' })
      if (res.ok) {
        setPresentations(presentations.filter(p => p.id !== id))
        toast.success('Presentazione eliminata')
      }
    } catch (error) {
      toast.error('Errore durante l\'eliminazione')
    }
  }

  if (status === 'loading' || loading) {
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
        <div className="flex items-center gap-2">
          <FiZap className="w-8 h-8 text-primary-600" />
          <span className="text-xl font-bold text-gray-800">AI Slides</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Ciao, {session?.user?.name || session?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <FiLogOut />
            Esci
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Le tue Presentazioni</h1>
          <Link href="/generate" className="btn-primary flex items-center gap-2">
            <FiPlus />
            Nuova Presentazione
          </Link>
        </div>

        {/* Presentations Grid */}
        {presentations.length === 0 ? (
          <div className="text-center py-16">
            <FiLayout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Nessuna presentazione
            </h2>
            <p className="text-gray-500 mb-6">
              Crea la tua prima presentazione con l'IA
            </p>
            <Link href="/generate" className="btn-primary">
              Crea Presentazione
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presentations.map((presentation) => (
              <div key={presentation.id} className="card hover:shadow-xl transition-shadow">
                <div className="slide-preview mb-4 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50">
                  <FiLayout className="w-12 h-12 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {presentation.title}
                </h3>
                {presentation.description && (
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                    {presentation.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <FiClock className="w-4 h-4" />
                  {new Date(presentation.createdAt).toLocaleDateString('it-IT')}
                  <span className="ml-2">{presentation.slides?.length || 0} slide</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={\`/presentation/\${presentation.id}\`}
                    className="btn-primary flex-1 text-center text-sm"
                  >
                    Visualizza
                  </Link>
                  <button
                    onClick={() => handleDelete(presentation.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}