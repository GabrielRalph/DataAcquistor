import {SvgPlus, Vector} from "./SvgPlus/4.js"
import * as zip from "https://deno.land/x/zipjs/index.js";
import * as EyeGaze from "./Algorithm/EyeGaze.js"
import * as Webcam from "./Utilities/Webcam.js"
import {CalibrationFrame, defaultCalibration} from "./UI/calibration-frame.js"
import {FeedbackFrame} from "./UI/feedback-frame.js"
import { delay, parallel } from "./Utilities/usefull-funcs.js";
import { HideShow, SvgResize} from "./Utilities/basic-ui.js";
import { getModels } from "./Algorithm/ModelLibrary.js";



class CalibrationParams extends SvgPlus {
  constructor() {
    super("div");
    this.class = "calibration-params";
    let rel = this.createChild("div", {class: "rel"});
    let inputs = {
    }
    for (let key in defaultCalibration) {
      inputs[key] = {}
      let row = rel.createChild("div", {class: "row"});
      row.createChild("div", {content: key});
      for (let key2 in defaultCalibration[key]) {
        let val = defaultCalibration[key][key2]
        let input = row.createChild("div", {class: "input"});
        input.createChild("div", {content: key2, class: "i-title"});
        let isNum = typeof val === "number";
        let i = input.createChild("input", {type:  isNum ? "number" : "checkbox", value: val, checked: val})
        inputs[key][key2] = {
          get: () => {
            return isNum ? parseFloat(i.value) : i.checked;
          },
          set: (val) => {
            if(isNum) i.value = val;
            else i.checked = val;
          }
        } 
      }
    }
    this.inputs = inputs;

    let r = rel.createChild("div", {class: "row"});
    r.createChild("div", {content: "Model"});
    let s = r.createChild("select");
    console.log(getModels());
    for (let m in getModels()) s.createChild("option", {content: m, value: m});
    this.modelSelect = s;


    this.loadCookies();
  }
  
  loadCookies(){
    let params = localStorage.getItem("calibration-params");
    if (params) {
      try{
        this.value = JSON.parse(params);
      }catch(e){}
    }
  }
  saveCookies(){
    localStorage.setItem("calibration-params", JSON.stringify(this.value))
  }


  set value(value){
    let {inputs} = this;
    for (let key1 in inputs) {
      if (key1 in value) {
        for (let key2 in inputs[key1]) {
          if (key2 in value[key1]) {
            inputs[key1][key2].set(value[key1][key2])
          }
        }
      }
    }

    if ("model" in value) this.modelSelect.value = value.model;
  }

  get value(){
    let {inputs} = this;
    let value = {}
    for (let key in inputs) {
      value[key] = {}
      for (let key2 in inputs[key]) {
        value[key][key2] = inputs[key][key2].get()
      }
    }
    value.model = this.modelSelect.value;
    return value;
  }
}

/**
 * @typedef {[Number, Vector, URL, String]} DataPoint
 * @type {DataPoint[]}
 */
let images = [];


class StartWindow extends HideShow {
  constructor(){
    super("div");
    this.styles = {
      position: "absolute",
      top: "2em",
      left: "50%",
      transform: "translate(-50%, 0)"
    };

    this.message = this.createChild("div");
    this.button = this.createChild("div", {
      class: "btn",
      content: "Start Webcam",
      events: {
        click: () => {
          this.dispatchEvent(new Event("click"));
        }
      }
    })
    this.button.shown = true;
    this.state = "start"
  }

  /** @param {boolean} val */
  set disabled(val){
    this.button.disabled = val;
  }

  async _fadeTo(button, message, disabled = false){
    let shown = this.shown;
    if (shown) {await this.hide();}
    this.button.innerHTML = button;
    this.message.innerHTML = message;
    this.disabled = disabled;
    if (shown) await this.show();
  }

  /** @param {String} state */
  async setState(state) {
    if (this.state != state) {
      this._state = state;
      switch (state) {
        case "start":
          await this._fadeTo("Start Webcam", "")
          break;
        case "webcam-error":
          await this._fadeTo("Start Webcam", "You browser does not support webcam accesability, or the webcam is currently being used.<br/><br/>Click to try again.")
          break;
        case "calibrate":
          await this._fadeTo("Calibrate", "")
          break;
      }
    }
  }

