var MongoClient = require('mongodb').MongoClient;
//var url = "mongodb://localhost:27017/SST";
var url = "mongodb://mongo-server:27017/SST";
var fs = require('fs')

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("SST");
  dbo.collection("imageData").find({}).toArray(function(err, result) {
    if (err) {
      //throw err;
      console.log('Can\'t connect to database...')
    }
    console.log(result.length);

    // Write the result to a database
    var filename = __dirname+'/backup/log_db_'+new Date().toISOString()+'.json'
  	var wstream = fs.createWriteStream(filename, {flags: 'w'})
       .on('finish', function() {
          console.log("Write Finish.");
        })
       .on('error', function(err){
           console.log(err);
           console.log(err.stack);
        });

      wstream.write(JSON.stringify(result)); 
  	  wstream.end()

  	//db.close();

    });

});