// Stage 2 rating engine. Editable data is loaded from the data directory.

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
    const points = levelData.scoreToRating;

    for (let index = 0; index < points.length - 1; index += 1) {
        const current = points[index];
        const next = points[index + 1];

        if (score >= current.score && score <= next.score) {
            const progress = (score - current.score) / (next.score - current.score);
            return current.rating + progress * (next.rating - current.rating);
        }
    }

    return score < points[0].score
        ? points[0].rating
        : points[points.length - 1].rating;
}

function getRatingLabel(rating) {
    const match = levelData.labels.find(level => rating < level.below);
    return match ? match.label : levelData.labels[levelData.labels.length - 1].label;
}

function getRatingRange(rating, confidence) {
    const rangeRule = levelData.confidenceRanges.find(
        rule => confidence >= rule.minimumConfidence
    );
    const spread = rangeRule ? rangeRule.spread : 0.38;
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

    const technicalCategories = [
        CATEGORIES.SERVE_RETURN,
        CATEGORIES.THIRD_SHOT,
        CATEGORIES.KITCHEN,
        CATEGORIES.DEFENCE,
        CATEGORIES.ATTACK,
        CATEGORIES.STRATEGY,
        CATEGORIES.CONSISTENCY
    ];
    const technicalValues = technicalCategories
        .map(category => categoryScores[category])
        .filter(value => value !== undefined);
    const technicalAverage = technicalValues.reduce((sum, value) => sum + value, 0) / technicalValues.length;
    const performanceDifference = Math.abs((categoryScores[CATEGORIES.PERFORMANCE] || technicalAverage) - technicalAverage);
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
