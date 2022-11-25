const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const courses = require("./Data/data.json");

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6fgntc0.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run(){
    try{
        const categoriesCollection = client.db('productCategories').collection('categories');
        const waltonCollection = client.db('productCategories').collection('waltonCategories');
        const singerCollection = client.db('productCategories').collection('singerCategories');
        const marcelCollection = client.db('productCategories').collection('marcelCategories');
        const allCategoryCollection = client.db('productCategories').collection('allCategories');
        const bookingsCollection = client
          .db("productCategories")
          .collection("bookings");
        app.get('/categories', async(req, res) => {
            const query = {};
            const categories = await categoriesCollection.find(query).toArray();
            res.send(categories)
        });
        app.get('/waltonCategories', async(req, res) => {
            const query = {};
            const categories = await waltonCollection.find(query).toArray();
            res.send(categories)
        });
        app.get('/singerCategories', async(req, res) => {
            const query = {};
            const categories = await singerCollection.find(query).toArray();
            res.send(categories)
        });
        app.get('/marcelCategories', async(req, res) => {
            const query = {};
            const categories = await marcelCollection.find(query).toArray();
            res.send(categories)
        });
        app.get('/categories', async(req, res) =>{
            const index = req.params.index
            const query ={index};
            const categories = await categoriesCollection.find(query)
            console.log(categories);
            res.send(categories)
        });
        app.post('/bookings', async(req, res) =>{
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        });
        app.post('/singers', async(req, res) =>{
            const data = req.body;
            const result = await singerCollection.insertOne(data);
            res.send(result);
        });
        app.post('/walton', async(req, res) =>{
            const data = req.body;
            const result = await waltonCollection.insertOne(data);
            res.send(result);
        });
        app.post('/marcel', async(req, res) =>{
            const data = req.body;
            const result = await marcelCollection.insertOne(data);
            res.send(result);
        });


        // tttttttttt

        // app.get('/allcategories', async(req, res) =>{
          
        //     const query = {};
        //     const allcategories = await allCategoryCollection.find(query).toArray()
        //     console.log(allcategories);
        //     res.send(allcategories)
        // });
        // app.get('/allcategories', async(req, res) =>{
        //     const email = req.query.email
        //     const query = {email: email};
        //     const allcategories = await allCategoryCollection.find(query).toArray()
        //     console.log(allcategories);
        //     res.send(allcategories)
        // });

         
        //  app.get('allcategories/:id', async(req, res) =>{
        //     const id = req.params.id;
        //     const query = {};
        //     console.log(query);
        //     const allcategories = await categoriesCollection.find(query).toArray();
        //     if(id === "03"){
        //         res.send(allcategories);

        //     }
        //     else{
        //         const singlecategory = categoriesCollection.filter(n  => n._id === id);
        //         res.send(singlecategory)
        //     }
        //  })

    }
    finally{

    }
}
run().catch(console.log());

app.get('/', async(req, res) => {
    res.send('linker server running')
});
app.listen(port, () =>{
    console.log(`linkers server running on ${port}`);
} )