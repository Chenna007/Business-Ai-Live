// ── SCROLL REVEAL ──────────────────────────────
const revObs = new IntersectionObserver(e=>e.forEach(x=>{
  if(x.isIntersecting) x.target.classList.add('show');
}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

// ── TAB SWITCH ─────────────────────────────────
function switchDemo(tab){
  document.getElementById('call-demo').style.display = tab==='call'?'grid':'none';
  document.getElementById('wa-demo').style.display   = tab==='wa'  ?'grid':'none';
  document.getElementById('tab-call').className = 'demo-tab call-tab'+(tab==='call'?' active':'');
  document.getElementById('tab-wa').className   = 'demo-tab wa-tab'  +(tab==='wa'  ?' active':'');
}

// ── CALL DEMO ──────────────────────────────────
let callRunning = false;

const CALL_SCRIPT = [
  {who:'ai',   text:"Thank you for calling Dubai Luxury Restaurant. How can I help you today?", step:0},
  {who:'cust', text:"Hi, is the restaurant open today?", step:1},
  {who:'ai',   text:"Yes, we are open today from 12 in the afternoon until 2 in the morning.", step:1},
  {who:'cust', text:"Great. Where are you located?", step:2},
  {who:'ai',   text:"We are located at JBR Walk, Dubai Marina. Right on the beachfront.", step:2},
  {who:'cust', text:"Can I book a table for 2 people tonight at 8 PM?", step:3},
  {who:'ai',   text:"Of course! May I have your name please?", step:3},
  {who:'cust', text:"My name is Ahmed.", step:3},
  {who:'ai',   text:"Perfect. Table for 2 is confirmed under Ahmed at 8 PM tonight. We look forward to seeing you!", step:3},
];

// Two separate voices: AI = female, Customer = male
let voicesLoaded = [];
function getVoices(){ voicesLoaded = window.speechSynthesis.getVoices(); }
window.speechSynthesis.onvoiceschanged = getVoices;
getVoices();

function pickVoice(role){
  const v = voicesLoaded.length ? voicesLoaded : window.speechSynthesis.getVoices();
  if(role==='ai'){
    // prefer a female English voice for AI
    return v.find(x=>x.lang==='en-US' && /samantha|karen|victoria|zira|female|woman/i.test(x.name))
        || v.find(x=>x.lang==='en-GB' && /female|woman|kate|serena/i.test(x.name))
        || v.find(x=>x.lang==='en-US' && x.name.includes('Google') && !x.name.includes('Male'))
        || v.find(x=>x.lang==='en-US')
        || v[0];
  } else {
    // prefer a male English voice for customer
    return v.find(x=>x.lang==='en-US' && /daniel|alex|thomas|male|man|fred/i.test(x.name))
        || v.find(x=>x.lang==='en-GB' && /daniel|male|man/i.test(x.name))
        || v.find(x=>x.lang==='en-US' && x.name.includes('Google') && !x.name.includes('Female'))
        || v.find(x=>x.lang==='en-US')
        || v[1]
        || v[0];
  }
}

function speak(text, role, onEnd){
  if(!window.speechSynthesis){ onEnd && onEnd(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate   = 0.88;   // slow, clear, easy to understand
  u.pitch  = role==='ai' ? 1.1 : 0.95;
  u.volume = 1;
  const voice = pickVoice(role);
  if(voice) u.voice = voice;
  u.onend  = ()=>{ onEnd && onEnd(); };
  u.onerror= ()=>{ onEnd && onEnd(); };
  window.speechSynthesis.speak(u);
}

function setCallWave(who){
  document.querySelectorAll('.cw').forEach(el=>{
    el.classList.remove('talking');
  });
  if(who==='ai'){
    document.querySelectorAll('.cw.ai-wave').forEach(el=>el.classList.add('talking'));
  } else if(who==='cust'){
    document.querySelectorAll('.cw.cust-wave').forEach(el=>el.classList.add('talking'));
  }
}

function addCallLine(who, text){
  const t = document.getElementById('callTranscript');
  const d = document.createElement('div');
  d.className = 'ct-line '+(who==='ai'?'ct-ai':'ct-cust');
  d.textContent = (who==='ai'?'🤖 ':'👤 ') + text;
  t.appendChild(d);
  requestAnimationFrame(()=>requestAnimationFrame(()=>d.classList.add('show')));
  t.scrollTop = t.scrollHeight;
}

function litStep(i){
  for(let j=0;j<4;j++){
    const el = document.getElementById('cds'+j);
    if(el){ el.classList.toggle('lit', j<=i); }
  }
}

function startCallDemo(){
  if(callRunning) return;
  callRunning = true;
  const btn = document.getElementById('callPlayBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Playing...';
  document.getElementById('callTranscript').innerHTML = '';
  document.getElementById('callDot').className = 'sdot pulse';
  document.getElementById('callStatusText').textContent = 'Connected';
  document.getElementById('callAvatar').className = 'call-avatar active';
  document.getElementById('endBtn').classList.remove('disabled');

  // pre-load voices
  window.speechSynthesis.getVoices();

  let idx = 0;
  function next(){
    if(idx >= CALL_SCRIPT.length){
      // done
      setCallWave(null);
      document.getElementById('callDot').className = 'sdot off';
      document.getElementById('callStatusText').textContent = 'Call ended — Booking confirmed ✅';
      document.getElementById('callAvatar').className = 'call-avatar';
      document.getElementById('callAvatar').textContent = '✅';
      btn.disabled = false;
      btn.textContent = '▶ Play Again';
      callRunning = false;
      return;
    }
    const line = CALL_SCRIPT[idx];
    idx++;
    setCallWave(line.who);
    addCallLine(line.who, line.text);
    litStep(line.step);
    document.getElementById('callStatusText').textContent = line.who==='ai' ? 'AI Speaking...' : 'Customer Speaking...';

    // speak AI lines with AI voice, customer lines with customer voice
    if(line.who==='ai'){
      speak(line.text, 'ai', ()=>{
        setCallWave(null);
        setTimeout(next, 600);
      });
    } else {
      speak(line.text, 'cust', ()=>{
        setCallWave(null);
        setTimeout(next, 500);
      });
    }
  }
  setTimeout(next, 600);
}

// ── WHATSAPP DEMO ───────────────────────────────
let waRunning = false;

const WA_SCRIPT = [
  {who:'in',  text:"Hi, is Dubai Luxury Restaurant open today?", step:0},
  {who:'typing'},
  {who:'out', text:"Yes! We are open today from 12 PM to 2 AM 🕐", step:0},
  {who:'in',  text:"Nice! Where are you located?", step:1},
  {who:'typing'},
  {who:'out', text:"We are at JBR Walk, Dubai Marina 📍 Right on the beachfront!", step:1},
  {who:'in',  text:"Can I book a table for 2 people tonight?", step:2},
  {who:'typing'},
  {who:'out', text:"Of course! What time would you like tonight?", step:2},
  {who:'in',  text:"8 PM please", step:2},
  {who:'typing'},
  {who:'out', text:"8 PM is available! May I have your name?", step:2},
  {who:'in',  text:"Ahmed", step:3},
  {who:'typing'},
  {who:'out', text:"Done! ✅ Table for 2 confirmed under Ahmed at 8 PM tonight. See you soon! 🎉", step:3},
];

function addWaBubble(who, text, step){
  const body = document.getElementById('waBody');
  const el = document.createElement('div');
  el.className = 'wa-bub '+(who==='in'?'wa-bub-in':'wa-bub-out');
  if(who==='out'){
    el.innerHTML = text + '<span class="wa-tick">✓✓</span>';
  } else {
    el.textContent = text;
  }
  body.appendChild(el);
  requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('show')));
  body.scrollTop = body.scrollHeight;
  if(step !== undefined) litWaStep(step);
}

function addWaTyping(){
  const body = document.getElementById('waBody');
  const el = document.createElement('div');
  el.className = 'wa-typing';
  el.innerHTML = '<span></span><span></span><span></span>';
  body.appendChild(el);
  requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('show')));
  body.scrollTop = body.scrollHeight;
  return el;
}

function litWaStep(i){
  for(let j=0;j<4;j++){
    const el = document.getElementById('wds'+j);
    if(el){ el.classList.toggle('lit', j<=i); el.classList.toggle('green-lit', j<=i); }
  }
}

function startWaDemo(){
  if(waRunning) return;
  waRunning = true;
  const btn = document.getElementById('waPlayBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Playing...';
  // clear old messages (keep time tag)
  const body = document.getElementById('waBody');
  body.innerHTML = '<div class="wa-time-tag">Tonight, 11:52 PM</div>';

  let idx = 0;
  let delay = 500;

  WA_SCRIPT.forEach(item=>{
    if(item.who==='typing'){
      const d = delay;
      setTimeout(()=>{
        const t = addWaTyping();
        setTimeout(()=>t.remove(), 1200);
      }, d);
      delay += 1200;
    } else {
      delay += 300;
      const d = delay;
      const it = item;
      setTimeout(()=>{
        addWaBubble(it.who, it.text, it.step);
      }, d);
      delay += it.who==='in' ? 1400 : 1100;
    }
  });

  setTimeout(()=>{
    document.getElementById('waOnline').textContent = '✅ Booking confirmed';
    btn.disabled = false;
    btn.textContent = '▶ Play Again';
    waRunning = false;
  }, delay + 400);
}
