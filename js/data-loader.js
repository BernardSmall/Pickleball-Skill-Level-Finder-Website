// Loads all editable application data before the interface is initialised.
let questions = [];
let drillLibrary = {};
let levelData = {};
let categoryData = {};
let contradictionRules = [];
let skillGates = {};
let questionMetadata = {};
let categoryWeights = {};
let categoryNames = {};
let categoryDescriptions = {};
const scoringEngineVersion = APP_CONFIG.scoringEngineVersion;

async function loadJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Unable to load ${path} (${response.status})`);
    }
    return response.json();
}

const dataReady = Promise.all([
    loadJson(DATA_PATHS.QUESTIONS),
    loadJson(DATA_PATHS.DRILLS),
    loadJson(DATA_PATHS.LEVELS),
    loadJson(DATA_PATHS.CATEGORIES),
    loadJson(DATA_PATHS.CONTRADICTIONS),
    loadJson(DATA_PATHS.SKILL_GATES),
    loadJson(DATA_PATHS.QUESTION_METADATA)
]).then(([
    loadedQuestions,
    loadedDrills,
    loadedLevels,
    loadedCategories,
    loadedContradictions,
    loadedSkillGates,
    loadedQuestionMetadata
]) => {
    questions = loadedQuestions;
    drillLibrary = loadedDrills;
    levelData = loadedLevels;
    categoryData = loadedCategories;
    contradictionRules = loadedContradictions;
    skillGates = loadedSkillGates;
    questionMetadata = loadedQuestionMetadata;

    Object.entries(categoryData).forEach(([key, category]) => {
        categoryWeights[key] = category.weight;
        categoryNames[key] = category.name;
        categoryDescriptions[key] = category.description;
    });

    return true;
});
