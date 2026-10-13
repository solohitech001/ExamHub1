const KEY='examhub:v2';
const Store={
  load(seed){try{const raw=localStorage.getItem(KEY);if(raw)return JSON.parse(raw)}catch(err){}return seed()},
  save(db){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(err){}},
  reset(){try{localStorage.removeItem(KEY)}catch(err){}}
};

;
const SEED=()=>({
  exams:[
    {id:'e1',title:'Mid-Term Mathematics Test',subject:'Mathematics',cls:'JSS 3A',type:'Test',desc:'Algebra and number work.',inst:'Answer all questions.',dur:5,pass:50,maxAttempts:1,neg:false,show:true,shuffle:false,status:'published',qs:[
      {id:'q1',type:'single',t:'What is 12 × 8?',opts:['86','96','108','112'],ans:1,m:2,diff:'Easy',topic:'Arithmetic',exp:'12 × 8 = 96.'},
      {id:'q2',type:'multi',t:'Select all prime numbers.',opts:['2','9','11','15'],ans:[0,2],m:3,diff:'Medium',topic:'Numbers'},
      {id:'q3',type:'tf',t:'The square root of 81 is 9.',opts:['True','False'],ans:0,m:1,diff:'Easy',topic:'Numbers'},
      {id:'q4',type:'blank',t:'15% of 200 = ___',ans:'30',m:2,diff:'Medium',topic:'Percentages'},
      {id:'q5',type:'essay',t:'Explain how you would solve 3x + 5 = 20.',m:5,diff:'Hard',topic:'Algebra'}]},
    {id:'e2',title:'English Language Quiz',subject:'English',cls:'JSS 3A',type:'Quiz',desc:'',inst:'',dur:10,pass:50,maxAttempts:2,neg:true,show:true,shuffle:false,status:'published',qs:[
      {id:'q6',type:'single',t:'Choose the correct plural of "child".',opts:['childs','children','childes'],ans:1,m:2,diff:'Easy',topic:'Grammar'},
      {id:'q7',type:'tf',t:'"Quickly" is an adjective.',opts:['True','False'],ans:1,m:2,diff:'Medium',topic:'Grammar'},
      {id:'q8',type:'short',t:'Give a synonym for "happy".',ans:'glad',m:2,diff:'Easy',topic:'Vocabulary'}]},
    {id:'e3',title:'Basic Science Final',subject:'Basic Science',cls:'JSS 3B',type:'Final',desc:'',inst:'',dur:45,pass:40,maxAttempts:1,neg:false,show:false,shuffle:true,status:'draft',qs:[
      {id:'q9',type:'single',t:'Which gas do plants absorb?',opts:['Oxygen','Carbon dioxide','Helium'],ans:1,m:2,diff:'Easy',topic:'Plants'}]}],
  students:[['S001','Ada Obi','JSS 3A'],['S002','Tunde Bello','JSS 3A'],['S003','Chioma Eze','JSS 3A'],['S004','Ibrahim Musa','JSS 3A'],['S005','Grace Okon','JSS 3B'],['S006','Samuel Adeyemi','JSS 3B'],['S007','Fatima Yusuf','JSS 3B'],['S008','David Nwosu','JSS 3A']].map(([id,name,cls])=>({id,name,cls,email:name.split(' ')[0].toLowerCase()+'@school.test'})),
  teachers:[{id:'T001',name:'Mrs. Adaobi Okeke',subject:'Mathematics',email:'okeke@school.test'},{id:'T002',name:'Mr. Yusuf Danjuma',subject:'English',email:'danjuma@school.test'},{id:'T003',name:'Ms. Ngozi Eze',subject:'Basic Science',email:'eze@school.test'}],
  subjects:['Mathematics','English','Basic Science'],
  schools:[{id:'SC1',name:'Greenfield College',plan:'Pro',students:420,status:'active'},{id:'SC2',name:'Hillcrest Academy',plan:'Starter',students:130,status:'active'},{id:'SC3',name:'Bright Future Tutorials',plan:'Starter',students:60,status:'suspended'}],
  attempts:[['e1','S002',11],['e1','S003',9],['e1','S004',6],['e1','S005',12],['e1','S006',8],['e1','S007',5],['e1','S008',10],['e2','S002',5],['e2','S003',4],['e2','S004',6],['e2','S005',3],['e2','S006',2]].map(([examId,studentId,score],i)=>({id:'m'+i,examId,studentId,score,pending:false,at:Date.now()-(i+1)*864e5,mins:3+i%6,feedback:score>=8?'Good work.':'Revise the weak topics.',answers:{},manual:{}})),
  bank:[
    {id:'b1',type:'single',t:'Capital of Nigeria?',opts:['Lagos','Abuja','Kano'],ans:1,m:1,diff:'Easy',topic:'Geography',subject:'Social Studies'},
    {id:'b2',type:'tf',t:'Water boils at 100°C at sea level.',opts:['True','False'],ans:0,m:1,diff:'Easy',topic:'Physics',subject:'Basic Science'},
    {id:'b3',type:'blank',t:'7 × 6 = ___',ans:'42',m:1,diff:'Easy',topic:'Arithmetic',subject:'Mathematics'},
    {id:'b4',type:'essay',t:'Discuss the causes of erosion.',m:10,diff:'Hard',topic:'Geography',subject:'Social Studies'},
    {id:'b5',type:'multi',t:'Select the even numbers.',opts:['2','3','4','7'],ans:[0,2],m:2,diff:'Medium',topic:'Numbers',subject:'Mathematics'}],
  notes:['Mid-Term Mathematics Test closes tomorrow.','3 essays are waiting to be graded.','Welcome to ExamHub.'],
  logs:[],active:null
});

