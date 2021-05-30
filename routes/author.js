const express = require('express');
const router = express.Router();

const Author = require('../models/author');

// All author route
router.get('/', async (req, res) => {
    let searchOptions = {};
    console.log(req.query.name);
    if(req.query.name != null && req.query.name !== ""){
        searchOptions.name = new RegExp(req.query.name, 'i');
    }
    try {
        // const authors = await Author.find({name: {$regx: /req.query.name/}});
        console.log(searchOptions);
        const authors = await Author.find(searchOptions);
        res.render('authors/index', { title: "Authors", authors: authors, searchOptions: req.query });
    } catch (error) {
        console.log(error);
        res.redirect('/', {title: "Home"});
    }

});

// New author route
router.get('/new', (req, res) => {
    res.render('authors/new', { title: "New Author"});
});

// Create new author
router.post('/', async (req, res) => {
    const author = new Author({ name: req.body.name });

    try {
        const savedAuthor = await author.save();
        console.log(savedAuthor);
        res.redirect('authors');
    } catch (error) {
        res.render('authors/new', { title: "New Author", author: author, errorMessage: "Enter a valid author name" });
    }


});

module.exports = router;