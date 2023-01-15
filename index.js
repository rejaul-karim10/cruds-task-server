const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("colors");

// mail gun key
const mailgun = require('mailgun-js')({apiKey: process.env.EMAIL_SEND_KEY, domain: process.env.EMAIL_SEND_DOMAIN});

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

// database collections
const entriesCollection = client.db("cruds-task").collection("entries");

// sending email using this endpoint
app.post('/send-email', (req, res) => {
  const { selectedRows } = req.body;

  // Validate the selectedRows data
  if (!Array.isArray(selectedRows)) {
      return res.status(400).json({ error: 'Selected rows must be an array' });
  }
  if (selectedRows.length === 0) {
      return res.status(400).json({ error: 'No rows selected' });
  }

  // Compose the email
  const emailData = {
      from: 'rkrabby86@gmail.com',
      to: 'rejaulkarim66666@gmail.com',
      subject: 'Selected rows data',
      text: `The selected rows data is: ${selectedRows}`
  };

  // Send the email
  mailgun.messages().send(emailData, (error, body) => {
      if (error) {
          res.status(500).send({ error: error.message });
      } else {
          res.send({ message: 'Email sent successfully' });
      }
  });
});



//endpoints
// create entries using this endpoint
app.post("/entries", async (req, res) => {
  try {
    const result = await entriesCollection.insertOne(req.body);

    if (result.insertedId) {
      res.send({
        success: true,
        message: "Successfully Created Entry",
      });
    } else {
      res.send({
        success: false,
        message: "Something went wrong",
      });
    }
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      message: "Something went wrong",
    });
  }
});

// get entries data using this endpoint
app.get("/entries", async (req, res) => {
  try {
    const cursor = entriesCollection.find({});
    const entries = await cursor.toArray();
    res.send({
      success: true,
      data: entries,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      message: "Something went wrong",
    });
  }
});

// delete data from the database using this endpoint
app.delete("/entries/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const entries = await entriesCollection.findOne({ _id: ObjectId(id) });

    if (!entries?._id) {
      res.send({
        success: false,
        error: "Entries doesn't exist",
      });
      return;
    }

    const result = await entriesCollection.deleteOne({ _id: ObjectId(id) });

    if (result.deletedCount) {
      res.send({
        success: true,
        message: `Successfully Deleted Entry`,
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
    const entries = await entriesCollection.findOne({ _id: ObjectId(id) });
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
    const result = await entriesCollection.updateOne(
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

// test endpoint
app.get('/', (req, res)=>{
  console.log("Server in running")
})

app.listen(port, () => console.log("Server up and running".cyan.bold));
