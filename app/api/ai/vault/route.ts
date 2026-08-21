import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'
import { encryptApiKey,publicAIAccount } from '@/lib/ai-vault'
import { defaultModel,type ProviderType } from '@/lib/ai'
const providers=new Set(['gemini','openai','groq','xai','anthropic','openrouter','deepseek','mistral','custom'])

export async function GET(){
 const user=await requireSession();if(!user)return NextResponse.json({error:'Chưa đăng nhập.'},{status:401});const db=getAdminSupabase();if(!db)return NextResponse.json({error:'Supabase chưa cấu hình.'},{status:503})
 const [{data,error},{data:pref}]=await Promise.all([db.from('second_brain_ai_accounts').select('*').eq('user_id',user.id).order('priority',{ascending:true}),db.from('second_brain_ai_preferences').select('active_account,auto_rotate').eq('user_id',user.id).maybeSingle()]);if(error)return NextResponse.json({error:error.message},{status:500})
 return NextResponse.json({accounts:(data||[]).map(publicAIAccount),activeAccount:pref?.active_account||'auto',autoRotate:pref?.auto_rotate!==false})
}
export async function POST(req:Request){
 const user=await requireSession();if(!user)return NextResponse.json({error:'Chưa đăng nhập.'},{status:401});const db=getAdminSupabase();if(!db)return NextResponse.json({error:'Supabase chưa cấu hình.'},{status:503});const b=await req.json();const provider=String(b.provider||'') as ProviderType,key=String(b.apiKey||'').trim();if(!providers.has(provider)||!key)return NextResponse.json({error:'Provider hoặc API key không hợp lệ.'},{status:400})
 const row={user_id:user.id,provider,name:String(b.name||provider).trim()||provider,api_key_encrypted:encryptApiKey(key),key_last4:key.slice(-4),model:String(b.model||'').trim()||defaultModel(provider),base_url:String(b.baseUrl||'').trim()||null,priority:Number.isFinite(Number(b.priority))?Number(b.priority):100,enabled:b.enabled!==false,updated_at:new Date().toISOString()}
 const {data,error}=await db.from('second_brain_ai_accounts').insert(row).select().single();if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({account:publicAIAccount(data)})
}
export async function PATCH(req:Request){
 const user=await requireSession();if(!user)return NextResponse.json({error:'Chưa đăng nhập.'},{status:401});const db=getAdminSupabase();if(!db)return NextResponse.json({error:'Supabase chưa cấu hình.'},{status:503});const b=await req.json()
 if(b.preferences){await db.from('second_brain_ai_preferences').upsert({user_id:user.id,active_account:String(b.activeAccount||'auto'),auto_rotate:b.autoRotate!==false,updated_at:new Date().toISOString()},{onConflict:'user_id'});return NextResponse.json({ok:true})}
 const id=String(b.id||'');if(!id)return NextResponse.json({error:'Thiếu id.'},{status:400});const patch:any={updated_at:new Date().toISOString()};for(const [src,dst] of [['name','name'],['model','model'],['baseUrl','base_url'],['priority','priority'],['enabled','enabled']] as const)if(b[src]!==undefined)patch[dst]=b[src];if(String(b.apiKey||'').trim()){const k=String(b.apiKey).trim();patch.api_key_encrypted=encryptApiKey(k);patch.key_last4=k.slice(-4)}
 const {data,error}=await db.from('second_brain_ai_accounts').update(patch).eq('id',id).eq('user_id',user.id).select().maybeSingle();if(error)return NextResponse.json({error:error.message},{status:500});if(!data)return NextResponse.json({error:'Không tìm thấy API key.'},{status:404});return NextResponse.json({account:publicAIAccount(data)})
}
export async function DELETE(req:Request){
 const user=await requireSession();if(!user)return NextResponse.json({error:'Chưa đăng nhập.'},{status:401});const db=getAdminSupabase();if(!db)return NextResponse.json({error:'Supabase chưa cấu hình.'},{status:503});const {id}=await req.json();if(!id)return NextResponse.json({error:'Thiếu id.'},{status:400});const {error}=await db.from('second_brain_ai_accounts').delete().eq('id',String(id)).eq('user_id',user.id);if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({ok:true})
}
