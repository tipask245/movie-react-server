const {Schema, model} = require('mongoose')

const roleSchema = new Schema({
  value: {type: String, unique: true, default: 'user'}
})

module.exports = model('Role', roleSchema)