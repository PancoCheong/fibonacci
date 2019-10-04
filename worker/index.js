const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

// clone the client
const sub = redisClient.duplicate();

// classic recursive solution for Fibonacci Sequence, a bit slow on calculation
function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

// trigger call back function when new message arrive
sub.on('message', (channel, message) => {
  //hash value
  redisClient.hset('values', message, fib(parseInt(message)));
});
// subscribe for insert even
sub.subscribe('insert');

//node index.js to test, should see the only one error
//Error: Cannot find module 'redis'