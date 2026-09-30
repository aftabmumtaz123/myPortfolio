import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();
router.use(requireAuth);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const uploadImage = (buffer: Buffer, folder: string) => new Promise<any>((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({ folder: `${process.env.CLOUDINARY_FOLDER || 'devstak'}/${folder}`, resource_type: 'image' }, (error, result) => error ? reject(error) : resolve(result));
  stream.end(buffer);
});

const contentStatus = z.enum(['DRAFT','PUBLISHED','ARCHIVED']);
const leadStatus = z.enum(['NEW','CONTACTED','DISCOVERY','PROPOSAL_SENT','WON','LOST']);
const projectSchema = z.object({
  title:z.string().min(2), slug:z.string().min(2), type:z.string().min(2),
  shortDescription:z.string().min(10), description:z.string().min(10),
  problem:z.string().optional(), solution:z.string().optional(), featured:z.boolean().optional(),
  status:contentStatus.optional(), coverImage:z.string().optional(), liveUrl:z.string().optional(),
  githubUrl:z.string().optional(), galleryImages:z.array(z.string()).optional(), highlights:z.array(z.string()).optional(), technologyIds:z.array(z.string()).optional()
});
const serviceSchema=z.object({title:z.string().min(2),slug:z.string().min(2),description:z.string().min(5),iconKey:z.string().min(1),sortOrder:z.number().int().optional(),published:z.boolean().optional()});
const techSchema=z.object({name:z.string().min(1),slug:z.string().min(1),iconKey:z.string().min(1),category:z.string().min(1),websiteUrl:z.string().optional(),featured:z.boolean().optional(),sortOrder:z.number().int().optional()});
const testimonialSchema=z.object({client:z.string().min(2),company:z.string().optional(),role:z.string().optional(),content:z.string().min(5),photoUrl:z.string().optional(),rating:z.number().int().min(1).max(5).optional(),status:contentStatus.optional(),projectId:z.string().nullable().optional()});
const blogSchema=z.object({title:z.string().min(2),slug:z.string().min(2),excerpt:z.string().min(5),content:z.string().min(5),coverImage:z.string().optional(),status:contentStatus.optional(),publishedAt:z.string().datetime().nullable().optional()});
const settingSchema=z.object({key:z.string().min(1),value:z.string()});
const teamSchema=z.object({name:z.string().min(2),role:z.string().min(2),bio:z.string().optional(),photoUrl:z.string().optional(),linkedinUrl:z.string().optional(),githubUrl:z.string().optional(),websiteUrl:z.string().optional(),featured:z.boolean().optional(),sortOrder:z.number().int().optional()});

router.get('/dashboard',async(_req,res)=>{
  const [projects,leads,unread,services,technologies,team]=await Promise.all([
    prisma.project.count(), prisma.lead.count(), prisma.lead.count({where:{status:{in:['NEW','CONTACTED']}}}),
    prisma.service.count({where:{published:true}}), prisma.technology.count(), prisma.teamMember.count()
  ]);
  res.json({stats:{projects,leads,unread,services,technologies,team}});
});

