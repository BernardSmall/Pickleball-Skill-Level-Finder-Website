const STORAGE_KEY='picklerate-v3-progress';
const HISTORY_KEY='picklerate-v3-history';
const meta={
 serveIn:['Technical Ability','Serve Consistency','Objective'],serveDepth:['Technical Ability','Serve Quality','Objective'],servePlacement:['Technical Ability','Serve Placement','Objective'],returnIn:['Technical Ability','Return Consistency','Objective'],returnDepth:['Technical Ability','Return Quality','Objective'],returnAdvance:['Technical Ability','Return & Advance','Behaviour'],dropSuccess:['Technical Ability','Third-Shot Drop','Objective'],dropForehand:['Technical Ability','Forehand Drop','Objective'],dropBackhand:['Technical Ability','Backhand Drop','Objective'],dropAdjustment:['Tactical Intelligence','Drop Adaptability','Decision'],driveSelection:['Tactical Intelligence','Third-Shot Selection','Decision'],fifthShot:['Technical Ability','Fifth-Shot Transition','Objective'],dinkCrosscourt:['Technical Ability','Cross-Court Dinking','Objective'],dinkStraight:['Technical Ability','Straight Dinking','Objective'],dinkPlacement:['Tactical Intelligence','Dink Construction','Decision'],dinkPressure:['Technical Ability','Dinking Under Pressure','Objective'],lowBallPatience:['Tactical Intelligence','Attack Patience','Behaviour'],kitchenMovement:['Technical Ability','Kitchen Movement','Objective'],transitionReset:['Technical Ability','Transition Resets','Objective'],blockDrive:['Technical Ability','Drive Blocking','Objective'],backhandBlock:['Technical Ability','Backhand Defence','Objective'],resetAfterPop:['Technical Ability','Defensive Recovery','Objective'],defensiveLob:['Technical Ability','Defensive Lob','Objective'],handsRecovery:['Technical Ability','Hands Recovery','Objective'],speedupSelection:['Tactical Intelligence','Speed-Up Selection','Decision'],speedupExecution:['Technical Ability','Speed-Up Execution','Objective'],counterForehand:['Technical Ability','Forehand Counter','Objective'],counterBackhand:['Technical Ability','Backhand Counter','Objective'],attackTargets:['Tactical Intelligence','Attack Targeting','Decision'],partnerMovement:['Tactical Intelligence','Partner Positioning','Behaviour'],middleCoverage:['Tactical Intelligence','Middle Management','Objective'],targeting:['Tactical Intelligence','Opponent Targeting','Decision'],patternRecognition:['Tactical Intelligence','Pattern Recognition','Decision'],shotTolerance:['Tactical Intelligence','Shot Tolerance','Behaviour'],rallyConsistency:['Competitive Validation','Pressure Execution','Experience'],unforcedErrors:['Technical Ability','Error Control','Objective'],badDayFloor:['Technical Ability','Performance Floor','Behaviour'],adaptPressure:['Tactical Intelligence','In-Match Adaptation','Decision'],versus35:['Competitive Validation','Performance vs 3.5','Experience'],versus40:['Competitive Validation','Performance vs 4.0','Experience'],strongPartner:['Competitive Validation','Stronger-Partner Contribution','Experience'],newPartner:['Competitive Validation','New-Partner Adaptability','Experience'],tournamentTransfer:['Competitive Validation','Tournament Transfer','Experience']};
