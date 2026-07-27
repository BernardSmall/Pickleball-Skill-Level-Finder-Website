// Stage 2 rating engine: metadata, gates, weighting, confidence and insights.

const scoringEngineVersion = "2.0";

// Stage 2 metadata. Importance measures how much the skill matters to normal
// doubles performance. Difficulty rewards strong evidence on harder skills.
// Reliability measures how trustworthy the question is as a rating indicator.
const questionMetadata = {
    serveIn:          { importance: 5, difficulty: 1, reliability: 5, dimension: "execution", minimumSkill: 2.0, maximumSkill: 4.5 },
    serveDepth:       { importance: 4, difficulty: 2, reliability: 4, dimension: "execution", minimumSkill: 2.5, maximumSkill: 4.5 },
    servePlacement:   { importance: 3, difficulty: 3, reliability: 3, dimension: "execution", minimumSkill: 3.0, maximumSkill: 4.5 },
    returnIn:         { importance: 5, difficulty: 1, reliability: 5, dimension: "execution", minimumSkill: 2.0, maximumSkill: 4.5 },
    returnDepth:      { importance: 5, difficulty: 2, reliability: 5, dimension: "execution", minimumSkill: 2.5, maximumSkill: 4.5 },
    returnAdvance:    { importance: 5, difficulty: 2, reliability: 4, dimension: "positioning", minimumSkill: 2.5, maximumSkill: 4.5 },

    dropSuccess:      { importance: 5, difficulty: 4, reliability: 5, dimension: "execution", minimumSkill: 3.0, maximumSkill: 5.0 },
    dropForehand:     { importance: 5, difficulty: 3, reliability: 5, dimension: "execution", minimumSkill: 3.0, maximumSkill: 4.75 },
    dropBackhand:     { importance: 4, difficulty: 4, reliability: 4, dimension: "execution", minimumSkill: 3.25, maximumSkill: 5.0 },
    dropAdjustment:   { importance: 4, difficulty: 4, reliability: 4, dimension: "adaptability", minimumSkill: 3.5, maximumSkill: 5.0 },
    driveSelection:   { importance: 4, difficulty: 3, reliability: 4, dimension: "decision", minimumSkill: 3.0, maximumSkill: 4.75 },
    fifthShot:        { importance: 5, difficulty: 4, reliability: 5, dimension: "transition", minimumSkill: 3.25, maximumSkill: 5.0 },

    dinkCrosscourt:   { importance: 5, difficulty: 2, reliability: 5, dimension: "execution", minimumSkill: 2.75, maximumSkill: 4.75 },
    dinkStraight:     { importance: 4, difficulty: 3, reliability: 4, dimension: "execution", minimumSkill: 3.0, maximumSkill: 4.75 },
    dinkPlacement:    { importance: 5, difficulty: 3, reliability: 5, dimension: "decision", minimumSkill: 3.25, maximumSkill: 5.0 },
    dinkPressure:     { importance: 5, difficulty: 4, reliability: 5, dimension: "pressure", minimumSkill: 3.25, maximumSkill: 5.0 },
    lowBallPatience:  { importance: 5, difficulty: 3, reliability: 4, dimension: "decision", minimumSkill: 3.0, maximumSkill: 4.75 },
    kitchenMovement:  { importance: 5, difficulty: 3, reliability: 4, dimension: "positioning", minimumSkill: 3.0, maximumSkill: 4.75 },

    transitionReset: { importance: 5, difficulty: 5, reliability: 5, dimension: "execution", minimumSkill: 3.25, maximumSkill: 5.0 },
    blockDrive:       { importance: 5, difficulty: 3, reliability: 5, dimension: "execution", minimumSkill: 3.0, maximumSkill: 4.75 },
    backhandBlock:    { importance: 5, difficulty: 4, reliability: 5, dimension: "execution", minimumSkill: 3.25, maximumSkill: 5.0 },
    resetAfterPop:    { importance: 4, difficulty: 5, reliability: 4, dimension: "recovery", minimumSkill: 3.5, maximumSkill: 5.0 },
    defensiveLob:     { importance: 2, difficulty: 4, reliability: 2, dimension: "specialist", minimumSkill: 3.5, maximumSkill: 5.0 },
    handsRecovery:    { importance: 4, difficulty: 5, reliability: 4, dimension: "recovery", minimumSkill: 3.5, maximumSkill: 5.0 },

    speedupSelection: { importance: 4, difficulty: 4, reliability: 4, dimension: "decision", minimumSkill: 3.5, maximumSkill: 5.0 },
    speedupExecution: { importance: 4, difficulty: 4, reliability: 4, dimension: "execution", minimumSkill: 3.5, maximumSkill: 5.0 },
    counterForehand:  { importance: 3, difficulty: 4, reliability: 3, dimension: "execution", minimumSkill: 3.5, maximumSkill: 5.0 },
    counterBackhand:  { importance: 4, difficulty: 5, reliability: 4, dimension: "execution", minimumSkill: 3.75, maximumSkill: 5.0 },
    attackTargets:    { importance: 3, difficulty: 4, reliability: 3, dimension: "decision", minimumSkill: 3.5, maximumSkill: 5.0 },

    partnerMovement:  { importance: 5, difficulty: 3, reliability: 5, dimension: "positioning", minimumSkill: 3.0, maximumSkill: 4.75 },
    middleCoverage:   { importance: 5, difficulty: 3, reliability: 4, dimension: "positioning", minimumSkill: 3.0, maximumSkill: 4.75 },
    targeting:        { importance: 4, difficulty: 3, reliability: 4, dimension: "decision", minimumSkill: 3.25, maximumSkill: 4.75 },
    patternRecognition:{ importance: 4, difficulty: 4, reliability: 4, dimension: "decision", minimumSkill: 3.5, maximumSkill: 5.0 },
    shotTolerance:    { importance: 5, difficulty: 3, reliability: 5, dimension: "decision", minimumSkill: 3.25, maximumSkill: 4.75 },

    rallyConsistency: { importance: 5, difficulty: 4, reliability: 5, dimension: "pressure", minimumSkill: 3.0, maximumSkill: 5.0 },
    unforcedErrors:   { importance: 5, difficulty: 2, reliability: 5, dimension: "consistency", minimumSkill: 2.5, maximumSkill: 4.75 },
    badDayFloor:      { importance: 5, difficulty: 4, reliability: 4, dimension: "consistency", minimumSkill: 3.0, maximumSkill: 5.0 },
    adaptPressure:    { importance: 4, difficulty: 4, reliability: 4, dimension: "adaptability", minimumSkill: 3.25, maximumSkill: 5.0 },

    versus35:         { importance: 4, difficulty: 3, reliability: 4, dimension: "performance", minimumSkill: 3.0, maximumSkill: 4.5 },
    versus40:         { importance: 5, difficulty: 5, reliability: 5, dimension: "performance", minimumSkill: 3.5, maximumSkill: 5.0 },
    strongPartner:    { importance: 4, difficulty: 4, reliability: 3, dimension: "performance", minimumSkill: 3.25, maximumSkill: 5.0 },
    newPartner:       { importance: 3, difficulty: 4, reliability: 3, dimension: "adaptability", minimumSkill: 3.25, maximumSkill: 5.0 },
    tournamentTransfer:{ importance: 5, difficulty: 5, reliability: 4, dimension: "pressure", minimumSkill: 3.25, maximumSkill: 5.0 }
};

