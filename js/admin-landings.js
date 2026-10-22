const landingTemplates=[['spotlight','غامر — صورة كبيرة'],['story','قصصي — صورة ونص'],['minimal','بسيط — عرض نظيف'],['offer','عرض — إبراز السعر']];
async function loadLandingPages(){
 const holder=$('landingList');holder.textContent='جارٍ تحميل صفحات الهبوط...';
 try{
  const [products,pages]=await Promise.all([
   request('/rest/v1/products?select=id,name,slug,is_published&order=name'),
   request('/rest/v1/product_landing_pages?select=product_id,template,headline,subtitle,cta_label,is_enabled')
  ]);
  holder.replaceChildren();
  if(!products.length){holder.textContent='لا توجد منتجات';return}
  for(const p of products){
   const cfg=pages.find(x=>x.product_id===p.id)||{};
   const card=document.createElement('div');card.className='landing-admin-card';
   const title=document.createElement('strong');title.textContent=p.name;
   const form=document.createElement('form');form.className='landing-admin-form';
   const template=document.createElement('select');for(const [value,label] of landingTemplates)template.add(new Option(label,value));template.value=cfg.template||'spotlight';
   const headline=document.createElement('input');headline.placeholder='عنوان تسويقي (اختياري)';headline.maxLength=120;headline.value=cfg.headline||'';
   const subtitle=document.createElement('textarea');subtitle.placeholder='وصف مختصر (اختياري)';subtitle.maxLength=350;subtitle.rows=2;subtitle.value=cfg.subtitle||'';
   const cta=document.createElement('input');cta.placeholder='نص زر الطلب';cta.maxLength=40;cta.value=cfg.cta_label||'اطلب الآن';
   const enabled=document.createElement('input');enabled.type='checkbox';enabled.checked=!!cfg.is_enabled;
   const enabledLabel=document.createElement('label');enabledLabel.append(enabled,document.createTextNode(' تفعيل رابط الهبوط'));
   const save=document.createElement('button');save.type='submit';save.textContent='حفظ التصميم';
   const link=document.createElement('a');link.href='../landing.html?product='+encodeURIComponent(p.slug);link.target='_blank';link.rel='noopener';link.textContent='معاينة الصفحة ↗';
   const copy=document.createElement('button');copy.type='button';copy.textContent='نسخ الرابط';copy.onclick=async()=>{const url=new URL('../landing.html?product='+encodeURIComponent(p.slug),location.href).href;try{await navigator.clipboard.writeText(url);msg('تم نسخ الرابط: '+url)}catch{prompt('انسخ الرابط',url)}};
   form.append(template,headline,subtitle,cta,enabledLabel,save,link,copy);
   form.onsubmit=async e=>{e.preventDefault();save.disabled=true;try{
    const data={product_id:p.id,template:template.value,headline:headline.value.trim()||null,subtitle:subtitle.value.trim()||null,cta_label:cta.value.trim()||'اطلب الآن',is_enabled:enabled.checked,updated_at:new Date().toISOString()};
    await request('/rest/v1/product_landing_pages?on_conflict=product_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(data)});
    msg('تم حفظ صفحة '+p.name+(enabled.checked?' — الرابط مفعّل':' — الرابط غير مفعّل'));
   }catch(err){msg('تعذر الحفظ: '+err.message)}finally{save.disabled=false}};
   card.append(title,form);holder.append(card);
  }
 }catch(err){holder.textContent='تعذر تحميل الصفحات: '+err.message}
}
