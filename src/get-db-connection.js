const { MongoClient } = require('mongodb');

const {
  MONGO_HOST = 'localhost',
  MONGO_PORT = '27017',
} = process.env;

module.exports = dbName => MongoClient.connect(`mongodb://${MONGO_HOST}:${MONGO_PORT}/${dbName}`, { useNewUrlParser: true });
