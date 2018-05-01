import React, { Component } from 'react';
import logo from './logo.svg';
import axios from 'axios';
import './App.css';
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

//
class ImgPic extends Component {
  static defaultProps = {
    width: 320,
    height: 200,
    strokeStyle: '#F00',
    lineWidth: 1,
    onSelected: () => {},
  };

  constructor(props) {
  	super(props)
  	this.state = {
  		selected: false,
        x: -1,
        y: -1,
        w: -1,
        h: -1,
  	}
  }

  startX = -1;
  startY = -1;
  curX = -1;
  curY = -1;
  isDrag = false;
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

  reviveCanvas = () => {
    this.ctx.clearRect(0, 0, this.props.width, this.props.height)
    this.base_image = new Image()
    this.base_image.src = this.props.frame
    this.base_image.onload = () => {
      this.ctx.drawImage(this.base_image,0,0)
    }   
  }

  updateCanvas = () => {

  	//console.log('Inside updateCanvas!')
    if (this.isDrag || this.ann) {
      requestAnimationFrame(this.updateCanvas)
    }

    console.log('~~~1')

    if (!this.isDirty) {
      return
    }

    console.log('~~~2')

    this.ctx.clearRect(0, 0, this.props.width, this.props.height)
    this.base_image = new Image()
    this.base_image.src = this.props.frame

    // Draw the base image
    this.ctx.drawImage(this.base_image,0,0)
    
    // Sketch all of the previously created rectangles
    for (let i=0; i<this.props.bb.length; i++) {
      this.ctx.strokeRect(this.props.bb[i].x, this.props.bb[i].y, this.props.bb[i].w, this.props.bb[i].h)
    }

    //this.ctx.strokeRect(0, 0, this.props.width, this.props.height) // For testing

    console.log('~~~3')


    if (this.isDrag) {      
      const rect = {
        x: this.startX,
        y: this.startY,
        w: this.curX - this.startX,
        h: this.curY - this.startY,
      }

    if (0<this.startX<this.props.width && 0<this.startY<this.props.height) {
	  	//console.log('sketching!')
	    this.ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)  
	  }  
	}

    // Annotate the image    
    if (this.ann) {
      const arc = {
        x: this.curX-2,
        y: this.curY-2,
        rs: 10,
        re: 2*Math.PI,
        cc: 0,
      }
      this.props.onMaskP(arc)
      this.ctx.arc(arc.x, arc.y, arc.rs, arc.re, arc.cc);
      this.ctx.fillStyle="green";
      this.ctx.fill()
      this.ann = false
    }

    console.log(this.props.bb)    
    console.log(this.props.maskP)
    // Skatch all of the previously created masking points
    for (let i=0; i<this.props.maskP.length; i++) {
      console.log('drawing!!!')
      //this.ctx.beginPath()
      this.ctx.arc(this.props.maskP[i].x-2, this.props.maskP[i].y-2, 10, 2*Math.PI, 0);
      this.ctx.fillStyle="green";
      this.ctx.stroke()
      this.ctx.fill()      
    }    

    this.isDirty = false

  };
 
  componentWillUnmount() {
    this.removeMouseEvents()
  }

  addMouseEvents() {
    document.addEventListener('mousedown', this.onMouseDown, false);
    document.addEventListener('mousemove', this.onMouseMove, false);
    document.addEventListener('mouseup', this.onMouseUp, false);
  }

  removeMouseEvents() {
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
  requestAnimationFrame(this.updateCanvas) 
  };

  onMouseDown = (e) => {
  this.isDrag = true
 	this.curX = this.startX = e.offsetX
  this.curY = this.startY = e.offsetY

  if (e.target.tagName==='CANVAS') {
      requestAnimationFrame(this.updateCanvas)
	}
  };

  onMouseMove = (e) => {
    if (! this.isDrag) return
    this.curX = e.offsetX
    this.curY = e.offsetY
    this.isDirty = true
  };
  
  onMouseUp = (e) => {
    this.isDrag = false
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
      this.props.onSelected(rect)
      requestAnimationFrame(this.updateCanvas)
  	}

  };

  annotate = (e) => {
    console.log('annotating')

    // Update the canvas
    this.isDirty = true
    this.ann = true
    requestAnimationFrame(this.updateCanvas)

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
		  <div>
	      <canvas width={this.props.width} height={this.props.height} ref={(c) => {this.canvas=c}}/>
      </div>
	  </div>
	)
  }
}

