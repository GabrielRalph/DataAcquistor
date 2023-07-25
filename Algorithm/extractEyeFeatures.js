import {Vector3, Vector} from "../Utilities/vector3.js"

const WIDTH = 20;
const HEIGHT = 13;


// console.log(2*(WIDTH*HEIGHT + 4*3*3));

const W2H = HEIGHT/WIDTH;
const H2T = 0.5;
const BLINKRATIO = 0.17; // If the distance from the top of the eye to the bottom (height)
                         // is less than the width of the eye times the blink ratio
                         // the feature extraction will fail
const MINSIZERATIO = 0.9 // If the width of the eye is less than the min size ratio
                         // times the fixed width and height feature extraction
                         // will fail

let CA = document.createElement("canvas");
let CTX = CA.getContext("2d", {willReadFrequently: true});

function grayscale(pixels, width, height){
  var gray = new Uint8ClampedArray(pixels.length >> 2);
  var p = 0;
  var w = 0;
  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      var value = pixels[w] * 0.299 + pixels[w + 1] * 0.587 + pixels[w + 2] * 0.114;
      gray[p++] = value;

      w += 4;
    }
  }
  return gray;
};

function equalizeHistogram (src, step = 5) {
  var srcLength = src.length;
  let dst = src;
  if (!step) step = 5;

  // Compute histogram and histogram sum:
  var hist = Array(256).fill(0);

  for (var i = 0; i < srcLength; i += step) {
    ++hist[src[i]];
  }

  // Compute integral histogram:
  var norm = 255 * step / srcLength,
  prev = 0;
  for (var i = 0; i < 256; ++i) {
    var h = hist[i];
    prev = h += prev;
    hist[i] = h * norm; // For non-integer src: ~~(h * norm + 0.5);
  }

  // Equalize image:
  for (var i = 0; i < srcLength; ++i) {
    dst[i] = hist[src[i]];
  }
  return dst;
};

export function renderBoxSection(gray, canvas) {
  if (typeof gray === "string") gray = decodeUTF8(gray);
  let ctx = canvas.getContext('2d');
  let [w, h] = [WIDTH, HEIGHT];
  canvas.width = w;
  canvas.height = h;
  let data = new Uint8ClampedArray(gray.length * 4);

  for (let i = 0; i < gray.length; i++) {
    data[i*4] = gray[i];
    data[i*4 + 1] = gray[i];
    data[i*4 + 2] = gray[i];
    data[i*4 + 3] = 255;
  }

  ctx.putImageData(new ImageData(data, w, h), 0, 0);
}

function extractBoxSection(tl, bl, br, tr, canvas) {
  CA.height = canvas.height;
  CA.width = canvas.width;
  let lr = tr.sub(tl);
  let angle = Math.atan(Math.abs(lr.y)/Math.abs(lr.x));
  if (lr.y > 0) angle *= -1;

  let w = WIDTH;
  let h = HEIGHT;

  let ws = w/lr.norm();
  let hs = h/tl.dist(bl);
  CTX.resetTransform();
  CTX.scale(ws, hs);
  CTX.rotate(angle);
  CTX.translate(-tl.x, -tl.y);
  CTX.drawImage(canvas, 0, 0);
  CTX.save();
  let data = CTX.getImageData(0, 0, w, h);
  let gray = grayscale(data.data, w, h);
  // equalizeHistogram(gray, 5);
  return gray;
}

