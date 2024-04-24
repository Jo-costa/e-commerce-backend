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
app.use(cors())
const endpointSecret = "whsec_aee08fb9a86b0772301660876b5056dd819af61625b6502d8bdbafd87c4a733b";

// app.post('/webhook', express.raw({
//     type: 'application/json'
// }), (request, response) => {
//     const sig = request.headers['stripe-signature'];

//     let event;

//     try {
//         event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
//     } catch (err) {
//         console.log(err.message);
//         response.status(400).send(`Webhook Error: ${err.message}`);
//         return;
//     }

//     // Handle the event
//     switch (event.type) {
//         case 'checkout.session':
//             const paymentIntentSucceeded = event.data.object;
//             console.log("pay: ", paymentIntentSucceeded);
//             // Then define and call a function to handle the event payment_intent.succeeded
//             break;
//             // ... handle other event types
//         default:
//             console.log(`Unhandled event type ${event.type}`);
//     }

//     // Return a 200 response to acknowledge receipt of the event
//     response.send();
// });
app.use(express.json())


app.use(authRoutes);
app.use(adminRoutes);

db.sequelize.sync().then((req) => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    })
})