const pillarWeights={'Technical Ability':.70,'Tactical Intelligence':.20,'Competitive Validation':.10};
const evidenceTrust={Objective:1,Behaviour:.86,Decision:.72,Experience:.62};
const pillarDescriptions={'Technical Ability':'Execution quality across the core shots and movement demands of the game.','Tactical Intelligence':'Shot selection, positioning, patience, targeting and in-match adaptation.','Competitive Validation':'How reliably your game transfers to pressure, stronger opposition and unfamiliar partners.'};
const drills={
 'Third-Shot Drop':['Drop ladder','Hit 10 drops from three depths; only advance after 7 land unattackably.'],
 'Forehand Drop':['Forehand drop targets','Alternate middle and cross-court drops, tracking unattackable balls out of 20.'],
 'Backhand Drop':['Backhand drop block','Play 20 backhand-only third shots, then transition behind every successful drop.'],
 'Fifth-Shot Transition':['3rd–5th progression','Drop, split-step, then reset the fifth shot before advancing.'],
 'Transition Resets':['Transition reset ladder','Start at the baseline and move forward only after two controlled resets.'],
 'Drive Blocking':['Block-to-kitchen','Partner drives 20 balls; score only blocks that bounce in the kitchen.'],
 'Backhand Defence':['Backhand wall blocks','Compact backhand blocks with no backswing; target the kitchen middle.'],
 'Cross-Court Dinking':['Cross-court consistency','Play cooperative-to-competitive dinks and count rallies reaching 10 controlled shots.'],
 'Dinking Under Pressure':['Variable dink feeds','Partner changes depth and pace while you keep 7 of 10 balls unattackable.'],
 'Dink Construction':['Three-ball pattern','Use wide, middle and deep dinks to create a planned fourth-ball opening.'],
 'Speed-Up Selection':['Green-light speed-ups','Only attack balls above a chosen height; lose a point for attacking red-light balls.'],
 'Attack Targeting':['Target windows','Call body, dominant hip or middle before each attack and track execution.'],
 'Partner Positioning':['Two-player shadow movement','Move as a unit through wide balls, transition and recovery without a ball first.'],
 'Pattern Recognition':['Pattern call-out games','After each rally, name the opponent pattern and one possible adjustment.'],
 'Shot Tolerance':['Patience game','A team may only attack after six neutral contacts or a clearly high ball.'],
 'In-Match Adaptation':['Two-error reset','After two similar errors, state and test one specific adjustment.'],
 'Error Control':['Twenty-ball discipline','Play 20 routine balls with margin; restart after an avoidable miss.']
};
let questions=[],answers={},index=0,showAllSkills=false,tester={},currentRecordId=null;
const $=id=>document.getElementById(id);
async function init(){
 try{questions=await fetch('data/questions.json').then(r=>{if(!r.ok)throw Error();return r.json()})}catch{document.body.innerHTML='<main style="padding:40px;font-family:sans-serif"><h1>Unable to load data/questions.json</h1><p>Run this folder through a local server.</p></main>';return}
 if(loadProgress()?.answers&&Object.keys(loadProgress().answers).length)$('resumeBtn').classList.remove('hidden');
 bindEvents();
}
function bindEvents(){
 $('startBtn').onclick=()=>openTester(false);$('resumeBtn').onclick=()=>startAssessment(true);$('historyBtn').onclick=showHistory;$('historyHeaderBtn').onclick=showHistory;
 $('skipTesterBtn').onclick=()=>{tester={};startAssessment(false)};$('beginAssessmentBtn').onclick=()=>{tester=readTester();startAssessment(false)};
 $('backBtn').onclick=()=>{if(index>0){index--;renderQuestion()}};$('nextBtn').onclick=nextQuestion;$('saveExitBtn').onclick=saveExit;$('resetHeaderBtn').onclick=resetCurrent;
 $('retakeBtn').onclick=()=>openTester(false);$('downloadBtn').onclick=()=>downloadCurrentJson();$('toggleSkillsBtn').onclick=()=>{showAllSkills=!showAllSkills;$('toggleSkillsBtn').textContent=showAllSkills?'Show fewer':'Show all';renderSkillResults(calculateResults())};
 $('saveFeedbackBtn').onclick=saveFeedback;$('exportHistoryCsvBtn').onclick=exportHistoryCsv;$('exportHistoryJsonBtn').onclick=exportHistoryJson;$('clearHistoryBtn').onclick=clearHistory;$('backToHistoryBtn').onclick=showHistory;
 document.addEventListener('keydown',e=>{if(!$('assessmentView').classList.contains('hidden')&&'12345'.includes(e.key))selectOption(Number(e.key)-1)});
}
function switchView(id){['landingView','testerView','assessmentView','resultsView','historyView','historyDetailView'].forEach(v=>$(v).classList.toggle('hidden',v!==id));window.scrollTo({top:0,behavior:'smooth'})}
function openTester(){switchView('testerView');$('resetHeaderBtn').classList.add('hidden')}
function readTester(){return{name:$('testerName').value.trim()||'Anonymous',knownLevel:numOrNull($('knownLevel').value),ratingSource:$('ratingSource').value,yearsPlayed:numOrNull($('yearsPlayed').value),playType:$('playType').value,environment:$('environment').value}}
function numOrNull(v){return v===''?null:Number(v)}
function startAssessment(resume){if(resume){const s=loadProgress();answers=s.answers||{};index=s.index||0;tester=s.tester||{}}else{answers={};index=0;localStorage.removeItem(STORAGE_KEY)}switchView('assessmentView');$('resetHeaderBtn').classList.remove('hidden');renderCategories();renderQuestion()}
function renderCategories(){const cats=[...new Set(questions.map(q=>q.category))];$('categoryList').innerHTML=cats.map(c=>`<div class="category-item" data-cat="${c}"><span class="category-dot"></span><span>${c}</span></div>`).join('')}
function renderQuestion(){const q=questions[index],m=meta[q.id];$('progressText').textContent=`Question ${index+1} of ${questions.length}`;$('progressPercent').textContent=`${Math.round((index+1)/questions.length*100)}%`;$('progressBar').style.width=`${(index+1)/questions.length*100}%`;$('questionCategory').textContent=q.category;$('evidenceChip').textContent=`${m[2]} evidence`;$('questionText').textContent=q.text;$('questionHelp').textContent=q.help||'';$('optionsList').innerHTML=q.options.map((o,i)=>`<button class="option-card ${answers[q.id]===o.score?'selected':''}" data-index="${i}"><span class="option-index">${i+1}</span><span>${o.text}</span></button>`).join('');[...$('optionsList').children].forEach((el,i)=>el.onclick=()=>selectOption(i));$('nextBtn').disabled=!answers[q.id];$('nextBtn').innerHTML=index===questions.length-1?'See my results <span>→</span>':'Next question <span>→</span>';$('backBtn').disabled=index===0;updateCategoryState(q.category);saveProgress()}
function selectOption(i){const q=questions[index];answers[q.id]=q.options[i].score;renderQuestion()}
function nextQuestion(){if(!answers[questions[index].id])return;if(index<questions.length-1){index++;renderQuestion()}else completeAssessment()}
function updateCategoryState(current){document.querySelectorAll('.category-item').forEach(el=>{const qs=questions.filter(q=>q.category===el.dataset.cat);el.classList.toggle('active',el.dataset.cat===current);el.classList.toggle('done',qs.every(q=>answers[q.id]))})}
function saveProgress(){localStorage.setItem(STORAGE_KEY,JSON.stringify({answers,index,tester,updatedAt:Date.now()}));$('autosaveText').textContent='Progress saved'}
function loadProgress(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))}catch{return null}}
function saveExit(){saveProgress();switchView('landingView');$('resumeBtn').classList.remove('hidden')}
function resetCurrent(){localStorage.removeItem(STORAGE_KEY);answers={};index=0;$('resumeBtn').classList.add('hidden');$('resetHeaderBtn').classList.add('hidden');switchView('landingView')}
function weightedAverage(items){const den=items.reduce((s,x)=>s+x.weight,0);return den?items.reduce((s,x)=>s+x.value*x.weight,0)/den:0}
function calculateResults(){const pillarItems={},skillItems={},evidenceCounts={Objective:0,Behaviour:0,Decision:0,Experience:0};questions.forEach(q=>{if(!answers[q.id])return;const [pillar,skill,type]=meta[q.id],value=answers[q.id],weight=(q.weight||1)*evidenceTrust[type];(pillarItems[pillar]??=[]).push({value,weight,id:q.id});(skillItems[skill]??=[]).push({value,weight,id:q.id,pillar});evidenceCounts[type]++});const pillars={};Object.keys(pillarWeights).forEach(p=>pillars[p]=weightedAverage(pillarItems[p]||[]));const skills={};Object.entries(skillItems).forEach(([s,items])=>skills[s]={score:weightedAverage(items),pillar:items[0].pillar,count:items.length});const overall=Object.entries(pillarWeights).reduce((s,[p,w])=>s+(pillars[p]||0)*w,0);const pairs=[['dropSuccess','dropForehand'],['dropSuccess','dropBackhand'],['dinkCrosscourt','dinkPressure'],['blockDrive','backhandBlock'],['speedupSelection','speedupExecution'],['rallyConsistency','unforcedErrors']];let agreement=1;pairs.forEach(([a,b])=>{if(answers[a]&&answers[b])agreement-=Math.min(Math.abs(answers[a]-answers[b]),3)*.045});agreement=Math.max(.55,agreement);const compCoverage=(pillarItems['Competitive Validation']||[]).length/questions.filter(q=>meta[q.id][0]==='Competitive Validation').length;const confidence=Math.round(Math.min(96,Math.max(45,(Object.keys(answers).length/questions.length*.45+agreement*.35+compCoverage*.2)*100)));return{pillars,skills,overall,confidence,evidenceCounts,agreement,compCoverage}}
function ratingLabel(r){if(r<1.8)return'New player';if(r<2.5)return'Developing beginner';if(r<3)return'Improving recreational';if(r<3.5)return'Intermediate';if(r<4)return'Strong intermediate';if(r<4.5)return'Advanced';return'High-level advanced'}
function completeAssessment(){const results=calculateResults(),record={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),createdAt:new Date().toISOString(),tester:{...tester},answers:{...answers},results,questionVersion:'v3-43',feedback:''};const history=getHistory();history.unshift(record);localStorage.setItem(HISTORY_KEY,JSON.stringify(history));localStorage.removeItem(STORAGE_KEY);currentRecordId=record.id;switchView('resultsView');renderResults(results);$('testerFeedback').value=''}
function renderResults(r){$('overallRating').textContent=r.overall.toFixed(2);$('levelLabel').textContent=ratingLabel(r.overall);$('scoreRing').style.background=`conic-gradient(var(--green) ${r.overall/5*360}deg,#e1e8e4 0deg)`;$('confidenceScore').textContent=`${r.confidence}% · ${r.confidence>=85?'High':r.confidence>=70?'Moderate':'Limited'}`;$('confidenceExplanation').textContent=r.confidence>=85?'Your answers are complete and broadly consistent across related evidence.':r.confidence>=70?'The estimate is useful, but additional competitive evidence would strengthen it.':'Treat this as an early estimate; more match evidence will improve it.';$('pillarResults').innerHTML=Object.keys(pillarWeights).map(p=>`<div class="pillar-row"><header><span class="pillar-icon">●</span><strong>${p}</strong></header><b>${r.pillars[p].toFixed(2)}</b><div class="bar-track"><div class="bar-fill" style="width:${r.pillars[p]/5*100}%"></div></div><p>${Math.round(pillarWeights[p]*100)}% of rating · ${pillarDescriptions[p]}</p></div>`).join('');renderSkillResults(r);renderInsights(r);renderEvidence(r)}
function renderSkillResults(r){const list=Object.entries(r.skills).sort((a,b)=>b[1].score-a[1].score),shown=showAllSkills?list:list.slice(0,10);$('skillResults').innerHTML=shown.map(([n,d])=>`<div class="skill-item"><span>${n}</span><b>${d.score.toFixed(1)}</b><div class="bar-track"><div class="bar-fill" style="width:${d.score/5*100}%"></div></div></div>`).join('')}
function renderInsights(r){const list=Object.entries(r.skills).sort((a,b)=>b[1].score-a[1].score),weak=[...list].reverse();$('strengthsList').innerHTML=list.slice(0,3).map(([n,d],i)=>insight(i+1,n,`A ${d.score.toFixed(1)}/5 score supported by ${d.count} evidence item${d.count===1?'':'s'}.`)).join('');$('weaknessesList').innerHTML=weak.slice(0,3).map(([n,d],i)=>insight(i+1,n,explainWeakness(n,d.score))).join('')}
function insight(i,n,p){return`<div class="insight-item"><span class="insight-number">${i}</span><div><b>${n}</b><p>${p}</p></div></div>`}
function explainWeakness(n,s){const d=drills[n];return d?`${d[1]} Recommended drill: ${d[0]}.`:`At ${s.toFixed(1)}/5, this is one of the clearest opportunities to raise your level.`}
function renderEvidence(r){const total=Object.values(r.evidenceCounts).reduce((a,b)=>a+b,0);$('evidenceSummary').innerHTML=`<div class="evidence-stat"><strong>${total}/${questions.length}</strong><span>Questions completed</span></div><div class="evidence-stat"><strong>${Math.round(r.agreement*100)}%</strong><span>Related-answer agreement</span></div><div class="evidence-stat"><strong>${Math.round(r.compCoverage*100)}%</strong><span>Competitive evidence coverage</span></div>`}
function getHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY))||[]}catch{return[]}}
function showHistory(){switchView('historyView');$('resetHeaderBtn').classList.add('hidden');renderHistory()}
function renderHistory(){const h=getHistory();if(!h.length){$('historySummary').innerHTML='';$('historyList').innerHTML='<div class="empty-history detail-card"><h2>No completed assessments yet</h2><p>Your completed PickleRate profiles will appear here.</p></div>';return}const latest=h[0],best=Math.max(...h.map(x=>x.results.overall)),avg=h.reduce((s,x)=>s+x.results.overall,0)/h.length,change=h.length>1?latest.results.overall-h[h.length-1].results.overall:0;$('historySummary').innerHTML=stat(h.length,'Assessments')+stat(latest.results.overall.toFixed(2),'Latest rating')+stat(best.toFixed(2),'Highest rating')+stat(`${change>=0?'+':''}${change.toFixed(2)}`,'Overall change');$('historyList').innerHTML=h.map(r=>`<article class="history-card" data-id="${r.id}"><div class="history-card-top"><div><span class="history-card-meta">${formatDate(r.createdAt)}</span><h3>${escapeHtml(r.tester?.name||'Anonymous')}</h3><div class="history-card-meta">${r.tester?.knownLevel?`Known level ${r.tester.knownLevel} · `:''}${escapeHtml(r.tester?.playType||'Player assessment')}</div></div><div><div class="history-rating">${r.results.overall.toFixed(2)}</div><span class="confidence-pill">${r.results.confidence}% confidence</span></div></div><div class="history-pillars">${Object.entries(r.results.pillars).map(([p,s])=>`<div><small>${p} · ${s.toFixed(2)}</small><div class="tiny-bar"><i style="width:${s/5*100}%"></i></div></div>`).join('')}</div><div class="history-card-footer"><span>${ratingLabel(r.results.overall)}</span><b>Open full result →</b></div></article>`).join('');document.querySelectorAll('.history-card').forEach(c=>c.onclick=()=>showHistoryDetail(c.dataset.id))}
function stat(v,l){return`<div class="history-stat"><strong>${v}</strong><span>${l}</span></div>`}
function showHistoryDetail(id){const r=getHistory().find(x=>x.id===id);if(!r)return;currentRecordId=id;switchView('historyDetailView');const skills=Object.entries(r.results.skills).sort((a,b)=>b[1].score-a[1].score),weak=[...skills].reverse().slice(0,4);$('historyDetail').innerHTML=`<div class="detail-hero"><article class="detail-card"><span class="eyebrow">ESTIMATED LEVEL</span><div class="detail-rating">${r.results.overall.toFixed(2)}</div><h2>${ratingLabel(r.results.overall)}</h2><p>${r.results.confidence}% confidence · ${formatDate(r.createdAt)}</p></article><article class="detail-card"><span class="eyebrow">TESTER PROFILE</span><h2>${escapeHtml(r.tester?.name||'Anonymous')}</h2><p>${profileText(r.tester)}</p>${r.feedback?`<h3>Feedback</h3><p>${escapeHtml(r.feedback)}</p>`:''}</article></div><div class="detail-grid"><article class="detail-card"><h2>Pillar graph</h2><div class="chart-list">${chartRows(r.results.pillars)}</div><p>Technical execution drives most of the rating. Tactical and competitive evidence refine and validate it.</p></article><article class="detail-card"><h2>Skill graph</h2><div class="chart-list">${chartRows(Object.fromEntries(skills.slice(0,10).map(([n,d])=>[n,d.score])))}</div></article><article class="detail-card"><h2>Recommended drills</h2><div class="drill-list">${weak.map(([n,d])=>drillHtml(n,d.score)).join('')}</div></article><article class="detail-card"><h2>Assessment explanation</h2><p>${historyExplanation(r)}</p><p><b>Evidence agreement:</b> ${Math.round(r.results.agreement*100)}%. <b>Competitive coverage:</b> ${Math.round(r.results.compCoverage*100)}%.</p></article></div><article class="detail-card"><h2>Original answers</h2><div class="answer-list">${questions.map(q=>answerHtml(q,r.answers[q.id])).join('')}</div></article><div class="results-actions"><button class="secondary-btn" onclick="deleteRecord('${r.id}')">Delete this result</button><button class="primary-btn" onclick="downloadRecord('${r.id}')">Download JSON ↓</button></div>`}
function chartRows(obj){return Object.entries(obj).map(([n,v])=>`<div class="chart-row"><span>${n}</span><div class="chart-track"><div class="chart-fill" style="width:${v/5*100}%"></div></div><b>${v.toFixed(2)}</b></div>`).join('')}
function drillHtml(n,s){const d=drills[n]||['Focused repetition',`Use a 10-ball test for ${n.toLowerCase()} and aim to improve from ${Math.round(s*2)}/10 to ${Math.min(10,Math.round(s*2)+2)}/10.`];return`<div class="drill"><h4>${d[0]}</h4><p><b>${n} · ${s.toFixed(1)}/5</b></p><p>${d[1]}</p></div>`}
function answerHtml(q,score){const opt=q.options.find(o=>o.score===score);return`<div class="answer-item"><header><b>${q.text}</b><span>${score||'—'}/5</span></header><p>${opt?escapeHtml(opt.text):'No answer recorded'}</p></div>`}
function historyExplanation(r){const p=r.results.pillars,top=Object.entries(p).sort((a,b)=>b[1]-a[1])[0],low=Object.entries(p).sort((a,b)=>a[1]-b[1])[0];return`This result was led by ${top[0].toLowerCase()} (${top[1].toFixed(2)}). ${low[0]} was the lowest pillar (${low[1].toFixed(2)}), so improvements there may make the player profile more complete. Competitive evidence remains a validator rather than the main driver of the estimated level.`}
function profileText(t={}){return[`Known level: ${t.knownLevel??'not provided'}`,`Source: ${t.ratingSource||'not provided'}`,`Years played: ${t.yearsPlayed??'not provided'}`,t.playType||'Play type not provided',t.environment||'Environment not provided'].join(' · ')}
function saveFeedback(){const h=getHistory(),r=h.find(x=>x.id===currentRecordId);if(!r)return;r.feedback=$('testerFeedback').value.trim();localStorage.setItem(HISTORY_KEY,JSON.stringify(h));$('saveFeedbackBtn').textContent='Saved ✓';setTimeout(()=>$('saveFeedbackBtn').textContent='Save feedback',1200)}
function exportHistoryJson(){downloadBlob(JSON.stringify(getHistory(),null,2),'PickleRate-history.json','application/json')}
function exportHistoryCsv(){const h=getHistory(),heads=['date','tester','known_level','rating_source','years_played','play_type','environment','estimated_rating','technical','tactical','competitive','confidence','feedback'],rows=h.map(r=>[r.createdAt,r.tester?.name||'',r.tester?.knownLevel??'',r.tester?.ratingSource||'',r.tester?.yearsPlayed??'',r.tester?.playType||'',r.tester?.environment||'',r.results.overall.toFixed(2),r.results.pillars['Technical Ability'].toFixed(2),r.results.pillars['Tactical Intelligence'].toFixed(2),r.results.pillars['Competitive Validation'].toFixed(2),r.results.confidence,r.feedback||'']);downloadBlob([heads,...rows].map(row=>row.map(csvCell).join(',')).join('\n'),'PickleRate-history.csv','text/csv')}
function csvCell(v){return`"${String(v).replaceAll('"','""')}"`}
function clearHistory(){if(confirm('Delete all saved assessment history?')){localStorage.removeItem(HISTORY_KEY);renderHistory()}}
function deleteRecord(id){if(!confirm('Delete this saved result?'))return;localStorage.setItem(HISTORY_KEY,JSON.stringify(getHistory().filter(x=>x.id!==id)));showHistory()}
function downloadRecord(id){const r=getHistory().find(x=>x.id===id);if(r)downloadBlob(JSON.stringify(r,null,2),`PickleRate-${r.createdAt.slice(0,10)}.json`,'application/json')}
function downloadCurrentJson(){downloadRecord(currentRecordId)}
function downloadBlob(content,name,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function formatDate(v){return new Intl.DateTimeFormat('en-ZA',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v))}
function escapeHtml(v){return String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
window.deleteRecord=deleteRecord;window.downloadRecord=downloadRecord;
init();

// App-style routing, navigation and long-term insights.
const APP_VIEWS=['landingView','testerView','assessmentView','resultsView','historyView','historyDetailView','insightsView','aboutView'];
let suppressRoutePush=false;
const originalSwitchView=switchView;
switchView=function(id){
  APP_VIEWS.forEach(v=>{const el=$(v);if(el)el.classList.toggle('hidden',v!==id)});
  document.body.dataset.view=id;
  document.querySelectorAll('[data-route]').forEach(el=>el.classList.toggle('active',el.dataset.route===id||(id==='historyDetailView'&&el.dataset.route==='historyView')));
  const secondaryViews=['compareFriendsView','drillLibraryView','settingsView'];
  document.getElementById('moreNavBtn')?.classList.toggle('active',secondaryViews.includes(id));
  document.querySelector('.main-nav')?.classList.remove('open');
  $('mobileMenuBtn')?.setAttribute('aria-expanded','false');
  $('mobileMenuBtn')?.setAttribute('aria-label','Open navigation');
  closeMoreNavigation();
  if(id==='insightsView')renderJourneyInsights();
  if(!suppressRoutePush){const hash=viewToHash(id);if(location.hash!==hash)history.pushState({view:id},'',hash)}
  suppressRoutePush=false;
  window.scrollTo({top:0,behavior:'smooth'});
};
function viewToHash(id){return({landingView:'#home',testerView:'#tester',assessmentView:'#assessment',resultsView:'#results',historyView:'#journey',historyDetailView:'#journey-detail',insightsView:'#insights',aboutView:'#about'})[id]||'#home'}
function hashToView(){return({'#home':'landingView','#tester':'testerView','#assessment':'assessmentView','#results':'resultsView','#journey':'historyView','#journey-detail':'historyDetailView','#insights':'insightsView','#about':'aboutView'})[location.hash]||'landingView'}
function routeTo(id){
  if(id==='historyView'){showHistory();return}
  if(id==='historyDetailView'&&currentRecordId){showHistoryDetail(currentRecordId);return}
  switchView(id);
  $('resetHeaderBtn')?.classList.toggle('hidden',id!=='assessmentView');
}
function openMoreNavigation(){
  $('moreNavPanel')?.classList.add('open');
  $('moreNavPanel')?.setAttribute('aria-hidden','false');
  $('moreNavBackdrop')?.classList.remove('hidden');
  $('moreNavBtn')?.setAttribute('aria-expanded','true');
  document.body.classList.add('more-nav-open');
}
function closeMoreNavigation(){
  $('moreNavPanel')?.classList.remove('open');
  $('moreNavPanel')?.setAttribute('aria-hidden','true');
  $('moreNavBackdrop')?.classList.add('hidden');
  $('moreNavBtn')?.setAttribute('aria-expanded','false');
  document.body.classList.remove('more-nav-open');
}
function setupAppNavigation(){
  document.querySelectorAll('[data-route]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();routeTo(el.dataset.route)}));
  document.querySelectorAll('[data-action="start"]').forEach(el=>el.addEventListener('click',()=>openTester(false)));
  $('mobileMenuBtn')?.addEventListener('click',()=>{const nav=document.querySelector('.main-nav');const isOpen=nav?.classList.toggle('open');$('mobileMenuBtn')?.setAttribute('aria-expanded',String(Boolean(isOpen)));$('mobileMenuBtn')?.setAttribute('aria-label',isOpen?'Close navigation':'Open navigation')});
  $('moreNavBtn')?.addEventListener('click',()=>{
    const open=!$('moreNavPanel')?.classList.contains('open');
    open?openMoreNavigation():closeMoreNavigation();
  });
  $('closeMoreNavBtn')?.addEventListener('click',closeMoreNavigation);
  $('moreNavBackdrop')?.addEventListener('click',closeMoreNavigation);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMoreNavigation()});
  window.addEventListener('popstate',()=>{suppressRoutePush=true;routeTo(hashToView())});
  if(location.hash&&location.hash!=='#home'){suppressRoutePush=true;routeTo(hashToView())}else history.replaceState({view:'landingView'},'','#home');
}
function renderJourneyInsights(){
  const h=[...getHistory()].reverse(),host=$('journeyInsights');
  if(!host)return;
  if(!h.length){host.innerHTML='<article class="detail-card empty-insights"><h2>Your insights will grow with you</h2><p>Complete your first assessment to establish a baseline. After two or more assessments, PickleRate will show rating trends and skill changes.</p><button class="primary-btn" onclick="openTester(false)">Start assessment →</button></article>';return}
  const latest=h[h.length-1],first=h[0],delta=latest.results.overall-first.results.overall;
  const allSkillNames=[...new Set(h.flatMap(r=>Object.keys(r.results.skills||{})))];
  const changes=allSkillNames.map(name=>{const a=first.results.skills?.[name]?.score,b=latest.results.skills?.[name]?.score;return a==null||b==null?null:{name,change:b-a,current:b}}).filter(Boolean).sort((a,b)=>b.change-a.change);
  const strongest=Object.entries(latest.results.skills||{}).sort((a,b)=>b[1].score-a[1].score).slice(0,4);
  const priorities=Object.entries(latest.results.skills||{}).sort((a,b)=>a[1].score-b[1].score).slice(0,4);
  host.innerHTML=`<div class="history-summary">${stat(h.length,'Assessments')}${stat(latest.results.overall.toFixed(2),'Current rating')}${stat(`${delta>=0?'+':''}${delta.toFixed(2)}`,'Rating change')}${stat(`${latest.results.confidence}%`,'Current confidence')}</div>
  <div class="insights-grid">
    <article class="detail-card wide"><span class="eyebrow">RATING TREND</span><h2>Your assessment timeline</h2><div class="trend-line">${h.map((r,i)=>`<div class="trend-column"><b>${r.results.overall.toFixed(2)}</b><div class="trend-bar" style="height:${Math.max(12,r.results.overall/5*150)}px"></div><small>${new Date(r.createdAt).toLocaleDateString('en-ZA',{day:'numeric',month:'short'})}</small></div>`).join('')}</div></article>
    <article class="detail-card"><span class="eyebrow">CURRENT STRENGTHS</span><h2>What is supporting your level</h2><div class="chart-list">${chartRows(Object.fromEntries(strongest.map(([n,d])=>[n,d.score])))}</div></article>
    <article class="detail-card"><span class="eyebrow">NEXT FOCUS</span><h2>Highest-return practice areas</h2><div class="drill-list">${priorities.map(([n,d])=>drillHtml(n,d.score)).join('')}</div></article>
    <article class="detail-card"><span class="eyebrow">MOST IMPROVED</span><h2>Changes from your baseline</h2>${h.length<2?'<p>Complete another assessment after a period of focused practice to unlock comparisons.</p>':`<div class="chart-list">${changes.slice(0,5).map(x=>`<div class="chart-row"><span>${x.name}</span><div class="chart-track"><div class="chart-fill" style="width:${Math.max(4,x.current/5*100)}%"></div></div><b>${x.change>=0?'+':''}${x.change.toFixed(2)}</b></div>`).join('')}</div>`}</article>
    <article class="detail-card"><span class="eyebrow">CONSISTENT LIMITERS</span><h2>Skills to revisit regularly</h2><p>${priorities.map(([n])=>n).join(', ')} currently sit lowest in your latest profile. Use the suggested drills, then reassess after enough match play to judge whether the improvement transfers.</p></article>
  </div>`;
}
const originalShowHistoryDetail=showHistoryDetail;
showHistoryDetail=function(id){originalShowHistoryDetail(id);history.replaceState({view:'historyDetailView',id},'',`#journey-detail`)};
window.openTester=openTester;
setupAppNavigation();

