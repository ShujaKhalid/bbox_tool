//367503075004133972
//Latest
import React, { Component } from 'react';
import logo from './logo.svg';
import axios from 'axios';
import './App.css';
import Draggable from 'react-draggable'; // Both at the same time
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'

// import data from './filenames.json';
// const meme = requireAll(require.context('./img_vid1/', false, /\.jpg/));
// console.log(meme)
const allFiles = (ctx => {
	let keys = ctx.keys();
	let values = keys.map(ctx);
	//return keys.reduce((o, k, i) => { o[k] = values[i]; return o; }, {});
	return values
})(require.context('./img_vid1/', true, /.jpg/));

const allKeys = (ctx => {
	let keys = ctx.keys();
	return keys
})(require.context('./img_vid1/', true, /.jpg/));

//---------------------------------------
//The top level of the app starts here! -
//---------------------------------------
///

class App extends Component {
  constructor(props) {
	super(props)
	//console.log(img)
	this.state = {
	  lastClick: [],
	  x: -1,
	  y: -1,
	  w: -1,
	  h: -1,
	  bboxes: [],
	  maskP: [],
	  ind: 0,
	  currImg: allFiles[0],
	  currKey: allKeys[0],
	  activeDrags: 0,
	  deltaPosition: [],
	  defaultPosition: [[],[],[],[],[],[],[],[],[],[]], // Each subarray corresponds to a mask
									  // Max 10 subarrays for now
	  controlledPosition: {
		x: 0, y: 0
	  },
	  children: [],
	  maskInd: -1,
	  resClass: [],
	  resCoords: [],
	  header: [],
	  segClass: [[],[],[],[],[],[],[],[],[],[]],
	  localKey: -1, // potential draggable element 
	  globalKey: 0,      
	  currLocalKey: 0, // potential draggable element 
	  currGlobalKey: 0,
	  //console.log('Inside dispResult!')
	  header: [
		<tr key={0}>
		  <th>No. </th>
		  <th>Coord. X</th>
		  <th>Coord. Y</th>
		</tr>
	  ],
	}
  }

  onSelected = (rect) => {
	if (!rect==0) { 	
		this.state.bboxes.push(rect)
		this.state.lastClick.push('rec')  		
	}
  };

  /// Called when the canvas is double clicked
  // - Redraws all of the vertices dynamically
  onMaskP = (maskVars) => {
	this.state.maskP.push(maskVars)
	this.state.lastClick.push('arc')
	var children = this.state.children
	var deltaPosition = this.state.deltaPosition
	var defaultPosition = this.state.defaultPosition
	var dragHandlers = {onStart: this.onStart, onStop: this.onStop};
	var cirRad = 4 // Radius of the circular vertex (Adjusted in css file)
	var offsetX = cirRad
	var offsetY = cirRad+337 //Hard coded for now
	var controlledPosition = []
	var i = this.state.maskP.length-1
	//console.log(this.props.height)

	// Corrected positions to account for the circles being 
	// placed below the canvas   
	deltaPosition.push({
	  x: this.state.maskP[i].x-offsetX, y: this.state.maskP[i].y-offsetY-2*cirRad*this.state.maskP[i].maskInd
	});

	// Positions that are correct with respect to the canvas axes
	controlledPosition = {
	  x: this.state.maskP[i].x, y: this.state.maskP[i].y,
	};

	// Assign the unique identifier here
	const key = this.state.maskP[i].maskInd
	console.log('key: '+key)

	// Set the state here to re-render the DOM
	this.setState({
	  deltaPosition: deltaPosition,
	  //defaultPosition: defaultPosition, // This is now being done outside of the loop
	  controlledPosition: controlledPosition,
	  maskInd: key,
	  localKey: this.state.localKey+1,
	})

	children.push(<Draggable key={key} defaultPosition={{x: this.state.deltaPosition[key].x, y:this.state.deltaPosition[key].y}} onDrag={this.handleDrag} {...dragHandlers}>
		<div id='circle' gkey={this.state.globalKey} lkey={this.state.localKey} ></div>
	</Draggable>)

	// Add the new state of the last circle here)
	//console.log(this.state.defaultPosition)
	this.state.defaultPosition[this.state.globalKey].push(this.state.maskP[i]) 

	// Make the component re-render
	this.setState({
	  children: children,
	  deltaPosition: deltaPosition,
	})

	// Display the results
	this.dispResult()

  }

