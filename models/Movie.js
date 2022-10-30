const {Schema, model} = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const movieSchema = new Schema({
  img: String,
  title: String, 
  type: String,
  desc: String,
  rating: Number,
  ratingArray: Array,
  reviews: Array
  // counter: Array
});

movieSchema.plugin(mongoosePaginate)

module.exports = model('Movie', movieSchema)