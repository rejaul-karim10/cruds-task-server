const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("colors");

const app = express();
const port = process.env.port || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uugevwk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function dbConnect() {
  try {
    await client.connect();
    console.log("Database Connected".yellow.italic);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
}
dbConnect();

const hobbiesCollection = client.db("cruds-task").collection("hobbies");

//endpoints
// create hobbies using this endpoint
app.post("/hobbies", async (req, res) => {
  try {
    const result = await hobbiesCollection.insertOne(req.body);

    if (result.insertedId) {
      res.send({
        success: true,
      });
    } else {
      res.send({
        success: false,
      });
    }
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
    });
  }
});

// get hobbies data using this endpoint
app.get("/hobbies", async (req, res) => {
  try {
    const cursor = hobbiesCollection.find({});
    const hobbies = await cursor.toArray();
    res.send({
      success: true,
      data: hobbies,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
    });
  }
});

// delete data from the database
app.delete("/hobbies/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const hobbies = await hobbiesCollection.findOne({ _id: ObjectId(id) });

    if (!hobbies?._id) {
      res.send({
        success: false,
        error: "hobbies Doesn't exist",
      });
      return;
    }

    const result = await hobbiesCollection.deleteOne({ _id: ObjectId(id) });

    if (result.deletedCount) {
      res.send({
        success: true,
        message: `Successfully Deleted`,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// getting single entry to make it available for update
app.get("/entries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const entries = await hobbiesCollection.findOne({ _id: ObjectId(id) });
    res.send({
      success: true,
      data: entries,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// updated single entry by using this endpoint
app.patch("/entries/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await hobbiesCollection.updateOne(
      { _id: ObjectId(id) },
      { $set: req.body }
    );

    if (result.modifiedCount) {
      res.send({
        success: true,
        message: "Successfully Updated Entry",
      });
    } else {
      ("Could't Update Entry");
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.listen(port, () => console.log("Server up and running".cyan.bold));
