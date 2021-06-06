const mongoose = require('mongoose');
const {Book} = require('./book');

const Schema = mongoose.Schema;

const authorSchema = new Schema({
    name: {
        type: String, 
        required: true
    }
});

authorSchema.pre('remove', function(next){
    Book.find({author: this.id}, (err, books) =>  {
        if(err){
            next(err);
        } 
        else if(books.length > 0){
            next(new Error('The author has books, so cannot be deleted'));
        }
        else {
            next();
        }
    })
});

const Author = mongoose.model('Author', authorSchema);
module.exports = Author;