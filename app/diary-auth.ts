import { getRuntimeSecrets } from '#platform';
import { cookies, headers } from 'next/headers';
import { sessionCookieOptions } from './session-cookie';
const encoder=new TextEncoder();
export const sessionAge=30*24*60*60;
const secrets=getRuntimeSecrets;
async function signingKey(){const secret=secrets().DIARY_ACTION_SECRET;if(!secret)throw Error('Не настроен вход');return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function credentialsMatch(login:string,password:string){const s=secrets();if(!s.DIARY_LOGIN||!s.DIARY_PASSWORD)return false;const a=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(JSON.stringify([login,password]))));const b=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(JSON.stringify([s.DIARY_LOGIN,s.DIARY_PASSWORD]))));let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;}
export async function createSession(){const expiry=String(Date.now()+sessionAge*1000);const signature=await crypto.subtle.sign('HMAC',await signingKey(),encoder.encode('diary-session:'+expiry));return expiry+'.'+Array.from(new Uint8Array(signature),b=>b.toString(16).padStart(2,'0')).join('');}
export async function hasSession(){const value=(await cookies()).get(sessionCookieOptions((await headers()).get('host') || '').name)?.value||'';const [expiry,signature]=value.split('.');if(!/^\d+$/.test(expiry||'')||Number(expiry)<Date.now()||Number(expiry)>Date.now()+sessionAge*1000||!(/^[a-f0-9]{64}$/.test(signature||'')))return false;return crypto.subtle.verify('HMAC',await signingKey(),Uint8Array.from(signature.match(/../g)!,b=>parseInt(b,16)),encoder.encode('diary-session:'+expiry));}
