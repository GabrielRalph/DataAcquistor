import {SvgPlus, Vector} from "../SvgPlus/4.js"

const glowFilter = `<filter id="sofGlow" height="300%" width="300%" x="-75%" y="-75%">
		<!-- Thicken out the original shape -->
		<feMorphology operator="dilate" radius="3" in="SourceGraphic" result="thicken" />
		<!-- Use a gaussian blur to create the soft blurriness of the glow -->
		<feGaussianBlur in="thicken" stdDeviation="3" result="blurred" />

		<feMerge>
			<feMergeNode in="blurred"/>
			<feMergeNode in="SourceGraphic"/>
		</feMerge>
	</filter>`
	async function parallel() {
	  let res = [];
	  for (let argument of arguments) {
	    res.push(await argument);
	  }
	  return res;
	}

async function transition(callBack, duration) {
  if (callBack instanceof Function) {
    let end = false;
    return new Promise((resolve, reject) => {
      let t0 = null
      callBack(0);
      let dt = 0;
			let tn = 0;
      let next = (tnow) => {
				tn = tnow;
        if (t0 == null) t0 = window.performance.now();
        dt = window.performance.now() - t0;
        let t = dt/duration;
        if (t > 1) {
          t = 1;
          end = true;
        }
        callBack(t);
        if (!end) {
          window.requestAnimationFrame(next);
        } else {
          resolve(true);
        }
      }
      window.requestAnimationFrame(next)
    });
  }
}

