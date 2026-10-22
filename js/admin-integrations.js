// Multi-provider registry: no secrets are stored in this client.
(function(){
 const list=document.getElementById('integrationList'),form=document.getElementById('integrationForm');
 if(!list||!form)return;
 async function load(){
  if(!session)return;
  try{
   const data=await request('/rest/v1/supplier_integrations?select=id,name,provider,base_url,enabled,created_at&order=created_at.desc');
   list.replaceChildren();
   if(!data.length){const empty=document.createElement('p');empty.className='admin-subtitle';empty.textContent='لا توجد اتصالات مضافة بعد.';list.append(empty)}
   data.forEach(c=>{
    const card=document.createElement('div');card.className='integration-row';
    const info=document.createElement('div');const title=document.createElement('strong');title.textContent=c.name+' ('+c.provider+')';const sub=document.createElement('small');sub.textContent=(c.base_url||'لم يحدد عنوان API')+' • '+(c.enabled?'مفعّل':'غير مفعّل');info.append(title,sub);
    const actions=document.createElement('div');actions.className='integration-actions';
    const toggle=document.createElement('button');toggle.type='button';toggle.className='secondary';toggle.textContent=c.enabled?'تعطيل':'تفعيل';toggle.onclick=async()=>{toggle.disabled=true;try{await request('/rest/v1/supplier_integrations?id=eq.'+encodeURIComponent(c.id),{method:'PATCH',body:JSON.stringify({enabled:!c.enabled})});await load()}catch(e){msg(e.message);toggle.disabled=false}};
    const del=document.createElement('button');del.type='button';del.className='secondary';del.textContent='حذف';del.onclick=async()=>{if(!confirm('حذف تعريف الاتصال '+c.name+'؟'))return;del.disabled=true;try{await request('/rest/v1/supplier_integrations?id=eq.'+encodeURIComponent(c.id),{method:'DELETE'});await load()}catch(e){msg(e.message);del.disabled=false}};
    actions.append(toggle,del);card.append(info,actions);list.append(card);
   });
  }catch(e){list.textContent='تعذر تحميل الاتصالات: '+e.message}
 }
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(!session)return;
  const fd=new FormData(form);const name=String(fd.get('name')||'').trim(),provider=String(fd.get('provider')||'').trim().toLowerCase(),base_url=String(fd.get('base_url')||'').trim();
  if(!name||!/^[a-z0-9_-]+$/.test(provider)){msg('تأكد من الاسم ورمز المورد');return}
  const btn=form.querySelector('button[type=submit]');btn.disabled=true;
  try{await request('/rest/v1/supplier_integrations',{method:'POST',body:JSON.stringify({name,provider,base_url:base_url||null,enabled:false})});form.reset();await load();msg('تمت إضافة تعريف الاتصال. المزامنة الفعلية تتطلب إعداد خادم آمن ومواصفات API للمورد.')}catch(err){msg(err.message)}finally{btn.disabled=false}
 });
 document.querySelector('[data-tab="integrations"]')?.addEventListener('click',load);
 document.getElementById('refreshAdmin')?.addEventListener('click',()=>{if(!document.getElementById('integrations').hidden)load()});
})();
