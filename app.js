const createError = require('http-errors');
const express = require('express');
const useMiddleware = require("./middleware");
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const handlebars = require('express-handlebars');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const { cookiesCleaner } = require('./middleware/auth');
const dotenv = require('dotenv').config();
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
require('./middleware/dbconnect');

const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
const hbs = handlebars.create( {
  defaultLayout: 'layout',
  extname: 'hbs',
  layoutsDir: path.join(__dirname, 'views'),
  partialsDir: path.join(__dirname, 'views')
});
app.engine( 'hbs', hbs.engine );
app.set('view engine', 'hbs');

const authChecker = (req, res, next) => {
  res.locals = {
    loginstatus: req.session.user,
  };
  next();
};

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    store: new FileStore(),
    key: 'user_sid',
    secret: 'very secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new SpotifyStrategy(
        {
          clientID: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          callbackURL: 'http://localhost:3000/auth/spotify/callback'
        },
        function(accessToken, refreshToken, expires_in, profile, done) {
          User.findOrCreate({ spotifyId: profile.id }, function(err, user) {
            return done(err, user);
          });
        }
    )
);

module.exports = app;
