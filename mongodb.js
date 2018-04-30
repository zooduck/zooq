const mongoDB = (function mongoDB() {
  const $run = () => {
    const mongodb = require("mongodb");
    const url = process.env.MONGODB_URL;
    let dbo = null;
    return new Promise( (resolve, reject) => {
      mongodb.MongoClient.connect(url, (err, db) => {
        if (err) {
          console.log("MongoDB Connection Error:", err);
          reject(err);
        }
        dbo = db.db("zooq");
        return resolve({dbo: dbo});

        // create services collection (IF NOT EXISTS)
        dbo.createCollection("services", (err, result) => {
          if (err) {
            return console.log(err);
          }
        });
          // create staff collection (IF NOT EXISTS)
        dbo.createCollection("staff", (err, result) => {
          if (err) {
            return console.log(err);
          }
        });
          // create q collection (IF NOT EXISTS)
        dbo.createCollection("q", (err, result) => {
          if (err) {
            return console.log(err);
          }
        });
      });
    });
  }
  return function() {
    return {
      run: () => {
        return $run();
      }
    }
  }
})();
// exports...
module.exports = mongoDB;
