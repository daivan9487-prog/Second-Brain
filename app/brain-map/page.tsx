'use client'
import { useEffect,useState } from 'react'
import BrainMap3D from '@/components/BrainMap3D'
export default function BrainMapPage(){const[items,setItems]=useState<any[]>([]);const[configured,setConfigured]=useState(true);useEffect(()=>{fetch('/api/knowledge').then(r=>r.json()).then(d=>{setItems(d.items||[]);setConfigured(d.configured!==false)})},[]);return <><header className="top"><div><span className="eyebrow">KNOWLEDGE GRAPH</span><h1>Bản đồ trí nhớ</h1><p>Mỗi điểm sáng là một kiến thức. Xoay, zoom và tìm kiếm để nhìn lại những gì bạn đã tích lũy.</p></div></header>{!configured&&<div className="notice">Supabase chưa được cấu hình.</div>}<BrainMap3D items={items}/></>}
