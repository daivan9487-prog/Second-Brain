import { NextResponse } from 'next/server'
import { hashPassword, normalizeUsername, setSession, validUsername } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'
export async function POST(req:Request){
  const db=getAdminSupabase();if(!db)return NextResponse.json({error:'Supabase chưa được cấu hình.'},{status:503})
  const b=await req.json().catch(()=>({})), raw=String(b.username||'').trim(), norm=normalizeUsername(raw), password=String(b.password??''), phone=String(b.phone||'').trim()||null
  if(norm==='admin')return NextResponse.json({error:'Tên Admin được dành riêng cho tài khoản quản trị.'},{status:409});if(!validUsername(raw))return NextResponse.json({error:'Tên đăng nhập phải viết liền, không dấu; chỉ dùng chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.'},{status:400})
  if(!password.length)return NextResponse.json({error:'Mật khẩu không được để trống.'},{status:400})
  const {data:exists}=await db.from('second_brain_users').select('id').eq('username_norm',norm).maybeSingle();if(exists)return NextResponse.json({error:'Tên đăng nhập đã tồn tại.'},{status:409})
  const {salt,hash}=hashPassword(password)
  const {data,error}=await db.from('second_brain_users').insert({username:raw,username_norm:norm,password_hash:hash,password_salt:salt,phone,role:'user',is_locked:false}).select('id,username,role,phone').single()
  if(error)return NextResponse.json({error:error.message},{status:500});await setSession(data as any);return NextResponse.json({ok:true,user:data})
}
