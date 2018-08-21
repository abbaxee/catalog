var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');
var mongoose = require('mongoose');

// Display list of all Genre
exports.genre_list = function(req, res, next) {
    
      Genre.find()
        .sort([['name', 'ascending']])
        .exec(function (err, list_genre) {
          if (err) { return next(err); }
          //Successful, so render
          res.render('genre_list', { title: 'Genre List', genre_list: list_genre });
        });
    
    };

// Display detail page for a specific Genre
exports.genre_detail = function(req, res, next) {

    var id = mongoose.Types.ObjectId(req.params.id.trim());
    
      async.parallel({
        genre: function(callback) {  
          Genre.findById(id)
            .exec(callback);
        },
            
        genre_books: function(callback) {            
          Book.find({ 'genre': id })
          .exec(callback);
        },
    
      }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books } );
      });
    
    };

// Display Genre create form on GET
exports.genre_create_get = function(req, res, next) {       
    res.render('genre_form', { title: 'Create Genre' });
};
// Handle Genre create on POST 
exports.genre_create_post = function(req, res, next) {
    
    //Check that the name field is not empty
    req.checkBody('name', 'Genre name required').notEmpty(); 
    
    //Trim and escape the name field. 
    req.sanitize('name').escape();
    req.sanitize('name').trim();
    
    //Run the validators
    var errors = req.validationErrors();

    //Create a genre object with escaped and trimmed data.
    var genre = new Genre(
      { name: req.body.name }
    );
    
    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors});
    return;
    } 
    else {
        // Data from form is valid.
        //Check if Genre with same name already exists
        Genre.findOne({ 'name': req.body.name })
            .exec( function(err, found_genre) {
                 console.log('found_genre: ' + found_genre);
                 if (err) { return next(err); }
                 
                 if (found_genre) { 
                     //Genre exists, redirect to its detail page
                     res.redirect(found_genre.url);
                 }
                 else {
                     
                     genre.save(function (err) {
                       if (err) { return next(err); }
                       //Genre saved. Redirect to genre detail page
                       res.redirect(genre.url);
                     });
                     
                 }
                 
             });
    }

};

// Display Genre delete form on GET
exports.genre_delete_get = function(req, res) {      

    async.parallel({
        genre: function(callback) {     
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books: function(callback) {
          Book.find({ 'genre': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books } );
    });
    
};

// Handle Genre delete on POST
exports.genre_delete_post = function(req, res, next) {
    
    req.checkBody('authorid', 'Author id must exist').notEmpty();  
    
    async.parallel({
        genre: function(callback) {     
            Genre.findById(req.body.genreid).exec(callback);
        },
        genre_books: function(callback) {
            Book.find({ 'author': req.body.genreid },'title summary').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Success
        if (results.genre_books.length > 0) {
            //Author has books. Render in same way as for GET route.
            res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books } );
            return;
        }
        else {
            //Author has no books. Delete object and redirect to the list of authors.
            Genre.findByIdAndRemove(req.body.genreid, function deleteAuthor(err) {
                if (err) { return next(err); }
                //Success - got to author list
                res.redirect('/catalog/genres');
            });

        }
    });

};

// Display Genre update form on GET
exports.genre_update_get = function(req, res) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    //Get genre details for form
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback);
        },
    }, function(err, result) {
        if (err) { return next(err); }
            
        res.render('genre_form', { title: 'Update Genre', genre:result.genre });
    });
    
};

// Handle Genre update on POST
exports.genre_update_post = function(req, res) {
    //Sanitize id passed in. 
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    
    //Check other data
    req.checkBody('name', 'Genre name required').notEmpty(); 

    //Trim and escape the name field. 
    req.sanitize('name').escape();
    req.sanitize('name').trim();
     

    var errors = req.validationErrors();
    
    var genre = new Genre(
        { 
            name: req.body.name,
            _id:req.params.id //This is required, or a new ID will be assigned!
        });
    
    
    var errors = req.validationErrors();
    if (errors) {
        // Re-render author form with error information
        res.render('genre_form', { title: 'Update Genre', genre: genre, errors: errors });
    } 
    else {
        // Data from form is valid. Update the record.
        Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err,thegenre) {
            if (err) { return next(err); }
            //successful - redirect to author detail page.
            res.redirect(thegenre.url);
        });
    }

};