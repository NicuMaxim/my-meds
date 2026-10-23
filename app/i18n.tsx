'use client';
import {createContext,useContext,useEffect,useState} from 'react';
export type Language='ru'|'en';
export const english:Record<string,string>={
 'Оформление':'Appearance','Фотографии упаковок':'Package photos','Показывать коробки вместо значков в разделе «Лекарства».':'Show medicine boxes instead of icons in Medicines.',
 'Загружаем дневник…':'Loading diary…',
 'Не удалось загрузить дневник. Обновите страницу.':'Could not load the diary. Refresh the page.',
 'Сохранено · синхронизация включена':'Saved · sync enabled',
 'Сохраняем…':'Saving…',
 'Не удалось сохранить':'Could not save',
 'Изменение не сохранено':'Change not saved',
 '½ таблетки':'½ tablet','1 таблетка':'1 tablet','½–1 таблетка':'½–1 tablet','доза не указана':'dose not specified',
 'Мой курс':'My Meds','ДНЕВНИК ПРИЁМА':'MEDICATION DIARY','Выйти':'Log out','Дневник':'Diary','Лекарства':'Medicines','Курс':'Course',
 'Обновить данные':'Refresh data','Ваш дневник приёма':'Your medication diary','Подготавливаем ваш курс…':'Preparing your course…','Повторить загрузку':'Try again',
 'Отмечайте каждый приём.':'Track every dose.','Всё остальное мы запомним.':'We’ll remember the rest.','Сегодня':'Today',
 'Ещё не ложились спать?':'Still awake?',
 'До 04:00 предлагаем завершить вчерашний день. Выберите, за какую дату отмечаете приём.':'Before 04:00, we suggest finishing yesterday. Choose the date for this dose.',
 'За вчера ·':'For yesterday ·','За сегодня ·':'For today ·','Предыдущий день':'Previous day','Вчера':'Yesterday','Выбранный день':'Selected day','Дата приёма':'Dose date','Следующий день':'Next day',
 'из':'of','приёмов отмечено':'doses recorded','Утро':'Morning','После завтрака':'After breakfast','Вечер':'Evening','Перед сном':'Bedtime','Завершение дня':'End of the day',
 'Принято · нажмите, чтобы отменить':'Taken · tap to undo','Отметить приём':'Mark as taken','На эту дату приёмов по курсу нет.':'No doses scheduled for this date.',
 'Все приёмы за {date} отмечены.':'All doses for {date} recorded.',
 'Отметки относятся к выбранной дате. Случайную галочку можно снять повторным нажатием.':'Entries apply to the selected date. Tap again to undo an accidental check.',
 'ВАШ ДНЕВНИК':'YOUR DIARY','Лекарства и история':'Medicines and history','Выберите препарат, чтобы посмотреть или заполнить прошлые дни.':'Select a medicine to view or fill in past days.',
 'Сейчас не выбран для приёма':'Not currently selected',
 'Принимать до {date} включительно':'Take through {date}, inclusive',
 'приёмов отмечено · курс':'doses recorded · course:','дней':'days','Все лекарства':'All medicines',
 'Да = приём отмечен. Нет = отметки о приёме нет. Нажмите на ячейку, чтобы изменить.':'Yes = dose recorded. No = no dose recorded. Tap a cell to change it.',
 'Дата':'Date','Вне курса':'Outside course','Да':'Yes','Нет':'No',
 'Курс ещё не начался. Дату можно изменить в разделе «Курс».':'The course has not started yet. You can change the date under Course.',
 'Настройки курса':'Course settings','Выберите вариант из вашей памятки.':'Choose your bedtime medicine.','Препарат перед сном':'Bedtime medicine',
 'Sedoxil · ½–1 таблетка':'Sedoxil · ½–1 tablet','Nervocalmin Somn Ușor · 1 таблетка':'Nervocalmin Somn Ușor · 1 tablet',
 'Начало курса':'Start date','Дней':'Days',
 'Изменение курса не удаляет прежние отметки. После окончания курса препарат исчезнет из ежедневного списка; история останется доступной.':'Changing a course keeps previous entries. When the course ends, the medicine leaves the daily list; its history stays available.',
 'Сохранить настройки':'Save settings','Sedoxil · сколько принято?':'Sedoxil · how much did you take?','Дата приёма:':'Dose date:',
 'Уже отмечено: {dose}. Можно изменить дозу или снять отметку.':'Recorded: {dose}. You can change the dose or remove the entry.',
 'Выберите дозу, чтобы отметить приём.':'Select a dose to record it.','Снять отметку о приёме':'Remove dose entry','Отмена':'Cancel','За какой день этот приём?':'Which day is this dose for?',
 'Сейчас уже после полуночи. Если это таблетка перед сном за вчерашний день, выберите вчера.':'It’s after midnight. If this is yesterday’s bedtime dose, choose yesterday.',
 'Курс: 30–60 дней. Укажите назначенную вам длительность.':'Course: 30–60 days. Enter the duration prescribed to you.',
 'Два приёма в день: утром и вечером.':'Two doses a day: morning and evening.',
 'После 30 дней — по необходимости 2–3 раза в неделю. Дальнейшие приёмы можно отмечать в истории.':'After 30 days: as needed, 2–3 times a week. Further doses can be recorded in history.',
 'Альтернатива Sedoxil. Выберите свой вариант в настройках.':'An alternative to Sedoxil. Choose your option in settings.',
 'Войдите в дневник приёма.':'Sign in to your medication diary.','Логин':'Username','Пароль':'Password','Неверный логин или пароль.':'Incorrect username or password.','Войти':'Sign in',
 'Обнаружено несколько дневников; требуется выбрать основной':'Multiple diaries found; select the main diary',
 'Не настроен ключ доступа дневника':'Diary access key is not configured','Требуется вход':'Please sign in',
 'Обновите страницу и повторите сохранение':'Refresh the page and try saving again','Недопустимый запрос':'Invalid request','Некорректная отметка':'Invalid dose entry','Выберите ½ или 1 таблетку Sedoxil':'Choose ½ or 1 tablet of Sedoxil',
 'Некорректные настройки':'Invalid settings','Проверьте даты и длительность курса':'Check the course dates and duration','Неизвестное действие':'Unknown action',
 'Failed to fetch':'Network error. Please try again.',
};
export function translate(lang:Language,text:string,values:Record<string,string|number>={}){let result=lang==='en'?(english[text]??text):text;for(const [key,value] of Object.entries(values))result=result.replaceAll('{'+key+'}',String(value));return result;}
const LanguageContext=createContext<{lang:Language;setLang:(lang:Language)=>void}>({lang:'ru',setLang:()=>{}});
export function LanguageProvider({initialLanguage,children}:{initialLanguage:Language;children:React.ReactNode}){const [lang,setLang]=useState<Language>(initialLanguage);useEffect(()=>{document.documentElement.lang=lang;document.title=lang==='en'?'My Meds · Medication diary':'Мой курс · Дневник приёма';},[lang]);function change(value:Language){document.cookie=`diary-language=${value}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;setLang(value);}return <LanguageContext.Provider value={{lang,setLang:change}}>{children}</LanguageContext.Provider>;}
export function useLanguage(){const {lang,setLang}=useContext(LanguageContext);return {lang,setLang,t:(text:string,values?:Record<string,string|number>)=>translate(lang,text,values)};}
export function LanguageSwitch(){const {lang,setLang}=useLanguage();return <div className="languages" role="group" aria-label={lang==='ru'?'Язык':'Language'}>{(['ru','en'] as const).map(l=><button key={l} type="button" lang={l} aria-label={l==='ru'?'Русский':'English'} aria-pressed={lang===l} className={lang===l?'selected':''} onClick={()=>setLang(l)}>{l.toUpperCase()}</button>)}</div>;}