// Gates only restrict the extra credit above score 3. A player is not punished
// for lacking an advanced skill, but a claimed advanced result cannot fully boost
// the rating when the required foundations are weak.
const skillGates = {
    dropAdjustment:    [{ skill: "serveReturn", minimum: 2.8 }, { skill: "thirdShot", minimum: 3.0 }],
    fifthShot:         [{ skill: "thirdShot", minimum: 3.0 }, { skill: "defence", minimum: 2.8 }],
    dinkPressure:      [{ skill: "kitchen", minimum: 3.0 }, { skill: "consistency", minimum: 2.8 }],
    transitionReset:   [{ skill: "thirdShot", minimum: 2.8 }, { skill: "kitchen", minimum: 2.8 }],
    resetAfterPop:     [{ skill: "defence", minimum: 3.0 }, { skill: "consistency", minimum: 2.8 }],
    defensiveLob:      [{ skill: "defence", minimum: 2.8 }, { skill: "strategy", minimum: 2.8 }],
    handsRecovery:     [{ skill: "defence", minimum: 3.0 }, { skill: "attack", minimum: 2.8 }],
    speedupSelection:  [{ skill: "kitchen", minimum: 3.0 }, { skill: "strategy", minimum: 3.0 }],
    speedupExecution:  [{ skill: "kitchen", minimum: 3.0 }, { skill: "attack", minimum: 2.8 }],
    counterForehand:   [{ skill: "defence", minimum: 3.0 }, { skill: "attack", minimum: 2.8 }],
    counterBackhand:   [{ skill: "defence", minimum: 3.2 }, { skill: "attack", minimum: 3.0 }],
    attackTargets:     [{ skill: "attack", minimum: 3.0 }, { skill: "strategy", minimum: 3.0 }],
    patternRecognition:[{ skill: "strategy", minimum: 3.0 }, { skill: "consistency", minimum: 2.8 }],
    versus40:          [{ skill: "thirdShot", minimum: 3.0 }, { skill: "kitchen", minimum: 3.0 }, { skill: "defence", minimum: 3.0 }],
    tournamentTransfer:[{ skill: "consistency", minimum: 3.0 }, { skill: "performance", minimum: 2.8 }]
};

