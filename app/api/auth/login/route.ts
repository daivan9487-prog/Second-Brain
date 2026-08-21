import { NextResponse } from 'next/server'
import { ensureDefaultAdmin, normalizeUsername, setSession, verifyPassword } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'
export async function POST(req:Request){
  const db=getAdminSupabase();if(!db)return NextResponse.json({error:'Supabase chưa được cấu hình.'},{status:503})
  await ensureDefaultAdmin()
  const b=await req.json().catch(()=>({})), username=normalizeUsername(b.username), password=String(b.password??'')
  if(!username||!password)return NextResponse.json({error:'Nhập tên đăng nhập và mật khẩu.'},{status:400})
  const {data}=await db.from('second_brain_users').select('*').eq('username_norm',username).maybeSingle()
  if(!data||!verifyPassword(password,data.password_salt,data.password_hash))return NextResponse.json({error:'Sai tên đăng nhập hoặc mật khẩu.'},{status:401})
  if(data.is_locked)return NextResponse.json({error:'Tài khoản đã bị khóa. Liên hệ Admin.'},{status:423})
  await db.from('second_brain_users').update({last_login_at:new Date().toISOString()}).eq('id',data.id)
  const user={id:data.id,username:data.username,role:data.role,phone:data.phone??null};await setSession(user)
  return NextResponse.json({ok:true,user})
}
