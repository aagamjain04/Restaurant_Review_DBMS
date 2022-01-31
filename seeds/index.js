const mongoose = require('mongoose');
const Restaurant = require('../models/restaurant');
const review = require('../models/review');
const cities = require('./cities');
const { descriptors, places, img } = require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/zero-mile', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log('Database connected');
});
const sample = (array) => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
	await Restaurant.deleteMany({});
	await review.deleteMany({});
	for (let i = 0; i < 10; i++) {
		const random187 = Math.floor(Math.random() * 187);
		const price = Math.floor(Math.random() * 100) + 200;
		const cmp = new Restaurant({
			author: '60073c0a0620f40015a03805',
			//location: 'Mumbai,India',
			location: `${cities[random187].city},${cities[random187].admin_name}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			//image: img[i % 15],
			description:
				'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Optio ullam ipsum, temporibus animi laudantium iusto, quisquam ad facere ut ex consequatur tenetur debitis omnis labore nostrum, itaque ab dolor recusandae?',
			price,
			geometry: {
				type: 'Point',
				coordinates: [ cities[random187].lng, cities[random187].lat ]
			}
		});
		await cmp.save();
	}
};
seedDB().then(() => {
	mongoose.connection.close();
});
