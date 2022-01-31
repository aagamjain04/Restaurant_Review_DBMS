const Restaurant = require("../models/restaurant");
const Review = require("../models/review");
const Availibility = require("../models/availibility")
const Location = require("../models/location")
const { cloudinary } = require("../cloudinary")

module.exports.index = async (req, res) => {
  const restaurants = await Restaurant.find({});
  const ratings=[];
  //const avgRating = {val:"69"};

  

  for(let i=0;i<restaurants.length;i++)
  {
    let sum = 0;
    let ctr = 0;
    const x = (restaurants[i].reviews);  
    //console.log(restaurants[i].reviews);  
    for(let j=0;j<x.length;j++)
    {
      //console.log(x[j]);
      let rating = await Review.findById({_id:x[j]});
      sum+=rating.rating;
      ctr = ctr+1;
    }
    y = sum/ctr;
    y = y.toFixed(1);
    ratings.push(y);
  }
  


  res.render("restaurants/index", { restaurants,ratings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("restaurants/new");
};

module.exports.createRestaurant = async (req, res, next) => {


  const restaurant = new Restaurant(req.body.restaurant);

  if(restaurant.price <0)
  restaurant.price = 0;   // trigger

  
  const availibility = new Availibility(req.body.availibility);

  availibility.restaurant = restaurant._id;
  
  await availibility.save();

  const loc = new Location({"Location":restaurant.location,"Name":restaurant.title,"restaurantid":restaurant._id});
  await loc.save();
 
   
  restaurant.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  restaurant.author = req.user._id;
  await restaurant.save();
  req.flash("success", "Successfully made a new restaurant");
  res.redirect(`/restaurants/${restaurant._id}`);
};

module.exports.showRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id)


    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!restaurant) {
    req.flash("error", "Cannot find that restaurant!");
    return res.redirect("/restaurants");
  }

  const availibility = await Availibility.findOne({restaurant:restaurant._id});
  
  res.render("restaurants/show", { restaurant,availibility });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    req.flash("error", "Cannot find that restaurant!");
    return res.redirect("/restaurants");
  }
  res.render("restaurants/edit", { restaurant });
};
module.exports.updateRestaurant = async (req, res) => {
  const { id } = req.params;
  const restaurant = await Restaurant.findByIdAndUpdate(
    id,
    { ...req.body.restaurant },
    { useFindAndModify: false }
  );

  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  restaurant.images.push(...imgs);
  await restaurant.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await restaurant.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }

  req.flash("success", "Successfully updated campground!");
  res.redirect(`/restaurants/${restaurant._id}`);
};

module.exports.deleteRestaurant = async (req, res) => {
  const { id } = req.params;
  const restaurant = await Restaurant.findById(id);
  await Restaurant.findByIdAndDelete(id);
  for (let i of restaurant.images) {
    await cloudinary.uploader.destroy(i.filename);
  }
  req.flash("success", "Successfully deleted restaurant");
  res.redirect("/restaurants");
};