  denote = (e) => {
	var gKey = e.srcElement.getAttribute('gkey') // global key
	var lKey = e.srcElement.getAttribute('lkey') // local key
	this.setState({
		currGlobalKey: parseInt(gKey),
		currLocalKey: parseInt(lKey),
	})
	//console.log('|||||||||denoting...')
	//console.log('Global key: ' + this.state.currGlobalKey)
	//console.log('Tracking key: ' + this.state.currLocalKey)

  }

  handleDrag = (e, ui) => {

	const key = this.state.localKey
	if (key!==undefined) {
		console.log('~~~~~~~~~dragging...')
		console.log('Global key: ' + this.state.currGlobalKey)
		console.log('Tracking key: ' + this.state.currLocalKey)
		const {x, y} = this.state.defaultPosition[this.state.currGlobalKey][this.state.currLocalKey];
		const defaultPosition = this.state.defaultPosition
		defaultPosition[this.state.currGlobalKey][this.state.currLocalKey].x = x + ui.deltaX
		defaultPosition[this.state.currGlobalKey][this.state.currLocalKey].y = y + ui.deltaY

		this.setState({
		  defaultPosition: defaultPosition,
		  controlledPosition: {
			x: defaultPosition[this.state.currGlobalKey][this.state.currLocalKey].x,
			y: defaultPosition[this.state.currGlobalKey][this.state.currLocalKey].y,
		  }
		});

		this.dispResult()

	}


  }

  refresh = () => {
	this.setState({
	  selected: true,
	  bboxes: [],
	  children: [],
	  result: [],
	  resCoords: [],
	  lastClick: [],
	  localKey: -1,
	  globalKey: 0,
	  maskInd: -1,
	  deltaPosition: [],
	  defaultPosition: [[],[],[],[],[],[],[],[],[],[]],
	  segClass: [[],[],[],[],[],[],[],[],[],[]],
	})
  };

  undo = () => {
	if (this.state.lastClick[this.state.lastClick.length-1]==='rec') {
	  this.state.bboxes.pop()
	  this.state.resCoords.pop()
	  this.state.lastClick.pop()
	  this.setState(this.state)
	} else if (this.state.lastClick[this.state.lastClick.length-1]==='arc') {
	  this.state.children.pop()
	  this.state.maskP.pop()
	  this.state.deltaPosition.pop()
	  this.state.defaultPosition[this.state.globalKey].pop()
	  this.setState({
	  	maskInd: this.state.maskP.length-1,
	  })
	  this.state.resCoords.pop()

	  // Modify the localKey and/or the globalKey
	  if (this.state.localKey===-1) {
		if (this.state.globalKey>0) {
		  console.log('globalKey>0')
		  this.setState({
		  	globalKey: this.state.globalKey-1,
		  	localKey: this.state.defaultPosition[this.state.globalKey].length,
		  })
		}
	  } else {
		console.log('loclKey!=0')
	  	if (this.state.localKey>-1) {
	  	  this.setState({
	  	  	localKey: this.state.defaultPosition[this.state.globalKey].length-2,
	  	  })
	  	}
	  }

	  console.log(this.state.defaultPosition)
	  console.log(this.state.defaultPosition[this.state.globalKey])
	  console.log('localKey: '+this.state.localKey)
	  console.log('globalKey: '+this.state.globalKey)

	  this.state.lastClick.pop()
	}

	this.dispResult()
	//console.log(this.state.lastClick)
	//console.log(this.state.defaultPosition)
	//console.log(this.state.resCoords)
	//console.log(this.state.maskP)
	//console.log(this.state.maskInd)
	//console.log('Undoneing has been done!')
  };

