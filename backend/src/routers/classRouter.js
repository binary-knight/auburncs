/**
 * This file contains all of the routes for class related endpoints
 */

// TODO: once dbConnection middleware is created, add to

// requirements (express)
const express = require("express");
const { 
  studentMiddleware,
  adminMiddleware,
} = require('../middleware/auth');
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
classRouter.get("/", studentMiddleware, handleGetAllClasses);

// Get individual class
classRouter.get("/:id", studentMiddleware, handleGetClassByID);

// Create a new class
classRouter.post("/", adminMiddleware, handleCreateClass);

// Update a class
classRouter.patch("/:id", adminMiddleware, handleUpdateClass);

// Delete a class
classRouter.delete("/:id", adminMiddleware, handleDeleteClass);

// export classRouter module
module.exports = classRouter;
