import { sessionCookieOptions } from '../../session-cookie';
import { credentialsMatch,createSession,sessionAge } from '../../diary-auth';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 const origin=new URL(req.url).origin;
 if(req.headers.get('origin')!==origin)return new Response('Недопустимый запрос',{status:403});
 const form=await req.formData();const login=String(form.get('login')||''),password=String(form.get('password')||'');
 if(login.length>100||password.length>200||!await credentialsMatch(login,password))return new Response(null,{status:303,headers:{Location:'/login?error=1','Cache-Control':'no-store'}});
 const cookie=sessionCookieOptions(new URL(req.url).host);
 return new Response(null,{status:303,headers:{Location:'/', 'Cache-Control':'no-store','Set-Cookie':`${cookie.name}=${await createSession()}; ${cookie.attributes}; Max-Age=${sessionAge}`}});
}
