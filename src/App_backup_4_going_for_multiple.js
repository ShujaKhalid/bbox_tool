//367503075004133972
import React, { Component } from 'react';
import logo from './logo.svg';
import axios from 'axios';
import './App.css';
import Draggable, {DraggableCore} from 'react-draggable'; // Both at the same time

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

class Movers extends Component {
  constructor(props) {
    super(props)
  }

  render () {
    return (
      <div style="border-radius 10px; -moz-border-radius 10px; -webkit-border-radius 10px; width: 20px; height: 20px; background: red; border: solid black 1px;">&nbsp;</div>
    )
  }

}

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
      defaultPosition: [],
      controlledPosition: {
        x: 0, y: 0
      },
      children: [],
      maskInd: 0,
      result: [],
      header: [],
      segClass: 0,
      potDrag: null, // potential draggable element 
    }
  }

  onSelected = (rect) => {
  	if (!rect==0) { 	
	    this.state.bboxes.push(rect)
	    this.state.lastClick.push('rec')  		
  	}
  };

  // Called when the canvas is double clicked
  // - Redraws all of the vertices dynamically
  onMaskP = (maskVars) => {
    this.state.maskP.push(maskVars)
    //console.log('Inside trigger function!')
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
	  })

	  children.push(<Draggable key={key} defaultPosition={{x: this.state.deltaPosition[key].x, y:this.state.deltaPosition[key].y}} onDrag={this.handleDrag} {...dragHandlers}>
	      <div id='circle' className={key.toString()} ></div>
	  </Draggable>)

    // Add the new state of the last circle here)
    this.state.defaultPosition.push(this.state.maskP[i]) 

    // Make the component re-render
    this.setState({
      children: children,
      deltaPosition: deltaPosition,
      defaultPosition: defaultPosition,
    })

    //console.log(this.state.children)

  }

  // reDraw = () => {
  // 	  var children=[]
  // 	  for (var i=0; i<this.state.maskP.length; i+=1) {
  //       const dragHandlers = {onStart: this.onStart, onStop: this.onStop};
  //       const cirRad = 4 // Radius of the circular vertex (Adjusted in css file)
  //       const offsetX = cirRad
  //       const offsetY = cirRad+337 //Hard coded for now
  //       var controlledPosition = []
  // 		var key = i
  // 	    children.push(<Draggable key={key} defaultPosition={{x: this.state.deltaPosition[key].x, y:this.state.deltaPosition[key].y}} onDrag={this.handleDrag} {...dragHandlers}>
  //          <div id='circle' className={key.toString()} ></div>
  //       </Draggable>)

	 //    // Make the component re-render
	 //    this.setState({
	 //      children: children,
	 //    })
	 //  }
  //   }

  denote = (e) => {
  	const elem = e.toElement.classList[0]
  	this.setState({
  		potDrag: elem,
  	})
  }

  handleDrag = (e, ui) => {

    const key = this.state.potDrag
    if (key!=undefined) {
	    //console.log('Tracking key: ' + key)
	    const {x, y} = this.state.defaultPosition[key];
	    const defaultPosition = this.state.defaultPosition
	    defaultPosition[key].x = x + ui.deltaX
	    defaultPosition[key].y = y + ui.deltaY

	    this.setState({
	      defaultPosition: defaultPosition,
	      controlledPosition: {
	        x: defaultPosition[key].x,
	        y: defaultPosition[key].y,
	      }
	    });

	    this.dispResult()
	}

    //console.log(this.state.controlledPosition.x)
    //console.log(this.state.controlledPosition.y)

  }

  refresh = () => {
    this.setState({
      selected: true,
      bboxes: [],
      children: [],
      result: []
    })
    //console.log(this.state.bboxes)
    //console.log(this.state.maskP)
    //console.log('Cleared!')
  };

  undo = () => {
    console.log(this.state.lastClick)
    if (this.state.lastClick[this.state.lastClick.length-1]==='rec') {
      this.state.bboxes.pop()
      this.state.result.pop()
      this.state.lastClick.pop()
      this.setState(this.state)
    } else if (this.state.lastClick[this.state.lastClick.length-1]==='arc') {
      this.state.children.pop()
      this.state.maskP.pop()
      this.state.defaultPosition.pop()
      this.state.maskInd = this.state.maskP.length
      this.state.result.pop()
      this.state.lastClick.pop()
    }
    console.log('Undoneing has been done!')
  };

  next = () => {
    if (this.state.ind+1<allFiles.length) {
      this.setState({
        ind: this.state.ind+1,
        currImg: allFiles[this.state.ind+1],
        currKey: allKeys[this.state.ind+1],
      });
      console.log('Next Image')      
      //console.log(this.state.currImg)   
    } else {
      console.log('Last image reached!')
    }
  };

  prev = () => {
    if (this.state.ind-1>=0) {
      this.setState({
        ind: this.state.ind-1,
        currImg: allFiles[this.state.ind-1],
        currKey: allKeys[this.state.ind-1],
      });
      console.log('Previous Image')   
      console.log(this.state.currImg) 
      console.log(this.state.ind)  
    } else {
      console.log('First image reached!')
    }
  };

  save = () => {
      const data = {pic: this.state.currKey, val: this.state.bboxes}
      console.log(data.pic)
      axios({method: 'post',
           url: 'http://localhost:3001/send',
           data: data,
           config: { headers: {'Content-Type': 'text' }}
          }).then(function (response) {
             console.log(response);
          }).catch(function (error) {
             console.log(error);
          });
  }

  getSelectionStr = () => {
    if (this.state.selected) {
      const state = this.state
      return `x: ${state.x}, y: ${state.y}, w: ${state.w}, h: ${state.h}`
    }
    return 'No Selection';
  }

  dispResult = () => {
  	var result = []
  	var header = []
  	//console.log('Inside dispResult!')
  	header.push(
  	  <tr key={0}>
	    <td>No. </td>
	    <td>Coord. X</td>
	    <td>Coord. Y</td>
	    <td>Segment Class (0-7)</td>
	  </tr>
	)

  	for (var i=0; i<this.state.defaultPosition.length; i+=1) {
	  result.push(
	    <tr key={i}>
	      <td>{i}</td>
	      <td>{this.state.defaultPosition[i].x}</td>
	      <td>{this.state.defaultPosition[i].y}</td>
	    </tr>
	)};

   	result.push(
   	  <td key={this.state.defaultPosition.length+1}>
   	    <select>
   	  	  <option value="0"> 0</option>
   	  	  <option value="0"> 0</option>
   	  	  <option value="0"> 0</option>
   	  	  <option value="0"> 0</option>
   	  	  <option value="0"> 0</option>
   	  	  <option value="0"> 0</option>
   	  	  <option value="0"> 0</option>
   	  	  <option value="0"> 0</option>
   	    </select>
	  </td>
	);

    this.setState({
    	result: result,
    	header: header,
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
        <ImgPic bb={this.state.bboxes} denote={this.denote} dispResult={this.dispResult} polyP={this.state.defaultPosition} total={allFiles.length} current={this.state.ind+1} width="596" height="334" frame={this.state.currImg} onSelected={this.onSelected} next={this.next} prev={this.prev} refresh={this.refresh} undo={this.undo} save={this.save} onMaskP={this.onMaskP}>
          {this.state.children}
        </ImgPic>
        <SegTable result={this.state.result} header={this.state.header}>
        </SegTable>
      </div>
    );
  }
}