// Professional product experience additions.
APP_VIEWS.push('skillsView','skillDetailView');
const extendedViewToHash={skillsView:'#skills',skillDetailView:'#skill-detail'};
const baseViewToHash=viewToHash;
viewToHash=function(id){return extendedViewToHash[id]||baseViewToHash(id)};
const baseHashToView=hashToView;
hashToView=function(){return ({'#skills':'skillsView','#skill-detail':'skillDetailView'})[location.hash]||baseHashToView()};

const originalEnhancedSwitchView=switchView;
switchView=function(id){
  originalEnhancedSwitchView(id);
  if(id==='skillsView')renderSkillsDirectory();
};

const baseRenderResults=renderResults;
renderResults=function(r){
  baseRenderResults(r);
  renderResultSummary(r);
  renderStrengthRadar(r);
};

function renderResultSummary(r){
  const host=$('resultSummaryCards'); if(!host)return;
  const cards=[['Estimated rating',r.overall.toFixed(2)],['Confidence',`${r.confidence}%`],['Technical',r.pillars['Technical Ability'].toFixed(2)],['Tactical',r.pillars['Tactical Intelligence'].toFixed(2)],['Competition',r.pillars['Competitive Validation'].toFixed(2)]];
  host.innerHTML=cards.map(([label,value],i)=>`<div class="result-summary-card ${i===0?'primary':''}"><span>${label}</span><strong>${value}</strong></div>`).join('');
}