// The top level of the app starts here!

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
  	}
  }

  //bboxes = []

  onSelected = (rect) => {
    this.state.bboxes.push(rect)
    this.state.lastClick.push('rec')
  };

  onMaskP = (arc) => {
    this.state.maskP.push(arc)
    this.state.lastClick.push('arc')
  }

  refresh = () => {
    this.setState({
      selected: true,
      bboxes: [],
      maskP: [],
    })
    console.log(this.state.bboxes)
    console.log(this.state.maskP)
    console.log('Cleared!')
  };

  undo = () => {
    if (this.state.lastClick[this.state.lastClick.length-1]==='rec') {
      this.state.bboxes.pop()
      this.state.lastClick.pop()
    } else if (this.state.lastClick[this.state.lastClick.length-1]==='arc') {
      this.state.maskP.pop()
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

  getSelectionStr() {
    if (this.state.selected) {
      const state = this.state
      return `x: ${state.x}, y: ${state.y}, w: ${state.w}, h: ${state.h}`
    }
    return 'No Selection';
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
        <div>
          {this.getSelectionStr()}
        </div>
        <ImgPic bb={this.state.bboxes} maskP={this.state.maskP} total={allFiles.length} current={this.state.ind+1} width="596" height="334" frame={this.state.currImg} onSelected={this.onSelected} next={this.next} prev={this.prev} refresh={this.refresh} undo={this.undo} save={this.save} onMaskP={this.onMaskP}/>
      </div>
    );
  }
}

// FUNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN!

var Draggable = window.ReactDraggable;

