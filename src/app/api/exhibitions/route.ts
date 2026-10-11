import { NextRequest, NextResponse } from 'next/server'
import { getExhibitions } from '@/app/actions/exhibitions'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || undefined
  const city = searchParams.get('city') || undefined
  const category = searchParams.get('category') || undefined

  const exhibitions = await getExhibitions({ search, city, category })
  return NextResponse.json(exhibitions)
}