  next = () => {
	// Check to see if the class information has been 
	// entered
	return this.save()  

  }

  // Move to the previous image (data will have to be redrawn)
  // TODO - Use unique tag to reload data
  prev = () => {
	if (this.state.ind-1>=0) {
	  this.setState({
		ind: this.state.ind-1,
		currImg: allFiles[this.state.ind-1],
		currKey: allKeys[this.state.ind-1],
	  });
	  console.log('Previous Image')   
	} else {
	  window.alert('First image reached!')
	}
  };

  switch = () => {
		//console.log('Inside switch!')
		// Check to see if you can move to the next image
		if (this.state.ind+1<allFiles.length) {
			this.setState({
				ind: this.state.ind+1,
				currImg: allFiles[this.state.ind+1],
				currKey: allKeys[this.state.ind+1],
			});
			//console.log(allFiles[this.state.ind])
			//console.log(allKeys[this.state.ind])
			//console.log('Next Image')      
		} else {
			window.alert('Last image reached!')
		}

  }

  checks = () => {
  		// Checks
		for (let i=0; i<this.state.globalKey+1; i++) {
			// The checks only matter if there is a mask
			// i.e. if there is no mask, still send the information through
			if (this.state.defaultPosition[i].length>0) {
				var valClass = this.state.segClass[i]

				// Must have atleast globalKey+1 non-null 
				// values in the array 
				if (valClass.length===0) {
					return 'classMiss';
				};
			};

			// DISABLED AS IT IS NOT REQUIRED FOR MASK-RCNN
			// var valBbox = this.state.bboxes
			// // Check to see if there are atleast globalKey+1 bboxes
			// if (valBbox.length!==this.state.globalKey+1) {
			// 	return 'bboxMiss';
			// };
		};

		console.log('checks passed!')
		return 'keepMoving'
  }

  // Save the results to the server
  save = () => {
	  const data = {pic: this.state.currKey, bbox: this.state.bboxes, mask: this.state.defaultPosition, class: this.state.segClass}
	  console.log(data)

	  // Make the POST request using axios
	  return axios({method: 'post',
		   url: 'http://localhost:3001/send',
		   data: data,
		   config: {headers: {'Content-Type': 'json' }}
		   }).then(response => {

				// Switch to the next image
				this.switch()
				// Refresh the bbox array
				this.refresh()
				// Display the result
				this.dispResult()

				return 'allSystemsGo'

		  }).catch(function (error) {
			//console.log(error);
			confirmAlert({
					title: 'Connection error...',
					message: 'Make sure the data server is running on port 3001',
					buttons: [
						{
						  label: 'Go Back',
						  onClick: () => console.log('Going back...'),
						}
					]
				});
			return 'mayDay'
		  });
  }

  // Display the coordinates on the webpage
  // (DEPRACATED)
  getSelectionStr = () => {
	if (this.state.selected) {
	  const state = this.state
	  return `x: ${state.x}, y: ${state.y}, w: ${state.w}, h: ${state.h}`
	}
	return 'No Selection';
  }

  // For switching classes (Can't add points to the old class)
  onEnterDown = () => {
	this.setState({
		globalKey: this.state.globalKey+1,
		localKey: -1, // global key gets incremented and local key is reset
	})
  }

