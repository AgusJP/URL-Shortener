const express = require('express')
const ShortUrl = require('./models/shortUrl')
const User = require('./models/User')
const passport = require('passport')
const session = require('express-session')
const shortId = require('shortid')
require('./connection')
require('./auth');

const app = express()

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401)
}

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(session({secret: 'mysecret', resave: false, saveUninitialized: true}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(User.createStrategy())

app.get('/', async (req, res) => {
  res.render('index', { shortUrl: "" })
})

app.get('/short/:shortID', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ _id: req.params.shortID });
  res.render('index', { shortUrl })
})

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get('/auth/google/create',
    passport.authenticate( 'google', {
        successRedirect: '/auth/links',
        failureRedirect: '/auth/google/failure'
}));

app.get('/auth/links', isLoggedIn, async (req, res) => {
  const user = await User.findOne({ name: req.user.name});
  res.render('auth', { user })
})

app.get('/auth/google/failure', (req, res) => {
  res.send("Something went wrong!")
})

app.post('/shortUrl', async (req, res) => {
  const host = req.headers.host;
  const newShortUrl = await ShortUrl.create({ full: req.body.fullUrl, short: `http://${host}/${shortId.generate()}` });
  const foundShortUrl = await ShortUrl.findOne({ full: req.body.fullUrl });
  res.redirect(`/short/${foundShortUrl._id}`);
});

app.post('/shortUrls', async (req, res) => {
  const host = req.headers.host;
  console.log( req.user.name)
  const user = await User.findOne({ name: req.user.name });
  console.log(user)
  const shorUrl = await ShortUrl.create({ full: req.body.fullUrl, short: `http://${host}/${shortId.generate()}` });
  user.links.push(shorUrl)
  console.log(user.links)
  user.save()
  res.redirect(`/auth/links`);
});

app.get('/:shortUrl', async (req, res) => {
  const host = req.headers.host;
  const shortUrl = await ShortUrl.findOne({ short: `http://${host}/${req.params.shortUrl}` })
  if (shortUrl == null) return res.sendStatus(404)
  shortUrl.save()

  res.redirect(shortUrl.full)
})

app.delete('/shortUrl/:shorturl', async (req, res) => {
  const host = req.headers.host;
  const shortURL = `http://${host}/${req.params.shorturl}`
  console.log("Llego aqui!", req.params.shorturl)
  try {
    // Encuentra al usuario por su nombre
    const user = await User.findOne({ name: req.user.name });
    console.log(user)

    // Encuentra y elimina el objeto link que tenga la propiedad shorturl igual a shortUrlToDelete
    user.links = user.links.map(linkArray => 
        linkArray.filter(link => link.short !== shortURL)
    );
    // Eliminar enlaces vacíos
    user.links = user.links.filter(linkArray => linkArray.length > 0);
    // Guarda los cambios
    await user.save();

  } catch (error) {
      console.error('Error al eliminar la URL corta:', error);
      res.status(500).json({ message: 'Error al eliminar la URL corta' });
  }

  res.status(200).send('OK');
})

app.use('/auth/logout', (req,res) => {
  req.session.destroy()
  res.redirect('/')
})

app.listen(process.env.PORT || 5000);