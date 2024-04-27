const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer")
const smtpTransport = require("nodemailer-smtp-transport")
const dotenv = require('dotenv')
dotenv.config();

const {
    Admin,
    Products,
    Wishlist,
    User,
    Orders,
    OrderItems,
    Payments,
    Session,
    Cart,
    Inventory,
    sequelize
} = require('../models');
const {
    join
} = require("path");

function sendSignupConfirmation(newUserMail, name, id) {
    const token = generateEmailVerificationToken(id)


    const transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    }))

    const mail_config = {
        from: 'rapidapimail2121@gmail.com',
        to: newUserMail,
        subject: "Welcome to DigitalDynasty! Get Ready to Shop 🛍️"

            ,
        html: `<p>Hi ${name}</p>!

        <p>Welcome to DigitalDynasty! 🎉 We're thrilled to have you join our community of savvy shoppers.</p>
        
        <p>By signing up, you've unlocked access to exclusive deals, personalized recommendations, and speedy checkout options.
        Before you can start using our platform, please confirm your account by clicking the link below:</p>
        
        <p><a href="http://3.225.74.199:3000/signup/accountverified/${token}">Verify Account</a></p>
        
        <p>Happy shopping!</p>
        
        <p>Best regards,</p>
        <p>The DigitalDynasty Team</p>`
    }

    transporter.sendMail(mail_config, (error, info) => {
        if (error) {
            console.log("Error sending email", error);

        }
    })
}

const createToken = (id) => {
    return jwt.sign({
        id
    }, "secretKEYjwt", {
        expiresIn: "1h"
    })
}
const generateEmailVerificationToken = (id) => {
    return jwt.sign({
        id,
        expires: Math.floor(Date.now() * 1000) + (10 * 60)
    }, "emailVerificationToken")
}

const verifyGenerateEmailVerificationToken = (token) => {
    try {
        const decode = jwt.verify(token, "emailVerificationToken")
        return decode
    } catch (error) {
        return null
    }
}


module.exports.getProds = async (req, res) => {

    try {

        const prods = await sequelize.models.Products.findAll({
            //joining tables
            include: [sequelize.models.Inventory, sequelize.models.Images]
        })


        if (req.headers.authorization) {

            //remove Bearer string from the token
            const token = req.headers.authorization.split(" ")[1];

            //check if user has an active session
            const user = await Session.findOne({
                where: {
                    session_id: token
                }
            })

            //get user cart items
            if (user) {
                const user_id = user.user_id
                const cart = await Cart.findAll({
                    where: {
                        user_id: user_id
                    },
                    attributes: {
                        exclude: ['createdAt', 'updatedAt']
                    }
                })

                return res.json({
                    'prods': prods,
                    'cart': cart
                })
            }
        }

        return res.json(prods)

    } catch (error) {
        res.status(500).json({
            error: `Internal server error ${error}`
        })
    }
}

module.exports.addToCart = async (req, res) => {
    const {
        user_id,
        cart,
        inventory
    } = req.body

    const lastAdded = cart[cart.length - 1]
    const authUser = await Session.findOne({
        where: {
            user_id: user_id
        }
    })

    if (authUser) {

        const productInCartTable = await Cart.findOne({
            where: {
                product_id: lastAdded.product_id
            }
        })

        if (!productInCartTable) {
            const addToCartTable = await Cart.create({
                user_id: user_id,
                product_id: lastAdded.product_id,
                quantity: lastAdded.quantity,
                name: lastAdded.name,
                price: lastAdded.price,
                img_url: lastAdded.img_url
            })
        } else {
            await productInCartTable.increment('quantity', {
                by: 1
            })
        }



        const updateInventoryTable = await Inventory.update({
            stock: inventory.stock
        }, {
            where: {
                product_id: cart[0].product_id
            }
        })
    }
}

module.exports.removeFromCart = async (req, res) => {
    const cart = req.body
    const user_id = req.body.user_id
    const product_id = req.body.product_id
    const quantity = req.body.quantity
    const stock = req.body.stock


    //find cart in db
    const dbCart = await Cart.findOne({
        where: {
            user_id: user_id,
            product_id: product_id
        }
    })


    const updateStock = await Inventory.update({
        stock: stock
    }, {
        where: {
            product_id: product_id
        }
    })

    if (dbCart) {

        //update cart
        let updateCart = await Cart.decrement({
                quantity: quantity //decrement quantity column
            }, {
                where: {
                    user_id: user_id,
                    product_id: product_id

                },
                returning: true
            } //returning: true to get the updated records

        )

        //look for the updated record
        const checkQty = await Cart.findOne({
            where: {
                user_id: user_id,
                product_id: product_id,
            }
        })

        //if qty is 0 remove record from db
        if (checkQty.dataValues.quantity === 0) {
            const removeRow = await Cart.destroy({
                where: {
                    user_id: user_id,
                    product_id: product_id,
                }
            })

            const getCart = await Cart.findAll()

            updateCart = getCart
            return res.json({
                'cart': updateCart
            })

        }

        return res.json({
            'cart': updateCart
        })
    }
}