  // Update the table with coordinate/class information
  dispResult = () => {
	var resCoords = []
	var resClass = []
	var clr = ""
 	//console.log(this.state.globalKey)
 	//console.log(this.state.defaultPosition)
	for (var j=0; j<=this.state.globalKey; j+=1) {
		
		if (j==0) {
			clr="#85C1E9"
		} else if (j==1) {
			clr="#99A3A4"
		} else if (j==2) {
			clr="#A569BD"
		} else if (j==3) {
			clr="##F1948A"
		}

		for (var i=0; i<this.state.defaultPosition[j].length; i+=1) {
			resCoords.push(
			<tr bgcolor={clr} key={j*(this.state.defaultPosition[j].length-1)+i}>
			  <td>{j+1}</td>
			  <td>{this.state.defaultPosition[j][i].x}</td>
			  <td>{this.state.defaultPosition[j][i].y}</td>
			</tr>
		)};
	
		if (this.state.defaultPosition[j].length>0) {
			var hgt = (16+(19)*this.state.defaultPosition[j].length).toString() + "px" // very crude approximation 
			resClass.push(
			  <tr bgcolor={clr} height={hgt}>	
				<select background="rgba(0,0,0,0.3)" className={j} onChange={this.classify}>
				  <option value="0"> - </option>
				  <option value="1"> Grasper </option>
				  <option value="2"> Bipolar </option>
				  <option value="3"> Hook </option>
				  <option value="4"> Scissors </option>
				  <option value="5"> Clipper </option>
				  <option value="6"> Irrigator </option>
				  <option value="7"> Specimen Bag </option>
				</select>
			  </tr>
			);
		};
	};

	/// Set the state here
	this.setState({
		resCoords: resCoords,
		resClass: resClass,
	})

  }

  classify = (e) => {
	// Create a temporary variable
	var segClass_temp = this.state.segClass

	// Find the specific "select" list and extract the target value from it
	segClass_temp[e.target.classList.value] = e.target.value

	// Set the state of the segClass variable
	this.setState({
		segClass: segClass_temp,
	})

  }

  render() {
	return (
	  <div className="App">
		<header className="App-header">
		  <img src={logo} className="App-logo" alt="logo" />
		  <h1 className="App-title">React Project</h1>
		</header>
		<p className="App-intro">
		  To get started, draw bounding boxes on the image!
		</p>
		<ImgPic checks={this.checks} switch={this.switch} maskInd={this.state.maskInd} onEnterDown={this.onEnterDown} bb={this.state.bboxes} denote={this.denote} dispResult={this.dispResult} polyP={this.state.defaultPosition} total={allFiles.length} current={this.state.ind+1} width="596" height="334" frame={this.state.currImg} onSelected={this.onSelected} next={this.next} prev={this.prev} refresh={this.refresh} undo={this.undo} save={this.save} onMaskP={this.onMaskP}>
		  {this.state.children}
		</ImgPic>
		<SegTable resCoords={this.state.resCoords} resClass={this.state.resClass} header={this.state.header}>
		</SegTable>
	  </div>
	);
  }
}

//// Here is the display table component
class SegTable extends Component {

	render() {
	  	const options = [
	  	'one', 'two', 'three'
		]

		const defaultOption = options[0]

		//console.log('Inside Segtable')
		return (
			<div className="SegTable">
			  <table border="1" align='center'>
			   <td>
				<table border="1" align='center'>
				  <thead>
					{this.props.header}
				  </thead>
				  <tbody>
					{this.props.resCoords}
				  </tbody>
				</table>
			   </td>
			   <td>
				 <table width="auto" height="auto" border="1" align='center'>
				  <thead>
				   <th>Tool</th>
				  </thead>
				  <tbody>
				    <tr text-align="center">
					  {this.props.resClass}
					</tr>
				  </tbody>
				 </table>
			   </td>
			  </table>
			</div>
		)
	}

}


/// Here is the lower level component (Canvas)
class ImgPic extends Component {
  static defaultProps = {
	width: 320,
	height: 200,
	strokeStyle: '#F00',
	lineWidth: 1,
	onSelected: () => {},
	children: [],
  };

