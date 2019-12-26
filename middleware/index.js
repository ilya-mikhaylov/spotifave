// module.exports = function (app) {
//     const express = require('express');
//     const path = require('path');
//     const cookieParser = require('cookie-parser');
//     const morgan = require('morgan');
//     const session = require('express-session');
//     const FileStore = require('session-file-store')(session);
//     const { cookiesCleaner } = require('./auth');
//
//     app.set('views', path.join(__dirname, '..', 'views'));
//     app.set('view engine', 'hbs');
//
//     // app.use(morgan('dev'));
//     app.use(express.json());
//     app.use(express.urlencoded({ extended: false }));
//     app.use(cookieParser());
//
//     app.use(express.static(path.join(__dirname, '..', 'public')));
//     app.use(session({
//         store: new FileStore(),
//         key: 'user_sid',
//         secret: 'very secret',
//         resave: false,
//         saveUninitialized: false,
//         cookie: {
//             expires: 600000
//         }
//     }));
//
// };