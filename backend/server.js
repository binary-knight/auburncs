// requirements
// require("dotenv").config({ path: "./.env." + process.env.NODE_ENV });
const express = require("express");
const classRouter = require("./routers/classRouter");

// express app
const app = express();

// middleware
app.use(express.json());

// log the request and pass the db connection
app.use((req, res, next) => {
  console.log(req.path, req.method);
  req.dbConnection = "db connnection";
  next();
});

// routes
app.get("/", (req, res) => {
  res.json({ mssg: "Welcome to the app" });
});

app.use("/classes", classRouter);

app.listen(3000, () => {
  console.log("connected to db and listening on port", 3000);
});
