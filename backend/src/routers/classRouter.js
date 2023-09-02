/**
 * This file contains all of the routes for class related endpoints
 */

// requirements
const express = require("express");
const { 
  studentMiddleware,
} = require('../middleware/auth');
const {
  handleGetAllClasses,
} = require("../handlers/classHandler");

// create instance of Router()
const classRouter = express.Router();

/*** REQUEST ROUTERS ***/
// Get all classes
classRouter.get("/", studentMiddleware, handleGetAllClasses);

// export classRouter module
module.exports = classRouter;
