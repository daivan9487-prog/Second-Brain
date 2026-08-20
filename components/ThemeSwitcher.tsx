'use client'
import { useEffect, useState } from 'react'
const themes=[
  ['light','Sáng','☀'],['neon','Neon','✦'],['warm','Ấm','◐'],['midnight','Đêm','◒']
] as const
export default function ThemeSwitcher(){
  const [theme,setTheme]=useState('light')
  useEffect(()=>{const saved=localStorage.getItem('second_brain_theme')||'light';setTheme(saved);document.documentElement.dataset.theme=saved},[])
  function pick(v:string){setTheme(v);localStorage.setItem('second_brain_theme',v);document.documentElement.dataset.theme=v}
  return <div className="themeSwitch" title="Chọn giao diện">{themes.map(([v,label,icon])=><button key={v} className={theme===v?'active':''} onClick={()=>pick(v)} aria-label={label}>{icon}</button>)}</div>
}
