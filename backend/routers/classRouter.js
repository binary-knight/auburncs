// requirements (express)
const express = require("express");
const {
  handleGetAllClasses,
  handleGetClassByID,
  handleCreateClass,
  handleUpdateClass,
  handleDeleteClass,
} = require("../handlers/class");

// create instance of Router()
const classRouter = express.Router();

/*** REQUEST ROUTERS ***/
// Get all classes
classRouter.get("/", handleGetAllClasses);

// Get individual class
classRouter.get("/:id", handleGetClassByID);

// Create a new class
classRouter.post("/", handleCreateClass);

// Update a class
classRouter.patch("/:id", handleUpdateClass);

// Delete a class
classRouter.delete("/:id", handleDeleteClass);

// export classRouter module
module.exports = classRouter;