  /** @param {String} state */
  set state(state){
    this.setState(state);
  }

  /** @return {String} */
  get state(){
    return this._state;
  }
}

class ResultsWindow extends HideShow {
  constructor(){
    super("div");
    this.styles = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)"
    }

    this.image = this.createChild("img", {styles: {"border-radius": "1em"}});
    this.buttons = this.createChild(HideShow, {styles: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    }});

    let rel = this.buttons.createChild("div", {styles: {
      display: "flex",
      fill: "white",
      "font-size": "3em",
      gap: `0.3em`,
      background: "#0006",
      "border-radius": "0.3em",
      padding: "0.3em",
    }})
    rel.createChild("div", {
      style: {
        cursor: "pointer", display: "flex"
      },
      events: {
        click: () => this.dispatchEvent(new Event("play"))
      },
      content: `<svg xmlns="http://www.w3.org/2000/svg" width = "1em" viewBox="0 0 384 512"><<path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>`
    })
    rel.createChild("div", {
      style: {
        cursor: "pointer", display: "flex"
      }, 
      events: {
        click: () => this.dispatchEvent(new Event("save"))
      },
      content: `<svg xmlns="http://www.w3.org/2000/svg" width = "1em" viewBox="0 0 448 512"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>`
    })
    rel.createChild("div", {
      style: {
        cursor: "pointer", display: "flex"
      }, 
      events: {
        click: () => this.dispatchEvent(new Event("close"))
      },
      content: `<?xml version="1.0" encoding="UTF-8"?>
      <svg id="Layer_1" width = "1em" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6.02 6.02">
        <defs>
          <style>
            .cls-1 {
              fill: #fff;
              stroke-width: 0px;
            }
          </style>
        </defs>
        <path class="cls-1" d="m3.72,3.01L5.88.85c.2-.2.2-.51,0-.71s-.51-.2-.71,0l-2.16,2.16L.85.15C.66-.05.34-.05.15.15S-.05.66.15.85l2.16,2.16L.15,5.17c-.2.2-.2.51,0,.71.1.1.23.15.35.15s.26-.05.35-.15l2.16-2.16,2.16,2.16c.1.1.23.15.35.15s.26-.05.35-.15c.2-.2.2-.51,0-.71l-2.16-2.16Z"/>
      </svg>`
    })
  }

  /**
   * @callback onDataPoint
   * @param {DataPoint}
   */

  /** 
   * @param {DataPoint[]} data
   * @param {onDataPoint} callback
   * @param {boolean} realTime
   */
  async animate(data, callback, realTime) {
    if (this._animating) return;
    this._animating = true;
    this._stop = false;
      
    if (!this.shown) {
      this.buttons.shown = false;
      await this.show();
    } else {
      this.buttons.hide();
    }
    
    let lastTime = null
    for (let dp of data) {
      let time = dp[0];
      if (lastTime == null) lastTime = time;
      this.src = dp[2]
      if (callback instanceof Function) callback(dp);
      await delay(realTime ? time-lastTime : undefined);
      lastTime = time;
      if (this._stop) break;
    }
    await this.buttons.show();
    this._animating = false;
  }


  stop(){
    this._stop = true;
  }

  /**
   * @param {URL} src
   */
  set src(src) {
    this.image.props = {src: src};
  }
}

class EyeApp extends SvgPlus {
  async onconnect(){
    this.styles = {
      display: "block",
      width: "100%",
      height: "100%",
      position: "fixed",
      background: "white",

      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };  

    /** @type {ResultsWindow} */
    this.results = this.createChild(ResultsWindow, {
      events: {
        play: () => this.playRecording(),
        save: () => this.saveRecording(),
        close: () => this.closeResults(),
      }
    });


    /** @type {SvgResize} */
    let svgBackground = this.createChild(SvgResize, {
      width: `100%`,
      height: `100%`,
    });
    svgBackground.createGrid(7)
    svgBackground.start();
    svgBackground.show()


    await EyeGaze.load()
   

    /** @type {StartWindow} */
    this.start_window = this.createChild(StartWindow, {
      events: {
        click: () => {
          switch (this.start_window.state) {
            case "start":
            case "webcam-error":
              this.startWebcam();
              break;
            case "calibrate":
              this.calibrate();
              break;
          }
        }
      }
    })
    this.start_window.show();


    /** @type {FeedbackFrame} */
    this.feedback = this.createChild(FeedbackFrame, {styles: {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)"
    }});
    this.feedback.size = 0.5;


