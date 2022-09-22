// @ts-check
const express = require('express');
const passport = require('passport');

const isLogin = (req, res, next) => {
  if (req.session.login || req.user || req.signedCookies.user) {
    next();
  } else {
    res.status(300);
    res.send(
      '로그인이 필요한 서비스 입니다.<br><a href="/login"> 로그인 페이지로 이동</a><br><a href="/"> 메인 페이지로 이동</a>'
    );
  }
};

const router = express.Router();

router.get('/', (req, res) => {
  res.render('login');
});

router.post('/', async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      throw err;
    }
    if (!user) {
      return res.send(
        `${info.message}<br><a href="/login">로그인 페이지로 이동</a>`
      );
    }
    req.login(user, (err) => {
      if (err) throw err;
      res.cookie('user', req.body.id, {
        expires: new Date(Date.now() + 1000 * 60),
        httpOnly: true,
        signed: true,
      });
      res.redirect('/board');
    });
  })(req, res, next);
});

// router.get('/logout', async (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       throw err;
//     }
//     res.redirect('/');
//   });
// });

router.get('/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) return next(err);
    return res.redirect('/');
  });
});

// 네이버
router.get('/auth/naver', passport.authenticate('naver'));

router.get(
  '/auth/naver/callback',
  passport.authenticate('naver', {
    successRedirect: '/board',
    failureRedirect: '/',
  })
);

// 구글
router.get('/auth/google', passport.authenticate('google', { scope: 'email' }));

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/board',
    failureRedirect: '/',
  })
);

// 카카오
router.get('/auth/kakao', passport.authenticate('kakao'));

router.get(
  '/auth/kakao/callback',
  passport.authenticate('kakao', {
    successRedirect: '/board',
    failureRedirect: '/',
  })
);

// 페이스북
router.get('/auth/facebook', passport.authenticate('facebook'));

router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/board',
    failureRedirect: '/',
  })
);

module.exports = { router, isLogin };
