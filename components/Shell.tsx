'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  ['/', '⌂', 'Tổng quan'],
  ['/brain-map', '◉', 'Brain Map'],
  ['/library', '▤', 'Thư viện'],
  ['/projects', '◈', 'Dự án']
]

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brainLogo">∞</div><div><b>SECOND BRAIN</b><span>Personal Knowledge OS</span></div></div>
      <nav>{nav.map(([href, icon, label]) => <Link key={href} className={path === href ? 'active' : ''} href={href}><i>{icon}</i>{label}</Link>)}</nav>
      <div className="sideCard"><b>AI Brain</b><p>Hỏi lại kiến thức bạn đã lưu. Brain Map sẽ giúp bạn nhìn thấy các cụm trí nhớ liên quan.</p></div>
    </aside>
    <main className="main">{children}</main>
  </div>
}