const contradictionRules = [
    { low: "serveIn", high: "servePlacement", lowAtMost: 2, highAtLeast: 5, label: "serve consistency versus advanced placement" },
    { low: "returnIn", high: "returnDepth", lowAtMost: 2, highAtLeast: 5, label: "return consistency versus depth" },
    { low: "dropSuccess", high: "dropAdjustment", lowAtMost: 2, highAtLeast: 4, label: "basic drop success versus advanced drop adjustment" },
    { low: "dinkCrosscourt", high: "dinkPressure", lowAtMost: 2, highAtLeast: 4, label: "basic dink control versus pressure dinking" },
    { low: "lowBallPatience", high: "speedupSelection", lowAtMost: 2, highAtLeast: 5, label: "low-ball discipline versus speed-up selection" },
    { low: "blockDrive", high: "handsRecovery", lowAtMost: 2, highAtLeast: 4, label: "basic blocking versus advanced hands recovery" },
    { low: "backhandBlock", high: "counterBackhand", lowAtMost: 2, highAtLeast: 4, label: "backhand defence versus backhand countering" },
    { low: "rallyConsistency", high: "versus40", lowAtMost: 2, highAtLeast: 4, label: "pressure consistency versus 4.0 performance" },
    { low: "unforcedErrors", high: "tournamentTransfer", lowAtMost: 2, highAtLeast: 5, label: "unforced-error control versus tournament transfer" }
];

const categoryWeights = {
    serveReturn: 0.12,
    thirdShot: 0.16,
    kitchen: 0.16,
    defence: 0.18,
    attack: 0.09,
    strategy: 0.10,
    consistency: 0.11,
    performance: 0.08
};

const categoryNames = {
    serveReturn: "Serve and return",
    thirdShot: "Third shot",
    kitchen: "Kitchen play",
    defence: "Resets and defence",
    attack: "Attack and counter",
    strategy: "Strategy and positioning",
    consistency: "Consistency under pressure",
    performance: "Competitive performance"
};

