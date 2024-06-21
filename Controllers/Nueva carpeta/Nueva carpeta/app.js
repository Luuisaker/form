require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ContactosController = require('./Controllers/ContactosControllers');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const passport = require('passport');
const session = require('express-session');
const mongoose = require("mongoose");
const passportlocalmongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(ContactosController)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.route("/Registro")
    .get(function (req, res) {
        res.render("Registro");
    });
app.route("/Formulario")
    .get(function (req, res) {
        res.render("Formulario");
    });
app.route("/cv")
    .get(function (req, res) {
        res.render("cv");
    });
app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/iniciar-sesion' }),
    function (req, res) {
        res.redirect("/Registro");
    }
);


const entradasSechema = {
    fecha: String,
    titulo: String,
    contenido: String,
}
const EntradaModelo = mongoose.model("Entrada", entradasSechema);
const Schema = mongoose.Schema;

const usuarioSechema = new Schema({
    email: String,
    password: String,
    googleid: String,
    secreto: String,
});

usuarioSechema.plugin(passportlocalmongoose);
usuarioSechema.plugin(findOrCreate);
const usuario = mongoose.model("usuario", usuarioSechema);
passport.use(usuario.createStrategy());
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);

passport.use(new GoogleStrategy({
    clientID: process.env.Client_ID,
    clientSecret: process.env.Client_Secret,
    callbackURL: "http://localhost:3000/auth/google/callback" 
},
    function (accessToken, refreshToken, profile, cb) {
        usuario.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));
app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};


  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
