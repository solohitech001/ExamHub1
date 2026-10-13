import type { DB } from './types';
export const seed = (): DB => ({
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
  attempts:([['e1','S002',11],['e1','S003',9],['e1','S004',6],['e1','S005',12],['e1','S006',8],['e1','S007',5],['e1','S008',10],['e2','S002',5],['e2','S003',4],['e2','S004',6],['e2','S005',3],['e2','S006',2]] as [string,string,number][]).map(([examId,studentId,score],i)=>({id:'m'+i,examId,studentId,score,pending:false,at:Date.now()-(i+1)*864e5,mins:3+i%6,feedback:score>=8?'Good work.':'Revise the weak topics.',answers:{},manual:{}})),
  bank:[
    {id:'b1',type:'single',t:'Capital of Nigeria?',opts:['Lagos','Abuja','Kano'],ans:1,m:1,diff:'Easy',topic:'Geography',subject:'Social Studies'},
    {id:'b2',type:'tf',t:'Water boils at 100°C at sea level.',opts:['True','False'],ans:0,m:1,diff:'Easy',topic:'Physics',subject:'Basic Science'},
    {id:'b3',type:'blank',t:'7 × 6 = ___',ans:'42',m:1,diff:'Easy',topic:'Arithmetic',subject:'Mathematics'},
    {id:'b4',type:'essay',t:'Discuss the causes of erosion.',m:10,diff:'Hard',topic:'Geography',subject:'Social Studies'},
    {id:'b5',type:'multi',t:'Select the even numbers.',opts:['2','3','4','7'],ans:[0,2],m:2,diff:'Medium',topic:'Numbers',subject:'Mathematics'}],
  notes:['Mid-Term Mathematics Test closes tomorrow.','3 essays are waiting to be graded.','Welcome to ExamHub.'],
  logs:[],active:null
});
