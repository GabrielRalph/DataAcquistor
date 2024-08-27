
const MODEL_SRCS = [
    // "./RidgeReg/RRVectors.js",
    "./RidgeReg/RRVectorsRed.js",
    // "./RidgeReg/RRVectorsRedRed.js",
    "./EModel/emodel150.js",
    "./EModel/emodelf13.js",
    "./EModel/emodel-500.js",
    "http://127.0.0.1:5505/model.js"
    // "./EModel/class_model.js",
    // "./EModel/class_model_f.js",
]

let Models = {};
for (let url of MODEL_SRCS) {
    try {
        let model = (await import(url)).default
        console.log(model.name);
        if (model.name) {
          Models[model.name] = model;
        } else {
          console.log(`The model at ${url} is not a valid model.`);
        }
    } catch (e) {
        console.log(`The model at ${url} was unable to load.`, e)
    }
}

function getModels(){
    let mods = {};
    for (let key in Models) {
        mods[key] = Models[key];
    }
    return mods;
}

function getModelColors(){
  let colors = {};
  for (let key in Models) {
      colors[key] = Models[key].color;
  }
  return colors;
}

function getModel(key){
  let model = null;
  if (key in Models) {
    model = Models[key];
  }
  return model;
}


export {getModels, getModel, getModelColors}
