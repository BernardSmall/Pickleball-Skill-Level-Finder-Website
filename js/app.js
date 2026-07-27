// Main application state, page navigation, assessment flow and event listeners.

const state = {
    currentQuestionIndex: 0,
    answers: {}
};

const pages = {
    home: document.getElementById("homePage"),
    assessment: document.getElementById("assessmentPage"),
    results: document.getElementById("resultsPage"),
    history: document.getElementById("historyPage"),
    about: document.getElementById("aboutPage")
};

const questionCounter = document.getElementById("questionCounter");
const progressPercentage = document.getElementById("progressPercentage");
const progressFill = document.getElementById("progressFill");
const questionCategory = document.getElementById("questionCategory");
const questionText = document.getElementById("questionText");
const questionHelp = document.getElementById("questionHelp");
const answerOptions = document.getElementById("answerOptions");
const validationMessage = document.getElementById("validationMessage");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");

function showPage(pageName) {
    Object.values(pages).forEach(page => page.classList.add("hidden"));

    if (pages[pageName]) {
        pages[pageName].classList.remove("hidden");
    }

    if (pageName === "history") {
        renderHistory();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function startAssessment() {
    state.currentQuestionIndex = 0;
    state.answers = {};
    renderQuestion();
    showPage("assessment");
}

function renderQuestion() {
    const question = questions[state.currentQuestionIndex];
    const questionNumber = state.currentQuestionIndex + 1;
    const progress = Math.round((questionNumber / questions.length) * 100);

    questionCounter.textContent = `Question ${questionNumber} of ${questions.length}`;
    progressPercentage.textContent = `${progress}%`;
    progressFill.style.width = `${progress}%`;
    questionCategory.textContent = question.category;
    questionText.textContent = question.text;
    questionHelp.textContent = question.help;
    validationMessage.textContent = "";
    answerOptions.innerHTML = "";

    question.options.forEach((option, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "answer-option";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "questionAnswer";
        input.id = `answer-${question.id}-${index}`;
        input.value = option.score;

        if (state.answers[question.id] === option.score) {
            input.checked = true;
        }

        input.addEventListener("change", () => {
            state.answers[question.id] = option.score;
            validationMessage.textContent = "";
        });

        const label = document.createElement("label");
        label.htmlFor = input.id;
        label.textContent = option.text;

        wrapper.appendChild(input);
        wrapper.appendChild(label);
        answerOptions.appendChild(wrapper);
    });

    previousButton.disabled = state.currentQuestionIndex === 0;
    previousButton.style.opacity = state.currentQuestionIndex === 0 ? "0.45" : "1";

    nextButton.textContent =
        state.currentQuestionIndex === questions.length - 1
            ? "View results"
            : "Next";
}

function goToNextQuestion() {
    const question = questions[state.currentQuestionIndex];

    if (state.answers[question.id] === undefined) {
        validationMessage.textContent = "Please select an answer before continuing.";
        return;
    }

    if (state.currentQuestionIndex < questions.length - 1) {
        state.currentQuestionIndex += 1;
        renderQuestion();
        return;
    }

    calculateResults();
}

function goToPreviousQuestion() {
    if (state.currentQuestionIndex === 0) {
        return;
    }

    state.currentQuestionIndex -= 1;
    renderQuestion();
}

function displayCategoryResults(categoryScores) {
    const container = document.getElementById("categoryResults");
    container.innerHTML = "";

    Object.entries(categoryScores)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, score]) => {
            const percentage = Math.round(((score - 1) / 4) * 100);
            const row = document.createElement("div");

            row.innerHTML = `
                <div class="category-row-heading">
                    <span>${categoryNames[category]}</span>
                    <span class="category-score">${score.toFixed(1)} / 5</span>
                </div>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${Math.max(5, percentage)}%"></div>
                </div>
            `;

            container.appendChild(row);
        });
}
function calculateResults() {
    const categoryResult = calculateCategoryScores();
    const categoryScores = categoryResult.scores;
    const contradictions = detectContradictions();
    const overallScore = calculateOverallScore(categoryScores);
    const rating = convertScoreToRating(overallScore);
    const confidence = calculateConfidence(
        categoryScores,
        contradictions,
        categoryResult.gatedAnswers
    );
    const range = getRatingRange(rating, confidence);

    document.getElementById("finalRating").textContent = rating.toFixed(2);
    document.getElementById("finalLevel").textContent = getRatingLabel(rating);
    document.getElementById("finalRange").textContent =
        `Likely range: ${range.lower}–${range.upper}`;
    document.getElementById("confidenceValue").textContent = `${confidence}%`;
    document.getElementById("confidenceBar").style.width = `${confidence}%`;
    const explanation = createExplanation(rating, categoryScores);
    const diagnostics = createDiagnosticsText(
        contradictions,
        categoryResult.gatedAnswers,
        confidence
    );
    const insights = buildInsights(categoryScores);
    const drills = insights.priorities.map(priority => ({
        category: priority.category,
        ...drillLibrary[priority.category]
    }));

    document.getElementById("resultExplanation").textContent = explanation;
    document.getElementById("scoringDiagnostics").textContent = diagnostics;

    displayCategoryResults(categoryScores);
    displayInsights(categoryScores);

    saveResult({
        date: new Date().toISOString(),
        engineVersion: scoringEngineVersion,
        rating: Number(rating.toFixed(2)),
        level: getRatingLabel(rating),
        confidence,
        range,
        categoryScores,
        strengths: insights.strengths,
        priorities: insights.priorities,
        drills,
        explanation,
        diagnostics,
        contradictionCount: contradictions.length,
        gatedAnswerCount: categoryResult.gatedAnswers.length
    });

    showPage("results");
}
document.getElementById("startAssessmentButton").addEventListener("click", startAssessment);
document.getElementById("viewHistoryButton").addEventListener("click", () => showPage("history"));
document.getElementById("retakeButton").addEventListener("click", startAssessment);
document.getElementById("returnHomeButton").addEventListener("click", () => showPage("home"));
document.getElementById("historyFromResultsButton").addEventListener("click", () => showPage("history"));
document.getElementById("historyStartButton").addEventListener("click", startAssessment);

document.getElementById("clearHistoryButton").addEventListener("click", () => {
    const confirmed = window.confirm(
        "Are you sure you want to remove all saved PickleRate results from this device?"
    );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem("pickleRateHistory");
    renderHistory();
});

document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
        const target = button.dataset.page;

        if (target === "assessment") {
            startAssessment();
            return;
        }

        showPage(target);
    });
});

previousButton.addEventListener("click", goToPreviousQuestion);
nextButton.addEventListener("click", goToNextQuestion);
