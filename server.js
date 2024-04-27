const dotenv = require('dotenv')
const stripe = require('stripe')('sk_test_51P2zwpJZGiiutofUAJGDYD0BSVIyL22VNO2SLNB5E4vrZ5lx15IqRRk52JaJrtT73vDX0fawQpcivAZaygvaHxrz00gS4KlPgX')
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors")

const app = express();
const port = process.env.PORT || 3000;
const authRoutes = require('./routes/authRoutes.js')
const adminRoutes = require('./routes/adminRoutes.js')

dotenv.config();

const db = require("./models")
const allowedOrigins = ['http://myetest101.s3-website-us-east-1.amazonaws.com', 'http://localhost:3000'];


app.use(cors());
app.options('*', cors())
app.use(express.json())

app.use(authRoutes);
app.use(adminRoutes);


db.sequelize.sync().then((req) => {
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        })
    }).then(() => {
        console.log("Models synchronized with the database.");
    })
    .catch(error => {
        console.error("Error connecting to the database:", error);
    });