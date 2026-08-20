'use client'
import { useEffect, useState } from 'react'
import AddKnowledge from '@/components/AddKnowledge'
import KnowledgeTree from '@/components/KnowledgeTree'
import BackupPanel from '@/components/BackupPanel'
export default function Library(){
 const [items,setItems]=useState<any[]>([]); const [configured,setConfigured]=useState(true)
 async function load(){const r=await fetch('/api/knowledge'); const d=await r.json(); setItems(d.items||[]); setConfigured(d.configured!==false)}
 useEffect(()=>{load()},[])
 return <><header className="top"><div><span className="eyebrow">KNOWLEDGE VAULT</span><h1>Thư viện kiến thức</h1><p>Category → Topic → Knowledge, có Tags, nguồn, tìm kiếm và backup độc lập với AI.</p></div><AddKnowledge onSaved={load}/></header>
 {!configured && <div className="notice">Supabase chưa được cấu hình. Hãy điền ENV và chạy <code>supabase/schema.sql</code> + migration v0.3.</div>}
 <KnowledgeTree items={items} onChanged={load}/><BackupPanel onRestored={load}/></>
}
