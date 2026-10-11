"use client"
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Sparkles, Send, Bot, User, ArrowLeft, Store, MapPin, Loader2, Compass } from 'lucide-react';

type Message = {
  id: string
  sender: 'user' | 'assistant'
  text: string
  suggestedExhibitions?: Array<{ id: string; title: string; city: string }>
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'مرحباً بك في مساعد بوث هب الذكي المدعوم بنماذج Gemini! أنا هنا لمساعدتك في استكشاف المعارض واختيار أفضل البوثات لمشروعك بناءً على البيانات الفعلية للمنصة. كيف يمكنني خدمتك اليوم؟'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Booth Recommendation Form state
  const [activity, setActivity] = useState('');
  const [city, setCity] = useState('الرياض');
  const [budget, setBudget] = useState('');
  const [recommendationResult, setRecommendationResult] = useState<any>(null);
  const [recommending, setRecommending] = useState(false);

  const quickQuestions = [
    'ما المعارض المتاحة في الرياض؟',
    'ما المعارض المناسبة لشركة تقنية؟',
    'كيف أحجز بوثاً في المنصة؟',
    'ما الفرق بين البوثات المتاحة؟'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });
      const data = await res.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.text || 'عذراً، حدث خطأ أثناء إعداد الرد.',
        suggestedExhibitions: data.suggestedExhibitions
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'تعذر الاتصال بالمساعد الذكي في الوقت الحالي، يرجى المحاولة لاحقاً.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecommending(true);
    setRecommendationResult(null);

    try {
      const q = `أريد توصية بوث لنشاط: ${activity} في مدينة ${city} بميزانية ${budget || 'غير محددة'} ريال. ما هي المعارض والبوثات الأنسب؟`;
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });
      const data = await res.json();
      setRecommendationResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setRecommending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow py-10">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Sparkles size={16} className="text-coral" />
              <span>مدعوم بالذكاء الاصطناعي من Gemini</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-dark mb-3">مساعد بوث هب الذكي</h1>
            <p className="text-foreground text-sm">
              اسأل عن المعارض المتاحة، قارن بين المواقع والأسعار، واحصل على توصيات فورية مبنية على بيانات المنصة الحقيقية.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chat Container */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-sm flex flex-col h-[600px] overflow-hidden">
              
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-secondary-bg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-primary-dark">المساعد الذكي</h2>
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                      متصل بقاعدة البيانات
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.sender === 'user' ? 'bg-primary text-white' : 'bg-light-blue-bg text-primary'
                    }`}>
                      {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-secondary-bg border border-border text-primary-dark rounded-tl-none whitespace-pre-line'
                    }`}>
                      {msg.text}

                      {/* Suggested Exhibitions if any */}
                      {msg.suggestedExhibitions && msg.suggestedExhibitions.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2">
                          <p className="text-xs font-bold text-gray-500">معارض مقترحة لك:</p>
                          {msg.suggestedExhibitions.map((ex) => (
                            <Link 
                              key={ex.id} 
                              href={`/explore/${ex.id}`}
                              className="flex items-center justify-between p-2.5 bg-white border border-border rounded-xl hover:border-primary transition-colors text-primary font-medium text-xs group"
                            >
                              <span>{ex.title} ({ex.city})</span>
                              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-light-blue-bg text-primary flex items-center justify-center">
                      <Bot size={16} />
                    </div>
                    <div className="bg-secondary-bg border border-border rounded-2xl p-4 text-sm flex items-center gap-2 text-foreground">
                      <Loader2 size={16} className="animate-spin text-primary" />
                      <span>جاري البحث وتحليل البيانات...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Questions */}
              <div className="p-2 border-t border-border bg-white flex gap-2 overflow-x-auto text-xs">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="whitespace-nowrap px-3 py-1.5 bg-secondary-bg hover:bg-light-blue-bg text-foreground hover:text-primary rounded-lg border border-border transition-colors shrink-0"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-border bg-white flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="اكتب استفسارك هنا (مثال: ما المعارض المتاحة في الرياض؟)..."
                  className="flex-1 px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={loading || !input.trim()}
                  className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <Send size={18} className="transform rotate-180" />
                </button>
              </div>

            </div>

            {/* Feature 2: Booth Finder Tool */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-2 bg-coral/10 text-coral rounded-xl">
                    <Compass size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-primary-dark text-base">اعثر على البوث الأنسب لك</h2>
                    <p className="text-xs text-foreground">توصيات مخصصة لنشاطك التجاري</p>
                  </div>
                </div>

                <form onSubmit={handleRecommend} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-primary-dark block mb-1">نوع النشاط</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: ذكاء اصطناعي، قهوة، عقارات"
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-primary-dark block mb-1">المدينة المفضلة</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="الرياض">الرياض</option>
                      <option value="جدة">جدة</option>
                      <option value="الدمام">الدمام</option>
                      <option value="الكل">جميع المدن</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-primary-dark block mb-1">الميزانية التقريبية (ريال)</label>
                    <input
                      type="number"
                      placeholder="مثال: 8000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                      dir="ltr"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={recommending || !activity.trim()}
                    className="w-full py-2.5 bg-coral text-white font-medium rounded-xl hover:bg-coral/90 transition-colors shadow-md shadow-coral/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {recommending && <Loader2 size={16} className="animate-spin" />}
                    <span>{recommending ? 'جاري التحليل...' : 'توصية البوث الأنسب'}</span>
                  </button>
                </form>

                {recommendationResult && (
                  <div className="mt-6 p-4 bg-light-blue-bg border border-primary/20 rounded-xl text-xs text-primary-dark leading-relaxed">
                    <p className="font-bold text-primary mb-2">توصية المستشار الذكي:</p>
                    <p className="whitespace-pre-line">{recommendationResult.text}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border text-center text-xs text-foreground">
                البيانات مسترجعة مباشرة من معارض وبوثات بوث هب المسجلة.
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
