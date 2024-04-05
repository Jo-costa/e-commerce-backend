const express = require("express");
const mysql = require("mysql2");
const cors = require("cors")
const app = express();
const port = process.env.PORT || 3000;
const authRoutes = require('./routes/authRoutes')

require('dotenv').config();

const db = require("./models")
app.use(cors())
app.use(express.json())
app.use(authRoutes);

db.sequelize.sync().then((req) => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    })
})