if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

// Requiring packages
const express = require('express');
const app = express();
const indexRouter = require('./routes/index');


// Setting up template engine and static files
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Connecting with the database
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then( (reuslt)=>{
        console.log('connected to the database!');
    })
    .catch( (error)=> {
        console.log(error);
    });


// Routes
app.use('/', indexRouter);
app.use( (req,res) => {
    res.status(404).render('404', { title: '404' });
});


// Listening to the port
app.listen(process.env.PORT || 3000, () => console.log('Server up and running'));
