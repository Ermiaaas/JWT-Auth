const express = require("express");
const db = require("./config/database/db_connection.js")
const router = require("./api/userService")

const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", router)

require("dotenv").config()



app.listen(3000, () => {
    console.log("Server running on Port 3000!")
});