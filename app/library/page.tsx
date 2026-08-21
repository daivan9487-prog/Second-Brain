'use client'
import { useEffect, useState } from 'react'
import AddKnowledge from '@/components/AddKnowledge'
import KnowledgeTree from '@/components/KnowledgeTree'
import BackupPanel from '@/components/BackupPanel'
export default function Library(){
 const [items,setItems]=useState<any[]>([]); const [configured,setConfigured]=useState(true)
 async function load(){const r=await fetch('/api/knowledge'); const d=await r.json(); setItems(d.items||[]); setConfigured(d.configured!==false)}
 useEffect(()=>{load()},[])
 return <><header className="libraryHeader"><div><span className="eyebrow">KNOWLEDGE VAULT</span><h1>Kho Tri Thức</h1><p>Lưu nhanh, nhìn thấy ngay và lấy lại bằng AI khi cần.</p></div></header>
 {!configured && <div className="notice">Supabase chưa được cấu hình. Hãy điền ENV và chạy schema/migration.</div>}
 <AddKnowledge inline onSaved={load}/><KnowledgeTree items={items} onChanged={load}/><BackupPanel onRestored={load}/></>
}
