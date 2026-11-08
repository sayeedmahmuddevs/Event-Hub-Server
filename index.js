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
const eventCollectionUser = db.collection("user");
const joindEventCollection = db.collection("joined-event")

// singleCard
app.get ("/events/:id", async(req, res) => {
  const {id} = req.params
  const result = await eventsCollection.findOne({_id: new ObjectId(id)})
  res.send(result)
})


// edit
app.patch('/events/:id', async(req, res) => {
  const {id} = req.params
  const {userId, ...eventData} = req.body
  const result = await eventsCollection.updateOne(
    {_id: new ObjectId(id),
      userId : userId
    },
    {$set: eventData}
  )
  res.json(result)
})

// delete event

app.delete('/events/:id', async(req, res) => {
  const {id} = req.params
  const {userId} = req.body
  const result = await eventsCollection.deleteOne(
    {_id: new ObjectId(id),
      userId : userId
    }
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

// http://localhost:8000/user/:userId

app.get("/user/:userId", async (req, res) => {
  
    const { userId } = req.params;


    const user = await eventCollectionUser.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          _id: 0,
          name: 1,
          image: 1,
        },
      }
    );

    res.send(user);

  
});

// http://localhost:8000/joined-events

app.post("/joined-events", async(req, res)=>{
  const { eventId, userId } = req.body;

  const existing = await joindEventCollection.findOne({
      eventId,
      userId,
    });

    if (existing) {
      return res.send({
        message: "Already joined this event",
      });
    }

    const result = await joindEventCollection.insertOne({
      eventId,
      userId,
      joinedAt: new Date(),
    });

  res.send(result)

})

app.get("/joined-events/:userId", async (req, res) => {
  const { userId } = req.params;

  const result = await joindEventCollection
    .find({ userId: userId })
    .toArray();

  res.send(result);
});


// upcoming Event
app.get("/events", async(req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const result = await eventsCollection.find({
    eventDate:{$gte: today}
  })
  .sort({eventDate : 1})
  .toArray()

  res.send(result)
})


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});