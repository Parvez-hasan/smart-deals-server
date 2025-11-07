const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 4000;

// console.log(process.env);

// firebase admin sdk
const admin = require("firebase-admin");

const serviceAccount = require("./smart-deals-739e8-firebase-adminsdk-fbsvc-41fbfd49e8.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



// middleware
app.use(cors());
app.use(express.json());

const logger = (req, res, next) => {
    console.log('logger inoformetion');
    next();
}
const varifyFirebaseToken = async (req,res, next) => {
    console.log('in the varify meddlewares', req.headers.authorization);

    if(!req.headers.authorization){
        //do not allow access 
        return res.status(401).send({message: 'unauthorizad access'})
    }

    const token = req.headers.authorization.split(' ')[1];
    if(!token){
       return res.status(401).send({message: 'unauthorizad access'})
    }

    // verify id token
    try{
         const userInfo =  await admin.auth().verifyIdToken(token);

         // right email verify
         req.token_email = userInfo.email;
         console.log('after token valitaton' , userInfo);
         next();
         
    }
    catch{
         return res.status(401).send({message: 'unauthorizad access'})
    }

    
}



// smartdbUser
//is1DCTVoUgDygwZl

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@project-1.zd08b5r.mongodb.net/?appName=project-1`;

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
        const userCollection = db.collection('users');

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
          // console.log(req.query);
           const email = req.query.email;
           const query = {}
           if(email){
            query.email = email;
           }
           
          const cursor = productsCollection.find(query).sort({price_min: 1})
         
            //.project(projectFild);
            const result = await cursor.toArray();
            res.send(result);
        })

        // latest product api
        app.get('/latest-product', async(req,res) => {
            const cursor = productsCollection.find().sort({created_at: -1}).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        // single product get korar jonoo
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
         //  const query = {_id: id};
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

        app.get('/bids', logger, varifyFirebaseToken, async (req, res) => {

         //  console.log('headers', req);
            
            const email = req.query.email;
            const query = {};

            if(email) {
                //right email valited
                if(email !== req.token_email){
                    return res.status(403).send({message : 'forbidden access '})
                }
                query.buyer_email = email;
            }

            const  cursor = bidsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

         app.get('/products/bids/:productId', varifyFirebaseToken, async(req, res ) => {
           const productId = req.params.productId;
           const query = { product: productId };
           const cursor = bidsCollection.find(query).sort({ bid_price: -1})
           const result = await cursor.toArray();
           res.send(result);
       })


         app.get('/bids/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id)};
            const result = await bidsCollection.findOne(query);
            res.send(result);
        })

        app.get('/bids', async (req, res ) => {
           
            // email diye my bids dekar jonno 
            const query = {};
            if(query.email){
                query.buyer_email = email ;
            }

            const cursor = bidsCollection.find();
            const result = await cursor.toArray();
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
