const STORAGE_KEY='picklerate-v2-progress';
const RESULTS_KEY='picklerate-v2-results';

const meta={
 serveIn:['Technical Ability','Serve Consistency','Objective'],serveDepth:['Technical Ability','Serve Quality','Objective'],servePlacement:['Technical Ability','Serve Placement','Objective'],
 returnIn:['Technical Ability','Return Consistency','Objective'],returnDepth:['Technical Ability','Return Quality','Objective'],returnAdvance:['Technical Ability','Return & Advance','Behaviour'],
 dropSuccess:['Technical Ability','Third-Shot Drop','Objective'],dropForehand:['Technical Ability','Forehand Drop','Objective'],dropBackhand:['Technical Ability','Backhand Drop','Objective'],
 dropAdjustment:['Tactical Intelligence','Drop Adaptability','Decision'],driveSelection:['Tactical Intelligence','Third-Shot Selection','Decision'],fifthShot:['Technical Ability','Fifth-Shot Transition','Objective'],
 dinkCrosscourt:['Technical Ability','Cross-Court Dinking','Objective'],dinkStraight:['Technical Ability','Straight Dinking','Objective'],dinkPlacement:['Tactical Intelligence','Dink Construction','Decision'],
 dinkPressure:['Technical Ability','Dinking Under Pressure','Objective'],lowBallPatience:['Tactical Intelligence','Attack Patience','Behaviour'],kitchenMovement:['Technical Ability','Kitchen Movement','Objective'],
 transitionReset:['Technical Ability','Transition Resets','Objective'],blockDrive:['Technical Ability','Drive Blocking','Objective'],backhandBlock:['Technical Ability','Backhand Defence','Objective'],
 resetAfterPop:['Technical Ability','Defensive Recovery','Objective'],defensiveLob:['Technical Ability','Defensive Lob','Objective'],handsRecovery:['Technical Ability','Hands Recovery','Objective'],
 speedupSelection:['Tactical Intelligence','Speed-Up Selection','Decision'],speedupExecution:['Technical Ability','Speed-Up Execution','Objective'],counterForehand:['Technical Ability','Forehand Counter','Objective'],
 counterBackhand:['Technical Ability','Backhand Counter','Objective'],attackTargets:['Tactical Intelligence','Attack Targeting','Decision'],partnerMovement:['Tactical Intelligence','Partner Positioning','Behaviour'],
 middleCoverage:['Tactical Intelligence','Middle Management','Objective'],targeting:['Tactical Intelligence','Opponent Targeting','Decision'],patternRecognition:['Tactical Intelligence','Pattern Recognition','Decision'],
 shotTolerance:['Tactical Intelligence','Shot Tolerance','Behaviour'],rallyConsistency:['Competitive Validation','Pressure Execution','Experience'],unforcedErrors:['Technical Ability','Error Control','Objective'],
 badDayFloor:['Technical Ability','Performance Floor','Behaviour'],adaptPressure:['Tactical Intelligence','In-Match Adaptation','Decision'],versus35:['Competitive Validation','Performance vs 3.5','Experience'],
 versus40:['Competitive Validation','Performance vs 4.0','Experience'],strongPartner:['Competitive Validation','Stronger-Partner Contribution','Experience'],newPartner:['Competitive Validation','New-Partner Adaptability','Experience'],
 tournamentTransfer:['Competitive Validation','Tournament Transfer','Experience']
};
const pillarWeights={'Technical Ability':.70,'Tactical Intelligence':.20,'Competitive Validation':.10};
const evidenceTrust={Objective:1,Behaviour:.86,Decision:.72,Experience:.62};
const pillarDescriptions={
 'Technical Ability':'Execution quality across the core shots and movement demands of the game.',
 'Tactical Intelligence':'Shot selection, positioning, patience, targeting and in-match adaptation.',
 'Competitive Validation':'How reliably your game transfers to pressure, stronger opposition and unfamiliar partners.'
};
const icons={'Technical Ability':'⚙','Tactical Intelligence':'♟','Competitive Validation':'◆'};
let questions=[],answers={},index=0,showAllSkills=false;
const $=id=>document.getElementById(id);

