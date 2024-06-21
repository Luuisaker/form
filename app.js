require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ContactosController = require('./Controllers/ContactosControllers');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
let mysql = require("mysql");
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(ContactosController);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);


app.route("/Formulario")
    .get(function (req, res) {
        res.render("Formulario");
    });
app.route("/cv")
    .get(function (req, res) {
        const data = {
            title: 'Curriculum',
            Name: 'Luis',
            Lastname: 'Ayala',
            Mail: 'Luisjqayala98@gmail.com',
            School: 'U.E.C.A "Angel De La Guarda" ',
            Phone: '04145861216',
        };
        res.render('cv', data);
    });
app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