const categoryDescriptions = {
    serveReturn: "starting points reliably and creating positional advantages",
    thirdShot: "using the third and fifth shot to reach the kitchen",
    kitchen: "maintaining control, placement and patience at the kitchen",
    defence: "blocking pace, resetting and surviving pressure",
    attack: "choosing and executing speed-ups and counters",
    strategy: "positioning, pattern recognition and shot selection",
    consistency: "maintaining a dependable level when pressure increases",
    performance: "transferring technical ability into competitive games"
};
function getQuestionMetadata(question) {
    return questionMetadata[question.id] || {
        importance: 3,
        difficulty: 3,
        reliability: 3,
        dimension: "execution",
        minimumSkill: 2.0,
        maximumSkill: 5.0
    };
}

function calculateRawCategoryScores() {
    const totals = {};
    const weightTotals = {};

    questions.forEach(question => {
        const answer = state.answers[question.id];
        if (answer === undefined) return;

        const metadata = getQuestionMetadata(question);
        const evidenceWeight = question.weight * metadata.importance * metadata.reliability;

        totals[question.skill] = (totals[question.skill] || 0) + answer * evidenceWeight;
        weightTotals[question.skill] = (weightTotals[question.skill] || 0) + evidenceWeight;
    });

    const scores = {};
    Object.keys(totals).forEach(category => {
        scores[category] = totals[category] / weightTotals[category];
    });
    return scores;
}

function calculateGateModifier(questionId, rawCategoryScores) {
    const gates = skillGates[questionId];
    if (!gates || gates.length === 0) return 1;

    const ratios = gates.map(gate => {
        const foundationScore = rawCategoryScores[gate.skill] || 1;
        return Math.min(1, foundationScore / gate.minimum);
    });

    const weakestRatio = Math.min(...ratios);
    return Math.max(0.35, weakestRatio);
}

function applyAdvancedSkillGate(answer, gateModifier) {
    if (answer <= 3 || gateModifier >= 0.999) return answer;
    return 3 + (answer - 3) * gateModifier;
}

function calculateCategoryScores() {
    const rawCategoryScores = calculateRawCategoryScores();
    const totals = {};
    const weightTotals = {};
    const gatedAnswers = [];

    questions.forEach(question => {
        const answer = state.answers[question.id];
        if (answer === undefined) return;

        const metadata = getQuestionMetadata(question);
        const gateModifier = calculateGateModifier(question.id, rawCategoryScores);
        const effectiveAnswer = applyAdvancedSkillGate(answer, gateModifier);
        const evidenceWeight = question.weight * metadata.importance * metadata.reliability;

        totals[question.skill] = (totals[question.skill] || 0) + effectiveAnswer * evidenceWeight;
        weightTotals[question.skill] = (weightTotals[question.skill] || 0) + evidenceWeight;

        if (answer > 3 && effectiveAnswer < answer - 0.08) {
            gatedAnswers.push({
                questionId: question.id,
                original: answer,
                effective: effectiveAnswer,
                modifier: gateModifier
            });
        }
    });

    const scores = {};
    Object.keys(totals).forEach(category => {
        scores[category] = totals[category] / weightTotals[category];
    });

    return { scores, rawCategoryScores, gatedAnswers };
}

function calculateDifficultyEvidenceBonus() {
    let bonusEvidence = 0;
    let possibleEvidence = 0;

    questions.forEach(question => {
        const answer = state.answers[question.id];
        if (answer === undefined) return;

        const metadata = getQuestionMetadata(question);
        if (metadata.difficulty < 4 || metadata.reliability < 3) return;

        const weight = metadata.difficulty * metadata.reliability * metadata.importance;
        possibleEvidence += weight;

        // Only performance above the neutral midpoint earns difficulty evidence.
        const advancedEvidence = Math.max(0, answer - 3) / 2;
        bonusEvidence += advancedEvidence * weight;
    });

    if (possibleEvidence === 0) return 0;
    return Math.min(0.14, (bonusEvidence / possibleEvidence) * 0.14);
}

