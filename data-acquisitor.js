import {SvgPlus, Vector} from "./SvgPlus/4.js"
import {FeedbackFrame} from "./UI/feedback-frame.js"
import {CalibrationFrame} from "./UI/calibration-frame.js"
import * as Firebase from "./Database/firebase.js"
import * as FaceMesh from "./Algorithm/FaceMesh.js"
import * as Webcam from "./Utilities/Webcam.js"
import {extractEyeFeatures, renderBoxSection, decode} from "./Algorithm/extractEyeFeatures.js"

function log() {
  let str = [...arguments].join('\t');
  console.log("%c"+str, "color: green");
}


async function delay(time){
  return new Promise((resolve, reject) => {
    if (time) {
      setTimeout(resolve, time);
    } else {
      window.requestAnimationFrame(resolve);
    }
  })
}

function linspace(start, end, incs) {
  let range = end - start;
  let dx = range / (incs - 1);
  let space = [];
  for (let i = 0; i < incs; i ++) space.push(start + i * dx);
  return space;
}

function minIdx(arr) {
  let mini = 0;
  for (let i = 0; i < arr.length; i++)
    if (arr[i] < arr[mini]) mini = i;
  return mini;
}
function diff(arr, val) {
  let arr2 = new Array(arr.length);
  for (let i = 0; i < arr.length; i++)
    arr2[i] = Math.abs(arr[i] - val);
  return arr2;
}




let lastFeatures = null;

Webcam.setPredictor((input) => {
  lastFeatures = null;
  try {
    let points = FaceMesh.getFacePointsFromVideo(input.video);
    if (!("left" in points)) throw 'No face detected'
    input.points = points;
    lastFeatures = extractEyeFeatures(points, input.canvas);
  } catch (e) {
    lastFeatures = null;
    log("prediction error:", e);
    throw e;
  }
  return lastFeatures;
})


const CENTERED = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  display: "flex",
  "flex-direction": "column",
  "align-items": "center",
  "gap": "1em"
}

class DataAcquisitor extends SvgPlus {
  onconnect(){
    this.styles = {display: "block", width: "100%", height: "100%", position: "relative", background: "white"};

    // Webcam and feeback process window
    let wcwindow = this.createChild("div", {styles: CENTERED});
    this.wcwindow = wcwindow;
      // Top Buttom
      this.msg = wcwindow.createChild("div", {
        content: "Click to start webcam and face tracking.",
        class: "btn",
        styles: {
          "text-align": "center",
        }
      })
      this.msg.onclick = () => this.btnclick();

      // Display Box
      let dbox = wcwindow.createChild("div", {styles: {
        width: "50vmin",
        overflow: "hidden",
        "border-radius": "1em",
      }});
      this.dbox = dbox;
        // Eye box
        let ebox = dbox.createChild("div", {styles: {display: "flex", position: "relative"}});
        this.eye2 = ebox.createChild("canvas", {styles: {width: "50%"}});
        this.eye1 = ebox.createChild("canvas", {styles: {width: "50%"}});
        // FeedbackFrame
        this.fb = dbox.createChild(FeedbackFrame);

        // Error message
        this.error = wcwindow.createChild("div", {content: "&nbsp;"});

    // Submition form window
    let submit = this.createChild("div", {styles: CENTERED});
    submit.styles = {display: "none"};
      this.submit = submit;
      let post = submit.createChild("div", {class: "btn", content: "Post"});
      post.onclick = () => this.postData();
      let watch = submit.createChild("div", {class: "btn", content: "Watch"});
      watch.onclick = () => this.watchData();
      let del = submit.createChild("div", {class: "btn", content: "Delete"});
      del.onclick = () => this.deleteData();

    // Calibrator
    this.calibrator = this.createChild(CalibrationFrame);

    // Statistics Frame
    this.stats = {};
    this.statswindow = this.createChild("div", {styles: {
      position: "fixed",
      top: 0,
      right: 0,
      "z-index": 100,
      "text-align":"right",
      display: "none"
    }});


    // Setup Feature Prediction Listener
    this.data = {};
    this.ewad = 0;
    this.max = 0;
    Webcam.addPredictionListener((input) => this.onPrediction(input))
  }