function linspace(start, end, incs) {
  let range = end - start;
  let dx = range / (incs - 1);
  let space = [];
  for (let i = 0; i < incs; i ++) space.push(start + i * dx);
  return space;
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
let P = [0.000000,0.005027,0.009426,0.014453,0.019480,0.024507,0.028906,0.033933,0.038960,0.043987,0.048385,0.053412,0.058439,0.063467,0.067865,0.072892,0.077919,0.082946,0.087345,0.092372,0.097399,0.102426,0.107453,0.112480,0.116879,0.121906,0.126933,0.131960,0.136987,0.142014,0.147041,0.152068,0.157095,0.162122,0.167149,0.172176,0.177204,0.182231,0.187258,0.192913,0.197940,0.202967,0.207994,0.213021,0.218677,0.223704,0.228731,0.234386,0.239413,0.245069,0.250096,0.255751,0.260778,0.266434,0.271461,0.277116,0.282772,0.287799,0.293454,0.299110,0.304765,0.310420,0.316076,0.321731,0.327387,0.333042,0.338698,0.344353,0.350008,0.356292,0.361948,0.368231,0.373887,0.380171,0.385826,0.392110,0.398394,0.404678,0.410961,0.417245,0.423529,0.429813,0.436097,0.443009,0.449293,0.456205,0.462489,0.469401,0.476313,0.483225,0.490137,0.497050,0.503962,0.511502,0.518415,0.525955,0.533496,0.540408,0.547949,0.556118,0.563658,0.571199,0.579368,0.587537,0.595706,0.603874,0.612043,0.620212,0.629010,0.637807,0.645976,0.654773,0.664199,0.672996,0.681794,0.691220,0.700645,0.710071,0.719497,0.728922,0.738348,0.747774,0.757828,0.767254,0.776679,0.786733,0.796159,0.806213,0.815639,0.825065,0.835119,0.844545,0.853970,0.863396,0.872822,0.881619,0.891045,0.899842,0.909268,0.918065,0.926863,0.935660,0.943829,0.952626,0.960795,0.968964,0.977133,0.985302,0.993471,1.001012,1.009180,1.016721,1.024262,1.031802,1.039343,1.046883,1.054424,1.061336,1.068248,1.075789,1.082701,1.089613,1.096525,1.102809,1.109721,1.116634,1.122918,1.129830,1.136114,1.142397,1.148681,1.155593,1.161877,1.167533,1.173816,1.180100,1.186384,1.192039,1.198323,1.204607,1.210263,1.215918,1.222202,1.227857,1.233513,1.239168,1.244823,1.250479,1.256134,1.261790,1.267445,1.273101,1.278756,1.284412,1.289439,1.295094,1.300749,1.305776,1.311432,1.316459,1.322114,1.327141,1.332797,1.337824,1.342851,1.348506,1.353533,1.358561,1.364216,1.369243,1.374270,1.379297,1.384324,1.389351,1.395007,1.400034,1.405061,1.410088,1.415115,1.420142,1.425169,1.430196,1.435223,1.440250,1.444649,1.449676,1.454703,1.459730,1.464757,1.469784,1.474811,1.479210,1.484237,1.489264,1.494291,1.499318,1.503717,1.508744,1.513771,1.518798,1.523196,1.528223,1.533251,1.538278,1.542676,1.547703,1.552730,1.557757,1.562156,1.567183,1.572210,1.576609,1.581636,1.586663,1.591690,1.596089,1.601116,1.606143,1.610541,1.615568,1.620596,1.625623,1.630021,1.635048,1.640075,1.645102,1.650129,1.654528,1.659555,1.664582,1.669609,1.674636,1.679035,1.684062,1.689089,1.694116,1.699143,1.704170,1.709197,1.714224,1.719251,1.724278,1.729306,1.734333,1.739360,1.744387,1.749414,1.754441,1.759468,1.764495,1.770150,1.775177,1.780204,1.785231,1.790887,1.795914,1.800941,1.806596,1.811623,1.816651,1.822306,1.827333,1.832988,1.838644,1.843671,1.849326,1.854353,1.860009,1.865664,1.871320,1.876975,1.882631,1.888286,1.893941,1.899597,1.905252,1.910908,1.916563,1.922847,1.928502,1.934158,1.940442,1.946097,1.952381,1.958665,1.964320,1.970604,1.976888,1.983172,1.989455,1.995739,2.002023,2.008935,2.015219,2.021503,2.028415,2.035327,2.041611,2.048523,2.055435,2.062348,2.069888,2.076800,2.083713,2.091253,2.098165,2.105706,2.113247,2.120787,2.128328,2.136497,2.144037,2.152206,2.160375,2.168544,2.176713,2.184882,2.193051,2.201848,2.210646,2.219443,2.228240,2.237038,2.245835,2.255261,2.264058,2.273484,2.282910,2.292335,2.301761,2.311815,2.321241,2.330666,2.340721,2.350146,2.359572,2.369626,2.379052,2.389106,2.398532,2.407957,2.417383,2.426809,2.436235,2.445660,2.455086,2.463883,2.473309,2.482106,2.490904,2.499701,2.508498,2.516667,2.525465,2.533634,2.541803,2.549972,2.558141,2.566310,2.573850,2.582019,2.589560,2.597100,2.604641,2.612181,2.619722,2.626634,2.634175,2.641087,2.647999,2.654911,2.661823,2.668736,2.675648,2.682560,2.688844,2.695756,2.702040,2.708324,2.715236,2.721520,2.727804,2.734087,2.740371,2.746655,2.752310,2.758594,2.764878,2.770533,2.776817,2.782473,2.788128,2.794412,2.800067,2.805723,2.811378,2.817034,2.822689,2.828345,2.834000,2.839655,2.845311,2.850966,2.856622,2.861649,2.867304,2.872960,2.877987,2.883642,2.888669,2.894325,2.899352,2.905007,2.910034,2.915061,2.920717,2.925744,2.930771,2.935798,2.941453,2.946480,2.951507,2.956534,2.961561,2.966588,2.971615,2.976643,2.981670,2.987325,2.991724,2.996751,3.001778,3.006805,3.011832,3.016859,3.021886,3.026913,3.031940,3.036967,3.041994,3.046393,3.051420,3.056447,3.061474,3.066501,3.070900,3.075927,3.080954,3.085981,3.090380,3.095407,3.100434,3.105461,3.109859,3.114886,3.119913,3.124312,3.129339,3.134366,3.139393,3.143792,3.148819,3.153846,3.158873,3.163272,3.168299,3.173326,3.177725,3.182752,3.187779,3.192806,3.197204,3.202231,3.207259,3.212286,3.216684,3.221711,3.226738,3.231765,3.236792,3.241191,3.246218,3.251245,3.256272,3.261299,3.266326,3.271353,3.276380,3.281408,3.286435,3.291462,3.295860,3.301516,3.306543,3.311570,3.316597,3.321624,3.326651,3.331678,3.336705,3.341732,3.347388,3.352415,3.357442,3.362469,3.368124,3.373151,3.378178,3.383834,3.388861,3.394516,3.399543,3.405199,3.410226,3.415881,3.421537,3.426564,3.432219,3.437874,3.443530,3.449185,3.454841,3.460496,3.466152,3.471807,3.477462,3.483118,3.488773,3.495057,3.500713,3.506368,3.512652,3.518307,3.524591,3.530875,3.536530,3.542814,3.549098,3.555382,3.561666,3.567949,3.574862,3.581145,3.587429,3.594341,3.600625,3.607537,3.614450,3.621362,3.628274,3.635186,3.642098,3.649011,3.656551,3.663463,3.671004,3.678545,3.686085,3.693626,3.701166,3.709335,3.716876,3.725045,3.733214,3.741383,3.749552,3.757721,3.766518,3.774687,3.783484,3.792282,3.801079,3.809876,3.819302,3.828099,3.837525,3.846951,3.856376,3.865802,3.875228,3.884654,3.894079,3.904133,3.913559,3.923613,3.933039,3.942465,3.952519,3.961945,3.971370,3.981424,3.990850,4.000276,4.009702,4.019127,4.027925,4.037350,4.046148,4.054945,4.063742,4.072540,4.081337,4.090134,4.098303,4.106472,4.114641,4.122810,4.130979,4.139148,4.146689,4.154858,4.162398,4.169939,4.177479,4.185020,4.191932,4.199473,4.206385,4.213297,4.220838,4.227750,4.234662,4.241574,4.247858,4.254770,4.261682,4.267966,4.274250,4.281162,4.287446,4.293730,4.300014,4.306298,4.312581,4.318865,4.324521,4.330804,4.337088,4.342744,4.349027,4.354683,4.360338,4.366622,4.372278,4.377933,4.383588,4.389244,4.394899,4.400555,4.406210,4.411866,4.417521,4.423176,4.428832,4.433859,4.439514,4.444541,4.450197,4.455852,4.460879,4.466535,4.471562,4.476589,4.482244,4.487271,4.492298,4.497954,4.502981,4.508008,4.513035,4.518690,4.523717,4.528745,4.533772,4.538799,4.543826,4.548853,4.553880,4.558907,4.563934,4.568961,4.573988,4.579015,4.584042,4.589069,4.594096,4.599123,4.604150,4.608549,4.613576,4.618603,4.623630,4.628657,4.633056,4.638083,4.643110,4.648137,4.653164,4.657563,4.662590,4.667617,4.672644,4.677043,4.682070,4.687097,4.691495,4.696522,4.701549,4.706576,4.710975,4.716002,4.721029,4.725428,4.730455,4.735482,4.740509,4.744908,4.749935,4.754962,4.759989,4.764388,4.769415,4.774442,4.779469,4.783867,4.788894,4.793921,4.798949,4.803976,4.808374,4.813401,4.818428,4.823455,4.828482,4.833509,4.838537,4.842935,4.847962,4.852989,4.858016,4.863043,4.868070,4.873098,4.878125,4.883152,4.888179,4.893834,4.898861,4.903888,4.908915,4.913942,4.918969,4.924625,4.929652,4.934679,4.940334,4.945361,4.950388,4.956044,4.961071,4.966726,4.971753,4.977409,4.982436,4.988091,4.993747,4.998774,5.004429,5.010085,5.015740,5.021396,5.027051,5.032706,5.038362,5.044017,5.049673,5.055328,5.060984,5.067267,5.072923,5.078578,5.084862,5.091146,5.096801,5.103085,5.109369,5.115653,5.121308,5.127592,5.134504,5.140788,5.147072,5.153356,5.160268,5.166552,5.173464,5.180376,5.186660,5.193572,5.200484,5.207396,5.214937,5.221849,5.228761,5.236302,5.243843,5.251383,5.258924,5.266464,5.274005,5.282174,5.289714,5.297883,5.306052,5.314221,5.322390,5.330559,5.339356,5.347525,5.356323,5.365120,5.373917,5.383343,5.392141,5.401566,5.410364,5.419789,5.429215,5.438641,5.448066,5.458121,5.467546,5.476972,5.487026,5.496452,5.506506,5.515932,5.525357,5.535411,5.544837,5.554263,5.563689,5.573114,5.582540,5.591966,5.601392,5.610189,5.618986,5.628412,5.637209,5.645378,5.654176,5.662973,5.671142,5.679311,5.687480,5.695649,5.703818,5.711987,5.719527,5.727068,5.735237,5.742777,5.749690,5.757230,5.764771,5.771683,5.779223,5.786136,5.793048,5.799960,5.806872,5.813784,5.820697,5.826980,5.833893,5.840176,5.847089,5.853372,5.859656,5.865940,5.872224,5.878508,5.884792,5.891075,5.897359,5.903015,5.909298,5.914954,5.921238,5.926893,5.933177,5.938832,5.944488,5.950143,5.955799,5.961454,5.967109,5.972765,5.978420,5.984076,5.989731,5.995387,6.000414,6.006069,6.011725,6.016752,6.022407,6.027434,6.033090,6.038117,6.043772,6.048799,6.054454,6.059482,6.064509,6.070164,6.075191,6.080218,6.085245,6.090272,6.095928,6.100955,6.105982,6.111009,6.116036,6.121063,6.126090,6.131117,6.136144,6.141171,6.146198,6.151225,6.156252,6.161279,6.166306,6.170705,6.175732,6.180759,6.185786,6.190813,6.195840,6.200239,6.205266,6.210293,6.215320,6.219719,6.224746,6.229773,6.234800,6.239199,6.244226,6.249253,6.254280,6.258678,6.263705,6.268733,6.273760,6.278158,6.28318];


function lurp4(x, y, tl, tr, bl, br) {
	let xt = tl.mul(1-x).add(tr.mul(x));
	let xb = bl.mul(1-x).add(br.mul(x));
	let p = xt.mul(1-y).add(xb.mul(y));
	return p;
}
function dotGrid(size, tl, tr, bl, br) {
	let dd = 1 / (size - 1);
	let points = [];
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			let p = lurp4(x*dd, y*dd, tl, tr, bl, br);
			points.push(p);
		}
	}
	return points;
}