  constructor(props) {
	super(props)
	this.state = {
	  selected: false,
	  x: -1,
	  y: -1,
	  w: -1,
	  h: -1,
	  maskInd: -1,
	}
  }

  startX = -1;
  startY = -1;
  curX = -1;
  curY = -1;
  isDragRect = false;
  isDragPoly = false;
  ctx = null;
  canvas = null;
  base_image = null;

  componentDidMount(props) {
	this.ctx = this.canvas.getContext('2d')
	this.ctx.strokeStyle = this.props.strokeStyle
	this.ctx.lineWidth = this.props.lineWidth
	this.base_image = new Image()
	this.base_image.src = this.props.frame
	this.base_image.onload = () => this.ctx.drawImage(this.base_image,0,0)
	// double click for making new Shapes
	this.canvas.addEventListener('dblclick', this.annotate, false);
	this.addMouseEvents()
  }

  handleDrag = (e, ui) => {
	const {x, y} = this.state.deltaPosition;
	this.setState({
	  deltaPosition: {
		x: x + ui.deltaX,
		y: y + ui.deltaY,
	  }
	});
  }

  onStart = () => {
	this.setState({activeDrags: this.state.activeDrags+2});
  }

  onStop = () => {
	this.setState({activeDrags: this.state.activeDrags-2});
  }

  // For controlled component
  adjustXPos = (e) => {
	console.log('adjusting X')
	e.preventDefault();
	e.stopPropagation();
	const {x, y} = this.state.controlledPosition;
	this.setState({controlledPosition: {x: x - 10, y}});
  }

  adjustYPos = (e) => {
	console.log('adjusting Y')
	e.preventDefault();
	e.stopPropagation();
	const {controlledPosition} = this.state;
	const {x, y} = controlledPosition;
	this.setState({controlledPosition: {x, y: y - 10}});
  }

  onControlledDrag = (e, position) => {
	console.log('dragging')
	const {x, y} = position;
	this.setState({controlledPosition: {x, y}});
  }

  onControlledDragStop = (e, position) => {
	console.log('stop dragging')
	this.onControlledDrag(e, position);
	this.onStop();
  }

  reviveCanvas = () => {
	this.ctx.clearRect(0, 0, this.props.width, this.props.height)
	this.base_image = new Image()
	this.base_image.src = this.props.frame
	this.base_image.onload = () => {
	  this.ctx.drawImage(this.base_image,0,0)
	}   
  }

  updateCanvas = () => {

	if (this.isDragRect || this.isDragPoly) {
	  requestAnimationFrame(this.updateCanvas)
	}

	if (!this.isDirty) {
	  return
	}

	this.ctx.clearRect(0, 0, this.props.width, this.props.height)
	this.base_image = new Image()
	this.base_image.src = this.props.frame

	// Draw the base image
	this.ctx.drawImage(this.base_image,0,0)
	
	// Sketch all of the previously created rectangles
	for (let i=0; i<this.props.bb.length; i++) {
	  this.ctx.beginPath();
	  this.ctx.strokeStyle = "rgb(200,0,0)";
	  this.ctx.strokeRect(this.props.bb[i].x, this.props.bb[i].y, this.props.bb[i].w, this.props.bb[i].h)
	}

	if (this.isDragRect) {      
	  const rect = {
		x: this.startX,
		y: this.startY,
		w: this.curX - this.startX,
		h: this.curY - this.startY,
	  }

	  // Sketch an additional rectangle
	  if (0<this.startX<this.props.width && 0<this.startY<this.props.height) {
		  console.log('sketching!')
		  this.ctx.beginPath();
		  this.ctx.strokeStyle = "rgb(200,0,0)";
		  this.ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)  
	  }  
	}

