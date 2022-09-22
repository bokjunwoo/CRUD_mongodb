// @ts-check

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.DB_URI_LOCAL;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

module.exports = client;

/* 실습
async function main() {
  await client.connect();

  const users = client.db('kdt1').collection('users');

  await users.deleteMany({});

  await users.insertOne({
    name: '포비',
    age: 6,
  });

  await users.insertMany([
    {
      name: '뽀로로',
      age: 5,
    },
    {
      name: '루피',
      age: 5,
    },
    {
      name: '크롱',
      age: 4,
    },
  ]);

  await users.deleteOne({
    age: 4,
  });

  await users.deleteMany({
    age: { $gte: 6 },
  });

  await users.updateOne(
    {
      name: '루피',
    },
    {
      $set: {
        age: 6,
        gender: 'M',
      },
    }
  );

  // await를 사용하지 않는다 -> 수행될 때 실행
  const data = users.find({});
  const arr = await data.toArray();
  // await data.forEach(console.log);
  console.log(arr);
  // console.log(data);

  await client.close();
}

main(); // 실행
*/
