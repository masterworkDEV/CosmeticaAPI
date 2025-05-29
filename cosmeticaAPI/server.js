const dotenv = require("dotenv");
const path = require("path");
const express = require("express");
const cors = require("cors");
const corsOption = require("./config/corsOption");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
dotenv.config();

const app = express(); // Initialize app

const PORT = process.env.PORT || 3500; // Port

app.use(cors(corsOption));

app.use(cookieParser());

// If our router matches all routes
// app.all("*", (req, res) => {
//   res.status(400);
//   req.accepts("html")
//     ? res.sendFile(path.join(__dirname,  "public", "pages", "404.html"))
//     : req.accepts("json")
//     ? res.send({ message: `Resource not found` })
//     : res.type("txt").send("Resource not found");
// });

// for our middleware

// app.use((err, req, res, next)=>{
//     console.log(err.stack);
//     res.status(500).send('Something broke!')
// })

app.listen(PORT, () => console.log(`server started on ${PORT}`));
