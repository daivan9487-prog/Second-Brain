export type ProviderType='gemini'|'openai'|'groq'|'xai'|'anthropic'|'openrouter'|'deepseek'|'mistral'|'custom'
export type PublicAIAccount={id:string;provider:ProviderType;name:string;enabled:boolean;model:string;baseUrl?:string;priority:number;last4:string;createdAt?:string;updatedAt?:string}
export type ClientAISettings={activeAccount:'auto'|string;autoRotate:boolean;accounts:PublicAIAccount[]}
export const providerCatalog:Record<ProviderType,{name:string;hint:string;model:string;placeholder:string;baseUrl?:string;apiUrl?:string;docsUrl?:string}>={
 gemini:{name:'Gemini',hint:'Google AI Studio',model:'gemini-3.5-flash',placeholder:'AIza…',apiUrl:'https://aistudio.google.com/api-keys',docsUrl:'https://ai.google.dev/gemini-api/docs/api-key'},
 openai:{name:'OpenAI / ChatGPT',hint:'OpenAI Platform',model:'gpt-5.6',placeholder:'sk-…',apiUrl:'https://platform.openai.com/api-keys',docsUrl:'https://help.openai.com/en/articles/4936850-where-do-i-find-my-api-key'},
 groq:{name:'Groq',hint:'GroqCloud',model:'openai/gpt-oss-20b',placeholder:'gsk_…',apiUrl:'https://console.groq.com/keys',docsUrl:'https://console.groq.com/docs/quickstart'},
 xai:{name:'Grok (xAI)',hint:'xAI Console',model:'grok-4.5',placeholder:'xai-…',apiUrl:'https://console.x.ai/',docsUrl:'https://docs.x.ai/'},
 anthropic:{name:'Claude',hint:'Claude Platform / Anthropic API',model:'claude-sonnet-5',placeholder:'sk-ant-…',apiUrl:'https://platform.claude.com/settings/keys',docsUrl:'https://docs.anthropic.com/'},
 openrouter:{name:'OpenRouter',hint:'Nhiều model qua một API',model:'anthropic/claude-sonnet-5',placeholder:'sk-or-…',apiUrl:'https://openrouter.ai/settings/keys',docsUrl:'https://openrouter.ai/docs/quickstart'},
 deepseek:{name:'DeepSeek',hint:'DeepSeek Platform',model:'deepseek-chat',placeholder:'sk-…',apiUrl:'https://platform.deepseek.com/api_keys',docsUrl:'https://api-docs.deepseek.com/'},
 mistral:{name:'Mistral',hint:'Mistral La Plateforme',model:'mistral-large-latest',placeholder:'…',apiUrl:'https://console.mistral.ai/api-keys/',docsUrl:'https://docs.mistral.ai/'},
 custom:{name:'Custom API',hint:'OpenAI-compatible endpoint',model:'your-model',placeholder:'API key',baseUrl:'https://example.com/v1'}
}
export async function loadAISettings():Promise<ClientAISettings>{const r=await fetch('/api/ai/vault',{cache:'no-store'});if(!r.ok)return{activeAccount:'auto',autoRotate:true,accounts:[]};return await r.json()}
export async function savePreferences(activeAccount:string,autoRotate:boolean){return fetch('/api/ai/vault',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({preferences:true,activeAccount,autoRotate})})}

export async function importLegacyLocalAISettings(){
 if(typeof window==='undefined')return 0
 const uid=localStorage.getItem('sb_current_user_id')
 const keys=[uid?`second_brain_ai_settings_v2:${uid}`:'', 'second_brain_ai_settings_v2'].filter(Boolean)
 for(const storageKey of keys){
  try{const raw=localStorage.getItem(storageKey);if(!raw)continue;const old=JSON.parse(raw);const accounts=Array.isArray(old.accounts)?old.accounts.filter((a:any)=>a?.apiKey?.trim()):[];let imported=0
   for(const a of accounts){const r=await fetch('/api/ai/vault',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({provider:a.provider,name:a.name,apiKey:a.apiKey,model:a.model,baseUrl:a.baseUrl,priority:a.priority,enabled:a.enabled!==false})});if(r.ok)imported++}
   if(imported){await savePreferences(old.activeAccount||'auto',old.autoRotate!==false);localStorage.removeItem(storageKey);return imported}
  }catch{}
 }
 return 0
}
