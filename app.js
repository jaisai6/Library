if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

// Requiring packages
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
// Requiring routers
const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');

const app = express();

// Setting up template engine and static files
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Middlewares
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(express.json({limit: '50mb'}));
app.use(methodOverride('_method'));

// Connecting with the database
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then( (reuslt)=>{
        console.log('connected to the database!');
    })
    .catch( (error)=> {
        console.log(error);
    });


// Routes
app.use('/', indexRouter);
app.use('/authors', authorRouter);
app.use('/books', bookRouter);


// 404 Route
app.use( (req,res) => {
    res.status(404).render('404');
});


// Listening to the port
app.listen(process.env.PORT || 3000, () => console.log('Server up and running'));
