require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('./config/ppConfig');
const flash = require('connect-flash');
const SECRET_SESSION = process.env.SECRET_SESSION;
const app = express();

// isLoggedIn middleware
const isLoggedIn = require('./middleware/isLoggedIn');

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);


// secret: What we actually will be giving the user on our site as a session cookie. 
// resave: Save the session even if it's modified, make this false
// saveUnitialized: If we have a new session, we save it, therefore making that true
let sessionObject = {
  secret: SECRET_SESSION,
  resave: false,
  saveUninitialized: true
}

app.use(session(sessionObject));
app.use(passport.initialize());
app.use(passport.session());

// Using flash throughout app to send temp messages to user
app.use(flash());

app.use((req, res, next) => {
  // Before every route, we will attach a user to res.local
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
})

app.get('/', (req, res) => {
  console.log(res.locals.alerts)
  res.render('index', { alerts: res.locals.alerts });
});

app.use('/auth', require('./routes/auth'));
app.use('/user', isLoggedIn, require('./routes/user'));

const PORT = process.env.PORT || 3005;
const server = app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

module.exports = server;