async function init(){
 try{questions=await fetch('questions.json').then(r=>{if(!r.ok)throw new Error();return r.json()})}
 catch(e){document.body.innerHTML='<main style="padding:40px;font-family:sans-serif"><h1>Unable to load questions.json</h1><p>Run this folder through a local server, for example: <code>python -m http.server</code>.</p></main>';return}
 const saved=loadProgress();
 if(saved&&Object.keys(saved.answers||{}).length){$('resumeBtn').classList.remove('hidden')}
 bindEvents();
}
function bindEvents(){
 $('startBtn').onclick=()=>startAssessment(false);$('resumeBtn').onclick=()=>startAssessment(true);
 $('backBtn').onclick=()=>{if(index>0){index--;renderQuestion()}};
 $('nextBtn').onclick=nextQuestion;$('saveExitBtn').onclick=saveExit;$('resetHeaderBtn').onclick=resetAll;
 $('retakeBtn').onclick=resetAll;$('downloadBtn').onclick=downloadResults;
 $('toggleSkillsBtn').onclick=()=>{showAllSkills=!showAllSkills;$('toggleSkillsBtn').textContent=showAllSkills?'Show fewer':'Show all';renderSkillResults(calculateResults())};
 document.addEventListener('keydown',e=>{if(!$('assessmentView').classList.contains('hidden')&&['1','2','3','4','5'].includes(e.key)){selectOption(Number(e.key)-1)}});
}
function startAssessment(resume){
 if(resume){const s=loadProgress();answers=s.answers||{};index=s.index||0}else{answers={};index=0;localStorage.removeItem(STORAGE_KEY)}
 switchView('assessmentView');$('resetHeaderBtn').classList.remove('hidden');renderCategories();renderQuestion();
}
function switchView(id){['landingView','assessmentView','resultsView'].forEach(v=>$(v).classList.toggle('hidden',v!==id));window.scrollTo({top:0,behavior:'smooth'})}
function renderCategories(){
 const cats=[...new Set(questions.map(q=>q.category))];
 $('categoryList').innerHTML=cats.map(cat=>`<div class="category-item" data-cat="${cat}"><span class="category-dot"></span><span>${cat}</span></div>`).join('');
}
function renderQuestion(){
 const q=questions[index],m=meta[q.id]||['Technical Ability',q.skill,'Decision'];
 $('progressText').textContent=`Question ${index+1} of ${questions.length}`;$('progressPercent').textContent=`${Math.round((index+1)/questions.length*100)}%`;$('progressBar').style.width=`${(index+1)/questions.length*100}%`;
 $('questionCategory').textContent=q.category;$('evidenceChip').textContent=`${m[2]} evidence`;$('questionText').textContent=q.text;$('questionHelp').textContent=q.help||'';
 $('optionsList').innerHTML=q.options.map((o,i)=>`<button class="option-card ${answers[q.id]===o.score?'selected':''}" data-index="${i}" type="button"><span class="option-index">${i+1}</span><span>${o.text}</span></button>`).join('');
 [...$('optionsList').children].forEach((el,i)=>el.onclick=()=>selectOption(i));
 $('nextBtn').disabled=!answers[q.id];$('nextBtn').innerHTML=index===questions.length-1?'See my results <span>→</span>':'Next question <span>→</span>';
 $('backBtn').disabled=index===0;updateCategoryState(q.category);saveProgress();
}
function selectOption(i){const q=questions[index];answers[q.id]=q.options[i].score;renderQuestion()}
function nextQuestion(){if(!answers[questions[index].id])return;if(index<questions.length-1){index++;renderQuestion()}else{showResults()}}
function updateCategoryState(current){
 const qIndex=index;document.querySelectorAll('.category-item').forEach(el=>{const cat=el.dataset.cat;const catQs=questions.filter(q=>q.category===cat);el.classList.toggle('active',cat===current);el.classList.toggle('done',catQs.every(q=>answers[q.id]));});
}
function saveProgress(){localStorage.setItem(STORAGE_KEY,JSON.stringify({answers,index,updatedAt:Date.now()}));$('autosaveText').textContent='Progress saved'}
function loadProgress(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))}catch{return null}}
function saveExit(){saveProgress();switchView('landingView');$('resumeBtn').classList.remove('hidden')}
function resetAll(){localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(RESULTS_KEY);answers={};index=0;$('resumeBtn').classList.add('hidden');$('resetHeaderBtn').classList.add('hidden');switchView('landingView')}
function weightedAverage(items){const den=items.reduce((s,x)=>s+x.weight,0);return den?items.reduce((s,x)=>s+x.value*x.weight,0)/den:0}
function calculateResults(){
 const pillarItems={},skillItems={},evidenceCounts={Objective:0,Behaviour:0,Decision:0,Experience:0};
 questions.forEach(q=>{if(!answers[q.id])return;const [pillar,skill,type]=meta[q.id];const value=answers[q.id];const weight=(q.weight||1)*evidenceTrust[type];(pillarItems[pillar]??=[]).push({value,weight,id:q.id});(skillItems[skill]??=[]).push({value,weight,id:q.id,pillar});evidenceCounts[type]++});
 const pillars={};Object.keys(pillarWeights).forEach(p=>pillars[p]=weightedAverage(pillarItems[p]||[]));
 const skills={};Object.entries(skillItems).forEach(([s,items])=>skills[s]={score:weightedAverage(items),pillar:items[0].pillar,count:items.length});
 const overall=Object.entries(pillarWeights).reduce((s,[p,w])=>s+(pillars[p]||0)*w,0);
 const completion=Object.keys(answers).length/questions.length;
 const consistencyPairs=[['dropSuccess','dropForehand'],['dropSuccess','dropBackhand'],['dinkCrosscourt','dinkPressure'],['blockDrive','backhandBlock'],['speedupSelection','speedupExecution'],['rallyConsistency','unforcedErrors']];
 let agreement=1,used=0;consistencyPairs.forEach(([a,b])=>{if(answers[a]&&answers[b]){agreement-=Math.min(Math.abs(answers[a]-answers[b]),3)*.045;used++}});agreement=Math.max(.55,agreement);
 const compCoverage=(pillarItems['Competitive Validation']||[]).length/questions.filter(q=>meta[q.id][0]==='Competitive Validation').length;
 const confidence=Math.round(Math.min(96,Math.max(45,(completion*.45+agreement*.35+compCoverage*.20)*100)));
 return{pillars,skills,overall,confidence,evidenceCounts,completion,agreement,compCoverage};
}
function ratingLabel(r){if(r<1.8)return'New player';if(r<2.5)return'Developing beginner';if(r<3)return'Improving recreational';if(r<3.5)return'Intermediate';if(r<4)return'Strong intermediate';if(r<4.5)return'Advanced';return'High-level advanced'}
function showResults(){const r=calculateResults();localStorage.setItem(RESULTS_KEY,JSON.stringify(r));switchView('resultsView');renderResults(r)}
function renderResults(r){
 $('overallRating').textContent=r.overall.toFixed(2);$('levelLabel').textContent=ratingLabel(r.overall);$('scoreRing').style.background=`conic-gradient(var(--green) ${r.overall/5*360}deg,#e1e8e4 0deg)`;
 $('confidenceScore').textContent=`${r.confidence}% · ${r.confidence>=85?'High':r.confidence>=70?'Moderate':'Limited'}`;
 $('confidenceExplanation').textContent=r.confidence>=85?'Your answers are complete and broadly consistent across related evidence.':r.confidence>=70?'The estimate is useful, but more competitive evidence or more consistent related answers would strengthen it.':'Treat this as an early estimate. More match evidence will make it more dependable.';
 $('pillarResults').innerHTML=Object.keys(pillarWeights).map(p=>`<div class="pillar-row"><header><span class="pillar-icon">${icons[p]}</span><strong>${p}</strong></header><b>${r.pillars[p].toFixed(2)}</b><div class="bar-track"><div class="bar-fill" style="width:${r.pillars[p]/5*100}%"></div></div><p>${Math.round(pillarWeights[p]*100)}% of rating · ${pillarDescriptions[p]}</p></div>`).join('');
 renderSkillResults(r);renderInsights(r);renderEvidence(r);
}
function renderSkillResults(r){const list=Object.entries(r.skills).sort((a,b)=>b[1].score-a[1].score);const shown=showAllSkills?list:list.slice(0,10);$('skillResults').innerHTML=shown.map(([name,d])=>`<div class="skill-item"><span>${name}</span><b>${d.score.toFixed(1)}</b><div class="bar-track"><div class="bar-fill" style="width:${d.score/5*100}%"></div></div></div>`).join('')}
function renderInsights(r){const list=Object.entries(r.skills).sort((a,b)=>b[1].score-a[1].score),strengths=list.slice(0,3),weak=[...list].sort((a,b)=>a[1].score-b[1].score).slice(0,3);$('strengthsList').innerHTML=strengths.map(([n,d],i)=>insightHTML(i+1,n,`A ${d.score.toFixed(1)}/5 skill score supported by ${d.count} piece${d.count===1?'':'s'} of evidence.`)).join('');$('weaknessesList').innerHTML=weak.map(([n,d],i)=>insightHTML(i+1,n,improvementText(n,d.score))).join('')}
function insightHTML(i,n,p){return`<div class="insight-item"><span class="insight-number">${i}</span><div><b>${n}</b><p>${p}</p></div></div>`}
function improvementText(n,s){if(/Drop/.test(n))return'Prioritise repeatable, unattackable drops and the next transition ball.';if(/Dink|Kitchen/.test(n))return'Build control under changing depth, pace and direction before adding aggression.';if(/Reset|Defence|Block/.test(n))return'Practise compact blocks and soft resets while moving through transition.';if(/Selection|Target|Pattern|Tolerance|Adapt/.test(n))return'Use constraint games that reward patient, deliberate choices rather than only winners.';if(/Counter|Speed-Up|Hands/.test(n))return'Improve compact preparation, target choice and recovery after the first fast ball.';return`This ${s.toFixed(1)}/5 area is currently one of the clearest ways to raise your overall level.`}
function renderEvidence(r){const total=Object.values(r.evidenceCounts).reduce((a,b)=>a+b,0);$('evidenceSummary').innerHTML=`<div class="evidence-stat"><strong>${total}/${questions.length}</strong><span>Questions completed</span></div><div class="evidence-stat"><strong>${Math.round(r.agreement*100)}%</strong><span>Related-answer agreement</span></div><div class="evidence-stat"><strong>${Math.round(r.compCoverage*100)}%</strong><span>Competitive evidence coverage</span></div>`}
function downloadResults(){const r=calculateResults(),lines=['PickleRate Player Profile','',`Estimated level: ${r.overall.toFixed(2)} (${ratingLabel(r.overall)})`,`Confidence: ${r.confidence}%`,'',...Object.entries(r.pillars).map(([p,s])=>`${p}: ${s.toFixed(2)}`),'','Skill profile:',...Object.entries(r.skills).sort((a,b)=>b[1].score-a[1].score).map(([s,d])=>`${s}: ${d.score.toFixed(2)}`)];const blob=new Blob([lines.join('\n')],{type:'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='PickleRate-results.txt';a.click();URL.revokeObjectURL(a.href)}
init();
