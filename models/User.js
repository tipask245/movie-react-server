const {Schema, model} = require('mongoose')

const userSchema = new Schema({
  username: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  role: [{type: String, ref: 'Role'}],
  reviews: Array,
  marks: Array,
  willWatch: Array,
  watched: Array

})

module.exports = model('User', userSchema)