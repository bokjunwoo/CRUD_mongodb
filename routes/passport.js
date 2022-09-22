const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// 네이버
const NaverStrategy = require('passport-naver').Strategy;
// 구글
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// 카카오
const KakaoStrategy = require('passport-kakao').Strategy;
// 페이스북
const FacebookStrategy = require('passport-facebook').Strategy;

const verifyModule = require('./resister').verifyPassword;

const mongoClient = require('./mongo');

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'id',
        passwordField: 'pw',
      },
      async (id, pw, cb) => {
        const client = await mongoClient.connect();
        const userCursor = client.db('kdt1').collection('users');
        const idResult = await userCursor.findOne({ id });

        if (idResult !== null) {
          if (idResult.salt !== undefined) {
            const passwordResult = verifyModule(
              pw,
              idResult.salt,
              idResult.pw,
            );
            if (passwordResult) {
              cb(null, idResult);
            } else {
              cb(null, false, { message: '비밀번호가 틀렸습니다' });
            }
          } else if (idResult.pw === pw) {
            cb(null, idResult);
          } else {
            cb(null, false, { message: '비밀번호가 틀렸습니다' });
          }
        } else {
          cb(null, false, { message: '해당아이디가 없습니다' });
        }
      }
    )
  );
  // 네이버
  passport.use(
    new NaverStrategy(
      {
        clientID: process.env.NAVER_CLIENT,
        clientSecret: process.env.NAVER_CLIENT_SECRET,
        callbackURL: process.env.NAVER_CB_URL,
      },
      async (accessToken, refreshToken, profile, cb) => {
        const client = await mongoClient.connect();
        const userCursor = client.db('kdt1').collection('users');
        const result = await userCursor.findOne({ id: profile.id });

        if (result !== null) {
          cb(null, result);
        } else {
          const newUser = {
            id: profile.id,
            name:
              profile.displayName !== undefined
                ? profile.displayName
                : profile.emails[0].value,
            provider: profile.provider,
          };
          const dbResult = await userCursor.insertOne(newUser);
          if (dbResult.acknowledged) {
            cb(null, newUser);
          } else {
            cb(null, false, { message: '회원 생성 에러' });
          }
        }
      }
    )
  );
  // 구글
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CB_URL,
      },
      async (accessToken, refreshToken, profile, cb) => {
        console.log(profile);
        const client = await mongoClient.connect();
        const userCursor = client.db('kdt1').collection('users');
        const result = await userCursor.findOne({ id: profile.id });

        if (result !== null) {
          cb(null, result);
        } else {
          const newUser = {
            id: profile.id,
            name:
              profile.displayName !== undefined
                ? profile.displayName
                : profile.emails[0]?.value,
            provider: profile.provider,
          };
          const dbResult = await userCursor.insertOne(newUser);
          if (dbResult.acknowledged) {
            cb(null, newUser);
          } else {
            cb(null, false, { message: '회원 생성 에러' });
          }
        }
      }
    )
  );
  // 카카오
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_CLIENT,
        callbackURL: process.env.KAKAO_CB_URL,
      },
      async (accessToken, refreshToken, profile, cb) => {
        console.log(profile);
        const client = await mongoClient.connect();
        const userCursor = client.db('kdt1').collection('users');
        const result = await userCursor.findOne({ id: profile.id });

        if (result !== null) {
          cb(null, result);
        } else {
          const newUser = {
            id: profile.id,
            name:
              profile.displayName !== undefined
                ? profile.displayName
                : profile.emails[0]?.value,
            provider: profile.provider,
          };
          const dbResult = await userCursor.insertOne(newUser);
          if (dbResult.acknowledged) {
            cb(null, newUser);
          } else {
            cb(null, false, { message: '회원 생성 에러' });
          }
        }
      }
    )
  );
  // 페이스북
  passport.use(
    new FacebookStrategy(
      {
        // Rest API 키
        clientID: process.env.FACEBOOK_CLIENT,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: process.env.FACEBOOK_CB_URL,
      },
      async (accssToken, refreshToken, profile, cb) => {
        const client = await mongoClient.connect();
        const userCursor = client.db('board').collection('users');
        const idResult = await userCursor.findOne({ id: profile.id });
        if (idResult !== null) {
          cb(null, idResult);
        } else {
          const newUser = {
            id: profile.id,
            name:
              profile.displayName !== undefined
                ? profile.displayName
                : profile.emails[0]?.value,
            provider: profile.provider,
          };
          const dbResult = await userCursor.insertOne(newUser);
          if (dbResult.acknowledged) {
            cb(null, newUser);
          } else {
            cb(null, false, { message: 'Sign-up Error.' });
          }
        }
      }
    )
  );

  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser(async (id, cb) => {
    const client = await mongoClient.connect();
    const userCursor = client.db('kdt1').collection('users');
    const result = await userCursor.findOne({ id });
    if (result !== null) {
      cb(null, result);
    }
  });
};
