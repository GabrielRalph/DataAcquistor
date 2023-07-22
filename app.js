import {SvgPlus, Vector} from "../SvgPlus/4.js"
import * as EyeGaze from "../Algorithm/EyeGaze.js"
import * as FaceMesh from "../Algorithm/FaceMesh.js"
import {extractEyeFeatures, renderBoxSection, decode} from "../Algorithm/extractEyeFeatures.js"
import * as Webcam from "../Utilities/Webcam.js"
import {CalibrationFrame, HideShow} from "../UI/calibration-frame.js"
import {FeedbackFrame} from "../UI/feedback-frame.js"

async function delay(time){
  return new Promise((resolve, reject) => {
    if (time) {
      setTimeout(resolve, time);
    } else {
      window.requestAnimationFrame(resolve);
    }
  })
}

async function parallel() {
  let res = [];
  for (let argument of arguments) {
    res.push(await argument);
  }
  return res;
}

function pprops(color) {
  return
}

class EyesFeedbackFrame extends HideShow{
  constructor(el = "eyes-feedback"){
    super(el);
    this.size = 1;
    this.styles = {
      overflow: "hidden",
      "border-radius": "1em",
    };
    // Eye box
    this.eyebox = this.createChild("div", {styles: {overflow: "hidden", display: "flex", position: "relative"}});
    this.eye2 = this.eyebox.createChild("canvas", {styles: {width: "50%"}});
    this.eye1 = this.eyebox.createChild("canvas", {styles: {width: "50%"}});

      // FeedbackFrame
    this.fb = this.createChild(FeedbackFrame);
    Webcam.addPredictionListener((input) => this.renderFace(input));

  }

  set size(size){
    this._size = size;
    this.styles = {
      width: `${size * 100}vmin`
    }
  }
  get size(){
    return this._size;
  }

  hideEyes(){
    this.showEyes(false);
  }
  showEyes(show = true){
    if (show && !!this.eyes_hidden) {
      this.eyebox.styles = {height: "auto"}
      this.eyes_hidden = false;
    } else if (!show && !this.eyes_hidden) {
      this.eyebox.styles = {height: "0px"}
      this.eyes_hidden = true;
    }
  }

  ondblclick(){
    console.log(this.eyes_hidden);
    this.showEyes(!!this.eyes_hidden)
  }

  renderFace(input) {
    this.fb.updateCanvas(input.canvas);

    this.styles = {
      border: !!input.error ? "2px solid red" : "none",
      padding: !!input.error ? "0px" : "2px"
    }
    try {
      let eyefeatures = decode(input.prediction);
      renderBoxSection(eyefeatures.left.pixels, this.eye1);
      renderBoxSection(eyefeatures.right.pixels, this.eye2);
      let svg = this.fb.svg;
      for (let key in input.points.eyeboxes) {
        let ps = input.points.eyeboxes[key];
        svg.createChild("path", {
          d: `M${ps[0]}L${ps[1]}L${ps[2]}L${ps[3]}Z`,
          fill: "#00ff0044"
        })
      }
    } catch(e){}
  }
}

let COLORS = ["blue", "red", "purple", "orange"];
class Pointers extends SvgPlus {
  constructor(el = "div"){
    super(el)
    this.pi = 0;
    this.pointers = {};
    this.bounds = this.createChild("div", {styles: {
      position: "fixed",
      width: "10px",
      height: "10px",
      "border-radius": "10px",
      transform: "translate(-50%, -50%)",
      border: "2px solid #0005",
    }});
  }

  set(name, vec) {
    let abs = null;
    let {pointers} = this;
    if (name in pointers) {
      let style = {display: "none"}
      if (vec instanceof Vector) {
        abs = vec.mul(new Vector(window.innerWidth, window.innerHeight));
        style = {
          display: "block",
          top: abs.y + 'px',
          left: abs.x + 'px',
        }
      }
      pointers[name].styles = style;
      pointers[name].pos = abs;
    }
  }

