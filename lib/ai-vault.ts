import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
import { getAdminSupabase } from '@/lib/supabase'
import type { AISettingsPayload, ProviderAccount, ProviderType } from '@/lib/ai'

function encryptionKey(){
  const secret=process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!secret) throw new Error('Thiếu AUTH_SECRET/SUPABASE_SERVICE_ROLE_KEY để mã hóa AI Vault.')
  return createHash('sha256').update(secret).digest()
}
export function encryptApiKey(value:string){
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',encryptionKey(),iv)
  const encrypted=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]),tag=cipher.getAuthTag()
  return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`
}
export function decryptApiKey(value:string){
  const [version,ivB64,tagB64,dataB64]=String(value||'').split('.')
  if(version!=='v1'||!ivB64||!tagB64||!dataB64) throw new Error('AI key ciphertext không hợp lệ.')
  const decipher=createDecipheriv('aes-256-gcm',encryptionKey(),Buffer.from(ivB64,'base64url'))
  decipher.setAuthTag(Buffer.from(tagB64,'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(dataB64,'base64url')),decipher.final()]).toString('utf8')
}

export async function loadUserAISettings(userId:string):Promise<AISettingsPayload>{
  const db=getAdminSupabase(); if(!db)return {activeAccount:'auto',autoRotate:true,accounts:[]}
  const [{data:rows,error},{data:pref}]=await Promise.all([
    db.from('second_brain_ai_accounts').select('*').eq('user_id',userId).order('priority',{ascending:true}),
    db.from('second_brain_ai_preferences').select('active_account,auto_rotate').eq('user_id',userId).maybeSingle()
  ])
  if(error)throw new Error(error.message)
  const accounts:ProviderAccount[]=(rows||[]).map((r:any)=>({
    id:r.id,provider:r.provider as ProviderType,name:r.name,enabled:r.enabled,apiKey:decryptApiKey(r.api_key_encrypted),model:r.model,baseUrl:r.base_url||undefined,priority:r.priority
  }))
  return {activeAccount:pref?.active_account||'auto',autoRotate:pref?.auto_rotate!==false,accounts}
}

export function publicAIAccount(row:any){
  return {id:row.id,provider:row.provider,name:row.name,enabled:row.enabled,model:row.model,baseUrl:row.base_url||'',priority:row.priority,last4:row.key_last4||'',createdAt:row.created_at,updatedAt:row.updated_at}
}
