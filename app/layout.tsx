import type { Metadata } from 'next';
import './globals.css';
import { cookies } from 'next/headers';
import { LanguageProvider } from './i18n';
export const metadata:Metadata={title:'Мой курс · Дневник приёма',description:'Дневник приёма лекарств',robots:{index:false,follow:false},applicationName:'My Meds',manifest:'/site.webmanifest',appleWebApp:{capable:true,title:'My Meds',statusBarStyle:'default'},icons:{icon:[{url:'/favicon.ico',sizes:'any'},{url:'/favicon-32.png',type:'image/png',sizes:'32x32'}],apple:'/apple-touch-icon.png'}};
export default async function Layout({children}:{children:React.ReactNode}){const lang=(await cookies()).get('diary-language')?.value==='en'?'en':'ru';return <html lang={lang}><body><LanguageProvider initialLanguage={lang}>{children}</LanguageProvider></body></html>}