function calculateOverallScore(categoryScores) {
    let weightedTotal = 0;
    let totalWeight = 0;

    Object.entries(categoryWeights).forEach(([category, weight]) => {
        if (categoryScores[category] === undefined) return;
        weightedTotal += categoryScores[category] * weight;
        totalWeight += weight;
    });

    const baseScore = totalWeight === 0 ? 1 : weightedTotal / totalWeight;
    return Math.min(5, baseScore + calculateDifficultyEvidenceBonus());
}

function detectContradictions() {
    return contradictionRules.filter(rule => {
        const lowAnswer = state.answers[rule.low];
        const highAnswer = state.answers[rule.high];
        return lowAnswer !== undefined && highAnswer !== undefined &&
            lowAnswer <= rule.lowAtMost && highAnswer >= rule.highAtLeast;
    });
}

function calculateRelatedAnswerPenalty() {
    const relatedPairs = [
        ["serveIn", "serveDepth"],
        ["returnIn", "returnDepth"],
        ["dropForehand", "dropBackhand"],
        ["dropSuccess", "fifthShot"],
        ["dinkCrosscourt", "dinkPressure"],
        ["blockDrive", "backhandBlock"],
        ["speedupSelection", "speedupExecution"],
        ["rallyConsistency", "badDayFloor"],
        ["versus40", "tournamentTransfer"]
    ];

    return relatedPairs.reduce((penalty, [first, second]) => {
        const difference = Math.abs((state.answers[first] || 0) - (state.answers[second] || 0));
        return penalty + (difference >= 3 ? 2 : 0);
    }, 0);
}

function convertScoreToRating(score) {
    const points = [
        { score: 1.0, rating: 2.0 },
        { score: 1.7, rating: 2.5 },
        { score: 2.4, rating: 3.0 },
        { score: 3.1, rating: 3.5 },
        { score: 3.85, rating: 4.0 },
        { score: 4.45, rating: 4.5 },
        { score: 5.0, rating: 4.9 }
    ];

    for (let index = 0; index < points.length - 1; index += 1) {
        const current = points[index];
        const next = points[index + 1];

        if (score >= current.score && score <= next.score) {
            const progress = (score - current.score) / (next.score - current.score);
            return current.rating + progress * (next.rating - current.rating);
        }
    }

    return score < 1 ? 2.0 : 4.9;
}

function getRatingLabel(rating) {
    if (rating < 2.5) return "Beginner player";
    if (rating < 3.0) return "Developing 2.5";
    if (rating < 3.5) return "Competitive 3.0";
    if (rating < 4.0) return "Competitive 3.5";
    if (rating < 4.5) return "Advanced 4.0";
    return "Advanced 4.5+";
}

function getRatingRange(rating, confidence) {
    const spread = confidence >= 88 ? 0.15 : confidence >= 80 ? 0.22 : confidence >= 70 ? 0.30 : 0.38;
    const lower = Math.max(2.0, Math.floor((rating - spread) * 4) / 4);
    const upper = Math.min(5.0, Math.ceil((rating + spread) * 4) / 4);

    return {
        lower: lower.toFixed(2),
        upper: upper.toFixed(2)
    };
}

