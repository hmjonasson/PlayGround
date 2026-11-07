(() => {
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const battleCanvas = document.getElementById('battleScene');
  const bctx = battleCanvas.getContext('2d');
  bctx.imageSmoothingEnabled = false;
  const $ = id => document.getElementById(id);
  const saved = (() => { try { return JSON.parse(localStorage.getItem('petalbound-save') || 'null'); } catch { return null; } })();
  const state = Object.assign({x:155,y:112,hp:5,dew:0,tea:2,seed:0,met:false,won:false,done:false,got:new Set(),battle:false,enemyHp:3,dialogue:null}, saved || {});
  state.got = new Set(state.got || []);
  const dewDrops = [{id:'a',x:52,y:127},{id:'b',x:215,y:100},{id:'c',x:278,y:138}];
  const held = new Set(); let moveTimer, toastTimer, blink = 0;
  function save(){const copy={...state,got:[...state.got],battle:false,dialogue:null};localStorage.setItem('petalbound-save',JSON.stringify(copy));}
  function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
  function text(c,s,x,y,color,size=6){c.fillStyle=color;c.font=`bold ${size}px monospace`;c.fillText(s,x,y);}
  function drawFairy(c,x,y,kind='lumi',scale=1){
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
    // soft little shadow
    ellipse(c,0,2,7,2,'#3b76534c');
    if(kind==='moth'){
      // wings
      rect(c,-12,-12,6,9,'#c7a3d8');rect(c,-16,-9,5,7,'#e3c5ed');rect(c,6,-13,6,9,'#c7a3d8');rect(c,11,-10,5,7,'#e3c5ed');
      rect(c,-4,-16,9,13,'#6d557f');rect(c,-3,-14,7,9,'#92769f');rect(c,-2,-11,2,2,'#fff1c8');rect(c,2,-11,2,2,'#fff1c8');
      rect(c,-5,-5,11,5,'#4e3e5e');rect(c,-3,-3,2,2,'#b78a88');rect(c,3,-3,2,2,'#b78a88');
      rect(c,-8,-16,3,3,'#574268');rect(c,7,-16,3,3,'#574268');
    } else {
      // translucent pixel wings
      rect(c,-12,-12,7,7,'#c5eddb');rect(c,-15,-9,5,5,'#e3f7de');rect(c,6,-12,7,7,'#c5eddb');rect(c,10,-9,5,5,'#e3f7de');
      rect(c,-5,-13,10,12,kind==='elder'?'#d18a75':'#e7a2c0');rect(c,-4,-16,8,7,'#f1c7a4');rect(c,-4,-18,8,4,kind==='elder'?'#66825e':'#8c609c');rect(c,-5,-15,2,3,kind==='elder'?'#66825e':'#8c609c');rect(c,3,-15,2,3,kind==='elder'?'#66825e':'#8c609c');
      rect(c,-3,-13,2,2,'#453a50');rect(c,2,-13,2,2,'#453a50');rect(c,-2,-9,5,2,'#fff0cb');
      if(kind==='elder'){rect(c,-7,-7,14,4,'#759464');rect(c,-2,-4,4,5,'#f0d7a8');rect(c,-10,-20,5,2,'#f0d277');rect(c,5,-20,5,2,'#f0d277');}
      else {rect(c,-6,-8,12,4,'#e5a0be');rect(c,-1,-5,3,5,'#fff0c1');rect(c,-5,-20,3,4,'#f2d470');rect(c,4,-21,3,5,'#f2d470');rect(c,-2,-23,3,3,'#f7e394');}
    }
    c.restore();
  }
  function drawScene(){
    const c=ctx;c.clearRect(0,0,320,180);
    // sky and distant rolling hills
    rect(c,0,0,320,180,'#a9d8bd');rect(c,0,0,320,52,'#addbc7');
    ellipse(c,45,56,70,19,'#9bceb1');ellipse(c,148,52,75,18,'#92c7a6');ellipse(c,270,54,76,23,'#9bcdb0');
    // far flowering canopy
    for(let i=0;i<14;i++){let x=i*25-4;rect(c,x,34+(i%3)*3,20,13,i%2?'#79aa89':'#82b494');rect(c,x+3,31+(i%3)*3,11,4,'#8dc19b');}
    // meadow base
    rect(c,0,64,320,116,'#86c596');rect(c,0,76,320,104,'#8fcf9d');
    // winding cream path
    rect(c,0,139,320,27,'#c9bb8f');rect(c,0,143,320,20,'#d7c89b');rect(c,0,147,320,13,'#dfd0a6');
    rect(c,130,114,64,18,'#c9bb8f');rect(c,145,105,38,19,'#d7c89b');rect(c,165,116,24,29,'#c9bb8f');rect(c,171,122,17,26,'#d7c89b');
    // tree trunks and leaves
    const tree=(x,y,s=1)=>{rect(c,x-4*s,y-9*s,9*s,24*s,'#775f50');rect(c,x-6*s,y+9*s,14*s,3*s,'#6c594c');rect(c,x-13*s,y-22*s,26*s,16*s,'#5d9270');rect(c,x-9*s,y-27*s,18*s,10*s,'#6da47b');rect(c,x-16*s,y-17*s,11*s,9*s,'#70a67c');rect(c,x+5*s,y-16*s,11*s,8*s,'#75ae80');rect(c,x-8*s,y-22*s,4*s,3*s,'#8bc18c');};
    tree(18,73,1.2);tree(302,73,1.2);tree(115,56,.82);tree(240,58,.92);
    // elder's stump home
    rect(c,69,87,35,16,'#896849');rect(c,66,85,40,6,'#ad805b');rect(c,72,81,29,8,'#c39a6f');rect(c,78,88,17,3,'#594e52');rect(c,81,91,11,11,'#64505a');rect(c,86,92,3,7,'#f7d98b');rect(c,72,82,6,3,'#dec69a');
    // flowers & plants
    const flowers=[[30,119,'#f7d77a'],[72,126,'#efa5c0'],[119,111,'#fff0a5'],[192,134,'#efacc6'],[232,119,'#f6df83'],[292,115,'#f3adc3'],[138,83,'#f7d981'],[187,72,'#eeb3ce'],[38,91,'#f0b5cd'],[261,93,'#f3d982'],[109,151,'#f1b3c9'],[247,154,'#f6e18f']];
    flowers.forEach(([x,y,col],i)=>{rect(c,x,y,2,6,'#568d67');rect(c,x-2,y+4,3,2,'#568d67');rect(c,x+1,y+3,3,2,'#568d67');rect(c,x-2,y-2,3,3,col);rect(c,x+2,y-2,3,3,col);rect(c,x,y-4,3,3,col);rect(c,x,y-1,2,2,'#fff0b0');if(i%3===0)rect(c,x+8,y+5,2,5,'#6ba476');});
    // stepping stones and tufts
    [[127,145],[152,151],[202,143],[62,148],[218,161],[287,149],[124,162]].forEach(([x,y],i)=>{rect(c,x,y,7,2,i%2?'#ada783':'#beb38e');});
    for(let i=0;i<28;i++){let x=(i*47+17)%320,y=71+(i*31)%105;if(y>136&&x>30&&x<290)continue;rect(c,x,y,2,3,i%2?'#68a878':'#6ead7d');}
    // glimmers
    dewDrops.forEach((d,i)=>{if(state.got.has(d.id))return;let bob=Math.sin(blink/11+i)*1.5;rect(c,d.x-3,d.y+3+bob,7,2,'#75ac80');rect(c,d.x-2,d.y-2+bob,5,5,'#d8fff1');rect(c,d.x-1,d.y-4+bob,3,4,'#f5fff0');rect(c,d.x,d.y-2+bob,2,2,'#fff1a7');rect(c,d.x+4,d.y-5+bob,2,2,'#fff7c0');});
    // gloom moth waits by flower patch until challenged
    if(!state.won){drawFairy(c,252,91,'moth',.92);}
    drawFairy(c,83,87,'elder',.92);
    drawFairy(c,state.x,state.y,'lumi',1);
    // screen edges pixel vignettes and interaction marker
    rect(c,0,0,320,3,'#789f8a');rect(c,0,177,320,3,'#6c927d');
    const near=nearestThing();if(near){let y=(near.kind==='elder'?62:near.kind==='moth'?64:near.y-16);text(c,near.kind==='elder'?'!':near.kind==='moth'?'!':'✦',near.x-2,y,'#fff3b1',8);}
    blink++;requestAnimationFrame(drawScene);
  }
  function nearestThing(){let best=null,dist=999;const items=[{kind:'elder',x:83,y:87},...dewDrops.filter(d=>!state.got.has(d.id)).map(d=>({...d,kind:'dew'})),...(!state.won?[{kind:'moth',x:252,y:91}]:[])];for(const item of items){let d=Math.hypot(state.x-item.x,state.y-item.y);if(d<dist){best=item;dist=d;}}return dist<24?best:null;}
  function showToast(message){const el=$('toast');el.textContent=message;el.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.add('hidden'),1800);}
  function openDialog(speaker,avatar,pages,finish){state.dialogue={speaker,avatar,pages,index:0,finish};$('dialogSpeaker').textContent=speaker;$('dialogAvatar').textContent=avatar;$('dialogText').textContent=pages[0];$('dialogBackdrop').classList.remove('hidden');}
  function advanceDialog(){const d=state.dialogue;if(!d)return;if(d.index<d.pages.length-1){d.index++;$('dialogText').textContent=d.pages[d.index];return;}$('dialogBackdrop').classList.add('hidden');state.dialogue=null;if(d.finish)d.finish();}
  function interact(){if(state.battle)return;if(state.dialogue){advanceDialog();return;}const near=nearestThing();if(!near){showToast('Wander closer to something sparkling ✦');return;}
    if(near.kind==='dew'){state.got.add(near.id);state.dew++;save();updateUI();$('companionQuote').textContent=['“A tiny drop of moonlight!”','“The meadow feels brighter already.”','“One more for Elder Fern!”'][Math.min(state.dew-1,2)];showToast('Moon Dew collected! ✧');return;}
    if(near.kind==='elder'){
      if(!state.met){openDialog('ELDER FERN','❀',['Oh, little one! The Dewlight is fading from Mosslight Meadow, a quiet corner of Neopia. The Gloom Moth has been drinking the moonlight.','Gather 3 Moon Dew and send the moth fluttering away. Bring them back to me, and I will share a Moonseed. The meadow is counting on you!'],()=>{state.met=true;save();updateUI();showToast('Quest accepted: The Dewlight Quest');});}
      else if(state.done){openDialog('ELDER FERN','❀',['You did it! The meadow is glowing again, and the flowers are singing.','Take this Moonseed. Plant it wherever you need a little light. Thank you, brave fairy!'],()=>{});}
      else if(state.dew>=3&&state.won){state.done=true;state.seed=1;save();updateUI();openDialog('ELDER FERN','❀',['The dewlight is whole again! You brought such kindness back to this meadow.','A Moonseed for your satchel. Wherever it grows, a little magic follows.'],()=>{showToast('Quest complete! Moonseed earned ✿');$('companionQuote').textContent='“We did it! This place is glowing!”';});}
      else{openDialog('ELDER FERN','❀',[`You have ${state.dew} of 3 Moon Dew. ${state.won?'The Gloom Moth is no longer a threat.':'The moth flutters near the northern flowers.'} Keep going, little star!`]);}return;
    }
    if(near.kind==='moth'){startBattle();return;}
  }
  function startBattle(){state.battle=true;state.enemyHp=3;$('battleLayer').classList.remove('hidden');$('battleDialog').textContent='A Gloom Moth flutters from the brambles.';$('battleStatus').textContent='Your turn';drawBattle();}
  function drawBattle(){const c=bctx;c.clearRect(0,0,320,116);rect(c,0,0,320,116,'#9abfa4');ellipse(c,70,31,76,29,'#82ac91');ellipse(c,263,27,73,27,'#83ad92');rect(c,0,66,320,50,'#83bc8b');rect(c,0,86,320,30,'#a8c987');ellipse(c,82,92,35,7,'#c7b58b');ellipse(c,244,76,34,7,'#648d75');drawFairy(c,85,88,'lumi',1.45);drawFairy(c,239,74,'moth',1.35);for(let i=0;i<3;i++){rect(c,203+i*9,13,6,3,i<state.enemyHp?'#efc3de':'#685e77');}text(c,'GLOOM MOTH',207,27,'#fff5d5',5);}
  function enemyTurn(line){$('battleStatus').textContent='Gloom Moth moves…';$('battleDialog').textContent=line;drawBattle();setTimeout(()=>{if(!state.battle)return;state.hp=Math.max(0,state.hp-1);if(state.hp===0){state.hp=3;state.x=155;state.y=112;$('battleDialog').textContent='Lumi caught her breath. The moth is still here!';}else $('battleDialog').textContent='The moth scatters shadow dust. Lumi loses 1 heart.';$('battleStatus').textContent='Your turn';updateUI();save();},650);}
  function battleAction(action){if(!state.battle)return;if($('battleStatus').textContent!=='Your turn')return;
    if(action==='run'){state.battle=false;$('battleLayer').classList.add('hidden');state.x=state.x<250?state.x:220;showToast('You fluttered to safety!');return;}
    if(action==='potion'){if(!state.tea){$('battleDialog').textContent='You are out of Petal Tea!';return;}if(state.hp>=5){$('battleDialog').textContent='Lumi already feels full of energy!';return;}state.tea--;state.hp=Math.min(5,state.hp+2);$('battleDialog').textContent='Petal Tea restores 2 hearts.';updateUI();save();enemyTurn('The moth circles while Lumi sips her tea…');return;}
    if(action==='soothe'){ $('battleDialog').textContent='Lumi sings a gentle lullaby. The moth softens…';$('battleStatus').textContent='Your turn'; state.enemyHp--; }
    else{state.enemyHp-=2;$('battleDialog').textContent='Lumi sends a bright burst of starlight!';}
    if(state.enemyHp<=0){state.enemyHp=0;state.won=true;state.battle=false;drawBattle();$('battleStatus').textContent='Victory!';$('battleDialog').textContent='The Gloom Moth drifts away, its wings glowing softly.';updateUI();save();setTimeout(()=>{$('battleLayer').classList.add('hidden');showToast('Gloom Moth befriended! ✦');$('companionQuote').textContent='“Even a shadow can find its way home.”';},1350);return;}
    drawBattle();enemyTurn('The moth flutters closer…');
  }
  function move(dx,dy){if(state.battle||state.dialogue)return;state.x=Math.max(13,Math.min(307,state.x+dx));state.y=Math.max(60,Math.min(167,state.y+dy));}
  function updateQuest(){let count=(state.met?1:0)+state.dew+(state.won?1:0);$('questProgress').style.width=`${Math.min(100,count/5*100)}%`;$('questProgressLabel').textContent=`${Math.min(count,5)} / 5`;
    const steps=$('questSteps');steps.classList.toggle('done',state.done);const dot=steps.querySelector('.step-dot');const label=steps.querySelector('span:last-child');
    if(state.done){label.textContent='Dewlight restored · Quest complete';}
    else if(!state.met){label.textContent='Meet Elder Fern';}
    else if(state.dew<3){label.textContent=`Gather Moon Dew · ${state.dew}/3`;}
    else if(!state.won){label.textContent='Find the Gloom Moth';}
    else{label.textContent='Return to Elder Fern';}
    $('questText').textContent=state.done?'The meadow glows again. A new little adventure awaits!':!state.met?'Find Elder Fern near the old stump. She may know why the meadow’s light is fading.':state.dew<3?`Gather Moon Dew from the meadow flowers. ${state.dew} of 3 collected.`:!state.won?'Find the Gloom Moth among the northern flowers and help it let go of the stolen light.':'Return to Elder Fern with the meadow safe.';
  }
  function updateUI(){ $('healthText').textContent=`${state.hp} / 5`;$('healthBar').style.width=`${state.hp*20}%`;$('dewCount').textContent=state.dew;$('satchelDew').textContent=state.dew;$('satchelTea').textContent=state.tea;$('satchelSeed').textContent=state.seed;$('potionCount').textContent=state.tea;$('itemTotal').textContent=`${3+(state.seed?1:0)} items`;$('locationLabel').textContent=state.done?'Dewlight Meadow':'Mosslight Meadow';updateQuest();}
  function bindControls(){document.addEventListener('keydown',e=>{const key=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' ','w','a','s','d','e','enter'].includes(key))e.preventDefault();if(key===' '||key==='e'||key==='enter'){if(!e.repeat)interact();return;}if(['arrowup','w'].includes(key))held.add('up');if(['arrowdown','s'].includes(key))held.add('down');if(['arrowleft','a'].includes(key))held.add('left');if(['arrowright','d'].includes(key))held.add('right');});document.addEventListener('keyup',e=>{const map={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'};if(map[e.key.toLowerCase()])held.delete(map[e.key.toLowerCase()]);});
    setInterval(()=>{if(!held.size)return;let dx=0,dy=0;if(held.has('up'))dy-=3;if(held.has('down'))dy+=3;if(held.has('left'))dx-=3;if(held.has('right'))dx+=3;move(dx,dy);},55);
    document.querySelectorAll('[data-move]').forEach(button=>{const dir=button.dataset.move;button.addEventListener('pointerdown',e=>{e.preventDefault();held.add(dir);button.setPointerCapture(e.pointerId);});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>button.addEventListener(ev,()=>held.delete(dir)));});
    $('interactButton').addEventListener('click',interact);$('dialogNext').addEventListener('click',advanceDialog);$('dialogClose').addEventListener('click',()=>{$('dialogBackdrop').classList.add('hidden');state.dialogue=null;});$('dialogBackdrop').addEventListener('click',e=>{if(e.target===$('dialogBackdrop')){$('dialogBackdrop').classList.add('hidden');state.dialogue=null;}});
    document.querySelectorAll('.battle-actions button').forEach(button=>button.addEventListener('click',()=>battleAction(button.dataset.action)));
    $('soundButton').addEventListener('click',e=>{e.currentTarget.classList.toggle('muted');showToast(e.currentTarget.classList.contains('muted')?'Sound off':'A quiet world, full of wonder');});
  }
  bindControls();updateUI();drawScene();
})();
