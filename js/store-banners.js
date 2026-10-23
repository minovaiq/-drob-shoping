(function(){
 const API='https://zffrjanlvvlqhsdfazhb.supabase.co/rest/v1/store_banners?select=id,title,image_url,link_url&is_active=eq.true&order=sort_order.asc,created_at.desc';
 const KEY='sb_publishable_V_UUDQPgPj-YyhnY5H0dLA_TePGowGN';
 async function load(){
  const holder=document.getElementById('heroFeaturedCards');if(!holder)return;
  try{
   const response=await fetch(API,{headers:{apikey:KEY},cache:'no-store'});
   if(!response.ok)throw Error('HTTP '+response.status+': '+(await response.text()).slice(0,180));
   const banners=await response.json();
   if(!Array.isArray(banners)||!banners.length){console.info('Storefront banners: no active banners');return}
   let current=0;
   const img=document.createElement('img');img.className='hero-slide-image';img.loading='eager';img.decoding='async';
   const link=document.createElement('a');link.className='hero-slide-link';link.append(img);
   const dots=document.createElement('div');dots.className='hero-slide-dots';
   const markers=banners.map(()=>{const dot=document.createElement('span');dots.append(dot);return dot});
   holder.replaceChildren(link,dots);
   function show(i){
    current=i%banners.length;const b=banners[current];
    img.src=b.image_url;img.alt=b.title||'بنر فلير ستور';
    if(b.link_url){try{const url=new URL(b.link_url,location.href);if(['https:','http:'].includes(url.protocol)){link.href=url.href;link.style.pointerEvents='auto'}else{link.removeAttribute('href');link.style.pointerEvents='none'}}catch{link.removeAttribute('href');link.style.pointerEvents='none'}}else{link.removeAttribute('href');link.style.pointerEvents='none'}
    markers.forEach((dot,j)=>dot.classList.toggle('active',j===current));
   }
   img.onerror=()=>{console.error('Storefront banner image failed:',img.src);img.style.display='none'};img.onload=()=>{console.info('Banner image loaded',img.naturalWidth,img.naturalHeight)};
   show(0);
   if(banners.length>1&&!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(()=>{if(!document.hidden&&holder.contains(link))show((current+1)%banners.length)},4500);
  }catch(err){console.error('Storefront banner fetch failed:',err);console.warn('Keeping server-rendered banner fallback')}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(load,700),{once:true});
 else setTimeout(load,700);
})();