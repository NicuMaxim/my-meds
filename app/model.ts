export const medicines = [
 {id:'pramistar',name:'Pramistar',dose:'1 таблетка',days:30,note:'Курс: 30–60 дней. Укажите назначенную вам длительность.'},
 {id:'magnilon',name:'Magnilon Forte',dose:'1 таблетка',days:30,note:'Два приёма в день: утром и вечером.'},
 {id:'mydocalm',name:'Mydocalm',dose:'1 таблетка',days:14,note:''},
 {id:'sedoxil',name:'Sedoxil',dose:'½–1 таблетка',days:30,note:'После 30 дней — по необходимости 2–3 раза в неделю. Дальнейшие приёмы можно отмечать в истории.'},
 {id:'neurocalmin',name:'Nervocalmin Somn Ușor',dose:'1 таблетка',days:30,note:'Альтернатива Sedoxil. Выберите свой вариант в настройках.'}
];
export const slots=[{id:'pramistar-am',med:'pramistar',group:'am',time:'09:00'},{id:'magnilon-am',med:'magnilon',group:'am',time:'08:00'},{id:'mydocalm-pm',med:'mydocalm',group:'pm',time:'18:00'},{id:'magnilon-pm',med:'magnilon',group:'pm',time:'20:00'},{id:'sedoxil-night',med:'sedoxil',group:'night',time:'22:00'},{id:'neurocalmin-night',med:'neurocalmin',group:'night',time:'Перед сном'}];
export const slotIds=slots.map(s=>s.id);
export const nightOptions=['sedoxil','neurocalmin','both'] as const;
export function validNight(value:unknown){return typeof value==='string'&&(nightOptions as readonly string[]).includes(value);}
export type Settings={showPackageImages?:boolean;night:string;courses:Record<string,{start:string;days:number}>};
export const defaults:Settings={showPackageImages:true,night:'sedoxil',courses:Object.fromEntries(medicines.map(m=>[m.id,{start:today(),days:m.days}]))};
export function validDate(d:unknown):d is string {return typeof d==='string'&&/^20\d{2}-\d{2}-\d{2}$/.test(d)&&!isNaN(Date.parse(d))&&new Date(d+'T12:00:00Z').toISOString().slice(0,10)===d;}
export function shift(d:string,n:number){const x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10);}
export function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Chisinau',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function hour(){return Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Chisinau',hour:'2-digit',hourCycle:'h23'}).format(new Date()));}
export function fmt(d:string,language:'ru'|'en'='ru'){return new Intl.DateTimeFormat(language==='en'?'en-GB':'ru',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z'));}
export function active(s:Settings,id:string,d:string){const c=s.courses[id];return d>=c.start&&d<shift(c.start,c.days);}
export function medicineSelected(s:Settings,id:string){return !['sedoxil','neurocalmin'].includes(id)||s.night==='both'||s.night===id;}
export function asNeeded(s:Settings,id:string){return s.night==='both'&&id==='sedoxil';}
export function dailySlots(s:Settings,d:string){return slots.filter(slot=>medicineSelected(s,slot.med)&&(asNeeded(s,slot.med)||active(s,slot.med,d)));}
type DoseRecord={date:string;slot:string;taken:number};
export function dailyProgress(s:Settings,d:string,marks:DoseRecord[]){
 const taken=(id:string)=>marks.some(mark=>mark.date===d&&mark.slot===id&&mark.taken===1);
 const planned=dailySlots(s,d).filter(slot=>!asNeeded(s,slot.med));
 const done=planned.filter(slot=>taken(slot.id)||(s.night==='both'&&slot.id==='neurocalmin-night'&&taken('sedoxil-night'))).length;
 return {done,total:planned.length};
}
export function medicineMarks(s:Settings,id:string,marks:DoseRecord[]){return marks.filter(mark=>mark.taken===1&&slots.some(slot=>slot.id===mark.slot&&slot.med===id)&&(asNeeded(s,id)||active(s,id,mark.date)));}
export function historyDates(s:Settings,id:string,now:string,marks:DoseRecord[]){
 const recorded=marks.filter(mark=>slots.some(slot=>slot.id===mark.slot&&slot.med===id)).map(mark=>mark.date).filter(validDate);
 const start=[s.courses[id].start,...recorded,...(asNeeded(s,id)?[now]:[])].sort()[0];
 return Array.from({length:Math.max(0,Math.min(366,Math.floor((Date.parse(now)-Date.parse(start))/86400000)+1))},(_,i)=>shift(now,-i));
}
