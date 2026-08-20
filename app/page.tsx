import AddKnowledge from '@/components/AddKnowledge'
import BrainChat from '@/components/BrainChat'
import Link from 'next/link'
export default function Home(){return <>
  <header className="pageHeader homeHeader"><div><span className="eyebrow">PERSONAL KNOWLEDGE OS</span><h1>Bộ não thứ 2 của bạn</h1><p>Lưu điều bạn học, kết nối tri thức và gọi lại đúng lúc bằng AI.</p></div><AddKnowledge/></header>
  <div className="dashboardStats"><article><i>▤</i><span>TRÍ NHỚ</span><b>∞</b><small>Lưu dài hạn</small></article><article><i>◉</i><span>BRAIN MAP</span><b>3D</b><small>Nhìn thấy liên kết</small></article><article><i>✦</i><span>AI BRAIN</span><b>RAG</b><small>Trả lời từ dữ liệu riêng</small></article><article><i>↻</i><span>MULTI-AI</span><b>9</b><small>Provider có thể kết nối</small></article></div>
  <section className="dashboardGrid"><div className="activityPanel"><div className="sectionHeading"><div><span className="eyebrow">BẮT ĐẦU NHANH</span><h2>Không gian trí nhớ</h2></div></div><div className="quickCards"><Link href="/library"><i>▤</i><div><b>Kho tri thức</b><p>Category → Topic → Knowledge</p></div><span>→</span></Link><Link href="/brain-map"><i>◉</i><div><b>Brain Map 3D</b><p>Khám phá các node kiến thức</p></div><span>→</span></Link><Link href="/ai-models"><i>✦</i><div><b>AI Models</b><p>Gemini, OpenAI, Groq, Grok, Claude…</p></div><span>→</span></Link></div></div><div className="suggestPanel"><span className="eyebrow">AI GỢI Ý</span><h2>Luồng sử dụng tốt nhất</h2><ol><li><b>1</b><span>Lưu kiến thức ngay khi học được</span></li><li><b>2</b><span>Gắn Category, Topic và Tags</span></li><li><b>3</b><span>Hỏi AI Brain khi cần lấy lại</span></li><li><b>4</b><span>Backup định kỳ để giữ dữ liệu lâu dài</span></li></ol></div></section>
  <BrainChat/>
</>}
