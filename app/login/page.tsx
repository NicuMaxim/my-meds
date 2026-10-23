import LoginForm from './login-form';
import { redirect } from 'next/navigation';
import { hasSession } from '../diary-auth';
export const dynamic='force-dynamic';
export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){if(await hasSession())redirect('/');const params=await searchParams;return <LoginForm error={!!params.error}/>;}
