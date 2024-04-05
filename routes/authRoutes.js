const {
    Router
} = require("express")
const router = Router();
const authController = require("../controllers/authControllers")

router.post('/adminlogin', authController.adminlogin)
router.get('/adminlogout', authController.adminlogout)
router.post('/admin', authController.getAdmin)
router.get('/products', authController.getProds)
router.post('/addToCart', authController.addToCart)
router.post('/removeFromCart', authController.removeFromCart)
router.post('/increaseQty', authController.increaseQty)
router.post('/decreaseQty', authController.decreaseQty)
router.post('/userLogin', authController.userLogin)
router.post('/userSignup', authController.userSignup)
router.get('/userLogout', authController.userLogout)
router.get('/signup/accountverified/:id', authController.verifyAccount)

// router.post('/login', authController.login) //user login route
// router.post('/logout', authController.logout) //user login route

module.exports = router;