import { hasSession } from '../../diary-auth';
import { getRuntimeSecrets } from '#platform';
import { issueTicket, verifyTicket } from '../../write-ticket';
import { getDb } from '../../../db';
import { preferences, doses } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { defaults, validDate, slotIds } from '../../model';
export const dynamic = 'force-dynamic';
// Resolve the single diary stored in this database.
async function diaryUserId(){
 const db=getDb();const p=await db.select({userId:preferences.userId}).from(preferences).limit(2);
 if(p.length>1) throw Error('Обнаружено несколько дневников; требуется выбрать основной');
 if(p[0]) return p[0].userId;
 const m=await db.select({userId:doses.userId}).from(doses).limit(1);
 return m[0]?.userId||'shared-diary';
}
function signingSecret(){const secret=getRuntimeSecrets().DIARY_ACTION_SECRET;if(!secret)throw Error('Не настроен ключ доступа дневника');return secret;}
export async function GET() {
 if(!await hasSession())return Response.json({error:'Требуется вход'},{status:401,headers:{'Cache-Control':'no-store'}});
 const user={userId:await diaryUserId()};
 const db=getDb(); const [p,marks]=await Promise.all([db.select().from(preferences).where(eq(preferences.userId,user.userId)),db.select().from(doses).where(eq(doses.userId,user.userId))]);
 return Response.json({settings:p[0]?JSON.parse(p[0].data):defaults,marks,writeTicket:await issueTicket(signingSecret())},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:Request) {
 if(!await hasSession())return Response.json({error:'Требуется вход'},{status:401});
 if(!await verifyTicket(signingSecret(),(req.headers.get('authorization')||'').replace(/^Bearer /,'')))return Response.json({error:'Обновите страницу и повторите сохранение'},{status:403});
 const user={userId:await diaryUserId()};
 if(req.headers.get('origin') && req.headers.get('origin')!==new URL(req.url).origin) return Response.json({error:'Недопустимый запрос'},{status:403});
 try {
 const body=await req.json() as {type:string;date:string;slot:string;taken:boolean;dose?:string;settings:import('../../model').Settings}; const db=getDb();
 if(body.type==='mark') {
 if(!validDate(body.date)||!slotIds.includes(body.slot)||typeof body.taken!=='boolean') throw Error('Некорректная отметка');
 if(body.slot==='sedoxil-night' && body.taken && !['0.5','1'].includes(body.dose||'')) throw Error('Выберите ½ или 1 таблетку Sedoxil');
 const dose=body.slot==='sedoxil-night' && body.taken ? body.dose! : null;
 await db.insert(doses).values({userId:user.userId,date:body.date,slot:body.slot,taken:body.taken?1:0,dose}).onConflictDoUpdate({target:[doses.userId,doses.date,doses.slot],set:{taken:body.taken?1:0,dose}});
 } else if(body.type==='settings') {
 const s=body.settings;
 if(!s || (s.showPackageImages!==undefined&&typeof s.showPackageImages!=='boolean') || !['sedoxil','neurocalmin'].includes(s.night)||!s.courses) throw Error('Некорректные настройки');
 for(const key of ['pramistar','magnilon','mydocalm','sedoxil','neurocalmin']) {const c=s.courses[key]; if(!c||!validDate(c.start)||!Number.isInteger(c.days)||c.days<1||c.days>365) throw Error('Проверьте даты и длительность курса');}
 const data=JSON.stringify({night:s.night,courses:s.courses,showPackageImages:s.showPackageImages!==false});
 await db.insert(preferences).values({userId:user.userId,data}).onConflictDoUpdate({target:preferences.userId,set:{data}});
 } else throw Error('Неизвестное действие');
 return Response.json({ok:true});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Не удалось сохранить'},{status:400})}
}
