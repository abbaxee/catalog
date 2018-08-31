var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var Tag = require('../models/tag');

var async = require('async');



exports.index = function(req, res) {   
    
    async.parallel({
        book_count: function(callback) {
            Book.count(callback);
        },
        tag_count: function(callback) {
            Tag.count(callback);
        },
        author_count: function(callback) {
            Author.count(callback);
        },
        genre_count: function(callback) {
            Genre.count(callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Local Library Home', error: err, data: results });
    });
};

// Display list of all books
exports.book_list = function(req, res, next) {
    
      Book.find({}, 'title image author')
        .populate('author')
        .exec(function (err, list_books) {
          if (err) { return next(err); }
          //Successful, so render
          console.log(list_books);
          res.render('book_list', { title: 'Book List', book_list: list_books });
        });
        
    };

// Display detail page for a specific book
exports.book_detail = function(req, res, next) {
    
      async.parallel({
        book: function(callback) {     
            
          Book.findById(req.params.id)
            .populate('author')
            .populate('genre')
            .exec(callback);
        },
        tags: function(callback) {
    
          Tag.find({ 'books': req.params.id })
            .exec(callback);
        },
      }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('book_detail', { title: 'Title', book: results.book, tags: results.tags } );
      });
        
    };

// Display book create form on GET
exports.book_create_get = function(req, res, next) { 
    
  //Get all authors and genres, which we can use for adding to our book.
  async.parallel({
      authors: function(callback) {
          Author.find(callback);
      },
      genres: function(callback) {
          Genre.find(callback);
      },
  }, function(err, results) {
      if (err) { return next(err); }
      res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
  });
  
};

// Handle book create on POST 
exports.book_create_post = function(req, res, next) {
    if(!(req.body.genre instanceof Array)){
        if(typeof req.body.genre==='undefined')
        req.body.genre=[];
        else
        req.body.genre=new Array(req.body.genre);
    }
    
    if (req.file){
        console.log('Uploading File...');
        var bookimage = req.file.filename;
      }

    req.checkBody('title', 'Title must not be empty.').notEmpty();
    req.checkBody('author', 'Author must not be empty').notEmpty();
    req.checkBody('summary', 'Summary must not be empty').notEmpty();
    req.checkBody('isbn', 'ISBN must not be empty').notEmpty();
    
    req.sanitize('title').escape();
    req.sanitize('author').escape();
    req.sanitize('summary').escape();
    req.sanitize('isbn').escape();
    req.sanitize('title').trim();     
    req.sanitize('author').trim();
    req.sanitize('summary').trim();
    req.sanitize('isbn').trim();
    
    var book = new Book({
        title: req.body.title, 
        author: req.body.author, 
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
        image: bookimage
    });
        
    console.log('BOOK: ' + book);
    
    var errors = req.validationErrors();
    if (errors) {
        // Some problems so we need to re-render our book

        //Get all authors and genres for form
        async.parallel({
            authors: function(callback) {
                Author.find(callback);
            },
            genres: function(callback) {
                Genre.find(callback);
            },
        }, function(err, results) {
            if (err) { return next(err); }
            
            // Mark our selected genres as checked
            for (i = 0; i < results.genres.length; i++) {
                if (book.genre.indexOf(results.genres[i]._id) > -1) {
                    //Current genre is selected. Set "checked" flag.
                    results.genres[i].checked='true';
                }
            }

            res.render('book_form', { title: 'Create Book',authors:results.authors, genres:results.genres, book: book, errors: errors });
        });

    } 
    else {
    // Data from form is valid.
    // We could check if book exists already, but lets just save.
    
        book.save(function (err) {
            if (err) { return next(err); }
            //successful - redirect to new book record.
            res.redirect(book.url);
        });
    }

};

// Display book delete form on GET
exports.book_delete_get = function(req, res) {      

    async.parallel({
        book: function(callback) {     
            Book.findById(req.params.id).exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('book_delete', { title: 'Delete Book', book: results.book } );
    });
    
};
// Handle book delete on POST
exports.book_delete_post = function(req, res, next) {

    req.checkBody('bookid', 'Book id must exist').notEmpty();  
    
    async.parallel({
        book: function(callback) {     
            Author.findById(req.body.bookid).exec(callback);
        },
    }, function(err, results) {
        
            // Delete object and redirect to the list of Books.
            Book.findByIdAndRemove(req.body.bookid, function(err) {
                if (err) { return next(err); }
                //Success - got to books list
                res.redirect('/catalog/books');
            });
        
    });
}
// Display book update form on GET
exports.book_update_get = function(req, res, next) {
    
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    //Get book, authors and genres for form
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
            
        // Mark our selected genres as checked
        for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
            for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                if (results.genres[all_g_iter]._id.toString()==results.book.genre[book_g_iter]._id.toString()) {
                    results.genres[all_g_iter].checked='true';
                }
            }
        }
        res.render('book_form', { title: 'Update Book', authors:results.authors, genres:results.genres, book: results.book });
    });
    
};

// Handle book update on POST 
exports.book_update_post = function(req, res, next) {
    
    if (req.file){
        console.log('Uploading File...');
        var bookimage = req.file.filename;
    }

    //Sanitize id passed in. 
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    
    //Check other data
    req.checkBody('title', 'Title must not be empty.').notEmpty();
    req.checkBody('author', 'Author must not be empty').notEmpty();
    req.checkBody('summary', 'Summary must not be empty').notEmpty();
    req.checkBody('isbn', 'ISBN must not be empty').notEmpty();
    
    req.sanitize('title').escape();
    req.sanitize('author').escape();
    req.sanitize('summary').escape();
    req.sanitize('isbn').escape();
    req.sanitize('title').trim();
    req.sanitize('author').trim(); 
    req.sanitize('summary').trim();
    req.sanitize('isbn').trim();
    
    var book = new Book(
      { title: req.body.title, 
        author: req.body.author, 
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: req.body.genre,
        image: bookimage,
        _id:req.params.id //This is required, or a new ID will be assigned!
       });
    
    var errors = req.validationErrors();
    if (errors) {
        // Re-render book with error information
        // Get all authors and genres for form
        async.parallel({
            authors: function(callback) {
                Author.find(callback);
            },
            genres: function(callback) {
                Genre.find(callback);
            },
        }, function(err, results) {
            if (err) { return next(err); }
            
            // Mark our selected genres as checked
            for (i = 0; i < results.genres.length; i++) {
                if (book.genre.indexOf(results.genres[i]._id) > -1) {
                    results.genres[i].checked='true';
                }
            }
            res.render('book_form', { title: 'Update Book',authors:results.authors, genres:results.genres, book: book, errors: errors });
        });

    } 
    else {
        // Data from form is valid. Update the record.
        Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
            if (err) { return next(err); }
            //successful - redirect to book detail page.
            res.redirect(thebook.url);
        });
    }

};