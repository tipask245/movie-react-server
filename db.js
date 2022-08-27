const { default: mongoose } = require('mongoose')
const Movie = require('./models/Movie')
const fs = require('fs')

let movieWithDesc = fs.readFileSync('movieWithDesc.json')
movieWithDesc = JSON.parse(movieWithDesc)
const create = async () => {
  await mongoose.connect('mongodb://localhost:27017/movies-react')
  movieWithDesc.forEach(async el => {
    const movie = new Movie({
      img: el.img,
      title: el.title,
      type: el.type,
      desc: el.desc,
      rating: el.rating,
      review: []
    })
    await movie.save()
  })
}

create()
  