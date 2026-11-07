import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import cors from 'cors';


const app = express();
const PORT = process.env.PORT || 8000;

// Middleware configuration
app.use(cors());
app.use(express.json());


// mongodb URL
const client = new MongoClient(process.env.MONGODB_URL)

// mongodb connection function
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const mongoClient = await connectToMongoDB();
const db = mongoClient.db("event_hub");
const eventsCollection = db.collection("events");

// singleCard
app.get ("/events/:id", async(req, res) => {
  const {id} = req.params
  const result = await eventsCollection.findOne({_id: new ObjectId(id)})
  res.send(result)
})


// edit
app.patch('/events/:id', async(req, res) => {
  const {id} = req.params
  const updateData = req.body
  const result = await eventsCollection.updateOne(
    {_id: new ObjectId(id)},
    {$set: updateData}
  )
  res.json(result)
})

// delete event

app.delete('/events/:id', async(req, res) => {
  const {id} = req.params
  const result = await eventsCollection.deleteOne(
    {_id: new ObjectId(id)}
  )
  res.json(result)
})

// events created api
// http://localhost:8000/events
app.post("/events", async (req, res) => {
  const event = req.body;
  const result = await eventsCollection.insertOne(event);
  res.send(result);
  
})
// http://localhost:8000/events/user/userId
app.get("/events/users/:userId", async (req, res) => {
  const { userId } = req.params;

  const result = await eventsCollection
    .find({ userId:userId })
    .toArray();

  res.send(result);
});



app.get("/events", async(req, res) => {
  const result = await eventsCollection.find().toArray()
  res.send(result)
})



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});