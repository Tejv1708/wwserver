import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import userRoute from "./routes/userRoute.js";

import app from './app.js';
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION ! Shutting Down ');
  console.log(err.name, err.message);
  process.exit(1);
});

// app.use("/user", userRoute);
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose
  // .connect(process.env.DATABASE_LOCAL , )
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
  })
  .catch((err) => console.log(`ERROR:${err}`));

// const port = process.env.PORT || 3000;

// Start Server
const server = app.listen(5000, () => {
  console.log('App listing on 5000');
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLE REJECTION ! Shutting Down ');
  server.close(() => {
    process.exit(1);
  });
});
