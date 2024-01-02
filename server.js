const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./.env" });
console.log(process.env.DB);
const app = require("./app");
const DB = process.env.DB;
const port = process.env.port || 3000;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() =>
    app.listen(port, () => console.log(`serve is running on port ${port}`))
  );
