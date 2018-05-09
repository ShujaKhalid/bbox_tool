var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var fs = require('fs')
var util = require('util');
var exec = util.promisify(require('child_process').exec);
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/SST";

app.use(bodyParser.json())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// async function ls() {
//   const { stdout, stderr } = await exec('ls -lrt');
//   console.log('stdout:', stdout);
//   console.log('stderr:', stderr);
// }

// async function rm() {
//   console.log('Removing old folder!')
//   const { stdout, stderr } = await exec('rm -rf ./../../polyrnn/test/*');
//   console.log('stdout:', stdout);
//   console.log('stderr:', stderr);
// }

// async function mkdir() {
//   console.log('Creating new folder!')
//   const { stdout, stderr } = await exec('mkdir .\\..\\..\\polyrnn\\test');
//   console.log('stdout:', stdout);
//   console.log('stderr:', stderr);
// }

// async function copyFile(filename) {
//   file_path = './../src/img_vid1/'+ filename
//   new_path = './../../polyrnn/test/'+filename	
//   console.log('Copying File!')
//   //const { stdout, stderr } = await exec('echo '+ file_path);
//   const { stdout, stderr } = await exec('cp -p '+ file_path + ' ' + new_path);
//   //console.log('stdout:', stdout);
//   //console.log('stderr:', stderr);
// }

// async function runInference() {
//   console.log('Running Inference!')
//   const { stdout, stderr } = await exec('bash ./../../polyrnn/src/demo_inference.sh');
//   console.log('stdout:', stdout);
//   console.log('stderr:', stderr);
// }

app.get('/checkexp', function(req, res) {
	// console.log(res)
	// console.log('------------------------------------------------------------------')
	// console.log(res)
	res.send('Done!')
})

app.get('/checkdb', function(req, res) {
	// console.log(res)
	// console.log('------------------------------------------------------------------')
	// console.log(res)
	MongoClient.connect(url, function(err, db) {
		var dbo = db.db("SST");
		//var myquery = { pic: /^./ };
		var myquery = { pic: /^f/ };
		//var myquery = { pic: null };

		// Check to see if there are any errors
	    if (err) {
	  	    throw err;
	  	    res.send(err);
	    } else {
		    res.send("Database exists!")
	    }

		// Display the contents of the database
	 	dbo.collection("imageData").find({}).toArray(function(err, result) {
		    if (err) throw err;
		    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
		    console.log(result)
			db.close();
		});

		// // Delete the contents of the database
	 //    dbo.collection("imageData").deleteMany(myquery, function(err, result) {
		//     if (err) throw err;
		//     console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
		//     console.log('No. of items deleted: '+result.result.n)
		// 	db.close();
		// });

	});
})

// Write to the Mongo database
app.post('/writedb', function(req,res) {

	// MongoDB initialization
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;

	  // Get sent data
	  var data = req.body
	  var dbo = db.db("SST");

	  // Create the collection if it does not already exist
	  dbo.createCollection("imageData", function(err, res) {
	    if (err) throw err;

	    // Insert the new image data into the database
        dbo.collection("imageData").findAndModify(
        	{pic: data.pic},
        	[['_id','asc']],  // sort order
       		{$setOnInsert: {bbox: data.bbox, mask: data.mask, class: data.class, status: data.status}}, 
        	{new: true,	upsert: true}, 
    		function(err, res) {
		        if (err) throw err;
		        console.log("1 document inserted");
		        db.close();
	    	});

	    });

	}); 

	res.send('Done!');

})

// Write to the Mongo database
app.post('/readdb', function(req,res) {

	// MongoDB initialization
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;

	  // Get sent data
	  var dbo = db.db("SST");
	  var pic = req.body['pic'];

      // Display the contents of the database
 	  dbo.collection("imageData").find({pic: pic}).toArray(function(err, result) {
	    if (err) throw err;
	    if (result.length > 0) console.log('Result found!');
	    if (result.length > 0) console.log(result);
	    res.send(result);
		db.close();
	  });

	})
})

// Write to the Mongo database
app.post('/updatedb', function(req,res) {

	// MongoDB initialization
	MongoClient.connect(url, function(err, db) {
	    if (err) throw err;

	    // Get sent data
	    var data = req.body
	    var dbo = db.db("SST");
	    var myquery = {filename: ""};  
	    var newvalues = { $set: {name: "", address: ""}}
	 
	    // Insert the new image data into the database
	    dbo.collection("imageData").updateOne(data, function(err, res) {
	      if (err) throw err;
	      console.log("1 document inserted");
	      db.close();
	    });
	}); 

	res.send('Updated Collection \'imageData\' in SST!');

})

// Write the data to a json file
app.post('/send', function(req,res) {
	//console.log(__dirname+'/log.json')
	var file_contents = fs.readFileSync(__dirname+'/log.json','utf8')
	var text = JSON.parse(file_contents)

	var wstream = fs.createWriteStream(__dirname+'/log.json', {flags: 'w'})
         .on('finish', function() {
             console.log("Write Finish.");
          })
         .on('error', function(err){
             console.log(err.stack);
          });

    //console.log(file_contents)

    // Get sent data
	data = req.body
	// Push sent data to existing JSON object
	text.push(data)
	// data.forEach(function(v) {
	// 	v['pic'] = req.body.pic 
	// 	wstream.write(JSON.stringify(v) + ',' + '\n'); 
	// });

	// Delete previous test directory contents
	//rm()

	// Recreate new directory
	//mkdir()

	// Copy the image data to the required folder
	//copyFile(data.pic);

	// Run the model on the file in the test folder
	//runInference();

	//console.log(text)
	wstream.write(JSON.stringify(text)); 
	wstream.end()

	res.send('Done!');

})

app.listen(3001, function() {
	console.log('listening on port 3001')
}) 

