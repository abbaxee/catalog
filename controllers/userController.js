var User = require('../models/user');

// Display Login form on GET
exports.user_reg_get = function(req, res, next) {       
    res.render('registration_form', { title: 'Sign Up'});
};

// Display Registration form on GET
exports.user_login_get =  function(req, res, next) {
    res.render('login_form', {title: 'Login'});
};

// Handle User Registration on POST 
exports.user_reg_post = function(req, res, next) {
    
    req.checkBody('name', 'Name must be specified.').notEmpty();
    req.checkBody('email', 'Email is not Valid').isEmail();
    req.checkBody('email', 'Email is not Valid').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Password do not match').equals(req.body.password);
    
    req.sanitize('first_name').escape();
    req.sanitize('family_name').escape();
    req.sanitize('first_name').trim();     
    req.sanitize('family_name').trim();
    req.sanitize('date_of_birth').toDate();
    req.sanitize('date_of_death').toDate();

    req.sanitize('name').escape();
    req.sanitize('email').escape();
    req.sanitize('password').escape();
    req.sanitize('password2').escape();
    req.sanitize('name').trim();
    req.sanitize('email').trim();
    req.sanitize('password').trim();
    req.sanitize('password2').trim();

    var errors = req.validationErrors();
    
    var user = new User(
      { name: req.body.name, 
        email: req.body.email, 
        password: req.body.password
       });
       console.log(user);
       
    if (errors) {
        res.render('registration_form', { title: 'Sign Up', user: user, errors: errors});
    return;
    } 
    else {
    // Data from form is valid
    
        User.createUser(user, function (err) {
            if (err) { return next(err); }
                //successful - redirect to new author record.
                req.flash('success', 'You are now registered and may Login');
                res.location('/');
                res.redirect('/');
            });
    }

};