function calculateConfidence(categoryScores, contradictions, gatedAnswers) {
    const answeredCount = Object.keys(state.answers).length;
    const completionRate = answeredCount / questions.length;

    let reliabilityEarned = 0;
    let reliabilityPossible = 0;
    questions.forEach(question => {
        if (state.answers[question.id] === undefined) return;
        const metadata = getQuestionMetadata(question);
        reliabilityEarned += metadata.reliability;
        reliabilityPossible += 5;
    });

    const reliabilityRate = reliabilityPossible === 0 ? 0 : reliabilityEarned / reliabilityPossible;
    const relatedPenalty = calculateRelatedAnswerPenalty();
    const contradictionPenalty = contradictions.length * 6;
    const gatePenalty = Math.min(12, gatedAnswers.length * 1.5);

    const technicalCategories = ["serveReturn", "thirdShot", "kitchen", "defence", "attack", "strategy", "consistency"];
    const technicalValues = technicalCategories
        .map(category => categoryScores[category])
        .filter(value => value !== undefined);
    const technicalAverage = technicalValues.reduce((sum, value) => sum + value, 0) / technicalValues.length;
    const performanceDifference = Math.abs((categoryScores.performance || technicalAverage) - technicalAverage);
    const performancePenalty = performanceDifference > 1.35 ? 8 : performanceDifference > 0.9 ? 4 : 0;

    const confidence = Math.round(
        54 +
        completionRate * 18 +
        reliabilityRate * 22 -
        contradictionPenalty -
        relatedPenalty -
        gatePenalty -
        performancePenalty
    );

    return Math.min(94, Math.max(52, confidence));
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

function buildInsights(categoryScores) {
    const sorted = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]);
    const strengths = sorted.slice(0, 3).map(([category, score]) => ({
        category,
        score,
        text:
            `${categoryNames[category]}: you currently show your strongest evidence in ` +
            `${categoryDescriptions[category]}.`
    }));
    const priorities = [...sorted].reverse().slice(0, 3).map(([category, score]) => ({
        category,
        score,
        text:
            `${categoryNames[category]}: improving this area is likely to produce one of ` +
            `the largest immediate gains in your overall level.`
    }));

    return { strengths, priorities };
}

function displayInsights(categoryScores) {
    const insights = buildInsights(categoryScores);
    const strengthList = document.getElementById("strengthList");
    const priorityList = document.getElementById("priorityList");

    strengthList.innerHTML = "";
    priorityList.innerHTML = "";

    insights.strengths.forEach(strength => {
        const item = document.createElement("li");
        item.textContent = strength.text;
        strengthList.appendChild(item);
    });

    insights.priorities.forEach(priority => {
        const item = document.createElement("li");
        item.textContent = priority.text;
        priorityList.appendChild(item);
    });

    displayDrills(insights.priorities.map(priority => [priority.category, priority.score]));
    return insights;
}
function createExplanation(rating, categoryScores) {
    const sorted = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]);
    const strongest = categoryNames[sorted[0][0]];
    const weakest = categoryNames[sorted[sorted.length - 1][0]];

    let levelExplanation = "";

    if (rating < 3.0) {
        levelExplanation =
            "Your answers suggest that you are still building reliable ball control and repeatable rally skills.";
    } else if (rating < 3.5) {
        levelExplanation =
            "Your answers suggest that you can sustain more structured points, but execution still varies when pace or pressure increases.";
    } else if (rating < 4.0) {
        levelExplanation =
            "Your answers show several skills associated with competitive 3.5 play, including more purposeful shot selection and stronger point construction.";
    } else if (rating < 4.5) {
        levelExplanation =
            "Your answers suggest strong control, tactical awareness and the ability to remain effective during faster and more demanding exchanges.";
    } else {
        levelExplanation =
            "Your answers indicate advanced consistency, tactical flexibility and strong performance against skilled opposition.";
    }

    return (
        `${levelExplanation} Your strongest assessed category was ${strongest.toLowerCase()}. ` +
        `Your overall result was held back most by ${weakest.toLowerCase()}. ` +
        `Improving that category should have the greatest immediate effect on your competitive performance.`
    );
}
function createDiagnosticsText(contradictions, gatedAnswers, confidence) {
    if (contradictions.length === 0 && gatedAnswers.length === 0) {
        return `The Stage 2 engine found no major answer contradictions. Your responses were supported across the core skill categories, producing ${confidence}% confidence.`;
    }

    const parts = [];
    if (contradictions.length > 0) {
        parts.push(`${contradictions.length} possible contradiction${contradictions.length === 1 ? " was" : "s were"} detected between related answers`);
    }
    if (gatedAnswers.length > 0) {
        parts.push(`${gatedAnswers.length} advanced answer${gatedAnswers.length === 1 ? " was" : "s were"} partially limited because the supporting fundamentals scored lower`);
    }

    return `${parts.join(" and ")}. These checks affect confidence and prevent specialist or advanced claims from overpowering core consistency. Current confidence: ${confidence}%.`;
}
