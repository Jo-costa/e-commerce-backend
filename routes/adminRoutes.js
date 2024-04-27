const {
    Router
} = require("express")

const router = Router();
const adminController = require("../controllers/adminControllers.js")

router.post('/adminlogin', adminController.adminlogin)
router.post('/admin', adminController.getAdmin)
router.post('/remove-product', adminController.removeProduct)
router.post('/add-product', adminController.addProduct)
router.post('/edit-product', adminController.editProduct)



router.get('/adminlogout', adminController.adminlogout)
router.get('/orders', adminController.getOrders)

module.exports = router;