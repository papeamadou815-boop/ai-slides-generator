import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const presentations = await prisma.presentation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(presentations)
  } catch (error) {
    console.error('Error fetching presentations:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero delle presentazioni' },
      { status: 500 }
    )
  }
}