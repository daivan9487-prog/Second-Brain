import { NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase'
import { createEmbedding } from '@/lib/openai'

export async function GET() {
  const db = getAdminSupabase()
  if (!db) return NextResponse.json({ configured: false, items: [] })
  const { data, error } = await db.from('knowledge').select('*').order('created_at', { ascending: false }).limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ configured: true, items: data || [] })
}

export async function POST(req: Request) {
  const db = getAdminSupabase()
  if (!db) return NextResponse.json({ error: 'Supabase chưa được cấu hình.' }, { status: 503 })
  const body = await req.json()
  const title = String(body.title || '').trim()
  const content = String(body.content || '').trim()
  const category = String(body.category || 'General').trim()
  if (!title || !content) return NextResponse.json({ error: 'Thiếu tiêu đề hoặc nội dung.' }, { status: 400 })

  const { data: item, error } = await db.from('knowledge').insert({ title, content, category }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    const embedding = await createEmbedding(`${title}\n${content}`)
    if (embedding) {
      await db.from('knowledge_chunks').insert({ knowledge_id: item.id, chunk_text: content, embedding })
    }
  } catch (e) {
    console.error(e)
  }
  return NextResponse.json({ item })
}
