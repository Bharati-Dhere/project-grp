const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const productImageRoutes = require('./productImage');

router.get('/', productController.getAllProducts);
router.get('/offers/latest', productController.getLatestOffers);
router.get('/bestsellers/latest', productController.getLatestBestSellers);
router.get('/:id', productController.getProductById);
router.post('/', productController.addProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/:id/rate', productController.rateProduct);
router.use(productImageRoutes);

module.exports = router;
