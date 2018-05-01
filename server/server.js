var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var fs = require('fs')
var util = require('util');
var exec = util.promisify(require('child_process').exec);

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

async function ls() {
  const { stdout, stderr } = await exec('ls -lrt');
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}

async function rm() {
  console.log('Removing old folder!')
  const { stdout, stderr } = await exec('rm -rf ./../../polyrnn/test/*');
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}

async function mkdir() {
  console.log('Creating new folder!')
  const { stdout, stderr } = await exec('mkdir .\\..\\..\\polyrnn\\test');
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}

async function copyFile(filename) {
  file_path = './../src/img_vid1/'+ filename
  new_path = './../../polyrnn/test/'+filename	
  console.log('Copying File!')
  //const { stdout, stderr } = await exec('echo '+ file_path);
  const { stdout, stderr } = await exec('cp -p '+ file_path + ' ' + new_path);
  //console.log('stdout:', stdout);
  //console.log('stderr:', stderr);
}

async function runInference() {
  console.log('Running Inference!')
  const { stdout, stderr } = await exec('bash ./../../polyrnn/src/demo_inference.sh');
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}

app.post('/send', function(req,res) {
	console.log(__dirname+'/log.json')
	var file_contents = fs.readFileSync(__dirname+'/log.json','utf8')
	var text = JSON.parse(file_contents)

	var wstream = fs.createWriteStream(__dirname+'/log.json', {flags: 'w'})
         .on('finish', function() {
             console.log("Write Finish.");
          })
         .on('error', function(err){
             console.log(err.stack);
          });

    console.log(file_contents)

    // Get sent data
	data = req.body
	// Push sent data to existing JSON object
	text.push(data)
	// data.forEach(function(v) {
	// 	v['pic'] = req.body.pic 
	// 	wstream.write(JSON.stringify(v) + ',' + '\n'); 
	// });

	// Delete previous test directory contents
	rm()

	// Recreate new directory
	//mkdir()

	// Copy the image data to the required folder
	copyFile(data.pic);

	// Run the model on the file in the test folder
	runInference();

	console.log(text)
	wstream.write(JSON.stringify(text)); 
	wstream.end()

	res.send('Done!');

})

app.listen(3001, function() {
	console.log('listening on port 3001')
}) 

