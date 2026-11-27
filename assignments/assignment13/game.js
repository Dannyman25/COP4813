const startButton = document.getElementById("start-button");
const nextButton = document.getElementById("next-button");
const restartButton = document.getElementById("restart-button");

const introduction = document.querySelector(".game-introduction");
const gameArea = document.getElementById("game-area");
const resultsArea = document.getElementById("results-area");

const questionNumber = document.getElementById("question-number");
const scoreDisplay = document.getElementById("score");
const streakDisplay = document.getElementById("streak");
const sentenceDisplay = document.getElementById("sentence");
const questionImage = document.getElementById("question-image");
const answerChoices = document.getElementById("answer-choices");
const feedback = document.getElementById("feedback");

const finalScore = document.getElementById("final-score");
const accuracyDisplay = document.getElementById("accuracy");
const bestStreakDisplay = document.getElementById("best-streak");
const finalMessage = document.getElementById("final-message");

let questions = [];
let gameQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let questionAnswered = false;

function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

async function loadQuestions() {
    const response = await fetch("questions.json");

    if (!response.ok) {
        throw new Error("The question file could not be loaded.");
    }

    questions = await response.json();
}

async function startGame() {
    try {
        if (questions.length === 0) {
            await loadQuestions();
        }

        gameQuestions = shuffleArray(questions).slice(0, 10);
        currentQuestionIndex = 0;
        score = 0;
        streak = 0;
        bestStreak = 0;

        scoreDisplay.textContent = score;
        streakDisplay.textContent = streak;

        introduction.hidden = true;
        resultsArea.hidden = true;
        gameArea.hidden = false;

        showQuestion();
    } catch (error) {
        feedback.textContent =
            "The game could not load. Please run the website using Live Server.";
        feedback.className = "feedback incorrect-feedback";
        gameArea.hidden = false;
    }
}

function showQuestion() {
    questionAnswered = false;
    feedback.textContent = "";
    feedback.className = "feedback";
    nextButton.hidden = true;
    answerChoices.innerHTML = "";

    const currentQuestion = gameQuestions[currentQuestionIndex];

    questionNumber.textContent =
        `${currentQuestionIndex + 1} of ${gameQuestions.length}`;

    sentenceDisplay.textContent = currentQuestion.sentence;
    questionImage.src = currentQuestion.image;
    questionImage.alt = currentQuestion.alt;

    const shuffledChoices = shuffleArray(currentQuestion.choices);

    shuffledChoices.forEach((choice) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer-button";
        button.textContent = choice;

        button.addEventListener("click", () => {
            checkAnswer(choice, button);
        });

        answerChoices.appendChild(button);
    });
}

function checkAnswer(selectedChoice, selectedButton) {
    if (questionAnswered) {
        return;
    }

    questionAnswered = true;

    const currentQuestion = gameQuestions[currentQuestionIndex];
    const buttons = answerChoices.querySelectorAll(".answer-button");
    const isCorrect = selectedChoice === currentQuestion.answer;

    buttons.forEach((button) => {
        button.disabled = true;

        if (button.textContent === currentQuestion.answer) {
            button.classList.add("correct-answer");
        }
    });

    if (isCorrect) {
        score++;
        streak++;

        if (streak > bestStreak) {
            bestStreak = streak;
        }

        feedback.textContent =
            `Correct! ${currentQuestion.explanation}`;
        feedback.className = "feedback correct-feedback";
    } else {
        streak = 0;
        selectedButton.classList.add("incorrect-answer");

        feedback.textContent =
            `Incorrect. The correct answer is "${currentQuestion.answer}." ` +
            currentQuestion.explanation;
        feedback.className = "feedback incorrect-feedback";
    }

    scoreDisplay.textContent = score;
    streakDisplay.textContent = streak;

    if (currentQuestionIndex === gameQuestions.length - 1) {
        nextButton.textContent = "View Results";
    } else {
        nextButton.textContent = "Next Question";
    }

    nextButton.hidden = false;
}

function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < gameQuestions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    gameArea.hidden = true;
    resultsArea.hidden = false;

    const accuracy = Math.round((score / gameQuestions.length) * 100);

    finalScore.textContent = score;
    accuracyDisplay.textContent = `${accuracy}%`;
    bestStreakDisplay.textContent = bestStreak;

    if (accuracy === 100) {
        finalMessage.textContent =
            "Perfect score! You are a context clues expert.";
    } else if (accuracy >= 80) {
        finalMessage.textContent =
            "Great job! You have a strong understanding of context clues.";
    } else if (accuracy >= 60) {
        finalMessage.textContent =
            "Good effort! A little more practice will improve your score.";
    } else {
        finalMessage.textContent =
            "Keep practicing! Use the surrounding words to find clues.";
    }
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
nextButton.addEventListener("click", nextQuestion);