class HideShow extends SvgPlus {
  constructor(el = "div") {
    super(el);
    this.shown = false;
  }

	set opacity(o){
		this.props = {
			opacity: o,
			styles: {opacity: o}
		}
	}

	set disabled(value) {
		this.opacity = value ? 0.5 : 1;
		this.styles = {"pointer-events": value ? "none" : "all"}
	}

  async show(duration = 400, hide = false) {
    // console.log(hide, this.hidden);
    if (this.hidden == hide || this._transitioning) return;
    this._transitioning = true;
    if (!hide) this.styles = {display: "block", opacity: 0}
    await this.waveTransition((t) => {
      this.opacity = t;
    }, duration, !hide);
    this.shown = !hide;
    this._transitioning = false;
  }
	async hide(duration = 400) {
		await this.show(duration, true);
	}

  set shown(value) {
    value = !value;
    if (value) {
			this.opacity = 0;
      this.styles = {display: "none", "pointer-events": "none"};
    } else {
			this.opacity = 1;
      this.styles = {display: "block", "pointer-events": "all"};
    }
		this.hidden = value;
    this._hidden = value;
  }
  get shown(){return !this._hidden;}
}

class SvgResize extends SvgPlus {
  constructor(){
    super("svg");
		this.stop = () => {};
    this.styles = {width: "100%", height: "100%"}
  }
  resize(){
    let bbox = this.getBoundingClientRect();
    this.props = {viewBox: `0 0 ${bbox.width} ${bbox.height}`};
    this.W = bbox.width;
    this.H = bbox.height;
  }
	draw(){}

