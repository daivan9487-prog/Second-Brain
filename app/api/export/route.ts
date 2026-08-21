import { getAdminSupabase } from '@/lib/supabase'

export async function GET(req:Request){
 const db=getAdminSupabase(); if(!db) return new Response('Supabase chưa được cấu hình.',{status:503})
 const {data,error}=await db.from('knowledge').select('*').order('created_at',{ascending:true}); if(error) return new Response(error.message,{status:500})
 const {data:quickNotes}=await db.from('quick_notes').select('*').order('created_at',{ascending:true})
 const format=new URL(req.url).searchParams.get('format')||'json'; const rows=data||[],notes=quickNotes||[]
 if(format==='md'){
   const md=['# Second Brain Export','',`Xuất lúc: ${new Date().toISOString()}`,'','## Kho Tri Thức','',...rows.flatMap((x:any)=>[`### ${x.title||'Không tiêu đề'}`,`- Category: ${x.category||'General'}`,`- Topic: ${x.topic||x.metadata?.topic||''}`,`- Tags: ${(x.tags||x.metadata?.tags||[]).join(', ')}`,`- Tạo lúc: ${x.created_at||''}`,x.source_url?`- Source: ${x.source_url}`:'','',x.content||'','']),'## Ghi chú','',...notes.flatMap((x:any)=>[`### ${x.title||'Ghi chú'}`,`- Tạo lúc: ${x.created_at||''}`,x.remind_at?`- Lịch hẹn: ${x.remind_at}`:'',`- Hoàn thành: ${x.is_done?'Có':'Chưa'}`,'',x.content||'',''])].join('\n')
   return new Response(md,{headers:{'content-type':'text/markdown; charset=utf-8','content-disposition':'attachment; filename="second-brain.md"'}})
 }
 return new Response(JSON.stringify({exported_at:new Date().toISOString(),knowledge:rows,quick_notes:notes},null,2),{headers:{'content-type':'application/json; charset=utf-8','content-disposition':'attachment; filename="second-brain.json"'}})
}
