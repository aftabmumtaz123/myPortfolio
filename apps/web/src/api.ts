const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
async function get(path:string){const res=await fetch(`${API_URL}${path}`);if(!res.ok)throw new Error(`Unable to load ${path}`);return res.json();}
export const getProjects=()=>get('/projects');
export const getServices=()=>get('/services');
export const getTechnologies=()=>get('/technologies');
export const getTeam=()=>get('/team');
export const getTestimonials=()=>get('/testimonials');
export const getBlog=()=>get('/blog');
export const getSettings=()=>get('/settings');
export async function submitLead(data:{name:string;email:string;company?:string;projectType:string;budget?:string;message:string}){const res=await fetch(`${API_URL}/leads`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const body=await res.json().catch(()=>({}));if(!res.ok)throw new Error(body.message||'Unable to send inquiry');return body;}

export const getProjectBySlug=(slug:string)=>get(`/projects/${encodeURIComponent(slug)}`);
