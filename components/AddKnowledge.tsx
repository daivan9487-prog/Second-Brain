'use client'
import { useState } from 'react'

export default function AddKnowledge({ onSaved }: { onSaved?: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Learning')
  const [msg, setMsg] = useState('')

  async function save() {
    setMsg('Đang lưu...')
    const r = await fetch('/api/knowledge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content, category }) })
    const d = await r.json()
    if (!r.ok) return setMsg(d.error || 'Không thể lưu')
    setTitle(''); setContent(''); setMsg('Đã lưu vào Second Brain ✓'); onSaved?.()
  }

  return <>
    <button className="primary" onClick={() => setOpen(true)}>＋ Lưu kiến thức</button>
    {open && <div className="modalBg" onMouseDown={() => setOpen(false)}><div className="modal" onMouseDown={e => e.stopPropagation()}>
      <div className="modalHead"><div><h2>Lưu vào Second Brain</h2><p>Nội dung này sẽ trở thành trí nhớ dài hạn.</p></div><button className="iconBtn" onClick={() => setOpen(false)}>×</button></div>
      <label>Tiêu đề<input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ví dụ: Cách deploy Next.js lên Vercel" /></label>
      <label>Nhóm<select value={category} onChange={e => setCategory(e.target.value)}><option>Learning</option><option>Project</option><option>Note</option><option>Code</option><option>Idea</option></select></label>
      <label>Nội dung<textarea rows={10} value={content} onChange={e => setContent(e.target.value)} placeholder="Dán kiến thức, ghi chú, code, kết luận..." /></label>
      <div className="modalFoot"><span>{msg}</span><button className="primary" onClick={save}>Lưu vĩnh viễn</button></div>
    </div></div>}
  </>
}
