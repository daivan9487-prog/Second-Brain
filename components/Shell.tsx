'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeSwitcher from '@/components/ThemeSwitcher'

const nav = [
  ['/', '⌂', 'Tổng quan'],
  ['/brain-map', '◉', 'Brain Map'],
  ['/library', '▤', 'Kho tri thức'],
  ['/ai-models', '✦', 'AI Models'],
  ['/projects', '◈', 'Dự án']
]
export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brainLogo">∞</div><div><b>SECOND BRAIN</b><span>Personal Knowledge OS</span></div></div>
      <button className="quickCapture" onClick={()=>window.dispatchEvent(new Event('second-brain-open-capture'))}><b>＋</b> Ghi chú nhanh <kbd>⌘K</kbd></button>
      <nav>{nav.map(([href, icon, label]) => <Link key={href} className={path === href ? 'active' : ''} href={href}><i>{icon}</i>{label}{href==='/ai-models'&&<em>MỚI</em>}</Link>)}</nav>
      <div className="sidebarFoot">
        <div className="sideCard"><span className="statusDot"/> <div><b>Second Brain v0.6</b><p>Knowledge + Brain Map + Multi-AI</p></div></div>
        <ThemeSwitcher/>
      </div>
    </aside>
    <main className="main"><div className="topUtility"><div className="globalSearch">⌕ <input placeholder="Tìm kiếm kiến thức, dự án, ghi chú..."/><kbd>⌘K</kbd></div><ThemeSwitcher/></div>{children}</main>
  </div>
}
