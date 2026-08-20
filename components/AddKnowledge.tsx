'use client'
import { useState } from 'react'
import { loadAISettings } from '@/lib/client-ai-settings'

export default function AddKnowledge({ onSaved }: { onSaved?: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Learning')
  const [topic, setTopic] = useState('')
  const [tags, setTags] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [msg, setMsg] = useState('')

  async function save() {
    if (!title.trim() || !content.trim()) return setMsg('Hãy nhập tiêu đề và nội dung.')
    setMsg('Đang lưu...')
    const aiSettings = loadAISettings()
    const r = await fetch('/api/knowledge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content, category, topic, tags: tags.split(',').map(x=>x.trim()).filter(Boolean), sourceUrl, aiSettings }) })
    const d = await r.json()
    if (!r.ok) return setMsg(d.error || 'Không thể lưu')
    setTitle(''); setContent(''); setTopic(''); setTags(''); setSourceUrl(''); setMsg('Đã lưu vào Second Brain ✓'); onSaved?.()
  }

  return <>
    <button className="primary" onClick={() => setOpen(true)}>＋ Lưu kiến thức</button>
    {open && <div className="modalBg" onMouseDown={() => setOpen(false)}><div className="modal" onMouseDown={e => e.stopPropagation()}>
      <div className="modalHead"><div><h2>Lưu vào Second Brain</h2><p>Category → Topic → Knowledge. Nội dung vẫn được lưu ngay cả khi AI tạm thời lỗi.</p></div><button className="iconBtn" onClick={() => setOpen(false)}>×</button></div>
      <div className="twoCols"><label>Category<input value={category} onChange={e => setCategory(e.target.value)} placeholder="Learning, Project, Code..." /></label><label>Topic<input value={topic} onChange={e => setTopic(e.target.value)} placeholder="React, Vercel, PES..." /></label></div>
      <label>Tiêu đề<input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ví dụ: Fix lỗi 404 khi deploy Vercel" /></label>
      <label>Nội dung<textarea rows={10} value={content} onChange={e => setContent(e.target.value)} placeholder="Dán kiến thức, ghi chú, code, kết luận..." /></label>
      <div className="twoCols"><label>Tags<input value={tags} onChange={e => setTags(e.target.value)} placeholder="vercel, deploy, nextjs" /></label><label>URL nguồn<input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://..." /></label></div>
      <div className="modalFoot"><span>{msg}</span><button className="primary" onClick={save}>Lưu dài hạn</button></div>
    </div></div>}
  </>
}
