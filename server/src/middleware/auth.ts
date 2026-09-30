import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export type AuthRequest = Request & { admin?: { id:string; role:string } };
export function requireAuth(req:AuthRequest,res:Response,next:NextFunction){
  const token=req.cookies?.devstak_admin;
  if(!token) return res.status(401).json({message:'Authentication required'});
  try{const payload=jwt.verify(token,process.env.JWT_SECRET!) as {id:string;role:string}; req.admin={id:payload.id,role:payload.role}; next();}
  catch{return res.status(401).json({message:'Session expired'});}
}
