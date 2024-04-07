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
    Session,
    Cart,
    Inventory,
    sequelize
} = require('../models');
const {
    join
} = require("path");
// const ProductsModel = require('../models/Products')

// const {
//     Admin
// } = require('../models/Products')
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
        
        <p><a href="http://localhost:3000/signup/accountverified/${token}">Verify Account (expires in 10 mins)</a></p>
        
        <p>Happy shopping!</p>
        
        <p>Best regards,</p>
        <p>The DigitalDynasty Team</p>`
    }

    transporter.sendMail(mail_config, (error, info) => {
        if (error) {
            console.log("Error sending email", error);

        }

        console.log("Email sent");

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

        // const prods = await sequelize.models.Products.findAll({
        //     //joining tables
        //     include: [sequelize.models.Inventory, sequelize.models.Images]

        // })

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
            console.log('in');
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

    console.log(quantity);

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
            console.log(updateCart);
            return res.json({
                'cart': updateCart
            })

        }

        console.log(updateCart);
        return res.json({
            'cart': updateCart
        })
    }
}

module.exports.increaseQty = async (req, res) => {
    const {
        user_id,
        product_id,
        quantity,
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
        quantity,
        stock
    } = req.body

    console.log("prod:", product_id);
    console.log("qty:", quantity);

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

            console.log(retrieveWishlist);
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

            console.log(retrieveWishlist);
            return res.json(retrieveWishlist)
        }

        const retrieveWishlist = await Wishlist.findAll()

        return res.json(retrieveWishlist)


    }



}



module.exports.userLogin = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;


        //find admin by email
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

        // res.status(201).json({
        //     admin: admin.email
        // })

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

module.exports.verifyAccount = async (req, res) => {

    const token = req.params.id


    // try {

    //     const findUser = await User.findByPk(userID)
    //     if (!findUser) {
    //         return res.status(404).json({
    //             message: 'User not found'
    //         })
    //     }

    //     findUser.isVerified = true;

    //     await findUser.save();
    //     res.status(200).json({
    //         message: 'Account verified successfully.'
    //     })

    // } catch (error) {
    //     console.log("Verification error: ", error);
    //     return res.status(500).json({
    //         message: 'Internal server error'
    //     })
    // }

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
        res.status(200).json({
            message: 'Account verified successfully.'
        })


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


    console.log("userid: ", user_id);
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
module.exports.adminlogin = async (req, res) => {

    try {
        const {
            email,
            password
        } = req.body;


        //find admin by email
        const admin = await Admin.findOne({
            where: {
                email
            }
            // email: email (also works)
        });

        //if admin not found
        if (!admin) {
            return res.status(422).json({
                message: 'Invalid Email Address'
            })
        }

        //verify password by comparing the password the user entered
        //against the hashed password inserted in the database (Models > Admin.js)
        const checkPassword = await bcrypt.compare(password, admin.password)

        //if password doesnt match send 403 status
        if (!checkPassword) {
            return res.status(422).json({
                message: 'Incorrect Password'
            })
        }

        //check if user is admin
        if (!admin.isAdmin) {
            return res.status(403).json({
                message: 'Unauthorised Access'
            });

        }

        const token = createToken(admin.email);
        // res.cookie('jwt', token, {
        //     httpOnly: true,
        //     maxAge: 3600000
        // })
        // res.status(201).json({
        //     admin: admin.email
        // })

        return res.json({
            'user': admin,
            'token': token
        })

    } catch (error) {
        console.error('Login error', error);
        res.status(500).json({
            message: 'Internal server error'
        })
    }
}

module.exports.adminlogout = async (req, res) => {

    // res.cookie('jwt', "", {
    //     maxAge: 1
    // });
    // res.redirect("/login")

    res.status(200).json({
        message: 'Logout successful'
    })
}

module.exports.getAdmin = async (req, res) => {
    try {

        const {
            email
        } = req.body

        const admin = await Admin.findOne({
            where: {
                email
            }
        })

        if (!admin) {
            return res.status(422).json({
                message: 'Invalid user'
            })

            //attach admin object to req object for upcoming routres handlers

        }
        return res.json({
            'admin': admin
        })

    } catch (error) {
        console.error('Error fetching user', error);
        res.status(500).json({
            message: 'Server error'
        })
    }
}