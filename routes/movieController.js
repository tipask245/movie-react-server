const Movie = require('../models/Movie')
const User = require('../models/User')
const { validationResult } = require('express-validator')
const mongoose = require('mongoose')

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
    let filmTitle, filmImg, reviews, filmRating
    const filmId = req.body.id
    const _id = new mongoose.Types.ObjectId()
    const username = req.body.review.name
    Movie.findById(filmId, async (error, result) => {
      let data = {
        _id,
        name: req.body.review.name,
        reviewTitle: req.body.review.reviewTitle,
        reviewBody: req.body.review.reviewBody
      }
      result.reviews.push(data)
      filmTitle = result.title
      filmImg = result.img
      filmRating = result.rating
      reviews = result.reviews
      await result.save()
      // res.json('OK')
    })
    User.findOne({username}, async (err, result) => {
      let data = {
        _id,
        filmId,
        filmImg,
        filmTitle,
        filmRating,
        reviewTitle: req.body.review.reviewTitle,
        reviewBody: req.body.review.reviewBody
      }
      result.reviews.push(data)
      await result.save()
      // console.log(result);
      return res.json({reviews: reviews.reverse(), userData: result.reviews.reverse()})
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
      console.log(req.params)
      if (req.params) {
        filter = req.params
      }
      Movie.find(filter, (error, result) => {
        return res.json(result)
      })
    
    
  }

  async setRating(req, res) {
    const _id = new mongoose.Types.ObjectId()
    let data = {
      _id,
      name: req.body.name,
      mark: req.body.mark 
    }
    Movie.findById(req.body.id, async (error, result) => {
      result.rating.forEach(async (el) => {
        if (req.body.name in el) {
          el.mark = req.body.mark
          await result.save()
          return res.json('rating has been reset')
        }
      })
      result.ratingArray.push(data)
      // filmId = result._id
      // filmTitle = result.title
      // filmImg = result.img
      await result.save()
      // res.json('OK')
    })
    return res.json('set rating ok')
  }

  async addInList(req, res) {
    try {
      console.log(req.body.listName);
      let filmTitle, filmImg, filmRating
      const listName = req.body.listName
      const username = req.body.username
      const filmId = req.body.id
      const _id = new mongoose.Types.ObjectId()
      Movie.findById(filmId, async (error, result) => {
        filmTitle = result.title
        filmImg = result.img
        filmRating = result.rating
      })
      User.findOne({username}, async (err, result) => {
        let data = {
          _id,
          filmId,
          filmImg,
          filmTitle,
          filmRating
        }
        result[listName].push(data)
        await result.save()
        console.log(result[listName]);
        return res.json(result[listName].reverse())
      })
    } catch(e) {
      console.log('error');
    }
  }

  removeFromList(req, res) {
    try{
      console.log(req);
      const listName = req.body.listName
      const username = req.body.username
      User.findOne({username}, async (err, result) => {
        
        const editedList = result[listName].filter(el => el.filmId !== req.body.id)
        result[listName] = editedList
        await result.save()
        return res.json(result[listName])
      })
    } catch (e) {
      console.log('error');
      return res.status(400).json('remove error')
    }
  }
  
  deleteReview(req, res) {
    try {
      const reviewId = req.body._id
      const username = req.body.username
      User.findOne({username}, async (err, result) => {
        let reviews = result.reviews.filter(el => el._id.toString() !== reviewId)
        result.reviews = reviews
        await result.save()
      })
      // console.log(req.body.filmId);
      Movie.findById(req.body.filmId, async (error, result) => {
        const reviews = result.reviews.filter(el => el._id.toString() !== reviewId)
        result.reviews = reviews
        await result.save()
        return res.json("review deleted")
      })
    } catch (e) {
      console.log(e);
    }
  }

}

module.exports = new movieController()