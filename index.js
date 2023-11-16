const express = require('express')
require('dotenv').config()
const cors = require('cors')
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000

// popularRestaurantDB//gjSPJEUAlQhbSUZ9
// middleware
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nc6s3b6.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        const foodsCollections = client.db("restaurantDB").collection("foods")
        const reviewsCollections = client.db("restaurantDB").collection("reviews")
        const usersCollections = client.db("restaurantDB").collection("users")
        app.get('/api/v1/foods', async (req, res) => {
            console.log('req res', req.query.name);
            const result = await foodsCollections.find().toArray()
            console.log('result', result);
            res.send(result)
        })
        // reviews
        app.get('/api/v1/reviews', async (req, res) => {
            console.log('req res', req.query.name);
            const result = await reviewsCollections.find().toArray()
            console.log('result', result);
            res.send(result)
        })

        // users get
        app.get('/api/v1/getUsers', async (req, res) => {
            const result = await usersCollections.find().toArray()
            console.log('result', result);
            res.send(result)
        })

        // all users pos
        app.post('/api/v1/users', async (req, res) => {
            const user = req.body
            const result = await usersCollections.insertOne(user)
            console.log('result', result);
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("popularRestaurantDB ").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})