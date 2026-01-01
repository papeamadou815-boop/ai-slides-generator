import Link from 'next/link'
import { FiZap, FiUpload, FiLayout, FiUsers } from 'react-icons/fi'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <FiZap className="w-8 h-8 text-primary-600" />
          <span className="text-xl font-bold text-gray-800">AI Slides</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="btn-secondary">
            Accedi
          </Link>
          <Link href="/register" className="btn-primary">
            Registrati
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 py-24 text-center bg-gradient-to-br from-primary-50 to-white">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Crea Presentazioni Straordinarie con l&apos;IA
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Genera slide professionali in pochi secondi. Basta un prompt testuale o carica un documento.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/register" className="btn-primary text-lg px-8 py-3">
            Inizia Gratis
          </Link>
          <Link href="/login" className="btn-secondary text-lg px-8 py-3">
            Accedi
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Funzionalità
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="card text-center">
            <FiZap className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Generazione IA</h3>
            <p className="text-gray-600">
              Scrivi cosa vuoi presentare e l&apos;IA crea le slide per te.
            </p>
          </div>
          <div className="card text-center">
            <FiUpload className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Carica Documenti</h3>
            <p className="text-gray-600">
              Carica PDF o Word e trasformali in presentazioni.
            </p>
          </div>
          <div className="card text-center">
            <FiLayout className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Dashboard Personale</h3>
            <p className="text-gray-600">
              Salva, modifica e gestisci tutte le tue presentazioni.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-8 text-center">
        <p>&copy; 2026 AI Slides Generator. Tutti i diritti riservati.</p>
      </footer>
    </main>
  )
}