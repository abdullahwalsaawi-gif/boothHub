import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { title, category, city } = await req.json()
    const suggestion = `معرض ${title || 'المعرض'} في ${city || 'المملكة'} يمثل فرصة استثنائية لشركات قطاع ${category || 'التخصص'} للتواصل مع الجمهور المستهدف وعقد شراكات استراتيجية رائدة.`
    return NextResponse.json({ suggestion })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
