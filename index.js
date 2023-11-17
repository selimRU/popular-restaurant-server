const express = require('express')
require('dotenv').config()
const jwt = require('jsonwebtoken');
const cors = require('cors')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const cartsCollections = client.db("restaurantDB").collection("carts")

        const verifyToken = (req, res, next) => {
            if (!req.headers.authorization) {
                res.status(401).send({ message: 'unathorized' })
            }
            const token = req.headers.authorization.split(' ')[1]
            jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'Unathorized access' }) || res.status(403).send({ message: 'Forbiden access' })
                }
                req.decoded = decoded
                next()
            });
        }


        app.get('/api/v1/foods', async (req, res) => {
            console.log('req res', req.query.name);
            const result = await foodsCollections.find().toArray()
            // console.log('result', result);
            res.send(result)
        })
        // reviews
        app.get('/api/v1/reviews', async (req, res) => {
            console.log('req res', req.query.name);
            const result = await reviewsCollections.find().toArray()
            // console.log('result', result);
            res.send(result)
        })

        // get carts
        app.get('/api/v1/getCarts', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const result = await cartsCollections.find(query).toArray()
            // console.log('result', result);
            res.send(result)
        })
        // delete cart
        app.delete('/api/v1/deleteCarts/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await cartsCollections.deleteOne(query)
            // console.log('result', result);
            res.send(result)
        })

        // delete user
        app.delete('/api/v1/deleteUser/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await usersCollections.deleteOne(query)
            // console.log('result', result);
            res.send(result)
        })

        // users get
        app.get('/api/v1/getUsers', verifyToken, async (req, res) => {

            const result = await usersCollections.find().toArray()
            // console.log('result', result);
            res.send(result)
        })

        // all users post
        app.post('/api/v1/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(
                user,
                process.env.ACCESS_TOKEN,
                { expiresIn: '1h' });
            // console.log('result', result);
            res.send({ token })
        })
        // all users post
        app.post('/api/v1/users', async (req, res) => {
            const user = req.body
            const query = { email: user.email }
            const existingUser = await usersCollections.findOne(query)
            if (existingUser) {
                return res.send({ message: 'Already exists', insertedId: null })
            }
            const result = await usersCollections.insertOne(user)
            // console.log('result', result);
            res.send(result)
        })

        // all users update
        app.patch('/api/v1/users/admin/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            }
            const result = await usersCollections.updateOne(filter, updateDoc)
            res.send(result)
        })

        // all carts post
        app.post('/api/v1/carts', async (req, res) => {
            const user = req.body
            const result = await cartsCollections.insertOne(user)
            // console.log('result', result);
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