;
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const grade=p=>p>=70?'A':p>=60?'B':p>=50?'C':p>=45?'D':'F';
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const TS={},SEL=new Set();
function toast(msg,kind=''){const t=document.createElement('div');t.className='toast '+kind;t.textContent=msg;$('#toasts').append(t);setTimeout(()=>t.remove(),3200)}
function download(name,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/csv'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
const toCSV=rows=>rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
function parseCSV(text){const rows=[];let row=[],cell='',q=false;for(let i=0;i<text.length;i++){const c=text[i];
  if(q){if(c=='"'&&text[i+1]=='"'){cell+='"';i++}else if(c=='"')q=false;else cell+=c}
  else if(c=='"')q=true;else if(c==','){row.push(cell);cell=''}else if(c=='\n'||c=='\r'){if(c=='\r'&&text[i+1]=='\n')i++;row.push(cell);rows.push(row);row=[];cell=''}else cell+=c}
  if(cell||row.length){row.push(cell);rows.push(row)}return rows.filter(r=>r.some(x=>x.trim()))}
function bars(items){return`<div class="bars">${items.map(i=>`<div class="b"><span>${esc(i.l)}</span><div class="t"><i style="width:${i.v}%"></i></div><b>${i.v}%</b></div>`).join('')||'<div class="empty">No data yet.</div>'}</div>`}
function table(id,cols,rows,o={}){
  const st=TS[id]||(TS[id]={q:'',k:null,d:1,pg:0}),q=st.q.toLowerCase();
  let r=rows.filter(x=>!q||Object.values(x).some(v=>typeof v!='object'&&String(v).toLowerCase().includes(q)));
  if(st.k)r=[...r].sort((a,b)=>(a[st.k]>b[st.k]?1:a[st.k]<b[st.k]?-1:0)*st.d);
  const size=o.size||6,pages=Math.max(1,Math.ceil(r.length/size));st.pg=Math.min(st.pg,pages-1);
  const v=r.slice(st.pg*size,st.pg*size+size);
  return`<div class="row sb" style="margin-bottom:10px"><input data-search="${id}" value="${esc(st.q)}" placeholder="Search…" aria-label="Search table" style="max-width:260px"><span class="row">${o.tools||''}</span></div>
  <div class="wrap"><table><thead><tr>${o.sel?'<th></th>':''}${cols.map(c=>`<th data-sort="${id}:${c.k}">${c.l}${st.k==c.k?(st.d>0?' ▲':' ▼'):''}</th>`).join('')}${o.act?'<th></th>':''}</tr></thead>
  <tbody>${v.map(x=>`<tr>${o.sel?`<td><input type="checkbox" data-sel="${x.id}" aria-label="Select row" ${SEL.has(x.id)?'checked':''}></td>`:''}${cols.map(c=>`<td>${c.f?c.f(x):esc(x[c.k])}</td>`).join('')}${o.act?`<td class="row">${o.act(x)}</td>`:''}</tr>`).join('')||'<tr><td colspan="9" class="empty">No matching records.</td></tr>'}</tbody></table></div>
  <div class="row sb" style="margin-top:10px"><span class="mut">${r.length} record(s)</span><span class="row"><button class="s" data-pg="${id}:-1" ${st.pg==0?'disabled':''}>‹ Prev</button> ${st.pg+1}/${pages} <button class="s" data-pg="${id}:1" ${st.pg>=pages-1?'disabled':''}>Next ›</button></span></div>`}

;
const ME='S001';
const Engine={
  max:ex=>ex.qs.reduce((s,q)=>s+q.m,0),
  norm:s=>String(s).trim().toLowerCase().replace(/\s+/g,' '),
  has:a=>a!=null&&a!==''&&!(Array.isArray(a)&&!a.length),
  correct(q,a){
    if(q.type==='multi')return JSON.stringify([...a].sort())===JSON.stringify([...q.ans].sort());
    if(q.type==='blank'||q.type==='short')return this.norm(a)===this.norm(q.ans);
    return a===q.ans;
  },
  // Rules: single/tf/fill/short = full marks if correct; multi = all-or-nothing;
  // negative marking (if on) = -25% of the marks for a wrong answered objective question; essays need manual marks.
  score(ex,answers,manual={}){
    let s=0,pending=false;
    ex.qs.forEach(q=>{
      const a=answers[q.id];
      if(q.type==='essay'){if(manual[q.id]!=null)s+=manual[q.id];else pending=true;return}
      if(!this.has(a))return;
      if(this.correct(q,a))s+=q.m;else if(ex.neg)s-=q.m*.25;
    });
    return{score:Math.max(0,+s.toFixed(2)),pending};
  },
  start(examId){
    const ex=DB.exams.find(e=>e.id===examId);
    if(DB.active&&DB.active.examId===examId)return true;
    if(DB.active){toast('Finish your active exam first.','bad');return false}
    if(DB.attempts.filter(a=>a.examId===examId&&a.studentId===ME).length>=ex.maxAttempts){toast('Attempt limit reached.','bad');return false}
    let order=ex.qs.map(q=>q.id);
    if(ex.shuffle)order.sort(()=>Math.random()-.5);
    DB.active={examId,start:Date.now(),deadline:Date.now()+ex.dur*60000,answers:{},flags:{},cur:0,order};
    log('Exam started: '+ex.title);save();return true;
  },
  submit(auto){
    const a=DB.active;if(!a)return;
    const ex=DB.exams.find(e=>e.id===a.examId),r=this.score(ex,a.answers),id=uid('a');
    DB.attempts.push({id,examId:ex.id,studentId:ME,score:r.score,pending:r.pending,at:Date.now(),mins:Math.max(1,Math.round((Math.min(Date.now(),a.deadline)-a.start)/60000)),feedback:'',answers:a.answers,manual:{}});
    DB.active=null;log((auto?'Auto-submitted at deadline: ':'Submitted: ')+ex.title);save();
    S.modal=null;go('done',{id});
  }
};

;
const PAGES={},ACT={};
const TYPES={single:'Single choice',multi:'Multiple select',tf:'True / False',blank:'Fill in the blank',short:'Short answer',essay:'Essay'};
const exOf=id=>DB.exams.find(e=>e.id===id),stuOf=id=>DB.students.find(s=>s.id===id);
const pctOf=a=>Math.round(a.score/Engine.max(exOf(a.examId))*100);
const stat=(l,v)=>`<div class="card stat"><span class="mut">${l}</span><b>${v}</b></div>`;
const head=(t,sub,right='')=>`<div class="row sb" style="margin-bottom:16px"><div><h1>${t}</h1><span class="mut">${sub}</span></div><div class="row">${right}</div></div>`;
const tag=(t,k='')=>`<span class="tag ${k}">${esc(t)}</span>`;
const attRow=a=>{const ex=exOf(a.examId),mx=Engine.max(ex),p=a.pending?-1:Math.round(a.score/mx*100);
  return{id:a.id,sid:a.studentId,student:(stuOf(a.studentId)||{}).name||a.studentId,exam:ex.title,score:a.score,max:mx,pct:p,grade:p<0?'—':grade(p),res:p<0?'Pending':p>=ex.pass?'Pass':'Fail',date:new Date(a.at).toLocaleDateString(),mins:a.mins}};
const resTag=r=>tag(r.res,r.res=='Pass'?'ok':r.res=='Fail'?'bad':'w');
const avgOf=L=>L.length?Math.round(L.reduce((s,a)=>s+pctOf(a),0)/L.length):0;
const graded=L=>L.filter(a=>!a.pending);
const examRows=()=>DB.exams.map(e=>({id:e.id,title:e.title,subject:e.subject,cls:e.cls,type:e.type,qn:e.qs.length,dur:e.dur,status:e.status}));
const modalForm=(title,body,foot)=>`<h2>${title}</h2>${body}<div class="row" style="justify-content:flex-end;margin-top:12px"><button data-act="closem">Cancel</button>${foot||''}</div>`;

/* ---------- Teacher ---------- */
PAGES['teacher.dashboard']=()=>{
  const pub=DB.exams.filter(e=>e.status=='published'),pend=DB.attempts.filter(a=>a.pending).length;
  const perf=pub.map(e=>({l:e.title,v:avgOf(graded(DB.attempts.filter(a=>a.examId==e.id)))}));
  const comp=pub.map(e=>({l:e.title,v:Math.round(new Set(DB.attempts.filter(a=>a.examId==e.id).map(a=>a.studentId)).size/DB.students.length*100)}));
  const recent=[...DB.attempts].sort((a,b)=>b.at-a.at).slice(0,5).map(attRow);
  return head('Welcome back, Mrs. Okeke','Here is how your examinations are doing.',`<button class="p" data-act="newexam">+ Create examination</button><button data-act="nav" data-arg="results">Grade submissions</button>`)+
  `<div class="grid">${stat('Examinations',DB.exams.length)}${stat('Published',pub.length)}${stat('Drafts',DB.exams.length-pub.length)}${stat('Students',DB.students.length)}${stat('Awaiting grading',pend)}</div>
  <div class="grid g2"><div class="card"><h2>Average score by exam</h2>${bars(perf)}</div><div class="card"><h2>Completion (students who took it)</h2>${bars(comp)}</div></div>
  <div class="card"><h2>Recent results</h2><div class="wrap"><table><tr><th>Student</th><th>Exam</th><th>Score</th><th>Status</th></tr>${recent.map(r=>`<tr><td>${esc(r.student)}</td><td>${esc(r.exam)}</td><td>${r.score}/${r.max}</td><td>${resTag(r)}</td></tr>`).join('')}</table></div></div>
  <div class="card"><h2>Recent activity</h2>${DB.logs.slice(0,5).map(l=>`<div class="mut">${new Date(l.t).toLocaleString()} · ${esc(l.a)}</div>`).join('')||'<span class="mut">No activity yet.</span>'}</div>`};
PAGES['teacher.exams']=()=>head('Examinations','Create, publish and manage exams.',`<button class="p" data-act="newexam">+ Create examination</button>`)+
  `<div class="card">${table('exams',[{k:'title',l:'Title'},{k:'subject',l:'Subject'},{k:'cls',l:'Class'},{k:'type',l:'Type'},{k:'qn',l:'Questions'},{k:'dur',l:'Mins'},{k:'status',l:'Status',f:r=>tag(r.status,r.status=='published'?'ok':'w')}],examRows(),
  {act:r=>`<button class="s" data-act="editexam" data-arg="${r.id}">Edit</button><button class="s" data-act="dupexam" data-arg="${r.id}">Duplicate</button><button class="s" data-act="togexam" data-arg="${r.id}">${r.status=='published'?'Unpublish':'Publish'}</button><button class="s d" data-act="delexam" data-arg="${r.id}">Delete</button>`})}</div>`;
const newDraft=()=>({id:null,title:'',desc:'',subject:DB.subjects[0]||'',cls:'',type:'Test',inst:'',dur:30,pass:50,maxAttempts:1,start:'',end:'',neg:false,show:true,shuffle:false,status:'draft',qs:[]});
const newQF=()=>({type:'single',t:'',opts:'',ans:'',m:1,diff:'Medium',topic:'',exp:''});
function buildQ(f){
  const q={id:uid('q'),type:f.type,t:f.t.trim(),m:+f.m,diff:f.diff,topic:(f.topic||'').trim()||'General'},A=String(f.ans).trim();
  if(f.exp&&f.exp.trim())q.exp=f.exp.trim();
  if(!q.t)return{err:'Enter the question text.'};
  if(!(q.m>0))return{err:'Marks must be greater than 0.'};
  if(f.type=='single'||f.type=='multi'){
    q.opts=f.opts.split('\n').map(s=>s.trim()).filter(Boolean);
    if(q.opts.length<2)return{err:'Provide at least two options (one per line).'};
    const n=A.split(/[,;|]/).map(x=>parseInt(x)-1);
    if(!A||n.some(i=>!(i>=0&&i<q.opts.length)))return{err:'Correct answer must be option number(s), e.g. 2 or 1,3.'};
    if(f.type=='single'&&n.length!=1)return{err:'Single choice needs exactly one correct option.'};
    q.ans=f.type=='single'?n[0]:n;
  }else if(f.type=='tf'){const v=A.toLowerCase();if(v!='true'&&v!='false')return{err:'Correct answer must be True or False.'};q.opts=['True','False'];q.ans=v=='true'?0:1}
  else if(f.type=='blank'||f.type=='short'){if(!A)return{err:'Enter the correct answer.'};q.ans=A}
  else if(f.type!='essay')return{err:'Unknown question type.'};
  return{q};
}
const toForm=q=>({type:q.type,t:q.t,opts:q.opts&&q.type!='tf'?q.opts.join('\n'):'',ans:q.type=='single'?String(q.ans+1):q.type=='multi'?q.ans.map(i=>i+1).join(','):q.type=='tf'?(q.ans?'False':'True'):(q.ans??''),m:q.m,diff:q.diff||'Medium',topic:q.topic||'',exp:q.exp||''});
const qPrev=q=>`<p><b>${esc(q.t)}</b> ${tag(q.m+' mark'+(q.m>1?'s':''))}</p>${q.opts?q.opts.map((o,i)=>`<div class="opt" style="cursor:default">${(Array.isArray(q.ans)?q.ans.includes(i):q.ans===i)?'✅':'⚪'} ${esc(o)}</div>`).join(''):`<p class="mut">${q.type=='essay'?'Essay — marked manually.':'Accepted answer: <b>'+esc(q.ans)+'</b>'}</p>`}${q.exp?`<p class="mut">Explanation: ${esc(q.exp)}</p>`:''}`;
function qForm(){
  const f=S.qf,hint={single:'Options one per line. Correct answer = option number, e.g. 2',multi:'Options one per line. Correct = numbers, e.g. 1,3',tf:'Correct answer: True or False',blank:'The exact expected text',short:'Expected answer (case and spacing ignored)',essay:'No key needed — you mark it manually'}[f.type];
  return`<label>Type<select data-q="type" data-rr="1">${Object.entries(TYPES).map(([k,v])=>`<option value="${k}" ${f.type==k?'selected':''}>${v}</option>`).join('')}</select></label>
  <label>Question<textarea rows="2" data-q="t">${esc(f.t)}</textarea></label>
  ${f.type=='single'||f.type=='multi'?`<label>Options<textarea rows="4" data-q="opts">${esc(f.opts)}</textarea></label>`:''}
  ${f.type!='essay'?`<label>Correct answer<input data-q="ans" value="${esc(f.ans)}"></label>`:''}<p class="mut" style="margin-top:-6px">${hint}</p>
  <div class="grid"><label>Marks<input type="number" min="1" data-q="m" value="${f.m}"></label><label>Difficulty<select data-q="diff">${['Easy','Medium','Hard'].map(d=>`<option ${f.diff==d?'selected':''}>${d}</option>`).join('')}</select></label><label>Topic<input data-q="topic" value="${esc(f.topic)}"></label></div>
  <label>Explanation (optional)<input data-q="exp" value="${esc(f.exp)}"></label>`}
PAGES['teacher.builder']=()=>{
  if(!S.draft)S.draft=newDraft();if(!S.qf)S.qf=newQF();
  const d=S.draft,st=S.step,F=(k,l,t='text')=>`<label>${l}<input type="${t}" data-f="${k}" value="${esc(d[k])}"></label>`,C=(k,l)=>`<label class="row"><input type="checkbox" data-f="${k}" ${d[k]?'checked':''}> ${l}</label>`;
  let body='';
  if(st==1)body=`<div class="grid">${F('title','Examination title')}<label>Subject<select data-f="subject">${DB.subjects.map(s=>`<option ${d.subject==s?'selected':''}>${esc(s)}</option>`).join('')}</select></label>${F('cls','Class (e.g. JSS 3A)')}<label>Type<select data-f="type">${['Quiz','Test','Mock','Final'].map(t=>`<option ${d.type==t?'selected':''}>${t}</option>`).join('')}</select></label></div><label>Description<textarea rows="2" data-f="desc">${esc(d.desc)}</textarea></label><label>Instructions for students<textarea rows="3" data-f="inst">${esc(d.inst)}</textarea></label>`;
  if(st==2)body=`<div class="grid g2"><div><h2>${S.qi!=null?'Edit question':'Add question'}</h2>${qForm()}<div class="row"><button class="p" data-act="qsave">${S.qi!=null?'Update question':'Add question'}</button>${S.qi!=null?'<button data-act="qcancel">Cancel edit</button>':''}</div></div>
  <div><h2>Questions (${d.qs.length}) · ${Engine.max(d)} marks</h2>${d.qs.map((q,i)=>`<div class="card"><div>${i+1}. ${esc(q.t)}</div><div class="row">${tag(TYPES[q.type])}${tag(q.m+'m')}<span style="flex:1"></span><button class="s" data-act="qmove" data-arg="${i}:-1" aria-label="Move up">↑</button><button class="s" data-act="qmove" data-arg="${i}:1" aria-label="Move down">↓</button><button class="s" data-act="qprev" data-arg="${i}">Preview</button><button class="s" data-act="qedit" data-arg="${i}">Edit</button><button class="s" data-act="qdup" data-arg="${i}">Duplicate</button><button class="s d" data-act="qdel" data-arg="${i}">Delete</button></div></div>`).join('')||'<div class="empty">No questions yet. Add one on the left.</div>'}</div></div>`;
  if(st==3)body=`<div class="grid">${F('dur','Duration (minutes)','number')}${F('pass','Pass mark (%)','number')}${F('maxAttempts','Attempts allowed','number')}${F('start','Opens','datetime-local')}${F('end','Closes','datetime-local')}</div>${C('shuffle','Randomise question order')}${C('neg','Negative marking (−25% of a question’s marks for wrong objective answers)')}${C('show','Show correct answers and explanations after results')}<p class="mut">The exam always auto-submits when the timer reaches zero.</p>`;
  if(st==4){const iss=problems(d);body=`<div class="grid">${stat('Questions',d.qs.length)}${stat('Total marks',Engine.max(d))}${stat('Duration',d.dur+' min')}${stat('Pass mark',d.pass+'%')}</div><div class="card"><b>${esc(d.title||'(untitled)')}</b><br><span class="mut">${esc(d.subject)} · ${esc(d.cls||'no class')} · ${d.type}</span></div>${iss.length?`<div class="card" style="border-color:var(--bad)"><b>Fix before publishing:</b><ul>${iss.map(i=>`<li>${i}</li>`).join('')}</ul></div>`:'<p>✅ Ready to publish.</p>'}<div class="row"><button data-act="qprevall">Preview exam</button><button data-act="savedraft">Save draft</button><button class="p" data-act="publish">Publish (simulated)</button></div>`}
  return head(d.id?'Edit examination':'Create examination','Step '+st+' of 4')+`<div class="steps">${['Basic info','Questions','Settings','Review & publish'].map((s,i)=>`<span class="${st==i+1?'on':''}">${i+1}. ${s}</span>`).join('')}</div><div class="card">${body}</div><div class="row sb"><button data-act="step" data-arg="${st-1}" ${st==1?'disabled':''}>← Back</button><button class="p" data-act="step" data-arg="${st+1}" ${st==4?'disabled':''}>Next →</button></div>`};
function problems(d){const p=[];if(!d.title.trim())p.push('Add a title.');if(!d.qs.length)p.push('Add at least one question.');if(!(d.dur>0))p.push('Duration must be above 0.');if(!(d.pass>0&&d.pass<=100))p.push('Pass mark must be 1–100.');if(!(d.maxAttempts>=1))p.push('Allow at least 1 attempt.');if(d.start&&d.end&&d.end<=d.start)p.push('Closing time must be after opening time.');return p}
const qRows=()=>{const f=S.fb;return DB.bank.filter(q=>(!f.type||q.type==f.type)&&(!f.diff||q.diff==f.diff)).map(q=>({id:q.id,t:q.t,type:q.type,subject:q.subject||'—',topic:q.topic,diff:q.diff,m:q.m}))};
PAGES['teacher.bank']=()=>head('Question bank','Reusable questions across exams.',`<button data-act="importopen">Import CSV</button><button class="p" data-act="bankaddopen">+ Add question</button>`)+
  `<div class="card"><div class="row" style="margin-bottom:10px"><select data-fb="type" style="max-width:190px"><option value="">All types</option>${Object.entries(TYPES).map(([k,v])=>`<option value="${k}" ${S.fb.type==k?'selected':''}>${v}</option>`).join('')}</select><select data-fb="diff" style="max-width:160px"><option value="">All difficulties</option>${['Easy','Medium','Hard'].map(d=>`<option ${S.fb.diff==d?'selected':''}>${d}</option>`).join('')}</select></div>
  ${table('bank',[{k:'t',l:'Question'},{k:'type',l:'Type',f:r=>TYPES[r.type]},{k:'subject',l:'Subject'},{k:'topic',l:'Topic'},{k:'diff',l:'Difficulty'},{k:'m',l:'Marks'}],qRows(),{sel:1,tools:`<button class="s d" data-act="bankdel">Delete selected (${SEL.size})</button>`,act:r=>`<button class="s" data-act="bankprev" data-arg="${r.id}">Preview</button><button class="s" data-act="bankdup" data-arg="${r.id}">Duplicate</button><button class="s" data-act="bankuse" data-arg="${r.id}">Add to draft</button>`})}</div>`;
PAGES['teacher.results']=()=>{const rows=DB.attempts.map(attRow);
  return head('Results & grading','Real figures calculated from submissions.',`<button data-act="export">Export CSV</button>`)+
  `<div class="grid">${stat('Submissions',rows.length)}${stat('Average',avgOf(graded(DB.attempts))+'%')}${stat('Pass rate',rows.filter(r=>r.res!='Pending').length?Math.round(rows.filter(r=>r.res=='Pass').length/rows.filter(r=>r.res!='Pending').length*100)+'%':'—')}${stat('Pending grading',rows.filter(r=>r.res=='Pending').length)}</div>
  <div class="card">${table('res',[{k:'student',l:'Student'},{k:'sid',l:'ID'},{k:'exam',l:'Exam'},{k:'score',l:'Score',f:r=>r.score+'/'+r.max},{k:'pct',l:'%',f:r=>r.pct<0?'—':r.pct+'%'},{k:'grade',l:'Grade'},{k:'res',l:'Result',f:resTag},{k:'date',l:'Submitted'},{k:'mins',l:'Mins'}],rows,{act:r=>r.res=='Pending'?`<button class="s p" data-act="grade" data-arg="${r.id}">Grade</button>`:`<button class="s" data-act="review" data-arg="${r.id}">Details</button>`})}</div>
  <div class="card"><h2>Question accuracy (answered objective questions)</h2>${bars(DB.exams.flatMap(ex=>{const L=DB.attempts.filter(a=>a.examId==ex.id&&Object.keys(a.answers).length);return ex.qs.filter(q=>q.type!='essay'&&L.length).map(q=>({l:q.t.slice(0,22),v:Math.round(L.filter(a=>Engine.has(a.answers[q.id])&&Engine.correct(q,a.answers[q.id])).length/L.length*100)}))}))}<p class="mut">Mock attempts carry scores only, so this chart reflects attempts you take as a student.</p></div>`};
PAGES['teacher.classes']=()=>head('Classes & students','')+`<div class="card">${table('tstu',[{k:'name',l:'Name'},{k:'id',l:'ID'},{k:'cls',l:'Class'},{k:'email',l:'Email'}],DB.students)}</div>`;

/* ---------- Student ---------- */
const mine=()=>DB.attempts.filter(a=>a.studentId==ME);
PAGES['student.dashboard']=()=>{const pub=DB.exams.filter(e=>e.status=='published'),done=mine(),hist=graded(done).map(a=>({l:exOf(a.examId).title,v:pctOf(a)}));
  return head('Welcome, Ada','Your examinations and progress.',DB.active?`<button class="p" data-act="begin" data-arg="${DB.active.examId}">Resume active exam</button>`:'')+
  `<div class="grid">${stat('Available',pub.filter(e=>DB.attempts.filter(a=>a.examId==e.id&&a.studentId==ME).length<e.maxAttempts).length)}${stat('Completed',done.length)}${stat('Average',graded(done).length?avgOf(graded(done))+'%':'—')}${stat('Awaiting grading',done.filter(a=>a.pending).length)}</div>
  <div class="card"><h2>Score history</h2>${bars(hist)}</div><div class="card"><h2>Upcoming & available</h2>${pub.map(e=>`<div class="row sb"><span>${esc(e.title)} <span class="mut">· ${e.dur} min</span></span><button class="s" data-act="intro" data-arg="${e.id}">Open</button></div>`).join('')}</div>`};
PAGES['student.exams']=()=>head('Examinations','')+`<div class="grid">${DB.exams.filter(e=>e.status=='published').map(e=>{const used=DB.attempts.filter(a=>a.examId==e.id&&a.studentId==ME).length,act=DB.active&&DB.active.examId==e.id;
  return`<div class="card"><b>${esc(e.title)}</b><p class="mut">${esc(e.subject)} · ${e.qs.length} questions · ${e.dur} min · pass ${e.pass}%<br>Attempts used ${used}/${e.maxAttempts}</p>${act?tag('In progress','w')+' ':used?tag('Completed','ok')+' ':''}<button class="${used>=e.maxAttempts&&!act?'':'p'}" data-act="intro" data-arg="${e.id}">${act?'Resume':used>=e.maxAttempts?'View':'Start'}</button></div>`}).join('')||'<div class="empty">No exams available.</div>'}</div>`;
PAGES['student.intro']=()=>{const e=exOf(S.p.id);return head(esc(e.title),esc(e.subject))+`<div class="card"><h2>Instructions</h2><p>${esc(e.inst||'Answer all questions.')}</p><ul><li>You have <b>${e.dur} minutes</b>. The deadline is fixed once you start; refreshing does not reset it.</li><li>${e.qs.length} questions, ${Engine.max(e)} marks, pass mark ${e.pass}%.</li><li>Answers autosave. Flag questions for review with the palette.</li><li>${e.neg?'Wrong objective answers lose 25% of that question’s marks.':'No negative marking.'} Multiple-select is all-or-nothing. Essays are graded by your teacher.</li></ul><div class="row"><button data-act="nav" data-arg="exams">Back</button><button class="p" data-act="begin" data-arg="${e.id}">Start exam</button></div></div>`};
PAGES['student.workspace']=()=>{const a=DB.active;if(!a){S.page='dashboard';return PAGES['student.dashboard']()}
  const ex=exOf(a.examId),qs=a.order.map(id=>ex.qs.find(q=>q.id==id)),q=qs[a.cur],n=qs.length,ans=a.answers[q.id];let b='';
  if(q.type=='single'||q.type=='tf')b=q.opts.map((o,i)=>`<label class="opt"><input type="radio" name="o" data-act="pick" data-arg="${i}" ${ans===i?'checked':''}> ${esc(o)}</label>`).join('');
  else if(q.type=='multi')b='<p class="mut">Select all that apply.</p>'+q.opts.map((o,i)=>`<label class="opt"><input type="checkbox" data-act="pickm" data-arg="${i}" ${(ans||[]).includes(i)?'checked':''}> ${esc(o)}</label>`).join('');
  else if(q.type=='essay')b=`<textarea rows="9" data-ans="1" aria-label="Your answer">${esc(ans||'')}</textarea>`;
  else b=`<input data-ans="1" aria-label="Your answer" value="${esc(ans||'')}">`;
  return`<div class="card row"><div><b>${esc(ex.title)}</b><br><span class="mut">${esc(ex.subject)}</span></div><span style="flex:1"></span><span class="mut" id="sv" aria-live="polite">Saved ✓</span>${tag(navigator.onLine?'Online':'Offline',navigator.onLine?'ok':'bad').replace('<span','<span id="cn"')}<span class="tm" id="tm" role="timer"></span></div>
  <div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${a.cur+1}"><i style="width:${(a.cur+1)/n*100}%"></i></div>
  <div class="xw"><div class="card"><p class="mut">Question ${a.cur+1} of ${n} · ${q.m} mark${q.m>1?'s':''}</p><h2>${esc(q.t)}</h2>${b}<div class="row" style="margin-top:14px"><button data-act="prev" ${a.cur==0?'disabled':''}>← Previous</button><button data-act="next" ${a.cur==n-1?'disabled':''}>Next →</button><button data-act="flag">${a.flags[q.id]?'Unflag':'⚑ Mark for review'}</button><span style="flex:1"></span><button class="p" data-act="submitask">Submit exam</button></div></div>
  <div class="card"><b>Questions</b><div class="pal" style="margin-top:8px">${qs.map((x,i)=>`<button id="pb${i}" class="${a.flags[x.id]?'f':Engine.has(a.answers[x.id])?'a':''} ${i==a.cur?'c':''}" data-act="jump" data-arg="${i}" aria-label="Question ${i+1}">${i+1}</button>`).join('')}</div><p class="mut" style="font-size:.8rem">Green answered · Amber flagged · Ring = current. Tip: ← → keys move between questions.</p></div></div>`};
const submitModal=()=>{const a=DB.active;if(!a)return'';const ex=exOf(a.examId);let ans=0,fl=0;ex.qs.forEach(q=>{if(Engine.has(a.answers[q.id]))ans++;if(a.flags[q.id])fl++});
  return modalForm('Submit examination?',`<p>Answered <b>${ans}</b> · Unanswered <b>${ex.qs.length-ans}</b> · Flagged <b>${fl}</b></p><p class="mut">Submission is final.</p>`,`<button class="p" data-act="submitgo">Submit now</button>`)};
PAGES['student.done']=()=>{const a=DB.attempts.find(x=>x.id==S.p.id);if(!a)return'<div class="empty">Nothing to show.</div>';const r=attRow(a);
  return`<div class="card" style="text-align:center"><h1>Exam submitted ✓</h1>${a.pending?'<p>Objective questions are scored. Essay questions await your teacher, so your final result appears in My results once graded.</p>':`<p style="font-size:1.6rem"><b>${r.score}/${r.max}</b> · ${r.pct}% · Grade ${r.grade} ${resTag(r)}</p>`}<button class="p" data-act="nav" data-arg="results">My results</button></div>`};
PAGES['student.results']=()=>{const rows=mine().map(attRow);return head('My results','')+`<div class="grid g2"><div class="card"><h2>Score history</h2>${bars(rows.filter(r=>r.pct>=0).map(r=>({l:r.exam,v:r.pct})))}</div><div class="card"><h2>By subject</h2>${bars([...new Set(graded(mine()).map(a=>exOf(a.examId).subject))].map(s=>({l:s,v:avgOf(graded(mine()).filter(a=>exOf(a.examId).subject==s))})))}</div></div>
  <div class="card">${table('mres',[{k:'exam',l:'Exam'},{k:'score',l:'Score',f:r=>r.score+'/'+r.max},{k:'pct',l:'%',f:r=>r.pct<0?'—':r.pct+'%'},{k:'grade',l:'Grade'},{k:'res',l:'Result',f:resTag},{k:'date',l:'Date'},{k:'mins',l:'Mins'}],rows,{act:r=>`<button class="s" data-act="review" data-arg="${r.id}">Details</button>`})}</div>`};

/* ---------- School admin ---------- */
const FIELDS={students:[['name','Full name'],['id','Student ID'],['cls','Class'],['email','Email','email']],teachers:[['name','Full name'],['id','Staff ID'],['subject','Subject'],['email','Email','email']]};
const people=(kind,title)=>()=>head(title,'Search, add, edit and export.',`<button data-act="pexport" data-arg="${kind}">Export CSV</button><button class="p" data-act="pform" data-arg="${kind}:">+ Add</button>`)+`<div class="card">${table(kind,FIELDS[kind].map(f=>({k:f[0],l:f[1]})),DB[kind],{act:r=>`${kind=='students'?`<button class="s" data-act="pview" data-arg="${r.id}">Profile</button>`:''}<button class="s" data-act="pform" data-arg="${kind}:${r.id}">Edit</button><button class="s d" data-act="pdelask" data-arg="${kind}:${r.id}">Delete</button>`})}</div>`;
PAGES['admin.students']=people('students','Students');PAGES['admin.teachers']=people('teachers','Teachers');
const clsRows=()=>[...new Set(DB.students.map(s=>s.cls))].map(c=>{const ids=DB.students.filter(s=>s.cls==c).map(s=>s.id);return{id:c,cls:c,count:ids.length,avg:avgOf(graded(DB.attempts.filter(a=>ids.includes(a.studentId))))}});
PAGES['admin.dashboard']=()=>head('School overview','Greenfield College · 2026/2027, Term 1')+`<div class="grid">${stat('Students',DB.students.length)}${stat('Teachers',DB.teachers.length)}${stat('Active exams',DB.exams.filter(e=>e.status=='published').length)}${stat('Submissions',DB.attempts.length)}${stat('School average',avgOf(graded(DB.attempts))+'%')}</div><div class="card"><h2>Average score by class</h2>${bars(clsRows().map(c=>({l:c.cls,v:c.avg})))}</div>`;
PAGES['admin.classes']=()=>head('Classes & subjects','')+`<div class="grid g2"><div class="card"><h2>Classes</h2>${table('cls',[{k:'cls',l:'Class'},{k:'count',l:'Students'},{k:'avg',l:'Avg %'}],clsRows())}</div><div class="card"><h2>Subjects</h2>${DB.subjects.map(s=>`<div class="row sb"><span>${esc(s)}</span><button class="s d" data-act="subjdel" data-arg="${esc(s)}">Remove</button></div>`).join('')}<div class="row" style="margin-top:10px"><input id="newsubj" placeholder="New subject" aria-label="New subject" style="flex:1"><button class="p" data-act="subjadd">Add</button></div></div></div>`;
PAGES['admin.exams']=()=>head('Examination overview','')+`<div class="card">${table('aex',[{k:'title',l:'Title'},{k:'subject',l:'Subject'},{k:'cls',l:'Class'},{k:'qn',l:'Questions'},{k:'status',l:'Status',f:r=>tag(r.status,r.status=='published'?'ok':'w')}],examRows())}</div>`;
PAGES['admin.reports']=()=>head('Reports','Exports use the live data.',`<button class="p" data-act="export">Export all results (CSV)</button>`)+`<div class="card"><h2>Class performance</h2>${bars(clsRows().map(c=>({l:c.cls,v:c.avg})))}</div><div class="card"><h2>Exam performance</h2>${bars(DB.exams.map(e=>({l:e.title,v:avgOf(graded(DB.attempts.filter(a=>a.examId==e.id)))})).filter(x=>x.v))}</div>`;

/* ---------- Platform admin ---------- */
PAGES['platform.dashboard']=()=>{const act=DB.schools.filter(s=>s.status=='active');return head('Platform overview','')+`<div class="grid">${stat('Schools',DB.schools.length)}${stat('Active',act.length)}${stat('Students on platform',DB.schools.reduce((s,x)=>s+x.students,0))}${stat('Pro plans',DB.schools.filter(s=>s.plan=='Pro').length)}</div><div class="card"><h2>Subscription mix</h2>${bars(['Pro','Starter'].map(p=>({l:p,v:Math.round(DB.schools.filter(s=>s.plan==p).length/DB.schools.length*100)})))}</div>`};
PAGES['platform.schools']=()=>head('Schools','')+`<div class="card">${table('sch',[{k:'name',l:'School'},{k:'plan',l:'Plan'},{k:'students',l:'Students'},{k:'status',l:'Status',f:r=>tag(r.status,r.status=='active'?'ok':'bad')}],DB.schools,{act:r=>`<button class="s" data-act="schtog" data-arg="${r.id}">${r.status=='active'?'Suspend':'Activate'}</button>`})}</div>`;
PAGES['platform.users']=()=>head('Users','')+`<div class="card">${table('usr',[{k:'name',l:'Name'},{k:'id',l:'ID'},{k:'role',l:'Role'},{k:'email',l:'Email'}],[...DB.teachers.map(t=>({...t,role:'Teacher'})),...DB.students.map(s=>({...s,role:'Student'}))])}</div>`;
PAGES['platform.logs']=()=>head('Activity logs','Actions taken in this browser session history.')+`<div class="card">${table('log',[{k:'when',l:'Time'},{k:'who',l:'Role'},{k:'a',l:'Action'}],DB.logs.map((l,i)=>({id:i,when:new Date(l.t).toLocaleString(),who:l.who,a:l.a})),{size:8})}</div>`;
PAGES['*.settings']=()=>head('Settings','')+`<div class="card"><h2>Appearance</h2><div class="row"><button data-act="theme">Switch to ${S.theme=='dark'?'light':'dark'} theme</button></div></div><div class="card"><h2>Demo data</h2><p class="mut">Everything is stored in this browser’s LocalStorage for demonstration only. It is not secure enough for real examinations.</p><button class="d" data-act="resetask">Reset demo data</button></div>`;

/* ---------- Actions ---------- */
const mark=()=>{const s=$('#sv');if(s){s.textContent='Saving…';clearTimeout(mark.t);mark.t=setTimeout(()=>{save();s.textContent='Saved ✓'},350)}};
const curQ=()=>{const a=DB.active,ex=exOf(a.examId);return ex.qs.find(q=>q.id==a.order[a.cur])};
const cmod=fn=>{S.modal=fn;render()};
const reviewModal=id=>()=>{const a=DB.attempts.find(x=>x.id==id),ex=exOf(a.examId),r=attRow(a),show=S.role!='student'||(ex.show&&!a.pending);
  return modalForm(esc(ex.title),`<p>${esc(r.student)} · ${r.score}/${r.max} · ${r.pct<0?'pending':r.pct+'% · grade '+r.grade} ${resTag(r)}</p>${a.feedback?`<p><b>Teacher feedback:</b> ${esc(a.feedback)}</p>`:''}${show&&Object.keys(a.answers).length?ex.qs.map((q,i)=>{const v=a.answers[q.id],f=x=>!Engine.has(x)?'—':Array.isArray(x)?x.map(i=>q.opts[i]).join(', '):q.opts?q.opts[x]:x;return`<p><b>${i+1}. ${esc(q.t)}</b><br>Answer: ${esc(f(v))}${q.type=='essay'?` · marks ${a.manual[q.id]??'pending'}/${q.m}`:`<br>Correct: ${esc(f(q.ans))}`}${q.exp?`<br><span class="mut">${esc(q.exp)}</span>`:''}</p>`}).join(''):'<p class="mut">Question-level detail is not available for this attempt.</p>'}`)};
function personModal(kind,id){const cur=DB[kind].find(x=>x.id==id)||{},err=S.err||'';
  return()=>modalForm((id?'Edit ':'Add ')+kind.slice(0,-1),FIELDS[kind].map(([k,l,t])=>`<label>${l}<input data-m="${k}" type="${t||'text'}" value="${esc(S.pf?S.pf[k]:cur[k])}"></label>`).join('')+(err?`<p class="err" style="color:var(--bad)">${err}</p>`:''),`<button class="p" data-act="psave" data-arg="${kind}:${id}">Save</button>`)}
Object.assign(ACT,{
  nav:p=>go(p),theme:()=>{S.theme=S.theme=='dark'?'light':'dark';try{localStorage.setItem('cbt-theme',S.theme)}catch(e){}document.documentElement.dataset.theme=S.theme;render()},
  bell:()=>{S.menu=S.menu=='notes'?null:'notes';render()},user:()=>{S.menu=S.menu=='user'?null:'user';render()},closem:()=>{S.modal=null;S.pf=null;S.err='';render()},
  burger:()=>{S.nav=!S.nav;render()},
  newexam:()=>{S.draft=newDraft();S.qf=newQF();S.qi=null;S.step=1;go('builder')},
  editexam:id=>{S.draft=JSON.parse(JSON.stringify(exOf(id)));S.qf=newQF();S.qi=null;S.step=1;go('builder')},
  dupexam:id=>{const c=JSON.parse(JSON.stringify(exOf(id)));c.id=uid('e');c.title+=' (copy)';c.status='draft';DB.exams.push(c);save();toast('Exam duplicated');render()},
  togexam:id=>{const e=exOf(id);if(e.status!='published'&&!e.qs.length)return toast('Add questions before publishing.','bad');e.status=e.status=='published'?'draft':'published';log((e.status=='published'?'Published: ':'Unpublished: ')+e.title);save();toast('Exam '+e.status);render()},
  delexam:id=>cmod(()=>modalForm('Delete examination?','<p>This also removes its submissions.</p>',`<button class="p d" data-act="delexamgo" data-arg="${id}">Delete</button>`)),
  delexamgo:id=>{DB.exams=DB.exams.filter(e=>e.id!=id);DB.attempts=DB.attempts.filter(a=>a.examId!=id);save();S.modal=null;toast('Exam deleted');render()},
  step:n=>{n=+n;if(n>1&&!S.draft.title.trim()&&n!=1&&S.step==1)return toast('Add a title first.','bad');S.step=Math.max(1,Math.min(4,n));render()},
  qsave:()=>{const r=buildQ(S.qf);if(r.err)return toast(r.err,'bad');if(S.qi!=null){r.q.id=S.draft.qs[S.qi].id;S.draft.qs[S.qi]=r.q}else S.draft.qs.push(r.q);S.qi=null;S.qf=newQF();toast('Question saved');render()},
  qcancel:()=>{S.qi=null;S.qf=newQF();render()},qedit:i=>{S.qi=+i;S.qf=toForm(S.draft.qs[i]);render()},
  qdup:i=>{const c=JSON.parse(JSON.stringify(S.draft.qs[i]));c.id=uid('q');S.draft.qs.splice(+i+1,0,c);render()},qdel:i=>{S.draft.qs.splice(i,1);S.qi=null;render()},
  qmove:a=>{const[i,d]=a.split(':').map(Number),j=i+d;if(j<0||j>=S.draft.qs.length)return;[S.draft.qs[i],S.draft.qs[j]]=[S.draft.qs[j],S.draft.qs[i]];render()},
  qprev:i=>cmod(()=>modalForm('Question preview',qPrev(S.draft.qs[i]))),qprevall:()=>cmod(()=>modalForm('Exam preview',S.draft.qs.map((q,i)=>`<div class="card"><small class="mut">Q${i+1}</small>${qPrev(q)}</div>`).join('')||'<p>No questions.</p>')),
  savedraft:()=>saveDraft('draft'),publish:()=>{const p=problems(S.draft);if(p.length)return toast(p[0],'bad');saveDraft('published')},
  importopen:()=>{S.imp={text:'type,question,options,answer,marks,difficulty,topic\nsingle,Largest planet?,Earth|Jupiter|Mars,2,2,Easy,Space\ntf,Sharks are mammals,,False,1,Easy,Biology\nsingle,Bad row,OnlyOne,1,1,Easy,Test',rows:null};cmod(impModal)},
  importprev:()=>{const rows=parseCSV(S.imp.text),h=rows[0]&&rows[0][0].toLowerCase()=='type'?1:0;S.imp.rows=rows.slice(h).map((c,i)=>{const f={type:(c[0]||'').trim().toLowerCase(),t:c[1]||'',opts:(c[2]||'').split('|').join('\n'),ans:c[3]||'',m:c[4]||1,diff:c[5]||'Medium',topic:c[6]||'',exp:''};const r=TYPES[f.type]?buildQ(f):{err:'Unknown type "'+f.type+'".'};return{line:i+h+1,t:f.t,...r}});render()},
  importgo:()=>{const ok=S.imp.rows.filter(r=>r.q);ok.forEach(r=>DB.bank.push({...r.q,subject:'Imported'}));log('Imported '+ok.length+' questions');save();S.modal=null;toast(ok.length+' question(s) imported');render()},
  bankaddopen:()=>{S.qf=newQF();cmod(()=>modalForm('Add to question bank',qForm(),'<button class="p" data-act="bankadd">Save</button>'))},
  bankadd:()=>{const r=buildQ(S.qf);if(r.err)return toast(r.err,'bad');DB.bank.push({...r.q,subject:'General'});save();S.modal=null;S.qf=newQF();toast('Added to bank');render()},
  bankprev:id=>cmod(()=>modalForm('Question preview',qPrev(DB.bank.find(q=>q.id==id)))),
  bankdup:id=>{const c=JSON.parse(JSON.stringify(DB.bank.find(q=>q.id==id)));c.id=uid('b');DB.bank.push(c);save();toast('Duplicated');render()},
  bankdel:()=>{if(!SEL.size)return toast('Select rows first.','bad');DB.bank=DB.bank.filter(q=>!SEL.has(q.id));SEL.clear();save();toast('Deleted');render()},
  bankuse:id=>{if(!S.draft)S.draft=newDraft();const c=JSON.parse(JSON.stringify(DB.bank.find(q=>q.id==id)));c.id=uid('q');S.draft.qs.push(c);toast('Added to your draft exam ('+S.draft.qs.length+' questions)')},
  export:()=>{download('results.csv',toCSV([['Student','ID','Exam','Score','Max','Percent','Grade','Result','Date']].concat(DB.attempts.map(attRow).map(r=>[r.student,r.sid,r.exam,r.score,r.max,r.pct<0?'':r.pct,r.grade,r.res,r.date]))));toast('CSV exported')},
  grade:id=>{const a=DB.attempts.find(x=>x.id==id),ex=exOf(a.examId);cmod(()=>modalForm('Grade essays — '+esc((stuOf(a.studentId)||{}).name),ex.qs.filter(q=>q.type=='essay').map(q=>`<div class="card"><b>${esc(q.t)}</b><p>${esc(a.answers[q.id]||'(no answer submitted)')}</p><label>Marks (0–${q.m})<input type="number" min="0" max="${q.m}" step="0.5" data-g="${q.id}" value="${a.manual[q.id]??''}"></label></div>`).join('')+'<label>Feedback<textarea rows="2" id="gfb"></textarea></label>',`<button class="p" data-act="gradesave" data-arg="${id}">Save & finalise</button>`))},
  gradesave:id=>{const a=DB.attempts.find(x=>x.id==id),ex=exOf(a.examId),m={};let bad=false;document.querySelectorAll('[data-g]').forEach(el=>{const q=ex.qs.find(x=>x.id==el.dataset.g),v=parseFloat(el.value);if(isNaN(v)||v<0||v>q.m)bad=true;else m[q.id]=v});
    if(bad)return toast('Enter a valid mark for every essay.','bad');a.manual=m;const r=Engine.score(ex,a.answers,m);a.score=r.score;a.pending=r.pending;a.feedback=$('#gfb').value.trim();log('Graded essays: '+ex.title+' ('+r.score+')');save();S.modal=null;toast('Result finalised');render()},
  review:id=>cmod(reviewModal(id)),
  /* student */
  intro:id=>go('intro',{id}),begin:id=>{if(Engine.start(id))go('workspace')},
  pick:i=>{DB.active.answers[curQ().id]=+i;mark();render()},
  pickm:i=>{const q=curQ(),s=new Set(DB.active.answers[q.id]||[]);s.has(+i)?s.delete(+i):s.add(+i);DB.active.answers[q.id]=[...s];mark();render()},
  flag:()=>{const q=curQ(),f=DB.active.flags;f[q.id]?delete f[q.id]:f[q.id]=1;mark();render()},
  jump:i=>{DB.active.cur=+i;save();render()},prev:()=>ACT.jump(Math.max(0,DB.active.cur-1)),next:()=>ACT.jump(Math.min(DB.active.order.length-1,DB.active.cur+1)),
  submitask:()=>cmod(submitModal),submitgo:()=>Engine.submit(false),
  /* admin */
  pform:a=>{const[k,id]=a.split(':');S.pf=null;S.err='';cmod(personModal(k,id))},
  psave:a=>{const[k,id]=a.split(':'),v={};document.querySelectorAll('[data-m]').forEach(el=>v[el.dataset.m]=el.value.trim());S.pf=v;
    const miss=FIELDS[k].find(f=>!v[f[0]]);S.err=miss?miss[1]+' is required.':!/^\S+@\S+\.\S+$/.test(v.email)?'Enter a valid email.':!id&&DB[k].some(x=>x.id==v.id)?'That ID already exists.':'';
    if(S.err){S.modal=personModal(k,id);return render()}
    if(id)Object.assign(DB[k].find(x=>x.id==id),v);else DB[k].push(v);log((id?'Updated ':'Added ')+k.slice(0,-1)+' '+v.name);save();S.modal=null;S.pf=null;toast('Saved');render()},
  pdelask:a=>{const[k,id]=a.split(':');cmod(()=>modalForm('Delete record?','<p>This cannot be undone.</p>',`<button class="p d" data-act="pdel" data-arg="${a}">Delete</button>`))},
  pdel:a=>{const[k,id]=a.split(':');DB[k]=DB[k].filter(x=>x.id!=id);log('Deleted '+k.slice(0,-1)+' '+id);save();S.modal=null;toast('Deleted');render()},
  pexport:k=>{download(k+'.csv',toCSV([FIELDS[k].map(f=>f[1])].concat(DB[k].map(r=>FIELDS[k].map(f=>r[f[0]])))));toast('CSV exported')},
  pview:id=>{const s=stuOf(id),rows=DB.attempts.filter(a=>a.studentId==id).map(attRow);cmod(()=>modalForm(esc(s.name),`<p class="mut">${s.id} · ${esc(s.cls)} · ${esc(s.email)}</p>${rows.map(r=>`<div class="row sb"><span>${esc(r.exam)}</span><span>${r.score}/${r.max} ${resTag(r)}</span></div>`).join('')||'<p class="mut">No results yet.</p>'}`))},
  subjadd:()=>{const v=$('#newsubj').value.trim();if(!v)return toast('Enter a subject name.','bad');if(DB.subjects.includes(v))return toast('Already exists.','bad');DB.subjects.push(v);save();render()},
  subjdel:s=>{DB.subjects=DB.subjects.filter(x=>x!=s);save();render()},
  schtog:id=>{const s=DB.schools.find(x=>x.id==id);s.status=s.status=='active'?'suspended':'active';log('School '+s.name+' '+s.status);save();render()},
  resetask:()=>cmod(()=>modalForm('Reset demo data?','<p>All changes will be lost.</p>','<button class="p d" data-act="resetgo">Reset</button>')),resetgo:()=>{Store.reset();DB=SEED();S.draft=null;S.modal=null;save();go('dashboard')}
});
function saveDraft(status){const d=S.draft;if(!d.title.trim())return toast('Add a title first.','bad');d.status=status;const i=DB.exams.findIndex(e=>e.id==d.id);
  if(i>=0)DB.exams[i]=d;else{d.id=uid('e');DB.exams.push(d)}log((status=='published'?'Published: ':'Saved draft: ')+d.title);save();S.draft=null;toast(status=='published'?'Exam published (simulated)':'Draft saved');go('exams')}
const impModal=()=>{const r=S.imp.rows;return modalForm('Import questions (CSV)',`<p class="mut">Columns: type, question, options (separate with |), answer (option number, or True/False, or text), marks, difficulty, topic.</p><textarea rows="6" data-imp="1" aria-label="CSV content">${esc(S.imp.text)}</textarea>${r?`<div class="wrap"><table><tr><th>Row</th><th>Question</th><th>Status</th></tr>${r.map(x=>`<tr><td>${x.line}</td><td>${esc(x.t)}</td><td>${x.q?tag('Valid','ok'):tag(x.err,'bad')}</td></tr>`).join('')}</table></div>`:''}`,`<button data-act="importprev">Validate & preview</button><button class="p" data-act="importgo" ${r&&r.some(x=>x.q)?'':'disabled'}>Import valid rows</button>`)};

;
let DB=Store.load(SEED);
const S={role:'teacher',page:'dashboard',p:{},theme:'light',modal:null,menu:null,nav:false,draft:null,step:1,qf:null,qi:null,fb:{type:'',diff:''},imp:null,pf:null,err:''};
try{S.theme=localStorage.getItem('cbt-theme')||'light'}catch(e){}
document.documentElement.dataset.theme=S.theme;
const save=()=>Store.save(DB);
const log=a=>{DB.logs.unshift({t:Date.now(),who:S.role,a});DB.logs=DB.logs.slice(0,150);save()};
const ROLES={teacher:'Teacher',student:'Student',admin:'School admin',platform:'Platform admin'};
const NAV={
  teacher:[['dashboard','Dashboard'],['exams','Examinations'],['builder','Create exam'],['bank','Question bank'],['results','Results & grading'],['classes','Classes & students'],['settings','Settings']],
  student:[['dashboard','Dashboard'],['exams','Examinations'],['results','My results'],['settings','Settings']],
  admin:[['dashboard','Dashboard'],['students','Students'],['teachers','Teachers'],['classes','Classes & subjects'],['exams','Examinations'],['reports','Reports'],['settings','Settings']],
  platform:[['dashboard','Dashboard'],['schools','Schools'],['users','Users'],['logs','Activity logs'],['settings','Settings']]
};
function go(page,p={}){S.page=page;S.p=p;S.menu=null;S.nav=false;S.modal=null;render();window.scrollTo(0,0)}
const pageTitle=()=>(NAV[S.role].find(n=>n[0]==S.page)||[0,S.page[0].toUpperCase()+S.page.slice(1)])[1];
function sidebar(){return`<aside class="${S.nav?'open':''}" aria-label="Main navigation"><div class="logo">🎓 ExamHub</div>${NAV[S.role].map(([id,l])=>`<button class="${S.page==id?'on':''}" data-act="nav" data-arg="${id}">${l}</button>`).join('')}</aside>`}
function topbar(){
  const notes=DB.notes.map(n=>`<div style="padding:8px">${esc(n)}</div>`).join('');
  return`<header class="top"><button class="menu-btn" data-act="burger" aria-label="Open menu">☰</button><span class="crumb">${ROLES[S.role]} › <b>${pageTitle()}</b></span><span class="sp"></span>
  <input id="gs" placeholder="Search exams…" aria-label="Search examinations" style="max-width:190px">
  <select data-role="1" aria-label="Preview as role" style="width:auto">${Object.entries(ROLES).map(([k,v])=>`<option value="${k}" ${S.role==k?'selected':''}>${v}</option>`).join('')}</select>
  <button data-act="bell" aria-label="Notifications">🔔 ${DB.notes.length}</button><button data-act="theme" aria-label="Toggle theme">${S.theme=='dark'?'☀️':'🌙'}</button><button data-act="user" aria-label="Profile menu">👤</button>
  ${S.menu=='notes'?`<div class="drop" role="menu">${notes}</div>`:''}${S.menu=='user'?`<div class="drop" role="menu"><div style="padding:8px"><b>${S.role=='student'?'Ada Obi':'Demo user'}</b><br><span class="mut">${ROLES[S.role]} (demo, no real login)</span></div><button class="s" style="width:100%" data-act="nav" data-arg="settings">Settings</button></div>`:''}</header>`}
function render(){
  const a=document.activeElement,fk=a&&a.dataset&&a.dataset.search,pos=a&&a.selectionStart;
  const fn=PAGES[S.role+'.'+S.page]||PAGES['*.'+S.page]||(()=>'<div class="card empty">Page not found.</div>');
  let body;try{body=fn()}catch(err){console.error(err);body='<div class="card empty">Something went wrong while rendering this page.</div>'}
  document.body.classList.toggle('focus',S.page=='workspace');
  $('#root').innerHTML=`<div class="app">${sidebar()}<div>${topbar()}<main>${body}</main></div></div>${S.modal?`<div class="modal" role="dialog" aria-modal="true"><div class="card">${S.modal()}</div></div>`:''}`;
  if(fk){const el=$(`[data-search="${fk}"]`);if(el){el.focus();try{el.setSelectionRange(pos,pos)}catch(e){}}}
  tick();
}
function tick(){
  const a=DB.active;if(S.page!='workspace'||!a)return;const l=a.deadline-Date.now();
  if(l<=0){toast('Time is up. Submitting your exam.');Engine.submit(true);return}
  const t=$('#tm');if(t){t.textContent=String(Math.floor(l/60000)).padStart(2,'0')+':'+String(Math.floor(l/1000)%60).padStart(2,'0');t.classList.toggle('low',l<60000)}
}
setInterval(tick,1000);
document.addEventListener('click',ev=>{
  const t=ev.target;
  if(t.classList&&t.classList.contains('modal'))return ACT.closem();
  const so=t.closest('[data-sort]');if(so){const[id,k]=so.dataset.sort.split(':'),s=TS[id];s.d=s.k==k?-s.d:1;s.k=k;return render()}
  const pg=t.closest('[data-pg]');if(pg){const[id,d]=pg.dataset.pg.split(':');TS[id].pg+=+d;return render()}
  const el=t.closest('[data-act]');
  if(el){if(el.disabled)return;const fn=ACT[el.dataset.act];if(fn)fn(el.dataset.arg,el);return}
  if(S.menu&&!t.closest('.drop')){S.menu=null;render()}
});
document.addEventListener('input',ev=>{
  const el=ev.target,d=el.dataset;
  if(d.search){TS[d.search].q=el.value;TS[d.search].pg=0;return render()}
  if(d.f&&S.draft)S.draft[d.f]=el.type=='checkbox'?el.checked:el.type=='number'?+el.value:el.value;
  if(d.q)S.qf[d.q]=el.value;
  if(d.imp)S.imp.text=el.value;
  if(d.ans&&DB.active){const a=DB.active,q=curQ();Engine.has(el.value)?a.answers[q.id]=el.value:delete a.answers[q.id];mark();const b=$('#pb'+a.cur);if(b&&!a.flags[q.id])b.classList.toggle('a',Engine.has(el.value))}
});
document.addEventListener('change',ev=>{
  const el=ev.target,d=el.dataset;
  if(d.role){S.role=el.value;S.draft=null;return go('dashboard')}
  if(d.q&&d.rr){S.qf[d.q]=el.value;render()}
  if(d.fb){S.fb[d.fb]=el.value;render()}
  if(d.sel){el.checked?SEL.add(d.sel):SEL.delete(d.sel)}
});
document.addEventListener('keydown',ev=>{
  const tg=ev.target.tagName;
  if(ev.key=='Escape'&&S.modal)return ACT.closem();
  if(ev.key=='Enter'&&ev.target.id=='gs'){(TS.exams||(TS.exams={q:'',k:null,d:1,pg:0})).q=ev.target.value;return go('exams')}
  if(S.page=='workspace'&&DB.active&&!S.modal&&tg!='INPUT'&&tg!='TEXTAREA'&&tg!='SELECT'){if(ev.key=='ArrowRight')ACT.next();if(ev.key=='ArrowLeft')ACT.prev()}
});
addEventListener('online',()=>{const c=$('#cn');if(c){c.textContent='Online';c.className='tag ok'}});
addEventListener('offline',()=>{const c=$('#cn');if(c){c.textContent='Offline (answers kept locally)';c.className='tag bad'}});
render();

