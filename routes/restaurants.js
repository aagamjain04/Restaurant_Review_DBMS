const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { restaurantSchema } = require('../ErrorSchema');
const ExpressError = require('../utils/ExpressError');
const Restaurant = require('../models/restaurant');
const { isLoggedIn, validateRestaurant, isAuthor } = require('../middleware');
const restaurants = require('../controllers/restaurants');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.get('/', catchAsync(restaurants.index));

router.get('/new', isLoggedIn, restaurants.renderNewForm);

router.post('/', isLoggedIn, upload.array('image'), validateRestaurant, catchAsync(restaurants.createRestaurant));

router.get('/:id', catchAsync(restaurants.showRestaurant));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(restaurants.renderEditForm));

router.patch(
	'/:id',
	isLoggedIn,
	isAuthor,
	upload.array('image'),
	validateRestaurant,
	catchAsync(restaurants.updateRestaurant)
);

router.delete('/:id', isAuthor, isLoggedIn, catchAsync(restaurants.deleteRestaurant));

module.exports = router;
