import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './canvas.js';

let drawParams = {
  showGradient : true,
  showBars : true,
  showCircles : true,
  showNoise : false,
  showInvert : false,
};


const DEFAULTS = Object.freeze({
	sound1  :  "media/New Adventure Theme.mp3"
});

function init(){
	console.log("init called");
  console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
  audio.setupWebaudio(DEFAULTS.sound1);
	let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
  setupUI();
  canvas.setupCanvas(canvasElement,audio.analyserNode);
  
  loop();
}


const controllerObj = {
  _volume : 50,
  _showBars : true,
  _showGradient : true,
  _showCircles : true,
  _showNoise : false,
  _showInvert : false,
  _synthHighPass : false,
  _highPassFreq : 12000,
  _highPassQ : 0.5,
  _synthLowPass : false,
  _lowPassFreq: 100,
  _lowPassQ : 0.5,

  get showBars(){return this._showBars;},
  set showBars(value){this._showBars = value; drawParams.showBars = value;},

  get showGradient(){return this._showGradient;},
  set showGradient(value){this._showGradient = value; drawParams.showGradient = value;},

  get showCircles(){return this._showCircles;},
  set showCircles(value){this._showCircles = value; drawParams.showCircles = value;},

  get showNoise(){return this._showNoise;},
  set showNoise(value){this._showNoise = value; drawParams.showNoise = value;},

  get showInvert(){return this._showInvert;},
  set showInvert(value){this._showInvert = value; drawParams.showInvert = value;},

  get synthHighPass(){return this._synthHighPass;},
  set synthHighPass(value){this._synthHighPass = value; audio.toggleHighPass(value)},

  get synthLowPass(){return this._synthLowPass;},
  set synthLowPass(value){this._synthLowPass = value; audio.toggleLowPass(value)},

  get lowPassFreq(){return this._lowPassFreq;},
  set lowPassFreq(value){this._lowPassFreq = value; audio.setLowPassFreq(value)},

  get lowPassQ(){return this._lowPassQ;},
  set lowPassQ(value){this._lowPassQ = value; audio.setLowPassQ(value)},

  get HighPassFreq(){return this._highPassFreq;},
  set HighPassFreq(value){this._highPassFreq = value; audio.setHighPassFreq(value)},

  get HighPassQ(){return this._highPassQ;},
  set HighPassQ(value){this._highPassQ = value; audio.setHighPassQ(value)},

  get volume(){return this._volume;},
  set volume(value){
    this._volume = value;
    audio.setVolume(value/100);
    volumeLabel.innerHTML = Math.round((value/100));
  }
}

function setupUI(){
  const gui = new dat.GUI({ width: 400 });
  //gui.close();

  const playButton = document.querySelector("#playButton")
  let trackSelect = document.querySelector("#trackSelect");

  let canvasFolder = gui.addFolder('Visualizer Options');
  let visFolder = canvasFolder.addFolder('Visualization');
  let maniFolder = canvasFolder.addFolder('Manipulation');
  visFolder.add(controllerObj, 'showBars').name('Show Bars');
  visFolder.add(controllerObj, 'showGradient').name('Show Gradient');
  visFolder.add(controllerObj, 'showCircles').name('Show Circles');
  maniFolder.add(controllerObj, 'showNoise').name('Show Noise');
  maniFolder.add(controllerObj, 'showInvert').name('Show Invert');

  let hpfolder = gui.addFolder('High Pass Filter');
  hpfolder.add(controllerObj, 'synthHighPass').name('High Pass Filter');
  hpfolder.add(controllerObj, 'HighPassFreq').min(1).max(20000).step(1).name('Freq');
  hpfolder.add(controllerObj, 'HighPassQ').min(0.5).max(24.5).step(1).name('Q');

  let lowfolder = gui.addFolder('Low Pass Filter');
  lowfolder.add(controllerObj, 'synthLowPass').name('Low Pass Filter');
  lowfolder.add(controllerObj, 'lowPassFreq').min(1).max(20000).step(1).name('Freq');
  lowfolder.add(controllerObj, 'lowPassQ').min(0.5).max(24.5).step(1).name('Q')

  gui.add(controllerObj, 'volume').min(0).max(100).step(1).name('Volume');

  // add .onclick event to button
  
  playButton.onclick = e => {
    console.log(`audioCtx.state before = ${audio.audioCtx.state}`);

    if(audio.audioCtx.state == "suspended"){
      audio.audioCtx.resume();
    }

    console.log(`audioCtx.state after = ${audio.audioCtx.state}`);
    if(e.target.dataset.playing == "no"){
      audio.playCurrentSound();
      e.target.dataset.playing = "yes"
    }
    else{
      audio.pauseCurrentSound();
      e.target.dataset.playing = "no";
    }
  }


  trackSelect.onchange = e => {
    audio.loadSoundFile(e.target.value);
    if(playButton.dataset.playing = "yes"){
      playButton.dispatchEvent(new MouseEvent("click"));
    }
  };
} // end setupUI

function loop(){
    requestAnimationFrame(loop);

    canvas.draw(drawParams);
}

export {init};