module.exports.increaseQty = async (req, res) => {
    const {
        user_id,
        product_id,
        stock
    } = req.body

    const findUser = await Session.findOne({
        where: {
            user_id: user_id
        }
    })

    if (findUser) {
        const findProduct = await Cart.findOne({
            where: {
                user_id: user_id,
                product_id: product_id
            }
        })

        await findProduct.increment('quantity', {
            by: 1
        })

        const updateStock = await Inventory.update({
            stock: stock
        }, {
            where: {
                product_id: product_id
            }
        })
    }

    const sendUpdatedCart = await Cart.findAll()
    return res.json({
        'cart': sendUpdatedCart
    })
}

module.exports.decreaseQty = async (req, res) => {
    const {
        user_id,
        product_id,
        stock
    } = req.body


    const findUser = await Session.findOne({
        where: {
            user_id: user_id
        }
    })

    if (findUser) {

        //update cart
        let updateCart = await Cart.decrement({
                quantity: 1 //decrement quantity column
            }, {
                where: {
                    user_id: user_id,
                    product_id: product_id
                },
                returning: true
            } //returning: true to get the updated records

        )

        const updateStock = await Inventory.update({
            stock: stock
        }, {
            where: {
                product_id: product_id
            }
        })

        //look for the updated record
        const checkQty = await Cart.findOne({
            where: {
                user_id: user_id,
                product_id: product_id,
            }
        })

        //if qty is 0 remove record from db
        if (checkQty.dataValues.quantity === 0) {
            const removeRow = await Cart.destroy({
                where: {
                    user_id: user_id,
                    product_id: product_id,
                }
            })

            const getCart = await Cart.findAll()

            updateCart = getCart
            return res.json({
                'cart': updateCart
            })
        } else {
            const getCart = await Cart.findAll()
            updateCart = getCart
            return res.json({
                'cart': updateCart
            })
        }
    }
}


module.exports.addToWishlist = async (req, res) => {
    const {
        product_id,
        user_id
    } = req.body;
    const user = await Session.findOne({
        where: {
            user_id: user_id
        }
    })

    if (user) {

        const findProduct = await Wishlist.findOne({
            where: {
                product_id: product_id
            }
        })

        if (!findProduct) {
            const addToWishlist = await Wishlist.create({
                user_id: user_id,
                product_id: product_id
            })

            const retrieveWishlist = await Wishlist.findAll()

            return res.json(retrieveWishlist)
        }

        const retrieveWishlist = await Wishlist.findAll()

        return res.json(retrieveWishlist)

    }


}
module.exports.removeFromWishlist = async (req, res) => {
    const {
        product_id,
        user_id
    } = req.body;
    const user = await Session.findOne({
        where: {
            user_id: user_id
        }
    })

    if (user) {

        const findProduct = await Wishlist.destroy({
            where: {
                product_id: product_id
            }
        })

        if (!findProduct) {
            const addToWishlist = await Wishlist.create({
                user_id: user_id,
                product_id: product_id
            })

            const retrieveWishlist = await Wishlist.findAll()

            return res.json(retrieveWishlist)
        }

        const retrieveWishlist = await Wishlist.findAll()

        return res.json(retrieveWishlist)

    }

}

