const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

// smartdbUser
//is1DCTVoUgDygwZl

const uri = "mongodb+srv://smartdbUser:is1DCTVoUgDygwZl@project-1.zd08b5r.mongodb.net/?appName=project-1";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



app.get('/', (req,res) => {
    res.send('smart server is running')  
})

async function run () {
    try{
        await client.connect();
        const db = client.db('smart_db')
        const productsCollection = db.collection('products');

        app.post('/products', async (req,res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        })

        app.delete('/products/:id', (req, res) => {
            const id = req.params.id;
        })
        
        await client.db("admin").command({ ping: 1 });
         console.log("Pinged your deployment. You successfully connected to MongoDB!");

    }
    finally{

    }
}
run().catch(console.dir)

app.listen(port, ()=> {
    console.log(`smart server is running on port : ${port}`);
    
})

// mongodb connect for ather sestem
//  client.connect()
//  .then(() => {
//     app.listen(port, ()=> {
//     console.log(`smart server is running now on port : ${port}`);
//     })
//  })
//  .catch(console.dir)
