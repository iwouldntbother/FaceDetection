// TODO
// Create automated question / answer loader

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