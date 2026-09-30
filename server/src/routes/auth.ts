import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router=Router();
const loginSchema=z.object({email:z.string().email(),password:z.string().min(8)});
router.post('/login',async(req,res)=>{const parsed=loginSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Invalid login'});const user=await prisma.adminUser.findUnique({where:{email:parsed.data.email.toLowerCase()}});if(!user||!(await bcrypt.compare(parsed.data.password,user.passwordHash)))return res.status(401).json({message:'Email or password is incorrect'});const token=jwt.sign({id:user.id,role:user.role},process.env.JWT_SECRET!,{expiresIn:'7d'});res.cookie('devstak_admin',token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:7*24*60*60*1000});res.json({user:{id:user.id,name:user.name,email:user.email,role:user.role}})});
router.post('/logout',requireAuth,async(_req,res)=>{res.clearCookie('devstak_admin');res.json({ok:true})});
router.get('/me',requireAuth,async(req:AuthRequest,res)=>{const user=await prisma.adminUser.findUnique({where:{id:req.admin!.id},select:{id:true,name:true,email:true,role:true}});res.json({user})});
export default router;