  onPrediction(input){
    let l = 0.9;
    let d = input.times.prediction - input.times.start;
    if (d > this.max) this.max = d;
    this.ewad = l * (d) + (1-l)*this.ewad;
    log("prediction", d);
    this.logStats("fexttime", Math.round(this.ewad) + "ms");
    this.logStats("mfexttime", Math.round(this.max) + "ms");
    this.showError(false);
    this.renderFace(input);
    if (!!input.error) {
      this.showError(input.error);
    } else {
      this.renderEyes(input.prediction);
      this.addFPoint(input);
    }
  }

  addFPoint(input) {
    let {calibrator, data} = this;
    let x = input.prediction;

    let ctype = calibrator.ctype;
    let cap = !!calibrator.recording && !!ctype && !input.error;
    if (cap) {
      if (!(ctype in data)) data[ctype] = [];
      data[ctype].push({
        x: x,
        y: calibrator.position + "",
        ts: input.times.capture,
      });
    }
  }
  logStats(key, value) {
    this.stats[key] = value;
    let html = "";
    for (let k in this.stats) {
      html += `<div>${this.stats[k]}\t:${k}</div>`
    }
    this.statswindow.innerHTML = html;
  }



  postData(){
    this.hideSubmit(true);
    Webcam.startPredictions();
    Firebase.addDataPoint(this.data);
  }
  async watchData(){
    log("WATCH DATA");
    this.hideSubmit(true);
    this.disableStart(true);
    this.fb.styles = {opacity: 0.5}
    for (let key in this.data) {
      let i = 0;
      for (let dp of this.data[key]) {
        this.renderEyes(dp.x);
        if (i != 0) await delay((dp.ts - this.data[key][i-1].ts)/4);
        else await delay();
        i++;
      }
    }
    this.fb.styles = {opacity: 1}
    this.disableStart(false);
    this.hideSubmit(false);
  }
  deleteData(){
    log("DELETE DATA");
    this.hideSubmit(true);
    this.data = {};
    Webcam.startPredictions();
  }

  async acquireData(){
    this.data = {};
    await this.calibrator.show();
    log('Data Acquisition: method 1');
    await this.calibrator.calibrate1();
    log('Data Acquisition: method 2');
    await this.calibrator.calibrate2();
    await this.calibrator.calibrate3();
    this.hideSubmit(false);
    Webcam.stopPredictions();
    this.filterData();
    log("data acquired");
    console.log(this.data);
    await this.calibrator.hide();
  }
  filterData(samples = 100){
    let {data} = this;
    for (let key in data) {
      let points = data[key];
      let tps = linspace(0, points.length - 1, samples);
      for (let i = 0; i < tps.length; i++) tps[i] = Math.round(tps[i]);
      let newPoints = new Array(samples);
      for (let i = 0; i < samples; i++) newPoints[i] = points[tps[i]];
      data[key] = newPoints;
    }
  }

  hideSubmit(op = true){
    this.submit.styles = {display: op ? "none":"flex"};
    this.wcwindow.styles = {opacity: op ? 1 : 0.2};
  }
  disableStart(op = true) {
    this.msg.styles = {
      opacity: op ? 0.5 : 1,
      "pointer-events": op ? "none" : "all",
    }
  }
  showError(error) {
    this.disableStart(error !== false);
    this.dbox.styles = {
      border: error !== false ? "2px solid red" : "none",
    }
    this.error.innerHTML = typeof error === "string" ? error : "&nbsp;"
  }

  renderEyes(features){
    let eyefeatures = decode(features);
    renderBoxSection(eyefeatures.left.pixels, this.eye1);
    renderBoxSection(eyefeatures.right.pixels, this.eye2);
  }
  renderFace(input) {
    let {svg} = this.fb;
    this.fb.updateCanvas(input.canvas);
    try {
      for (let key in input.points.eyeboxes) {
        let ps = input.points.eyeboxes[key];
        svg.createChild("path", {
          d: `M${ps[0]}L${ps[1]}L${ps[2]}L${ps[3]}Z`,
          fill: "#00ff0044"
        })
      }
    } catch(e){}
  }

  async btnclick(){
    if (this.is_tracking){
      await this.acquireData();
    } else {
      let res = await Webcam.startWebcam();
      if (res) {
        Webcam.startPredictions();
        this.msg.innerHTML = "Click to start data acquisition.";
        this.is_tracking = true;

      } else {
        this.msg.innerHTML = "You browser does not support webcam accesability, or the webcam is currently being used.<br/><br/>Click to try again.";
        this.is_tracking = false;
      }
    }
  }
}

SvgPlus.defineHTMLElement(DataAcquisitor);
