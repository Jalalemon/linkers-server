const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");


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
        app.get('/categories', async(req, res) =>{
            const index = req.params.index
            const query ={index};
            const categories = await categoriesCollection.find(query)
            console.log(categories);
            res.send(categories)
        })

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