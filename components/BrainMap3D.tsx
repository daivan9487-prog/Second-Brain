'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

type K = { id:string,title:string,content:string,category?:string,topic?:string|null,tags?:string[],metadata?:any,source_url?:string|null }

function hash(s:string){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed:number){return()=>((seed=Math.imul(seed^seed>>>15,1|seed),seed^=seed+Math.imul(seed^seed>>>7,61|seed),((seed^seed>>>14)>>>0)/4294967296))}
function norm(s:string){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase()}

export default function BrainMap3D({items}:{items:K[]}){
 const host=useRef<HTMLDivElement>(null); const [query,setQuery]=useState(''); const [selected,setSelected]=useState<K|null>(null)
 const filtered=useMemo(()=>{const q=norm(query).trim();if(!q)return items;return items.filter(x=>norm([x.category,x.topic,x.title,x.content,(x.tags||x.metadata?.tags||[]).join(' ')].join(' ')).includes(q))},[items,query])
 useEffect(()=>{
  if(!host.current)return; const el=host.current; el.innerHTML=''
  const scene=new THREE.Scene(); const camera=new THREE.PerspectiveCamera(42,Math.max(1,el.clientWidth)/Math.max(1,el.clientHeight),.1,100); camera.position.set(0,0,6.2)
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,1.6)); renderer.setSize(el.clientWidth,el.clientHeight); el.appendChild(renderer.domElement)
  const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.enablePan=false; controls.minDistance=3; controls.maxDistance=10
  scene.add(new THREE.AmbientLight(0x9fffe0,1.2)); const light=new THREE.PointLight(0x80ffcc,5,12); light.position.set(3,4,5); scene.add(light)
  const root=new THREE.Group(); root.rotation.z=-.08; scene.add(root)
  const coreMat=new THREE.PointsMaterial({color:0x49cfa6,size:.018,transparent:true,opacity:.34,sizeAttenuation:true})
  const pts:number[]=[]; const r=rng(73421)
  for(let l=0;l<2;l++) for(let i=0;i<1150;i++){
    const u=r()*2-1, a=r()*Math.PI*2, rr=Math.cbrt(r()); const x=(Math.sqrt(1-u*u)*Math.cos(a))*1.32*rr+(l?-.72:.72); const y=u*1.05*rr; const z=Math.sqrt(1-u*u)*Math.sin(a)*.82*rr
    if(Math.abs(x)<.18&&r()>.25)continue; pts.push(x,y,z)
  }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3)); root.add(new THREE.Points(geo,coreMat))
  const nodeGeo=new THREE.SphereGeometry(.055,12,12); const nodeMat=new THREE.MeshStandardMaterial({color:0x80ffcc,emissive:0x1b7a5e,emissiveIntensity:1.5}); const mesh=new THREE.InstancedMesh(nodeGeo,nodeMat,Math.max(1,items.length)); const dummy=new THREE.Object3D(); const positions:THREE.Vector3[]=[]
  items.forEach((item,i)=>{const rr=rng(hash(item.id||item.title)); const side=rr()>.5?1:-1; const theta=rr()*Math.PI*2, phi=(rr()-.5)*1.45; const p=new THREE.Vector3(side*(.68+.72*Math.abs(Math.cos(theta)))+.18*Math.cos(theta),Math.sin(phi)*.92,Math.sin(theta)*.72); positions.push(p);dummy.position.copy(p); dummy.updateMatrix(); mesh.setMatrixAt(i,dummy.matrix)})
  mesh.count=items.length; root.add(mesh)
  const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(); const click=(e:MouseEvent)=>{const rect=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height)*2+1);ray.setFromCamera(mouse,camera);const hit=ray.intersectObject(mesh,false)[0];if(hit?.instanceId!=null)setSelected(items[hit.instanceId]||null)}; renderer.domElement.addEventListener('click',click)
  let af=0; const loop=()=>{controls.update();root.rotation.y+=.0008;renderer.render(scene,camera);af=requestAnimationFrame(loop)};loop()
  const ro=new ResizeObserver(()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=Math.max(1,w)/Math.max(1,h);camera.updateProjectionMatrix()});ro.observe(el)
  return()=>{cancelAnimationFrame(af);ro.disconnect();renderer.domElement.removeEventListener('click',click);controls.dispose();renderer.dispose();geo.dispose();nodeGeo.dispose();nodeMat.dispose();coreMat.dispose();el.innerHTML=''}
 },[items])
 return <div className="brainMapShell">
   <div className="brainMapToolbar"><div><span className="eyebrow">VISUAL MEMORY</span><h2>Brain Map 3D</h2></div><div className="brainSearch"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm Category, Topic, Tags, nội dung..."/><span>{filtered.length}/{items.length} node</span></div></div>
   <div className="brainViewport" ref={host}/>
   {query && <div className="brainResults">{filtered.slice(0,8).map(x=><button key={x.id} onClick={()=>setSelected(x)}><b>{x.title}</b><span>{x.category||'General'} · {x.topic||x.metadata?.topic||'No topic'}</span></button>)}</div>}
   {selected&&<aside className="brainDetail"><button className="iconBtn" onClick={()=>setSelected(null)}>×</button><span className="eyebrow">{selected.category||'GENERAL'}</span><h3>{selected.title}</h3><small>{selected.topic||selected.metadata?.topic||''}</small><p>{selected.content}</p><div className="tagRow">{(selected.tags||selected.metadata?.tags||[]).map((t:string)=><i key={t}>#{t}</i>)}</div>{selected.source_url&&<a href={selected.source_url} target="_blank">Mở nguồn ↗</a>}</aside>}
 </div>
}
