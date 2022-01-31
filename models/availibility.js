const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Restaurant = require('./restaurant');

const availibilitySchema = new Schema({
	Dining: String,
	Zomato: String,
    Swiggy: String,
	restaurant: {
		type: Schema.Types.ObjectId,
		ref: 'Restaurant'
	}
});

module.exports = mongoose.model('Availibility', availibilitySchema);