module.exports.updateUserName = async (req, res) => {

    const {
        user_id,
        newUsername
    } = req.body;

    const findUser = await User.findOne({
        where: {
            id: user_id
        },
        attributes: {
            exclude: ['password', 'updatedAt', 'createdAt']
        }
    })

    if (findUser) {
        const updateUserName = await User.update({
            username: newUsername
        }, {
            where: {
                id: user_id
            }
        })
        return res.json({
            'message': 'Name updated Successfully',
            'username': newUsername
        })
    } else {
        return res.json({
            'message': 'Error while updating'
        })
    }

}
module.exports.updatePass = async (req, res) => {

    const {
        user_id,
        currentPass,
        newPass
    } = req.body;

    const findUser = await User.findOne({
        where: {
            id: user_id
        },
        attributes: {
            exclude: ['password', 'updatedAt', 'createdAt']
        }
    })

    if (findUser) {
        const userpass = await User.findOne({
            where: {
                id: user_id
            }
        })

        //verify password by comparing the password the user entered
        //against the hashed password inserted in the database (Models > User.js)
        const checkPassword = await bcrypt.compare(currentPass, userpass.password)

        if (checkPassword) {

            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(newPass, salt)
            const updatePass = await User.update({
                password: hashedPassword
            }, {
                where: {
                    id: user_id
                }
            })
            return res.json({
                'message': 'Password updated Successfully',
            })
        } else {
            return res.json({
                'message': 'Incorrect password'
            })
        }

    } else {
        return res.json({
            'message': 'Error while updating'
        })
    }

}
module.exports.updateEmail = async (req, res) => {

    const {
        user_id,
        email
    } = req.body;

    const findUser = await User.findOne({
        where: {
            id: user_id
        },
        attributes: {
            exclude: ['password', 'updatedAt', 'createdAt']
        }
    })

    if (findUser) {
        const updateEmail = await User.update({
            email: email
        }, {
            where: {
                id: user_id
            }
        })
        return res.json({
            'message': 'Email updated Successfully',
            'email': email
        })
    } else {
        return res.json({
            'message': 'Error while updating'
        })
    }

}

module.exports.userLogin = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        //find user by email
        const user = await User.findOne({
            where: {
                email: email
            },
            attributes: {
                exclude: ['password', 'updatedAt', 'createdAt']
            }
            // email: email (also works)
        });

        //if admin not found
        if (!user) {
            return res.status(422).json({
                message: 'Invalid Email Address'
            })
        }

        const userpass = await User.findOne({
            where: {
                email: email
            }
            // email: email (also works)
        });

        //verify password by comparing the password the user entered
        //against the hashed password inserted in the database (Models > User.js)
        const checkPassword = await bcrypt.compare(password, userpass.password)

        //if password doesnt match send 403 status
        if (!checkPassword) {
            return res.status(422).json({
                message: 'Incorrect Password'
            })
        }

        //check if user is admin
        if (!user.isUser) {
            return res.status(403).json({
                message: 'Unauthorised Access'
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Account is not verified. Please check your email for verification instructions.'
            })
        }

        const token = createToken(user.email);

        const cart = await Cart.findAll({
            where: {
                user_id: user.id
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        })
        const wishlist = await Wishlist.findAll({
            where: {
                user_id: user.id
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        })


        //store session in the database
        const session = await Session.create({
            user_id: user.id,
            session_id: token,
        })

        res.cookie('jwt', token, {
            httpOnly: false,
            maxAge: 3600000,
            secure: false
        })

        return res.json({
            'user': user,
            'cart': cart,
            'token': token,
            'wishlist': wishlist
        })

    } catch (error) {
        console.error('Login error', error);
        res.status(500).json({
            message: 'Internal server error'
        })
    }
}

module.exports.userSignup = async (req, res) => {

    try {
        const {
            username,
            email,
            password
        } = req.body

        const user = await User.findOne({
            where: {
                email
            }
        })


        if (!user) {
            const randomIDgen = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt)
            const newUser = await User.create({
                id: randomIDgen,
                username,
                email,
                password: hashedPassword,
                isUser: true,
                isVerified: false
            })
            const token = createToken(newUser.email);

            sendSignupConfirmation(newUser.email, newUser.username, newUser.id)

            return res.status(201).json({
                'user': newUser,
                'token': token
            })
        }

        return res.status(201).json({
            message: 'User with this email address already exists'
        })

    } catch (error) {
        console.error('Signup error', error);
        res.status(500).json({
            message: 'Internal server error'
        })
    }
}
module.exports.getCheckoutSession = async (req, res) => {

    try {

        const cartItems = req.body;
        const user_id = req.body[0].user_id;

        const order_id = Math.floor(Math.random() * 2147483648) || Math.floor(Math.random() * 2147483648)
        const lineItems = []

        const user = await User.findOne({
            where: {
                id: user_id
            }
        })

        if (user) {

            for (let item of req.body) {


                const findProduct = await Cart.findOne({
                    where: {
                        product_id: item.product_id
                    }
                })

                if (!findProduct) {
                    return res.json({
                        'message': 'Product not found'
                    })
                }

                lineItems.push({
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: findProduct.dataValues.name,
                            images: [item.img_url]
                        },
                        unit_amount: findProduct.dataValues.price * 100 //convert to cents (essential)
                    },
                    quantity: findProduct.dataValues.quantity
                })

            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `http://www.digital-dynasty.co.uk.s3-website-us-east-1.amazonaws.com/order-confirmed?session_id={CHECKOUT_SESSION_ID}&user_id=${user.id}&order_id=${order_id}`, //stripe replaces CHECKOUT_SESSION_ID with the actual id automatically once session has fineshed being created 
                cancel_url: `http://www.digital-dynasty.co.uk.s3-website-us-east-1.amazonaws.com/order-cancelled?user_id=${user.id}&order_id=${order_id}`
            })

            const orderItems = await OrderItems.bulkCreate(cartItems.map(item => ({
                url_id: order_id,
                product_id: item.product_id,
                quantity: item.quantity
            })))



            return res.json({
                'checkout_session_id': session.id
            })
        }

    } catch (error) {
        res.status(500).json({
            error: 'Failed to create checkout session'
        });
    }

}

