import { NextRequest, NextResponse } from 'next/server'
import { createBooking, getUserBookings } from '@/app/actions/bookings'

export async function GET() {
  const bookings = await getUserBookings()
  return NextResponse.json(bookings)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await createBooking(body)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
