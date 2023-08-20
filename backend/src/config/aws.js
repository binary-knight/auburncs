/**
 * This file wraps the aws operations in a bespoke module for simplification
 * and ease of testing in the future
 */

const aws = require('aws-sdk');

// Set the AWS region
process.env.AWS_REGION = 'us-east-1';

// AWS SSM for grabbing Systems Manager Parameters
const ssm = new aws.SSM();

// Retrieve the db credentials from Systems Manager
const fetchDBCredentials = async () => {
  const parameterName = `${process.env.REACT_APP_DB_CREDENTIALS}`;

  const params = {
    Name: parameterName,
    WithDecryption: true
  };

  try {
    const response = await ssm.getParameter(params).promise();
    return JSON.parse(response.Parameter.Value);
  } catch (error) {
    console.error('Error retrieving database credentials:', error);
    throw error;
  }
};

// Retrieve the jwt signing secret from Systems Manager
const fetchJWTSecret = async () => {
  const parameterName = '/auburncs/jwtSecretKey';

  const params = {
    Name: parameterName,
    WithDecryption: true
  };

  try {
    const response = await ssm.getParameter(params).promise();
    return response.Parameter.Value;
  } catch (error) {
    console.error('Error retrieving secret key:', error);
    throw error;
  }
};

module.exports = { 
  fetchDBCredentials,
  fetchJWTSecret,
}