import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import cors from "cors";
import { createRemoteJWKSet, jwtVerify } from "jose";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware configuration
app.use(cors());
app.use(express.json());

// mongodb URL
const client = new MongoClient(process.env.MONGODB_URL);

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
const user = db.collection("user");
const joindEventCollection = db.collection("joined-event");

const veryfied = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if(!authHeader?.startsWith('Bearer ')){
    return res.status(401).send({msg : "Unauthorized"})
  }
  const token = authHeader.split(' ')[1];
  
  try {
    const JWKS = createRemoteJWKSet(
      new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));
      const {payload} = await jwtVerify(token, JWKS)
      req.user = payload;
      next();
    
  } catch (error) {
    return res.status(401).send({msg : "Unauthorized"})
  }
};

// singleCard
app.get("/events/:id",veryfied, async (req, res) => {
  const { id } = req.params;
  const result = await eventsCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
});

// edit
app.patch("/events/:id", veryfied, async (req, res) => {
  const { id } = req.params;
  const { userId, ...eventData } = req.body;
  const result = await eventsCollection.updateOne(
    { _id: new ObjectId(id), userId: userId },
    { $set: eventData },
  );
  res.json(result);
});

// delete event

app.delete("/events/:id",veryfied, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const result = await eventsCollection.deleteOne({
    _id: new ObjectId(id),
    userId: userId,
  });
  res.json(result);
});

// events created api
// http://localhost:8000/events
app.post("/events", async (req, res) => {
  try {
    const eventData = req.body;
    const title = eventData.title?.trim();

    if (!title) {
      return res.status(400).send({
        message: "Event title is required!",
      });
    }

    const result = await eventsCollection.insertOne({
      ...eventData,
      title,
    });

    res.status(201).send({
      message: "Event created successfully!",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Something went wrong!",
    });
  }
});
// http://localhost:8000/events/user/userId
app.get("/events/users/:userId", veryfied, async (req, res) => {
  const { userId } = req.params;

  const result = await eventsCollection.find({ userId: userId }).toArray();

  res.send(result);
});

// http://localhost:8000/user/:userId

app.get("/user/:userId", veryfied, async (req, res) => {
  const { userId } = req.params;

  const result = await user.findOne(
    { _id: new ObjectId(userId) },
    {
      projection: {
        _id: 0,
        name: 1,
        image: 1,
      },
    },
  );
  res.send(result);
});

// http://localhost:8000/joined-events

app.post("/joined-events",veryfied, async (req, res) => {
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

  res.send(result);
});




app.delete("/joined-events/:id", veryfied, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const result = await joindEventCollection.deleteOne({
    eventId: id,
    userId: userId,
  });
  res.json(result);
});

// http://localhost:8000/joined-events/:userId

app.get("/joined-events/:userId",veryfied, async (req, res) => {
  const { userId } = req.params;

  const result = await joindEventCollection.find({ userId: userId }).toArray();

  const eventId = result.map((item) => new ObjectId(item.eventId));
  const allResult = await eventsCollection
    .find({
      _id: { $in: eventId },
    })
    .toArray();

  console.log(allResult);
  res.send(allResult);
});
// http://localhost:8000/joined-event/events/:id
app.get("/joined-event/events/:id", veryfied, async (req, res) => {
  const { id } = req.params;
  const result = await joindEventCollection
    .find({
      eventId: id,
    })
    .toArray();
  res.send(result);
});

// http://localhost:8000/users/:username
app.get("/users/:username",veryfied, async (req, res) => {
  const username = req.params.username;
  const result = await user.findOne({
    username: username,
  });

  res.send(result);
});

// upcoming Event
app.get("/events",veryfied, async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const result = await eventsCollection
    .find({
      eventDate: { $gte: today },
    })
    .sort({ eventDate: 1 })
    .toArray();

  res.send(result);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app