router.get('/projects', async (_req,res) => { const projects = await prisma.project.findMany({ orderBy:{updatedAt:'desc'}, include:{technologies:{include:{technology:true}}} }); res.json({projects}); });
async function validateTechnologyIds(ids:string[]|undefined){
  if(ids===undefined) return;
  const unique=[...new Set(ids)];
  if(!unique.length) return;
  const found=await prisma.technology.findMany({where:{id:{in:unique}},select:{id:true}});
  const foundIds=new Set(found.map(x=>x.id));
  const missing=unique.filter(id=>!foundIds.has(id));
  if(missing.length) throw new Error(`Unknown technology id(s): ${missing.join(', ')}`);
}
router.post('/projects',async(req,res)=>{
  const p=projectSchema.safeParse(req.body);
  if(!p.success)return res.status(400).json({message:'Invalid project',issues:p.error.flatten()});
  try{
    const {technologyIds,...data}=p.data;
    await validateTechnologyIds(technologyIds);
    const project=await prisma.project.create({data:{...data,technologies:technologyIds?{create:technologyIds.map(technologyId=>({technology:{connect:{id:technologyId}}}))}:undefined},include:{technologies:{include:{technology:true}}}});
    res.status(201).json({project});
  }catch(error){
    if(error instanceof Prisma.PrismaClientKnownRequestError && error.code==='P2002') return res.status(409).json({message:'A project with this slug already exists.',field:'slug'});
    if(error instanceof Error && error.message.startsWith('Unknown technology')) return res.status(400).json({message:error.message});
    throw error;
  }
});
router.patch('/projects/:id',async(req,res)=>{
  const p=projectSchema.partial().safeParse(req.body);
  if(!p.success)return res.status(400).json({message:'Invalid project',issues:p.error.flatten()});
  try{
    const {technologyIds,...data}=p.data;
    await validateTechnologyIds(technologyIds);

    const existing=await prisma.project.findUnique({where:{id:req.params.id},select:{id:true,slug:true}});
    if(!existing)return res.status(404).json({message:'Project not found.'});

    // A slug is globally unique. Explicitly check for a collision before the update so
    // editing a project with its own existing slug never produces a misleading 409.
    if(data.slug && data.slug !== existing.slug){
      const slugOwner=await prisma.project.findUnique({where:{slug:data.slug},select:{id:true}});
      if(slugOwner && slugOwner.id !== req.params.id){
        return res.status(409).json({message:`The URL slug "${data.slug}" is already used by another project.`,field:'slug'});
      }
    }

    const project=await prisma.$transaction(async(tx)=>{
      const updated=await tx.project.update({where:{id:req.params.id},data});
      if(technologyIds!==undefined){
        await tx.projectTechnology.deleteMany({where:{projectId:req.params.id}});
        if(technologyIds.length){
          await tx.projectTechnology.createMany({
            data:[...new Set(technologyIds)].map(technologyId=>({projectId:req.params.id,technologyId})),
            skipDuplicates:true
          });
        }
      }
      return tx.project.findUnique({where:{id:updated.id},include:{technologies:{include:{technology:true}}}});
    });
    res.json({project});
  }catch(error){
    if(error instanceof Prisma.PrismaClientKnownRequestError && error.code==='P2002'){
      const target=Array.isArray(error.meta?.target)?error.meta.target.join(', '):String(error.meta?.target||'');
      if(target.includes('slug')) return res.status(409).json({message:'A project with this slug already exists.',field:'slug'});
      return res.status(409).json({message:'This project could not be saved because one of its unique values is already in use.',field:'project'});
    }
    if(error instanceof Prisma.PrismaClientKnownRequestError && error.code==='P2025') return res.status(404).json({message:'Project not found.'});
    if(error instanceof Error && error.message.startsWith('Unknown technology')) return res.status(400).json({message:error.message});
    console.error('PATCH /admin/projects/:id failed',error);
    return res.status(500).json({message:process.env.NODE_ENV==='production'?'Unable to update project.':error instanceof Error?error.message:'Unable to update project.'});
  }
});
router.delete('/projects/:id',async(req,res)=>{await prisma.project.delete({where:{id:req.params.id}});res.status(204).send()});

router.get('/services', async (_req,res) => { const services = await prisma.service.findMany({orderBy:{sortOrder:'asc'}}); res.json({services}); });
router.post('/services',async(req,res)=>{const p=serviceSchema.safeParse(req.body);if(!p.success)return res.status(400).json({message:'Invalid service'});res.status(201).json({service:await prisma.service.create({data:p.data})})});
router.patch('/services/:id',async(req,res)=>{const p=serviceSchema.partial().safeParse(req.body);if(!p.success)return res.status(400).json({message:'Invalid service'});res.json({service:await prisma.service.update({where:{id:req.params.id},data:p.data})})});
router.delete('/services/:id',async(req,res)=>{await prisma.service.delete({where:{id:req.params.id}});res.status(204).send()});

router.get('/technologies',async(_req,res)=>res.json({technologies:await prisma.technology.findMany({orderBy:{sortOrder:'asc'}})}));
router.post('/technologies',async(req,res)=>{const p=techSchema.safeParse(req.body);if(!p.success)return res.status(400).json({message:'Invalid technology'});res.status(201).json({technology:await prisma.technology.create({data:p.data})})});
router.patch('/technologies/:id',async(req,res)=>{const p=techSchema.partial().safeParse(req.body);if(!p.success)return res.status(400).json({message:'Invalid technology'});res.json({technology:await prisma.technology.update({where:{id:req.params.id},data:p.data})})});
router.delete('/technologies/:id',async(req,res)=>{await prisma.technology.delete({where:{id:req.params.id}});res.status(204).send()});

router.get('/testimonials',async(_req,res)=>res.json({testimonials:await prisma.testimonial.findMany({orderBy:{createdAt:'desc'},include:{project:true}})}));
router.post('/testimonials',async(req,res)=>{const p=testimonialSchema.safeParse(req.body);if(!p.success)return res.status(400).json({message:'Invalid testimonial'});res.status(201).json({testimonial:await prisma.testimonial.create({data:p.data})})});
router.patch('/testimonials/:id',async(req,res)=>{const p=testimonialSchema.partial().safeParse(req.body);if(!p.success)return res.status(400).json({message:'Invalid testimonial'});res.json({testimonial:await prisma.testimonial.update({where:{id:req.params.id},data:p.data})})});
router.delete('/testimonials/:id',async(req,res)=>{await prisma.testimonial.delete({where:{id:req.params.id}});res.status(204).send()});

