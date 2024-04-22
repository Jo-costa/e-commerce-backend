const {
    Router
} = require("express")

const router = Router();
const authController = require("../controllers/authControllers")

router.post('/adminlogin', authController.adminlogin)
router.post('/admin', authController.getAdmin)
router.post('/addToCart', authController.addToCart)
router.post('/removeFromCart', authController.removeFromCart)
router.post('/addToWishlist', authController.addToWishlist)
router.post('/removeFromWishlist', authController.removeFromWishlist)
router.post('/increaseQty', authController.increaseQty)
router.post('/decreaseQty', authController.decreaseQty)
router.post('/userLogin', authController.userLogin)
router.post('/userSignup', authController.userSignup)
router.post('/update-name', authController.updateUserName)
router.post('/update-email', authController.updateEmail)
router.post('/update-pass', authController.updatePass)
router.post('/create-checkout-session', authController.getCheckoutSession)


router.get('/vieworders', authController.retrieveAllOrders)
router.get('/order-confirmed', authController.retrieveSession)
router.get('/order-cancelled', authController.orderFailure)
router.get('/adminlogout', authController.adminlogout)
router.get('/products', authController.getProds)
router.get('/userLogout', authController.userLogout)
router.get('/signup/accountverified/:id', authController.verifyAccount)

// router.post('/login', authController.login) //user login route
// router.post('/logout', authController.logout) //user login route

module.exports = router;