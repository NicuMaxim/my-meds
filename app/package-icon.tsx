'use client';
import {useState} from 'react';
import {Pill} from 'lucide-react';
export default function PackageIcon({id,name,enabled}:{id:string;name:string;enabled:boolean}){const [failed,setFailed]=useState(false);const show=enabled&&!failed;return <span className={'medicon'+(show?' packagephoto':'')}>{show?<img src={`/medicines/${id}.jpg`} alt={name} width={88} height={72} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:<Pill/>}</span>;}
