// requirements
// require("dotenv").config({ path: "./.env." + process.env.NODE_ENV });
const express = require("express");
const mysqlConfig = require("./src/config/mysql");
const awsConfig = require("./src/config/aws");
const classRouter = require("./src/routers/classRouter");

async function loadConfiguration() {
  const dbCredentials = await awsConfig.fetchDBCredentials();
  const jwtSecret = await awsConfig.fetchJWTSecret();

  return {
    dbCredentials,
    jwtSecret,
  };
}

async function startServer() {
  try {
    const app = express();

    const config = await loadConfiguration();

    const connectionPool = mysqlConfig.createConnectionPool(config.dbCredentials);

    // Apply middlewares
    app.use(express.json());
    // app.use(errorHandler);

    // Attaches db connection to local storage
    app.locals.connectionPool = connectionPool;

    // Attach routers
    app.get("/", (req, res) => {
      conn = req.connectionPool;
      res.json({ mssg: "Welcome to the app, the db conn is: ", conn });
    });

    app.use("/classes", classRouter);

    // Create server
    const server = http.createrServer(app);

    // Start listening
    app.listen(3000, () => {
      console.log("connected to db and listening on port", 3000);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("Shutting down server gracefully...");
      await connectionPool.close();
      server.close(() => {
        console.log("Server has been gracefully closed");
        process.exit(0);
      });
    });
  } catch (err) {}
}

startServer();
