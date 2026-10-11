import { NextRequest, NextResponse } from 'next/server'
import { recommendBoothsAI } from '@/lib/gemini'
import { getExhibitions } from '@/app/actions/exhibitions'
import { getExhibitionBooths } from '@/app/actions/bookings'

export async function POST(req: NextRequest) {
  try {
    const { activityType, city, budget, space } = await req.json()
    const exhibitions = await getExhibitions()
    let booths: any[] = []
    if (exhibitions.length > 0) {
      booths = await getExhibitionBooths(exhibitions[0].id)
    }

    const result = await recommendBoothsAI(
      { activityType, city, budget, space },
      exhibitions,
      booths
    )
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
