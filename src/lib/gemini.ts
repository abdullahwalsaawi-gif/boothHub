import { GoogleGenAI } from '@google/genai'
import { Exhibition } from '@/app/actions/exhibitions'
import { BoothData } from '@/app/actions/bookings'

const apiKey = process.env.GEMINI_API_KEY || ''

let aiClient: GoogleGenAI | null = null
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey })
  } catch (e) {
    console.error('Failed to initialize GoogleGenAI client:', e)
  }
}

export type AssistantResponse = {
  text: string
  suggestedExhibitions?: Array<{ id: string; title: string; city: string }>
  suggestedBooths?: Array<{ id: string; number: string; price: number; exhibitionTitle: string }>
}

/**
 * Smart AI Assistant for Booth Hub
 * Answers questions about exhibitions and booths strictly using provided system data.
 */
export async function askBoothHubAssistant(
  question: string,
  exhibitions: Exhibition[],
  booths: BoothData[] = []
): Promise<AssistantResponse> {
  const cleanQ = question.trim().toLowerCase()

  // Build context of existing exhibitions and booths
  const exhibitionsSummary = exhibitions.map(e => 
    `- المعرض: "${e.title}" | المدينة: ${e.city} | التصنيف: ${e.category} | المكان: ${e.venue} | التاريخ: من ${e.start_date} إلى ${e.end_date} | البوثات المتاحة: ${e.available_booths || 0}`
  ).join('\n')

  const boothsSummary = booths.slice(0, 15).map(b =>
    `- بوث رقم ${b.number}: المساحة ${b.size_sqm}م²، السعر ${b.price} ريال، الحالة: ${b.status === 'available' ? 'متاح' : 'محجوز'}`
  ).join('\n')

  const systemInstruction = `
أنت المساعد الذكي الرسمي لمنصة "بوث هب | Booth Hub" لإدارة وحجز بوثات المعارض في المملكة العربية السعودية.
مهمتك: مساعدة الزوار والعارضين في العثور على المعارض والبوثات المناسبة.

قواعد صارمة جداً:
1. اعتمد حصراً على بيانات المعارض والبوثات المتوفرة أدناه.
2. لا تخترع أي معرض أو مدينة أو أسعار أو أرقام بوثات غير موجودة في البيانات.
3. إذا سأل المستخدم عن معرض في مدينة أو تخصص غير موجود، أخبره بلطف أن هذا المعرض غير متوفر حالياً واعرض عليه المعارض المتاحة.
4. أجب بلغة عربية احترافية، لطيفة، وموجزة.

البيانات المتاحة في المنصة حالياً:
المعارض:
${exhibitionsSummary || 'لا توجد معارض حالياً'}

البوثات المتاحة/المعروضة:
${boothsSummary || 'مخططات البوثات متوفرة داخل صفحة تفاصيل كل معرض'}
`

  // Try calling Gemini with timeout
  if (aiClient && apiKey) {
    try {
      const responsePromise = aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemInstruction}\n\nسؤال المستخدم: ${question}`
      })

      // Timeout after 8 seconds to ensure fast UI response
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), 8000)
      )

      const result: any = await Promise.race([responsePromise, timeoutPromise])
      if (result && result.text) {
        return { text: result.text }
      }
    } catch (err) {
      console.warn('Gemini API call timed out or failed, using intelligent rule-based fallback based on DB:', err)
    }
  }

  // Robust, accurate fallback based strictly on DB records
  let matchedExhibitions = exhibitions.filter(e => 
    cleanQ.includes(e.city.toLowerCase()) || 
    cleanQ.includes(e.category.toLowerCase()) ||
    e.title.toLowerCase().includes(cleanQ)
  )

  if (cleanQ.includes('الرياض')) {
    matchedExhibitions = exhibitions.filter(e => e.city.includes('الرياض'))
  } else if (cleanQ.includes('جدة')) {
    matchedExhibitions = exhibitions.filter(e => e.city.includes('جدة'))
  } else if (cleanQ.includes('القصيم') || cleanQ.includes('بريدة') || cleanQ.includes('عنيزة')) {
    matchedExhibitions = exhibitions.filter(e => e.city.includes('القصيم') || e.city.includes('بريدة') || (e.venue && e.venue.includes('بريدة')))
  } else if (cleanQ.includes('الدمام') || cleanQ.includes('الشرقية')) {
    matchedExhibitions = exhibitions.filter(e => e.city.includes('الدمام'))
  }

  if (matchedExhibitions.length > 0) {
    const list = matchedExhibitions.map(e => `• ${e.title} (${e.city}) - يقام في ${e.venue} من ${e.start_date} إلى ${e.end_date}.`).join('\n')
    return {
      text: `أهلاً بك! بناءً على المعارض المسجلة في منصة بوث هب، إليك المعارض المتاحة:\n\n${list}\n\nيمكنك الضغط على أي معرض واستعراض المخطط التفاعلي لاختيار بوثك وحجزه مباشرة.`,
      suggestedExhibitions: matchedExhibitions.map(e => ({ id: e.id, title: e.title, city: e.city }))
    }
  }

  if (cleanQ.includes('حجز') || cleanQ.includes('كيف')) {
    return {
      text: `لحجز بوث في منصة بوث هب:\n1. استكشف المعارض المتاحة واختر المعرض المناسب لنشاطك.\n2. افتح صفحة المعرض واضغط على "المخطط التفاعلي".\n3. اختر البوث المتاح (اللون الأخضر) لمعرفة مساحته وسعره.\n4. اضغط "متابعة الحجز" وقم بتأكيد بياناتك.\nيسعدنا مساعدتك في أي استفسار إضافي!`
    }
  }

  return {
    text: `أهلاً بك في بوث هب! يتوفر لدينا حالياً ${exhibitions.length} معارض منشورة في الرياض وجدة والقصيم والدمام ومختلف مدن المملكة تغطي مجالات التقنية، التراث والثقافة، العقار، والأغذية.\n\nهل تود استعراض المعارض في مدينة محددة أو لنشاط تجاري معين؟`,
    suggestedExhibitions: exhibitions.slice(0, 3).map(e => ({ id: e.id, title: e.title, city: e.city }))
  }
}

/**
 * Recommend Booths using Gemini & Database
 */
export async function recommendBoothsAI(
  criteria: {
    activityType: string
    city: string
    budget?: number
    space?: number
  },
  exhibitions: Exhibition[],
  booths: BoothData[]
) {
  // Filter exhibitions matching city
  const cityExhibitions = exhibitions.filter(e => !criteria.city || e.city.includes(criteria.city) || criteria.city === 'الكل')
  
  // Available booths within budget
  const availableBooths = booths.filter(b => 
    b.status === 'available' && 
    (!criteria.budget || b.price <= criteria.budget) &&
    (!criteria.space || b.size_sqm >= criteria.space)
  )

  const contextData = {
    activity: criteria.activityType,
    city: criteria.city,
    budget: criteria.budget,
    space: criteria.space,
    matchingExhibitionsCount: cityExhibitions.length,
    availableBoothsCount: availableBooths.length
  }

  let aiAdvice = ''
  if (aiClient && apiKey) {
    try {
      const prompt = `
بصفتك خبير تخطيط معارض في بوث هب:
لدينا عارض نشاطه: "${criteria.activityType}"
المدينة المستهدفة: "${criteria.city}"
الميزانية المتاحة: ${criteria.budget || 'غير محددة'} ريال
المساحة المطلوبة: ${criteria.space || 'غير محددة'} م²

قدم نصيحة مختصرة ومباشرة (فقرة واحدة أو نقطتين) تشرح أفضل موقع للبوث ومزايا المساحة لنشاطه.
`
      const res = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      })
      aiAdvice = res.text || ''
    } catch (e) {
      console.warn('Gemini recommendation advice fallback')
    }
  }

  if (!aiAdvice) {
    aiAdvice = `لنشاط "${criteria.activityType}"، يُفضل اختيار بوث متوسط المساحة بالقرب من الممرات الرئيسية لضمان تدفق أعلى للزوار وإتاحة مساحة كافية لعرض المنتجات والتفاعل المباشر.`
  }

  return {
    advice: aiAdvice,
    exhibitions: cityExhibitions,
    booths: availableBooths.slice(0, 4)
  }
}