function radarGroups(r){
  const groups={Serve:[],Return:[],Drops:[],Kitchen:[],Defence:[],Attack:[],Strategy:[],Pressure:[]};
  Object.entries(r.skills||{}).forEach(([name,data])=>{
    const n=name.toLowerCase();
    if(n.includes('serve'))groups.Serve.push(data.score);
    else if(n.includes('return'))groups.Return.push(data.score);
    else if(n.includes('drop')||n.includes('third')||n.includes('fifth'))groups.Drops.push(data.score);
    else if(n.includes('dink')||n.includes('kitchen'))groups.Kitchen.push(data.score);
    else if(n.includes('reset')||n.includes('block')||n.includes('defen'))groups.Defence.push(data.score);
    else if(n.includes('attack')||n.includes('speed')||n.includes('counter'))groups.Attack.push(data.score);
    else if(n.includes('position')||n.includes('target')||n.includes('pattern')||n.includes('adapt')||n.includes('selection'))groups.Strategy.push(data.score);
    else if(n.includes('pressure')||n.includes('consisten')||n.includes('error')||n.includes('tournament'))groups.Pressure.push(data.score);
  });
  Object.keys(groups).forEach(k=>{if(!groups[k].length)groups[k]=[r.overall]});
  return Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,v.reduce((a,b)=>a+b,0)/v.length]));
}
function renderStrengthRadar(r){
  const host=$('strengthRadar');if(!host)return;
  const data=radarGroups(r),labels=Object.keys(data),values=Object.values(data),cx=170,cy=170,maxR=125;
  const point=(i,val)=>{const a=-Math.PI/2+i*2*Math.PI/labels.length,rad=maxR*(val/5);return[cx+Math.cos(a)*rad,cy+Math.sin(a)*rad]};
  const ring=n=>labels.map((_,i)=>point(i,n).join(',')).join(' ');
  const polygon=values.map((v,i)=>point(i,v).join(',')).join(' ');
  host.innerHTML=`<svg viewBox="0 0 340 340" role="img" aria-label="Skill strength radar">${[1,2,3,4,5].map(n=>`<polygon class="radar-ring" points="${ring(n)}"></polygon>`).join('')}${labels.map((_,i)=>{const p=point(i,5);return`<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}"></line>`}).join('')}<polygon class="radar-shape" points="${polygon}"></polygon>${labels.map((l,i)=>{const a=-Math.PI/2+i*2*Math.PI/labels.length,x=cx+Math.cos(a)*153,y=cy+Math.sin(a)*153;return`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${l}</text>`}).join('')}</svg><div class="radar-legend">${labels.map(l=>`<span><b>${l}</b>${data[l].toFixed(1)}</span>`).join('')}</div>`;
}

const baseRenderHistory=renderHistory;
renderHistory=function(){
  baseRenderHistory();
  renderJourneyCompare();renderJourneyTimeline();renderJourneyAchievements();
};
function assessmentName(r,index,total){return r.label||`Assessment #${total-index}`}
function renderJourneyCompare(){
  const host=$('journeyCompare');if(!host)return;const h=getHistory();
  if(h.length<2){host.innerHTML='<article class="detail-card journey-section"><span class="eyebrow">COMPARE ASSESSMENTS</span><h2>Unlock comparisons after assessment two</h2><p>Complete another assessment after focused practice to see exactly which skills changed.</p></article>';return}
  const opts=h.map((r,i)=>`<option value="${r.id}">${assessmentName(r,i,h.length)} · ${r.results.overall.toFixed(2)} · ${new Date(r.createdAt).toLocaleDateString('en-ZA')}</option>`).join('');
  host.innerHTML=`<article class="detail-card journey-section"><div class="section-heading"><div><span class="eyebrow">COMPARE ASSESSMENTS</span><h2>See what changed</h2></div><div class="compare-selects"><select id="compareA">${opts}</select><span>vs</span><select id="compareB">${opts}</select></div></div><div id="comparisonOutput"></div></article>`;
  $('compareA').value=h[h.length-1].id;$('compareB').value=h[0].id;
  $('compareA').onchange=renderComparisonOutput;$('compareB').onchange=renderComparisonOutput;renderComparisonOutput();
}
function renderComparisonOutput(){
  const h=getHistory(),a=h.find(x=>x.id===$('compareA')?.value),b=h.find(x=>x.id===$('compareB')?.value),host=$('comparisonOutput');if(!a||!b||!host)return;
  const names=[...new Set([...Object.keys(a.results.skills||{}),...Object.keys(b.results.skills||{})])];
  const changes=names.map(name=>({name,change:(b.results.skills?.[name]?.score||0)-(a.results.skills?.[name]?.score||0)})).filter(x=>a.results.skills?.[x.name]&&b.results.skills?.[x.name]).sort((x,y)=>Math.abs(y.change)-Math.abs(x.change));
  const biggest=changes.filter(x=>x.change>0).sort((x,y)=>y.change-x.change)[0];
  host.innerHTML=`<div class="compare-overview"><div><span>Rating</span><strong>${a.results.overall.toFixed(2)} → ${b.results.overall.toFixed(2)}</strong><small class="${b.results.overall-a.results.overall>=0?'up':'down'}">${signed(b.results.overall-a.results.overall)}</small></div><div><span>Biggest improvement</span><strong>${biggest?.name||'No increase yet'}</strong><small>${biggest?`${Math.round(biggest.change/5*100)}% of scale`:''}</small></div></div><div class="comparison-list">${changes.slice(0,10).map(x=>`<div><span>${x.name}</span><b class="${x.change>0?'up':x.change<0?'down':'flat'}">${x.change>0?'▲':x.change<0?'▼':'▬'} ${signed(x.change)}</b></div>`).join('')}</div>`;
}
function signed(v){return`${v>=0?'+':''}${v.toFixed(2)}`}
function renderJourneyTimeline(){
  const host=$('journeyTimeline');if(!host)return;const h=[...getHistory()].reverse();if(!h.length){host.innerHTML='';return}
  host.innerHTML=`<article class="detail-card journey-section"><span class="eyebrow">TIMELINE</span><h2>Your development story</h2><div class="timeline-list">${h.map((r,i)=>{const prev=h[i-1],delta=prev?r.results.overall-prev.results.overall:0;const best=Object.entries(r.results.skills||{}).sort((a,b)=>b[1].score-a[1].score)[0];return`<div class="timeline-event"><span class="timeline-dot"></span><time>${new Date(r.createdAt).toLocaleDateString('en-ZA',{month:'short',year:'numeric'})}</time><div><h3>${assessmentName(r,h.length-1-i,h.length)} · ${r.results.overall.toFixed(2)}</h3><p>${i===0?'Started the PickleRate journey.':`${delta>=0?'Improved':'Changed'} ${signed(delta)} overall.`} ${best?`${best[0]} was the strongest measured skill.`:''}</p></div></div>`}).join('')}</div></article>`;
}
function renderJourneyAchievements(){
  const host=$('journeyAchievements');if(!host)return;const h=getHistory();if(!h.length){host.innerHTML='';return}
  const latest=h[0],allSkills=Object.values(latest.results.skills||{}),ach=[
    ['First assessment',h.length>=1,'Completed a baseline profile'],['10 assessments',h.length>=10,`${h.length}/10 completed`],['Confidence above 90%',h.some(r=>r.results.confidence>=90),`Best: ${Math.max(...h.map(r=>r.results.confidence))}%`],['Reached 3.5',h.some(r=>r.results.overall>=3.5),`Best: ${Math.max(...h.map(r=>r.results.overall)).toFixed(2)}`],['Improved third shot',hasSkillImprovement(h,'drop'), 'Compared with your baseline'],['No weak skills',allSkills.length>0&&allSkills.every(x=>x.score>=3), 'Every measured skill at 3.0+']];
  host.innerHTML=`<article class="detail-card journey-section"><span class="eyebrow">ACHIEVEMENTS</span><h2>Milestones along the way</h2><div class="achievement-grid">${ach.map(([name,on,desc])=>`<div class="achievement ${on?'unlocked':'locked'}"><span>${on?'✓':'○'}</span><div><b>${name}</b><small>${desc}</small></div></div>`).join('')}</div></article>`;
}
function hasSkillImprovement(h,term){if(h.length<2)return false;const first=h[h.length-1],latest=h[0];return Object.keys(latest.results.skills||{}).some(n=>n.toLowerCase().includes(term)&&(latest.results.skills[n]?.score||0)>(first.results.skills[n]?.score||0)+.15)}

