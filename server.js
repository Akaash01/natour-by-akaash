const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('connected');
  });

const server = app.listen(process.env.PORT, () => console.log('listening'));
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('under rejection Shutting down ...');
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION SHUTTING DOWN.....');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
