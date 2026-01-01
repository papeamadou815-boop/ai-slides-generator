import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

// For PDF parsing, we'll use a simpler approach for Vercel deployment
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  // Simple PDF text extraction - works with basic PDFs
  const bytes = new Uint8Array(buffer)
  const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  
  // Extract readable text between stream markers
  const matches = text.match(/\(([^)]+)\)/g) || []
  const extracted = matches.map(m => m.slice(1, -1)).join(' ')
  
  // Fallback: just get ASCII text
  if (extracted.length < 100) {
    return text.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim()
  }
  return extracted.replace(/\s+/g, ' ').trim()
}

async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  // DOCX is a zip file with XML content
  const text = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(buffer))
  // Extract text from XML tags
  const matches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || []
  return matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ')
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const formData = await request.formData()
    const prompt = formData.get('prompt') as string
    const numSlides = parseInt(formData.get('numSlides') as string) || 5
    const file = formData.get('file') as File | null

    let contentToProcess = prompt || ''

    // Extract text from uploaded file
    if (file) {
      const buffer = await file.arrayBuffer()
      
      if (file.name.endsWith('.pdf')) {
        const extractedText = await extractTextFromPDF(buffer)
        contentToProcess = extractedText.slice(0, 10000) // Limit text length
      } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        const extractedText = await extractTextFromDocx(buffer)
        contentToProcess = extractedText.slice(0, 10000)
      }

      if (!contentToProcess || contentToProcess.length < 50) {
        contentToProcess = prompt || 'Crea una presentazione generica basata sul documento caricato'
      }
    }

    if (!contentToProcess) {
      return NextResponse.json(
        { error: 'Fornisci un prompt o carica un documento' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Generate demo slides without AI
      const demoSlides = generateDemoSlides(contentToProcess, numSlides)
      
      const presentation = await prisma.presentation.create({
        data: {
          title: contentToProcess.slice(0, 50) + (contentToProcess.length > 50 ? '...' : ''),
          description: 'Presentazione generata (demo mode)',
          slides: demoSlides,
          userId: session.user.id,
        },
      })

      return NextResponse.json(presentation)
    }

    // Use OpenAI to generate slides
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Sei un esperto nella creazione di presentazioni. Genera esattamente ${numSlides} slide in formato JSON.
          Ogni slide deve avere:
          - title: titolo breve e impattante
          - content: array di 3-5 punti chiave (stringhe brevi e concise)
          
          Rispondi SOLO con un array JSON valido, senza altro testo.`
        },
        {
          role: 'user',
          content: `Crea una presentazione su: ${contentToProcess.slice(0, 3000)}`
        }
      ],
      temperature: 0.7,
    })

    let slides
    try {
      const responseText = completion.choices[0].message.content || '[]'
      slides = JSON.parse(responseText)
    } catch (e) {
      slides = generateDemoSlides(contentToProcess, numSlides)
    }

    // Generate title from content
    const title = contentToProcess.slice(0, 50) + (contentToProcess.length > 50 ? '...' : '')

    const presentation = await prisma.presentation.create({
      data: {
        title,
        description: contentToProcess.slice(0, 200),
        slides,
        userId: session.user.id,
      },
    })

    return NextResponse.json(presentation)
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Errore durante la generazione' },
      { status: 500 }
    )
  }
}

function generateDemoSlides(topic: string, numSlides: number) {
  const words = topic.split(' ').filter(w => w.length > 3)
  const keyword = words[0] || 'Presentazione'
  
  const slides = [
    {
      title: `${keyword} - Introduzione`,
      content: [
        'Panoramica dell\'argomento',
        'Obiettivi principali',
        'Punti chiave da esplorare'
      ]
    }
  ]

  for (let i = 1; i < numSlides - 1; i++) {
    slides.push({
      title: `Sezione ${i}: ${words[i] || 'Dettagli'}`,
      content: [
        `Aspetto importante numero ${i}`,
        'Analisi approfondita',
        'Esempi pratici',
        'Considerazioni chiave'
      ]
    })
  }

  slides.push({
    title: 'Conclusioni',
    content: [
      'Riepilogo dei punti principali',
      'Prossimi passi consigliati',
      'Domande e discussione'
    ]
  })

  return slides
}