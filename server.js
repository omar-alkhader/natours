const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const databaseUrl = process.env.DATABASE_URL.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(databaseUrl, {})
  .then((c) => console.log('databas is connected'))
  .catch((err) => console.log(err));
const app = require('./app');
const PORT = +process.env.PORT || 1200;
const server = app.listen(PORT, () => {
  console.log('server is running on ' + PORT);
});
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);

  process.exit(1);
});
