export type ProviderType = 'gemini' | 'openai' | 'groq' | 'xai' | 'anthropic' | 'openrouter' | 'deepseek' | 'mistral' | 'custom'
export type ProviderAccount = { id:string, provider:ProviderType, name?:string, enabled?:boolean, apiKey?:string, model?:string, baseUrl?:string, priority?:number }
export type AISettingsPayload = { activeAccount?: 'auto' | string, autoRotate?: boolean, accounts?: ProviderAccount[] }

function buildPrompt(question: string, context: string) {
  return `Bạn là AI của Second Brain cá nhân. Trả lời bằng tiếng Việt.\n\nNGUYÊN TẮC:\n- Ưu tiên tuyệt đối dữ liệu trong CONTEXT.\n- Nếu context không đủ, nói rõ phần nào chưa có trong bộ nhớ.\n- Không bịa nguồn.\n- Cuối câu trả lời, liệt kê nguồn theo [1], [2]... nếu có.\n\nCONTEXT:\n${context || '(Không tìm thấy dữ liệu phù hợp trong Second Brain)'}\n\nCÂU HỎI:\n${question}`
}

async function readJsonOrText(res: Response) { const t=await res.text(); try{return JSON.parse(t)}catch{return {raw:t}} }

async function callGemini(key:string, model:string, prompt:string) {
  const m=model.replace(/^models\//,'')
  const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}]})})
  const d=await readJsonOrText(res); if(!res.ok) throw new Error(`Gemini ${res.status}: ${d.error?.message||d.raw||'API error'}`)
  return (d.candidates?.[0]?.content?.parts||[]).map((p:any)=>p.text||'').join('\n').trim()
}

async function callOpenAIResponses(key:string, model:string, prompt:string) {
  const res=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({model,input:prompt,store:false})})
  const d=await readJsonOrText(res); if(!res.ok) throw new Error(`OpenAI ${res.status}: ${d.error?.message||d.raw||'API error'}`)
  if(d.output_text) return String(d.output_text).trim(); return (d.output||[]).flatMap((i:any)=>i.content||[]).map((p:any)=>p.text||'').filter(Boolean).join('\n').trim()
}

async function callAnthropic(key:string, model:string, prompt:string) {
  const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},body:JSON.stringify({model,max_tokens:4096,messages:[{role:'user',content:prompt}]})})
  const d=await readJsonOrText(res); if(!res.ok) throw new Error(`Anthropic ${res.status}: ${d.error?.message||d.raw||'API error'}`)
  return (d.content||[]).map((x:any)=>x.text||'').filter(Boolean).join('\n').trim()
}

function compatibleBase(provider:ProviderType, custom?:string) {
  if(provider==='groq') return 'https://api.groq.com/openai/v1'
  if(provider==='xai') return 'https://api.x.ai/v1'
  if(provider==='openrouter') return 'https://openrouter.ai/api/v1'
  if(provider==='deepseek') return 'https://api.deepseek.com/v1'
  if(provider==='mistral') return 'https://api.mistral.ai/v1'
  return (custom||'').replace(/\/$/,'')
}
async function callCompatible(provider:ProviderType,key:string,model:string,prompt:string,baseUrl?:string) {
  const base=compatibleBase(provider,baseUrl); if(!base) throw new Error('Custom API chưa có Base URL.')
  const res=await fetch(`${base}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({model,messages:[{role:'user',content:prompt}]})})
  const d=await readJsonOrText(res); if(!res.ok) throw new Error(`${provider} ${res.status}: ${d.error?.message||d.message||d.raw||'API error'}`)
  return String(d.choices?.[0]?.message?.content||'').trim()
}

export function defaultModel(p:ProviderType) {
  return ({gemini:'gemini-3.5-flash',openai:'gpt-5.6',groq:'openai/gpt-oss-20b',xai:'grok-4.5',anthropic:'claude-sonnet-5',openrouter:'anthropic/claude-sonnet-5',deepseek:'deepseek-chat',mistral:'mistral-large-latest',custom:'your-model'} as Record<ProviderType,string>)[p]
}

function orderedAccounts(settings?:AISettingsPayload) {
  let a=(settings?.accounts||[]).filter(x=>x.enabled!==false&&x.apiKey?.trim()).sort((x,y)=>(x.priority??100)-(y.priority??100))
  if(settings?.activeAccount&&settings.activeAccount!=='auto') a=[...a].sort((x,y)=>x.id===settings.activeAccount?-1:y.id===settings.activeAccount?1:0)
  if(settings?.autoRotate===false) a=a.slice(0,1)
  return a
}

export async function answerWithProviders(question:string, context:string, settings?:AISettingsPayload) {
  const prompt=buildPrompt(question,context), accounts=orderedAccounts(settings); if(!accounts.length) return null
  const errors:string[]=[]
  for(const a of accounts){ const key=a.apiKey!.trim(), model=(a.model||'').trim()||defaultModel(a.provider)
    try { let text=''; if(a.provider==='gemini') text=await callGemini(key,model,prompt); else if(a.provider==='openai') text=await callOpenAIResponses(key,model,prompt); else if(a.provider==='anthropic') text=await callAnthropic(key,model,prompt); else text=await callCompatible(a.provider,key,model,prompt,a.baseUrl)
      if(text) return {text,provider:a.provider,model,accountId:a.id,accountName:a.name||a.id}; errors.push(`${a.name||a.provider}: không có nội dung trả về`) }
    catch(e:any){ errors.push(`${a.name||a.provider}: ${e?.message||'lỗi không xác định'}`) }
  }
  throw new Error(errors.join(' | ')||'Không có tài khoản AI khả dụng.')
}

export async function createEmbeddingWithSettings(text:string, settings?:AISettingsPayload):Promise<number[]|null> {
  const accounts=orderedAccounts({...settings,autoRotate:true})
  for(const a of accounts.filter(x=>x.provider==='openai')) { try { const r=await fetch('https://api.openai.com/v1/embeddings',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${a.apiKey!.trim()}`},body:JSON.stringify({model:'text-embedding-3-small',input:text,dimensions:1536})}); if(r.ok)return (await r.json()).data?.[0]?.embedding??null }catch{} }
  for(const a of accounts.filter(x=>x.provider==='gemini')) { try { const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':a.apiKey!.trim()},body:JSON.stringify({model:'models/gemini-embedding-001',content:{parts:[{text}]},embedContentConfig:{outputDimensionality:1536}})}); if(r.ok)return (await r.json()).embedding?.values??null }catch{} }
  return null
}
