'use client'
import { useEffect, useState } from 'react'
import { defaultAISettings, loadAISettings, saveAISettings, type ClientAISettings } from '@/lib/client-ai-settings'

export default function AISettings() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<ClientAISettings>(defaultAISettings)
  const [testing, setTesting] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => setSettings(loadAISettings()), [])

  function patchProvider(id: string, patch: any) {
    setSettings(s => ({ ...s, providers: s.providers.map(p => p.id === id ? { ...p, ...patch } : p) }))
  }

  function persist() {
    saveAISettings(settings)
    setStatus('Đã lưu trên trình duyệt này ✓')
    setTimeout(() => setStatus(''), 2500)
  }

  async function test(id: string) {
    const provider = settings.providers.find(p => p.id === id)
    if (!provider?.apiKey.trim()) return setStatus(`Hãy nhập API key cho ${provider?.name}.`)
    setTesting(id); setStatus('Đang kiểm tra kết nối...')
    const one: ClientAISettings = { ...settings, activeProvider: id as any, autoRotate: false, providers: settings.providers.map(p => ({ ...p, enabled: p.id === id })) }
    try {
      const r = await fetch('/api/ai/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aiSettings: one }) })
      const d = await r.json()
      setStatus(r.ok ? `✓ ${provider.name} hoạt động — ${d.model}` : `✕ ${d.error || 'Kết nối thất bại'}`)
    } catch { setStatus('✕ Không kết nối được server.') }
    setTesting('')
  }

  return <>
    <button className="aiSettingsBtn" onClick={() => { setSettings(loadAISettings()); setOpen(true) }}>⚙ AI</button>
    {open && <div className="modalBg" onMouseDown={() => setOpen(false)}><div className="modal aiModal" onMouseDown={e => e.stopPropagation()}>
      <div className="modalHead"><div><h2>AI Providers</h2><p>Thêm API key trực tiếp trên web. Không cần đưa key lên Vercel.</p></div><button className="iconBtn" onClick={() => setOpen(false)}>×</button></div>

      <div className="aiModeRow">
        <label>Provider ưu tiên<select value={settings.activeProvider} onChange={e => setSettings(s => ({ ...s, activeProvider: e.target.value as any }))}><option value="auto">Tự động / xoay vòng</option><option value="gemini">Gemini</option><option value="openai">ChatGPT / OpenAI</option><option value="groq">Groq</option></select></label>
        <label className="toggleLabel"><input type="checkbox" checked={settings.autoRotate} onChange={e => setSettings(s => ({ ...s, autoRotate: e.target.checked }))}/><span>Tự chuyển model khi lỗi / hết quota</span></label>
      </div>

      <div className="providerList">{settings.providers.map(p => <div className="providerCard" key={p.id}>
        <div className="providerHead"><div><strong>{p.name}</strong><small>{p.id === 'gemini' ? 'Google AI Studio' : p.id === 'openai' ? 'OpenAI API' : 'OpenAI-compatible API'}</small></div><label className="switch"><input type="checkbox" checked={p.enabled} onChange={e => patchProvider(p.id,{enabled:e.target.checked})}/><span></span></label></div>
        <label>API key<input type="password" value={p.apiKey} onChange={e => patchProvider(p.id,{apiKey:e.target.value})} placeholder={p.id === 'gemini' ? 'AIza…' : p.id === 'openai' ? 'sk-…' : 'gsk_…'} autoComplete="off" /></label>
        <label>Model<input value={p.model} onChange={e => patchProvider(p.id,{model:e.target.value})} /></label>
        <button className="secondary" onClick={() => test(p.id)} disabled={testing===p.id}>{testing===p.id?'Đang test…':'Kiểm tra API'}</button>
      </div>)}</div>

      <div className="securityNote"><b>🔐 Cách lưu:</b> API key chỉ được lưu trong Local Storage của trình duyệt này và gửi tạm thời tới API route của chính website khi bạn hỏi AI. Server không ghi key vào Supabase hay Vercel.</div>
      <div className="modalFoot"><span>{status}</span><div className="buttonRow"><button className="secondary" onClick={() => { setSettings(defaultAISettings); setStatus('Đã đặt lại form. Bấm Lưu để xác nhận.') }}>Đặt lại</button><button className="primary" onClick={persist}>Lưu cấu hình AI</button></div></div>
    </div></div>}
  </>
}
