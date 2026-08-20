'use client'
import { useEffect, useMemo, useState } from 'react'
import { defaultAISettings, loadAISettings, makeAccount, providerCatalog, saveAISettings, type ClientAISettings, type ProviderType } from '@/lib/client-ai-settings'

const providerOrder: ProviderType[] = ['gemini','openai','groq','xai','anthropic','openrouter','deepseek','mistral','custom']

export default function AISettings(){
  const [open,setOpen]=useState(false),[settings,setSettings]=useState<ClientAISettings>(defaultAISettings),[testing,setTesting]=useState(''),[status,setStatus]=useState('')
  useEffect(()=>setSettings(loadAISettings()),[])
  const enabledCount=useMemo(()=>settings.accounts.filter(a=>a.enabled&&a.apiKey.trim()).length,[settings])

  function patch(id:string, p:any){setSettings(s=>({...s,accounts:s.accounts.map(a=>a.id===id?{...a,...p}:a)}))}
  function add(provider:ProviderType){const count=settings.accounts.filter(a=>a.provider===provider).length+1;setSettings(s=>({...s,accounts:[...s.accounts,makeAccount(provider,count)]}))}
  function remove(id:string){setSettings(s=>({...s,activeAccount:s.activeAccount===id?'auto':s.activeAccount,accounts:s.accounts.filter(a=>a.id!==id)}))}
  function persist(){saveAISettings(settings);setStatus(`Đã lưu ${enabledCount} tài khoản AI trên trình duyệt này ✓`);setTimeout(()=>setStatus(''),2600)}
  async function test(id:string){const account=settings.accounts.find(a=>a.id===id);if(!account?.apiKey.trim())return setStatus('Hãy nhập API key trước.');setTesting(id);setStatus('Đang kiểm tra…');const one={...settings,activeAccount:id,autoRotate:false,accounts:settings.accounts.map(a=>({...a,enabled:a.id===id}))};try{const r=await fetch('/api/ai/test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({aiSettings:one})});const d=await r.json();setStatus(r.ok?`✓ ${account.name} hoạt động — ${d.model}`:`✕ ${d.error||'Kết nối thất bại'}`)}catch{setStatus('✕ Không kết nối được server.')}setTesting('')}

  return <>
    <button className="aiSettingsBtn" onClick={()=>{setSettings(loadAISettings());setOpen(true)}}>⚙ AI</button>
    {open&&<div className="modalBg" onMouseDown={()=>setOpen(false)}><div className="modal aiModal wide" onMouseDown={e=>e.stopPropagation()}>
      <div className="modalHead"><div><h2>AI Accounts & API Keys</h2><p>Thêm nhiều tài khoản cho cùng một hãng và xoay vòng tự động khi key hết quota hoặc lỗi.</p></div><button className="iconBtn" onClick={()=>setOpen(false)}>×</button></div>
      <div className="aiModeRow">
        <label>Tài khoản ưu tiên<select value={settings.activeAccount} onChange={e=>setSettings(s=>({...s,activeAccount:e.target.value}))}><option value="auto">Tự động — theo Priority</option>{settings.accounts.map(a=><option key={a.id} value={a.id}>{a.name} · {a.model}</option>)}</select></label>
        <label className="toggleLabel"><input type="checkbox" checked={settings.autoRotate} onChange={e=>setSettings(s=>({...s,autoRotate:e.target.checked}))}/><span>Tự chuyển sang key/model tiếp theo khi lỗi hoặc hết quota</span></label>
      </div>

      <div className="providerAddBar"><span>Thêm tài khoản:</span>{providerOrder.map(p=><button key={p} className="providerChip" onClick={()=>add(p)}>+ {providerCatalog[p].name}</button>)}</div>

      <div className="accountList">{settings.accounts.map((a,idx)=>{const meta=providerCatalog[a.provider];return <div className="accountCard" key={a.id}>
        <div className="providerHead"><div><strong>{a.name}</strong><small>{meta.name} · {meta.hint}</small></div><div className="accountHeadActions"><label className="switch"><input type="checkbox" checked={a.enabled} onChange={e=>patch(a.id,{enabled:e.target.checked})}/><span></span></label><button className="dangerTiny" onClick={()=>remove(a.id)}>Xóa</button></div></div>
        <div className="accountGrid">
          <label>Tên tài khoản<input value={a.name} onChange={e=>patch(a.id,{name:e.target.value})}/></label>
          <label>Priority<input type="number" min="1" max="9999" value={a.priority} onChange={e=>patch(a.id,{priority:Number(e.target.value)||100})}/></label>
          <label className="span2">API key<input type="password" value={a.apiKey} onChange={e=>patch(a.id,{apiKey:e.target.value})} placeholder={meta.placeholder} autoComplete="off"/></label>
          <label className={a.provider==='custom'?'':'span2'}>Model<input value={a.model} onChange={e=>patch(a.id,{model:e.target.value})}/></label>
          {a.provider==='custom'&&<label>Base URL<input value={a.baseUrl||''} onChange={e=>patch(a.id,{baseUrl:e.target.value})} placeholder="https://host/v1"/></label>}
        </div>
        <button className="secondary" onClick={()=>test(a.id)} disabled={testing===a.id}>{testing===a.id?'Đang test…':'Kiểm tra API key này'}</button>
      </div>})}</div>

      <div className="securityNote"><b>🔐 API Vault trên trình duyệt:</b> key được lưu trong Local Storage của thiết bị này, không lưu vào Supabase/Vercel. Khi hỏi AI, website gửi key tạm tới API route để thực hiện request. Với website chia sẻ cho nhiều người, nên chuyển sang vault mã hóa phía server.</div>
      <div className="rotationNote"><b>↻ Thứ tự xoay vòng:</b> Priority nhỏ chạy trước. Ví dụ Gemini #1 = 10, Gemini #2 = 20, Grok #1 = 30, Claude #1 = 40. Nếu key đầu lỗi/429/hết quota, Brain tự thử key tiếp theo.</div>
      <div className="modalFoot"><span>{status}</span><div className="buttonRow"><button className="secondary" onClick={()=>setSettings(defaultAISettings)}>Đặt lại</button><button className="primary" onClick={persist}>Lưu cấu hình AI</button></div></div>
    </div></div>}
  </>
}
