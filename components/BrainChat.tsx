'use client'
import { useEffect, useState } from 'react'
import AISettings from '@/components/AISettings'
import { loadAISettings } from '@/lib/client-ai-settings'

type Msg = { role: 'user'|'brain', text: string, sources?: any[], provider?: string, model?: string }
export default function BrainChat() {
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [configured, setConfigured] = useState(0)
  const [msgs, setMsgs] = useState<Msg[]>([{ role:'brain', text:'Xin chào. Hãy hỏi tôi về bất kỳ kiến thức nào bạn đã lưu trong Second Brain.' }])

  function refreshConfigured(){ setConfigured(loadAISettings().providers.filter(p=>p.enabled && p.apiKey.trim()).length) }
  useEffect(()=>{ refreshConfigured(); window.addEventListener('second-brain-ai-settings', refreshConfigured); return()=>window.removeEventListener('second-brain-ai-settings', refreshConfigured) },[])

  async function ask() {
    if (!q.trim() || busy) return
    const question = q.trim(); setQ(''); setBusy(true)
    setMsgs(m => [...m, { role:'user', text: question }])
    try {
      const aiSettings = loadAISettings()
      const r = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({question, aiSettings}) })
      const d = await r.json()
      setMsgs(m => [...m, { role:'brain', text:d.answer || d.error || 'Không có phản hồi.', sources:d.sources, provider:d.usedProvider, model:d.usedModel }])
    } catch { setMsgs(m => [...m, { role:'brain', text:'Không kết nối được với AI Brain.' }]) }
    setBusy(false)
  }

  return <section className="chatCard">
    <div className="sectionTitle"><div><span className="eyebrow">AI MEMORY</span><h2>Trò chuyện với Bộ Não Thứ 2</h2></div><div className="chatActions"><span className={`pill ${configured ? 'ok' : ''}`}>{configured ? `${configured} AI đã cấu hình` : 'Chưa có AI key'}</span><AISettings/></div></div>
    <div className="chatLog">{msgs.map((m,i) => <div key={i} className={`msg ${m.role}`}><div className="avatar">{m.role==='brain'?'∞':'Y'}</div><div><p>{m.text}</p>{m.provider && <div className="modelUsed">↳ {m.provider.toUpperCase()} · {m.model}</div>}{m.sources?.length ? <div className="sources">{m.sources.slice(0,4).map((s,j)=><span key={j}>[{j+1}] {s.title || 'Knowledge'}</span>)}</div>:null}</div></div>)}</div>
    <div className="composer"><textarea value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask()}}} placeholder="Hỏi: Tôi đã học gì về React? Lần trước tôi xử lý lỗi Vercel thế nào?..." rows={2}/><button onClick={ask}>{busy?'…':'➜'}</button></div>
  </section>
}
