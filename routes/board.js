// @ts-check
const express = require('express');

const multer = require('multer');

// 파일시스템 기본내장
const fs = require('fs');

const router = express.Router();

const mongoClient = require('./mongo');

const isLogin = require('./login');

const dir = './uploads';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dir);
  },
  // 파일 이름 바꿔주기 (원래 이름 + 날짜)
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '_' + Date.now());
  },
});

const limits = {
  fileSize: 1024 * 1024 * 2, // 2MB
};

const upload = multer({ storage, limits });

router.get('/', isLogin.isLogin, async (req, res) => {
  console.log(req.user);
  // 글 전체 목록 보여주기
  const client = await mongoClient.connect();
  const cursor = client.db('kdt1').collection('board');
  const ARTICLE = await cursor.find({}).toArray();
  const articleLen = ARTICLE.length;
  res.render('board', {
    ARTICLE,
    articleCounts: articleLen,
    userId: req.session.userId
      ? req.session.userId
      : req.user?.id
      ? req.user?.id
      : req.signedCookies.user,
  });

  /*
  MongoClient.connect(uri, (err, db) => {
    const data = db.db('kdt1').collection('board');

    data.find({}).toArray((err, result) => {
      const ARTICLE = result;
      const articleLen = ARTICLE.length;
      res.render('board', { ARTICLE, articleCounts: articleLen });
    });
  });
  */
});

router.get('/write', isLogin.isLogin, (req, res) => {
  // 글 쓰기 모드로 이동
  res.render('board_write');
});

router.post(
  '/write',
  isLogin.isLogin,
  upload.single('img'),
  async (req, res) => {
    // 폴더가 없으면 만들어줘
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    console.log(req.file);
    // 글 추가 모드로 이동
    if (req.body.title && req.body.content) {
      const newArticle = {
        id: req.session.userId ? req.session.userId : req.user.id,
        userName: req.user?.name ? req.user.name : req.user?.id,
        title: req.body.title,
        content: req.body.content,
        img: req.file ? req.file.filename : null,
      };
      const client = await mongoClient.connect();
      const cursor = client.db('kdt1').collection('board');
      await cursor.insertOne(newArticle);
      res.redirect('/board');

      /*
    MongoClient.connect(uri, (err, db) => {
      const data = db.db('kdt1').collection('board');

      data.insertOne(newArticle, (err, result) => {
        if (err) {
          throw err;
        } else {
          res.redirect('/board');
        }
      });
    });
  } else {
    const err = new Error('데이터가 없습니다');
    err.statusCode = 404;
    throw err;
  } */
    }
  }
);

router.get('/modify/title/:title', isLogin.isLogin, async (req, res) => {
  // 글 수정 모드로 이동
  const client = await mongoClient.connect();
  const cursor = client.db('kdt1').collection('board');
  const selectedArticle = await cursor.findOne({ title: req.params.title });
  res.render('board_modify', { selectedArticle });

  /*
  MongoClient.connect(uri, (err, db) => {
    const data = db.db('kdt1').collection('board');

    data.findOne({ title: req.params.title }, (err, result) => {
      if (err) {
        throw err;
      } else {
        const selectedArticle = result;
        res.render('board_modify', { selectedArticle });
      }
    });
  });
  */
});

router.post('/modify/title/:title', isLogin.isLogin, async (req, res) => {
  // 글 수정 기능 수행
  if (req.body.title && req.body.content) {
    const client = await mongoClient.connect();
    const cursor = client.db('kdt1').collection('board');
    await cursor.updateOne(
      { title: req.params.title },
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
        },
      }
    );
    res.redirect('/board');

    /*
    MongoClient.connect(uri, (err, db) => {
      const data = db.db('kdt1').collection('board');

      data.updateOne(
        { title: req.params.title },
        {
          $set: {
            title: req.body.title,
            content: req.body.content,
          },
        },
        (err, result) => {
          if (err) {
            throw err;
          } else {
            res.redirect('/board');
          }
        }
      );
    });
  } else {
    const err = new Error('요청 값이 없습니다.');
    err.statusCode = 404;
    throw err;
  }
  */
  }
});

router.delete('/delete/title/:title', isLogin.isLogin, async (req, res) => {
  // 글 삭제 기능 수행
  const client = await mongoClient.connect();
  const cursor = client.db('kdt1').collection('board');
  // 예외처리
  const result = await cursor.deleteOne({ title: req.params.title });
  if (result.acknowledged) {
    res.send('삭제완료');
  } else {
    const err = new Error('삭제 실패');
    err.statusCode = 404;
    throw err;
  }

  /*
  MongoClient.connect(uri, (err, db) => {
    const data = db.db('kdt1').collection('board');

    data.deleteOne({ title: req.params.title }, (err, result) => {
      if (err) {
        throw err;
      } else {
        res.send('삭제완료');
      }
    });
  });
  */
});

module.exports = router;
