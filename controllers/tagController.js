var Tag = require('../models/tag');
var Book = require('../models/book');

var async = require('async');

// Display list of all Tags
exports.tag_list = function(req, res, next) {
    
      Tag.find()
        .populate('book')
        .exec(function (err, list_tags) {
          if (err) { return next(err); }
          //Successful, so render
          res.render('tag_list', { title: 'Tag List', tag_list: list_tags });
        });
        
    };

// Display detail page for a specific Tag
exports.tag_detail = function(req, res, next) {
    
      Tag.findById(req.params.id)
        .populate('books')
        .exec(function (err, tag) {
          if (err) { return next(err); }
          //Successful, so render
          res.render('tag_detail', { title: 'Tag Detail:', tag: tag });
        });
        
    };

// Display tag create form on GET
exports.tag_create_get = function(req, res, next) {       
    
        Book.find({},'title')
        .sort([['title', 'ascending']])
        .exec(function (err, books) {
          if (err) { return next(err); }
          //Successful, so render
          res.render('tag_form', {title: 'Create Tag', book_list:books});
        });
        
    };

// Handle tag create on POST 
exports.tag_create_post = function(req, res, next) {
    
    //Check that the name field is not empty
    req.checkBody('name', 'Genre name required').notEmpty(); 
    req.checkBody('book', 'book name required').notEmpty(); 
    
    //Trim and escape the name field. 
    req.sanitize('name').escape();
    req.sanitize('name').trim();
    
    //Run the validators
    var errors = req.validationErrors();

    //Create a tag object with escaped and trimmed data.
    var tag = new Tag({
        name: req.body.name ,
        books: req.body.book
        }
    );
    
    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        Book.find({},'title')
        .exec(function (err, books) {
          if (err) { return next(err); }
          //Successful, so render
          res.render('tag_form', { title: 'Create Tag', tag: tag, book_list:books, errors: errors});
        });   
    return;
    } 
    else {
        // Data from form is valid.
        //Check if Tag with same name already exists
        Tag.findOne({ 'name': req.body.name })
            .exec( function(err, found_tag) {
                 console.log('found_tag: ' + found_tag);
                 if (err) { return next(err); }
                 
                 if (found_tag) { 
                     //Tag exists, redirect to its detail page
                     res.redirect(found_tag.url);
                 }
                 else {
                     
                     tag.save(function (err) {
                       if (err) { return next(err); }
                       //Tag saved. Redirect to tag's detail page
                       res.redirect(tag.url);
                     });
                     
                 }
                 
             });
    }

};

// Display Tag delete form on GET
exports.tag_delete_get = function(req, res, next) {
    async.parallel({
        tag: function(callback) {     
            Tag.findById(req.params.id).exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('tag_delete', { title: 'Tag Book', tag: results.tag } );
    });
    
};

// Handle Tag delete on POST
exports.tag_delete_post = function(req, res, next) {
    req.checkBody('tagid', 'Book id must exist').notEmpty();  
    
    async.parallel({
        tag: function(callback) {     
            Tag.findById(req.body.tagid).exec(callback);
        },
    }, function(err, results) {
        
            // Delete object and redirect to the list of Books.
            Tag.findByIdAndRemove(req.body.tagid, function(err) {
                if (err) { return next(err); }
                //Success - got to Tag list
                res.redirect('/catalog/tag');
            });
        
    });
}

// // Display BookInstance update form on GET
// exports.bookinstance_update_get = function(req, res) {
//     res.send('NOT IMPLEMENTED: BookInstance update GET');
// };

// // Handle bookinstance update on POST
// exports.bookinstance_update_post = function(req, res) {
//     res.send('NOT IMPLEMENTED: BookInstance update POST');
// };