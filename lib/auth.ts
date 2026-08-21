import { cookies } from 'next/headers'
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { getAdminSupabase } from '@/lib/supabase'

export type SessionUser = { id:string; username:string; role:'admin'|'user'; phone?:string|null }
const COOKIE='sb_session'
const MAX_AGE=60*60*24*180

function secret(){
  return process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'second-brain-local-secret-change-me'
}
function sign(payload:string){return createHmac('sha256',secret()).update(payload).digest('base64url')}
function encodeSession(user:SessionUser){
  const payload=Buffer.from(JSON.stringify({...user,exp:Math.floor(Date.now()/1000)+MAX_AGE})).toString('base64url')
  return `${payload}.${sign(payload)}`
}
function decodeSession(token?:string):SessionUser|null{
  if(!token)return null
  const [payload,sig]=token.split('.'); if(!payload||!sig)return null
  const expected=sign(payload)
  try{if(!timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null}catch{return null}
  try{const data=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));if(!data.exp||data.exp<Math.floor(Date.now()/1000))return null;return {id:data.id,username:data.username,role:data.role,phone:data.phone??null}}catch{return null}
}
export function hashPassword(password:string,salt=randomBytes(16).toString('hex')){
  return {salt,hash:scryptSync(password,salt,64).toString('hex')}
}
export function verifyPassword(password:string,salt:string,hash:string){
  try{return timingSafeEqual(Buffer.from(scryptSync(password,salt,64).toString('hex')),Buffer.from(hash))}catch{return false}
}
export function normalizeUsername(v:string){return String(v||'').trim().toLowerCase()}
export function validUsername(v:string){return /^[A-Za-z0-9._-]+$/.test(v) && v.length>=1 && v.length<=50}
export async function setSession(user:SessionUser){
  const jar=await cookies(); jar.set(COOKIE,encodeSession(user),{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:MAX_AGE})
}
export async function clearSession(){const jar=await cookies();jar.set(COOKIE,'',{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:0})}
export async function getSession():Promise<SessionUser|null>{const jar=await cookies();return decodeSession(jar.get(COOKIE)?.value)}
export async function requireSession(){
  const session=await getSession(); if(!session)return null
  const db=getAdminSupabase(); if(!db)return session
  const {data}=await db.from('second_brain_users').select('id,username,role,phone,is_locked').eq('id',session.id).maybeSingle()
  if(!data||data.is_locked)return null
  return {id:data.id,username:data.username,role:data.role,phone:data.phone??null} as SessionUser
}
export async function ensureDefaultAdmin(){
  const db=getAdminSupabase(); if(!db)return null
  const {data:existing}=await db.from('second_brain_users').select('*').eq('username_norm','admin').maybeSingle()
  if(existing)return existing
  const {salt,hash}=hashPassword('123')
  const {data,error}=await db.from('second_brain_users').insert({username:'Admin',username_norm:'admin',password_hash:hash,password_salt:salt,role:'admin',is_locked:false}).select().single()
  if(error)throw new Error(error.message)
  await db.from('knowledge').update({user_id:data.id}).is('user_id',null)
  await db.from('quick_notes').update({user_id:data.id}).is('user_id',null)
  await db.from('brain_backups').update({user_id:data.id}).is('user_id',null)
  await db.from('projects').update({user_id:data.id}).is('user_id',null)
  return data
}