function renderSkillsDirectory(){
  const host=$('skillsDirectory');if(!host)return;const h=getHistory(),latest=h[0];
  if(!latest){host.innerHTML='<article class="detail-card empty-insights"><h2>Complete an assessment to unlock skill pages</h2><p>Your skill library will use your latest profile and historical assessment data.</p><button class="primary-btn" onclick="openTester(false)">Start assessment →</button></article>';return}
  const skills=Object.entries(latest.results.skills||{}).sort((a,b)=>b[1].score-a[1].score);
  host.innerHTML=skills.map(([name,d])=>`<button class="skill-directory-card" data-skill="${encodeURIComponent(name)}"><span class="skill-icon">${name.charAt(0)}</span><div><b>${name}</b><small>${d.pillar} · ${d.count} evidence item${d.count===1?'':'s'}</small><div class="tiny-bar"><i style="width:${d.score/5*100}%"></i></div></div><strong>${d.score.toFixed(2)}</strong><span>→</span></button>`).join('');
  host.querySelectorAll('[data-skill]').forEach(btn=>btn.onclick=()=>showSkillDetail(decodeURIComponent(btn.dataset.skill)));
}
function showSkillDetail(name){
  const h=[...getHistory()].reverse(),latest=h[h.length-1],data=latest?.results.skills?.[name];if(!data)return;switchView('skillDetailView');history.replaceState({view:'skillDetailView'},'','#skill-detail');
  const trend=h.filter(r=>r.results.skills?.[name]).map(r=>({date:new Date(r.createdAt),score:r.results.skills[name].score}));
  const relevant=questions.filter(q=>meta[q.id]?.[1]===name);const target=Math.min(5,Math.floor(latest.results.overall*2+1)/2);const needed=Math.max(0,target-data.score);const drill=drills[name]||['Focused repetition',`Use a repeatable 10-ball test for ${name.toLowerCase()} and record your success rate.`];
  $('skillDetail').innerHTML=`<div class="skill-detail-hero detail-card"><div><span class="eyebrow">${escapeHtml(data.pillar)}</span><h1>${escapeHtml(name)}</h1><p>${skillExplanation(name,data.score)}</p></div><div class="skill-current"><span>Current</span><strong>${data.score.toFixed(2)}</strong><small>${trend.length>1?signed(trend[trend.length-1].score-trend[0].score)+' from baseline':'Baseline established'}</small></div></div><div class="detail-grid"><article class="detail-card"><h2>Past assessments</h2><div class="skill-trend-chart">${trend.map(t=>`<div><b>${t.score.toFixed(2)}</b><i style="height:${Math.max(12,t.score/5*150)}px"></i><small>${t.date.toLocaleDateString('en-ZA',{day:'numeric',month:'short'})}</small></div>`).join('')}</div></article><article class="detail-card"><h2>Benchmark toward ${target.toFixed(1)}</h2><div class="benchmark-meter"><i style="width:${Math.min(100,data.score/target*100)}%"></i></div><h3>${needed<=.05?'Already supporting this milestone':`Approximately ${needed.toFixed(2)} skill points to close`}</h3><p>${benchmarkText(name,data.score,target)}</p></article><article class="detail-card"><h2>Recommended drill</h2>${drillHtml(name,data.score)}<div class="practice-target"><b>Measurable target</b><p>${drill[1]}</p></div></article><article class="detail-card"><h2>Supporting questions</h2><div class="supporting-questions">${relevant.map(q=>`<div><b>${escapeHtml(q.text)}</b><p>${escapeHtml(q.help||'This observation contributes to the skill estimate.')}</p></div>`).join('')||'<p>No direct questions found in this version.</p>'}</div></article></div>`;
}
function skillExplanation(name,score){return`${name} currently scores ${score.toFixed(1)} out of 5. This page combines the supporting observations from your latest assessment with its change across saved reports.`}
function benchmarkText(name,score,target){if(score>=target)return`${name} is already at or above the current ${target.toFixed(1)} benchmark. Maintain it while improving lower-scoring areas.`;return`This is a directional development benchmark, not a promise that one skill increase alone will produce a ${target.toFixed(1)} overall rating. Aim for repeatable match transfer, not drill success only.`}
$('backToSkillsBtn')?.addEventListener('click',()=>routeTo('skillsView'));

const baseRenderJourneyInsights=renderJourneyInsights;
renderJourneyInsights=function(){
  baseRenderJourneyInsights();
  const host=$('journeyInsights'),h=[...getHistory()].reverse();if(!host||!h.length)return;
  const latest=h[h.length-1],first=h[0],groupsNow=radarGroups(latest.results),groupsFirst=radarGroups(first.results);
  const narratives=Object.keys(groupsNow).map(k=>({name:k,change:groupsNow[k]-groupsFirst[k],score:groupsNow[k]})).sort((a,b)=>b.change-a.change);
  const improving=narratives[0],plateau=narratives.slice().sort((a,b)=>Math.abs(a.change)-Math.abs(b.change))[0],weak=narratives.slice().sort((a,b)=>a.score-b.score)[0];
  host.insertAdjacentHTML('afterbegin',`<article class="detail-card intelligent-summary"><span class="eyebrow">PROFILE NARRATIVE</span><h2>${h.length<2?'Your baseline is ready':'What your recent assessments suggest'}</h2><p>${h.length<2?`Your first assessment establishes a ${latest.results.overall.toFixed(2)} baseline. Reassess after focused practice to unlock trend interpretation.`:`Across ${h.length} assessments, ${improving.name.toLowerCase()} changed the most (${signed(improving.change)}). ${plateau.name} has remained comparatively stable, while ${weak.name.toLowerCase()} is currently the lowest broad area at ${weak.score.toFixed(2)}.`}</p><p class="insight-disclaimer">These insights are deterministic summaries of your saved answers, not medical, coaching or official rating advice.</p></article>`);
}

window.showSkillDetail=showSkillDetail;


// Practice Hub
const PRACTICE_KEY='picklerate-v3-practice';
APP_VIEWS.push('practiceView','practiceSkillView');
const practiceBaseViewToHash=viewToHash;
viewToHash=function(id){return ({practiceView:'#practice',practiceSkillView:'#practice-skill'})[id]||practiceBaseViewToHash(id)};
const practiceBaseHashToView=hashToView;
hashToView=function(){return ({'#practice':'practiceView','#practice-skill':'practiceSkillView'})[location.hash]||practiceBaseHashToView()};
const practiceBaseSwitch=switchView;
switchView=function(id){practiceBaseSwitch(id);if(id==='practiceView')renderPracticeHub()};

