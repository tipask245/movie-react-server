const Movie = require('../models/Movie')
const { validationResult } = require('express-validator')

class movieController {
  async createMovie(req, res) {
    console.log(req)
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
      res.status(400).json(validationErrors)
    }  
    const movie = new Movie({
      img: req.body.img,
      title: req.body.title,
      type: req.body.type,
      desc: req.body.desc,
      rating: req.body.rating
    })
    await movie.save()
    res.json(req.body)
  }

  async createReview(req, res) {
    // const validationErrors = validationResult(req)
    // if (!validationErrors.isEmpty()) {
    //   res.status(400).json(validationErrors)
    // }  

    console.log(req.body.id)
    Movie.findById(req.body.id, (error, result) => {
      result.review.push(req.body.review)
      result.save()
      res.json('OK')
    })
    
  }

  async getMovie(req, res) {
    let options = req.query
    // console.log(options)
    Movie.paginate({}, options, (error, result) => {
      res.json(result)
    })
  }

  async getMovieById(req, res) {
    let filter = {}
    if (req.params) {
      filter = req.params
    }
    Movie.find(filter, (error, result) => {
      res.json(result)
    })
  }

}

module.exports = new movieController()