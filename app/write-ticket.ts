const enc=new TextEncoder();
async function key(secret:string){return crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
function hex(bytes:ArrayBuffer){return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
export async function issueTicket(secret:string){const expires=String(Date.now()+15*60*1000);return expires+'.'+hex(await crypto.subtle.sign('HMAC',await key(secret),enc.encode(expires)));}
export async function verifyTicket(secret:string,ticket:string){const [expires,signature]=ticket.split('.');if(!/^\d+$/.test(expires||'')||!Number.isFinite(Number(expires))||Number(expires)<Date.now()||Number(expires)>Date.now()+16*60*1000||!(/^[a-f0-9]{64}$/.test(signature||'')))return false;const bytes=Uint8Array.from(signature.match(/../g)!,b=>parseInt(b,16));return crypto.subtle.verify('HMAC',await key(secret),bytes,enc.encode(expires));}
