const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const findOrCreate = require('mongoose-findorcreate')

const Schema = mongoose.Schema
const UserScheme = new Schema({
  username: {
    type: String,
    index: false 
  },
  email: {
    type: String,
    unique: true
  },
  name: String,
  picture: String,
  googleId: String,
  links: { type: Schema.Types.Array, ref: 'ShortUrl' }
})

UserScheme.index({ email: 1 }, { unique: true });
// Hash y Salt
UserScheme.plugin(passportLocalMongoose)
// Agregar find or create al schema
UserScheme.plugin(findOrCreate)

const User = mongoose.model("User", UserScheme)

module.exports = User