import { NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase'

export async function GET(){
 const db=getAdminSupabase(); if(!db) return NextResponse.json({configured:false,items:[]})
 const {data,error}=await db.from('brain_backups').select('id,label,created_at').order('created_at',{ascending:false}).limit(30)
 if(error) return NextResponse.json({error:error.message,items:[]},{status:500})
 return NextResponse.json({configured:true,items:data||[]})
}
export async function POST(req:Request){
 const db=getAdminSupabase(); if(!db) return NextResponse.json({error:'Supabase chưa được cấu hình.'},{status:503})
 const b=await req.json().catch(()=>({})); const {data:knowledge,error:kerr}=await db.from('knowledge').select('*').order('created_at',{ascending:true})
 if(kerr) return NextResponse.json({error:kerr.message},{status:500})
 const {data:quickNotes}=await db.from('quick_notes').select('*').order('created_at',{ascending:true})
 const {data,error}=await db.from('brain_backups').insert({label:String(b.label||'Manual backup'),payload:{knowledge:knowledge||[],quick_notes:quickNotes||[]}}).select('id,label,created_at').single()
 if(error) return NextResponse.json({error:error.message,hint:'Hãy chạy migration v0.3.'},{status:500})
 return NextResponse.json({ok:true,backup:data,count:knowledge?.length||0})
}
export async function PUT(req:Request){
 const db=getAdminSupabase(); if(!db) return NextResponse.json({error:'Supabase chưa được cấu hình.'},{status:503})
 const {id}=await req.json(); if(!id) return NextResponse.json({error:'Thiếu backup id.'},{status:400})
 const {data,error}=await db.from('brain_backups').select('payload').eq('id',id).single(); if(error) return NextResponse.json({error:error.message},{status:500})
 const rows=Array.isArray(data?.payload?.knowledge)?data.payload.knowledge:[]
 const {error:delErr}=await db.from('knowledge').delete().neq('id','00000000-0000-0000-0000-000000000000'); if(delErr) return NextResponse.json({error:delErr.message},{status:500})
 if(rows.length){const clean=rows.map((x:any)=>{const y={...x}; delete y.project; return y}); const {error:insErr}=await db.from('knowledge').insert(clean); if(insErr) return NextResponse.json({error:insErr.message},{status:500})}
 const quickRows=Array.isArray(data?.payload?.quick_notes)?data.payload.quick_notes:[]
 await db.from('quick_notes').delete().neq('id','00000000-0000-0000-0000-000000000000')
 if(quickRows.length) await db.from('quick_notes').insert(quickRows)
 return NextResponse.json({ok:true,count:rows.length,quickNotes:quickRows.length})
}
