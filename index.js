const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
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

app.listen(port, () => console.log("Server up and running".cyan.bold));
