import { NextResponse } from "next/server";
import { client } from "../../database/conn";
import { generateToken, comparePassword, verifyToken } from '../jwt/auth';
import { writeFile } from 'fs/promises'
import { join } from 'path';
import nextConnect from 'next-connect';
import { NextFunction } from "express";
import fs from "fs";
import { Console } from "console";
const path = require('path');

let body_img_count=0;
let body_imgs_path :any= [];

// TOKEN CHECK
const verifyUser=(req:Request)=>
{
  const authHeader = req.headers.get('Authorization');
  const token = authHeader && authHeader.split(' ')[1];
  // if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });
  if (!token) return null;
  const user = verifyToken(token);
  return user;
}

// Handles GET requests to /api
export async function GET(request: Request) {
  // ...
  try {
    console.log("Get all blog", new Date().toLocaleTimeString());
    const query = `SELECT * FROM blog;`;
    let execute_query = await client.query(query);
    // console.log("execute_query:", execute_query)
    let _data = execute_query?.rows;
    // console.log("🚀 ~ GET ~ _data:", _data)

    return NextResponse.json({ data: _data });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
//  handle post request to /api
export async function POST(req: Request, res: Response) {
  // verify token
  const user=verifyUser(req);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  const user_id = user?.id;
  const username = user?.username;

  const form = await req.formData();
  const operation=form.get('OperationType');

  if(operation === 'Upload_Body_Images')
  {
   console.log("🚀 ~ POST ~ operation:")

    const saveFile = async (filenamePrefix: string, blob: Blob, folder_type: string) => {
      const last_blog_id = await client.query(`SELECT EXISTS (SELECT 1 FROM blog LIMIT 1) as table_empty`);
      const row_present = last_blog_id.rows[0].table_empty;
      let subFolder = 1;
      if (row_present) {
        console.log("data present");
        const last_row = await client.query(' SELECT id FROM blog ORDER BY id DESC LIMIT 1');
        const last_id = last_row.rows[0];
        console.log("🚀 ~ saveFile ~ last_id:", last_id)
        const new_id = last_id.id + 1;
        console.log("🚀 ~ saveFile ~ new_id:", new_id)
        subFolder = new_id;
      }
      else {
        console.log("blog table is empty !!")
      }
  
      const buffer = Buffer.from(await blob.arrayBuffer());
      const extension = blob.type.split('/').pop(); // Get file extension from MIME type
  
      if (!extension) {
        throw new Error('Invalid file type');
      }
      // const uniqueFilename = `${filenamePrefix}-${Date.now()}.${extension}`;
      const uniqueFilename = `${filenamePrefix}-${subFolder}.${extension}`;
      const directoryPath = `public/uploads/${subFolder}/${folder_type}`;
      const filePath = path.join(directoryPath, uniqueFilename);
      // Ensure the directory exists, create it if it doesn't
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }
      // Write the file content to the filePath
      fs.writeFileSync(filePath, buffer);
      console.log(`File saved at: ${filePath}`);
      return filePath;
    };
  
    const image=form.get('bodyImg') as Blob;
    console.log("🚀 ~ POST ~ image:", image)
    if(image)
    {
      const save_img= await saveFile(`body_img${body_img_count}`, image , 'body_uploads')
      console.log("🚀 ~ POST ~ save_img:", save_img)
      body_imgs_path.push(save_img)
      body_img_count+=1;
      console.log("🚀 ~ POST ~ body_imgs_path:", body_imgs_path)

      return NextResponse.json({ message: "Blog created successfully"}, { status: 200 },);
    }

  }
  else
  {
    console.log("in else")
    const saveFile = async (filenamePrefix: string, blob: Blob, folder_type: string) => {
      // get the last 'id' from blog table
      // const last_blog_id = await client.query(`SELECT EXISTS (SELECT 1 FROM blog LIMIT 1) as table_empty`);
      const last_blog_id = await client.query(`SELECT EXISTS (SELECT 1 FROM blog LIMIT 1) as table_empty`);
      const row_present = last_blog_id.rows[0].table_empty;
      let subFolder = 1;
      if (row_present) {
        console.log("data present");
        const last_row = await client.query(' SELECT id FROM blog ORDER BY id DESC LIMIT 1');
        const last_id = last_row.rows[0];
        console.log("🚀 ~ saveFile ~ last_id:", last_id)
        const new_id = last_id.id + 1;
        console.log("🚀 ~ saveFile ~ new_id:", new_id)
        subFolder = new_id;
      }
      else {
        console.log("blog table is empty !!")
      }
  
      const buffer = Buffer.from(await blob.arrayBuffer());
      const extension = blob.type.split('/').pop(); // Get file extension from MIME type
  
      if (!extension) {
        throw new Error('Invalid file type');
      }
      // const uniqueFilename = `${filenamePrefix}-${Date.now()}.${extension}`;
      const uniqueFilename = `${filenamePrefix}-${subFolder}.${extension}`;
      const directoryPath = `public/uploads/${subFolder}/${folder_type}`;
      const filePath = path.join(directoryPath, uniqueFilename);
      // Ensure the directory exists, create it if it doesn't
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }
      // Write the file content to the filePath
      fs.writeFileSync(filePath, buffer);
      console.log(`File saved at: ${filePath}`);
      return filePath;
    };
  
    let summary_path;
    let header_path;
    // let body_imgs_path = [];
  
    const summary_img = form.get('summaryImage') as Blob;
    const header_img = form.get('headerImage') as Blob;
    // const body_img = form.getAll("bodyImages[]");
    // console.log("🚀  body_img:", body_img)
    // const body_img_len = body_img ? body_img.length : 0
  
    const title = form.get('title');
    console.log("🚀 ~ POST ~ title:", title)
    const details = form.get('details');
    console.log("🚀 ~ POST ~ detail:", details)
    const content = form.get('content');
    console.log("🚀 ~ POST ~ content:", content)
    // get status
    const status_ = form.get('status');
    console.log("🚀 ~ POST ~ status:", status_, "and its type is ", typeof (status_))
  
    if (summary_img) {
      summary_path = await saveFile('summary_img', summary_img, 'summary_uploads');
      console.log("🚀 summary_path:", summary_path)
    }
  
    if (header_img) {
      header_path = await saveFile('header_img', header_img, 'header_uploads');
      console.log("🚀 header_path:", header_path)
    }
  
    // for (let i = 0; i < body_img_len; i++) {
    //   const current_body_img = body_img[i] as Blob;
    //   const body_path = await saveFile(`body_img${i}`, current_body_img, 'body_uploads');
    //   body_imgs_path.push(body_path);
    // }
    console.log("body path images array : ", body_imgs_path)
    const body_images = JSON.stringify(body_imgs_path)
      .replace('[', '{')
      .replace(']', '}');
    console.log("🚀 ~ POST ~ body_images:", body_images)
    try {
      let execute_query;
      // const query = `INSERT INTO blog ( title, details, contents, summary_img,header_img,body_imgs)   VALUES ( '${title}', '${details}', '${content}', '${summary_path}','${header_path}','${body_images}');`;
      // const query = `INSERT INTO blog ( title, details, contents, summary_img,header_img,body_imgs,created_by,status) VALUES ( '${title}', '${details}', '${content}', '${summary_path}','${header_path}','${body_images}',${user.id},'${status_}')`;
      const query = {
        text: `INSERT INTO blog (title, details, contents, summary_img, header_img, body_imgs, created_by, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        values: [title, details, content, summary_path, header_path, body_images, user.id, status_]
       };
      try{
      execute_query = await client.query(query);
      console.log("🚀 ~ POST ~ execute_query:", execute_query)
      }catch(e){
      console.log("🚀 ~ POST ~ e:", e)
      }
  
      console.log("🚀 ~ POST ~ execute_query:", execute_query)
      if (execute_query) {
        const blog_id_ = await client.query(`select id from blog order by id desc limit 1`);
        const blog_id = blog_id_.rows[0].id;
  
        console.log("🚀 ~ POST ~ blog_id:", blog_id)
  
        return NextResponse.json({ message: "Blog created successfully", blog_id: blog_id, username: username }, { status: 200 },);
      } else {
        return NextResponse.json({ error: "Internal Error 500" }, { status: 500 });
      }
    } catch (error) {
      console.log("error is there : ", error)
      return NextResponse.json(
        { error: "Internal Error 500" },
        { status: 500 }
      );
    }
  }
  
}

export async function DELETE(req: Request, res: Response) {
  if (req.method === 'DELETE') {
    // verify token
    const authHeader = req.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const { id } = await req.json();
    console.log("🚀 ~ DELETE ~ id:", id)
    // Validate the ID
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 })
    }
    const DeleteFolder =(id:number)=>
    {
      const folder_path = `public/uploads/${id}`;
      // fs.rmdir(folder_path,err=>
      fs.rm(folder_path , { recursive: true, force: true },err=>
        {
          if(err){throw err ; }
          console.log(`folder ${folder_path} is deleted..`)
        })
    }

    try {
      // delete the image folder on server
      const delete_folder= DeleteFolder(id);
      console.log("🚀 ~ DELETE ~ delete_folder:", delete_folder)
      //  query to delete the blog with the given ID
      const result = await client.query('DELETE FROM blog WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 })
      }
      console.log("🚀 ~ DELETE ~ result.rowCount:", result.rowCount)
      return NextResponse.json({ message: "Blog deleted successfully" }, { status: 200 })

    } catch (error) {
      console.error('Error deleting blog:', error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  } else {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 })

  }
}
export async function PUT(req: Request, res: Response) {
  console.log("asdfghjklasdfghjkasdfghjk")
  let summary_path;
  let header_path;
  let deleted_imgs_path: any = [];
  let new_imgs_path: any = [];

  const form = await req.formData();
  const id = form.get('blog_id');
  const title = form.get('title');
  const details = form.get('details');
  const content = form.get('content');
  const summary_img = form.get('summaryImage') as Blob;
  console.log("🚀 ~ PUT ~ summary_img:", summary_img)
  const header_img = form.get('headerImage') as Blob;
  console.log("🚀 ~ PUT ~ header_img:", header_img)

  const saveFile = async (filenamePrefix: string, blob: Blob, folder_type: string) => {
    // get the last 'id' from blog table
    const blog = await client.query(`SELECT id from blog where id =$1`, [id]);
    const blog_id = blog.rows[0];
    console.log("🚀 ~ saveFile ~ blog_id:", blog_id)
    let subFolder;
    if (blog_id) {
      console.log("data present");
      subFolder = blog_id.id;
      console.log("🚀  subFolder:", subFolder)
    }
    else {
      console.log("blog id doesnt exist!!")
    }
    const buffer = Buffer.from(await blob.arrayBuffer());
    const extension = blob.type.split('/').pop(); // Get file extension from MIME type
    if (!extension) {
      throw new Error('Invalid file type');
    }

    const uniqueFilename = `${filenamePrefix}-${subFolder}.${extension}`;
    const directoryPath = `public/uploads/${subFolder}/${folder_type}`;
    const filePath = path.join(directoryPath, uniqueFilename);

    // Ensure the directory exists, create it if it doesn't
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
    // Write the file content to the filePath
    fs.writeFileSync(filePath, buffer);
    console.log(`File saved at: ${filePath}`);
    return filePath;
  };
  const deleteFile = async (deleted_imgs: any) => {
    const folder_id = id;
    console.log("🚀  folder_id:", folder_id);
    const folder_path = `public/uploads/${folder_id}/body_uploads`;
    fs.readdir(folder_path, (err, images) => {
      if (err) { console.log("error in accessing images inside folder : ", err); return }
      images.forEach((img, index) => {
        if (deleted_imgs.includes(img)) {
          const imgPath = `${folder_path}/${img}`;
          fs.unlink(imgPath, (err) => {
            if (err) throw err;
          });
          console.log(`Removed image: ${img}`);
        }
      })

    })
  }
  const deleteSummaryHeader = (folder_name: string) => {
    const folder_id = id;
    const folder_path = `public/uploads/${folder_id}/${folder_name}`;
    fs.readdir(folder_path, (err, images) => {
      if (err) { console.log("error in accessing images inside folder : ", err); return }
      images.forEach((img, index) => {
        const imgPath = `${folder_path}/${img}`;
        fs.unlink(imgPath, (err) => {
          if (err) throw err;
        });
        console.log(`Removed head/sum image: ${img}`);
      })

    })
  }
  // deletedImgs
  const deleted_img = form.getAll("deletedImages[]");
  console.log("🚀 deleted image recieved are :", deleted_img)
  for (let i in deleted_img) {
    console.log('iamge to delete type is', deleted_img[i]);
    const delete_img = deleted_img[i].slice(7);
    const body_path = await deleteFile(delete_img)
    deleted_imgs_path.push(body_path);
  }
  // newImages
  const new_img = form.getAll("newImages[]");
  console.log("🚀 all new  recieved are :", new_img)
  for (let i in new_img) {
    console.log('new image is', new_img[i]);
    const current_body_img = new_img[i] as Blob;
    const body_path = await saveFile(`body_img${i}`, current_body_img, 'body_uploads');
    new_imgs_path.push(body_path);
  }
  // old images access
  const old_imgs = form.getAll('oldImages[]')
  console.log("🚀 ~ PUT ~ old_imgs:", old_imgs)

  console.log("path of deleted images : ", deleted_img)
  console.log("🚀  new_imgs_path:", new_imgs_path)

  const old_imgs_present = old_imgs.filter(imgs => !deleted_img.includes(imgs));
  console.log("🚀 ~ PUT ~ old_imgs_present:", old_imgs_present)

  const updated = old_imgs_present.concat(new_imgs_path);
  console.log("🚀 ~ PUT ~ updated:", updated)

  const updated_imgs = JSON.stringify(updated)
    .replace('[', '{')
    .replace(']', '}');
  console.log("🚀 ~ PUT ~ updated_imgs:", updated_imgs)

  //  summaryImage
  if (summary_img instanceof File) {
    deleteSummaryHeader('summary_uploads');
    summary_path = await saveFile('summary_img', summary_img, 'summary_uploads');
    console.log("🚀  got new summary upload at  : summary_path:", summary_path)
  }
  // headerImage
  if (header_img instanceof File) {
    deleteSummaryHeader('header_uploads');
    console.log("🚀 ~ RECIEVED  header_img:", header_img)
    header_path = await saveFile('header_img', header_img, 'header_uploads');
    console.log("🚀 header_path SAVED AT :", header_path)
  }

  try {
    //  Execute SQL query to update the blog with the given ID
    const result = await client.query('UPDATE blog SET title = $1, details = $2 ,contents =$3 , summary_img=$4 ,header_img =$5 ,body_imgs=$6 WHERE id = $7', [title, details, content, summary_path, header_path, updated_imgs, id])
    console.log("Query for update executed: ", result.rows[0]);

    // Check if the blog was updated successfully
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    // Return success message
    console.log("~~~~~~~~~~~~~blog updated~~~~~~~~~")
    return NextResponse.json({ message: 'Blog updated successfully' }, { status: 200 });
  } catch (error) {
    console.log("🚀 ~ PUT ~ error:", error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  // } else {
  //   return NextResponse.json({ error:  'Method not allowed'  }, { status: 405 });
  // }
}
// handle pusblish
export async function PATCH(req: Request, res: Response) {

  // VERIFYING TOKEN
  const authHeader = req.headers.get('Authorization');
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

  const user = verifyToken(token);
  const user_id = user?.id;
  console.log("🚀 ~ PATCH ~ user_id:", user_id)
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 403 });


  const data_recieved = await req.json();
  const blog_id = data_recieved.blogId;
  console.log("🚀 ~ PATCH ~ blog_id:", blog_id)

  // creating published date
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  const milliseconds = String(currentDate.getMilliseconds()).padStart(3, '0');

  // Combine the components into the desired format
  const published_date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  console.log("🚀 ~ ~ published_date:", published_date)
  const status = 'Published';

  try {
    //  Execute SQL query to update the blog with the given ID
    const result = await client.query('UPDATE blog SET status=$1,published_date=$2,published_by=$3 where id=$4', [status , published_date ,user_id,blog_id])
    console.log("Query for update executed: ", result.rows[0]);

    // Check if the blog was updated successfully
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    // Return success message
    console.log("~~~~~~~~~~~~~blog published~~~~~~~~~")
    return NextResponse.json({ message: 'Blog published successfully' }, { status: 200 });
  } catch (error) {
    console.log("🚀 ~ PUT ~ error:", error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

}