// Vercel geolocation: country supplied by trusted edge header, not by the browser.
export default function handler(req,res){
 res.setHeader('Cache-Control','private, no-store');
 const code=String(req.headers['x-vercel-ip-country']||'').toUpperCase();
 res.status(200).json({country:/^[A-Z]{2}$/.test(code)?code:null});
}
