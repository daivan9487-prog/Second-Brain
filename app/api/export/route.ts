import { getAdminSupabase } from '@/lib/supabase'

export async function GET(req:Request){
 const db=getAdminSupabase(); if(!db) return new Response('Supabase chưa được cấu hình.',{status:503})
 const {data,error}=await db.from('knowledge').select('*').order('created_at',{ascending:true}); if(error) return new Response(error.message,{status:500})
 const format=new URL(req.url).searchParams.get('format')||'json'; const rows=data||[]
 if(format==='md'){
   const md=['# Second Brain Export','',`Xuất lúc: ${new Date().toISOString()}`,'',...rows.flatMap((x:any)=>[`## ${x.title}`,`- Category: ${x.category||'General'}`,`- Topic: ${x.topic||x.metadata?.topic||''}`,`- Tags: ${(x.tags||x.metadata?.tags||[]).join(', ')}`,x.source_url?`- Source: ${x.source_url}`:'','',x.content||'',''])].join('\n')
   return new Response(md,{headers:{'content-type':'text/markdown; charset=utf-8','content-disposition':'attachment; filename="second-brain.md"'}})
 }
 return new Response(JSON.stringify({exported_at:new Date().toISOString(),knowledge:rows},null,2),{headers:{'content-type':'application/json; charset=utf-8','content-disposition':'attachment; filename="second-brain.json"'}})
}
