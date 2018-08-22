var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TagSchema = Schema({
  name: {type: String, required: true, min: 3, max: 100},
  books: [{type: Schema.ObjectId, ref: 'Book'}]
});

// Virtual for book's URL
TagSchema
.virtual('url')
.get(function () {
  return '/catalog/tag/' + this._id;
});

//Export model
module.exports = mongoose.model('Tag', TagSchema);