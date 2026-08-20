import AddKnowledge from '@/components/AddKnowledge'
import BrainChat from '@/components/BrainChat'
export default function Home(){return <>
  <header className="top"><div><span className="eyebrow">PERSONAL KNOWLEDGE OS</span><h1>Bộ não thứ 2 của bạn</h1><p>Lưu lại điều bạn học. Tìm lại trong vài giây. Dùng AI để biến trí nhớ thành hành động.</p></div><AddKnowledge/></header>
  <div className="stats"><div><span>KIẾN THỨC</span><strong>∞</strong><small>Lưu dài hạn</small></div><div><span>AI BRAIN</span><strong>RAG</strong><small>Trả lời từ dữ liệu riêng</small></div><div><span>NGUỒN</span><strong>1→N</strong><small>Luôn truy ngược được</small></div><div><span>DỮ LIỆU</span><strong>YOURS</strong><small>Không khóa vào model</small></div></div>
  <BrainChat/>
  <section className="featureGrid"><article><b>01</b><h3>Capture</h3><p>Lưu Knowledge theo Category → Topic, kèm Tags và nguồn.</p></article><article><b>02</b><h3>Brain Map</h3><p>Nhìn toàn bộ trí nhớ thành bản đồ 3D có thể xoay, zoom và tìm kiếm.</p></article><article><b>03</b><h3>Retrieve</h3><p>RAG + Gemini/OpenAI/Groq giúp lấy kiến thức ra bằng ngôn ngữ tự nhiên.</p></article></section>
</>}
