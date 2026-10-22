const API='https://zffrjanlvvlqhsdfazhb.supabase.co/rest/v1',KEY='sb_publishable_V_UUDQPgPj-YyhnY5H0dLA_TePGowGN';
const root=document.getElementById('landingRoot');
function node(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=text;return el}
function money(n){return Number(n).toLocaleString('en-US')+' د.ع'}
async function get(path){const r=await fetch(API+'/'+path,{headers:{apikey:KEY}});if(!r.ok)throw Error('تعذر تحميل بيانات المنتج');return r.json()}
async function init(){
 const slug=new URLSearchParams(location.search).get('product');
 if(!slug||!/^[a-z0-9-]{1,160}$/.test(slug)){root.textContent='رابط المنتج غير صحيح';return}
 try{
  const products=await get('products?select=id,name,slug,description,price_iqd,compare_price_iqd,stock,is_published&slug=eq.'+encodeURIComponent(slug)+'&is_published=eq.true&limit=1');
  const p=products[0];if(!p){root.textContent='المنتج غير متوفر';return}
  const pages=await get('product_landing_pages?select=template,headline,subtitle,cta_label,is_enabled&product_id=eq.'+encodeURIComponent(p.id)+'&is_enabled=eq.true&limit=1');
  const cfg=pages[0];if(!cfg){root.textContent='صفحة الهبوط غير مفعلة حالياً';return}
  const images=await get('product_images?select=image_url,sort_order&product_id=eq.'+encodeURIComponent(p.id)+'&order=sort_order.asc');
  document.title=p.name+' | دروب شوبينج';
  const section=node('section','landing-page theme-'+cfg.template);
  const gallery=node('div','landing-gallery');
  const photo=node('img','landing-main-image');photo.alt=p.name;photo.loading='eager';
  const fallback='https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80';
  const photos=images.map(x=>x.image_url).filter(x=>/^https:\/\//.test(x));
  let i=0;photo.src=photos[0]||fallback;photo.onerror=()=>{photo.onerror=null;photo.src=fallback};gallery.append(photo);
  if(photos.length>1){const thumbs=node('div','landing-thumbs');photos.forEach((url,index)=>{const b=node('button');b.type='button';const im=node('img');im.src=url;im.alt='صورة '+(index+1);b.append(im);b.onclick=()=>{i=index;photo.src=url};thumbs.append(b)});gallery.append(thumbs)}
  const details=node('div','landing-details');
  details.append(node('span','landing-kicker',cfg.template==='offer'?'عرض خاص':cfg.template==='story'?'اكتشف التفاصيل':'منتج من دروب شوبينج'));
  details.append(node('h1','landing-title',cfg.headline||p.name));
  if(cfg.headline&&cfg.headline!==p.name)details.append(node('h2','landing-product-name',p.name));
  const desc=cfg.subtitle||p.description||'اكتشف تفاصيل المنتج واطلبه بسهولة.';
  details.append(node('p','landing-description',desc));
  const price=node('div','landing-price');price.append(node('strong',null,money(p.price_iqd)));
  if(p.compare_price_iqd>p.price_iqd)price.append(node('del',null,money(p.compare_price_iqd)));
  details.append(price);
  details.append(node('p','landing-note','لمشاهدة تفاصيل المنتج والتسوق، يمكنك زيارة المتجر الرئيسي.'));
  section.append(gallery,details);root.replaceChildren(section);
 }catch(e){root.textContent='تعذر فتح صفحة المنتج. حاول مرة ثانية.';console.error(e)}
}
init();
