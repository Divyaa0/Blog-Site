import {NextResponse} from "next/server";
import { generateToken, comparePassword,verifyToken } from './auth';
import { client } from "../../database/conn";

export async function POST(req : Request, res:Response) {
    if (req.method !== 'POST') {
        return NextResponse.json({ error: "not found" }, { status: 500 });
    }
  
    const {email,password} = await req.json(); 
    console.log("🚀 ~ POST ~ email,password:", email,password)
    // 
    try{ 
      let execute_query = await client.query('SELECT * FROM "user" where email =$1   ',[email]);
      const user =execute_query.rows[0];
      console.log("🚀 ~ POST ~ user:", user)
      if(user && user.password ===password)
      {
         
         console.log("user existss")
        const token = generateToken({email: user.email,id:user.id , username:user.username} );
        return NextResponse.json({token},{status:200});
      }
      else
      {
        console.log("password incorrect  !!")
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }

    }
    catch(error){
    console.log("🚀 ~ POST ~ error:", error)
    }
    
   
    
   

   
  
  }


export async function GET(req:Request, res:Response) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: "not found" }, { status: 500 });
}

  const authHeader = req.headers.get('Authorization');
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return  NextResponse.json({ error: "Missing token" }, { status: 401 });

  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

  // If authentication succeeds, handle the protected API logic here
 return NextResponse.json({ message: 'This is a protected route',user }, { status: 200});
}