module.exports.retrieveSession = async (req, res) => {

    try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
        const user_id = req.query.user_id;
        const order_id = req.query.order_id;

        const addPayment = await Payments.create({
            status: 'paid',
            total_price: session.amount_total,
            created_by: user_id,
            updated_by: user_id
        })


        const findProductId = await OrderItems.findAll({
            where: {
                url_id: order_id
            }
        })

        for (let item of findProductId) {
            const order = await Orders.create({
                user_id: user_id,
                payment_id: addPayment.dataValues.id,
                status: 'Paid',
                total_price: session.amount_total,
                created_by: user_id,
                updated_by: user_id,
                product_id: item.dataValues.product_id,
                order_id: item.dataValues.id,
            })
        }

        const emptyCart = await Cart.destroy({
            where: {
                user_id: user_id
            }
        })




        return res.json({
            'message': 'Order Placed successfully'
        })
    } catch (error) {

        return res.json({
            'message': 'Invalid checkout session'
        })
    }



}

module.exports.orderFailure = async (req, res) => {
    const url_id = req.query.order_id //url_id (database field) order_id(url query parameter set)

    const removeOrder = await OrderItems.destroy({
        where: {
            url_id: url_id
        }
    })

    return res.json({
        'message': 'Order cancelled'
    })

}

module.exports.retrieveAllOrders = async (req, res) => {
    const user_id = req.query.user_id;

    try {

        const user = await User.findOne({
            where: {
                id: user_id
            }
        })

        if (!user) {
            return res.json({
                'message': 'Unauthorised Access'
            })
        }

        const retrieveOrders = await Orders.findAll({
            where: {
                user_id: user_id
            }
        })

        if (retrieveOrders.length === 0) {
            return res.json({
                'message': 'No orders!'
            })
        }


        return res.json({
            'orders': retrieveOrders
        })

    } catch (error) {

        return res.json({
            'message': error
        })

    }
}

module.exports.verifyAccount = async (req, res) => {

    const token = req.params.id

    try {

        const decodeToken = verifyGenerateEmailVerificationToken(token)
        if (!decodeToken) {
            return res.status(400).json({
                message: 'Invalid or expired token'
            });
        }

        // Check if the token is expired
        const expirationTime = decodeToken.expires;
        if (Date.now() > expirationTime) {
            return res.status(400).json({
                message: 'Token has expired'
            });
        }

        const userId = decodeToken.id;

        const user = await User.findByPk(userId)

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        user.isVerified = true;

        await user.save();


        const page = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sign Up Success</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #ffffff; /* White background */
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                
                .container {
                    width: 400px;
                    padding: 40px;
                    background-color: #008080; /* Teal background */
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    color: #ffffff; /* White text color */
                    text-align: center;
                }
                
                h2 {
                    margin-bottom: 20px;
                }
                
                p {
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Sign Up Successful!</h2>
                <p>Thank you for signing up.</p>
                <p>You can now <a href="http://www.digital-dynasty.co.uk.s3-website-us-east-1.amazonaws.com/login">log in</a> to your account.</p>
            </div>
        </body>
        </html>`
        res.send(page)


    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error'
        });

    }
}

module.exports.userLogout = async (req, res) => {

    const {
        user_id,
        token
    } = req.query


    await Session.destroy({
        where: {
            user_id: user_id
        }
    })


    res.status(200).json({
        'message': 'You have been logged out!',
        'cart': [],
        'wishlist': []
    })
}