// const { default: mongoose } = require('mongoose')
// const {dbAddress} = require('./config')
// const Movie = require('./models/Movie')
const fs = require('fs')

let movieWithDesc = fs.readFileSync('movieWithDesc.json')
movieWithDesc = JSON.parse(movieWithDesc)
// const create = async () => {
//   await mongoose.connect(dbAddress)
//   movieWithDesc.forEach(async el => {
//     const movie = new Movie({
//       img: el.img,
//       title: el.title,
//       type: el.type,
//       desc: el.desc,
//       rating: Number(el.rating),
//       ratingArray: [],
//       originRating: Number(el.rating),
//       reviews: []
//     })
//     await movie.save()
//   })
// }

// create()

const db = require('./sqlDB')

// const first = async () => {
//   movieWithDesc.forEach(async el => {
//     const newPerson = await db.query('INSERT INTO movies (img, title, item_type, content, rating, origin_rating) values ($1, $2, $3, $4, $5, $6) RETURNING *', [el.img, el.title, el.type, el.desc, Number(el.rating), Number(el.rating)])
//     console.log(newPerson.rows[0]);
//   })
// }
// first()

const first = async () => {
  const newPerson = await db.query(`
    SELECT 
    users.username, 
    users.avatar, 
    movies.img, 
    movies.title, 
    movies.item_type, 
    movies.content, 
    movies.rating 
    from ((users inner join watched on users.id = watched.user_id) 
    inner join movies on watched.film_id = movies.id);
  `)
  console.log(newPerson.rows);
}
first()