//// Here is the display table component
class SegTable extends Component {

	render() {
		//console.log('Inside Segtable')
		return (
			<div className="SegTable">
				<table border="1"  align='center'>
					<tbody>
						{this.props.header}
						{this.props.result}
					</tbody>
				</table>
			</div>
		)
	}

}


// Here is the lower level component (Canvas)
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
    this.setState({activeDrags: ++this.state.activeDrags});
  }

  onStop = () => {
    this.setState({activeDrags: --this.state.activeDrags});
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
      this.ctx.strokeStyle = "rgb(0,200,0)";
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
	      this.ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)  
	    }  
	  }

    if (this.isDragPoly) {
      //console.log('Inside update canvas!') 
      //console.log(this.props.polyP)
      this.ctx.beginPath();

      // To avoid getting into an infinite loop when the undo button
      // is pressed
      for (let i=0; i<this.props.polyP.length; i++) {
        this.ctx.lineTo(this.props.polyP[i].x, this.props.polyP[i].y)
      }
      if (this.props.polyP[0]!=undefined) {
      	this.ctx.lineTo(this.props.polyP[0].x, this.props.polyP[0].y)
      }
      this.ctx.fillStyle = "rgba(255,255,255,0.2)";
      this.ctx.strokeStyle = "rgb(0,200,0)";
      this.ctx.stroke();
      this.ctx.fill()
      this.ctx.closePath()
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
  }

  removeMouseEvents = () => {
    document.removeEventListener('mousedown', this.onMouseDown, false);
    document.removeEventListener('mousemove', this.onMouseMove, false);
    document.removeEventListener('mouseup', this.onMouseUp, false);
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
  // Write/append filepath of image to a file here
  this.props.next()
  // Refresh the bbox array
  this.props.refresh()
  // Update the canvas
  this.isDirty = true
    requestAnimationFrame(this.reviveCanvas) 
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
    if ( this.isDragRect==this.isDragPoly ) return
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
    this.setState({
      x: Math.min(this.startX, this.curX),
      y: Math.min(this.startY, this.curY),
      maskInd: this.state.maskInd+1,
    })

    const maskVars = {
      x: Math.min(this.startX, this.curX),
      y: Math.min(this.startY, this.curY),
      maskInd: this.state.maskInd,
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
    //console.log(this.state.children)
    //this.state.children.push(<ChildComp />)

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
                <button onClick={this.next}>Next</button>
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


