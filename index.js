const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const bidsCollection = db.collection('bids');
        const userCollection = db.collection('users')

         // users post
        app.post('/users', async(req, res) => {
            const newUsers = req.body;

            // akoy user ak bar er besy add na korar sestem

            const email = newUsers.email;
            const query = {email : email};
            const existingUser = await userCollection.findOne(query);
            if(existingUser){
                res.send({message : 'user alredy added : do not inset again'})
            }
            else{
              const result = await userCollection.insertOne(newUsers);
              res.send(result);
            }

           
        })


        //all product get korar jonno 
        app.get('/products', async (req, res) => {
            // sort mane kuno data chuto take boro akare dekanu
            // limit mane onek data deke niddista data dekano
            // skip mane nidisto kicu data bad dete porer data k dekanu
           // const projectFild = {name: 1 , email: 1}
          //  const cursor = productsCollection.find().sort({price_min: 1}).limit(15).skip(3)

          // query perameters sistem
           console.log(req.query);
           const email = req.query.email;
           const query = {}
           if(email){
            query.email = email;
           }
           

          const cursor = productsCollection.find(query)
         
            //.project(projectFild);
            const result = await cursor.toArray();
            res.send(result);
        })

        // single product get korar jonoo
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await productsCollection.findOne(query);
            res.send(result);
        })

        //  post medthod
        app.post('/products', async (req,res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        })
        
        //patch/update medthod 
        app.patch('/products/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const updateProduct = req.body;
            const update = {
                $set: {
                    name: updateProduct.name,
                    price: updateProduct.price,
                }
            }
            const result = await productsCollection.updateOne(query, update)
            res.send(result);

        })

        // delete medthod
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        })
        
        // bids releted api

        app.get('/bids', async (req, res) => {
            const email = req.query.email;
            const query = {};
            if(email) {
                query.buyer_email = email;
            }
            const  cursor = bidsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

         app.get('/bids/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id)};
            const result = await bidsCollection.findOne(query);
            res.send(result);
        })

        app.post('/bids', async (req,res) => {
            const newBid = req.body;
            const result = await bidsCollection.insertOne(newBid);
            res.send(result);
        })

        app.delete('/bids/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id)};
            const result = await bidsCollection.deleteOne(query);
            res.send(result);
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
