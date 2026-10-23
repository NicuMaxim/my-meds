import Tracker from './tracker';
import { hasSession } from './diary-auth';
import { redirect } from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page(){if(!await hasSession())redirect('/login');return <Tracker/>;}
