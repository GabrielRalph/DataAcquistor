import {SvgPlus, Vector} from "../SvgPlus/4.js"

class FeedbackFrame extends SvgPlus {
  constructor(el = "feedback-frame"){
    super(el);
    if (typeof el === "string") this.onconnect();

    let opacity = 0;
    let fader = () => {
      if (this.fade) opacity -= 0.02;
      else opacity = 1;
      if (this.msg){
        this.msg.styles = {opacity: opacity};
      }
      window.requestAnimationFrame(fader);
    }
    window.requestAnimationFrame(fader);
  }
  onconnect(){
    this.innerHTML = "";
		this.styles = {
      display: "flex",
      transform: "scale(-1, 1)"
      
    }
    let rel = this.createChild("div", {styles: {
			position: "relative",
			display: "inline-flex",
			width: "100%",
		}});
    this.canvas = rel.createChild("canvas", {styles: {
			width: "100%",
		}});
    this.svg = rel.createChild("svg", {styles:{
			position: "absolute",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			opacity: 0,
		}});
    this.msg = rel.createChild("div", {class: "msg",styles:{
			position: "absolute",
			opacity: 0,
		}});
  }

  updateCanvas(source, clear = true) {
    let {canvas, svg} = this;
    try {
      let {width, height} = source;
      canvas.width = width;
      canvas.height = height;
      let destCtx = canvas.getContext('2d');
      destCtx.drawImage(source, 0, 0);
      svg.props = {viewBox: `0 0 ${width} ${height}`, style: {opacity: 1}}
    } catch (e) {
      console.log(e);
      svg.styles = {opacity: 0}
    }

		if (clear) svg.innerHTML = ""
  }

  set error(value) {
    let {msg, svg} = this;
    if (value != null) {
      msg.innerHTML = value;
      this.fade = false;
    } else {
      this.fade = true;
    }
    svg.toggleAttribute('valid', value == null);
  }

  transform(x,y,scale,angle,group) {
    let p = new Vector(x, y);
    p = p.div(scale);
    p = p.rotate(-angle);
		let transform = `rotate(${angle*180/Math.PI}) scale(${s}) translate(${p.x}, ${p.y})`
    if (group) group.setAttribute('transform', transform);
		return transform;
  }
}

// SvgPlus.defineHTMLElement(FeedbackFrame);
export {Vector, FeedbackFrame}
