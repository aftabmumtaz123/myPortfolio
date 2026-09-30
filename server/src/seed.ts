import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';

const techs=[
['React','react','Frontend','React'],['TypeScript','typescript','Frontend','TypeScript'],['Next.js','nextjs','Frontend','Nextdotjs'],['Tailwind CSS','tailwind-css','Frontend','Tailwindcss'],['Node.js','nodejs','Backend','Nodedotjs'],['Express.js','expressjs','Backend','Express'],['MongoDB','mongodb','Data','Mongodb'],['PostgreSQL','postgresql','Data','Postgresql'],['Prisma','prisma','Data','Prisma'],['Socket.IO','socketio','Backend','Socketdotio'],['Cloudinary','cloudinary','Infrastructure','Cloudinary'],['Vercel','vercel','Infrastructure','Vercel'],['Railway','railway','Infrastructure','Railway'],['Oracle Cloud','oracle-cloud','Infrastructure','Oracle']
];
const services=[['Custom Web Apps','custom-web-apps','Business-ready web applications built around workflows, users and goals.','Layers3'],['SaaS Development','saas-development','From focused MVPs to scalable products and dashboards.','Zap'],['Backend & APIs','backend-apis','Reliable Node.js APIs, authentication, integrations and real-time systems.','Server'],['Data & Architecture','data-architecture','MongoDB and PostgreSQL architecture designed for maintainability and growth.','Database']];
async function main(){
 const passwordHash=await bcrypt.hash('ChangeMeBeforeProduction!123',12);
 await prisma.adminUser.upsert({where:{email:'admin@devstak.local'},update:{},create:{name:'Aftab Mumtaz',email:'admin@devstak.local',passwordHash,role:'OWNER'}});
 for(let i=0;i<techs.length;i++){const [name,slug,category,iconKey]=techs[i];await prisma.technology.upsert({where:{slug},update:{sortOrder:i},create:{name,slug,category,iconKey,sortOrder:i}})}
 for(let i=0;i<services.length;i++){const [title,slug,description,iconKey]=services[i];await prisma.service.upsert({where:{slug},update:{sortOrder:i},create:{title,slug,description,iconKey,sortOrder:i}})}
 const projects=[
  {title:'CoupleNest',slug:'couplenest',type:'SaaS / Web App',shortDescription:'A relationship platform with real-time messaging, moments and notifications.',description:'A full-stack product focused on private communication, shared memories and real-time interaction.',status:'PUBLISHED' as const,featured:true},
  {title:'QR Studio',slug:'qr-studio',type:'SaaS Platform',shortDescription:'A QR generation and management experience designed for businesses.',description:'A business-oriented QR platform designed around creation, management and future analytics.',status:'PUBLISHED' as const,featured:true},
  {title:'Accessories Loop',slug:'accessories-loop',type:'E-commerce',shortDescription:'A commerce experience for mobile accessories with product and admin workflows.',description:'An e-commerce experience for mobile accessories with a practical backend and management flow.',status:'PUBLISHED' as const,featured:true},
  {title:'LumaLink',slug:'lumalink',type:'Productivity / Collaboration',shortDescription:'A collaboration-oriented product concept.',description:'A productivity and collaboration concept ready to become a deeper case study.',status:'DRAFT' as const,featured:false}
 ];
 for(const p of projects) await prisma.project.upsert({where:{slug:p.slug},update:p,create:p});
 await prisma.siteSetting.upsert({where:{key:'brand.name'},update:{value:'DevStak'},create:{key:'brand.name',value:'DevStak'}});
 await prisma.siteSetting.upsert({where:{key:'brand.email'},update:{value:'hello@devstak.com'},create:{key:'brand.email',value:'hello@devstak.com'}});
 console.log('DevStak seed complete. Local admin: admin@devstak.local / ChangeMeBeforeProduction!123');
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
