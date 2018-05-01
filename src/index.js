import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Draggable, {DraggableCore} from 'react-draggable'; // Both at the same time
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
