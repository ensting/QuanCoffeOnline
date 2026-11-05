const http=require('http'),fs=require('fs'),path=require('path');
const {WebSocketServer}=require('ws');
const PORT=process.env.PORT||3000, CODE=process.env.CODE||'', MAX=60;
const MENU=[['☕','Cà phê sữa đá'],['🥛','Bạc xỉu'],['🍵','Trà đá vỉa hè'],['🍋','Trà chanh'],['🥥','Nước dừa'],['🍊','Cam vắt'],
 ['🌻','Hạt hướng dương'],['🍗','Chân gà rút xương'],['🥜','Lạc rang'],['🍢','Nem chua rán'],['🍞','Bánh mì'],['🍮','Kem caramen'],['🥃','Tẩy đá'],['🍾','Chai Sting (đổ vào tẩy)'],['🎋','Điếu cày thuốc lào']].map(([e,n])=>({e,n}));
const INS=['Đồ ăn hại!','Mày điên à?','Đầu đất!','Đồ keo kiệt, đãi cốc nước đi!','Lười chảy thây!','Nói nhiều quá, uống nước đi!','Đồ trẻ trâu!','Ngố vừa thôi!','Hâm à!','Đồ mách lẻo!'];
const EMO=['❤️','😂','👍','🍻','😴'];
const PAGE=fs.readFileSync(path.join(__dirname,'public','index.html'));
const server=http.createServer((q,r)=>{
  if(q.url.split('?')[0]==='/healthz'){r.writeHead(200,{'Content-Type':'text/plain'});return r.end('ok')}
  r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
  r.end(PAGE);
});
const wss=new WebSocketServer({server,maxPayload:2048});
const players=new Map(); let nid=1,till=1000;const QUEUE=[],COUNTER={x:135,y:545},TILL={x:208,y:540};
const near=(a,b,r)=>Math.hypot(a.x-b.x,a.y-b.y)<r;
function give(p,i){if(i===13)p.bot=3;else{p.item=i;p.lvl=i<0||i===12?0:i<6?4:6;p.put=null}if(i>=0){p.orders++;till+=20}}
function endW(p){const q=players.get(p.wp);p.wp=0;send(p.ws,{t:'wend'});if(q){q.wp=0;send(q.ws,{t:'wend'})}}
const clean=(s,n)=>String(s||'').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,n);
const send=(ws,m)=>ws.readyState===1&&ws.send(JSON.stringify(m));
const all=m=>{const s=JSON.stringify(m);wss.clients.forEach(c=>c.readyState===1&&c.p&&c.send(s))};
wss.on('connection',ws=>{
  ws.alive=true; ws.on('pong',()=>ws.alive=true);
  ws.on('message',raw=>{
    let m;try{m=JSON.parse(raw)}catch{return}
    const p=ws.p, now=Date.now();
    if(m.t==='join'&&!p){
      if(CODE&&m.code!==CODE){send(ws,{t:'err',m:'Sai mã phòng'});return}
      if(players.size>=MAX){send(ws,{t:'err',m:'Quán đã đầy'});return}
      const name=clean(m.name,16)||'Khách';
      const col=/^#[0-9a-f]{6}$/i.test(m.color)?m.color:'#3b7dd8';
      ws.p={id:nid++,name,color:col,x:480+Math.random()*120-60,y:270,sit:0,item:-1,lvl:0,put:null,last:0,act:0,bot:0,cups:0,orders:0,hits:0,role:0,stun:0,stunBy:0,zen:0,tray:null,wp:0,wreq:0,cash:0,ws};
      ws.p.role=[...players.values()].some(q=>q.role===2)?0:2;
      players.set(ws.p.id,ws.p);
      if(ws.p.role===2)send(ws,{t:'sys',text:'👑 Bạn vào đầu tiên nên là chủ quán! Y: thuê nhân viên · K: mở két'});
      send(ws,{t:'init',id:ws.p.id,menu:MENU,players:[...players.values()].map(({id,name,color})=>({id,name,color}))});
      all({t:'join',p:{id:ws.p.id,name,color:col}});
      all({t:'sys',text:name+' vừa ghé quán'});
    }else if(p&&now<p.stun&&['move','order','act','wreq'].includes(m.t)){}else if(p){
      if(m.t==='move'){p.x=Math.max(20,Math.min(940,+m.x||0));p.y=Math.max(235,Math.min(580,+m.y||0));p.sit=m.sit?1:0}
      else if(m.t==='wreq'){const tg=players.get(+m.to);if(tg&&tg!==p&&!p.wp&&!tg.wp&&near(p,tg,120)){tg.wreq=p.id;send(tg.ws,{t:'wreq',from:p.id,name:p.name})}}
      else if(m.t==='wans'){const r=players.get(+m.to);if(r&&p.wreq===r.id&&!p.wp&&!r.wp){p.wreq=0;if(m.ok){p.wp=r.id;r.wp=p.id;send(p.ws,{t:'wstart',name:r.name});send(r.ws,{t:'wstart',name:p.name})}else send(r.ws,{t:'sys',text:p.name+' từ chối nói chuyện riêng'})}}
      else if(m.t==='wend'&&p.wp)endW(p);
      else if(m.t==='wis'&&p.wp&&now-p.last>500){const q=players.get(p.wp),text=clean(m.text,120);if(q&&text){p.last=now;const o={t:'wmsg',name:p.name,text};send(p.ws,o);send(q.ws,o)}}
      else if(m.t==='chat'&&now-p.last>700){const text=clean(m.text,120);if(text){p.last=now;all({t:'chat',id:p.id,name:p.name,text})}}
      else if(m.t==='order'){const i=+m.i;if(i>=-1&&i<MENU.length){
        if(i>=0&&p.role===0&&[...players.values()].some(q=>q.role===1)){if(QUEUE.filter(o=>o.to===p.id).length<2){QUEUE.push({to:p.id,i});all({t:'sys',text:p.name+' gọi '+MENU[i].n+' - chờ nhân viên bê ra'})}}
        else{give(p,i);if(i>=0)all({t:'sys',text:p.name+' gọi '+MENU[i].n})}}}
      else if(m.t==='act'&&now-p.act>450){p.act=now;const a=m.a,it=p.item,drink=it>=0&&(it<6||it===12),tg=players.get(+m.to);
        if(a==='put'&&it>=0&&!p.put){p.put=[Math.max(0,Math.min(960,+m.x||0)),Math.max(0,Math.min(600,+m.y||0))]}
        else if(a==='take'&&p.put)p.put=null;
        else if(a==='drink'&&drink&&p.lvl>0){p.lvl--;all({t:'act',id:p.id,a})}
        else if(a==='crack'&&(it===6||it===8)&&p.lvl>0){p.lvl--;all({t:'act',id:p.id,a})}
        else if(a==='smoke'&&it===14&&p.lvl>0){p.lvl--;all({t:'act',id:p.id,a})}
        else if(a==='pour'&&it===12&&p.bot>0&&p.lvl<4){p.bot--;p.lvl=4;all({t:'act',id:p.id,a})}
        else if(a==='smash'&&drink){p.cups++;all({t:'act',id:p.id,a});p.item=-1;p.lvl=0;p.put=null;all({t:'sys',text:p.name+' đập cốc "CHOANG!" 💥'})}
        else if(a==='hire'&&p.role===2&&tg&&tg!==p&&tg.role<2){tg.role=tg.role?0:1;tg.tray=null;all({t:'sys',text:tg.role?p.name+' nhận '+tg.name+' làm nhân viên 🍽':p.name+' cho '+tg.name+' nghỉ việc'})}
        else if(a==='draw'&&p.role===1){p.item=14;p.lvl=6;p.put=null;all({t:'sys',text:p.name+' rút điếu cày từ dưới quầy 🎋'})}
        else if(a==='zen'&&p.role===1){p.zen=now+6000;all({t:'sys',text:p.name+' tịnh tâm 🧘'})}
        else if(a==='serve'&&p.role===1){if(!p.tray){if(near(p,COUNTER,190)&&QUEUE.length)p.tray=QUEUE.shift()}
          else{const c=players.get(p.tray.to);if(!c)p.tray=null;else if(near(p,c,80)){give(c,p.tray.i);all({t:'sys',text:p.name+' bê '+MENU[p.tray.i].n+' cho '+c.name});p.tray=null}}}
        else if(a==='till'&&near(p,TILL,110)){const o=[...players.values()].find(q=>q.role===2),ok=p.role===2||(o&&now<o.stun&&o.stunBy===p.id);
          if(!ok)send(ws,{t:'sys',text:'Chỉ chủ quán (hoặc người vừa đập choáng chủ quán) mới mở được két'});
          else if(till>=100){till-=100;p.cash+=100;all({t:'sys',text:p.role===2?p.name+' mở két lấy 100k':p.name+' thừa lúc chủ quán choáng, thó 100k trong két! 💰'})}}
        else if(a==='chui'){if(tg&&tg.role===1&&now<tg.zen){tg.cash+=50;all({t:'sys',text:tg.name+' tịnh tâm không chấp, khách boa 50k 🧘'})}all({t:'chat',id:p.id,name:p.name,text:(tg&&tg!==p?'@'+tg.name+' ':'')+INS[Math.random()*INS.length|0]});all({t:'emo',id:p.id,e:'💢'})}
        else if(a==='whack'&&it===14&&!p.put){
          if(tg&&tg!==p&&near(p,tg,90)&&now>=tg.stun){all({t:'act',id:p.id,a,to:tg.id});
            if(now<tg.zen)all({t:'sys',text:tg.name+' đang tịnh tâm, đập không ăn thua 🧘'});
            else{tg.stun=now+10000;tg.stunBy=p.id;send(tg.ws,{t:'dizzy',title:'😵 Bạn bị choáng!',body:'Nằm im 10 giây, không đi đâu được.'});
              if(tg.role===2)all({t:'sys',text:'Chủ quán '+tg.name+' bị '+p.name+' đập choáng! Két đang hở 💰'});
              if(++p.hits===3){p.hits=0;send(ws,{t:'dizzy',title:'💸 Bạn đã phá quán!',body:'Phải đền bù 500k × ('+p.cups+' cốc đập + '+p.orders+' món gọi) = '+(500*(p.cups+p.orders)).toLocaleString('vi-VN')+'k'})}}}
          else all({t:'act',id:p.id,a})}}
      else if(m.t==='emo'&&EMO[+m.e]&&now-p.last>300){p.last=now;all({t:'emo',id:p.id,e:EMO[+m.e]})}
    }
  });
  ws.on('close',()=>{if(ws.p){if(ws.p.wp)endW(ws.p);players.delete(ws.p.id);QUEUE.splice(0,QUEUE.length,...QUEUE.filter(o=>o.to!==ws.p.id));
    if(ws.p.role===2){const n=[...players.values()].sort((a,b)=>a.id-b.id)[0];if(n){n.role=2;n.tray=null;all({t:'sys',text:'👑 '+n.name+' trở thành chủ quán mới'})}}
    if(!players.size){till=1000;QUEUE.length=0}all({t:'leave',id:ws.p.id,name:ws.p.name})}});
});
setInterval(()=>all({t:'s',p:[...players.values()].map(p=>[p.id,Math.round(p.x),Math.round(p.y),p.sit,p.item,p.lvl,p.put?Math.round(p.put[0]):-1,p.put?Math.round(p.put[1]):-1,p.bot,p.role,Date.now()<p.stun?1:0,p.tray?p.tray.i:-1,p.wp?1:0,Date.now()<p.zen?1:0,p.cash]),till}),100);
setInterval(()=>{const L=[...players.values()];if(QUEUE.length&&!L.some(q=>q.role===1))while(QUEUE.length){const o=QUEUE.shift(),c=players.get(o.to);if(c)give(c,o.i)}
  L.forEach(p=>{if(p.wp){const q=players.get(p.wp);if(!q||!near(p,q,230))endW(p)}})},500);
setInterval(()=>wss.clients.forEach(c=>{if(!c.alive)return c.terminate();c.alive=false;c.ping()}),25000);
server.listen(PORT,()=>console.log('Quán mở cửa tại http://localhost:'+PORT+(CODE?' (có mã phòng)':'')));
