var express = require('express');
var router = express.Router();
// var multer = require('multer');
// var upload = multer({dest: './uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var user_controller = require('../controllers/userController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//GET request for creating a User.
router.get('/register', user_controller.user_reg_get);

// POST request for creating User.
router.post('/register', user_controller.user_reg_post)

//GET request for user login.
router.get('/login', user_controller.user_login_get);

// POST request for user login.
router.post('/login',
  passport.authenticate('local',{failureRedirect: '/users/login', failureFlash: 'Invalid email or password'}),
  function(req, res) {
    req.flash('success', 'You are now logged in');
    res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function (email, password, done) { 
  User.getUserByEmail(email, function (err, user) { 
    if(err) throw err;
    if(!user) {
      return done(null, false, {message: 'Unknown Email Address'});
    }
    
    User.comparePassword(password, user.password, function (err, isMatch) { 
      if(err) return done(err);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, {message: 'Invalid Password'});
      }
     });
   });
 }));

 router.get('/logout', function (req, res) { 
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
 });
module.exports = router;