	if (this.isDragPoly || this.isDragRect) {
	  //console.log('Inside update canvas!') 
	  //console.log(this.props.polyP)
	  for (let j=0; j<this.props.polyP.length; j++) {
		  this.ctx.beginPath();

		  for (let i=0; i<this.props.polyP[j].length; i++) {
			this.ctx.lineTo(this.props.polyP[j][i].x, this.props.polyP[j][i].y)
		  }

		  // To avoid getting into an infinite loop when the undo button
		  // is pressed      
		  if (this.props.polyP[j][0]!==undefined) {
			this.ctx.lineTo(this.props.polyP[j][0].x, this.props.polyP[j][0].y)
		  }
		  
		  if (j==0) {
			this.ctx.strokeStyle = "#85C1E9";
			this.ctx.fillStyle = "rgba(133,193,233,0.5)";
		  } else if (j==1) {
			this.ctx.strokeStyle = "#99A3A4";
			this.ctx.fillStyle = "rgba(153,163,164,0.5)";
		  } else if (j==2) {
			this.ctx.strokeStyle = "#A569BD";
			this.ctx.fillStyle = "rgba(187,143,206,0.5)";
		  } else if (j==3) {
			this.ctx.strokeStyle = "##F1948A";
			this.ctx.fillStyle = "rgba(22,160,133,0.5)";
	      }

		  this.ctx.stroke();
		  this.ctx.fill()
		  this.ctx.closePath()
	  }
	  //this.isDragPoly = false
	}