    /** @type {SvgResize} */
    let pointers = this.createChild(SvgResize, {styles: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      heigth: "100%",
      "user-select": "none",
      "pointer-events": "none"
    }})
    this.ghost = pointers.createPointer("relative");
    this.blob = pointers.createPointer("blob", 15, 10);
    pointers.start();
    pointers.show();


    /** @type {CalibrationParams} */
    this.params = this.createChild(CalibrationParams);
    
   
    /** @type {CalibrationFrame} */
    this.calibrator = this.createChild(CalibrationFrame);


    Webcam.addProcessListener((input) => this.onPrediction(input));


    window.addEventListener("keydown", (e) => {
      if (e.key == "s") {
        this.results.stop();
      } else if (e.key == "p") {
        this.params.toggleAttribute("shown");
      }
    })
  }

  async saveRecording(){
    if (!this._saving) {
      this._saving = true;
      this.results.buttons.disabled = true;

      // zip all data points together with file name $timesampe_$position_$calibration-type.jpeg
      const zipWriter = new zip.ZipWriter(new zip.BlobWriter("application/zip"));
      await Promise.all(
        images.map(([ts, pos, img, ctype]) => zipWriter.add(`${ts}_(${pos})_${ctype}.jpeg`, new zip.Data64URIReader(img)) )
      );

      // create blob from zip and download it
      let blob = await zipWriter.close();
      let a = this.createChild("a", {
        download: "eyedata_" + (new Date()).getTime() + ".zip",
        href: URL.createObjectURL(blob),
        textContent: "Download zip file",
      })
      a.click();

      this.results.buttons.disabled =false;
      this._saving = false;
    }
  }

  async startWebcam(){
    if (this._starting) return;
    this._starting = true;

    // start the web cam
    console.log("starting webcam");
    this.start_window.disabled = true;
    let webcam_on = await Webcam.startWebcam();
    console.log("webcam " + (webcam_on ? "started" : "failed to start"));
    
    // webcam started so display the calibration button and feedback
    if (webcam_on) {
      Webcam.startProcessing();
      await parallel(this.start_window.setState("calibrate"), this.feedback.show());
    
    // webcam failed show the webcam error message
    } else {
      if (this.start_window.state == "webcam-error")
        this.start_window.disabled = false;
      else 
        this.start_window.state = "webcam-error";
    }
    this._starting = false;
  }

  async playRecording(){
    await parallel(this.ghost.show(), this.blob.show());
    // animate results
    await this.results.animate(images, (dataPoint) => {
      // for each data point show where the calibration dot was
      this.ghost.position = dataPoint[1];
    })
    await parallel(this.ghost.hide(), this.blob.show());
  }

  async calibrate(){
    if (this._calibrating) return;
    this._calibrating = true;
    images = [];
    await parallel(this.calibrator.show(), this.feedback.hide());
    this.params.saveCookies();
    let params = this.params.value;
    EyeGaze.selectModel(params.model);
    await this.calibrator.calibrate(params);
    await this.calibrator.hide();
    await this.playRecording();
    this._calibrating = false;
  }

  async closeResults(){
    await parallel(this.results.hide(),
    this.feedback.show());
  }

  onPrediction(input){
    // push data point if recording
    if (this.calibrator.recording || this.capture) {
      images.push([(new Date()).getTime(), this.calibrator.position, input.canvas.toDataURL("image/jpeg"), this.calibrator.ctype]);
    }

    if (input.result) {
      let p = input.result;
      if (p.x > 1) p.x = 1;
      if (p.x < 0) p.x = 0;

      if (p.y > 1) p.y = 1;
      if (p.y < 0) p.y = 0;
      let r = this.blob.fromRelative(p);
      this.blob.position = r;
    }
  }
}


SvgPlus.defineHTMLElement(EyeApp)
