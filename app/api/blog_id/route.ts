import { NextResponse } from "next/server";
import { client } from "../../database/conn";
import { generateToken, comparePassword,verifyToken } from '../jwt/auth';
import { title } from "process";
import url from 'url';


// Handles GET requests to /api
export async function GET(req: Request) {
  // ...
  console.log("asdfghjklasdfgh")
  try {
    const parsedUrl = url.parse(req.url!, true); // Parse the request URL
    const id = parsedUrl.query.id as string; 
    console.log("🚀 ~ GET ~ id:", id)


    if (!id) {
      return NextResponse.json({ error:  'Missing ID parameter' }, { status: 400 });
      }

    const result = await client.query('SELECT * FROM blog WHERE id = $1',[id]);
    console.log("🚀 ~ GET ~ result:", result.rows[0]) 

    if (result.rows.length === 0) {
        return NextResponse.json({ error:  'Blog not found' }, { status: 404 });
      }

    return NextResponse.json({ data: result.rows[0] },{status:200});
    // return NextResponse.json({ message : "done" },{status:200});
  }
   catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

