(function(){
const el=id=>document.getElementById(id),api=(path,opt)=>request('/rest/v1/'+path,opt),button=(label,action)=>{const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=label;b.onclick=async()=>{b.disabled=true;try{await action();await load()}catch(e){msg(e.message)}finally{b.disabled=false}};return b};
let countries=[],suppliers=[],integrations=[];
function line(title,sub){const d=document.createElement('div');d.className='item';const text=document.createElement('div');const h=document.createElement('strong');h.textContent=title;const p=document.createElement('small');p.textContent=sub||'';text.append(h,p);d.append(text);return d}
async function load(){
if(!session)return;
try{
[countries,suppliers,integrations]=await Promise.all([api('store_countries?select=code,name_ar,enabled,currency_code,currency_label&order=name_ar'),api('suppliers?select=id,name,country_code,enabled,integration_id&order=name'),api('supplier_integrations?select=id,name,provider')]);
el('supplierCountry').replaceChildren(...countries.map(c=>new Option(c.name_ar+' ('+c.code+')',c.code)));
el('supplierIntegration').replaceChildren(new Option('بدون اتصال API',''),...integrations.map(i=>new Option(i.name,i.id)));
el('marketList').replaceChildren(...countries.map(c=>{const d=line(c.name_ar+' — '+c.code,c.currency_code+' • '+(c.enabled?'مفعّل':'غير مفعّل'));d.append(button(c.enabled?'تعطيل':'تفعيل',()=>api('store_countries?code=eq.'+c.code,{method:'PATCH',body:JSON.stringify({enabled:!c.enabled})})));return d}));
el('supplierRegistry').replaceChildren(...suppliers.map(s=>{const d=line(s.name+' — '+s.country_code,(s.enabled?'مفعّل':'معطّل')+' • '+(integrations.find(i=>i.id===s.integration_id)?.name||'لا يوجد API'));d.append(button(s.enabled?'تعطيل':'تفعيل',()=>api('suppliers?id=eq.'+s.id,{method:'PATCH',body:JSON.stringify({enabled:!s.enabled})})));return d}));
const products=await api('products?select=id,name,country_code,supplier_id&order=created_at.desc&limit=200');
el('marketProductList').replaceChildren(...products.map(p=>{const d=line(p.name,'البلد: '+p.country_code);const country=document.createElement('select');country.replaceChildren(...countries.map(c=>new Option(c.name_ar,c.code)));country.value=p.country_code;const supplier=document.createElement('select');function fill(){const options=suppliers.filter(s=>s.country_code===country.value);supplier.replaceChildren(new Option('بدون مورد',''),...options.map(s=>new Option(s.name,s.id)));supplier.value=options.some(s=>s.id===p.supplier_id)?p.supplier_id:''}country.onchange=fill;fill();const save=button('حفظ الربط',()=>api('products?id=eq.'+p.id,{method:'PATCH',body:JSON.stringify({country_code:country.value,supplier_id:supplier.value||null})}));d.append(country,supplier,save);return d}));
const orders=await api('supplier_orders?select=id,order_id,supplier_id,external_order_id,status,wholesale_total_iqd,shipping_cost_iqd,settlement_iqd&order=created_at.desc&limit=100');
el('supplierOrderList').replaceChildren(...orders.map(o=>{const d=line(suppliers.find(s=>s.id===o.supplier_id)?.name||'مورد','طلب: '+o.order_id.slice(0,8)+' • الحالة: '+o.status+' • جملة: '+o.wholesale_total_iqd+' • تسوية: '+o.settlement_iqd);return d}));
if(!orders.length)el('supplierOrderList').textContent='لا توجد طلبات موردين مرتبطة بعد. الربط مع الطلبات الخارجية ينتظر API المورد.';
}catch(e){msg('إدارة الأسواق: '+e.message)}
}
el('marketForm').onsubmit=async e=>{e.preventDefault();const f=e.target;const data=Object.fromEntries(new FormData(f));data.code=data.code.toUpperCase();data.currency_code=data.currency_code.toUpperCase();data.enabled=false;try{await api('store_countries',{method:'POST',body:JSON.stringify(data)});f.reset();await load()}catch(err){msg(err.message)}};
el('supplierForm').onsubmit=async e=>{e.preventDefault();const f=e.target;const data=Object.fromEntries(new FormData(f));data.integration_id=data.integration_id||null;data.enabled=false;try{await api('suppliers',{method:'POST',body:JSON.stringify(data)});f.reset();await load()}catch(err){msg(err.message)}};
document.querySelector('[data-tab="markets"]')?.addEventListener('click',load);
})();