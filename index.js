const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use(
  cors({
    origin: "https://9b9366-8e.myshopify.com",
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/endpoint", (req, res) => {
  console.log(req.body);

  fs.writeFile("data.json", JSON.stringify(req.body), (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error saving data");
    } else {
      res.send("Data saved successfully");
    }
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
