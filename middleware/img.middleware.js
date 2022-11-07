const { diskStorage } = require('multer')
const multer = require('multer')

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'images/')
  },
  filename(req, file, cb) {
    console.log(file.fieldname, file.originalname);
    cb(null, file.originalname)
  }
})

module.exports = multer({ storage: storage })