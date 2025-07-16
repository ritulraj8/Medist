import clientPromise from "../../lib/mongodb"; 

export default async function handler(req, res){
    try{
        const client = await clientPromise;
        const db = client.db("ritul");

        const collection =  await db.collection("users").find({}).toArray();
        res.status(200).json(collection);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}