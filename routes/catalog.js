var express = require('express');
var router = express.Router();

// Require controller modules
var book_controller = require('../controllers/bookController');
var author_controller = require('../controllers/authorController');
var genre_controller = require('../controllers/genreController');
var tag_controller = require('../controllers/tagController');

var multer = require('multer');
var upload = multer({dest: './public/images'});

/// BOOK ROUTES ///

/* GET catalog home page. */
router.get('/', ensureAuthenticated, book_controller.index);

/* GET request for creating a Book. NOTE This must come before routes that display Book (uses id) */
router.get('/book/create', ensureAuthenticated, book_controller.book_create_get);

/* POST request for creating Book. */
router.post('/book/create', upload.single('bookimage'), book_controller.book_create_post);

/* GET request to delete Book. */
router.get('/book/:id/delete', book_controller.book_delete_get);

// POST request to delete Book
router.post('/book/:id/delete',  book_controller.book_delete_post);

/* GET request to update Book. */
router.get('/book/:id/update', book_controller.book_update_get);

// POST request to update Book
router.post('/book/:id/update', upload.single('bookimage'), book_controller.book_update_post);

/* GET request for one Book. */
router.get('/book/:id', book_controller.book_detail);

/* GET request for list of all Book items. */
router.get('/books', ensureAuthenticated, book_controller.book_list);

/// AUTHOR ROUTES ///

/* GET request for creating Author. NOTE This must come before route for id (i.e. display author) */
router.get('/author/create', ensureAuthenticated, author_controller.author_create_get);

/* POST request for creating Author. */
router.post('/author/create', author_controller.author_create_post);

/* GET request to delete Author. */
router.get('/author/:id/delete', author_controller.author_delete_get);

// POST request to delete Author
router.post('/author/:id/delete', author_controller.author_delete_post);

/* GET request to update Author. */
router.get('/author/:id/update', author_controller.author_update_get);

// POST request to update Author
router.post('/author/:id/update', author_controller.author_update_post);

/* GET request for one Author. */
router.get('/author/:id', ensureAuthenticated, author_controller.author_detail);

/* GET request for list of all Authors. */
router.get('/authors', ensureAuthenticated,author_controller.author_list);

/// GENRE ROUTES ///

/* GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id) */
router.get('/genre/create', ensureAuthenticated, genre_controller.genre_create_get);

/* POST request for creating Genre. */
router.post('/genre/create', genre_controller.genre_create_post);

/* GET request to delete Genre. */
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

// POST request to delete Genre
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

/* GET request to update Genre. */
router.get('/genre/:id/update', genre_controller.genre_update_get);

// POST request to update Genre
router.post('/genre/:id/update', genre_controller.genre_update_post);

/* GET request for one Genre. */
router.get('/genre/:id', ensureAuthenticated, genre_controller.genre_detail);

/* GET request for list of all Genre. */
router.get('/genres', ensureAuthenticated, genre_controller.genre_list);

/// BOOKINSTANCE ROUTES ///

/* GET request for creating a BookInstance. NOTE This must come before route that displays BookInstance (uses id) */
router.get('/tag/create', tag_controller.tag_create_get);

/* POST request for creating BookInstance. */
router.post('/tag/create', tag_controller.tag_create_post);

/* GET request to delete Tag. */
router.get('/tag/:id/delete', tag_controller.tag_delete_get);

// POST request to delete BookInstance
router.post('/tag/:id/delete', tag_controller.tag_delete_post);

/* GET request for one Tag. */
router.get('/tag/:id', ensureAuthenticated, tag_controller.tag_detail);

/* GET request for list of all Tags. */
router.get('/tag', ensureAuthenticated, tag_controller.tag_list);

// TODO
// /* GET request to update Tags. */
// router.get('/tag/:id/update', );

// // POST request to update Tag
// router.post('/tag/:id/update', );

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/users/login');
}

module.exports = router;