router.get('/blog',async(_req,res)=>res.json({posts:await prisma.blogPost.findMany({orderBy:{updatedAt:'desc'}})}));
router.post('/blog',async(req,res)=>{const p=blogSchema.safeParse(req.body);if(!p.success)return res.status(400).json({message:'Invalid blog post'});const data={...p.data,publishedAt:p.data.publishedAt?new Date(p.data.publishedAt):null};res.status(201).json({post:await prisma.blogPost.create({data})})});
router.patch('/blog/:id',async(req,res)=>{const p=blogSchema.partial().safeParse(req.body);if(!p.success)return res.status(400).json({message:'Invalid blog post'});const data={...p.data,publishedAt:p.data.publishedAt===undefined?undefined:(p.data.publishedAt?new Date(p.data.publishedAt):null)};res.json({post:await prisma.blogPost.update({where:{id:req.params.id},data})})});
router.delete('/blog/:id',async(req,res)=>{await prisma.blogPost.delete({where:{id:req.params.id}});res.status(204).send()});

router.get('/leads',async(_req,res)=>res.json({leads:await prisma.lead.findMany({orderBy:{createdAt:'desc'},include:{notes:true}})}));
router.patch('/leads/:id/status',async(req,res)=>{const status=leadStatus.safeParse(req.body.status);if(!status.success)return res.status(400).json({message:'Invalid status'});res.json({lead:await prisma.lead.update({where:{id:req.params.id},data:{status:status.data}})})});


router.get('/team',async(_req,res)=>res.json({team:await prisma.teamMember.findMany({orderBy:[{sortOrder:'asc'},{createdAt:'desc'}]})}));
router.post('/team',async(req,res)=>{const p=teamSchema.safeParse(req.body);if(!p.success)return res.status(400).json({message:'Invalid team member',issues:p.error.flatten()});res.status(201).json({member:await prisma.teamMember.create({data:p.data})})});
router.patch('/team/:id',async(req,res)=>{const p=teamSchema.partial().safeParse(req.body);if(!p.success)return res.status(400).json({message:'Invalid team member',issues:p.error.flatten()});try{res.json({member:await prisma.teamMember.update({where:{id:req.params.id},data:p.data})})}catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2025')return res.status(404).json({message:'Team member not found.'});throw error}});
router.delete('/team/:id',async(req,res)=>{try{await prisma.teamMember.delete({where:{id:req.params.id}});res.status(204).send()}catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2025')return res.status(404).json({message:'Team member not found.'});throw error}});

router.get('/media',async(_req,res)=>res.json({media:await prisma.media.findMany({orderBy:{createdAt:'desc'}})}));
router.post('/media/upload', upload.single('file'), async(req,res)=>{
  if(!req.file)return res.status(400).json({message:'Image file is required'});
  if(!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) return res.status(503).json({message:'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to server/.env, then restart the API.'});
  try {
    const result=await uploadImage(req.file.buffer,'media');
    const media=await prisma.media.create({data:{url:result.secure_url,publicId:result.public_id,filename:req.file.originalname,altText:typeof req.body.altText==='string'?req.body.altText:undefined,mimeType:req.file.mimetype}});
    res.status(201).json({media});
  } catch(error){ console.error(error); const message=error instanceof Error?error.message:'Cloudinary upload failed'; res.status(502).json({message:process.env.NODE_ENV==='production'?'Cloudinary upload failed':`Cloudinary upload failed: ${message}`}); }
});
router.delete('/media/:id',async(req,res)=>{
  const media=await prisma.media.findUnique({where:{id:req.params.id}});
  if(!media)return res.status(404).json({message:'Media not found'});
  if(media.publicId && process.env.CLOUDINARY_CLOUD_NAME) { try { await cloudinary.uploader.destroy(media.publicId,{resource_type:'image'}); } catch(error){ console.error(error); } }
  await prisma.media.delete({where:{id:req.params.id}}); res.status(204).send();
});

router.get('/settings',async(_req,res)=>res.json({settings:await prisma.siteSetting.findMany({orderBy:{key:'asc'}})}));
router.put('/settings/:key',async(req,res)=>{const p=settingSchema.safeParse({key:req.params.key,value:req.body.value});if(!p.success)return res.status(400).json({message:'Invalid setting'});res.json({setting:await prisma.siteSetting.upsert({where:{key:p.data.key},create:p.data,update:{value:p.data.value}})})});

export default router;
