const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Restaurant = require('./restaurant');

const locationSchema = new Schema({
	Location: String,
    Name:String,
	restaurantid: {
		type: Schema.Types.ObjectId,
		ref: 'Restaurant'
	}
});

module.exports = mongoose.model('Location', locationSchema);