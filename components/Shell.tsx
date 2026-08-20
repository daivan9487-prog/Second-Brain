'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  ['/', '⌂', 'Tổng quan'],
  ['/library', '▤', 'Thư viện'],
  ['/projects', '◈', 'Dự án']
]

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brain">∞</div><div><b>SECOND BRAIN</b><span>Personal Knowledge OS</span></div></div>
      <nav>{nav.map(([href, icon, label]) => <Link key={href} className={path === href ? 'active' : ''} href={href}><i>{icon}</i>{label}</Link>)}</nav>
      <div className="sideCard"><b>AI Brain</b><p>Hỏi lại kiến thức bạn đã lưu, không phụ thuộc trí nhớ tạm của AI.</p></div>
    </aside>
    <main className="main">{children}</main>
  </div>
}
