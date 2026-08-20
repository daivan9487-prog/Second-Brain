import { NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase'

export async function PATCH(req: Request) {
  const db = getAdminSupabase(); if(!db) return NextResponse.json({error:'Supabase chưa được cấu hình.'},{status:503})
  const b = await req.json(); const id=String(b.id||''); if(!id) return NextResponse.json({error:'Thiếu id.'},{status:400})
  const patch:any={updated_at:new Date().toISOString()}
  for(const k of ['title','content','category','topic','source_url']) if(k in b) patch[k]=b[k]||null
  if(Array.isArray(b.tags)) patch.tags=b.tags
  let r=await db.from('knowledge').update(patch).eq('id',id).select().single()
  if(r.error && /topic|tags/i.test(r.error.message)){ delete patch.topic; delete patch.tags; r=await db.from('knowledge').update(patch).eq('id',id).select().single() }
  if(r.error) return NextResponse.json({error:r.error.message},{status:500})
  return NextResponse.json({item:r.data})
}

export async function DELETE(req: Request) {
  const db=getAdminSupabase(); if(!db) return NextResponse.json({error:'Supabase chưa được cấu hình.'},{status:503})
  const {id}=await req.json(); if(!id) return NextResponse.json({error:'Thiếu id.'},{status:400})
  const {error}=await db.from('knowledge').delete().eq('id',id); if(error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({ok:true})
}
