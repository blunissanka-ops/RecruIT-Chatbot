let faqsData=[];
let darkMode=false,theme="Blue Gradient";
const chatWrapper=document.querySelector(".chat-wrapper");
const chatWidget=document.querySelector(".chat-widget");
const chatLauncher=document.querySelector("#chat-launcher");
const chatMessages=document.querySelector(".chat-messages");
const sendBtn=document.querySelector("#send-btn");
const clearBtn=document.querySelector("#clear-btn");
const userInput=document.querySelector("#user-input");
const themeSelect=document.querySelector("#theme-select");
const colorPicker=document.querySelector("#custom-color");
const darkToggle=document.querySelector("#dark-toggle");
const menuBtn=document.querySelector("#menu-btn");
const menuDropdown=document.querySelector("#menu-dropdown");
const suggestionsBox=document.querySelector(".suggestion-list");

/* Load FAQs */
fetch("faqs.json")
 .then(r=>r.json())
 .then(d=>{faqsData=d;appendMessage("bot","✅ FAQs loaded successfully!");})
 .catch(()=>appendMessage("bot","⚠️ Unable to load FAQs. Run with Live Server."));

/* Messaging */
function appendMessage(sender,text){
 const div=document.createElement("div");
 div.classList.add("message",sender);
 const time=new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
 div.innerHTML=`<p>${text}</p><span class="meta">${time}</span>`;
 chatMessages.appendChild(div);
 chatMessages.scrollTop=chatMessages.scrollHeight;
}

function cleanText(t){return t.toLowerCase().replace(/[^a-z0-9\s]/g,"");}
function similarity(a,b){
 const A=cleanText(a).split(/\s+/),B=cleanText(b).split(/\s+/);
 const inter=A.filter(x=>B.includes(x));
 return inter.length/Math.max(A.length,B.length);
}

function findAnswer(msg){
 const txt=cleanText(msg);
 const greet=["hi","hello","hey"];
 if(greet.some(g=>txt.includes(g)))return"👋 Hello there! Ask me about jobs, status or training.";
 let best=null,bestScore=0;
 faqsData.forEach(f=>{
  const s=similarity(txt,(f.question+" "+(f.keywords||[]).join(" ")));
  if(s>bestScore){bestScore=s;best=f;}
 });
 if(bestScore>0.1)return best.answer;
 const partial=faqsData.find(f=>f.keywords&&f.keywords.some(k=>txt.includes(k)));
 return partial?partial.answer:"🤔 Sorry, I don’t have info on that. Try 'apply' or 'training'.";
}

function showTyping(){
 const t=document.createElement("div");
 t.classList.add("message","bot");t.textContent="...";
 chatMessages.appendChild(t);
 chatMessages.scrollTop=chatMessages.scrollHeight;
 return t;
}

function handleUserInput(text){
 const msg=text||userInput.value.trim();
 if(!msg)return;
 appendMessage("user",msg);userInput.value="";
 hideDropdown();
 const typing=showTyping();
 setTimeout(()=>{typing.remove();appendMessage("bot",findAnswer(msg));},600);
}

/* Suggestions */
let dropdown;
function createDropdown(){
 dropdown=document.createElement("div");
 dropdown.className="live-suggestions";
 document.querySelector(".chat-footer").appendChild(dropdown);
}
function showDropdown(items){
 if(!dropdown)createDropdown();
 dropdown.innerHTML="";
 items.forEach(it=>{
  const d=document.createElement("div");
  d.className="live-suggestion";d.textContent=it.question;
  d.onclick=()=>{hideDropdown();handleUserInput(it.question);};
  dropdown.appendChild(d);
 });
 dropdown.style.display=items.length?"block":"none";
}
function hideDropdown(){if(dropdown)dropdown.style.display="none";}

userInput.addEventListener("input",e=>{
 const q=e.target.value.toLowerCase();
 suggestionsBox.innerHTML="";
 if(!q){hideDropdown();return;}
 const m=faqsData.filter(f=>f.question.toLowerCase().includes(q)).slice(0,5);
 m.forEach(f=>{
  const b=document.createElement("button");
  b.className="suggestion";b.textContent=f.question;
  b.onclick=()=>{suggestionsBox.innerHTML="";handleUserInput(f.question);};
  suggestionsBox.appendChild(b);
 });
 showDropdown(m);
});

/* Theme + dark */
function applyTheme(){
 const map={"Blue Gradient":["#007BFF","#00C6FF"],"Purple Gradient":["#7b61ff","#c56fff"],"Mint Gradient":["#00C9A7","#92FE9D"],"Sunset Gradient":["#ff9966","#ff5e62"]};
 const [c1,c2]=map[theme]||map["Blue Gradient"];
 document.documentE
