(()=>{const $=id=>document.getElementById(id);const status=$('telegramStatus'),chats=$('telegramChats');if(!status)return;
const show=t=>status.textContent=t;
async function call(action,extra={}){if(!session?.access_token)throw Error('سجل الدخول أولاً');const r=await fetch(ROOT+'/functions/v1/telegram-orders-admin',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({action,...extra})});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||d.message||'تعذر الاتصال');return d}
async function run(fn){try{show('جارٍ التنفيذ...');await fn()}catch(e){show('⚠ '+e.message)}}
async function statusCheck(){await run(async()=>{const d=await call('status');show(d.configured?(d.chat_id?'✓ البوت مرتبط بالمحادثة '+d.chat_id:'التوكن محفوظ. اضغط جلب المحادثات لتحديد Chat ID'):'أدخل توكن البوت حتى نبدأ')})}
$('telegramTokenForm').onsubmit=e=>{e.preventDefault();run(async()=>{const d=await call('save',{bot_token:$('telegramToken').value.trim()});$('telegramToken').value='';show('✓ تم حفظ التوكن للبوت @'+d.bot_name+'. أرسل /start للبوت ثم اضغط جلب Chat ID')})};
$('telegramDiscover').onclick=()=>run(async()=>{const d=await call('discover');chats.replaceChildren(new Option('اختار المحادثة',''));for(const c of d.chats)chats.add(new Option(c.name+' ('+c.id+')',c.id));show(d.chats.length?'✓ تم العثور على '+d.chats.length+' محادثة. اختار واحدة واضغط اعتماد المحادثة':'ماكو محادثات. افتح البوت على تيليجرام وأرسل /start ثم حاول مجدداً')});
$('telegramSaveChat').onclick=()=>run(async()=>{if(!chats.value)throw Error('اختار المحادثة أولاً');await call('select',{chat_id:chats.value});show('✓ تم اعتماد Chat ID '+chats.value+'، والطلبات الجديدة راح توصل تلقائياً')});
$('telegramTest').onclick=()=>run(async()=>{await call('test');show('✓ وصلت رسالة الاختبار إلى تيليجرام')});
document.querySelector('[data-tab="telegram"]')?.addEventListener('click',statusCheck);
})();