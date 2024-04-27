const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv')
dotenv.config();

const {
    Admin,
    Images,
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
    json
} = require("sequelize");


const createToken = (id) => {
    return jwt.sign({
        id
    }, "secretKEYjwt", {
        expiresIn: "1h"
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

module.exports.adminlogout = async (req, res) => {

    // res.cookie('jwt', "", {
    //     maxAge: 1
    // });
    // res.redirect("/login")

    res.status(200).json({
        message: 'Logout successful'
    })
}


module.exports.removeProduct = async (req, res) => {
    const product_id = req.body.product_id

    // console.log(req.body);
    const remove = await Products.destroy({
        where: {
            id: product_id
        }
    })

    const retrieveProducts = await sequelize.models.Products.findAll({
        //joining tables
        include: [sequelize.models.Inventory, sequelize.models.Images]
    })
    return res.json({
        'products': retrieveProducts
    })
}

module.exports.addProduct = async (req, res) => {

    try {
        const {
            id,
            name,
            brand,
            price,
            stock,
            description,
            img_url1,
            img_url2,
            img_url3,
            img_url4
        } = req.body

        const findProd = await Products.findOne({
            where: {
                id: id
            }
        })

        if (!findProd) {



            const addProd = await Products.create({
                name,
                brand,
                price,
                description
            })


            console.log("images", Images);
            const addProdImages = await Images.bulkCreate([{
                    img_url: img_url1,
                    product_id: addProd.id
                },
                {
                    img_url: img_url2,
                    product_id: addProd.id
                },
                {
                    img_url: img_url3,
                    product_id: addProd.id
                },
                {
                    img_url: img_url4,
                    product_id: addProd.id
                }
            ])

            const qty = await Inventory.create({
                product_id: addProd.id,
                stock: stock
            })


            const retrieveProducts = await sequelize.models.Products.findAll({
                //joining tables
                include: [sequelize.models.Inventory, sequelize.models.Images]
            })

            return res.status(201).json({
                'products': retrieveProducts
            })

        } else {
            const retrieveProducts = await sequelize.models.Products.findAll({
                //joining tables
                include: [sequelize.models.Inventory, sequelize.models.Images]
            })
            return res.status(409).json({
                'products': retrieveProducts,
                'message': 'Product already exists!'
            })
        }

    } catch (error) {

        console.log(error);
    }




}

module.exports.editProduct = async (req, res) => {
    try {
        const {
            id,
            name,
            brand,
            price,
            stock,
            description,
            img_url1,
            img_url2,
            img_url3,
            img_url4
        } = req.body


        console.log(img_url1);
        // const findProduct = await Products.findOne({
        //     where: {
        //         id: id
        //     }
        // })

        // if (findProduct) {

        //     const updateProd = await Products.update({
        //         where:{id:id},
        //         name
        //     })

        //     findProduct.dataValues.name = name;
        //     findProduct.dataValues.brand = brand;
        //     findProduct.dataValues.price = price;
        //     findProduct.dataValues.description = price;

        //     await findProduct.dataValues.save()
        //     console.log(findProduct);
        // }

        const updateProduct = await Products.findByPk(id)
            .then(product => {
                if (product) {
                    product.update({
                        name: name,
                        brand: brand,
                        price: price,
                        description: description


                    })

                } else {
                    return res.json({
                        'messsage': 'Product not found'
                    })
                }
            })
            .then(updatedProduct => {
                // if (updatedProduct) {
                //     return res.json({
                //         'message': 'Updated successfully!'
                //     })
                // }
            })

        const updateStock = await Inventory.update({
            stock: stock
        }, {
            where: {
                product_id: id
            }
        })
        const imagesToSave = [img_url1, img_url2, img_url3, img_url4]

        console.log(img_url1, "adasdasd");
        console.log(imagesToSave[0], "asdasdasd");
        console.log(imagesToSave[1]);
        console.log(imagesToSave[2]);
        console.log(imagesToSave[3]);
        console.log("Before update images");





        try {


            const updateImages = await Images.findAll({
                where: {
                    product_id: id
                }
            }).then(foundImages => {
                const storeImages = [];
                for (let i = 0; i < imagesToSave.length; i++) {
                    const imageURL = imagesToSave[i];
                    const newImage = foundImages[i]

                    if (newImage) {
                        newImage.img_url = imageURL
                        storeImages.push(newImage.save())
                    }
                }

            })

        } catch (error) {
            console.log(error);
        }

    } catch (error) {

    }
}

module.exports.getOrders = async (req, res) => {

    console.log(sequelize.models);
    const orders = await sequelize.models.Orders.findAll({
        //joining tables
        include: [sequelize.models.OrderItems],

    })

    console.log(orders);
    return res.json({
        'orders': orders
    })
}