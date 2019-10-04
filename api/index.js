const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser'); 
const cors = require('cors');

//create express application - recieve HTTP request and response to it
const app = express(); 
//cross origin resource sharing - allow request from same or different domain/port
app.use(cors()); 
//turn the body of POST request into json format
app.use(bodyParser.json());


// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
pgClient.on('error', () => console.log('Lost Postgres database connection'));

// create table named values
pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch(err => console.log(err));


// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000  //reconnection in 1 sec if lost connection
});
// for publisher and subscriber, have to use duplicated client
const redisPublisher = redisClient.duplicate(); 


// Express route handlers
// test route
app.get('/', (req, res) => {
  res.send('Hi');
});

// get all submitted indexes
app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * from values');
  res.send(values.rows); //only the info inside the table
});

// get calculated values and all indexes, hashed = values 
// redis doesn't support await, use call back function instead
app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});

// update the values
app.post('/values', async (req, res) => {
  const index = req.body.index;

  // upper limit is 40
  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }
  
  // actual value will be replaced by the result from worker
  redisClient.hset('values', index, 'Nothing yet!');
  // publish the index to Redis and wait for worker to calculate
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
  // send back arbitrary response 
  res.send({ working: true });
});

// listen to port 5000
app.listen(5000, err => {
  console.log('Listening on port 5000');
});


//run node index.js in console
// if only see Error: Cannot find module 'express'
// it means no typo error in syntax