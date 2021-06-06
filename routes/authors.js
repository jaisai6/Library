const express = require('express');
const router = express.Router();

const Author = require('../models/author');
const {Book} = require('../models/book');

// All author route
router.get('/', async (req, res) => {
    
    let searchOptions = {};

    if(req.query.name != null && req.query.name !== ""){
        searchOptions.name = new RegExp(req.query.name, 'i');
    }

    try {
        const authors = await Author.find(searchOptions);
        res.render('authors/index', {authors: authors, searchOptions: req.query });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }

});

// New author route
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()});
});

// Create new author
router.post('/', async (req, res) => {
    const author = new Author({ name: req.body.name });

    try {
        const newAuthor = await author.save();
        res.redirect(`/authors/${newAuthor.id}`);
    } catch (error) {
        res.render('authors/new', {author: author, errorMessage: "Enter a valid author name" });
    }
});

// Author detail
router.get('/:id', async (req,res) => {

    try {
        const author = await Author.findById(req.params.id).exec();
        const booksByAuthor = await Book.find({author: req.params.id}).limit(6).exec();
        res.render('authors/detail', {author, booksByAuthor});
    } catch {
        res.redirect('/authors');
    }
});

// Author edit
router.get('/:id/edit', async (req,res) => {
    const authorId = req.params.id;

    try {
        const author = await Author.findById(authorId).exec();
        res.render('authors/edit', {author});
    } catch (err) {
        console.log(err);
        res.redirect('/authors');
    }

});

router.put('/:id', async (req,res) => {

    let author;

    try {
        author = await Author.findById(req.params.id).exec();
        author.name = req.body.name;
        const newAuthor = await author.save();

        res.redirect(`/authors/${newAuthor.id}`);
    } 
    catch (error) {
        if(author == null){
            res.redirect('/');
        }
        else{
            res.render('authors/edit', {author: author, errorMessage: "Error updating author" });
        }
    }
});

router.delete('/:id', async (req,res) => {
    let author;

    try {
        author = await Author.findById(req.params.id).exec();
        await author.remove();
        res.redirect(`/authors`);
    } 
    catch (err) {
        if(author == null){
            res.redirect('/');
        }
        else{
            // console.log(err);
            res.redirect(`/authors/${author.id}`);
        }
    }
});

module.exports = router;