/**
 * This file defines all the routes for user-related operations
 */

// imports
const express = require('express');
const {
  handleLogin,
  handleSignup,
} = require('../handlers/userHandler')

// create instance of a Router
const userRouter = express.Router();

/** ATTACH ROUTES **/
// login route
userRouter.post('/login', handleLogin);

// signup route
userRouter.post('/signup', handleSignup);

module.exports = userRouter;