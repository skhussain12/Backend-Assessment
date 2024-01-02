const express = require("express");
const userRouter = require("./routes/userRoutes");
const path = require("path");
const app = express();
app.use(express.json());

app.use("/", userRouter);
app.use(express.static(path.join(__dirname, "public")));
module.exports = app;
