(()=>{
const API='https://zffrjanlvvlqhsdfazhb.supabase.co/rest/v1/store_banners?select=id,title,image_url,link_url&is_active=eq.true&order=sort_order.asc,created_at.desc';
const KEY='sb_publishable_V_UUDQPgPj-YyhnY5H0dLA_TePGowGN';
const fallback=[
{image_url:'https://zffrjanlvvlqhsdfazhb.supabase.co/storage/v1/object/public/product-images/banners/f6a839fa-eb75-4303-869c-08ca997d00e0.jpg',link_url:null},
{image_url:'https://zffrjanlvvlqhsdfazhb.supabase.co/storage/v1/object/public/product-images/banners/e97d36dd-967d-4dd4-8fb5-68a701ce3b80.webp',link_url:null},
{image_url:'https://zffrjanlvvlqhsdfazhb.supabase.co/storage/v1/object/public/product-images/banners/a08fb06a-8538-4800-803e-5f8291d41442.jpg',link_url:'?product=a0cef1d6-144b-4f9c-9be2-b96811f78065'},
{image_url:'https://zffrjanlvvlqhsdfazhb.supabase.co/storage/v1/object/public/product-images/banners/9759850a-0c0d-4287-83fa-41f39222ecfa.jpg',link_url:'?product=dfd0e598-1f21-4dd5-98e5-591801d79499'}];
function start(){
const holder=document.getElementById('heroFeaturedCards');if(!holder)return;
let banners=fallback,index=0;
holder.classList.add('banner-managed');
const link=document.createElement('a');link.className='hero-slide-link banner-current';
const img=document.createElement('img');img.className='hero-slide-image';img.loading='eager';link.append(img);
const dots=document.createElement('div');dots.className='banner-nav-dots';
holder.replaceChildren(link,dots);
function show(i){index=(i+banners.length)%banners.length;const b=banners[index];img.src=b.image_url;img.alt=b.title||'بنر فلير ستور';img.style.display='block';let url=null;if(b.link_url){try{const u=new URL(b.link_url,location.href);url=u.searchParams.has('product')?location.pathname+'?product='+encodeURIComponent(u.searchParams.get('product')):(['https:','http:'].includes(u.protocol)?u.href:null)}catch{}}if(url){link.href=url;link.style.pointerEvents='auto'}else{link.removeAttribute('href');link.style.pointerEvents='none'}[...dots.children].forEach((d,j)=>d.classList.toggle('active',j===index))}
function render(items){if(!items.length)return;const previous=banners[index]?.image_url;banners=items;dots.replaceChildren();items.forEach((_,i)=>{const button=document.createElement('button');button.type='button';button.className='banner-nav-dot';button.setAttribute('aria-label','عرض البنر '+(i+1));button.onclick=()=>show(i);dots.append(button)});const same=items.findIndex(b=>b.image_url===previous);show(same>=0?same:0)}
img.onerror=()=>{console.warn('Banner image unavailable',img.src);if(banners.length>1)show(index+1)};
render(fallback);
setInterval(()=>{if(!document.hidden&&holder.isConnected)show(index+1)},4500);
fetch(API,{headers:{apikey:KEY},cache:'no-store'}).then(async response=>{if(!response.ok)throw Error('Banners HTTP '+response.status);return response.json()}).then(items=>{if(Array.isArray(items)&&items.length)render(items)}).catch(err=>console.warn('Using banner fallback until API is available',err));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();