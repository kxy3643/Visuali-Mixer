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


const gui = new dat.GUI({ width: 400 });

const DEFAULTS = Object.freeze({
	sound1  :  "media/New Adventure Theme.mp3"
});

function init(){
	console.log("init called");
  console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
  audio.setupWebaudio(DEFAULTS.sound1);
  let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
  setupGUI();
  setupUI(canvasElement);
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
  _djMode : false,
  _highShelf : false,
  _highShelfFreq : 2000.0,
  _highShelfGain : 15,
  _lowShelf : false,
  _lowShelfFreq : 100.0,
  _lowShelfGain : 15,
  _replay : false,

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
  set synthHighPass(value){this._synthHighPass = value; audio.toggleHighPass(value);},

  get synthLowPass(){return this._synthLowPass;},
  set synthLowPass(value){this._synthLowPass = value; audio.toggleLowPass(value);},

  get lowPassFreq(){return this._lowPassFreq;},
  set lowPassFreq(value){this._lowPassFreq = value; audio.setLowPassFreq(value);},

  get lowPassQ(){return this._lowPassQ;},
  set lowPassQ(value){this._lowPassQ = value; audio.setLowPassQ(value);},

  get highPassFreq(){return this._highPassFreq;},
  set highPassFreq(value){this._highPassFreq = value; audio.setHighPassFreq(value);},

  get highPassQ(){return this._highPassQ;},
  set highPassQ(value){this._highPassQ = value; audio.setHighPassQ(value);},

  get highShelf(){return this._highShelf;},
  set highShelf(value){this._highShelf = value;audio.toggleHighShelf(value);},

  get highShelfFreq(){return this._highShelfFreq;},
  set highShelfFreq(value){this._highShelfFreq = value;audio.setHighShelfFreq(value);},

  get highShelfGain(){return this._highShelfGain;},
  set highShelfGain(value){this._highShelfGain = value;audio.setHighShelfGain(value);},

  get lowShelf(){return this._lowShelf;},
  set lowShelf(value){this._lowShelf = value;audio.toggleLowShelf(value);},

  get lowShelfFreq(){return this._lowShelfFreq;},
  set lowShelfFreq(value){this._lowShelfFreq = value;audio.setLowShelfFreq(value);},

  get lowShelfGain(){return this._lowShelfGain;},
  set lowShelfGain(value){this._lowShelfGain = value;audio.setLowShelfGain(value);},

  get volume(){return this._volume;},
  set volume(value){
    this._volume = value;
    audio.setVolume(value/100);
  },

  get djMode(){return this._djMode;},
  set djMode(value){this._djMode = value;},

  get replay(){return this._replay;},
  set replay(value){this._replay = value;}
};

let playButton;
let canvasFolder, audioFolder, visFolder, maniFolder, hpfolder, lowfolder, hpcheck, lowcheck, 
hfreq,hq,lfreq,lq, djCheck, volumeSlider, hsfolder, lsfolder, hscheck, lscheck, hsfreq, hsgain,
lsfreq, lsgain, replayCheck;

function setupUI(canvasElement){
  
  //gui.close();

  playButton = document.querySelector("#playButton");
  let trackSelect = document.querySelector("#trackSelect");
  const fsButton = document.querySelector("#fsButton");

  fsButton.onclick = e => {
    utils.goFullscreen(canvasElement);
  };
  
  playButton.onclick = e => {
    if(audio.audioCtx.state == "suspended"){
      audio.audioCtx.resume();
    };

    if(e.target.dataset.playing == "no"){
      audio.playCurrentSound();
      e.target.dataset.playing = "yes";
    }
    else{
      audio.pauseCurrentSound();
      e.target.dataset.playing = "no";
    };
  };

  trackSelect.onchange = e => {
    audio.loadSoundFile(e.target.value);
    if(playButton.dataset.playing = "yes"){
      playButton.dispatchEvent(new MouseEvent("click"));
    };
  };

} // end setupUI

