import { NextRequest, NextResponse } from 'next/server'
import { askBoothHubAssistant } from '@/lib/gemini'
import { getExhibitions } from '@/app/actions/exhibitions'
import { getExhibitionBooths } from '@/app/actions/bookings'

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json()
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'السؤال مطلوب' }, { status: 400 })
    }

    // Retrieve real exhibitions and booths from database
    const exhibitions = await getExhibitions()
    let booths: any[] = []
    if (exhibitions.length > 0) {
      booths = await getExhibitionBooths(exhibitions[0].id)
    }

    const answer = await askBoothHubAssistant(question, exhibitions, booths)
    return NextResponse.json(answer)
  } catch (err: any) {
    console.error('AI assistant route error:', err)
    return NextResponse.json({ 
      text: 'حدث خطأ مؤقت أثناء معالجة استفسارك، يرجى المحاولة مرة أخرى.' 
    }, { status: 500 })
  }
}
