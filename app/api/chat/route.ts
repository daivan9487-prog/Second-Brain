import { NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase'
import { answerWithProviders, createEmbeddingWithSettings, type AISettingsPayload } from '@/lib/ai'

export async function POST(req: Request) {
  const { question, aiSettings } = await req.json() as { question?: string, aiSettings?: AISettingsPayload }
  if (!question?.trim()) return NextResponse.json({ error: 'Hãy nhập câu hỏi.' }, { status: 400 })

  const db = getAdminSupabase()
  let sources: any[] = []

  if (db) {
    try {
      const embedding = await createEmbeddingWithSettings(question, aiSettings)
      if (embedding) {
        const { data } = await db.rpc('match_knowledge', { query_embedding: embedding, match_threshold: 0.2, match_count: 8 })
        sources = data || []
      }
    } catch { /* fallback xuống dữ liệu gần đây */ }
  }

  if (db && sources.length === 0) {
    const { data } = await db.from('knowledge').select('id,title,content,category,created_at').order('created_at', { ascending: false }).limit(10)
    sources = (data || []).map((x: any) => ({ ...x, chunk_text: x.content, similarity: null }))
  }

  const context = sources.map((s, i) => `[${i + 1}] ${s.title || 'Knowledge'} (${s.category || 'General'})\n${s.chunk_text || s.content || ''}`).join('\n\n')
  try {
    const ai = await answerWithProviders(question, context, aiSettings)
    if (!ai) return NextResponse.json({
      answer: sources.length ? 'Đã tìm thấy dữ liệu trong Second Brain nhưng bạn chưa thêm API key AI. Hãy bấm ⚙ AI để thêm Gemini, OpenAI, Groq, Grok, Claude hoặc provider khác.' : 'Bạn chưa thêm API key AI và Second Brain hiện chưa có dữ liệu.',
      sources
    })
    return NextResponse.json({ answer: ai.text, sources, usedProvider: ai.provider, usedModel: ai.model, usedAccount: ai.accountName })
  } catch (e: any) {
    return NextResponse.json({ error: `Tất cả AI provider đều lỗi: ${e?.message || 'Không xác định'}`, sources }, { status: 502 })
  }
}
