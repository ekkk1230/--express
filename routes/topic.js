var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');

router.get('/create', (req, res) => {
    var title = 'WEB - create';
    var list = template.list(req.list);
    var html = template.html(title, list, `
        <form action="/topic/create" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
                <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
    `, '',);

    res.send(html);
});
router.post('/create', (req, res) => { // POSt 방식

    /*  var body = '';
     req.on('data', (data) => { // POST방식으로 data를 전송할 때
         body += data;
     })
     req.on('end', () => { // data가 모두 전송된 후에
         var post = qs.parse(body); // data를 객체화함
         var title = post.title;
         var description = post.description;
         fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
             if (err) throw err;
             console.log(`${title} file saved`);
             
             res.redirect(`page/${title}`);
         })
     }) */
 
     var post = req.body;
     var title = post.title;
     var description = post.description;
     fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
         if (err) throw err;
         console.log(`${title} file saved`);
         
         res.redirect(`${title}`);
     });
});

router.get('/update/:pageId', (req, res) => {
    var filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', (err, description) => {
        var title = req.params.pageId;
        var list = template.list(req.list);
        var html = template.html(title, list, 
            `
                <form action="/topic/update/${title}" method="post">
                    <input type="hidden" name="id" value="${title}">
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                    <p>
                        <textarea name="description" placeholder="description">${description}</textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
            `,
            `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`,
        );
        res.send(html);
    });
});
router.post('/update/:pageId', (req, res) => {
    /* var body = '';
    req.on('data', (data) => { // POST방식으로 data를 전송할 때
        body += data;
    })
    req.on('end', () => { // data가 모두 전송된 후에
        var post = qs.parse(body); // data를 객체화함
        var id = post.id;
        var filteredId = path.parse(post.id).base;
        var title = post.title;
        var description = post.description;
        
        fs.rename(`data/${filteredId}`, `data/${title}`, (err) => {
            fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
                if (err) throw err;
                console.log(`${title} file update!`);
                
                res.redirect(`page/${id}`);
            })
        })
    }) */

    var post = req.body;
    var filteredId = path.parse(post.id).base;;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${filteredId}`, `data/${title}`, (err) => {
        fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
            if (err) throw err;
            console.log(`${title} file update!`);
            
            res.redirect(`/topic/${title}`);
        })
    })
});

router.post('/delete/:pageId', (req, res) => {
    /* var body = '';
    req.on('data', (data) => { // POST방식으로 data를 전송할 때
        body += data;
    })
    req.on('end', () => { // data가 모두 전송된 후에
        var post = qs.parse(body); // data를 객체화함
        var id = post.id;
        var filteredId = path.parse(post.id).base;
        
        fs.unlink(`data/${filteredId}`, function(err) {
            if(err) throw err;
            console.log(`data/${filteredId} file deleted`);
            res.redirect(`/`);
        });
    }) */

    var post = req.body;
    var filteredId = path.parse(post.id).base;

    fs.unlink(`data/${filteredId}`, (err) => {
        if(err) throw err;
        console.log(`data/${filteredId} file delete`);
        res.redirect('/');
    });
});

router.get('/:pageId', (req, res, next) => {
    var filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', (err, description) => {
        if(err) {
            next(err);
        } else {
            var title = req.params.pageId;
            var sanitizedTitlte = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
                allowedTags: ['h1']
            });
            var list = template.list(req.list);
            var html = template.html(sanitizedTitlte, list, 
                `<h2>${sanitizedTitlte}</h2>${sanitizedDescription}`,
                `
                    <a href="/topic/create">create</a> 
                    <a href="/topic/update/${sanitizedTitlte}">update</a>
                    <form action="/topic/delete/${title}" method="post">
                        <input type="hidden" name="id" value="${sanitizedTitlte}" >
                        <input type="submit" value="delete">
                    </form>
                `,
            );
            res.send(html);
        }


    });
});

module.exports = router;