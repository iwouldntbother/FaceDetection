// TODO
// Create automated question / answer loader

var started = false;




// Face Detection //

// Variables //

var width = 1280;
var height = 0;

var streaming = false;

var video = null;
var canvas = null;
var photo = null;
var streamObj = null;

const updateInt = 500
var detectLoop;
var logging = false;

const drawResults = false;

var faceData = {
  confidence: [],
  angry: [],
  disgusted: [],
  fearful: [],
  happy: [],
  neutral: [],
  sad: [],
  surprised: [],
  age: []
}

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

  detectLoop = setInterval(async () => {
    let fullFaceDescriptions = await faceapi.detectAllFaces(input).withFaceLandmarks().withFaceExpressions().withAgeAndGender()
    resizedDescriptions = faceapi.resizeResults(fullFaceDescriptions, imageSize)

    if (drawResults) {
      canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDescriptions)
      faceapi.draw.drawFaceLandmarks(canvas, resizedDescriptions)
      faceapi.draw.drawFaceExpressions(canvas, resizedDescriptions)
    }

    if (logging) {
      let largestBox = Math.max(...resizedDescriptions.map(x => x.alignedRect.box.area));
      let largestFace = resizedDescriptions.find(o => o.alignedRect.box.area == largestBox);
      // console.log(largestFace);
      if (largestFace) {
        faceData.confidence.push(largestFace.detection._score);
        faceData.angry.push(largestFace.expressions.angry);
        faceData.disgusted.push(largestFace.expressions.disgusted);
        faceData.fearful.push(largestFace.expressions.fearful);
        faceData.happy.push(largestFace.expressions.happy);
        faceData.neutral.push(largestFace.expressions.neutral);
        faceData.sad.push(largestFace.expressions.sad);
        faceData.surprised.push(largestFace.expressions.surprised);
        faceData.age.push(largestFace.age);
      }
    }

    // console.log(resizedDescriptions[0]);

  }, updateInt)


  console.log("Completed")
}

// AutoStart

const runOnStart = true;


const startDetection = () => {
  startup();
  var faceDectStartInterval = setInterval(() => {
    if(streaming){
      faceDect();
      clearInterval(faceDectStartInterval);
    }
  },500)
}

if (runOnStart) {
  startDetection();
}

const stopLogging = () => {
  logging = false;
  clearInterval(detectLoop);
  endStream();
  // console.log(faceData);
  console.log('Average confidence: '+averageArrayValue(faceData.confidence));
  console.log('Average angry: '+averageArrayValue(faceData.angry));
  console.log('Average disgusted: '+averageArrayValue(faceData.disgusted));
  console.log('Average fearful: '+averageArrayValue(faceData.fearful));
  console.log('Average happy: '+averageArrayValue(faceData.happy));
  console.log('Average neutral: '+averageArrayValue(faceData.neutral));
  console.log('Average sad: '+averageArrayValue(faceData.sad));
  console.log('Average surprised: '+averageArrayValue(faceData.surprised));
  console.log('Average age: '+averageArrayValue(faceData.age));
}

const averageArrayValue = (array) => {
  var total = 0;
  for (var i=0; i<array.length; i++) {
    total += array[i];
  }
  return total / array.length;
}

// Start Screen //

// startup();

const startExperience = () => {
  logging = true;
  started = true;
  document.getElementById('startScreen').remove();
  document.getElementById('video').play();

  document.getElementById('video').onended = () => {
    document.getElementById('videoHolder').remove();
  }
}

document.addEventListener('keydown', (e) => {
  if (e.code == 'Space') {
    startExperience();
  }
})

// Quiz //

var currentQuestion = 0;
var score = 0;

var selectedAnswer;
var answerChecked = false;

const title = document.getElementById('quizTitle');
const answer0 = document.getElementById('answer0');
const answer1 = document.getElementById('answer1');
const answer2 = document.getElementById('answer2');
const answer3 = document.getElementById('answer3');
const nextBTN = document.getElementById('nextBTN');


document.addEventListener('click', (e) => {
  if (e.target.id.includes('answer')) {
    if (selectedAnswer) {
      document.getElementById('answer'+selectedAnswer).classList.remove('selected');
    }
    document.getElementById(e.target.id).classList.add('selected');
    selectedAnswer = e.target.id.slice(e.target.id.length-1, e.target.id.length);
    nextBTN.disabled = false;
  }
  
  if (e.target.id == 'nextBTN') {
    checkAnswer();
  }
  
  if (e.target.id == 'startBTN' && !started) {
    startExperience();
  }

})

const checkAnswer = () => {

  if (!answerChecked) {

    nextBTN.innerHTML = 'Next'
    if (selectedAnswer == questions[currentQuestion].correctAnswer) {
      console.log('Correct');
      score++;
    } else {
      console.log('Wrong');
    }

    for (i=0;i<4;i++) {
      document.getElementById('answer'+i).classList.add('wrong');
    }

    document.getElementById('answer'+questions[currentQuestion].correctAnswer).classList.remove('wrong');
    document.getElementById('answer'+questions[currentQuestion].correctAnswer).classList.add('correct');

    answerChecked = true;

  } else {

    nextBTN.innerHTML = 'Check'

    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      loadQuiz();
      document.getElementById('answer'+selectedAnswer).classList.remove('selected');
    } else {
      console.log('Done')
      document.getElementById('quizContainer').innerHTML = "<h1>Complete!</h1>";
      document.getElementById('quizContainer').innerHTML += "<p>Score: "+score+"/"+questions.length+"</p>";
      stopLogging();
      return
    }
    answerChecked = false;
    for (i=0;i<4;i++) {
      document.getElementById('answer'+i).classList.remove('correct');
      document.getElementById('answer'+i).classList.remove('wrong');
    }
  }

  

  

}

const loadQuiz = () => {
  nextBTN.disabled = true;
  title.innerHTML = questions[currentQuestion].questionTitle;
  answer0.innerHTML = questions[currentQuestion].answers[0];
  answer1.innerHTML = questions[currentQuestion].answers[1];
  answer2.innerHTML = questions[currentQuestion].answers[2];
  answer3.innerHTML = questions[currentQuestion].answers[3];

}

loadQuiz();
