export const AI_SETTINGS_KEY = 'second_brain_ai_settings_v2'
export const LEGACY_AI_SETTINGS_KEY = 'second_brain_ai_settings_v1'

export type ProviderType = 'gemini' | 'openai' | 'groq' | 'xai' | 'anthropic' | 'openrouter' | 'deepseek' | 'mistral' | 'custom'

export type ClientProviderAccount = {
  id: string
  provider: ProviderType
  name: string
  enabled: boolean
  apiKey: string
  model: string
  baseUrl?: string
  priority: number
}

export type ClientAISettings = {
  activeAccount: 'auto' | string
  autoRotate: boolean
  accounts: ClientProviderAccount[]
}

export const providerCatalog: Record<ProviderType, {name:string, hint:string, model:string, placeholder:string, baseUrl?:string}> = {
  gemini: { name:'Gemini', hint:'Google AI Studio', model:'gemini-3.5-flash', placeholder:'AIza…' },
  openai: { name:'OpenAI / ChatGPT', hint:'OpenAI API', model:'gpt-5.6', placeholder:'sk-…' },
  groq: { name:'Groq', hint:'GroqCloud', model:'openai/gpt-oss-20b', placeholder:'gsk_…' },
  xai: { name:'Grok (xAI)', hint:'xAI API', model:'grok-4.5', placeholder:'xai-…' },
  anthropic: { name:'Claude', hint:'Anthropic API (dùng model Claude; Claude Code là ứng dụng)', model:'claude-sonnet-5', placeholder:'sk-ant-…' },
  openrouter: { name:'OpenRouter', hint:'Nhiều model qua một API', model:'anthropic/claude-sonnet-5', placeholder:'sk-or-…' },
  deepseek: { name:'DeepSeek', hint:'DeepSeek API', model:'deepseek-chat', placeholder:'sk-…' },
  mistral: { name:'Mistral', hint:'Mistral AI API', model:'mistral-large-latest', placeholder:'…' },
  custom: { name:'Custom API', hint:'OpenAI-compatible endpoint', model:'your-model', placeholder:'API key', baseUrl:'https://example.com/v1' }
}

function makeId(provider: ProviderType) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${provider}-${crypto.randomUUID()}`
  return `${provider}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function makeAccount(provider: ProviderType, index = 1): ClientProviderAccount {
  const p = providerCatalog[provider]
  return { id: makeId(provider), provider, name: `${p.name} #${index}`, enabled: true, apiKey: '', model: p.model, baseUrl: p.baseUrl, priority: 100 }
}

export const defaultAISettings: ClientAISettings = {
  activeAccount: 'auto',
  autoRotate: true,
  accounts: [makeAccount('gemini'), makeAccount('openai'), makeAccount('groq'), makeAccount('xai'), makeAccount('anthropic')]
}

function migrateLegacy(saved: any): ClientAISettings | null {
  if (!saved?.providers) return null
  const accounts = (saved.providers as any[]).map((p, i) => ({
    id: makeId(p.id as ProviderType), provider: p.id as ProviderType, name: `${providerCatalog[p.id as ProviderType]?.name || p.id} #1`,
    enabled: p.enabled !== false, apiKey: p.apiKey || '', model: p.model || providerCatalog[p.id as ProviderType]?.model || '', priority: 100 + i
  })).filter(x => providerCatalog[x.provider])
  return { activeAccount:'auto', autoRotate:saved.autoRotate !== false, accounts }
}

export function loadAISettings(): ClientAISettings {
  if (typeof window === 'undefined') return defaultAISettings
  try {
    const raw = localStorage.getItem(AI_SETTINGS_KEY)
    if (raw) {
      const s = JSON.parse(raw)
      if (Array.isArray(s.accounts)) return { ...defaultAISettings, ...s, accounts:s.accounts }
    }
    const legacyRaw = localStorage.getItem(LEGACY_AI_SETTINGS_KEY)
    if (legacyRaw) {
      const migrated = migrateLegacy(JSON.parse(legacyRaw))
      if (migrated) { localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(migrated)); return migrated }
    }
  } catch {}
  return defaultAISettings
}

export function saveAISettings(settings: ClientAISettings) {
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings))
  window.dispatchEvent(new Event('second-brain-ai-settings'))
}
