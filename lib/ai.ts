export type ProviderId = 'gemini' | 'openai' | 'groq'

export type ProviderConfig = {
  id: ProviderId
  enabled?: boolean
  apiKey?: string
  model?: string
}

export type AISettingsPayload = {
  activeProvider?: ProviderId | 'auto'
  autoRotate?: boolean
  providers?: ProviderConfig[]
}

function buildPrompt(question: string, context: string) {
  return `Bạn là AI của Second Brain cá nhân. Trả lời bằng tiếng Việt.\n\nNGUYÊN TẮC:\n- Ưu tiên tuyệt đối dữ liệu trong CONTEXT.\n- Nếu context không đủ, nói rõ phần nào chưa có trong bộ nhớ.\n- Không bịa nguồn.\n- Cuối câu trả lời, liệt kê nguồn theo [1], [2]... nếu có.\n\nCONTEXT:\n${context || '(Không tìm thấy dữ liệu phù hợp trong Second Brain)'}\n\nCÂU HỎI:\n${question}`
}

async function callGemini(apiKey: string, model: string, prompt: string) {
  const cleanModel = model.replace(/^models\//, '')
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cleanModel)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return (data.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('\n').trim()
}

async function callOpenAI(apiKey: string, model: string, prompt: string) {
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, input: prompt, store: false })
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`)
  const data = await res.json()
  if (data.output_text) return String(data.output_text).trim()
  const parts = (data.output || []).flatMap((item: any) => item.content || [])
  return parts.map((p: any) => p.text || '').filter(Boolean).join('\n').trim()
}

async function callGroq(apiKey: string, model: string, prompt: string) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] })
  })
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return String(data.choices?.[0]?.message?.content || '').trim()
}

export async function answerWithProviders(question: string, context: string, settings?: AISettingsPayload) {
  const prompt = buildPrompt(question, context)
  const providers = (settings?.providers || []).filter(p => p.enabled !== false && p.apiKey?.trim())
  if (!providers.length) return null

  const active = settings?.activeProvider || 'auto'
  let ordered = providers
  if (active !== 'auto') ordered = [...providers].sort((a, b) => a.id === active ? -1 : b.id === active ? 1 : 0)
  if (settings?.autoRotate === false) ordered = ordered.slice(0, 1)

  const errors: string[] = []
  for (const p of ordered) {
    const key = p.apiKey!.trim()
    const model = (p.model || '').trim() || defaultModel(p.id)
    try {
      let text = ''
      if (p.id === 'gemini') text = await callGemini(key, model, prompt)
      if (p.id === 'openai') text = await callOpenAI(key, model, prompt)
      if (p.id === 'groq') text = await callGroq(key, model, prompt)
      if (text) return { text, provider: p.id, model }
      errors.push(`${p.id}: không có nội dung trả về`)
    } catch (e: any) {
      errors.push(e?.message || `${p.id}: lỗi không xác định`)
    }
  }
  throw new Error(errors.join(' | ') || 'Không có provider AI khả dụng.')
}

export function defaultModel(id: ProviderId) {
  if (id === 'gemini') return 'gemini-2.5-flash'
  if (id === 'openai') return 'gpt-5.6'
  return 'openai/gpt-oss-20b'
}

export async function createEmbeddingWithSettings(text: string, settings?: AISettingsPayload): Promise<number[] | null> {
  const providers = settings?.providers || []
  const openai = providers.find(p => p.id === 'openai' && p.enabled !== false && p.apiKey?.trim())
  if (openai) {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openai.apiKey!.trim()}` },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: text, dimensions: 1536 })
    })
    if (res.ok) return (await res.json()).data?.[0]?.embedding ?? null
  }

  const gemini = providers.find(p => p.id === 'gemini' && p.enabled !== false && p.apiKey?.trim())
  if (gemini) {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': gemini.apiKey!.trim() },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] },
        embedContentConfig: { outputDimensionality: 1536 }
      })
    })
    if (res.ok) return (await res.json()).embedding?.values ?? null
  }
  return null
}
