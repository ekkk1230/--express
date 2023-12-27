const express =  require('express');
const app = express();
var fs = require('fs');
var compression = require('compression'); // 데이터 압축 미들웨어
var helmet = require('helmet');
var indexRouter = require('./routes/index.js');
var topicRouter = require('./routes/topic.js');

app.use(helmet());

app.use('/', indexRouter);
app.use('/topic', topicRouter);


app.use(express.static('public')); // public 폴더 안에서 정적인 파일을 찾는 미들웨어
/* express 4.16 버전 이후는 body-parse 가 내장되어 있어 express에서 불러와서 활용 */
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.get('*', (req, res, next) => { // get 방식으로 들어오는 모든 요청에 미들웨어 적용
    fs.readdir('./data', (err, fileList) => {
        req.list = fileList;
        next();
    });
});

// 미들웨어는 순차적으로 실행되므로 에러 페이지 미들웨어는 마직막에 
app.use((req, res, next) => { 
    res.status(404).send("Sorry can't find that!");
});
app.use((err, req, res, next) => { 
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))
