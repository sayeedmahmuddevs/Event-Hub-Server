import express from 'express';
import { MongoClient } from 'mongodb';
import 'dotenv/config'
import cors from 'cors';


const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URL)

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



app.get('/', (req, res) => {
  res.send('Hello World!');
});


// http://localhost:8000/events
app.post("/events", async (req, res) => {
  const event = req.body;
  const result = await eventsCollection.insertOne(event);
  res.send(result);
  
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});