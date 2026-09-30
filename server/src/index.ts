import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import auth from './routes/auth.js';
import publicRoutes from './routes/public.js';
import admin from './routes/admin.js';
import { prisma } from './prisma.js';

const app=express();const port=Number(process.env.PORT||4000);
app.use(helmet());app.use(cors({origin:[process.env.WEB_ORIGIN||'http://localhost:5173',process.env.ADMIN_ORIGIN||'http://localhost:5174'],credentials:true}));app.use(express.json({limit:'1mb'}));app.use(cookieParser());
app.get('/health',async(_req,res)=>{
  let database:'connected'|'disconnected'='connected';
  try { await prisma.$queryRaw`SELECT 1`; } catch { database='disconnected'; }
  const cloudinary=Boolean(process.env.CLOUDINARY_CLOUD_NAME&&process.env.CLOUDINARY_API_KEY&&process.env.CLOUDINARY_API_SECRET);
  res.status(database==='connected'?200:503).json({ok:database==='connected',service:'devstak-api',database,cloudinaryConfigured:cloudinary});
});
app.use('/api/auth',auth);app.use('/api',publicRoutes);app.use('/api/admin',admin);
app.use((err:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{
  console.error(err);
  const message=err instanceof Error?err.message:'Internal server error';
  const isDev=process.env.NODE_ENV!=='production';
  res.status(500).json({message:isDev?message:'Internal server error',...(isDev&&err instanceof Error?{name:err.name}: {})});
});
app.listen(port,()=>console.log(`DevStak API running on http://localhost:${port}`));
