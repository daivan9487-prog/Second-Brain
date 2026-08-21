'use client'
import { useState } from 'react'
import { loadAISettings } from '@/lib/client-ai-settings'

type Props = { onSaved?: () => void; inline?: boolean }
export default function AddKnowledge({ onSaved, inline=false }: Props) {
  const [title,setTitle]=useState(''),[content,setContent]=useState(''),[category,setCategory]=useState(''),[topic,setTopic]=useState(''),[tags,setTags]=useState(''),[sourceUrl,setSourceUrl]=useState(''),[msg,setMsg]=useState(''),[saving,setSaving]=useState(false)
  async function save(){
    if(!title.trim()&&!content.trim()) return setMsg('Nhập tiêu đề hoặc nội dung để lưu.')
    setSaving(true);setMsg('Đang lưu…')
    try{
      const r=await fetch('/api/knowledge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,content,category,topic,tags:tags.split(',').map(x=>x.trim()).filter(Boolean),sourceUrl,aiSettings:loadAISettings()})})
      const d=await r.json(); if(!r.ok) return setMsg(d.error||'Không thể lưu')
      setTitle('');setContent('');setTopic('');setTags('');setSourceUrl('');setMsg('Đã lưu ✓');onSaved?.();setTimeout(()=>setMsg(''),1800)
    } finally {setSaving(false)}
  }
  const form=<div className="knowledgeCaptureForm">
    <div className="captureTitle"><div><span className="eyebrow">LƯU TRI THỨC</span><h2>Thêm kiến thức mới</h2><p>Chỉ cần Tiêu đề hoặc Nội dung. Ngày giờ được lưu tự động.</p></div><span className="autoTime">◷ Tự lưu ngày giờ</span></div>
    <label className="fullField">Nội dung<textarea rows={inline?4:7} value={content} onChange={e=>setContent(e.target.value)} placeholder="Ghi lại kiến thức, kết luận, đoạn code, ý tưởng… (có thể để trống)"/></label>
    <label className="fullField">Tiêu đề<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Tên kiến thức… (có thể chỉ nhập tiêu đề)"/></label>
    <div className="captureMetaGrid">
      <label>Topic<input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="React, Vercel, PES…"/></label>
      <label>Category<input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Học tập, Công việc…"/></label>
      <label>Tag<input value={tags} onChange={e=>setTags(e.target.value)} placeholder="nextjs, deploy, api"/></label>
      <label>Nguồn <span className="optional">(tùy chọn)</span><input value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="https://…"/></label>
    </div>
    <div className="captureBottom"><span className={msg.startsWith('Đã')?'saveOk':''}>{msg}</span><button className="primary" disabled={saving} onClick={save}>{saving?'Đang lưu…':'Lưu tri thức'}</button></div>
  </div>
  return inline?<section className="knowledgeCaptureCard">{form}</section>:form
}
