// Variables //

var width = 1280;
var height = 0;

var streaming = false;

var video = null;
var canvas = null;
var photo = null;
var streamObj = null;

const updateInt = 100

// Startup

function startup() {
  video = document.getElementById('videoTest');
  canvas = document.getElementById('canvasTest');
  outputHolder = document.getElementById('outputHolder');

  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(function(stream) {
      video.srcObject = streamObj = stream;
      video.play();
      console.log("Video play")
  })
  .catch(function(err) {
      console.log("An error occurred: " + err);
  });

  video.addEventListener('canplay', function(ev){
      if (!streaming) {
          height = video.videoHeight / (video.videoWidth/width);
          video.setAttribute('width', width);
          video.setAttribute('height', height);
          canvas.setAttribute('width', width);
          canvas.setAttribute('height', height);
          streaming = true;
      }
  }, false);

}  

// End Webcam Stream

function endStream() {
streamObj.getTracks().forEach(function(track) {
  track.stop();
});
}

// Face Detection Variables

let start = false;
let faceApi;
let classifier;

const detectionOptions = {
  withLandmarks: true,
  withDescriptors: false,
  minConfidence: 0.5,
  MODEL_URLS: {
    // TinyFaceDetectorModel: '../models/tiny_face_detector_model-weights_manifest.json',
    Mobilenetv1Model: '../models/ssd_mobilenetv1_model-weights_manifest.json',
    FaceLandmarkModel: '../models/face_landmark_68_model-weights_manifest.json',
    FaceLandmark68TinyNet: '../models/face_landmark_68_tiny_model-weights_manifest.json',
    FaceRecognitionModel: '../models/face_recognition_model-weights_manifest.json',
  }
};

// Face Detection

async function faceDect(){

  // console.log("Mask API Starting")

  // preload();

  console.log("Started main");

  const MODEL_URL = 'models'

  await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
  await faceapi.loadFaceLandmarkModel(MODEL_URL)
  await faceapi.loadFaceRecognitionModel(MODEL_URL)
  await faceapi.loadFaceExpressionModel(MODEL_URL)
  await faceapi.loadAgeGenderModel(MODEL_URL)

  console.log("Main models loaded")

  const input = document.getElementById('videoTest')
  const canvas = document.getElementById('canvasTest')
  const imageSize = {width: canvas.getAttribute('width'), height: canvas.getAttribute('height')}
  console.log(imageSize)
  faceapi.matchDimensions(canvas, imageSize)

  setInterval(async () => {
    let fullFaceDescriptions = await faceapi.detectAllFaces(input).withFaceLandmarks().withFaceExpressions()
    resizedDescriptions = faceapi.resizeResults(fullFaceDescriptions, imageSize)

    canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDescriptions)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDescriptions)
    faceapi.draw.drawFaceExpressions(canvas, resizedDescriptions)
  }, updateInt)

  console.log("Completed")
}

// AutoStart

const runOnStart = true;

if (runOnStart) {
  startup();
  var faceDectStartInterval = setInterval(() => {
    if(streaming){
      faceDect();
      clearInterval(faceDectStartInterval);
    }
  },500)
}