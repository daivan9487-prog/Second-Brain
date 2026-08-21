'use client'
import { useEffect,useMemo,useState } from 'react'
import { useAuth } from '@/components/AuthGate'

const LEVELS=[90,100,110,120,130]

export default function FontSizeControl({compact=false}:{compact?:boolean}){
  const {user}=useAuth()
  const storageKey=useMemo(()=>user?.id?`sb_ui_scale_${user.id}`:'sb_ui_scale_guest',[user?.id])
  const [value,setValue]=useState(110)

  useEffect(()=>{
    if(!user?.id)return
    const raw=Number(localStorage.getItem(storageKey)||110)
    const next=LEVELS.includes(raw)?raw:110
    setValue(next)
    document.documentElement.style.setProperty('--ui-scale',String(next/100))
  },[storageKey,user?.id])

  function apply(next:number){
    const safe=LEVELS.reduce((best,n)=>Math.abs(n-next)<Math.abs(best-next)?n:best,110)
    setValue(safe)
    localStorage.setItem(storageKey,String(safe))
    document.documentElement.style.setProperty('--ui-scale',String(safe/100))
  }
  function step(dir:-1|1){
    const i=Math.max(0,LEVELS.indexOf(value))
    apply(LEVELS[Math.max(0,Math.min(LEVELS.length-1,i+dir))])
  }

  if(compact)return <div className="fontControl compact" title="Cỡ chữ của tài khoản này"><button onClick={()=>step(-1)} aria-label="Giảm cỡ chữ">A−</button><b>{value}%</b><button onClick={()=>step(1)} aria-label="Tăng cỡ chữ">A＋</button></div>
  return <div className="fontSettings"><div><span className="eyebrow">HIỂN THỊ</span><h2>Cỡ chữ</h2><p>Điều chỉnh riêng cho tài khoản này trên trình duyệt hiện tại.</p></div><div className="fontScaleRow"><button onClick={()=>step(-1)}>A−</button><strong>{value}%</strong><button onClick={()=>step(1)}>A＋</button><button className="fontReset" onClick={()=>apply(110)}>Mặc định</button></div><div className="fontLevels">{LEVELS.map(n=><button key={n} className={value===n?'active':''} onClick={()=>apply(n)}>{n}%</button>)}</div></div>
}