function setupGUI()
{
  djCheck = gui.add(controllerObj, 'djMode').name("DJ ONLY MODE");
  replayCheck = gui.add(controllerObj, 'replay').name("LOOP MODE");
  volumeSlider = gui.add(controllerObj, 'volume').min(0).max(100).step(1).name('Volume');
  

  canvasFolder = gui.addFolder('Visualizer Options');
  audioFolder = gui.addFolder('Audio Options');
  visFolder = canvasFolder.addFolder('Visualization');
  maniFolder = canvasFolder.addFolder('Manipulation');

  visFolder.add(controllerObj, 'showBars').name('Show Bars');
  visFolder.add(controllerObj, 'showGradient').name('Show Gradient');
  visFolder.add(controllerObj, 'showCircles').name('Show Circles');
  maniFolder.add(controllerObj, 'showNoise').name('Show Noise');
  maniFolder.add(controllerObj, 'showInvert').name('Show Invert');

  hpfolder = audioFolder.addFolder('High Pass Filter');
  hpcheck = hpfolder.add(controllerObj, 'synthHighPass').name('High Pass Filter');
  
  if(controllerObj.synthHighPass)
  {
    hfreq = hpfolder.add(controllerObj, 'highPassFreq').min(1).max(20000).step(1).name('Freq');
    hq = hpfolder.add(controllerObj, 'highPassQ').min(0.5).max(24.5).step(0.5).name('Q');
  }

  hpcheck.onFinishChange(function(){
    if(controllerObj.synthHighPass)
    {
      hfreq = hpfolder.add(controllerObj, 'highPassFreq').min(1).max(20000).step(1).name('Freq');
      hq = hpfolder.add(controllerObj, 'highPassQ').min(0.5).max(24.5).step(0.5).name('Q');
    }
    else
    {
      hfreq.remove();
      hq.remove();
    };
  });

  lowfolder = audioFolder.addFolder('Low Pass Filter');
  lowcheck =lowfolder.add(controllerObj, 'synthLowPass').name('Low Pass Filter');

  if(controllerObj.synthLowPass)
  {
    lfreq = lowfolder.add(controllerObj, 'lowPassFreq').min(1).max(20000).step(1).name('Freq');
    lq = lowfolder.add(controllerObj, 'lowPassQ').min(0.5).max(24.5).step(0.5).name('Q');
  }

  lowcheck.onFinishChange(function(){
    if(controllerObj.synthLowPass)
    {
      lfreq = lowfolder.add(controllerObj, 'lowPassFreq').min(1).max(20000).step(1).name('Freq');
      lq = lowfolder.add(controllerObj, 'lowPassQ').min(0.5).max(24.5).step(0.5).name('Q');
    }
    else
    {
      lfreq.remove();
      lq.remove();
    };
  });
  
  hsfolder = audioFolder.addFolder('High Shelf Filter');
  hscheck = hsfolder.add(controllerObj, 'highShelf').name('High Shelf Filter');
  
  if(controllerObj.highShelf)
  {
    hsfreq = hsfolder.add(controllerObj, 'highShelfFreq').min(2000).max(14000).step(1.0).name('Freq');
    hsgain = hsfolder.add(controllerObj, 'highShelfGain').min(1).max(25).step(1.0).name('Gain');
  }

  hscheck.onFinishChange(function(){
    if(controllerObj.highShelf)
    {
      hsfreq = hsfolder.add(controllerObj, 'highShelfFreq').min(2000).max(14000).step(1.0).name('Freq');
      hsgain = hsfolder.add(controllerObj, 'highShelfGain').min(1).max(25).step(1.0).name('Gain');
    }
    else
    {
      hsfreq.remove();
      hsgain.remove();
    };
  });

  lsfolder = audioFolder.addFolder('Low Shelf Filter');
  lscheck = lsfolder.add(controllerObj, 'lowShelf').name('Low Shelf Filter');
  
  if(controllerObj.lowShelf)
  {
    lsfreq = lsfolder.add(controllerObj, 'lowShelfFreq').min(1).max(2000).step(1.0).name('Freq');
    lsgain = lsfolder.add(controllerObj, 'lowShelfGain').min(1).max(25).step(1.0).name('Gain');
  }

  lscheck.onFinishChange(function(){
    if(controllerObj.lowShelf)
    {
      lsfreq = lsfolder.add(controllerObj, 'lowShelfFreq').min(1).max(2000).step(1.0).name('Freq');
      lsgain = lsfolder.add(controllerObj, 'lowShelfGain').min(1).max(25).step(1.0).name('Gain');
    }
    else
    {
      lsfreq.remove();
      lsgain.remove();
    };
  });
  

  djCheck.onChange(function(){
    if(controllerObj.djMode)
    {
      gui.removeFolder(canvasFolder);
      djModeToggle();
    }
    else
    {
      djCheck.remove();
      volumeSlider.remove();
      replayCheck.remove();
      gui.removeFolder(audioFolder);
      djModeToggle();
      setupGUI();
    }
  });
}

function djModeToggle()
{
  if(controllerObj.djMode)
  {
    drawParams.showGradient = false;
    audioFolder.open();
    hpfolder.open();
    hsfolder.open();
    lowfolder.open();
    lsfolder.open();
    document.querySelector("body").style.backgroundColor = '#2e2e2e';
    document.querySelector("body").style.color = '#eeeeee';
  }
  else
  {
    drawParams.showGradient = true;
    document.querySelector("body").style.backgroundColor = '#eeeeee';
    document.querySelector("body").style.color = '#2e2e2e';
  }
}

function loop(){
  requestAnimationFrame(loop);
  canvas.draw(drawParams, audio.currentPlayPercent());
  if(audio.currentPlayPercent() == 1 && playButton.dataset.playing == "yes" && !controllerObj.replay){
    playButton.dispatchEvent(new MouseEvent("click"));
  }
  else if(audio.currentPlayPercent() == 1 && controllerObj.replay){
    playButton.dispatchEvent(new MouseEvent("click"));
  }


}

export {init};