function getEyeBoxPoints(l, r, t, b){
  let lr = r.v3d.sub(l.v3d);
  let tb = b.v3d.sub(t.v3d);

  let w = lr.norm();
  let h = w * W2H
  let tbn = tb.norm();

  if (tbn < w * BLINKRATIO) throw 'blinking'
  if (w < WIDTH * MINSIZERATIO) throw 'to small'

  // Transform lr and tb by the y angle and z angle of lr
  // such that lr runs only along the x axis
  let ay = Math.atan(lr.z / lr.x);
  // console.log(Math.round(ay * 180/Math.PI) + "deg");
  let lr_ = lr.rotateY(ay);
  let tb_ = tb.rotateY(ay);
  let az = Math.atan(lr_.y / lr_.x);
  lr_ = lr_.rotateZ(-az);
  tb_ = tb_.rotateZ(-az);

  // set the transformed tb vector's x compent to 0 making it perpendicular
  // with the transformed lr vector
  tb_.x = 0;

  // transform tb back
  let tbr = tb_.rotateZ(az).rotateY(-ay);
  let up = tbr.dir().mul(h * H2T);
  let down = tbr.dir().mul(h - h*H2T);

  // return 2d vectors with stored 3d vectors
  let x13 = l.v3d.sub(up);
  let x1 = new Vector(x13);
  x1.v3d = x13;

  let x23 = l.v3d.add(down);
  let x2 = new Vector(x23);
  x2.v3d = x23;

  let x33 = r.v3d.add(down);
  let x3 = new Vector(x33);
  x3.v3d = x33;

  let x43 = r.v3d.sub(up);
  let x4 = new Vector(x43);
  x4.v3d = x43;

  return [x1, x2, x3, x4]
}

function encodeUTF8(uint8array) {
  let utf8 = "";
  for (let uint8 of uint8array) {
    utf8 += String.fromCharCode(uint8)
  }
  return utf8;
}

function decodeUTF8(utf8) {
  let n = utf8.length;
  let uint8array = new Uint8ClampedArray(n);
  for (let i = 0; i < n; i++) {
    uint8array[i] = utf8.charCodeAt(i);
  }
  return uint8array
}

function norm1(utf8){
  let norms = [];
  for (let val of utf8) {
    norms.push(val/255);
  }
  return norms;
}

function pixels2string(pixels) {
  let string = encodeUTF8(pixels);
  return string;
}

export function decode(string) {
  let ims = WIDTH * HEIGHT;
  let ps = 4 * 3 * 3;
  if (string.length != 2*(ims+ps)) throw "invalid input"

  let leftim = string.slice(0, ims);
  let leftps = string.slice(ims, ims + ps);
  let rightim = string.slice(ims + ps, ims*2 + ps);
  let rightps = string.slice(ims*2 + ps);

  let pl = new Float32Array(decodeUTF8(leftps).buffer);
  let pr = new Float32Array(decodeUTF8(rightps).buffer);

  let x = {
    left: {
      pixels: decodeUTF8(leftim),
      p1: [pl[0], pl[1], pl[2]],
      p2: [pl[3], pl[4], pl[5]],
      p3: [pl[6], pl[7], pl[8]],
    },
    right: {
      pixels: decodeUTF8(rightim),
      p1: [pr[0], pr[1], pr[2]],
      p2: [pr[3], pr[4], pr[5]],
      p3: [pr[6], pr[7], pr[8]],
    },
    feat: [...norm1(decodeUTF8(leftim)), ...norm1(decodeUTF8(rightim))],//, ...pl, ...pr],
    feat2: [...pl, ...pr],
  }
  return x;
}

export function extractEyeFeatures(points, canvas) {
  let {width, height, size3d} = points;
  let x = "";
  let boxes = {};
  let errors = [];
  for (let key of ["left", "right"]) {
    try {
      let {left, right, top, bottom} = points[key];
      let [x1, x2, x3, x4] = getEyeBoxPoints(left, right, top, bottom);
      boxes[key] = [x1, x2, x3, x4];
      let pdata = extractBoxSection(x1, x2, x3, x4, canvas);
      let farray = new Float32Array([
        ...x1.v3d.div(size3d).array(), ...x2.v3d.div(size3d).array(), ...x3.v3d.div(size3d).array()
      ]);
      x += pixels2string(pdata) + encodeUTF8(new Uint8ClampedArray(farray.buffer))
    } catch (e) {
      errors.push(`The ${key} eye is ${e}`)
    }
  }

  if (errors.length != 0) {
    throw errors.join(", ");
  }

  points.eyeboxes = boxes;

  return x;
}