var App2 = React.createClass({
  getInitialState() {
    return {
      activeDrags: 0,
      deltaPosition: {
        x: 0, y: 0
      },
      controlledPosition: {
        x: -400, y: 200
      }
    };
  },

  handleDrag(e, ui) {
    const {x, y} = this.state.deltaPosition;
    this.setState({
      deltaPosition: {
        x: x + ui.deltaX,
        y: y + ui.deltaY,
      }
    });
  },

  onStart() {
    this.setState({activeDrags: ++this.state.activeDrags});
  },

  onStop() {
    this.setState({activeDrags: --this.state.activeDrags});
  },

  // For controlled component
  adjustXPos(e) {
    e.preventDefault();
    e.stopPropagation();
    const {x, y} = this.state.controlledPosition;
    this.setState({controlledPosition: {x: x - 10, y}});
  },

  adjustYPos(e) {
    e.preventDefault();
    e.stopPropagation();
    const {controlledPosition} = this.state;
    const {x, y} = controlledPosition;
    this.setState({controlledPosition: {x, y: y - 10}});
  },

  onControlledDrag(e, position) {
    const {x, y} = position;
    this.setState({controlledPosition: {x, y}});
  },

  onControlledDragStop(e, position) {
    this.onControlledDrag(e, position);
    this.onStop();
  },

  render() {
    const dragHandlers = {onStart: this.onStart, onStop: this.onStop};
    const {deltaPosition, controlledPosition} = this.state;
    return (
      <div>
        <h1>React Draggable</h1>
        <p>Active DragHandlers: {this.state.activeDrags}</p>
        <p>
          <a href="https://github.com/mzabriskie/react-draggable/blob/master/example/index.html">Demo Source</a>
        </p>
        <Draggable {...dragHandlers}>
          <div className="box">I can be dragged anywhere</div>
        </Draggable>
        <Draggable axis="x" {...dragHandlers}>
          <div className="box cursor-x">I can only be dragged horizonally (x axis)</div>
        </Draggable>
        <Draggable axis="y" {...dragHandlers}>
          <div className="box cursor-y">I can only be dragged vertically (y axis)</div>
        </Draggable>
        <Draggable onStart={() => false}>
          <div className="box">I don't want to be dragged</div>
        </Draggable>
        <Draggable onDrag={this.handleDrag} {...dragHandlers}>
          <div className="box">
            <div>I track my deltas</div>
            <div>x: {deltaPosition.x.toFixed(0)}, y: {deltaPosition.y.toFixed(0)}</div>
          </div>
        </Draggable>
        <Draggable handle="strong" {...dragHandlers}>
          <div className="box no-cursor">
            <strong className="cursor"><div>Drag here</div></strong>
            <div>You must click my handle to drag me</div>
          </div>
        </Draggable>
        <Draggable cancel="strong" {...dragHandlers}>
          <div className="box">
            <strong className="no-cursor">Can't drag here</strong>
            <div>Dragging here works</div>
          </div>
        </Draggable>
        <Draggable grid={[25, 25]} {...dragHandlers}>
          <div className="box">I snap to a 25 x 25 grid</div>
        </Draggable>
        <Draggable grid={[50, 50]} {...dragHandlers}>
          <div className="box">I snap to a 50 x 50 grid</div>
        </Draggable>
        <Draggable bounds={{top: -100, left: -100, right: 100, bottom: 100}} {...dragHandlers}>
          <div className="box">I can only be moved 100px in any direction.</div>
        </Draggable>
        <div className="box" style={{height: '500px', width: '500px', position: 'relative', overflow: 'auto', padding: '0'}}>
          <div style={{height: '1000px', width: '1000px', padding: '10px'}}>
            <Draggable bounds="parent" {...dragHandlers}>
              <div className="box">
                I can only be moved within my offsetParent.<br /><br />
                Both parent padding and child margin work properly.
              </div>
            </Draggable>
            <Draggable bounds="parent" {...dragHandlers}>
              <div className="box">
                I also can only be moved within my offsetParent.<br /><br />
                Both parent padding and child margin work properly.
              </div>
            </Draggable>
          </div>
        </div>
        <Draggable bounds="body" {...dragHandlers}>
          <div className="box">
            I can only be moved within the confines of the body element.
          </div>
        </Draggable>
        <Draggable>
          <div className="box" style={{position: 'absolute', bottom: '100px', right: '100px'}} {...dragHandlers}>
            I already have an absolute position.
          </div>
        </Draggable>
        <Draggable defaultPosition={{x: 25, y: 25}} {...dragHandlers}>
          <div className="box">
            {"I have a default position of {x: 25, y: 25}, so I'm slightly offset."}
          </div>
        </Draggable>
        <Draggable position={controlledPosition} {...dragHandlers} onDrag={this.onControlledDrag}>
          <div className="box">
            My position can be changed programmatically. <br />
            I have a drag handler to sync state.
            <p>
              <a href="#" onClick={this.adjustXPos}>Adjust x ({controlledPosition.x})</a>
            </p>
            <p>
              <a href="#" onClick={this.adjustYPos}>Adjust y ({controlledPosition.y})</a>
            </p>
          </div>
        </Draggable>
        <Draggable position={controlledPosition} {...dragHandlers} onStop={this.onControlledDragStop}>
          <div className="box">
            My position can be changed programmatically. <br />
            I have a dragStop handler to sync state.
            <p>
              <a href="#" onClick={this.adjustXPos}>Adjust x ({controlledPosition.x})</a>
            </p>
            <p>
              <a href="#" onClick={this.adjustYPos}>Adjust y ({controlledPosition.y})</a>
            </p>
          </div>
        </Draggable>

      </div>
    );
  }
});

export default App;


