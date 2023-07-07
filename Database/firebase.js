import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-app.js'
import {getAuth, signInWithRedirect, GoogleAuthProvider, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-auth.js'
import {getDatabase, child, push, ref, get, onValue, onChildAdded, onChildChanged, onChildRemoved, set, off} from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-database.js'

function delay(t) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, t);
  });
}

const firebaseConfig = {
  apiKey: "AIzaSyChiEAP1Rp1BDNFn7BQ8d0oGR65N3rXQkE",
  authDomain: "eyesee-d0a42.firebaseapp.com",
  databaseURL: "https://eyesee-d0a42-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "eyesee-d0a42",
  storageBucket: "eyesee-d0a42.appspot.com",
  messagingSenderId: "56834287411",
  appId: "1:56834287411:web:999340ed2fd5165fa68046"
};

const App = initializeApp(firebaseConfig);
const Database = getDatabase(App);


let deviceType = [
    navigator.platform,
    navigator.userAgent,
    navigator.appVersion,
    navigator.vendor,
    window.opera
].join("/");
let deviceUID = localStorage.getItem("DID");
console.log("%c"+deviceType + "\n" + deviceUID, "color: orange");
if (!deviceUID || typeof deviceUID !== "string" || deviceUID.length < 3) {
  console.log("%cNew Key", "color: orange");
  deviceUID = Date.now();
  localStorage.setItem("DID", deviceUID);
}
console.log("%c"+deviceUID, "color: orange");


export function addDataPoint(dataPoint) {
  let dparsed = {};
  for (let key in dataPoint) {
    try {
      let ppoints = [];
      for (let point of dataPoint[key]) {
        ppoints.push({
          x: point.x,
          y: point.y,
        })
      }
      dparsed[key] = ppoints;
    } catch(e){}
  }

  set(child(dUIDRef(), "device"), deviceType);
  push(dUIDRef(), {
    date: Date.now(),
    points: dparsed,
  })
  console.log("%cPOST DATA", "color: orange");

}


export function dUIDRef() {
  let sref = null;
  if (Database != null) {
    sref = ref(Database, "dataset/" + deviceUID);
  }
  return sref;
}
