const express = require('express');
const router = express.Router();

// Requiring from User model
const {Book} = require('../models/book');
const Author = require('../models/author');

// Accepted image types for the file
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];


// ============================================================================

// All book route
router.get('/', async (req, res) => {

    let query = Book.find({});

    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }

    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate', req.query.publishedAfter);
    }

    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate', req.query.publishedBefore);
    }

    try {
        const books =  await query.exec();
        res.render('books/index', { books, searchOptions: req.query });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
});

// New book route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book());
});

// Create new book
router.post('/', async (req, res) => {

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    });

    saveCover(book ,req.body.cover);

    try {
        const newBook = await book.save();
        // res.redirect(`books/${newBook.id}`);
        res.redirect(`books/`);
    } catch (err) {
        renderNewPage(res, book, true);
    }
});

// ============================================================================

async function renderNewPage(res, book, hasError = false) {
    try {
        res.locals.today = new Date().toISOString().split('T')[0];
        const authors = await Author.find();
        const params = {
            authors,
            book
        }

        if (hasError) params.errorMessage = 'New book cannot be created';

        res.render('books/new', params);
    } catch (err) {
        console.log(err);
        res.render('/books');
    }
}

function saveCover(book, coverEncoded){
    if(coverEncoded == null) return;

    const cover = JSON.parse(coverEncoded);

    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
}

module.exports = router;