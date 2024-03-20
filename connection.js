const mongoose = require('mongoose')
require('dotenv').config();

mongoose.connect(`${process.env.LOCAL_MONGODB_URL}/urlShortener`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  // Crear el índice con expiración
  return mongoose.connection.db.collection('shorturls').createIndex({ "createdAt": 1 }, { expireAfterSeconds: 3600});
}).then(() => {
  console.log('Índice creado con éxito con expiración después de 3600 segundos');
}).catch(err => {
  console.error('Error al crear el índice:', err);
});

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);