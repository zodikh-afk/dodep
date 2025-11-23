
const fmt = new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 });
function money(n){ return fmt.format(n); }
function clamp(n, min, max){ return Math.min(max, Math.max(min, n)); }
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

let balance = 5000;
let minBet = 10;
let currentBet = 100;
let totalBet = 0;
let shoe = [];
const DECKS = 4;
let playerHand = [];
let dealerHand = [];
let dealerHoleEl = null;
let phase = 'betting';
let actionLocked = false;

const balanceEl = document.getElementById('balanceValue');
const betInput = document.getElementById('betAmount');
const betValueEl = document.getElementById('betValue');
const statusEl = document.getElementById('statusText');
const dealerCardsEl = document.getElementById('dealerCards');
const playerCardsEl = document.getElementById('playerCards');
const dealerTotalEl = document.getElementById('dealerTotal');
const playerTotalEl = document.getElementById('playerTotal');
const dealBtn = document.getElementById('dealBtn');
const hitBtn = document.getElementById('hitBtn');
const standBtn = document.getElementById('standBtn');
const doubleBtn = document.getElementById('doubleBtn');
const quickBetButtons = Array.from(document.querySelectorAll('.chip'));

const SUITS = ['♠','♥','♦','♣'];
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const RED_SUITS = new Set(['♥','♦']);

function buildShoe(decks = DECKS){
  const tmp = [];
  for (let d = 0; d < decks; d++){
    for (const s of SUITS){
      for (const r of RANKS){
        tmp.push({ rank:r, suit:s });
      }
    }
  }
  return shuffle(tmp);
}
function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function drawCard(){
  if (shoe.length < 20){ shoe = buildShoe(); }
  return shoe.pop();
}
function handValue(hand){
  let total = 0, aces = 0;
  for (const c of hand){
    if (c.rank === 'A'){ aces++; total += 1; }
    else if (['K','Q','J'].includes(c.rank)) total += 10;
    else total += parseInt(c.rank,10);
  }
  let soft = false;
  for (let i=0;i<aces;i++){ if (total+10<=21){ total+=10; soft=true; } }
  const blackjack = (hand.length===2 && total===21);
  return { total, soft, blackjack };
}

function updateBalanceUI(){ balanceEl.textContent = money(balance); }
function updateBetFromInput(){
  const raw = parseInt(betInput.value || '0', 10);
  const clamped = clamp(isNaN(raw)?minBet:raw, minBet, balance);
  currentBet = clamped; betInput.value = String(clamped);
  betValueEl.textContent = money(currentBet);
}
function setStatus(t){ statusEl.textContent = t; }
function setTotalsUI(){
  const pv = handValue(playerHand);
  playerTotalEl.textContent = playerHand.length ? pv.total : '—';
  const dv = handValue(dealerHand);
  if (phase==='dealerTurn'||phase==='roundOver') dealerTotalEl.textContent = dealerHand.length?dv.total:'—';
  else dealerTotalEl.textContent = dealerHand.length?handValue([dealerHand[0]]).total+' + ?':'—';
}
function setButtons(){
  const canDeal = (phase==='betting'||phase==='roundOver') && balance>=minBet;
  dealBtn.disabled=!canDeal;
  const onTurn = (phase==='playerTurn'&&!actionLocked);
  hitBtn.disabled=!onTurn;
  standBtn.disabled=!onTurn;
  const pv = handValue(playerHand);
  const canDouble = onTurn && playerHand.length===2 && balance>=currentBet && pv.total>=4 && pv.total<=20;
  doubleBtn.disabled=!canDouble;
}

function createCardEl(card, faceDown = false) {
  const el = document.createElement('div');
  el.className = 'card';
  
  if (faceDown) {
    el.classList.add('card-back');
    return el;
  }

  const isRed = RED_SUITS.has(card.suit);

  el.innerHTML = `
    <div class="card-rank ${isRed ? 'red' : 'black'}">${card.rank}</div>
    <div class="card-suit ${isRed ? 'red' : 'black'}">${card.suit}</div>
  `;

  return el;
}
async function dealCardTo(container, hand, faceDown=false, delay=120){
  await sleep(delay);
  const card = drawCard(); hand.push(card);
  const cardEl = createCardEl(card, faceDown);
  container.appendChild(cardEl);
  if (faceDown) dealerHoleEl = cardEl;
  return { card, cardEl };
}
function flipDealerHole(){
  if (!dealerHoleEl) return;
  const idx = 1, card = dealerHand[idx];
  const fresh = createCardEl(card,false);
  dealerHoleEl.replaceWith(fresh);
  dealerHoleEl=null;
}

