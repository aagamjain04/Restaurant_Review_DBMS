if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo')(session);

const restaurantRoutes = require('./routes/restaurants');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const dbUrl = 'mongodb://localhost:27017/restaurant_review';

mongoose.connect(dbUrl, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log('Database connected');
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
	mongoSanitize({
		replaceWith: '_'
	})
);
const secret = process.env.SECRET || 'thisissecret';
app.use(helmet());
const store = new MongoDBStore({
	url: dbUrl,
	secret,
	touchAfter: 24 * 60 * 60
});

store.on('error', function name(e) {
	console.log('session store error', e);
});

const sessionConfig = {
	store,
	name: 'session',
	secret,
	// secure : true,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
};
app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
	'https://stackpath.bootstrapcdn.com/',
	'https://kit.fontawesome.com/',
	'https://cdnjs.cloudflare.com/',
	'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
	'https://cdn.jsdelivr.net',
	'https://kit-free.fontawesome.com/',
	'https://stackpath.bootstrapcdn.com/',
	'https://fonts.googleapis.com/',
	'https://use.fontawesome.com/'
];
const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			scriptSrc: [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
			styleSrc: [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
			workerSrc: [ "'self'", 'blob:' ],
			objectSrc: [],
			imgSrc: [
				"'self'",
				'blob:',
				'data:',
				'https://res.cloudinary.com/niecloud04/',
				'https://res.cloudinary.com/mycloud04/',
				'https://images.unsplash.com/'
			],
			fontSrc: [ "'self'", ...fontSrcUrls ]
		}
	})
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.use('/restaurants', restaurantRoutes);
app.use('/restaurants/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
	res.render('restaurants/home');
});

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Something went wrong!';
	res.status(statusCode).render('error', { err });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Serving on port ${port}`);
});
