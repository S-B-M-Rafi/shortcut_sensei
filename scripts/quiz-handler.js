import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const SUPABASE_URL = 'https://bigqzwvvnlabpffumrdn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZ3F6d3Z2bmxhYnBmZnVtcmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3ODc0OTYsImV4cCI6MjA3NzM2MzQ5Nn0.SPEqHmpmr4TX06klUcTNZkdnO980Azt8rMQhrpNW1BU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const firebaseConfig = {
    apiKey: "AIzaSyA9FmWlWXqswDprmvaILZQnamrjBCsfgVs",
    authDomain: "shortcut-sensei-1305f.firebaseapp.com",
    projectId: "shortcut-sensei-1305f",
    storageBucket: "shortcut-sensei-1305f.firebasestorage.app",
    messagingSenderId: "598536091157",
    appId: "1:598536091157:web:eff79326d42c5bba8e001c",
    measurementId: "G-WZCS73D2W5"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

let currentUser = null;
let currentQuiz = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let quizStartTime = null;
let timerInterval = null;
let timeRemaining = 0;

auth.onAuthStateChanged(async (user) => {
    if (user && user.emailVerified) {
        currentUser = user;
        await ensureUserExists(user);
        loadQuizzes();
    }
});

async function ensureUserExists(user) {
    try {
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('firebase_uid', user.uid)
            .maybeSingle();

        if (!existingUser) {
            await supabase
                .from('users')
                .insert([{
                    firebase_uid: user.uid,
                    email: user.email,
                    display_name: user.displayName || 'User',
                    avatar_url: user.photoURL
                }]);
        }
    } catch (error) {
        console.error('Error checking user:', error);
    }
}

async function getCurrentUserId() {
    if (!currentUser) return null;

    const { data } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', currentUser.uid)
        .maybeSingle();

    return data?.id;
}

async function loadQuizzes() {
    const grid = document.getElementById('quizGrid');
    grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading quizzes...</p></div>';

    try {
        const { data: quizzes, error } = await supabase
            .from('quizzes')
            .select(`
                *,
                quiz_questions (count)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!quizzes || quizzes.length === 0) {
            grid.innerHTML = '<div style="text-align: center; color: white; padding: 40px;"><h3>No quizzes available yet</h3></div>';
            return;
        }

        grid.innerHTML = quizzes.map(quiz => createQuizCard(quiz)).join('');
    } catch (error) {
        console.error('Error loading quizzes:', error);
        grid.innerHTML = '<div style="text-align: center; color: white; padding: 40px;"><h3>Error loading quizzes</h3></div>';
    }
}

function createQuizCard(quiz) {
    const questionCount = Array.isArray(quiz.quiz_questions) ? quiz.quiz_questions.length :
                         (quiz.quiz_questions?.[0]?.count || 0);
    const timeLimit = Math.floor(quiz.time_limit / 60);

    return `
        <div class="quiz-card" onclick="startQuiz('${quiz.id}')">
            <span class="quiz-difficulty ${quiz.difficulty}">${quiz.difficulty}</span>
            <h3>${quiz.title}</h3>
            <p>${quiz.description || 'Test your knowledge!'}</p>
            <div class="quiz-meta">
                <div class="meta-item">
                    <i class="fas fa-question-circle"></i>
                    <span>${questionCount} questions</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${timeLimit} min</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-trophy"></i>
                    <span>${quiz.passing_score}% to pass</span>
                </div>
            </div>
            <button class="btn-start-quiz" onclick="event.stopPropagation(); startQuiz('${quiz.id}')">
                Start Quiz
            </button>
        </div>
    `;
}

window.startQuiz = async function(quizId) {
    try {
        const { data: quiz, error: quizError } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', quizId)
            .maybeSingle();

        if (quizError) throw quizError;

        const { data: questions, error: questionsError } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('quiz_id', quizId)
            .order('order_num', { ascending: true });

        if (questionsError) throw questionsError;

        if (!questions || questions.length === 0) {
            alert('This quiz has no questions yet!');
            return;
        }

        currentQuiz = quiz;
        currentQuestions = questions;
        currentQuestionIndex = 0;
        userAnswers = new Array(questions.length).fill(null);
        quizStartTime = Date.now();
        timeRemaining = quiz.time_limit;

        document.getElementById('quizListView').style.display = 'none';
        document.getElementById('quizView').classList.add('active');
        document.getElementById('resultsView').classList.remove('active');

        startTimer();
        displayQuestion();
    } catch (error) {
        console.error('Error starting quiz:', error);
        alert('Failed to start quiz. Please try again.');
    }
};

function startTimer() {
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('quizTimer').textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];

    document.getElementById('quizProgress').textContent =
        `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;

    document.getElementById('questionText').textContent = question.question;

    const options = JSON.parse(question.options);
    const optionsList = document.getElementById('optionsList');

    optionsList.innerHTML = options.map((option, index) => `
        <button class="option-btn ${userAnswers[currentQuestionIndex] === option ? 'selected' : ''}"
                onclick="selectOption('${option.replace(/'/g, "\\'")}')">
            <span style="font-weight: 600; margin-right: 8px;">${String.fromCharCode(65 + index)}.</span>
            ${option}
        </button>
    `).join('');

    const nextBtn = document.getElementById('nextBtn');
    if (currentQuestionIndex === currentQuestions.length - 1) {
        nextBtn.textContent = 'Submit Quiz';
    } else {
        nextBtn.textContent = 'Next';
    }
}

window.selectOption = function(option) {
    userAnswers[currentQuestionIndex] = option;
    displayQuestion();
};

window.nextQuestion = function() {
    if (!userAnswers[currentQuestionIndex]) {
        alert('Please select an answer before proceeding.');
        return;
    }

    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        submitQuiz();
    }
};

window.exitQuiz = function() {
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
        clearInterval(timerInterval);
        backToQuizzes();
    }
};

