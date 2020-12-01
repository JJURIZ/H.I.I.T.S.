const express = require('express');
const passport = require('../config/ppConfig');
const router = express.Router();
const db = require('../models');


// ROUTE TO RENDER SIGNUP PAGE
router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

// ROUTE TO RENDER LOGIN PAGE
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// ROUTE FOR CREATING NEW USER
router.post('/signup', (req, res) => {
  console.log(req.body);

  db.user.findOrCreate({
    where: { email: req.body.email },
    defaults: {
      name: req.body.name, 
      password: req.body.password
    }
  })
  .then(([user, created]) => {
    if (created) {
      // if created, success and redirect back home
      console.log(`${user.name} was created`);
      // Flash Message
      const successObject = {
        successRedirect: '/user',
        successFlash: 'Account created and logging in...'
      }
        passport.authenticate('local', successObject)(req, res)
    } else {
      // Email already exists
      req.flash('error', 'Email already exists...');
      res.redirect('/auth/signup');
    }
  })
  .catch(err => {
    console.log('Error', err);
    req.flash('error', 'Either email or password is incorrect. Please try again');
    res.redirect('/auth/signup');
  })
});

// ROUTE FOR LOGGING IN EXISTING USER
router.post('/login', passport.authenticate('local', { 
  successRedirect: '/user',
  failureRedirect: '/auth/login',
  successFlash: 'Welcome back...',
  failureFlash: 'Either email or password is incorrect. Please try again.',
 }));

 // ROUTE FOR LOGGING OUT
 router.get('/auth/logout', (req, res) => {
  req.logOut();
  req.flash('success', 'Logging out... See you soon.');
  res.redirect('/');
 })

module.exports = router;