	this.isDirty = false

  };
 
  componentWillUnmount = () => {
	this.removeMouseEvents()
  }

  addMouseEvents = () => {
	document.addEventListener('mousedown', this.onMouseDown, false);
	document.addEventListener('mousemove', this.onMouseMove, false);
	document.addEventListener('mouseup', this.onMouseUp, false);
	document.addEventListener('keydown', this.onKeyDown, false);
  }

  removeMouseEvents = () => {
	document.removeEventListener('mousedown', this.onMouseDown, false);
	document.removeEventListener('mousemove', this.onMouseMove, false);
	document.removeEventListener('mouseup', this.onMouseUp, false);
	document.removeEventListener('keydown', this.onKeyDown, false);
  }

  save = () => {
	console.log('Saving!')
	// Write/append filepath of image to a file here
	this.props.save()
  };

  prev = () => {
	// Write/append filepath of image to a file here
	this.props.prev()
	// Refresh the bbox array
	this.props.refresh()
	// Update the canvas
	this.isDirty = true
	requestAnimationFrame(this.reviveCanvas) 
  };

  next = () => {
	confirmAlert({
	  title: 'Switch to next frame?',
	  message: 'Data will be written to server',
	  buttons: [
		{
		  label: 'Yes',
		  onClick: () => {
   			  var status = this.props.checks()
   			  console.log(status)
   			  if (status=='keepMoving') {
				  this.props.next()
				  .then((resVar) => {
					  if (resVar==='allSystemsGo') {
						// Refresh the bbox array
						//this.props.refresh()
						// Update the canvas
						this.isDirty = true
						requestAnimationFrame(this.reviveCanvas) 	
					  } else if (resVar==='classMiss') {
						confirmAlert({
							title: 'Please specify reqd. class information',
							message: '',
							buttons: [
								{
								  label: 'Go Back',
								  onClick: () => console.log('Going back...'),
								}
							]
						});
					  } else if (resVar==='bboxMiss') {
						confirmAlert({
							title: 'Please specify correct no. of bounding boxes',
							message: '',
							buttons: [
								{
								  label: 'Go Back',
								  onClick: () => console.log('Going back...'),
								}
							]
						});
					  } else if (resVar==='mayDay') {
						console.log('mayDay! mayDay!')
					  }
				  })
				};
		    }
		},
		{
		  label: 'No',
		  onClick: () => console.log('Click No')
		}
	  ]
	});
  };

  refresh = () => {
	console.log('Refreshing!')
	// Refresh the bbox array
	this.props.refresh()
	// Update the canvas
	this.isDirty = true
	requestAnimationFrame(this.updateCanvas) 
  };

  undo = () => {
	console.log('Undo!')
	// Refresh the bbox array
	this.props.undo()
	// Update the canvas
	this.isDirty = true
	this.isDragPoly = true
	requestAnimationFrame(this.updateCanvas) 
  };

  onKeyDown = (e) => {
	console.log(e.key)
	if (e.key === 'Enter') {
		console.log('Enter Pressed!!!')	
		this.props.onEnterDown()
	}   	
  }

  onMouseDown = (e) => {
	this.curX = this.startX = e.offsetX
	this.curY = this.startY = e.offsetY

	if (e.target.tagName==='CANVAS') {
	  console.log('RECT is true')
	  this.isDragRect = true
	  requestAnimationFrame(this.updateCanvas)
	} else if (e.target.id==='circle') {
	  console.log('POLY is true')
	  this.isDragPoly = true
	  this.props.denote(e)
	  requestAnimationFrame(this.updateCanvas)
	}

  };

  onMouseMove = (e) => {
	//console.log('MOVINGGGGGGG')
	if ( this.isDragRect===this.isDragPoly ) return
	this.curX = e.offsetX
	this.curY = e.offsetY
	this.isDirty = true
	//console.log(this.curX)
  };
  
  onMouseUp = (e) => {
	this.isDragRect = false
	this.isDragPoly = false
	this.isDirty = false
	
	const rect = {
	  x: Math.min(this.startX, this.curX),
	  y: Math.min(this.startY, this.curY),
	  w: Math.abs(e.offsetX - this.startX),
	  h: Math.abs(e.offsetY - this.startY),
	}

	let w = this.curX - this.startX
	let h = this.curY - this.startY
	if (e.target.tagName==='CANVAS' && w>0 && h>0) {
	  //console.log('updating coordinates!')
	  this.props.onSelected(rect)
	  requestAnimationFrame(this.updateCanvas)
	}

  };

  annotate = (e) => {

	// Update the canvas
	// this.setState({
	//   x: Math.min(this.startX, this.curX),
	//   y: Math.min(this.startY, this.curY),
	//   maskInd: this.props.maskInd+1,
	// })

	const maskVars = {
	  x: Math.min(this.startX, this.curX),
	  y: Math.min(this.startY, this.curY),
	  maskInd: this.props.maskInd+1,
	}
	//console.log('before trigger!!!!!!!!!!!!!!!!!')
	//console.log(maskVars)
	this.props.onMaskP(maskVars)

	// Create mask using polygon points here
	//const polyP = this.props.polyP
	//console.log('inside annotate: ' + polyP)
	this.isDirty = true
	this.isDragPoly = true

	if (e.target.tagName==='CANVAS') {
	  requestAnimationFrame(this.updateCanvas)
	}

	if (this.state.defaultPosition!==undefined) {
		this.props.dispResult()
	}

	// For tracking usage (Not a rectangle
	this.props.onSelected(0)

  };

  render() {
	return (
	  <div className="ImgPic">
		<div>
		  <table align='center'>
			<tbody>
			  <tr>
				  <td>
					<button onClick={this.save}>Save</button>
					<button onClick={this.refresh}>Refresh</button>
				<button onClick={this.undo}>Undo</button>
			  </td>
			</tr>
			<tr>
			  <td>
				<button onClick={this.prev}>Prev</button>
				<button onClick={(e) => {this.next(e)}}>Next</button>
				  </td>
				</tr>
			  </tbody>
			</table>
		  </div>
	  <div>
		{this.props.current}/{this.props.total}
	  </div>
		<div style={{margin:'auto', width:this.props.width+'px', height:this.props.height+'px'}}>
		  <canvas width={this.props.width} height={this.props.height} ref={(c) => {this.canvas=c}}/>
		  <div>
		  {this.props.children}
		  </div>
		</div>
	  </div>
	)
  }
}
export default App;


