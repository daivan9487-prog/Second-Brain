export const AI_SETTINGS_KEY = 'second_brain_ai_settings_v1'

export type ClientProvider = {
  id: 'gemini' | 'openai' | 'groq'
  name: string
  enabled: boolean
  apiKey: string
  model: string
}

export type ClientAISettings = {
  activeProvider: 'auto' | 'gemini' | 'openai' | 'groq'
  autoRotate: boolean
  providers: ClientProvider[]
}

export const defaultAISettings: ClientAISettings = {
  activeProvider: 'auto',
  autoRotate: true,
  providers: [
    { id: 'gemini', name: 'Gemini', enabled: true, apiKey: '', model: 'gemini-2.5-flash' },
    { id: 'openai', name: 'ChatGPT / OpenAI', enabled: true, apiKey: '', model: 'gpt-5.6' },
    { id: 'groq', name: 'Groq', enabled: true, apiKey: '', model: 'openai/gpt-oss-20b' }
  ]
}

export function loadAISettings(): ClientAISettings {
  if (typeof window === 'undefined') return defaultAISettings
  try {
    const raw = localStorage.getItem(AI_SETTINGS_KEY)
    if (!raw) return defaultAISettings
    const saved = JSON.parse(raw)
    return {
      ...defaultAISettings,
      ...saved,
      providers: defaultAISettings.providers.map(p => ({ ...p, ...(saved.providers || []).find((x: any) => x.id === p.id) }))
    }
  } catch { return defaultAISettings }
}

export function saveAISettings(settings: ClientAISettings) {
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings))
  window.dispatchEvent(new Event('second-brain-ai-settings'))
}
