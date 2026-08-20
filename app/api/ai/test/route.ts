import { NextResponse } from 'next/server'
import { answerWithProviders, type AISettingsPayload } from '@/lib/ai'
export async function POST(req:Request){const body=await req.json() as {aiSettings?:AISettingsPayload};try{const r=await answerWithProviders('Chỉ trả lời đúng 2 chữ: Kết nối','',body.aiSettings);if(!r)return NextResponse.json({error:'Chưa có API key.'},{status:400});return NextResponse.json({ok:true,provider:r.provider,model:r.model,accountName:r.accountName})}catch(e:any){return NextResponse.json({error:e?.message||'Kết nối thất bại.'},{status:502})}}
