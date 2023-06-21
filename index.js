const express = require('express');
const cors = require('cors');
require("dotenv").config();
const app = express();
const morgan = require('morgan')
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(morgan('dev'))


app.get("/", (req, res) => {
    res.send("dashboard server Is Running")
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a5mfktt.mongodb.net/?retryWrites=true`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        const usersCollection = client.db("dashboardDB").collection("users");

        // put users
        app.put("/users/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            console.log("from users",email,user)
            const query = { email: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: user
            }
            const result = await usersCollection.updateOne(query, updatedDoc, options)
            res.send(result)
        })

        // get user by users role
        app.get("/users/admin/:email", async (req, res) => {
            const email = req.params.email;

            const query = { email: email };
            console.log("from server",email)
            const user = await usersCollection.findOne(query);
            const admin = { admin: user?.role === "admin" };
            const instructor = { instructor: user?.role === "instructor" };
            res.send({ admin, instructor })
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`From dashboard server running port is ${port}`)
})