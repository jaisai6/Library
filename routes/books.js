const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Requiring from User model
const { Book, coverImageBasePath } = require('../models/book');
const Author = require('../models/author');

// Variables for setting up multer
const uploadPath = path.join('public', coverImageBasePath);
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

// Setting up multer
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
});


// ============================================================================

// All book route
router.get('/', async (req, res) => {

    let query = Book.find();

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
        const books = await query.exec();
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
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
        coverImageName: fileName
    });

    try {
        const newBook = await book.save();
        // res.redirect(`books/${newBook.id}`);
        res.redirect(`books/`);
    } catch (err) {
        if (book.coverImageName != null) {
            // console.log('removing book cover from the system');
            removeBookCover(book.coverImageName);
        }
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

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.log(err);
    });
}

module.exports = router;