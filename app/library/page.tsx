'use client'
import { useEffect, useState } from 'react'
import AddKnowledge from '@/components/AddKnowledge'
export default function Library(){
 const [items,setItems]=useState<any[]>([]); const [configured,setConfigured]=useState(true)
 async function load(){const r=await fetch('/api/knowledge'); const d=await r.json(); setItems(d.items||[]); setConfigured(d.configured!==false)}
 useEffect(()=>{load()},[])
 return <><header className="top"><div><span className="eyebrow">KNOWLEDGE VAULT</span><h1>Thư viện kiến thức</h1><p>Kho trí nhớ nguyên bản của bạn. AI chỉ đọc từ đây, dữ liệu không phụ thuộc model.</p></div><AddKnowledge onSaved={load}/></header>
 {!configured && <div className="notice">Supabase chưa được cấu hình. Hãy điền <code>.env.local</code> và chạy file <code>supabase/schema.sql</code>.</div>}
 <div className="libraryGrid">{items.length?items.map(x=><article key={x.id} className="knowledge"><span>{x.category}</span><h3>{x.title}</h3><p>{x.content}</p><small>{new Date(x.created_at).toLocaleString('vi-VN')}</small></article>):<div className="empty"><b>Chưa có kiến thức nào</b><p>Bấm “Lưu kiến thức” để tạo trí nhớ đầu tiên.</p></div>}</div></>
}
