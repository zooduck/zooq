const mongodb = require("mongodb");
// const url = "mongodb://localhost:27017/data";
const url = "mongodb://zooduck:Passw0rd@ds219318.mlab.com:19318/zooq";
// const url = "mongodb://heroku_gpsdw9p6:23cjrn60p0osr8ltlp6d0uqn1t@ds121118.mlab.com:21118/heroku_gpsdw9p6";
let dbo = null;
mongodb.MongoClient.connect(url, (err, db) => {
  if (err) {
    return console.log("MongoDB Connection Error:", err);
  }
  dbo = db.db("zooq");
  dbo.createCollection("services", (err, result) => {
    if (err) {
      return console.log(err);
    }
    console.log(result);
  });
  dbo.createCollection("staff", (err, result) => {
    if (err) {
      return console.log(err);
    }
    console.log(result);
  });
  dbo.createCollection("q", (err, result) => {
    if (err) {
      return console.log(err);
    }
    console.log(result);
  });
  console.log(`MongoDB Connection to ${url} successful`);
});
