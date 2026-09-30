import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
const router=Router();
const leadSchema=z.object({name:z.string().min(2),email:z.string().email(),company:z.string().optional(),projectType:z.string().min(2),budget:z.string().optional(),timeline:z.string().optional(),message:z.string().min(10)});
router.get('/projects', async (_req,res) => { const projects = await prisma.project.findMany({where:{status:'PUBLISHED'},orderBy:[{featured:'desc'},{updatedAt:'desc'}],include:{technologies:{include:{technology:true}}}}); res.json({projects}); });
router.get('/services',async(_req,res)=>res.json({services:await prisma.service.findMany({where:{published:true},orderBy:{sortOrder:'asc'}})}));
router.get('/team',async(_req,res)=>res.json({team:await prisma.teamMember.findMany({where:{featured:true},orderBy:[{sortOrder:'asc'},{createdAt:'desc'}]})}));
router.get('/technologies',async(_req,res)=>res.json({technologies:await prisma.technology.findMany({where:{featured:true},orderBy:{sortOrder:'asc'}})}));
router.get('/testimonials',async(_req,res)=>res.json({testimonials:await prisma.testimonial.findMany({where:{status:'PUBLISHED'},orderBy:{createdAt:'desc'},include:{project:true}})}));
router.get('/blog',async(_req,res)=>res.json({posts:await prisma.blogPost.findMany({where:{status:'PUBLISHED'},orderBy:{publishedAt:'desc'}})}));
router.get('/settings',async(_req,res)=>{const rows=await prisma.siteSetting.findMany();res.json({settings:Object.fromEntries(rows.map(x=>[x.key,x.value]))})});
router.post('/leads',async(req,res)=>{const parsed=leadSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Please complete the required fields'});const lead=await prisma.lead.create({data:parsed.data});res.status(201).json({message:'Inquiry received',leadId:lead.id})});
export default router;router.get('/projects/:slug',async(req,res)=>{const project=await prisma.project.findFirst({where:{slug:req.params.slug,status:'PUBLISHED'},include:{technologies:{include:{technology:true}},testimonials:{where:{status:'PUBLISHED'}}}});if(!project)return res.status(404).json({message:'Project not found'});res.json({project})});

