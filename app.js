// @ts-check

const express = require('express');

// const bodyParser = require('body-parser'); 기본기능

const app = express();

const PORT = 4000;

// 기본기능이여서 express 사용
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', 'views'); // 공식화
app.use(express.static('public'));

const router = require('./routes/index');
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');
// 과제리뷰
const boardRouter = require('./routes/board');

app.use('/', router);
app.use('/users', userRouter);
app.use('/posts', postRouter);
// 과제리뷰
app.use('/board', boardRouter);

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(err.statusCode || 500);
  res.send(err.message);
});

app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 작동중입니다.`);
});

// app.get('/:id/:name/:gender', (req, res) => {
//   console.log(req.params);
//   res.send(req.params);
// });

// app.get('/', (req, res) => {
//   // console.log(req.query);
//   console.log(req.query.title);
//   console.log(req.query.content);
//   res.send(req.query);
// });

// 실습
// app.get('/:email/:passward/:name/:gender', (req, res) => {
//   console.log(req.params);
//   res.send(req.params);
// });