async function submitQuiz() {
    clearInterval(timerInterval);

    let correctCount = 0;
    currentQuestions.forEach((question, index) => {
        if (userAnswers[index] === question.correct_answer) {
            correctCount++;
        }
    });

    const score = Math.round((correctCount / currentQuestions.length) * 100);
    const timeTaken = currentQuiz.time_limit - timeRemaining;
    const passed = score >= currentQuiz.passing_score;

    try {
        const userId = await getCurrentUserId();
        if (userId) {
            await supabase
                .from('quiz_attempts')
                .insert([{
                    user_id: userId,
                    quiz_id: currentQuiz.id,
                    score: score,
                    total_questions: currentQuestions.length,
                    time_taken: timeTaken,
                    passed: passed,
                    answers: JSON.stringify(userAnswers)
                }]);
        }
    } catch (error) {
        console.error('Error saving quiz attempt:', error);
    }

    displayResults(score, correctCount, timeTaken, passed);
}

function displayResults(score, correctCount, timeTaken, passed) {
    document.getElementById('quizView').classList.remove('active');
    document.getElementById('resultsView').classList.add('active');

    document.getElementById('resultsScore').textContent = `${score}%`;

    const message = passed
        ? '🎉 Congratulations! You passed!'
        : 'Keep practicing! You can do better!';
    document.getElementById('resultsMessage').textContent = message;

    document.getElementById('statScore').textContent = `${correctCount}/${currentQuestions.length}`;
    document.getElementById('statCorrect').textContent = `${correctCount}`;

    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    document.getElementById('statTime').textContent = `${minutes}m ${seconds}s`;
}

window.backToQuizzes = function() {
    document.getElementById('quizListView').style.display = 'block';
    document.getElementById('quizView').classList.remove('active');
    document.getElementById('resultsView').classList.remove('active');
    currentQuiz = null;
    currentQuestions = [];
    currentQuestionIndex = 0;
    userAnswers = [];
};

window.retakeQuiz = function() {
    if (currentQuiz) {
        startQuiz(currentQuiz.id);
    }
};
