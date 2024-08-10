import {Vector} from "../../SvgPlus/4.js"
import {FloatingBox, HideShow, SvgCanvas, SvgPlus} from "../../Utilities/basic-ui.js"
import {Webcam} from "../Algorithm/EyeGaze.js"

// const FEATURE_SET_2 = [398, 253, 386, 359, 173, 23, 130, 159,468,473,469, 470, 471, 472,474, 475, 476, 477, 4, 243, 463];
// const FEATURE_SET = [112, 26, 22, 23, 24, 110, 25, 33, 246, 161, 160, 159, 158, 157, 173, 243, 469, 470, 471, 472, 468, 463, 398, 384, 385, 386, 387, 388, 466, 263, 255, 339, 254, 253, 252, 256, 341, 474, 475, 476, 477, 473, 4, 243, 463]
const FEATURE_SET = [398, 253, 386, 359, 173, 23, 130, 159, 468, 473, 4, 243, 463];
export class FeedbackFrame extends HideShow{
  constructor(el = "feedback-frame"){
    super(el);
    this.size = 1;
  
    // Eye box
    this.eyebox = this.createChild("div", {styles: {overflow: "hidden", display: "flex", position: "relative"}});
    this.left = this.eyebox.createChild(SvgCanvas, {styles: {width: "50%"}});
    this.right = this.eyebox.createChild(SvgCanvas, {styles: {width: "50%"}});

      // FeedbackFrame
    this.svgCanvas = this.createChild(SvgCanvas);
    Webcam.addProcessListener(({features, canvas}) => this.renderFeatures(features, canvas));

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


  renderTransformVector(features) {
    let svg = this.svgCanvas.svg;
    let {offset, direction} = features.transform;
    let p2 = offset.v3d.sub(direction.mul(50));
    svg.createChild("path", {
      stroke: "black",
      "stroke-width": 3,
      d: `M${offset}L${p2.x},${p2.y}`
    })
  }

  /** @param {import("../Algorithm/extractEyeFeatures.js").Features} features */
  renderPointsOnEyes(features) {
    let {svg} = this.svgCanvas;
    features.facePoints.lefteye.all.map(v => {
      svg.createChild("circle", {r: 1, cx: v.x, cy: v.y});
    })
    features.facePoints.righteye.all.map(v => {
      svg.createChild("circle", {r: 1, cx: v.x, cy: v.y});
    })
    FEATURE_SET.map(i => features.facePoints.all[i]).map(v2 => {
      svg.createChild("circle", {r: 1, fill: "red", cx: v2.x, cy: v2.y});
    })
  }

  /** @param {import("../Algorithm/extractEyeFeatures.js").Features} features */
  renderEyes(features){
    let svg = this.svgCanvas.svg;

    for (let key of ["left", "right"]) {
      if (features[key].pixels) {
        features[key].pixels.render(this[key].canvas);
        this[key].updateSize();
        let {rotation, translation, scale} = features[key].transform;

        features.facePoints[key + "eye"].pupil.map(v => {
          let v2 = v.sub(translation).mul(scale).rotate(rotation);
          this[key].svg.createChild("circle", {r: 1, fill: "blue", cx: v2.x, cy: v2.y});
        })

        features.facePoints[key + "eye"].iris.map(v => {
          let v2 = v.sub(translation).mul(scale).rotate(rotation);
          this[key].svg.createChild("circle", {r: 1, fill: "red", cx: v2.x, cy: v2.y});
        })
        
        FEATURE_SET.map(i => features.facePoints.all[i]).map(v => {
          let v2 = v.sub(translation).mul(scale).rotate(rotation);
          this[key].svg.createChild("circle", {r: 1, fill: "red", cx: v2.x, cy: v2.y});
        })
      }


      if (features[key].box.topLeft) {
        let {topLeft, topRight, bottomRight, bottomLeft, warning} = features[key].box;
        svg.createChild("path", {
          d: `M${topLeft}L${topRight}L${bottomRight}L${bottomLeft}Z`,
          fill: warning ? "#ff000044" : "#00ff0044"
        })
      }
    }

    

    // let i =0;
    // features.facePoints.all.map(v => {
    //   i++;
    //   svg.createChild("text", {"font-size": 3, content: i, fill: "blue", "text-anchor": "middle", x: v.x, y: v.y});
    // })
  }


  renderFeatures(features, canvas) {
    if (!canvas) {
      canvas = new SvgPlus("canvas");
      canvas.width = features.videoWidth;
      canvas.height = features.videoHeight;
    } 
    this.svgCanvas.updateCanvas(canvas);


    for (let rtype of ["renderEyes", "renderPointsOnEyes"]){
      try {
        this[rtype](features);
      } catch (e){}
    }
    
  }

  /**
   * @param {any} stream
   */
  set videoStream(stream) {
    this.svgCanvas.video.srcObject = stream;
  }
}