  updateBounds(){
    let {pointers} = this;
    let mid = new Vector(0);
    let n = 0;
    for (let name in pointers) {
      if (pointers[name].pos instanceof Vector) {
        mid = mid.add(pointers[name].pos);
        n++;
      }
    }
    if (n > 0) mid = mid.div(n);

    let r = 0;
    for (let name in pointers) {
      if (pointers[name].pos instanceof Vector) {
        let rd = mid.dist(pointers[name].pos)
        if (rd > r) r = rd;
      }
    }
    let style = {display: "none"}
    if (r > 0) {
      style = {
        display: "block",
        top: mid.y + 'px',
        left: mid.x + 'px',
        width: 2*r + 'px',
        height: 2*r + 'px',
        "border-radius": r + 'px'
      }
    }
    this.bounds.styles = style;
  }

  add(name, color = COLORS[this.pi], size = 10) {
    this.pi ++;
    this.pointers[name] = this.createChild("div", {styles: {
      position: "fixed",
      width: size + "px",
      height: size + "px",
      "border-radius": "10px",
      transform: "translate(-50%, -50%)",
      background: color,
      display: "none",
    }});
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

    this.start_window = this.createChild(HideShow);
    this.start_message = this.start_window.createChild("div");
    this.start_window.styles = {
      position: "fixed",
      top: "2em",
      left: "50%",
      transform: "translate(-50%, 0)"
    };

    this.start_button = this.start_window.createChild(HideShow);
    this.start_button.props = {
      class: "btn",
      content: "Start Webcam",
    }
    this.start_button.onclick = () => {this.startWebcam();}
    this.start_button.shown = true;

    this.calibrate_button = this.start_window.createChild(HideShow);
    this.calibrate_button.props = {
      content: "Calibrate",
      class: "btn",
    }
    this.calibrate_button.onclick = () => {this.calibrate();}

    this.start_window.show(1000)
    // this.start_window.show(400);// = true;

    this.feedback = this.createChild(EyesFeedbackFrame);
    this.feedback.styles = {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)"
    }
    this.feedback.hideEyes();
    this.feedback.size = 0.5;
    //

    let pointers = this.createChild(Pointers);
    pointers.add("svm");
    pointers.add("ridge");
    pointers.add("ridgekalman");

    this.calibrator = this.createChild(CalibrationFrame);
    Webcam.addPredictionListener((input) => {
      if (this.calibrate_button.shown) {
        this.calibrate_button.disabled = !!input.error;
      }
      if (!input.error && this.calibrator.recording) {
        train_data.push([input.feature, this.calibrator.position]);
      }

      for (let pname in pointers.pointers) {
        let v = input.eye ? input.eyeall[pname] : null;
        pointers.set(pname, v);
      }
      pointers.updateBounds();
    })
  }

  async startWebcam(){
    console.log("starting webcam");
    this.start_button.disabled = true;
    let webcam_on = await Webcam.startWebcam();
    console.log("webcam " + (webcam_on ? "started" : "failed to start"));
    if (webcam_on) {
      Webcam.startPredictions();
      this.start_message.innerHTML = "";
      await parallel(this.start_button.hide(), this.feedback.show());
      this.start_button.disabled = false;
      await this.calibrate_button.show();
    } else {
      this.start_message.innerHTML = "You browser does not support webcam accesability, or the webcam is currently being used.<br/><br/>Click to try again."
      this.start_button.disabled = false;
    }
  }

  async calibrate(){
    await this.calibrator.show();
    this.feedback.styles = {transform: "none", top: "1em", left:"1em"};
    this.feedback.size = 0.2;
    // await this.calibrator.calibrate1();
    await this.calibrator.calibrate2();
    await this.calibrator.calibrate4();
    await this.calibrator.hide();
    EyeGaze.trainModel(train_data, Math.round(train_data.length * 0.8));
  }
}

let train_data = []

Webcam.setPredictor((input) => {
  let lastFeatures = null;
  try {
    let points = FaceMesh.getFacePointsFromVideo(input.video);
    if (!("left" in points)) throw 'No face detected'
    input.points = points;
    lastFeatures = extractEyeFeatures(points, input.canvas);
    let x = decode(lastFeatures).feat;
    let yall = {};
    let y = EyeGaze.predict(x, yall);
    input.feature = x;
    input.eye = y;
    input.eyeall = yall;
  } catch (e) {
    lastFeatures = null;
    console.log("prediction error:", e);
    throw e;
  }
  return lastFeatures;
})

SvgPlus.defineHTMLElement(EyeApp)
