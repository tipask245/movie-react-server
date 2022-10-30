const { default: mongoose } = require('mongoose')
const {dbAddress} = require('./config')
const Movie = require('./models/Movie')
const fs = require('fs')

let movieWithDesc = fs.readFileSync('movieWithDesc.json')
movieWithDesc = JSON.parse(movieWithDesc)
const create = async () => {
  await mongoose.connect(dbAddress)
  movieWithDesc.forEach(async el => {
    const movie = new Movie({
      img: el.img,
      title: el.title,
      type: el.type,
      desc: el.desc,
      rating: Number(el.rating),
      ratingArray: [Number(el.rating)],
      reviews: []
    })
    await movie.save()
  })
}

create()
  