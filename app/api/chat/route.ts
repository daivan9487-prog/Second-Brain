import { NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase'
import { answerWithContext, createEmbedding } from '@/lib/openai'

export async function POST(req: Request) {
  const { question } = await req.json()
  if (!question?.trim()) return NextResponse.json({ error: 'Hãy nhập câu hỏi.' }, { status: 400 })

  const db = getAdminSupabase()
  let sources: any[] = []

  if (db && process.env.OPENAI_API_KEY) {
    const embedding = await createEmbedding(question)
    if (embedding) {
      const { data } = await db.rpc('match_knowledge', {
        query_embedding: embedding,
        match_threshold: 0.2,
        match_count: 8
      })
      sources = data || []
    }
  }

  if (db && sources.length === 0) {
    const { data } = await db.from('knowledge').select('id,title,content,category,created_at').order('created_at', { ascending: false }).limit(6)
    sources = (data || []).map((x: any) => ({ ...x, chunk_text: x.content, similarity: null }))
  }

  const context = sources.map((s, i) => `[${i + 1}] ${s.title || 'Knowledge'} (${s.category || 'General'})\n${s.chunk_text || s.content || ''}`).join('\n\n')
  const ai = await answerWithContext(question, context)

  if (!ai) {
    return NextResponse.json({
      answer: sources.length ? `Tôi đã tìm thấy ${sources.length} mục trong Second Brain, nhưng OPENAI_API_KEY chưa được cấu hình. Bạn vẫn có thể mở Library để đọc nguồn.` : 'Chưa cấu hình AI và hiện chưa có dữ liệu trong Second Brain.',
      sources
    })
  }
  return NextResponse.json({ answer: ai, sources })
}