const practiceLibrary={
 'Third-Shot Drop':{mistakes:['Trying to guide the ball instead of using a relaxed lift','Aiming too close to the sideline','Moving forward before confirming the drop is safe'],levels:[['Foundation','20 cooperative drops from the baseline. Track kitchen landings.'],['Pressure','Alternate cross-court and middle targets with a live return feed.'],['Match transfer','Play drop-only points and transition behind every usable third shot.']],benchmark:'Land 8 of 10 drops in the kitchen, with at least 6 remaining unattackable.'},
 'Forehand Drop':{mistakes:['Excessive wrist action','Contacting too far behind the body','Opening the paddle face late'],levels:[['Foundation','10 shadow swings, then 20 drops from midcourt.'],['Pressure','Move between three feed locations before each forehand drop.'],['Match transfer','Serve, receive a return and play a forehand third-shot drop.']],benchmark:'Hit 8 of 10 forehand drops into the kitchen from two different return depths.'},
 'Backhand Drop':{mistakes:['Taking too large a backswing','Collapsing the wrist at contact','Avoiding the shot and running around it'],levels:[['Foundation','Compact backhand lifts from the transition zone.'],['Pressure','20 baseline drops with alternating middle and cross-court targets.'],['Match transfer','Play half-court points where every third shot must be backhand.']],benchmark:'Hit 7 of 10 backhand drops into the kitchen, with 5 unattackable.'},
 'Fifth-Shot Transition':{mistakes:['Admiring the third shot instead of advancing','Running through the opponent contact','Trying to attack a ball that should be reset'],levels:[['Foundation','Drop, split-step and catch the fifth-shot feed.'],['Pressure','Drop, advance, then reset a firm fifth shot.'],['Match transfer','Play points that only score after reaching the kitchen safely.']],benchmark:'Complete the third-to-fifth-shot transition successfully on 7 of 10 repetitions.'},
 'Transition Resets':{mistakes:['Swinging at hard feeds','Contacting too far from the body','Failing to split-step before contact'],levels:[['Foundation','Soft hands from one fixed transition position.'],['Pressure','Reset from three depths while a partner varies pace.'],['Match transfer','Start at baseline and earn the kitchen through resets only.']],benchmark:'Reset 8 of 10 hard feeds into the kitchen, with 6 bouncing before the opponent can attack.'},
 'Drive Blocking':{mistakes:['Taking a backswing','Holding the paddle too low','Adding pace instead of absorbing it'],levels:[['Foundation','Stationary compact blocks to the kitchen middle.'],['Pressure','Alternate forehand and backhand body drives.'],['Match transfer','Play attacker-versus-blocker points from the kitchen line.']],benchmark:'Block 8 of 10 drives in court, with 6 landing in or near the kitchen.'},
 'Backhand Defence':{mistakes:['Opening the paddle face too much','Reaching instead of moving the feet','Trying to counter every attack'],levels:[['Foundation','Backhand wall blocks with a compact paddle path.'],['Pressure','Random body and backhand feeds at increasing speed.'],['Match transfer','Defend one side of the court against live speed-ups.']],benchmark:'Return 8 of 10 backhand attacks in court and neutralise at least 5.'},
 'Cross-Court Dinking':{mistakes:['Standing upright through contact','Aiming for perfect lines','Changing direction from a poor ball'],levels:[['Foundation','Cooperative cross-court rallies to 20 contacts.'],['Pressure','Add depth and width targets while maintaining consistency.'],['Match transfer','Play cross-court dink points with attacks allowed on high balls.']],benchmark:'Complete three separate 15-ball cross-court rallies and win 6 of 10 live dink points.'},
 'Dinking Under Pressure':{mistakes:['Speeding up from below net height','Backing away from the kitchen line','Overreacting to pace changes'],levels:[['Foundation','Variable feeds while keeping the paddle in front.'],['Pressure','Partner changes depth, spin and pace without warning.'],['Match transfer','Play dink games where an unforced error loses two points.']],benchmark:'Keep 8 of 10 variable dinks unattackable and sustain a 12-ball live rally.'},
 'Speed-Up Selection':{mistakes:['Attacking because of impatience','Speeding up from below the net','Ignoring opponent paddle position'],levels:[['Foundation','Call green, yellow or red before every fed ball.'],['Pressure','Attack only green balls during live dinking.'],['Match transfer','Play games where a poor speed-up costs two points.']],benchmark:'Choose correctly on 8 of 10 attack opportunities and win or neutralise 6 of those exchanges.'},
 'Pattern Recognition':{mistakes:['Not reviewing why rallies ended','Changing several things at once','Recognising patterns without acting on them'],levels:[['Foundation','Name the final three shots after every rally.'],['Pressure','Identify one repeated opponent pattern every five points.'],['Match transfer','State one adjustment and test it for the next three rallies.']],benchmark:'Correctly identify and respond to a repeated pattern in 3 separate games.'},
 'Error Control':{mistakes:['Aiming too close to lines','Using full pace on routine balls','Letting one error change the next decision'],levels:[['Foundation','Twenty-ball cooperative consistency with generous targets.'],['Pressure','Add movement and a consequence for routine misses.'],['Match transfer','Play games where unforced errors count double.']],benchmark:'Complete 30 routine contacts with no more than 3 unforced errors.'}
};
function practiceState(){try{return JSON.parse(localStorage.getItem(PRACTICE_KEY))||{}}catch{return {}}}
function savePracticeState(s){localStorage.setItem(PRACTICE_KEY,JSON.stringify(s))}
function practiceSpec(name){const drill=drills[name]||['Focused skill block',`Complete a repeatable 10-ball test for ${name.toLowerCase()}.`];return practiceLibrary[name]||{mistakes:['Practising without a measurable target','Using only cooperative feeds','Failing to test the skill in live points'],levels:[['Foundation',`Perform 20 controlled repetitions focused on ${name.toLowerCase()}.`],['Pressure','Add movement, variable feeds or a smaller target.'],['Match transfer','Use the skill in conditioned points, then normal games.']],benchmark:drill[1]}}
function prioritySkills(){const latest=getHistory()[0];return latest?Object.entries(latest.results.skills||{}).sort((a,b)=>a[1].score-b[1].score).slice(0,5):[]}
function renderPracticeHub(){const host=$('practiceHub');if(!host)return;const latest=getHistory()[0],state=practiceState();if(!latest){host.innerHTML='<article class="detail-card empty-insights"><h2>Complete an assessment to generate your plan</h2><p>The Practice Hub prioritises your lowest measured skills and turns them into measurable training blocks.</p><button class="primary-btn" onclick="openTester(false)">Start assessment →</button></article>';return}
 const priorities=prioritySkills(),completed=Object.values(state.completed||{}).filter(Boolean).length,total=priorities.length*3,reminder=state.reminderDate;
 host.innerHTML=`<div class="practice-overview"><article class="practice-summary-card primary"><span>Current rating</span><strong>${latest.results.overall.toFixed(2)}</strong><small>${latest.results.confidence}% confidence</small></article><article class="practice-summary-card"><span>Priority skills</span><strong>${priorities.length}</strong><small>From your latest assessment</small></article><article class="practice-summary-card"><span>Progressions complete</span><strong>${completed}/${total}</strong><small>Saved on this device</small></article><article class="practice-summary-card"><span>Reassessment</span><strong>${reminder?new Date(reminder+'T12:00:00').toLocaleDateString('en-ZA',{day:'numeric',month:'short'}):'Not set'}</strong><small>${reminder&&reminder<new Date().toISOString().slice(0,10)?'Ready to reassess':'Choose 2–4 weeks'}</small></article></div>
 <article class="detail-card reassess-card"><div><span class="eyebrow">REASSESSMENT REMINDER</span><h2>Give improvement time to transfer into matches</h2><p>Set an in-app target date. PickleRate will highlight when it is time to reassess; it does not send device notifications.</p></div><div class="reassess-actions"><button data-weeks="2" class="secondary-btn">2 weeks</button><button data-weeks="3" class="secondary-btn">3 weeks</button><button data-weeks="4" class="secondary-btn">4 weeks</button><button id="clearReminder" class="text-btn">Clear</button></div></article>
 <div class="practice-priority-heading"><div><span class="eyebrow">YOUR PRIORITY PLAN</span><h2>Start with the highest-return areas</h2></div><p>Complete foundation, pressure and match-transfer work—not just isolated repetitions.</p></div>
 <div class="practice-plan-grid">${priorities.map(([name,d],i)=>practiceCard(name,d,i,state)).join('')}</div>`;
 host.querySelectorAll('[data-practice-skill]').forEach(b=>b.onclick=()=>showPracticeSkill(decodeURIComponent(b.dataset.practiceSkill)));
 host.querySelectorAll('[data-weeks]').forEach(b=>b.onclick=()=>setReassessment(Number(b.dataset.weeks)));
 $('clearReminder').onclick=()=>{const s=practiceState();delete s.reminderDate;savePracticeState(s);renderPracticeHub()};
}
function practiceCard(name,d,i,state){const spec=practiceSpec(name),done=[0,1,2].filter(x=>state.completed?.[`${name}:${x}`]).length;return `<article class="practice-plan-card"><div class="practice-rank">${i+1}</div><div class="practice-card-head"><div><span>${escapeHtml(d.pillar)}</span><h3>${escapeHtml(name)}</h3></div><strong>${d.score.toFixed(2)}</strong></div><p>${escapeHtml(spec.benchmark)}</p><div class="practice-progress"><i style="width:${done/3*100}%"></i></div><small>${done}/3 progression stages complete</small><button class="primary-btn" data-practice-skill="${encodeURIComponent(name)}">Open practice plan →</button></article>`}
function setReassessment(weeks){const d=new Date();d.setDate(d.getDate()+weeks*7);const s=practiceState();s.reminderDate=d.toISOString().slice(0,10);savePracticeState(s);renderPracticeHub()}
function showPracticeSkill(name){const latest=getHistory()[0],data=latest?.results.skills?.[name];if(!data)return;const spec=practiceSpec(name),state=practiceState();switchView('practiceSkillView');history.replaceState({view:'practiceSkillView'},'','#practice-skill');$('practiceSkillDetail').innerHTML=`<div class="skill-detail-hero detail-card"><div><span class="eyebrow">${escapeHtml(data.pillar)} PRACTICE PLAN</span><h1>${escapeHtml(name)}</h1><p>Build the skill in three stages, then test whether it survives live play.</p></div><div class="skill-current"><span>Current score</span><strong>${data.score.toFixed(2)}</strong><small>${data.score<3?'High-priority foundation work':data.score<4?'Develop consistency under pressure':'Maintain and transfer'}</small></div></div><div class="practice-detail-grid"><article class="detail-card wide"><span class="eyebrow">DIFFICULTY PROGRESSION</span><h2>Foundation → pressure → match transfer</h2><div class="progression-list">${spec.levels.map((l,i)=>`<label class="progression-stage ${state.completed?.[`${name}:${i}`]?'done':''}"><input type="checkbox" data-stage="${i}" ${state.completed?.[`${name}:${i}`]?'checked':''}><span>${i+1}</span><div><b>${l[0]}</b><p>${escapeHtml(l[1])}</p></div></label>`).join('')}</div></article><article class="detail-card"><span class="eyebrow">SUCCESS BENCHMARK</span><h2>Know when to progress</h2><div class="benchmark-callout">${escapeHtml(spec.benchmark)}</div><p>Repeat the test across at least two sessions before marking the skill ready for reassessment.</p></article><article class="detail-card"><span class="eyebrow">COMMON MISTAKES</span><h2>Watch for these</h2><ul class="mistake-list">${spec.mistakes.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></article><article class="detail-card"><span class="eyebrow">VIDEO</span><h2>Demonstration coming later</h2><div class="video-placeholder"><span>▶</span><p>A verified coach demonstration can be linked here in a future version.</p></div></article><article class="detail-card"><span class="eyebrow">SESSION NOTES</span><h2>Record what transferred</h2><textarea id="practiceNotes" rows="6" placeholder="What worked? What broke down under pressure?">${escapeHtml(state.notes?.[name]||'')}</textarea><button id="savePracticeNotes" class="secondary-btn">Save notes</button></article></div>`;
 document.querySelectorAll('[data-stage]').forEach(el=>el.onchange=()=>togglePracticeStage(name,Number(el.dataset.stage),el.checked));$('savePracticeNotes').onclick=()=>{const s=practiceState();s.notes={...(s.notes||{}),[name]:$('practiceNotes').value};savePracticeState(s);$('savePracticeNotes').textContent='Saved ✓'};
}
function togglePracticeStage(name,stage,on){const s=practiceState();s.completed={...(s.completed||{}),[`${name}:${stage}`]:on};savePracticeState(s);showPracticeSkill(name)}
$('backToPracticeBtn')?.addEventListener('click',()=>routeTo('practiceView'));
window.showPracticeSkill=showPracticeSkill;