	resizeOnFrame(){this.start()}
  start(){
		let stop = false;
		this.stop();
		this.stop = () => {stop = true}
    let next = () => {
			if (!stop) {
				this.resize();
				this.draw();
				window.requestAnimationFrame(next);
			} else {
				this.stop = () => {}
			}
    }
    window.requestAnimationFrame(next);
  }
}

class CPointer extends HideShow {
  constructor(size) {
    super("g");

		this.circle = this.createChild("circle", {fill: "red"})
		this.circle2 = this.createChild("circle", {fill: "darkred"})
    this.tg = new HideShow("g");
		this.circle3 = this.tg.createChild("circle", {fill: "red"})
		this.textel = this.tg.createChild("text", {"text-anchor": "middle", fill: "white"});
		this.appendChild(this.tg);
		this.size = size;
  }

	async showText(duration = 400) {await this.tg.show(duration)}
	async hideText(duration = 400) {await this.tg.hide(duration)}

	set text(value) {
		this.textel.innerHTML = value;
	}

	set size(size) {
		this.circle.props = {r: size};
		this.circle2.props = {r: size/5};
		this.circle3.props = {r: size/1.5};
		this.textel.props = {"font-size": size * 1.2, y: size * 0.4};
	}


  set position(v) {
    let svg = this.ownerSVGElement;
    try {
      this.props = {
        transform: `translate(${v.x * svg.W}, ${v.y * svg.H})`,
      }
      this._position = v.clone();
    } catch (e) {}
  }

