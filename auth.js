const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('./models/User')
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://localhost:5000/auth/google/create",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    console.log(profile)
    User.findOrCreate({ googleId: profile.id, email: profile.email, name: profile.displayName, picture: profile.picture },
      function (err, user) {
      return done(err, user);
    });
  }
));

passport.serializeUser((user,done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});