if(location.hash==='#practice'||location.hash==='#practice-skill'){suppressRoutePush=true;routeTo(hashToView())}


// Social comparison, drill library and settings.
const SETTINGS_KEY='picklerate-v3-settings';
const FRIENDS_KEY='picklerate-v3-friends';
APP_VIEWS.push('compareFriendsView','drillLibraryView','settingsView');
const previousViewToHash2=viewToHash;
viewToHash=function(id){return ({compareFriendsView:'#compare-friends',drillLibraryView:'#drills',settingsView:'#settings'})[id]||previousViewToHash2(id)};
const previousHashToView2=hashToView;
hashToView=function(){return ({'#compare-friends':'compareFriendsView','#drills':'drillLibraryView','#settings':'settingsView'})[location.hash]||previousHashToView2()};
const previousSwitchView2=switchView;
switchView=function(id){
  previousSwitchView2(id);
  if(id==='compareFriendsView')renderCompareFriends();
  if(id==='drillLibraryView')renderDrillLibrary();
  if(id==='settingsView')renderSettings();
};
function readLocal(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function writeLocal(key,value){localStorage.setItem(key,JSON.stringify(value))}
function latestAssessment(){return getHistory()[0]||null}
function settingsState(){return readLocal(SETTINGS_KEY,{name:'',goal:4,hand:'',environment:'Both',theme:'light',compactNav:false})}
function saveSettingsState(value){writeLocal(SETTINGS_KEY,value);applySettings(value)}
function applySettings(s=settingsState()){
 document.documentElement.dataset.theme=s.theme||'light';
 document.body.classList.toggle('compact-nav',!!s.compactNav);
}
applySettings();

function buildSharePayload(){
 const latest=latestAssessment(); if(!latest)return null;
 const s=settingsState();
 return {version:1,name:s.name||latest.tester?.name||'PickleRate player',createdAt:latest.createdAt,results:{overall:latest.results.overall,confidence:latest.results.confidence,pillars:latest.results.pillars,skills:latest.results.skills}};
}
function encodeSharePayload(payload){return btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replace(/=+$/,'')}
function decodeSharePayload(code){const padded=code.trim().replace(/\s/g,'')+'==='.slice((code.trim().length+3)%4);return JSON.parse(decodeURIComponent(escape(atob(padded))))}
function friendsState(){return readLocal(FRIENDS_KEY,[])}
function renderCompareFriends(){
 const host=$('compareFriendsApp'); if(!host)return; const mine=latestAssessment(),friends=friendsState();
 if(!mine){host.innerHTML='<article class="detail-card empty-insights"><h2>Complete an assessment first</h2><p>Your latest frozen result is used as your side of every comparison.</p><button class="primary-btn" onclick="openTester(false)">Start assessment →</button></article>';return}
 const payload=buildSharePayload(),code=encodeSharePayload(payload);
 host.innerHTML=`<div class="friend-tools-grid"><article class="detail-card"><span class="eyebrow">YOUR SHARE CODE</span><h2>Share your latest profile</h2><p>This code contains your latest scores but not your full question answers.</p><textarea id="myFriendCode" rows="5" readonly>${code}</textarea><button id="copyFriendCode" class="primary-btn">Copy code</button></article><article class="detail-card"><span class="eyebrow">ADD A FRIEND</span><h2>Import their code</h2><p>Ask your friend to create a code from their Compare Friends page.</p><textarea id="friendCodeInput" rows="5" placeholder="Paste a PickleRate friend code"></textarea><div class="inline-actions"><button id="importFriendCode" class="primary-btn">Import friend</button><span id="friendImportStatus" class="form-status"></span></div></article></div>
 <div class="section-heading"><div><span class="eyebrow">SAVED FRIENDS</span><h2>Choose someone to compare</h2></div></div><div class="friend-list">${friends.length?friends.map((f,i)=>`<article class="friend-card glass-card"><div><strong>${escapeHtml(f.name)}</strong><span>${new Date(f.createdAt).toLocaleDateString('en-ZA')}</span></div><b>${Number(f.results.overall).toFixed(2)}</b><button data-compare-friend="${i}" class="secondary-btn">Compare</button><button data-remove-friend="${i}" class="icon-btn" aria-label="Remove friend">×</button></article>`).join(''):'<article class="detail-card"><p>No friends imported yet. Share your code and paste theirs above.</p></article>'}</div><div id="friendComparison"></div>`;
 $('copyFriendCode').onclick=async()=>{await navigator.clipboard.writeText(code);$('copyFriendCode').textContent='Copied ✓'};
 $('importFriendCode').onclick=()=>{try{const f=decodeSharePayload($('friendCodeInput').value);if(!f?.results?.skills||!Number.isFinite(Number(f.results.overall)))throw Error();const list=friendsState();list.unshift(f);writeLocal(FRIENDS_KEY,list.slice(0,20));renderCompareFriends()}catch{$('friendImportStatus').textContent='That code is not valid.'}};
 host.querySelectorAll('[data-compare-friend]').forEach(b=>b.onclick=()=>renderFriendComparison(friendsState()[Number(b.dataset.compareFriend)]));
 host.querySelectorAll('[data-remove-friend]').forEach(b=>b.onclick=()=>{const list=friendsState();list.splice(Number(b.dataset.removeFriend),1);writeLocal(FRIENDS_KEY,list);renderCompareFriends()});
}
function renderFriendComparison(friend){
 const mine=latestAssessment();if(!mine||!friend)return;const a=mine.results.skills||{},b=friend.results.skills||{};
 const names=[...new Set([...Object.keys(a),...Object.keys(b)])].filter(n=>a[n]&&b[n]);
 const rows=names.map(n=>({name:n,mine:a[n].score,theirs:b[n].score,gap:a[n].score-b[n].score})).sort((x,y)=>Math.abs(y.gap)-Math.abs(x.gap));
 const shared=rows.filter(x=>x.mine<3.6&&x.theirs<3.6).sort((x,y)=>(x.mine+x.theirs)-(y.mine+y.theirs)).slice(0,3);
 $('friendComparison').innerHTML=`<article class="detail-card friend-comparison"><div class="comparison-hero"><div><span>You</span><strong>${mine.results.overall.toFixed(2)}</strong></div><span class="versus">VS</span><div><span>${escapeHtml(friend.name)}</span><strong>${Number(friend.results.overall).toFixed(2)}</strong></div></div><h2>Biggest skill differences</h2><div class="comparison-list">${rows.slice(0,10).map(x=>`<div><span>${escapeHtml(x.name)}</span><b class="${x.gap>.08?'up':x.gap<-.08?'down':'flat'}">${x.gap>=0?'+':''}${x.gap.toFixed(2)}</b></div>`).join('')}</div><div class="shared-plan"><span class="eyebrow">SHARED PRACTICE PLAN</span><h2>${shared.length?'Skills you can improve together':'No clear shared weakness yet'}</h2>${shared.length?shared.map(x=>`<button class="skill-link" onclick="showPracticeSkill('${encodeURIComponent(x.name)}'.includes('%')?decodeURIComponent('${encodeURIComponent(x.name)}'):'${escapeHtml(x.name)}')">${escapeHtml(x.name)} · ${(x.mine+x.theirs)/2<3?'Foundation':'Pressure'} work →</button>`).join(''):'<p>Compare again after both players complete more assessments.</p>'}</div></article>`;
 $('friendComparison').scrollIntoView({behavior:'smooth',block:'start'});
}

function allDrillEntries(){
 const skills=[...new Set([...Object.keys(drills),...Object.keys(typeof practiceLibrary==='object'?practiceLibrary:{})])];
 return skills.flatMap(skill=>{const spec=practiceSpec(skill);return spec.levels.map((level,i)=>({skill,title:(drills[skill]?.[0]||`${skill} practice`)+' — '+level[0],difficulty:level[0],description:level[1],benchmark:spec.benchmark,mistakes:spec.mistakes}))});
}
function renderDrillLibrary(){
 const search=$('drillSearch'),cat=$('drillCategory'),diff=$('drillDifficulty');if(!search||!cat||!diff)return;
 const entries=allDrillEntries(),categories=[...new Set(entries.map(x=>x.skill))].sort();
 if(cat.options.length===1)cat.insertAdjacentHTML('beforeend',categories.map(x=>`<option>${escapeHtml(x)}</option>`).join(''));
 const draw=()=>{const q=search.value.toLowerCase(),c=cat.value,d=diff.value;const filtered=entries.filter(x=>(c==='all'||x.skill===c)&&(d==='all'||x.difficulty===d)&&(!q||`${x.skill} ${x.title} ${x.description} ${x.benchmark}`.toLowerCase().includes(q)));$('drillLibraryGrid').innerHTML=filtered.length?filtered.map((x,i)=>`<article class="drill-card glass-card"><div class="drill-card-top"><span class="difficulty-pill">${escapeHtml(x.difficulty)}</span><small>${escapeHtml(x.skill)}</small></div><h2>${escapeHtml(x.title)}</h2><p>${escapeHtml(x.description)}</p><div class="drill-meta"><b>Success benchmark</b><span>${escapeHtml(x.benchmark)}</span></div><details><summary>Common mistakes</summary><ul>${x.mistakes.map(m=>`<li>${escapeHtml(m)}</li>`).join('')}</ul></details><button class="secondary-btn" data-library-practice="${encodeURIComponent(x.skill)}">Open skill practice</button></article>`).join(''):'<article class="detail-card"><h2>No drills found</h2><p>Try a different search or filter.</p></article>';document.querySelectorAll('[data-library-practice]').forEach(b=>b.onclick=()=>showPracticeSkill(decodeURIComponent(b.dataset.libraryPractice)))};
 search.oninput=draw;cat.onchange=draw;diff.onchange=draw;draw();
}

function renderSettings(){
 const host=$('settingsApp');if(!host)return;const s=settingsState(),latest=latestAssessment(),historyCount=getHistory().length;
 host.innerHTML=`<article class="detail-card"><span class="eyebrow">PLAYER PROFILE</span><h2>Your development context</h2><div class="settings-form"><label>Display name<input id="settingName" value="${escapeHtml(s.name||'')}" placeholder="Your name or player ID"></label><label>Target rating<input id="settingGoal" type="number" min="1" max="5.5" step="0.1" value="${Number(s.goal||4)}"></label><label>Preferred hand<select id="settingHand"><option value="">Not set</option><option ${s.hand==='Right'?'selected':''}>Right</option><option ${s.hand==='Left'?'selected':''}>Left</option></select></label><label>Playing environment<select id="settingEnvironment"><option ${s.environment==='Both'?'selected':''}>Both</option><option ${s.environment==='Indoor'?'selected':''}>Indoor</option><option ${s.environment==='Outdoor'?'selected':''}>Outdoor</option></select></label></div><button id="saveSettings" class="primary-btn">Save profile</button></article>
 <article class="detail-card"><span class="eyebrow">APPEARANCE</span><h2>Display preferences</h2><label class="setting-toggle"><span><b>Dark appearance</b><small>Use a darker app surface.</small></span><input id="settingDark" type="checkbox" ${s.theme==='dark'?'checked':''}></label><label class="setting-toggle"><span><b>Compact navigation</b><small>Show icons only on wider screens.</small></span><input id="settingCompact" type="checkbox" ${s.compactNav?'checked':''}></label></article>
 <article class="detail-card"><span class="eyebrow">YOUR DATA</span><h2>Stored on this device</h2><div class="settings-stats"><div><strong>${historyCount}</strong><span>Assessments</span></div><div><strong>${friendsState().length}</strong><span>Friends</span></div><div><strong>${latest?latest.results.overall.toFixed(2):'—'}</strong><span>Latest rating</span></div></div><div class="stacked-actions"><button id="settingsExport" class="secondary-btn">Export all data</button><button id="settingsDeleteFriends" class="ghost-btn">Delete friend data</button><button id="settingsDeleteAll" class="danger-btn">Delete all PickleRate data</button></div><p class="privacy-note">This prototype stores data in this browser using localStorage. It does not create an online account or sync between devices.</p></article>`;
 $('saveSettings').onclick=()=>{const next={...s,name:$('settingName').value.trim(),goal:Number($('settingGoal').value)||4,hand:$('settingHand').value,environment:$('settingEnvironment').value,theme:$('settingDark').checked?'dark':'light',compactNav:$('settingCompact').checked};saveSettingsState(next);$('saveSettings').textContent='Saved ✓'};
 $('settingDark').onchange=()=>{const next={...settingsState(),theme:$('settingDark').checked?'dark':'light'};saveSettingsState(next)};
 $('settingCompact').onchange=()=>{const next={...settingsState(),compactNav:$('settingCompact').checked};saveSettingsState(next)};
 $('settingsExport').onclick=()=>downloadBlob(JSON.stringify({exportedAt:new Date().toISOString(),settings:settingsState(),history:getHistory(),practice:practiceState(),friends:friendsState()},null,2),'PickleRate-all-data.json','application/json');
 $('settingsDeleteFriends').onclick=()=>{if(confirm('Delete all imported friend profiles?')){localStorage.removeItem(FRIENDS_KEY);renderSettings()}};
 $('settingsDeleteAll').onclick=()=>{if(confirm('Delete all PickleRate assessments, practice progress, friends and settings from this browser?')){[STORAGE_KEY,HISTORY_KEY,PRACTICE_KEY,FRIENDS_KEY,SETTINGS_KEY].forEach(k=>localStorage.removeItem(k));location.hash='#home';location.reload()}};
}

// Optional first-visit website tour.
const TOUR_KEY='picklerate-v3-tour';
const tourSteps=[
  {route:'landingView',selector:'.brand',title:'Your PickleRate home',text:'Click the PickleRate logo at any time to return to your dashboard and latest development overview.'},
  {route:'landingView',selector:'[data-action="start"]',title:'Assess your current game',text:'The assessment collects match-based evidence across technical ability, tactical decisions and competitive transfer.'},
  {route:'historyView',selector:'[data-route="historyView"]',title:'Follow your journey',text:'My Journey stores every completed assessment as a frozen report, so older scores, answers and recommendations never change.'},
  {route:'insightsView',selector:'[data-route="insightsView"]',title:'Understand your trends',text:'Insights turns assessment history into strengths, recurring limitations, improvement patterns and suggested priorities.'},
  {route:'skillsView',selector:'[data-route="skillsView"]',title:'Explore individual skills',text:'Skills lets you open each measured area to review its score, supporting questions, trend and benchmark toward your next level.'},
  {route:'practiceView',selector:'[data-route="practiceView"]',title:'Turn results into practice',text:'Practice Hub converts your weakest measured skills into progressions, success benchmarks, common mistakes and session notes.'},
  {route:'aboutView',selector:'[data-route="aboutView"]',title:'See how PickleRate works',text:'About explains the philosophy, pillar weighting, confidence model, methodology and frequently asked questions.'},
  {route:'more',selector:'#moreNavBtn',title:'Find the supporting tools',text:'More opens Compare Friends, the Drill Library and Settings. You can also restart this tour from Settings.'}
];
let tourIndex=0;
function tourState(){try{return JSON.parse(localStorage.getItem(TOUR_KEY))||{}}catch{return {}}}
function saveTourState(value){localStorage.setItem(TOUR_KEY,JSON.stringify(value))}
function showTourWelcome(force=false){
  const state=tourState();
  if(!force&&(state.completed||state.dismissed))return;
  $('tourWelcome')?.classList.remove('hidden');
}
function hideTourWelcome(){$('tourWelcome')?.classList.add('hidden')}
function clearTourHighlight(){document.querySelectorAll('.tour-highlight').forEach(el=>el.classList.remove('tour-highlight'))}
function isMobileTour(){return window.matchMedia('(max-width: 900px)').matches}
function prepareTourTarget(step){
  if(step.route==='more'){
    if(isMobileTour())document.querySelector('.main-nav')?.classList.add('open');
    openMoreNavigation();
  }else{
    closeMoreNavigation();
    routeTo(step.route);
    if(isMobileTour()&&step.selector?.includes('data-route'))document.querySelector('.main-nav')?.classList.add('open');
  }
}
function positionTourPopover(target){
  const pop=$('tourPopover');if(!pop||!target)return;
  if(isMobileTour()){pop.style.left='12px';pop.style.right='12px';pop.style.bottom='12px';pop.style.top='auto';return}
  const r=target.getBoundingClientRect(),w=390,gap=18;
  let left=Math.min(window.innerWidth-w-16,Math.max(16,r.left+r.width/2-w/2));
  let top=r.bottom+gap;
  if(top+300>window.innerHeight)top=Math.max(16,r.top-300-gap);
  pop.style.left=`${left}px`;pop.style.top=`${top}px`;pop.style.right='auto';pop.style.bottom='auto';
}
function renderTourStep(){
  clearTourHighlight();
  const step=tourSteps[tourIndex];
  prepareTourTarget(step);
  setTimeout(()=>{
    let target=document.querySelector(step.selector);
    if(step.route==='more'&&$('moreNavPanel')?.classList.contains('open'))target=$('moreNavPanel');
    if(!target)return;
    target.classList.add('tour-highlight');
    target.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});
    $('tourProgress').textContent=`${tourIndex+1} of ${tourSteps.length}`;
    $('tourTitle').textContent=step.title;$('tourText').textContent=step.text;
    $('tourBackBtn').disabled=tourIndex===0;
    $('tourNextBtn').textContent=tourIndex===tourSteps.length-1?'Finish':'Next';
    $('tourOverlay').classList.remove('hidden');$('tourOverlay').setAttribute('aria-hidden','false');
    $('tourPopover').classList.remove('hidden');
    positionTourPopover(target);
  },180);
}
function startWebsiteTour(){hideTourWelcome();tourIndex=0;renderTourStep()}
function finishWebsiteTour(completed=true){
  clearTourHighlight();$('tourOverlay')?.classList.add('hidden');$('tourOverlay')?.setAttribute('aria-hidden','true');$('tourPopover')?.classList.add('hidden');
  document.querySelector('.main-nav')?.classList.remove('open');closeMoreNavigation();
  if(completed)saveTourState({...tourState(),completed:true,dismissed:false,completedAt:new Date().toISOString()});
  routeTo('landingView');
}
function restartWebsiteTour(){saveTourState({completed:false,dismissed:false});startWebsiteTour()}
$('startTourBtn')?.addEventListener('click',startWebsiteTour);
$('skipTourBtn')?.addEventListener('click',()=>{hideTourWelcome();saveTourState({...tourState(),skippedAt:new Date().toISOString()})});
$('dismissTourBtn')?.addEventListener('click',()=>{hideTourWelcome();saveTourState({...tourState(),dismissed:true})});
$('closeTourBtn')?.addEventListener('click',()=>finishWebsiteTour(false));
$('tourSkipBtn')?.addEventListener('click',()=>finishWebsiteTour(false));
$('tourBackBtn')?.addEventListener('click',()=>{if(tourIndex>0){tourIndex--;renderTourStep()}});
$('tourNextBtn')?.addEventListener('click',()=>{if(tourIndex<tourSteps.length-1){tourIndex++;renderTourStep()}else finishWebsiteTour(true)});
window.addEventListener('resize',()=>{const target=document.querySelector('.tour-highlight');if(target&&!$('tourPopover')?.classList.contains('hidden'))positionTourPopover(target)});
window.restartWebsiteTour=restartWebsiteTour;

// Add tour controls whenever Settings is rendered.
const renderSettingsWithoutTour=renderSettings;
renderSettings=function(){
  renderSettingsWithoutTour();
  const host=$('settingsApp');if(!host)return;
  const card=document.createElement('article');card.className='detail-card';
  card.innerHTML='<span class="eyebrow">WEBSITE TOUR</span><h2>Learn your way around PickleRate</h2><p>Restart the guided walkthrough of assessments, progress, insights, skills, practice and supporting tools.</p><div class="stacked-actions"><button id="settingsStartTour" class="secondary-btn" type="button">Start tour again</button><button id="settingsResetTour" class="ghost-btn" type="button">Show welcome next visit</button></div>';
  host.appendChild(card);
  $('settingsStartTour').onclick=restartWebsiteTour;
  $('settingsResetTour').onclick=()=>{localStorage.removeItem(TOUR_KEY);$('settingsResetTour').textContent='Welcome reset ✓'};
};

window.addEventListener('load',()=>setTimeout(()=>showTourWelcome(false),450));
