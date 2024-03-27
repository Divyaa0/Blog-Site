import { Client } from 'pg'



const client = new Client({
    // user: process.env.NEXT_APP_USER,
    // password: process.env.NEXT_APP_PASSWORD,
    // host: process.env.NEXT_APP_HOST,
    // port: process.env.NEXT_APP_PORT,
    // database: process.env.NEXT_APP_DATABASE,

    user: 'postgres',
    password: '123',
    host: 'localhost',
    port: 5432,
    database:'imentus_admin',
 
})
await client.connect().then(()=>{
        console.log("database connected")
    }).catch((error)=>{console.log("database didn't connect",error)});


export { client };