  get position(){
    let p = new Vector(0);
    if (this._position instanceof Vector) p = this._position.clone();
    return p;
  }

  async moveTo(end, duration) {
    try {
      let start = this.position;
      await transition((t) => {
        this.position = start.mul(1 - t).add(end.mul(t));
      }, duration);
    } catch (e) {}
  }
}

class CalibrationFrame extends HideShow {
  constructor(el = "calibration-frame"){
    super(el);
    if (typeof el === "string") this.onconnect();

  }
  onconnect(){
    this.styles = {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "white"
    }
    let rel = this.createChild("div", {styles: {
      position: "relative",
      width: "100%",
      height: "100%"
    }});


    let svg = rel.createChild(SvgResize);
    svg.resizeOnFrame();
    svg.createChild("defs", {content: glowFilter})
    let pointer = new CPointer(15);
		// pointer.props = {filter: "url(#sofGlow)"}
    svg.appendChild(pointer);


		let message = new HideShow("div");
		message.styles = {
			position: "absolute",
			top: "50%",
			left: "50%",
			transform: "translate(-50%, -50%)",
			"text-align": "center",
			"font-size": "1.5em",
		}
		this.appendChild(message);
		this.message = message;

    this.pointer = pointer;
  }

	get pad(){return 0.03;}

  get topleft(){return new Vector(this.pad, this.pad);}
	get tl(){return this.topleft;}
  get topright(){return new Vector(1-this.pad, this.pad);}
	get tr(){return this.topright;}
  get bottomleft(){return new Vector(this.pad, 1-this.pad);}
	get bl(){return this.bottomleft;}
  get bottomright(){return new Vector(1-this.pad, 1-this.pad);}
	get br(){return this.bottomright;}


	async calibrate1(grid = 3, counts = 4) {
		let {tl, tr, bl, br} = this;
		this.ctype = "grid" + grid;
		let points = dotGrid(grid, tl, tr, bl, br);
		await this.showMessageCountDown("Focus on the red dot<br/>as it appears on the screen.<br/>$$");
		await this.calibrateAtPoints(points, counts);
	}

	async showMessageCountDown(text, count = 3) {
		let textf = (i) => text.replace("$$", i)
		this.message.innerHTML = textf("&nbsp;");
		await this.message.show();
		for (let i = count; i > 0; i--) {
			this.message.innerHTML = textf(i);
			await delay(1000);
		}
		await this.message.hide();
	}

