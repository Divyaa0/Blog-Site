// auth.js

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const secretKey = 'SECRET_KEY'; // Replace this with your own secret key

// Generate JWT token
export const generateToken = (payload:any) => {
  console.log("payload generated is ", payload)
  return jwt.sign(payload, secretKey, { expiresIn: '24h' }); // Token expires in 1 hour
};

// Verify JWT token
export const verifyToken = (token:any) => {
  try {
    // Generate JWT token
    interface Payload
    {
     email:string,
     id:number
     username:string
    }
    const decoded = jwt.verify(token, secretKey)as Payload;
    return decoded;
  } catch (error) {
    return null; // Token verification failed
  }
};

// Hash password
export const hashPassword = async (password:any) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password with hashed password
export const comparePassword = async (password:any, hashedPassword:any) => {
  return await bcrypt.compare(password, hashedPassword);
};
