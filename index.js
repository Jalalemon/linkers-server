const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
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
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });
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
    /*
    users collection */

    app.get("/users", async (req, res) => {
      const query = {};
      const users = await userCollection.find(query).toArray();
      res.send(users);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

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
    //verifyAdmin, verifyJWT,
    app.patch("/users/admin/:id", async (req, res) => {
      const decodedEmail = req.decoded.email;
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
