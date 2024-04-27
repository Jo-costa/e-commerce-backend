const dotenv = require('dotenv')

const express = require("express");

const cors = require("cors")

const app = express();
const port = process.env.PORT || 3000;
const authRoutes = require('./routes/authRoutes.js')
const adminRoutes = require('./routes/adminRoutes.js')

dotenv.config();

const db = require("./models")

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