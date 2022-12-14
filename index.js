const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const jwt = require("jsonwebtoken");
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

async function run() {
  try {
    const categoriesCollection = client
      .db("productCategories")
      .collection("categories");
    const waltonCollection = client
      .db("productCategories")
      .collection("waltonCategories");
    const singerCollection = client
      .db("productCategories")
      .collection("singerCategories");
    const marcelCollection = client
      .db("productCategories")
      .collection("marcelCategories");
    const allCategoryCollection = client
      .db("productCategories")
      .collection("allCategories");
    const bookingsCollection = client
      .db("productCategories")
      .collection("bookings");
    const userCollection = client.db("productCategories").collection("users");
    const paymentCollection = client.db("productCategories").collection("payments");
    const advertiseCollection = client.db("productCategories").collection("advertise");

    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.query.email;
      const query = { email: decodedEmail };
      const user = await userCollection.findOne(query);
      if (user?.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    app.get("/categories", async (req, res) => {
      const query = {};
      const categories = await categoriesCollection.find(query).toArray();
      res.send(categories);
    });
    app.get("/waltonCategories", async (req, res) => {
      const query = {};
      const categories = await waltonCollection.find(query).toArray();
      res.send(categories);
    });
    app.get("/singerCategories", async (req, res) => {
      const query = {};
      const categories = await singerCollection.find(query).toArray();
      res.send(categories);
    });
    app.get("/marcelCategories", async (req, res) => {
      const query = {};
      const categories = await marcelCollection.find(query).toArray();
      res.send(categories);
    });
    app.get("/categories", async (req, res) => {
      const index = req.params.index;
      const query = { index };
      const categories = await categoriesCollection.find(query);
      console.log(categories);
      res.send(categories);
    });

    // booking collection
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });
    app.get('/myOrder', async(req, res) =>{
        const email = req.query.email;
        const query = {email: email};
        const myOrder = await bookingsCollection.find(query).toArray();
        console.log(myOrder);
        res.send(myOrder)
    });
    app.get('/myOrder', async(req, res) =>{
    
      const query = {};
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    })
    app.get('/myOrder/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await bookingsCollection.findOne(query);
      res.send(result);
    })
    app.post("/singers", async (req, res) => {
      const data = req.body;
      const result = await singerCollection.insertOne(data);
      res.send(result);
    });
    app.post("/walton", async (req, res) => {
      const data = req.body;
      const result = await waltonCollection.insertOne(data);
      res.send(result);
    });
    app.post("/marcel", async (req, res) => {
      const data = req.body;
      const result = await marcelCollection.insertOne(data);
      res.send(result);
    });
    app.post("/allCategories", async (req, res) => {
      const data = req.body;
      const result = await allCategoryCollection.insertOne(data);
      res.send(result);
    });

    app.get("/allcategories", async (req, res) => {
      const query = {};
      const categories = await allCategoryCollection.find(query).toArray();
      res.send(categories);
    });

    app.get("/allcategories", verifyJWT, async (req, res) => {
      console.log(req.headers.authorization);
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }
      console.log("token ps", req.headers.authorization);
      const query = { email: email };
      const allcategories = await allCategoryCollection.find(query).toArray();
      res.send(allcategories);
    });
    // 2nd all payment

    app.post('/payments', async(req, res) =>{
      const payment = req.body;
      const result = await paymentCollection.insertOne(payment);
      const id = payment.bookingId;
      const filter = {_id: ObjectId(id)}
      const updateDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId

        }
      }
      const updateResult = await bookingsCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    
    // products
    app.delete('/myProducts/:id', async(req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const result = await allCategoryCollection.deleteOne(filter);
        res.send(result); 
    })
    app.delete('/myProducts/:id', async(req, res) =>{
        const id  = req.params.id;
        const query = { _id: ObjectId(id)}
        const result = await allCategoryCollection.deleteOne(query);
        res.send(result)
    })
    app.get("/myProducts", async (req, res) => {
      console.log(req.headers.authorization);
      const email = req.query.email;
    //   const decodedEmail = req.decoded.email;
    //   if (email !== decodedEmail) {
    //     return res.status(403).send({ message: "forbidden access" });
    //   }
      console.log("token ps", req.headers.authorization);
      const query = { email: email };
      const allcategories = await allCategoryCollection.find(query).toArray();
      res.send(allcategories);
    });
    /*
    users collection */

    app.get("/users", async (req, res) => {
      const query = {};
      const users = await userCollection.find(query).toArray();
      res.send(users);
    });
    // http://localhost:5000/usersquery?role=seller

    app.get("/usersquery", async (req, res) => {
      const role = req.query.role;
      console.log(role);
      const query = { role: role };
      const users = await userCollection.find(query).toArray();
      console.log(users);
      res.send(users);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

      app.delete("/users/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await userCollection.deleteOne(query);
        res.send(result);
      });

    // advertise


    function verifyJWT(req, res, next) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).send("unauthorized access");
      }
      const token = authHeader.split(" ")[1];
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        function (err, decoded) {
          if (err) {
            console.log(err);
            return res.status(403).send({ message: "forbidden access" });
          }
          req.decoded = decoded;
          next();
        }
      );
    }
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
     res.send({ isAdmin: user?.role === "admin" });
    });

    // payment intents

    app.post('/create-payment-intent', async(req, res) =>{
      const bookings = req.body;
      const balance = parseInt(bookings.balance);
      const amount = balance * 100;
      
      const paymentIntent = await stripe.paymentIntents.create({
        currency: 'usd',
        amount : amount,
        'payment_method_types': [
          'card'
        ],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    })


    //verifyAdmin, verifyJWT,
    app.put("/users/admin/:id", async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      const query = { email: decodedEmail };
      const user = await userCollection.findOne(query);

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.delete("/users/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(filter);
      res.send(result);
    });

   app.post('/advertisments', async(req, res) => {
    const advertise = req.body;
    const result = await advertiseCollection.insertOne(advertise)
    res.send(result)
   })
   app.get('/advertise', async (req, res) =>{
    const query ={}
    const result = await advertiseCollection.find(query).toArray();
    res.send(result)
   });
   app.get('/advertiseHome', async(req, res) =>{
    const email = req.query.email;
    const query= {email: email};
    const result = await advertiseCollection.find(query).toArray()
    res.send(result)
   });
   app.get('/advertiseProduct', async(req, res) => {
    const productId = req.query.productId;
    const query = {productId : productId};
    const result = await advertiseCollection.findOne(query)
    res.send(result)
   })
    /** jwt token */

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(query);
      const user = await userCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "5d",
        });
        return res.send({ accessToken: token });
      }
      console.log(user);
      return res.status(403).send({ accessToken: "" });
    });

    // admin panel


        app.get("/users/admin/:id", async (req, res) => {
          const id = id.params.id;
          const query = { _id: ObjectId(id) };
          const user = await userCollection.findOne(query);
          res.send({ isAdmin: user?.role === "admin" });
        });

         app.get("/users/admin/:email", async (req, res) => {
           const email = req.params.email;
           const query = { email };
           const user = await userCollection.findOne(query);
           res.send({ isAdmin: user?.role === "admin" });
         });
         app.get("/users/seller/:email", async (req, res) => {
           const email = req.params.email;
           const query = { email };
           const user = await userCollection.findOne(query);
           res.send({ isSeller: user?.role === "seller" });
         });
         app.get("/users/Buyer/:email", async (req, res) => {
           const email = req.params.email;
           const query = { email };
           const user = await userCollection.findOne(query);
           res.send({ isBuyer: user?.role === "Buyer" });
         });


  } finally {
  }
}
run().catch(console.log());

app.get("/", async (req, res) => {
  res.send("linker server running");
});
app.listen(port, () => {
  console.log(`linkers server running on ${port}`);
});