  async calibrate2(speed = 1, f = 3) {
    this.ctype = "path";
    let {pointer} = this;
    let p0 = this.topleft;
    let ps = this.bottomright.sub(p0);
    let c = p0.add(ps.div(2));
    let r2 = 1/0.7698;
    pointer.position = c;
		await this.showMessageCountDown("Focus on the red dot<br/>as it moves along the screen.<br/>$$")
    await pointer.show();
		this.recording = true;

		let del = speed/P.length;
		// console.log(del);
		for (let t of P) {
			let t0 = window.performance.now()
			let w = new Vector(Math.cos(t)*Math.sin(2*t)*r2, Math.sin(t)*Math.sin(2*t)*r2);
			pointer.position = c.add(w.mul(ps.div(2)));
			for (let i = 0; i < speed; i++) await delay();
    };
		this.recording = false;
    await pointer.hide();
  }

	async calibrate4(number = 20, counts = 1){
		let {pointer} = this;

		pointer.position = this.topleft;
		await this.showMessageCountDown("Focus on the red dot<br/>as it moves along the screen.<br/>$$")
    await pointer.show();
		this.recording = true;
		await pointer.moveTo(this.topright, 6000);
		await pointer.moveTo(this.bottomright, 6000);
		await pointer.moveTo(this.bottomleft, 6000);
		await pointer.moveTo(this.topleft, 6000)
		this.recording = false;
		await pointer.hide();
	}

	async calibrate3(number = 20, counts = 1){
		let {tr, tl, bl, br} = this;
		this.ctype = "random"
		let points = [];
		for (let i = 0; i < number; i++) {
			points.push(lurp4(Math.random(), Math.random(), tl, tr, bl, br));
		}
		await this.showMessageCountDown("Focus on the red dot<br/>as it appears randomly on the screen.<br/>Move your head a little as you do so.<br/> $$", 5);
		await this.calibrateAtPoints(points, counts);
	}

	async calibrate5(number = 20, counts = 1){
		let {pointer} = this;

		let ext = [[this.tl, this.bl, this.tr, this.br], [this.tl, this.tr, this.bl, this.br]];
		await this.showMessageCountDown("Focus on the red dot<br/>as it moves along the screen.<br/>$$")
		for (let [pa1, pa2, pb1, pb2] of ext) {
			let pairs = linspace(1, 0, 5).map(t =>
				[pa1.mul(t).add(pa2.mul(1-t)),pb1.mul(t).add(pb2.mul(1-t))]
			)
			for (let [left, right] of pairs) {
				pointer.position = left;
				await pointer.show();
				this.recording = true;
				await pointer.moveTo(right, 6000);
				this.recording = false;
				await pointer.hide();
			}
		}
	}



	async calibrateAtPoints(points, counts) {
		let {pointer} = this;
		for (let p of points) {
			pointer.position = p;
			await pointer.show(1000);
			this.recording = true;
			for (let s = 0; s < counts; s++){
				pointer.text = s+1;
				await pointer.showText(500);
				await pointer.hideText(500)
			}
			this.recording = false;
			await pointer.hide();
		}
	}



  startRecordingIntervals(interval){
    if (this._recording) return;
    this._recording = true;
    let next = () => {
      if (this._recording) {
        this.record();
        setTimeout(next, interval);
      }
    }
    setTimeout(next, interval);
  }
  stopRecordingIntervals(){
    this._recording = false;
  }

  record(){
    let pos = this.position;
    const event = new Event('record');
    event.position = pos;
    event.ctype = this.ctype;
    this.dispatchEvent(event);
  }

  get position() {
    return this.pointer.position;
  }

  async show(hide) {
    if (!hide) {
      this.styles = {
        "cursor": "none",
        display: "block"
      }
    }
    await super.show(hide);
    if (hide) {
      this.styles = {
        "cursor": "auto",
        display: "none"
      }
    }
  }
}

// SvgPlus.defineHTMLElement(CalibrationFrame);
export {CalibrationFrame, HideShow, SvgResize, dotGrid}
