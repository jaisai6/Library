const express = require('express');
const router = express.Router();

// Requiring from User model
const Author = require('../models/author');
const {Book} = require('../models/book');

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
        res.redirect(`books/${newBook.id}`);
    } catch (err) {
        renderNewPage(res, book, true);
    }
});

router.get('/:id', async (req,res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec();
        res.render('books/detail', {book});
    } catch{
        res.redirect('/books');
    }
});

router.get('/:id/edit', async (req,res) => {
    try {
        const book = await Book.findById(req.params.id).exec();
        renderEditPage(res,book);
    } catch {
        res.redirect('/books');
    }
});

router.put('/:id', async (req,res) => {
    let book;

    try {

        book = await Book.findById(req.params.id).exec();
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;

        if(req.body.cover != null && req.body.cover !== ""){
            saveCover(book,req.body.cover);
        }

        await book.save();

        res.redirect(`/books/${book.id}`);
    } catch(err) {
        if(book!=null){
            console.log(err);
            renderEditPage(res,book,true);
        }

        else{
            res.redirect('/books');
        }
    }
});

router.delete('/:id', async (req,res) => {
    
    let book;
    try {        
        book = await Book.findById(req.params.id).exec();        
        await book.remove();

        res.redirect('/books');
    } catch {
        if(book!=null){
            res.render('books/detail', {book,errorMessage: "Unable to remove the book"});
        }
        else{
            res.redirect(`/books`);
        }
    }
});


// ============================================================================

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res,book,'new',hasError);
}

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res,book,'edit',hasError);
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find();
        const params = {
            authors,
            book
        }

        if (hasError){
            
            if(form==='edit'){
                params.errorMessage = 'Error updating the book';
            }
            else{
                params.errorMessage = 'Error creating the book';
            }
        }
        
        res.render(`books/${form}`, params);
    } catch {
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