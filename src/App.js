import React, { Component } from 'react';
import logo from './logo.svg';
import matte from './matte.jpg';
import axios from 'axios';
import "typeface-roboto";
import './App.css';
import Draggable from 'react-draggable'; // Both at the same time
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import {
  AwesomeButton,
  AwesomeButtonProgress,
  AwesomeButtonShare,
} from 'react-awesome-button';
import styles from 'react-awesome-button/dist/styles.css';
import 'react-awesome-button/dist/themes/theme-blue.css';
import ReactTable from "react-table";
import 'react-table/react-table.css'

// import data from './filenames.json';
const allFiles = (ctx => {
	let keys = ctx.keys();
	let values = keys.map(ctx);
	//return keys.reduce((o, k, i) => { o[k] = values[i]; return o; }, {});
	return values
})(require.context('./img_vid1/', true, /.jpg/));

// Get key information
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

  	// Get the data from the database
	var data = []

	for (let i=0; i<allKeys.length; i++) {
	  var inst = {
			filename: '',
		  	status: '',
		  	class:'',
		  	mask:'',
	  }

	  // Conditions for displaying data in the table
	  inst.filename = allKeys[i].substring(2)
	  inst.status = 'Pending... 👀'
	  //console.log(data)
	  data.push(inst)
	}

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
	  serverState: '',
	  dbState: '',
	  //console.log('Inside dispResult!')
	  header: [
		<tr style={{fontFamily: 'Roboto', fontSize: 18+'px'}} key={0}>
		  <th style={{width: "150px"}}> <i style={{color: "white"}}>No.</i> </th>
		  <th style={{width: "150px"}}> <i style={{color: "white"}}>X</i> </th>
		  <th style={{width: "150px"}}> <i style={{color: "white"}}>Y</i> </th>
		</tr>
	  ],
	  data: data,
	}
  }

  ///
  componentDidMount() {
  	setInterval(this.serverCheck, 5000)
  	setInterval(this.dbCheck, 5000)
  	this.tableUpdate('all')
  }

  tableUpdate = (flag) => {
  	// Get the data from the database
	//var data = []
	console.log('6. Updating the table...')
	if (flag=='all') {
		for (let j=0; j<allKeys.length; j++) {
			let currKey = allKeys[j].substring(2)
	     	var body = {pic: currKey}
			var result = axios({
				method: 'post',
				data: body,
				url: 'http://localhost:3001/readdb',
				config: {headers: {'Content-Type': 'json'}},
		  	}).then(
		  		response => {
		  			var data = this.state.data
		  			// if (response.data.length>0) {
		  			// 	console.log(response)
		  			// }
		  		
					// --- Conditions for displaying data in the table ---
					if (response.data.length != 0) {
						// Complete is all of the requirements are met
						if (response.data[0].mask[0].length!=0 && response.data[0].class[0].length!=0) {
							data[j].status = 'Complete! 😊'
						} else {
							data[j].status = 'In Progress... ⏰'
						} 

						// Pending status if nothing has been done
						if (response.data[0].mask[0].length==0 && response.data[0].class[0].length==0) {
							data[j].status = 'Pending... 👀'
						}
						
						// Add class information here for the specific image
						if (response.data[0].class[0].length!=0) {
							//data[j].class = response.data[0].class
							var classes = []
							for (let i=0; i<=10; i++) {
								if (response.data[0].class[i].length!=0) {
									if (response.data[0].class[i]==1) {
										classes.push(' Stapler');
									} else if (response.data[0].class[i]==2) {
										classes.push(' Needle');
									} else if (response.data[0].class[i]==3) {
										classes.push(' Suction');
									} else if (response.data[0].class[i]==4) {
										classes.push(' Nathanson Retractor');
									} else if (response.data[0].class[i]==5) {
										classes.push(' Endo-Bag');
									} else if (response.data[0].class[i]==6) {
										classes.push(' Suture');
									} else if (response.data[0].class[i]==7) {
										classes.push(' Tip');
									} else if (response.data[0].class[i]==8) {
										classes.push(' Shaft');
									} else if (response.data[0].class[i]==9) {
										classes.push(' Bougie');
									} else if (response.data[0].class[i]==10) {
										classes.push(' Other');
									}
								} else {
									break;
								}
							}
							data[j].class = classes.toString()
						}
						
						// Add class information here for the specific image
						if (response.data[0].mask[0].length!=0) {
							var qty = 0
							for (let i=0; i<10; i++) {
								if (response.data[0].mask[i].length!=0) {
									qty += 1; 
								} else {
									break;
								}
								
							}
							data[j].mask = qty
						}

						this.setState({
							data: data,
						})
					}
					return Promise.resolve('Hello');
			  	}
		  	).catch(
		  		error => {
		  			console.log(error);
		  		}
		  	)
		}

	 } 

  } 


  frameUpdate = (key) => {
  		console.log(this.props.ind)
		let currKey = allKeys[key].substring(2)
     	var body = {pic: currKey}
		var result = axios({
			method: 'post',
			data: body,
			url: 'http://localhost:3001/readdb',
			config: {headers: {'Content-Type': 'json'}},
	  	}).then(
	  		response => {
	  			var data = this.state.data

	  			// Calculate the total no. of masks
				if (response.data[0].mask[0].length!=0) {
					var qty = 0
					for (let i=0; i<10; i++) {
						if (response.data[0].mask[i].length!=0) {
							qty += 1; 
						} else {
							break;
						}
						
					}
				}

				// Extract mask information here
				for (let j=0; j<qty; j++) {
				  this.setState({
				  	globalKey: j,
				  })
				  for (let i=0; i<response.data[0].mask[j].length; i++) {
				  	this.setState({
				  		localKey: i-1,
				  	})
					if (response.data[0].mask[j].length!=0) {
						this.onMaskP(response.data[0].mask[j][i]);
					} else {
						break;
					}
				  }
				}
				
				var classes = []
				// Extract class information here
				for (let i=0; i<response.data[0].class.length; i++) {
					if (response.data[0].class[i].length!=0) {
						classes.push(response.data[0].class[i])
					} else {
						break;
					}					
				}

				// Previously selected items from the drop down list are 
				// selected
				console.log(classes)
				for (let i=0; i<classes.length; i++) {
					var select = document.getElementById(i);
					select[classes[i]].selected = true
				}

				// Update the canvas
				this.imgpic.reviveCanvas()
				//this.imgpic.reloadCanvas()


			  	}
		  	).catch(
		  		error => {
		  			console.log(error);
		  		}
		  	)
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
	var offsetY = cirRad+720+4 // Hard coded for now
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
  	console.log('4. Refresh Complete!')
	this.setState({
	  selected: true,
	  bboxes: [],
	  children: [],
	  result: [],
	  resCoords: [],
	  resClass: [],
	  lastClick: [],
	  localKey: -1,
	  globalKey: 0,
	  maskInd: -1,
	  deltaPosition: [],
	  defaultPosition: [[],[],[],[],[],[],[],[],[],[]],
	  segClass: [[],[],[],[],[],[],[],[],[],[]],
	})

	this.imgpic.reviveCanvas()

	return Promise.resolve('Refresh Complete!');

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

  };

  next = () => {
	// Check to see if the class information has been 
	// entered
	//return this.save('next')

	// Switch to the next image
	this.switch(true, this.state.ind+1, 'next')
	
	// Refresh the bbox array
	this.refresh()
	//this.frameUpdate(this.state.ind+1)

	return Promise.resolve('Refresh Complete!')

  }

  // Move to the previous image (data will have to be redrawn)
  // TODO - Use unique tag to reload data
 //  prev = () => {
	// if (this.state.ind-1>=0) {
	//   this.setState({
	// 	ind: this.state.ind-1,
	// 	currImg: allFiles[this.state.ind-1],
	// 	currKey: allKeys[this.state.ind-1],
	//   });
	//   console.log('Previous Image')
	// } else {
	//   window.alert('First image reached!')
	// }
	// return this.save('prev')
 //  };

  // prev
  prev = () => {
  	// Switch to the next image
	this.switch(true, this.state.ind-1, 'prev')
	
	// Refresh the bbox array
	this.refresh()
	//this.frameUpdate(this.state.ind-1)

    return Promise.resolve('Hello');

  }


  switch = (flag, ind, state) => {
		console.log('3. Switching to the next screen!')

		// 'Forward' or 'Back'?
		if (state=='next') {
			// Switching to another image right away
			if (flag) {
			    // Stay on current image
				this.setState({
					ind: ind,
					currImg: allFiles[ind],
					currKey: allKeys[ind],
				});
			// Checking to see if some conditions are met (edge cases)
			} else {
				// Move to the net image if possible
				if (this.state.ind+1<allFiles.length) {
					this.setState({
						ind: this.state.ind+1,
						currImg: allFiles[this.state.ind+1],
						currKey: allKeys[this.state.ind+1],
					});  
				} else {
					window.alert('Last image reached!')
				}
			}
		} else if (state=='prev') {
			// Move to the net image if possible
			console.log(this.state.ind)
			if (this.state.ind-1>=0) {
				this.setState({
					ind: this.state.ind-1,
					currImg: allFiles[this.state.ind-1],
					currKey: allKeys[this.state.ind-1],
				});  
			} else {
				window.alert('First image reached!')
			}
		} else if (state=='stay') {
			// Stay on current image
			this.setState({
				ind: ind,
				currImg: allFiles[ind],
				currKey: allKeys[ind],
			});
		}

	  return Promise.resolve('Hello');

  }

  checks = () => {
  		// Checks
		for (let i=0; i<this.state.globalKey+1; i++) {
			// The checks only matter if there is a mask
			// i.e. if there is no mask, still send the information through

			// --- DISABLED FOR CURRENT VERSION ---
			// if (this.state.defaultPosition[i].length>0) {
			// 	var valClass = this.state.segClass[i]

			// 	// Must have atleast globalKey+1 non-null 
			// 	// values in the array 
			// 	if (valClass.length==0) {
			// 		return 'classMiss';
			// 	};
			// };

			// --- DISABLED AS IT IS NOT REQUIRED FOR MASK-RCNN ---
			// var valBbox = this.state.bboxes
			// // Check to see if there are atleast globalKey+1 bboxes
			// if (valBbox.length!==this.state.globalKey+1) {
			// 	return 'bboxMiss';
			// };
		};

		console.log('checks passed!')
		return 'keepMoving'
  }

  fileMarked = () => {
  	console.log('2. Marking the files!')
  	var temp = this.state.data

  	//temp[this.state.ind].status = 'Complete! 😊'
  	//console.log(temp[this.state.ind])

	// Complete is all of the requirements are met
	if (temp[this.state.ind].mask!=0 && temp[this.state.ind].class!="") {
		temp[this.state.ind].status = 'Complete! 😊'
	} else {
		temp[this.state.ind].status = 'In Progress... ⏰'
	} 

	// Pending status if nothing has been done
	if (temp[this.state.ind].mask==0 && temp[this.state.ind].class=="") {
		temp[this.state.ind].status = 'Pending... 👀'
	}

  	this.setState({
  		data: temp
  	})

  	return Promise.resolve('Complete!');

  }

  serverCheck = () => {
  	console.log('Running server check!')
  	var result = axios({
  		method: 'get',
  		url: 'http://localhost:3001/checkexp'
  	}).then(
  		response => {
  			let temp = []
  			console.log(response.status);
  			if (response.status==200) {
  				temp.push(
  					<div style={{fontFamily: 'Roboto', fontSize: 24+'px', backgroundColor: "#3498DB"}}>
					  		<b style={{color: "#21618C"}}>Server is up! \ (•◡•) / </b>
					</div>
		    	);
	  		}
	    	this.setState({
	    		serverState: temp,
	    	})
	  	}
  	).catch(
  		error => {
  			console.log(error);
  			let temp = []
  			temp.push(
  				<div style={{fontFamily: 'Roboto', fontSize: 24+'px', backgroundColor: "#A569BD"}}>
				  		<b style={{color: "#6C3483"}}>Server is down (ㆆ_ㆆ)</b>
				</div>
	    	);
	    	this.setState({
	    		serverState: temp,
	    	})
  		}
  	)
  }

  dbCheck = () => {
  	console.log('Running db check!')
  	var result = axios({
  		method: 'get',
  		url: 'http://localhost:3001/checkdb'
  	}).then(
  		response => {
  			let temp = []
  			//console.log(response);
  			if (response.status==200) {
  				temp.push(
  					<div style={{fontFamily: 'Roboto', fontSize: 24+'px', backgroundColor: "#F1C40F"}}>
					  		<b style={{color: "#21618C"}}>Database is up! \ (•◡•) / </b>
					</div>
		    	);
	  		}
	    	this.setState({
	    		dbState: temp,
	    	})
	  	}
  	).catch(
  		error => {
  			console.log(error);
  			let temp = []
  			temp.push(
  				<div style={{fontFamily: 'Roboto', fontSize: 24+'px', backgroundColor: "#A569BD"}}>
				  		<b style={{color: "#6C3483"}}>Database is down (ㆆ_ㆆ)</b>
				</div>
	    	);
	    	this.setState({
	    		dbState: temp,
	    	})
  		}
  	)
  }

  // Write to the database
  dbWrite = () => {
  	const data = {pic: this.state.currKey.substring(2), bbox: this.state.bboxes, mask: this.state.defaultPosition, class: this.state.segClass}
  	console.log('1. Saving the results to the database')
  	var result = axios({
  		method: 'post',
 	    data: data,
  		url: 'http://localhost:3001/writedb',
  		config: {headers: {'Content-Type': 'json'}}
  	}).then(
  		response => {
  			//console.log(response);
  			return Promise.resolve('Hello');
	  	}
  	).catch(
  		error => {
  			console.log(error);
  			return Promise.resolve('Hello');
  		}
  	)

	return Promise.resolve('Hello');

  }

  // Write to the database
  dbUpload = () => {
  	const data = {pic: this.state.currKey.substring(2), bbox: this.state.bboxes, mask: this.state.defaultPosition, class: this.state.segClass}
  	console.log('1. Saving the results to the database')
  	var result = axios({
  		method: 'post',
 	    data: data,
  		url: 'http://localhost:3001/writedb',
  		config: {headers: {'Content-Type': 'json'}}
  	}).then(
  		response => {
  			console.log(response);
  			return Promise.resolve('Hello');
	  	}
  	).catch(
  		error => {
  			console.log(error);
  			return Promise.resolve('Hello');
  		}
  	)

	return Promise.resolve('Hello');

  }

  // Save the results to the server
  save = (flag) => {
	  var data = {pic: this.state.currKey, bbox: this.state.bboxes, mask: this.state.defaultPosition, class: this.state.segClass}
	  console.log(data)

	  // Make the POST request using axios
	  return axios({method: 'post',
		   url: 'http://localhost:3001/send',
		   data: data,
		   config: {headers: {'Content-Type': 'json'}}
		   }).then(response => {

		   // If method is successful, complete a bunch of 
		   // sequential tasks by setting them up as a promise chain

		   if (flag=='next') {
			   // 1. Write to the database
			   return this.dbWrite()
			    .then(() => {
			      // 2. Status of the file changed to marked
			      return this.fileMarked()
			        .then(() => {          
			          // 3. Switch to the next frame
			          return this.switch(false, null, 'next')
			            .then(() => {
			              // 4. Refresh the page          
			          	  return this.refresh()
			          		.then(() => {
			          		  // 5. Display the result on the canvas          
			          		  return this.dispResult()
			          		})
			          	})
			        })
			    })
			} else if (flag=='prev') {
			   // 1. Write to the database
			   return this.dbWrite()
			    .then(() => {
			      // 2. Status of the file changed to marked
			      return this.fileMarked()
			        .then(() => {          
			          // 3. Switch to the next frame
			          return this.switch(false, null, 'prev')
			            .then(() => {
			              // 4. Refresh the page          
			          	  return this.refresh()
			          		.then(() => {
			          		  // 5. Display the result on the canvas          
			          		  return this.dispResult()
			          		})
			          	})
			        })
			    })
			} else if ('stay') {
			   // 1. Write to the database
			   return this.dbWrite()
			    .then(() => {
			      // 2. Status of the file changed to marked
			      return this.fileMarked()
			        .then(() => {          
			          // 3. Switch to the next frame
			          //return this.switch(false, null, 'stay')
			            //.then(() => {
			              // 4. Refresh the page          
			          	  //return this.refresh()
			          		//.then(() => {
			          		  // 5. Display the result on the canvas          
			          		  return this.dispResult()
			          		    .then(() => {
			          		      // Run an alert
							      confirmAlert({
									title: ' ۜ\(סּںסּَ` )/ۜ',
									message: 'The data has been written to the database! \n Refresh the page to update the table',
									buttons: [
										{
										  label: 'Take me back to where the fun is',
										  onClick: () => console.log('Going back...'),
										}
									]
								  });
			          		    })
			          		})
			          	//})
			        //})
			    })
			}	

			return 'allSystemsGo'

		  }).catch(function (error) {
			console.log(error);
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
 	console.log('5. Displaying the results')
 	//console.log(this.state.defaultPosition)
	for (var j=0; j<=this.state.globalKey; j+=1) {
		
		if (j==0) {
			clr="#85C1E9"
		} else if (j==1) {
			clr="#99A3A4"
		} else if (j==2) {
			clr="#A569BD"
		} else if (j==3) {
			clr="#F1948A"
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
				<select id={j} background="rgba(0,0,0,0.3)" className={j} onChange={this.classify}>
				  <option value="0"> - </option>
				  <option value="1"> Stapler </option>
				  <option value="2"> Needle </option>
				  <option value="3"> Suction </option>
				  <option value="4"> Nathanson Retractor </option>
				  <option value="5"> Endo-Bag </option>
				  <option value="6"> Suture </option>
				  <option value="7"> Tip </option>
				  <option value="8"> Shaft </option>
				  <option value="9"> Bougie </option>
				  <option value="10"> Other </option>
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

	return Promise.resolve('Hello');

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

	  const files = [{
	    Header: 'Filename',
	    accessor: 'filename' // String-based value accessors!
	  }, {
	    Header: 'Status',
	    accessor: 'status',
	    //Cell: props => <span className='number'>{props.value}</span>,
	    getProps: (state, rowInfo, column) => {
	    		  return {
				    style: {
				        background: rowInfo.row.status == "Pending... 👀" ? "#EBA02B" : (rowInfo.row.status == "In Progress... ⏰" ? "#F1C40F" : "#0FC3F1")
				    },
  				  };
	  		}
	  }, {
	    Header: 'Class(es)',
	    accessor: 'class',
	    getProps: (state, rowInfo, column) => {
	    		  return {
				    style: {
				        fontFamily: 'Roboto',
				        fontWeight: "bold",
				    },
  				  };
	  		}
	  }, {
	    Header: props => <span>Mask Quantity</span>, // Custom header components!
	    accessor: 'mask'
	  }]

		  //<img src={logo} className="App-logo" alt="logo" />

	return (
	  <div className="App">
  	  	{this.state.serverState}
  	    {this.state.dbState}
		<header style={{fontFamily: 'Roboto', fontSize: 32+'px'}}>
		  <h1 style={{fontFamily: 'Roboto', fontSize: 32+'px'}}>Segmentation Tool</h1>
		</header>
		<div style={{background: `url(${matte})`}}>
			<ImgPic checks={this.checks} ind={this.state.ind} frameUpdate={this.frameUpdate} switch={this.switch} maskInd={this.state.maskInd} onEnterDown={this.onEnterDown} bb={this.state.bboxes} denote={this.denote} dispResult={this.dispResult} polyP={this.state.defaultPosition} total={allFiles.length} current={this.state.ind+1} width="1280" height="720" frame={this.state.currImg} onSelected={this.onSelected} next={this.next} prev={this.prev} refresh={this.refresh} undo={this.undo} save={this.save} onMaskP={this.onMaskP} ref={(cd) => {this.imgpic = cd}}>
			  {this.state.children}
			</ImgPic>
			<SegTable resCoords={this.state.resCoords} resClass={this.state.resClass} header={this.state.header}>
			</SegTable>
		</div>
		<div>
			<ReactTable className="-highlight" data={this.state.data} columns={files} defaultPageSize={5}
			getTdProps={(state, rowInfo, column, instance) => {
				return {
					onClick: (e, handleOriginal) => {

						// Switch to the next image
						this.switch(true, rowInfo.index, 'next')
						
						// Refresh the bbox array
						this.refresh()
						this.frameUpdate(rowInfo.index)

						// if (handleOriginal) {
				        //   handleOriginal();
				        // }

					 }
				  }
			   }
			}
			SubComponent={row => {
			    return (
			      <div>
			        Functionality being developed!
			      </div>
			    );
			  }}	
				getProps={(state, rowInfo, column) => {
				    return {
				      style: {
				        //background: rowInfo > 20 ? "green" : "red"
				    }
				};
  			}}/>
		</div>
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
				   <th style={{width: "100px", fontFamily: 'Roboto', fontSize: 18+'px'}}><i style={{color: "white"}}>Tool</i></th>
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
	width: 1280,
	height: 720,
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
	  //console.log('Inside reload canvas!') 
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
	}   
  }

  reloadCanvas = () => {
  	  console.log('Inside reload canvas!') 
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
	  console.log('Inside update canvas!') 
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
	this.props.save('stay')
  };

// LEGACY CODE - TO BE REMOVED
 //  prev = () => {
	// // Write/append filepath of image to a file here
	// this.props.prev()
	// // Refresh the bbox array
	// this.props.refresh()
	// // Update the canvas
	// this.isDirty = true
	// requestAnimationFrame(this.reviveCanvas) 
 //  };

  prev = () => {
		var status = this.props.checks() // Checks are currently disabled
		console.log('status: '+status)
		if (status=='keepMoving') {
		  this.props.prev()
		  .then((resVar) => {
			  if (resVar==='allSystemsGo') {
				// Refresh the bbox array
				this.props.refresh()

				// Update the canvas
				this.isDirty = true
				requestAnimationFrame(this.reviveCanvas) 	
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
			  } else if (status==='classMiss') {
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
			} else if (resVar==='mayDay') {
				console.log('mayDay! mayDay!')
			}
			  
			  this.props.frameUpdate(this.props.ind)

		    })
	    } else if (status==='classMiss') {
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
		};
    
    }

  next = () => {
	// confirmAlert({
	//   title: 'Switch to next frame?',
	//   message: 'Data will be written to server',
	//   buttons: [
	// 	{
	// 	  label: 'Yes',
	// 	  onClick: () => {
   			  var status = this.props.checks() // Checks are currently disabled
   			  console.log('status: '+status)
   			  if (status=='keepMoving') {
				  this.props.next()
				  .then((resVar) => {
					  if (resVar==='allSystemsGo') {
						// Refresh the bbox array
						this.props.refresh()

						// Update the canvas
						this.isDirty = true
						requestAnimationFrame(this.reviveCanvas) 	
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
					  } else if (status==='classMiss') {
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
					} else if (resVar==='mayDay') {
						console.log('mayDay! mayDay!')
					}
					  
					  this.props.frameUpdate(this.props.ind)

				    })
			  } else if (status==='classMiss') {
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
				};
		    
		    }

	// 	},
	// 	{
	// 	  label: 'No',
	// 	  onClick: () => console.log('Click No')
	// 	}
	//   ]
	// });
 //  };

  refresh = () => {
	// Refresh the bbox array
	this.props.refresh()
	// Update the canvas
	this.isDirty = true
	this.isDragPoly = true
	this.reviveCanvas()
	return Promise.resolve('Refresh Complete!');
	//requestAnimationFrame(this.updateCanvas) 
  };

  undo = () => {
	console.log('Undo!')
	// Refresh the bbox array
	this.props.undo()
	// Update the canvas
	this.isDirty = true
	this.isDragPoly = true
	//this.reviveCanvas()
	this.updateCanvas()
	//requestAnimationFrame(this.updateCanvas) 
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
				  <AwesomeButton type="primary" size="large" action={OnClick=>this.save('stay')}>Save</AwesomeButton>
				</td>
				<td>
				  <AwesomeButton type="primary" size="large" action={OnClick=>this.refresh()}>Refresh</AwesomeButton>
				</td>
				<td>
				  <AwesomeButton type="primary" size="large" action={()=>this.undo()}>Undo</AwesomeButton>
			    </td>
			  </tr>
		    </tbody>
		  </table>
		  <table align='center'>
			<tbody>
			  <tr>
			    <td>
				  <AwesomeButton type="secondary" size="large" action={()=>this.prev()}>Prev</AwesomeButton>
				</td>
				<td>
				  <AwesomeButton type="secondary" size="large" action={(e) => {this.next(e)}}>Next</AwesomeButton>
			    </td>
		      </tr>
		    </tbody>
		  </table>
		</div>
	  <div style={{fontFamily: 'Roboto', fontSize: 32+'px'}}>
		<b style={{color: "white"}}>Frame</b> <b style={{color: "#F1C40F"}}>{this.props.current}</b> <i style={{color: "white"}}> of </i> <b style={{color: "#E67E22"}}>{this.props.total}</b>
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