async function startRound(){
  if (!(phase==='betting'||phase==='roundOver')) return;
  updateBetFromInput();
  if (balance<currentBet){ 
    setStatus('Недостатньо коштів.'); 
    return; }
  balance-=currentBet; 
  totalBet=currentBet;
  updateBalanceUI(); 
  betValueEl.textContent=money(totalBet);
  phase='dealing'; 
  setButtons(); 
  setStatus('Роздаємо...');
  dealerCardsEl.innerHTML=''; playerCardsEl.innerHTML='';
  playerHand=[]; dealerHand=[]; dealerHoleEl=null;
  dealerTotalEl.textContent='—'; playerTotalEl.textContent='—';
  await dealCardTo(playerCardsEl,playerHand);
  await dealCardTo(dealerCardsEl,dealerHand);
  await dealCardTo(playerCardsEl,playerHand);
  await dealCardTo(dealerCardsEl,dealerHand,true);
  setTotalsUI();
  const pv=handValue(playerHand), dv=handValue(dealerHand);
  if (pv.blackjack||dv.blackjack){
    await sleep(300); 
    flipDealerHole(); 
    phase='dealerTurn'; 
    setTotalsUI();
    if (pv.blackjack&&dv.blackjack){ balance+=totalBet; setStatus('Нічия (push).'); }
    else if (pv.blackjack){ balance+=Math.floor(totalBet*2.5); setStatus('Blackjack!'); }
    else setStatus('Дилер має Blackjack.');
    updateBalanceUI(); 
    phase='roundOver'; 
    setButtons(); 
    return;
  }
  phase='playerTurn'; 
  setStatus('Твій хід.'); 
  setButtons();
}

async function onHit(){
  if (phase!=='playerTurn'||actionLocked) return;
  actionLocked=true; setButtons();
  await dealCardTo(playerCardsEl,playerHand);
  const pv=handValue(playerHand); setTotalsUI();
  if (pv.total>21){ setStatus('Перебір. Програш.'); 
    flipDealerHole(); phase='roundOver'; }
  actionLocked=false; setButtons();
}

async function onStand(){
  if (phase!=='playerTurn'||actionLocked) return;
  actionLocked=true; await goDealer();
}

async function onDouble(){
  if (phase!=='playerTurn'||actionLocked) return;
  balance-=currentBet; 
  totalBet+=currentBet;
  updateBalanceUI(); 
  betValueEl.textContent=money(totalBet);
  await dealCardTo(playerCardsEl,playerHand); 
  setTotalsUI();
  const pv=handValue(playerHand);
  if (pv.total>21){ 
    setStatus('Перебір після подвоєння.'); 
    flipDealerHole(); 
    phase='roundOver'; 
  }
  else await goDealer();
}

async function goDealer(){
  phase='dealerTurn'; 
  flipDealerHole(); 
  setTotalsUI();
  let dv=handValue(dealerHand);
  while(dv.total<17){ 
    await dealCardTo(dealerCardsEl,dealerHand); 
    dv=handValue(dealerHand); setTotalsUI(); 
  }
  const pv=handValue(playerHand);
  if (dv.total>21){ 
    balance+=totalBet*2; 
    setStatus('Дилер перебрав — перемога!'); 
  }
  else if (pv.total>dv.total){ 
    balance+=totalBet*2; 
    setStatus('Твоя рука старша. Перемога!'); 
  }
  else if (pv.total===dv.total){ 
    balance+=totalBet; 
    setStatus('Нічия.'); 
  }
  else setStatus('Дилер виграв.');
  updateBalanceUI(); 
  phase='roundOver'; 
  actionLocked=false; 
  setButtons();
}

dealBtn.onclick=startRound;
hitBtn.onclick=onHit;
standBtn.onclick=onStand;
doubleBtn.onclick=onDouble;
betInput.oninput=()=>{updateBetFromInput();setButtons();};
quickBetButtons.forEach(b=>b.onclick=(e)=>{
  const add=e.target.dataset.add, all=e.target.dataset.set, clr=e.target.dataset.clear;
  if(all) betInput.value=String(balance);
  else if(clr) betInput.value=String(minBet);
  else if(add){ 
    betInput.value=String(parseInt(betInput.value||'0',10)+parseInt(add,10)); 
  }
  updateBetFromInput(); setButtons();
});
function init(){ 
  shoe=buildShoe(); 
  updateBalanceUI(); 
  updateBetFromInput(); 
  setTotalsUI(); 
  setStatus('Зроби ставку й натисни «Роздати».'); 
  setButtons(); }
init();
