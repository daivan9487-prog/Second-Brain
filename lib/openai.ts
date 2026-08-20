export async function createEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  const model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, input: text })
  })
  if (!res.ok) throw new Error(`Embedding failed: ${await res.text()}`)
  const data = await res.json()
  return data.data?.[0]?.embedding ?? null
}

export async function answerWithContext(question: string, context: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  const model = process.env.OPENAI_MODEL || 'gpt-5-mini'
  const prompt = `Bạn là AI của Second Brain cá nhân. Trả lời bằng tiếng Việt.\n\nNGUYÊN TẮC:\n- Ưu tiên tuyệt đối dữ liệu trong CONTEXT.\n- Nếu context không đủ, nói rõ phần nào chưa có trong bộ nhớ.\n- Không bịa nguồn.\n- Cuối câu trả lời, liệt kê nguồn theo [1], [2]... nếu có.\n\nCONTEXT:\n${context || '(Không tìm thấy dữ liệu phù hợp trong Second Brain)'}\n\nCÂU HỎI:\n${question}`
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, input: prompt })
  })
  if (!res.ok) throw new Error(`AI failed: ${await res.text()}`)
  const data = await res.json()
  if (data.output_text) return data.output_text as string
  const parts = (data.output || []).flatMap((item: any) => item.content || [])
  return parts.map((p: any) => p.text || '').filter(Boolean).join('\n') || 'AI không trả về nội dung.'
}
