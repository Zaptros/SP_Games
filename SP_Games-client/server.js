const express = require('express');
const serveStatic =require('serve-static');

const hostname="localhost";
const port=3001;

var app=express();

app.use((req,res,next) => {
    console.log(req.method, req.url);
    if(req.method!="GET") { // only GET allowed
        res.type('.html').status(405).end("<html><body>This server only serves web pages with GET!</body></html>");
        return;
    }
    next();
});

const sendFileOptions = { 
    root: __dirname,
}

// get game info page
app.get('/game/:gameid/:platform', (req, res) => {
    console.log(req.params);
    res.status(200).sendFile("/public/game.html", sendFileOptions)
})

// do not allow them to browse to game without url parameters
app.get('/game.html', (req, res) => {
    res.redirect('/')
})

// static pages
app.use(serveStatic(__dirname + "/public", {
    index: "index.html",
    dotfiles: 'ignore' 
}))

// if page not found
app.use((req, res) => {
    res.status(404).sendFile("/public/error.html", sendFileOptions)
})

app.listen(port,hostname, () => {
    console.log(`Server hosted at http://${hostname}:${port}`);
});