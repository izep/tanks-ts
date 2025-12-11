(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function e(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(n){if(n.ep)return;n.ep=!0;const s=e(n);fetch(n.href,s)}})();const M={MORON:"MORON",SHOOTER:"SHOOTER",POOLSHARK:"POOLSHARK",TOSSER:"TOSSER",CHOOSER:"CHOOSER",SPOILER:"SPOILER",CYBORG:"CYBORG",UNKNOWN:"UNKNOWN"};class Ca{personality;actualPersonality;lastShotAngle=null;lastShotPower=null;constructor(t){if(this.personality=t,this.actualPersonality=t,t===M.UNKNOWN){const e=Object.values(M).filter(a=>a!==M.UNKNOWN);this.actualPersonality=e[Math.floor(Math.random()*e.length)]}}decideShot(t,e){const a=t.tanks[e],n=this.chooseTarget(t,e);if(!n)return{angle:Math.floor(Math.random()*120)+30,power:Math.floor(Math.random()*500)+300};switch(this.actualPersonality){case M.MORON:return this.moronShot();case M.SHOOTER:return this.shooterShot(a,n);case M.POOLSHARK:return this.poolsharkShot(a,n);case M.TOSSER:return this.tosserShot();case M.CHOOSER:return this.chooserShot(t,a,n);case M.SPOILER:return this.spoilerShot(t,a,n);case M.CYBORG:return this.cyborgShot(t,a,n);default:return{angle:45,power:500}}}chooseTarget(t,e){const a=t.tanks[e],n=t.tanks.filter((r,l)=>l!==e&&r.health>0);if(n.length===0)return null;if(this.actualPersonality===M.CYBORG){let r=n[0];for(const f of n)f.health<r.health&&(r=f);if(r.health<50)return r;let l=n[0];for(const f of n)f.credits>l.credits&&(l=f);if(l.credits>a.credits+500)return l}let s=n[0],o=1/0;return n.forEach(r=>{const l=Math.abs(r.x-a.x);l<o&&(o=l,s=r)}),s}moronShot(){return{angle:Math.floor(Math.random()*140)+20,power:Math.floor(Math.random()*700)+200}}shooterShot(t,e){const a=e.x-t.x,n=e.y-t.y;let s=90;a!==0&&(s=Math.atan2(-n,Math.abs(a))*(180/Math.PI)),s=Math.max(0,Math.min(180,Math.floor(s))),a<0&&(s=180-s);const o=Math.sqrt(a*a+n*n);let r=Math.floor(o*1.2);return r=Math.max(100,Math.min(1e3,r)),{angle:s,power:r}}poolsharkShot(t,e){return this.shooterShot(t,e)}tosserShot(){return this.lastShotAngle===null||this.lastShotPower===null?(this.lastShotAngle=Math.floor(Math.random()*120)+30,this.lastShotPower=Math.floor(Math.random()*400)+400):(this.lastShotAngle+=Math.floor(Math.random()*10)-5,this.lastShotPower+=Math.floor(Math.random()*100)-50,this.lastShotAngle=Math.max(10,Math.min(170,this.lastShotAngle)),this.lastShotPower=Math.max(100,Math.min(1e3,this.lastShotPower))),{angle:this.lastShotAngle,power:this.lastShotPower}}chooserShot(t,e,a){const n=Math.abs(a.x-e.x);return Math.abs(a.y-e.y)<50&&n<300?this.shooterShot(e,a):this.spoilerShot(t,e,a)}spoilerShot(t,e,a){const n=a.x-e.x,s=a.y-10-(e.y-10),o=t.gravity;let r=45,l=500,f=1/0;for(let c=20;c<160;c+=5){const u=c*(Math.PI/180),h=Math.abs(n),m=Math.cos(u),v=Math.tan(u);if(Math.abs(m)<.01)continue;const p=-s,b=h*v-p;if(b<=0)continue;const x=o*h*h/(2*m*m*b);if(x<0)continue;const E=Math.sqrt(x)*2;if(E<100||E>1e3)continue;const O=Math.abs(E-500);O<f&&(f=O,r=c,l=E)}return n<0&&(r=180-r),{angle:r,power:l}}cyborgShot(t,e,a){return this.spoilerShot(t,e,a)}}const I={SETUP:"SETUP",AIMING:"AIMING",PROJECTILE_FLYING:"PROJECTILE_FLYING",EXPLOSION:"EXPLOSION",TERRAIN_SETTLING:"TERRAIN_SETTLING",SHOP:"SHOP",GAME_OVER:"GAME_OVER"},Y={SCREEN_WIDTH:800,SCREEN_HEIGHT:600,GRAVITY:98},w={AIM_UP:"AIM_UP",AIM_DOWN:"AIM_DOWN",POWER_UP:"POWER_UP",POWER_DOWN:"POWER_DOWN",FIRE:"FIRE",NEXT_WEAPON:"NEXT_WEAPON",PREV_WEAPON:"PREV_WEAPON",MOVE_LEFT:"MOVE_LEFT",MOVE_RIGHT:"MOVE_RIGHT",TOGGLE_SHIELD:"TOGGLE_SHIELD"};class Fa{activeActions=new Set;triggeredActions=new Set;keysHeld=new Set;keyBindings=new Map;constructor(){this.setupDefaultBindings(),this.attachListeners()}setupDefaultBindings(){this.keyBindings.set("ArrowLeft",w.AIM_UP),this.keyBindings.set("ArrowRight",w.AIM_DOWN),this.keyBindings.set("ArrowUp",w.POWER_UP),this.keyBindings.set("ArrowDown",w.POWER_DOWN),this.keyBindings.set(" ",w.FIRE),this.keyBindings.set("Tab",w.NEXT_WEAPON),this.keyBindings.set("s",w.TOGGLE_SHIELD)}attachListeners(){window.addEventListener("keydown",t=>{this.keysHeld.add(t.key);const e=this.keyBindings.get(t.key);e!==void 0&&(this.activeActions.add(e),this.triggeredActions.add(e))}),window.addEventListener("keyup",t=>{this.keysHeld.delete(t.key);const e=this.keyBindings.get(t.key);e!==void 0&&this.activeActions.delete(e)})}isActionActive(t){return this.activeActions.has(t)}isActionTriggered(t){const e=this.triggeredActions.has(t);return e&&this.triggeredActions.delete(t),e}setInternalState(t,e){e?(this.activeActions.add(t),this.triggeredActions.add(t)):this.activeActions.delete(t)}handleInput(t,e){this.setInternalState(t,e)}}class _a{canvas;ctx;width;height;COLOR_DIRT="rgb(139, 69, 19)";terrainMask;dirtyColumns=new Set;constructor(t,e){this.width=t,this.height=e,this.canvas=document.createElement("canvas"),this.canvas.width=t,this.canvas.height=e,this.ctx=this.canvas.getContext("2d",{willReadFrequently:!0}),this.terrainMask=new Uint8Array(t*e)}generate(t){this.ctx.clearRect(0,0,this.width,this.height),this.terrainMask.fill(0),this.dirtyColumns.clear(),this.ctx.fillStyle=this.COLOR_DIRT,this.ctx.beginPath(),this.ctx.moveTo(0,this.height);const e=3+Math.random()*3,a=Math.random()*Math.PI*2;for(let n=0;n<this.width;n++){const s=n,o=s*.01*e+a,r=s*.02*e+a,l=Math.sin(o)*.5+Math.sin(r)*.25,f=this.height*.6,u=Math.floor(f-l*100);this.ctx.lineTo(n,u);for(let h=u;h<this.height;h++)h>=0&&(this.terrainMask[h*this.width+n]=1)}this.ctx.lineTo(this.width,this.height),this.ctx.closePath(),this.ctx.fill(),t.terrainDirty=!1}explode(t,e,a,n){this.ctx.globalCompositeOperation="destination-out",this.ctx.beginPath(),this.ctx.arc(e,a,n,0,Math.PI*2),this.ctx.fill(),this.ctx.globalCompositeOperation="source-over";const s=n*n,o=Math.max(0,Math.floor(e-n)),r=Math.min(this.width-1,Math.ceil(e+n)),l=Math.max(0,Math.floor(a-n)),f=Math.min(this.height-1,Math.ceil(a+n));for(let c=l;c<=f;c++)for(let u=o;u<=r;u++){const h=u-e,m=c-a;h*h+m*m<=s&&(this.terrainMask[c*this.width+u]=0)}for(let c=o;c<=r;c++)this.dirtyColumns.add(c);t.terrainDirty=!0}addTerrain(t,e,a,n){this.ctx.globalCompositeOperation="source-over",this.ctx.fillStyle=this.COLOR_DIRT,this.ctx.beginPath(),this.ctx.arc(e,a,n,0,Math.PI*2),this.ctx.fill();const s=n*n,o=Math.max(0,Math.floor(e-n)),r=Math.min(this.width-1,Math.ceil(e+n)),l=Math.max(0,Math.floor(a-n)),f=Math.min(this.height-1,Math.ceil(a+n));for(let c=l;c<=f;c++)for(let u=o;u<=r;u++){const h=u-e,m=c-a;h*h+m*m<=s&&(this.terrainMask[c*this.width+u]=1)}for(let c=o;c<=r;c++)this.dirtyColumns.add(c);t.terrainDirty=!0}getGroundY(t){if(t<0||t>=this.width)return this.height;t=Math.floor(t);for(let e=0;e<this.height;e++)if(this.terrainMask[e*this.width+t]===1)return e;return this.height}settle(t){if(this.dirtyColumns.size===0)return t.terrainDirty=!1,!1;const e=this.width,a=this.height;let n=!1;const s=this.ctx.getImageData(0,0,e,a),o=new Uint32Array(s.data.buffer),r=this.terrainMask,l=Array.from(this.dirtyColumns),f=new Set;for(const c of l){let u=!1;const h=20;for(let m=0;m<h;m++){let v=!1;for(let p=a-1;p>0;p--){const b=p*e+c,x=(p-1)*e+c;r[x]===1&&r[b]===0&&(r[b]=1,r[x]=0,o[b]=o[x],o[x]=0,v=!0,u=!0)}if(!v)break}u?n=!0:f.add(c)}for(const c of f)this.dirtyColumns.delete(c);return n?(this.ctx.putImageData(s,0,0),t.terrainDirty=!0):this.dirtyColumns.size===0&&(t.terrainDirty=!1),n}}const R=["baby_missile","missile","baby_nuke","nuke","mirv","death_head","dirt_bomb","digger","napalm","hot_napalm","funky_bomb","riot_bomb","segway","heavy_roller","leapfrog","fuel_can","shield","parachute","tracer"],_={baby_missile:{name:"Baby Missile",cost:0,radius:20,damage:50,color:"#FFFFFF",description:"Standard issue. Weak but infinite."},missile:{name:"Missile",cost:2e3,radius:40,damage:100,color:"#FFCC00",description:"Standard explosive."},nuke:{name:"Nuke",cost:2e4,radius:120,damage:500,color:"#FF4400",description:"Huge explosion. Dangerous."},mirv:{name:"MIRV",cost:1e4,radius:30,damage:80,color:"#FF00FF",description:"Splits into multiple warheads.",type:"mirv"},dirt_bomb:{name:"Dirt Bomb",cost:5e3,radius:50,damage:10,color:"#8B4513",description:"Creates terrain instead of destroying it.",type:"dirt"},funky_bomb:{name:"Funky Bomb",cost:15e3,radius:40,damage:150,color:"#00FF00",description:"Moves erratically."},segway:{name:"Roller",cost:5e3,radius:30,damage:100,color:"#00FFFF",description:"Rolls along the ground.",type:"roller"},baby_nuke:{name:"Baby Nuke",cost:5e3,radius:80,damage:200,color:"#FF6600",description:"Smaller nuke."},death_head:{name:"Death Head",cost:25e3,radius:150,damage:1e3,color:"#440000",description:"The ultimate weapon.",type:"mirv"},digger:{name:"Digger",cost:1e3,radius:5,damage:20,color:"#888888",description:"Digs a tunnel through terrain.",type:"digger"},napalm:{name:"Napalm",cost:5e3,radius:60,damage:40,color:"#FF2200",description:"Burns terrain and tanks.",type:"napalm"},hot_napalm:{name:"Hot Napalm",cost:1e4,radius:90,damage:80,color:"#FF8800",description:"More intense burn.",type:"napalm"},riot_bomb:{name:"Riot Bomb",cost:5e3,radius:60,damage:0,color:"#FFFFFF",description:"Creates dirt spheres (Inverse explosion).",type:"dirt"},heavy_roller:{name:"Heavy Roller",cost:1e4,radius:50,damage:200,color:"#008888",description:"A bigger, heavier roller.",type:"roller"},leapfrog:{name:"LeapFrog",cost:15e3,radius:30,damage:80,color:"#00AA00",description:"Bounces 3 times before exploding.",type:"bouncer"},fuel_can:{name:"Fuel (250)",cost:2e3,radius:0,damage:0,color:"#884400",description:"Restores fuel.",type:"item",effectValue:250},shield:{name:"Shield",cost:5e3,radius:0,damage:0,color:"#00FFFF",description:"Protects from damage.",type:"item",effectValue:1},parachute:{name:"Parachute",cost:1e3,radius:0,damage:0,color:"#FFFFFF",description:"Saves you from falls.",type:"item",effectValue:1},tracer:{name:"Tracer (5)",cost:500,radius:10,damage:20,color:"#FF0000",description:"Cheap, leaves a clear trail.",type:"missile"}};class La{terrainSystem;constructor(t){this.terrainSystem=t}update(t,e){t.phase===I.PROJECTILE_FLYING&&this.updateProjectiles(t,e),this.updateTanks(t,e),this.updateExplosions(t,e),t.tanks.forEach(a=>{a.sayTimer&&a.sayTimer>0&&(a.sayTimer-=e)})}updateProjectiles(t,e){const a=[],n=[];let s=!1;t.projectiles.forEach((r,l)=>{if(r.state==="rolling"){const c=this.terrainSystem.getGroundY(Math.floor(r.x)),h=this.terrainSystem.getGroundY(Math.floor(r.x+(r.vx>0?5:-5)))-c,m=r.vx>0?5:-5,v=Math.atan2(h,m),b=100*Math.sin(v),x=50;r.vx>0?r.vx-=x*e:r.vx<0&&(r.vx+=x*e),r.vx+=b*e*5,r.x+=r.vx*e;const A=this.terrainSystem.getGroundY(Math.floor(r.x));Math.abs(h)>10?(s=!0,a.push(l),this.triggerExplosion(t,r.x,r.y)):r.y=A,Math.abs(r.vx)<10&&(s=!0,a.push(l),this.triggerExplosion(t,r.x,r.y));for(const E of t.tanks){if(E.health<=0)continue;const O=r.x-E.x,k=r.y-(E.y-10);if(Math.sqrt(O*O+k*k)<20){s=!0,a.push(l),this.triggerExplosion(t,r.x,r.y);break}}}else if(r.weaponType==="digger"){r.vx+=t.wind*e*.1,r.vy+=t.gravity*e*10,r.x+=r.vx*e,r.y+=r.vy*e;const c=this.terrainSystem.getGroundY(Math.floor(r.x));r.y>c&&this.terrainSystem.explode(t,r.x,r.y,10)}else if(r.weaponType==="napalm_particle"){r.vy+=t.gravity*e*5,r.x+=r.vx*e,r.y+=r.vy*e;const c=this.terrainSystem.getGroundY(Math.floor(r.x));r.y>=c&&(s=!0,a.push(l),this.triggerExplosion(t,r.x,r.y,r,n))}else r.vx+=t.wind*e,r.vy+=t.gravity*e*10,r.x+=r.vx*e,r.y+=r.vy*e;if(!r.splitDone&&r.vy>0){if(r.weaponType==="mirv")r.splitDone=!0,[-50,50].forEach(u=>{n.push({id:crypto.randomUUID(),x:r.x,y:r.y,vx:r.vx+u,vy:r.vy,weaponType:"mirv",ownerId:r.ownerId,elapsedTime:0,trail:[],splitDone:!0,generation:(r.generation||0)+1})});else if(r.weaponType==="death_head"){r.splitDone=!0;const c=5;for(let u=0;u<c;u++){const h=-100+u*50;n.push({id:crypto.randomUUID(),x:r.x,y:r.y,vx:r.vx+h,vy:r.vy,weaponType:"baby_nuke",ownerId:r.ownerId,elapsedTime:0,trail:[],splitDone:!0})}a.push(l)}}r.elapsedTime+=e,r.trail.push({x:r.x,y:r.y});const f=r.weaponType==="tracer"?300:50;if(r.trail.length>f&&r.trail.shift(),this.checkCollision(t,r))if(r.weaponType==="segway"&&r.state!=="rolling"){r.state="rolling";const c=this.terrainSystem.getGroundY(Math.floor(r.x));r.y=c}else if(r.weaponType==="leapfrog")r.bounces=(r.bounces||0)+1,r.bounces<3?(r.vy=-Math.abs(r.vy)*.7,r.vx*=.8,r.y-=5):(s=!0,a.push(l),this.triggerExplosion(t,r.x,r.y,r,n));else if(r.weaponType==="digger")for(const c of t.tanks){const u=r.x-c.x,h=r.y-(c.y-10);if(Math.sqrt(u*u+h*h)<20){s=!0,a.push(l),this.triggerExplosion(t,r.x,r.y,r,n);break}}else r.weaponType!=="napalm_particle"&&(s=!0,a.push(l),this.triggerExplosion(t,r.x,r.y,r,n));(r.x<0||r.x>800||r.y>600)&&(r.state==="rolling"?(a.push(l),s=!0):(a.push(l),r.y>600&&(s=!0)))}),n.length>0&&t.projectiles.push(...n);const o=[...new Set(a)].sort((r,l)=>l-r);for(const r of o)t.projectiles.splice(r,1);t.projectiles.length===0&&s&&(t.phase=I.EXPLOSION,t.lastExplosionTime=performance.now())}checkCollision(t,e){const a=Math.floor(e.y),n=Math.floor(e.x);if(a<0)return!1;if(a>=600)return!0;if(e.weaponType==="digger")return!1;const s=this.terrainSystem.getGroundY(n);if(a>=s)return!0;for(const o of t.tanks){if(o.health<=0)continue;const r=e.x-o.x,l=e.y-(o.y-10);if(Math.sqrt(r*r+l*l)<15)return!0}return!1}triggerExplosion(t,e,a,n,s){const o=n?.weaponType||"missile",r=_[o]||_.missile,l=r.radius;if(r.type==="dirt")this.terrainSystem.addTerrain(t,e,a,l);else if(r.type==="napalm"&&s){for(let c=0;c<20;c++){const h=Math.random()*360*Math.PI/180,m=Math.random()*100+50;s.push({id:crypto.randomUUID(),x:e,y:a-10,vx:Math.cos(h)*m,vy:Math.sin(h)*m,weaponType:"napalm_particle",ownerId:n.ownerId||-1,elapsedTime:0,trail:[]})}this.terrainSystem.explode(t,e,a,20)}else o==="napalm_particle"?this.terrainSystem.explode(t,e,a,10):this.terrainSystem.explode(t,e,a,l);if(n&&n.weaponType==="funky_bomb"&&s)for(let c=0;c<5;c++){const u=Math.random()*180,h=100+Math.random()*200,m=u*Math.PI/180,v=h*.5;s.push({id:crypto.randomUUID(),x:e,y:a-10,vx:Math.cos(m)*v,vy:-Math.sin(m)*v,weaponType:"baby_missile",ownerId:n.ownerId||-1,elapsedTime:0,trail:[]})}o!=="digger"&&t.explosions.push({id:Math.random(),x:e,y:a,maxRadius:l*(o==="nuke"?1.5:1.2),currentRadius:0,duration:.5,elapsed:0,color:r.color||"orange"});const f=r.damage;f>0&&t.tanks.forEach(c=>{const u=c.x-e,h=c.y-10-a,m=Math.sqrt(u*u+h*h);if(m<l+10){let v=Math.floor(f*(1-m/(l+20)));if(v>0){if(c.activeShield&&c.shieldHealth&&c.shieldHealth>0){const p=Math.min(v,c.shieldHealth);c.shieldHealth-=p,v-=p,console.log(`Shield absorbed ${p} damage! Remaining Shield: ${c.shieldHealth} `),c.shieldHealth<=0&&(c.activeShield=void 0,console.log("Shield broken!"))}v>0&&(c.health-=v,console.log(`Tank ${c.name} took ${v} damage! Remaining: ${c.health}`),c.health<=0&&(c.isDead=!0,console.log(`Tank ${c.name} died!`),c.lastWords=["Ouch!","Nooo!","Darn!","Avenge me!"][Math.floor(Math.random()*4)],c.sayTimer=3))}}})}updateTanks(t,e){t.tanks.forEach(a=>{if(a.health<=0)return;const n=this.terrainSystem.getGroundY(Math.floor(a.x));if(a.y<n){if(a.isFalling=!0,a.vy+=t.gravity*e,a.hasLanded&&!a.isParachuteDeployed&&(a.accessories.parachute||0)>0&&a.vy>150&&(a.isParachuteDeployed=!0,a.accessories.parachute--,console.log("Parachute deployed mid-air!")),a.isParachuteDeployed&&a.vy>60&&(a.vy=Math.max(60,a.vy-300*e)),a.y+=a.vy*e,a.y>n){if(a.y=n,a.hasLanded===!1){a.hasLanded=!0,a.vy=0,a.isFalling=!1;return}let s=0;if(a.isParachuteDeployed)a.isParachuteDeployed=!1;else{const o=Math.max(0,(a.vy-100)/5);s=Math.floor(o)}s>0&&((a.accessories.parachute||0)>0&&s>=(a.parachuteThreshold||15)&&(a.accessories.parachute--,s=0,console.log("Emergency Parachute on impact!")),s>0&&(a.health-=s,console.log(`Fall damage: ${s}`),a.health<=0&&(a.isDead=!0,console.log(`Tank ${a.name} died from fall!`)))),a.vy=0,a.isFalling=!1,a.isParachuteDeployed=!1}}else a.y>n+2?(a.y=n,a.vy=0,a.isFalling=!1):(a.vy=0,a.isFalling=!1)})}updateExplosions(t,e){const a=[];t.explosions.forEach((n,s)=>{n.elapsed+=e,n.currentRadius=n.maxRadius*(n.elapsed/n.duration),n.elapsed>=n.duration&&a.push(s)});for(let n=a.length-1;n>=0;n--)t.explosions.splice(a[n],1);t.phase===I.EXPLOSION&&t.explosions.length===0&&(t.phase=I.TERRAIN_SETTLING,t.terrainDirty=!0)}nextTurn(t){if(t.tanks.filter(n=>n.health>0).length<=1){console.log("Round Over! (Physics)"),t.phase=I.SHOP;return}let a=(t.currentPlayerIndex+1)%t.tanks.length;for(;t.tanks[a].health<=0;)a=(a+1)%t.tanks.length;t.currentPlayerIndex=a,t.phase=I.AIMING}fireProjectile(t,e,a,n){const s=t.tanks[t.currentPlayerIndex];if(!s)return;const o=a*Math.PI/180,r=20,l=s.x+Math.cos(o)*r,f=s.y-Math.sin(o)*r,c=e*.5,u=Math.cos(o)*c,h=-Math.sin(o)*c,m={id:crypto.randomUUID(),x:l,y:f,vx:u,vy:h,weaponType:n,ownerId:s.id,elapsedTime:0,trail:[]};t.projectiles.push(m),s.variant===6&&(n==="baby_missile"||n==="missile")&&[-10,10].forEach(p=>{const b=(a+p)*Math.PI/180,x=Math.cos(b)*c,A=-Math.sin(b)*c;t.projectiles.push({id:crypto.randomUUID(),x:l,y:f,vx:x,vy:A,weaponType:n,ownerId:s.id,elapsedTime:0,trail:[]})}),t.phase=I.PROJECTILE_FLYING}}class Da{container;shopContainer=null;setupContainer=null;lastPhase=null;onBuyWeapon=()=>{};onNextRound=()=>{};onStartGame=()=>{};onRestartGame=()=>{};onAction=()=>{};constructor(){this.container=document.getElementById("ui-layer"),this.setupBaseUI(),this.bindLongPressControls()}setupBaseUI(){this.container.innerHTML=`
      <!-- Top Left HUD -->
      <div id="hud" class="hud-panel" style="position: absolute; top: 5px; left: 5px; min-width: 200px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <div style="font-size: 18px; font-weight: bold;" id="p-name">Player Name</div>
        </div>
        
        <div class="stat-row">
            <span class="stat-label"><i class="fa-solid fa-gear"></i> Angle</span>
            <span class="stat-value" id="p-angle">0</span>
        </div>
        <div class="stat-row">
            <span class="stat-label"><i class="fa-solid fa-bolt"></i> Power</span>
            <span class="stat-value" id="p-power">0</span>
        </div>
        <div class="stat-row">
            <span class="stat-label"><i class="fa-solid fa-bomb"></i> Weapon</span>
            <span class="stat-value" id="p-weapon" style="color: #4db8ff;">-</span>
        </div>
        <div class="stat-row">
            <span class="stat-label"><i class="fa-solid fa-heart"></i> Health</span>
            <span class="stat-value" id="p-health">100</span>
        </div>
        <div class="stat-row">
            <span class="stat-label"><i class="fa-solid fa-shield-alt"></i> Shield</span>
            <span class="stat-value" id="p-shield">100</span>
        </div>
        <div class="stat-row">
            <span class="stat-label"><i class="fa-solid fa-coins"></i> Credits</span>
            <span class="stat-value" id="p-credits" style="color: gold;">0</span>
        </div>
        <div class="stat-row">
            <span class="stat-label"><i class="fa-solid fa-wind"></i> Wind</span>
            <span class="stat-value" id="p-wind">0.0</span>
        </div>
      </div>
      
      <!-- ... Center Message ... -->
      <div id="turn-message" style="position: absolute; top: 30%; left: 50%; transform: translate(-50%, -50%); color: gold; display: none; pointer-events: none; text-align: center;">
      </div>
      
      <!-- ... D-Pad ... -->
      <div class="control-cluster bottom-left">
        <div class="d-pad-grid">
            <div></div>
            <div class="d-pad-btn" id="btn-up"><span>▲</span></div>
            <div></div>
            
            <div class="d-pad-btn" id="btn-left"><span>◀</span></div>
            <div class="d-pad-btn" id="btn-fire-small" style="font-size:12px;">🔥</div>
            <div class="d-pad-btn" id="btn-right"><span>▶</span></div>
            
            <div></div>
            <div class="d-pad-btn" id="btn-down"><span>▼</span></div>
            <div></div>
        </div>
      </div>

      <!-- Bottom Right Controls (Actions) -->
      <div class="control-cluster bottom-right">
        <div class="btn-circle btn-yellow" id="btn-weapon" title="Switch Weapon">
            <i class="fa-solid fa-bomb" style="font-size:32px;"></i>
        </div>
        <div class="btn-circle btn-blue" id="btn-shield" title="Shield">
            <i class="fa-solid fa-shield-alt" style="font-size:32px;"></i>
        </div>
      </div>
      
      <!-- Screens (Shop / Setup) -->
      <div id="shop-layer" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); color: white; padding: 20px; box-sizing: border-box; pointer-events: auto; overflow-y: auto;">
        <h1 style="text-align: center; color: gold; font-family: 'Inter', sans-serif;">Weapon Shop</h1>
        <div id="shop-player-status" style="margin-bottom: 20px; max-width: 800px; margin-left: auto; margin-right: auto; border-bottom: 1px solid #444; padding-bottom: 10px;"></div>
        <div id="shop-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; max-width: 1000px; margin: 0 auto;"></div>
        <div style="text-align: center; margin-top: 40px; margin-bottom: 40px;">
            <button id="btn-next-round" style="padding: 12px 40px; font-size: 18px; cursor: pointer; background: gold; border: none; color: black; font-weight: bold; border-radius: 4px;">Next Round</button>
        </div>
      </div>
    `,this.shopContainer=document.getElementById("shop-layer"),document.getElementById("btn-next-round")?.addEventListener("click",()=>{this.onNextRound()}),Object.entries({"btn-left":"ArrowLeft","btn-right":"ArrowRight","btn-up":"ArrowUp","btn-down":"ArrowDown","btn-fire":" ","btn-fire-small":" ","btn-weapon":"Tab","btn-pow-up":"PageUp","btn-pow-down":"PageDown"}).forEach(([o,r])=>{const l=document.getElementById(o);if(l){const f=c=>{window.dispatchEvent(new KeyboardEvent(c,{key:r,code:r===" "?"Space":r}))};l.addEventListener("mousedown",()=>f("keydown")),l.addEventListener("mouseup",()=>f("keyup")),l.addEventListener("mouseleave",()=>f("keyup")),l.addEventListener("touchstart",c=>{c.preventDefault(),f("keydown")}),l.addEventListener("touchend",c=>{c.preventDefault(),f("keyup")})}}),document.getElementById("btn-shield")?.addEventListener("click",()=>{}),window.addEventListener("keydown",o=>{this.shopContainer&&this.shopContainer.style.display==="block"?o.key==="Enter"&&this.onNextRound():document.getElementById("turn-message")?.style.display==="block"&&document.getElementById("turn-message")?.innerText.includes("GAME OVER")&&o.key==="Enter"&&this.onRestartGame()});const e=document.createElement("div");e.id="setup-layer",e.style.cssText="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #222; color: white; padding: 40px; text-align: center; pointer-events: auto;",e.innerHTML=`
            <h1>Setup Game</h1>
            <div style="margin: 20px;">
                <label>Player Count: <input type="number" id="setup-p-count" value="2" min="2" max="6" style="padding: 5px; width: 50px; text-align: center;"></label>
            </div>
            <div id="setup-players" style="margin: 20px; display: grid; grid-template-columns: 1fr; gap: 10px; max-height: 400px; overflow-y: auto;"></div>
            
            <div style="margin: 20px;">
                 <label>Rounds: <input type="number" id="setup-rounds" value="10" min="1" max="20" style="padding: 5px; width: 50px; text-align: center;"></label>
                 <br><br>
                 <label><input type="checkbox" id="setup-test-mode"> Test Mode (100 Weapons)</label>
            </div>

            <button id="btn-start-game" style="padding: 10px 20px; font-size: 20px; cursor: pointer;">START GAME</button>
        `,this.container.appendChild(e),this.setupContainer=e;const a=document.getElementById("setup-p-count"),n=document.getElementById("setup-players"),s=()=>{const o=parseInt(a.value)||2;n.innerHTML="";for(let r=0;r<o;r++){const l=document.createElement("div");l.style.cssText="display: flex; gap: 10px; align-items: center; justify-content: center; background: #333; padding: 10px; border-radius: 5px;",l.innerHTML=`
                    <span style="font-weight: bold; width: 20px;">${r+1}</span>
                    <input type="text" id="p-name-${r}" value="Player ${r+1}" placeholder="Name" style="padding: 5px; width: 100px;">
                    
                    <select id="p-type-${r}" style="padding: 5px;">
                        <option value="human" ${r===0?"selected":""}>Human</option>
                        <option value="ai" ${r>0?"selected":""}>AI</option>
                    </select>

                    <select id="p-ai-style-${r}" style="padding: 5px; display: ${r>0?"block":"none"};">
                        <option value="MORON">Moron</option>
                        <option value="SHOOTER">Shooter</option>
                        <option value="POOLSHARK">Poolshark</option>
                        <option value="TOSSER" selected>Tosser</option>
                        <option value="CHOOSER">Chooser</option>
                        <option value="SPOILER">Spoiler</option>
                        <option value="CYBORG">Cyborg</option>
                        <option value="UNKNOWN">Unknown</option>
                    </select>

                    <label>Tank: 
                        <select id="p-variant-${r}" style="padding: 5px;">
                            <option value="0">Classic</option>
                            <option value="1">Heavy</option>
                            <option value="2">Sci-Fi</option>
                            <option value="3">Hover</option>
                            <option value="4">Retro</option>
                            <option value="5">Spiky</option>
                            <option value="6">Triple Turret (AI)</option>
                        </select>
                    </label>
                `;const f=l.querySelector(`#p-type-${r}`),c=l.querySelector(`#p-ai-style-${r}`);f.onchange=()=>{c.style.display=f.value==="ai"?"block":"none"},n.appendChild(l)}};a.onchange=s,s(),document.getElementById("btn-start-game")?.addEventListener("click",()=>{const o=parseInt(document.getElementById("setup-p-count").value),r=parseInt(document.getElementById("setup-rounds").value)||10,l=[];for(let u=0;u<o;u++){const h=document.getElementById(`p-name-${u}`).value,m=document.getElementById(`p-type-${u}`).value,v=document.getElementById(`p-ai-style-${u}`).value,p=parseInt(document.getElementById(`p-variant-${u}`).value);l.push({name:h,isAi:m==="ai",aiPersonality:m==="ai"?v:void 0,variant:p})}const f=document.getElementById("setup-test-mode").checked,c={playerCount:o,rounds:r,players:l,testMode:f};this.onStartGame(c)})}handlePhaseChange(t){t.phase==="SHOP"?(this.shopContainer.style.display="block",this.buildShopGrid()):this.shopContainer.style.display="none",t.phase==="SETUP"?this.setupContainer.style.display="block":this.setupContainer.style.display="none"}buildShopGrid(){const t=document.getElementById("shop-grid");t.innerHTML="",R.forEach(e=>{const a=_[e],n=document.createElement("div");n.style.border="1px solid #444",n.style.padding="10px",n.style.backgroundColor="#222",n.style.cursor="pointer",n.innerHTML=`
                <div style="display: flex; align-items: center; margin-bottom: 5px;">
                    <img src="${this.getWeaponIconPath(e)}" style="width: 32px; height: 32px; margin-right: 8px;">
                    <div style="font-weight: bold; color: ${a.color}">${a.name}</div>
                </div>
                <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">${a.description}</div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="color: gold;">$${a.cost}</div>
                    <div id="shop-count-${e}" style="color: white;">x0</div>
                </div>
            `,n.onclick=()=>{this.onBuyWeapon(e)},t.appendChild(n)})}updateShopUI(t){const e=t.tanks[t.currentPlayerIndex];if(!e)return;const a=document.getElementById("shop-player-status");a.innerHTML=`
            <span style="font-size: 20px; color: ${e.color}">${e.name}</span>
            <span style="float: right; color: gold;">Credits: $${e.credits}</span>
        `;const n=document.getElementById("btn-next-round");n.innerText="Done Shopping / Next Round",R.forEach(s=>{const o=document.getElementById(`shop-count-${s}`);if(o){const r=e.inventory[s]||0;o.innerText=r===-1?"INF":`x${r}`}})}setupLongPress(t,e,a){const n=document.getElementById(t);if(!n)return;let s,o=!1;const r=500,l=()=>{o=!1,s=setTimeout(()=>{o=!0,a()},r)},f=()=>{clearTimeout(s),o||e()},c=()=>{clearTimeout(s)};n.addEventListener("mousedown",l),n.addEventListener("touchstart",l),n.addEventListener("mouseup",f),n.addEventListener("touchend",f),n.addEventListener("mouseleave",c),n.addEventListener("touchcancel",c)}bindLongPressControls(){this.setupLongPress("btn-weapon",()=>{window.dispatchEvent(new KeyboardEvent("keydown",{key:"Tab"})),setTimeout(()=>window.dispatchEvent(new KeyboardEvent("keyup",{key:"Tab"})),50)},()=>{this.showWeaponSelector()}),this.setupLongPress("btn-shield",()=>{window.dispatchEvent(new KeyboardEvent("keydown",{key:"s"})),setTimeout(()=>window.dispatchEvent(new KeyboardEvent("keyup",{key:"s"})),50)},()=>{this.showShieldSelector()})}showWeaponSelector(){const t=this.getTank();if(!t)return;const e=Object.keys(t.inventory).filter(a=>{const n=_[a];return n&&n.type!=="item"&&t.inventory[a]!==0});e.sort((a,n)=>R.indexOf(a)-R.indexOf(n)),this.renderSelector(e,a=>this.triggerWeaponSelect(a))}showShieldSelector(){const t=this.getTank();if(!t)return;const e=["shield","super_shield"].filter(a=>(t.accessories[a]||0)>0);if(e.length===0){console.log("No shields available");return}this.renderSelector(e,a=>this.triggerShieldSelect(a))}renderSelector(t,e){const a=document.getElementById("selector-overlay");a&&document.body.removeChild(a);const n=document.createElement("div");n.id="selector-overlay",n.style.cssText="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 3000; display: flex; flex-direction: column; align-items: center; justify-content: center;",n.onclick=r=>{r.target===n&&document.body.removeChild(n)};const s=document.createElement("h2");s.innerText="Select Item",s.style.color="gold",n.appendChild(s);const o=document.createElement("div");o.style.cssText="background: #222; border: 1px solid #555; padding: 20px; border-radius: 10px; max-width: 90%; max-height: 70vh; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.5);",t.forEach(r=>{const l=_[r];if(!l)return;const f=this._lastState?.tanks[this._lastState.currentPlayerIndex];let c=0;f&&(f.inventory[r]!==void 0?c=f.inventory[r]:f.accessories[r]!==void 0&&(c=f.accessories[r]));const u=document.createElement("div");u.style.cssText="display: flex; flex-direction: column; align-items: center; padding: 8px; border: 1px solid #444; border-radius: 4px; cursor: pointer; background: #333; transition: all 0.2s;",u.innerHTML=`
                <img src="${this.getWeaponIconPath(r)}" style="width: 48px; height: 48px; margin-bottom: 5px;">
                <span style="font-size: 12px; font-weight: bold; color: ${l.color}; text-align: center;">${l.name}</span>
                <span style="font-size: 10px; color: #ccc;">${c===-1?"INF":"x"+c}</span>
            `,u.onmouseover=()=>u.style.background="#444",u.onmouseout=()=>u.style.background="#333",u.onclick=()=>{e(r),document.body.removeChild(n)},o.appendChild(u)}),n.appendChild(o),document.body.appendChild(n)}_lastState=null;update(t){this._lastState=t,this.lastPhase!==t.phase&&(this.handlePhaseChange(t),this.lastPhase=t.phase);const e=t.tanks[t.currentPlayerIndex];if(e){document.getElementById("p-name").innerText=e.name;const n=e.angle<=90?e.angle:180-e.angle;document.getElementById("p-angle").innerText=Math.floor(n).toString(),document.getElementById("p-power").innerText=Math.floor(e.power).toString(),document.getElementById("p-health").innerText=Math.floor(e.health).toString();const s=document.getElementById("p-shield")?.parentElement;if(s){const h=e.accessories.shield||0,m=e.activeShield!==void 0;if(h<=0&&!m)s.style.display="none";else{s.style.display="flex";const v=m?'<i class="fa-solid fa-shield-alt" style="color:cyan"></i>':'<i class="fa-solid fa-shield-alt"></i>',p=document.getElementById("p-shield");if(p.innerHTML=`${v} `,m){const b=document.createTextNode(`${Math.floor(e.shieldHealth||0)} (ON)`);p.appendChild(b),p.style.color="cyan"}else{const b=document.createTextNode(`${h}`);p.appendChild(b),p.style.color="white"}}}document.getElementById("p-credits").innerText=e.credits.toString(),document.getElementById("p-wind").innerText=t.wind.toFixed(1);const o=e.currentWeapon||"missile",r=_[o],l=r?.name||o,f=this.getWeaponIconPath(o),c=document.getElementById("p-weapon");c.innerHTML=`<img src="${f}" style="width:24px;height:24px;vertical-align:middle; margin-right:5px;"> ${l}`,c.style.color=r?.color||"#4db8ff";const u=document.getElementById("btn-shield");if(u){const h=e.accessories.shield||0,m=e.activeShield!==void 0;h>0||m?(u.style.opacity="1",u.style.filter="none",u.style.cursor="pointer"):(u.style.opacity="0.3",u.style.filter="grayscale(100%)",u.style.cursor="default")}}const a=document.getElementById("turn-message");if(t.phase==="GAME_OVER"){let n="GAME OVER";const s=t.tanks.filter(o=>!o.isDead&&o.health>0);s.length===1?n=`${s[0].name} WINS!`:s.length>1?n=`${[...s].sort((r,l)=>l.credits-r.credits)[0].name} WINS!(Most Credits)`:n="DRAW!",a.innerHTML=`${n}<br><br><span style="font-size:16px; color: white;">Press ENTER to Restart</span>`,a.style.display="block"}else a.style.display="none";t.phase==="SHOP"&&this.updateShopUI(t)}getTank(){return this._lastState?this._lastState.tanks[this._lastState.currentPlayerIndex]:null}getWeaponIconPath(t){return t==="death_head"?"/src/assets/weapons/deaths_head.svg":t==="dirt_bomb"?"/src/assets/weapons/dirt_ball.svg":t==="segway"?"/src/assets/weapons/roller.svg":t==="leapfrog"?"/src/assets/weapons/leap_frog.svg":t==="shield"?"/src/assets/misc/shield.svg":t==="parachute"?"/src/assets/misc/parachute.svg":t==="fuel_can"?"/src/assets/misc/fuel_tank.svg":`/src/assets/weapons/${t}.svg`}triggerWeaponSelect(t){this.onSetWeapon&&this.onSetWeapon(t)}onSetWeapon=()=>{};triggerShieldSelect(t){this.onSetShield&&this.onSetShield(t)}onSetShield=()=>{}}class $a{ctx;masterGain;constructor(){const t=window.AudioContext||window.webkitAudioContext;this.ctx=new t,this.masterGain=this.ctx.createGain(),this.masterGain.gain.value=.3,this.masterGain.connect(this.ctx.destination)}createOscillator(t,e,a,n=.5){this.ctx.state==="suspended"&&this.ctx.resume();const s=this.ctx.createOscillator(),o=this.ctx.createGain();s.type=t,s.frequency.setValueAtTime(e,this.ctx.currentTime),o.gain.setValueAtTime(n,this.ctx.currentTime),o.gain.exponentialRampToValueAtTime(.01,this.ctx.currentTime+a),s.connect(o),o.connect(this.masterGain),s.start(),s.stop(this.ctx.currentTime+a)}playFire(){const t=this.ctx.createOscillator(),e=this.ctx.createGain();t.type="triangle",t.frequency.setValueAtTime(400,this.ctx.currentTime),t.frequency.exponentialRampToValueAtTime(100,this.ctx.currentTime+.2),e.gain.setValueAtTime(.3,this.ctx.currentTime),e.gain.exponentialRampToValueAtTime(.01,this.ctx.currentTime+.2),t.connect(e),e.connect(this.masterGain),t.start(),t.stop(this.ctx.currentTime+.2)}playExplosion(){const t=this.ctx.createOscillator(),e=this.ctx.createGain();t.type="sawtooth",t.frequency.setValueAtTime(100,this.ctx.currentTime),t.frequency.exponentialRampToValueAtTime(10,this.ctx.currentTime+.5),e.gain.setValueAtTime(.5,this.ctx.currentTime),e.gain.exponentialRampToValueAtTime(.01,this.ctx.currentTime+.5),t.connect(e),e.connect(this.masterGain),t.start(),t.stop(this.ctx.currentTime+.5)}playHit(){this.createOscillator("sine",800,.1,.2)}playUI(){this.createOscillator("sine",600,.05,.1)}}class Wa{canvas;ctx;terrainSystem;tankSpriteCache={};CLASSIC_BODY='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 32 32"><rect x="6" y="24" width="20" height="6" fill="#808080" /><rect x="8" y="24" width="3" height="2" fill="#505050" /><rect x="14" y="24" width="3" height="2" fill="#505050" /><rect x="20" y="24" width="3" height="2" fill="#505050" /><polygon points="2,20 30,20 28,24 4,24" fill="#MAIN" /><polygon points="4,16 28,16 30,20 2,20" fill="#DARK" /></svg>';CLASSIC_TURRET='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 32 32"><rect x="10" y="12" width="12" height="6" fill="#MAIN" /><rect x="11" y="13" width="10" height="4" fill="#DARK" /><rect x="20" y="13" width="10" height="3" fill="#MAIN" /><rect x="28" y="12" width="2" height="5" fill="#800000" /></svg>';HEAVY_BODY='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 32 32"><rect x="2" y="22" width="28" height="8" fill="#404040" /><rect x="4" y="24" width="4" height="4" fill="#202020" /><rect x="14" y="24" width="4" height="4" fill="#202020" /><rect x="24" y="24" width="4" height="4" fill="#202020" /><rect x="0" y="18" width="32" height="6" fill="#MAIN" /><rect x="4" y="14" width="24" height="4" fill="#DARK" /></svg>';HEAVY_TURRET='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 32 32"><rect x="8" y="10" width="16" height="8" fill="#MAIN" /><rect x="9" y="11" width="14" height="6" fill="#DARK" /><rect x="24" y="12" width="8" height="4" fill="#MAIN" /><rect x="30" y="11" width="2" height="6" fill="#800000" /></svg>';SCIFI_BODY='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 32 32"><path d="M4 24 Q16 30 28 24 L26 20 Q16 26 6 20 Z" fill="#MAIN" /><ellipse cx="16" cy="18" rx="10" ry="4" fill="#DARK" /></svg>';SCIFI_TURRET='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 32 32"><path d="M10 14 Q16 10 22 14 L28 14 L28 16 L22 16 Q16 20 10 16 Z" fill="#MAIN" /><circle cx="16" cy="15" r="3" fill="#DARK" /></svg>';HOVER_BODY='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 32 32"><ellipse cx="16" cy="22" rx="12" ry="3" fill="#00FFFF" opacity="0.5" /><path d="M6 20 L26 20 L24 14 L8 14 Z" fill="#MAIN" /><rect x="10" y="12" width="12" height="2" fill="#DARK" /></svg>';HOVER_TURRET='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 32 32"><circle cx="16" cy="16" r="6" fill="#MAIN" /><rect x="22" y="15" width="8" height="2" fill="#MAIN" /><circle cx="16" cy="16" r="3" fill="#DARK" /></svg>';RETRO_BODY='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 32 32"><rect x="4" y="24" width="4" height="4" fill="#000" /><rect x="12" y="24" width="4" height="4" fill="#000" /><rect x="20" y="24" width="4" height="4" fill="#000" /><rect x="4" y="20" width="24" height="4" fill="#MAIN" /><rect x="8" y="16" width="16" height="4" fill="#MAIN" /><rect x="10" y="16" width="4" height="4" fill="#DARK" /></svg>';RETRO_TURRET='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 32 32"><rect x="12" y="12" width="8" height="4" fill="#MAIN" /><rect x="20" y="14" width="8" height="2" fill="#MAIN" /><rect x="14" y="12" width="2" height="2" fill="#DARK" /></svg>';SPIKY_BODY='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 32 32"><polygon points="6,28 10,22 14,28 18,22 22,28 26,22 30,28" fill="#505050" /><path d="M2 22 L10 16 L16 20 L22 16 L30 22 L16 26 Z" fill="#MAIN" /><polygon points="12,18 16,14 20,18" fill="#DARK" /></svg>';SPIKY_TURRET='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 32 32"><polygon points="10,14 20,10 20,18" fill="#MAIN" /><rect x="20" y="13" width="10" height="2" fill="#MAIN" /><polygon points="30,12 32,14 30,16" fill="#800000" /></svg>';PARACHUTE_IMG='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24"><path d="M 4 12 A 8 8 0 0 1 20 12" fill="#ffffff" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" /><line x1="4" y1="12" x2="12" y2="20" stroke="#000000" stroke-width="1" stroke-linecap="round" /><line x1="20" y1="12" x2="12" y2="20" stroke="#000000" stroke-width="1" stroke-linecap="round" /><line x1="12" y1="4" x2="12" y2="20" stroke="#000000" stroke-width="1" stroke-linecap="round" /><rect x="10" y="20" width="4" height="4" fill="#000000" /></svg>';TRIPLE_BODY='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 32 32"><rect x="2" y="22" width="28" height="8" fill="#202020" /><rect x="0" y="18" width="32" height="6" fill="#MAIN" /><rect x="4" y="14" width="24" height="4" fill="#DARK" /></svg>';TRIPLE_TURRET='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 32 32"><rect x="14" y="10" width="4" height="8" fill="#MAIN" /><rect x="8" y="12" width="4" height="6" fill="#MAIN" /><rect x="20" y="12" width="4" height="6" fill="#MAIN" /><rect x="10" y="14" width="12" height="4" fill="#DARK" /></svg>';COLOR_MAP={red:{main:"#FF0000",dark:"#CC0000"},blue:{main:"#4444FF",dark:"#000088"},green:{main:"#00CC00",dark:"#006600"},yellow:{main:"#FFFF00",dark:"#CCCC00"},purple:{main:"#9900CC",dark:"#660099"},cyan:{main:"#00FFFF",dark:"#008888"},white:{main:"#FFFFFF",dark:"#BBBBBB"}};constructor(t,e){this.canvas=t,this.ctx=t.getContext("2d",{alpha:!1}),this.terrainSystem=e}render(t){this.ctx.fillStyle="#87CEEB",this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height),this.ctx.drawImage(this.terrainSystem.canvas,0,0),t.tanks.forEach(e=>{e.health>0&&this.drawTankSprite(e)}),t.projectiles.forEach(e=>{this.drawProjectile(e)}),t.explosions.forEach(e=>{this.drawExplosion(e)})}getTankSprites(t,e=0){const a=`${t}-${e}`;if(this.tankSpriteCache[a])return this.tankSpriteCache[a];const n=this.COLOR_MAP[t]||this.COLOR_MAP.white;let s=this.CLASSIC_BODY,o=this.CLASSIC_TURRET;switch(e){case 1:s=this.HEAVY_BODY,o=this.HEAVY_TURRET;break;case 2:s=this.SCIFI_BODY,o=this.SCIFI_TURRET;break;case 3:s=this.HOVER_BODY,o=this.HOVER_TURRET;break;case 4:s=this.RETRO_BODY,o=this.RETRO_TURRET;break;case 4:s=this.RETRO_BODY,o=this.RETRO_TURRET;break;case 5:s=this.SPIKY_BODY,o=this.SPIKY_TURRET;break;case 6:s=this.TRIPLE_BODY,o=this.TRIPLE_TURRET;break}const r=s.replace(/#MAIN/g,n.main).replace(/#DARK/g,n.dark),l=new Blob([r],{type:"image/svg+xml"}),f=URL.createObjectURL(l),c=new Image;c.src=f;const u=o.replace(/#MAIN/g,n.main).replace(/#DARK/g,n.dark),h=new Blob([u],{type:"image/svg+xml"}),m=URL.createObjectURL(h),v=new Image;return v.src=m,this.tankSpriteCache[a]={body:c,turret:v},this.tankSpriteCache[a]}drawTankSprite(t){const e=this.getTankSprites(t.color,t.variant);if(!e.body.complete||!e.turret.complete)return;this.ctx.save();const a=32,n=t.x-a/2,s=t.y-a+5;this.ctx.drawImage(e.body,n,s,a,a),this.ctx.save(),this.ctx.translate(t.x,t.y-12),this.ctx.rotate(-t.angle*Math.PI/180),this.ctx.drawImage(e.turret,-16,-16,a,a),this.ctx.restore();const o=-35;if(this.ctx.translate(t.x,t.y),this.ctx.fillStyle="red",this.ctx.fillRect(-15,o,30,4),this.ctx.fillStyle="#0f0",this.ctx.fillRect(-15,o,30*(t.health/100),4),t.activeShield&&t.shieldHealth&&t.shieldHealth>0&&(this.ctx.strokeStyle="cyan",this.ctx.lineWidth=2,this.ctx.shadowColor="cyan",this.ctx.shadowBlur=10,this.ctx.globalAlpha=.6,this.ctx.beginPath(),this.ctx.arc(0,-10,25,0,Math.PI*2),this.ctx.stroke()),this.ctx.restore(),t.sayTimer&&t.sayTimer>0&&t.lastWords){this.ctx.save(),this.ctx.font='12px "Press Start 2P", sans-serif',this.ctx.textAlign="center",this.ctx.textBaseline="bottom";const r=t.lastWords,l=t.x,f=t.y-45,h=this.ctx.measureText(r).width+5*2,m=20;this.ctx.fillStyle="white",this.ctx.beginPath(),this.ctx.roundRect(l-h/2,f-m,h,m,5),this.ctx.fill(),this.ctx.beginPath(),this.ctx.moveTo(l,f),this.ctx.lineTo(l-5,f),this.ctx.lineTo(l,f+5),this.ctx.fill(),this.ctx.fillStyle="black",this.ctx.fillText(r,l,f-5),this.ctx.restore()}if(t.isParachuteDeployed){const l=t.x-20,f=t.y-a-40+10,c=this.getParachuteImage();c.complete&&this.ctx.drawImage(c,l,f,40,40)}}_parachuteImage=null;getParachuteImage(){if(!this._parachuteImage){const t=new Blob([this.PARACHUTE_IMG],{type:"image/svg+xml"}),e=URL.createObjectURL(t);this._parachuteImage=new Image,this._parachuteImage.src=e}return this._parachuteImage}drawProjectile(t){if(this.ctx.save(),t.trail.length>1){this.ctx.beginPath(),this.ctx.moveTo(t.trail[0].x,t.trail[0].y);for(let s=1;s<t.trail.length;s++)this.ctx.lineTo(t.trail[s].x,t.trail[s].y);this.ctx.strokeStyle="rgba(255, 255, 255, 0.5)",this.ctx.lineWidth=2,this.ctx.stroke()}this.ctx.translate(t.x,t.y);const e=Math.atan2(t.vy,t.vx);this.ctx.rotate(e);const a=t.weaponType||"missile",n=_[a]?.color||"white";this.ctx.fillStyle=n,this.ctx.beginPath(),this.ctx.arc(0,0,3,0,Math.PI*2),this.ctx.fill(),this.ctx.restore()}drawExplosion(t){this.ctx.save(),this.ctx.globalAlpha=1-t.elapsed/t.duration,this.ctx.fillStyle=t.color,this.ctx.beginPath(),this.ctx.arc(t.x,t.y,t.currentRadius,0,Math.PI*2),this.ctx.fill(),this.ctx.fillStyle="white",this.ctx.beginPath(),this.ctx.arc(t.x,t.y,t.currentRadius*.7,0,Math.PI*2),this.ctx.fill(),this.ctx.restore()}}class Ba{canvas;isRunning=!1;lastTime=0;aiTurnTimer=0;AI_TURN_DELAY=1;inputHoldTime=0;state;inputManager;terrainSystem;physicsSystem;uiManager;soundManager;renderSystem;constructor(t){this.canvas=t,this.inputManager=new Fa,this.state={phase:I.SETUP,tanks:[],projectiles:[],explosions:[],currentPlayerIndex:0,roundNumber:1,maxRounds:10,wind:0,gravity:Y.GRAVITY,terrainDirty:!1,lastExplosionTime:0},this.canvas.width=Y.SCREEN_WIDTH,this.canvas.height=Y.SCREEN_HEIGHT,this.terrainSystem=new _a(Y.SCREEN_WIDTH,Y.SCREEN_HEIGHT),this.physicsSystem=new La(this.terrainSystem),this.uiManager=new Da,this.soundManager=new $a,this.renderSystem=new Wa(this.canvas,this.terrainSystem),this.terrainSystem.generate(this.state),this.uiManager.onBuyWeapon=e=>this.handleBuyWeapon(e),this.uiManager.onNextRound=()=>this.handleNextRound(),this.uiManager.onStartGame=e=>this.handleStartGame(e),this.uiManager.onSetWeapon=e=>this.handleSetWeapon(e),this.uiManager.onSetShield=e=>this.handleSetShield(e),this.uiManager.onRestartGame=()=>{console.log("Restarting Game..."),this.state.phase=I.SETUP,this.soundManager.playUI()},this.uiManager.onAction=(e,a)=>{const n=w[e];n&&this.inputManager.handleInput(n,a)}}start(){this.isRunning=!0,this.lastTime=performance.now(),requestAnimationFrame(this.gameLoop.bind(this)),requestAnimationFrame(this.gameLoop.bind(this))}gameLoop(t){if(!this.isRunning)return;const e=(t-this.lastTime)/1e3;this.lastTime=t,this.update(e),this.render(),requestAnimationFrame(this.gameLoop.bind(this))}update(t){if(this.state.phase===I.AIMING){const e=this.state.tanks[this.state.currentPlayerIndex];e&&(e.isAi?this.handleAiTurn(t):this.handleAimingInput(t))}if(this.physicsSystem.update(this.state,t),(this.state.phase===I.TERRAIN_SETTLING||this.state.terrainDirty)&&!this.terrainSystem.settle(this.state)&&this.state.phase===I.TERRAIN_SETTLING){console.log("Settling done, calling nextTurn");const a=this.state.tanks.filter(n=>!n.isDead&&n.health>0);if(a.length<=1){if(a.length===1){const n=a[0];n.credits+=1e3,console.log(`Round Winner: ${n.name}`)}this.state.roundNumber>=this.state.maxRounds?(console.log("Game Over - Max rounds reached"),this.state.phase=I.GAME_OVER,this.soundManager.playUI()):(console.log("Round Over - Going to Shop"),this.state.phase=I.SHOP)}else this.physicsSystem.nextTurn(this.state)}this.state.phase,I.SHOP}handleAimingInput(t){const e=this.state.tanks[this.state.currentPlayerIndex];if(!e)return;this.inputManager.isActionActive(w.AIM_UP)||this.inputManager.isActionActive(w.AIM_DOWN)||this.inputManager.isActionActive(w.POWER_UP)||this.inputManager.isActionActive(w.POWER_DOWN)?this.inputHoldTime+=t:this.inputHoldTime=0;const a=this.inputHoldTime>.5?4:1;if(this.inputManager.isActionActive(w.AIM_UP)&&(e.angle=Math.min(180,e.angle+20*t*a)),this.inputManager.isActionActive(w.AIM_DOWN)&&(e.angle=Math.max(0,e.angle-20*t*a)),this.inputManager.isActionActive(w.POWER_UP)&&(e.power=Math.min(3e3,e.power+100*t*a)),this.inputManager.isActionActive(w.POWER_DOWN)&&(e.power=Math.max(0,e.power-100*t*a)),this.inputManager.isActionTriggered(w.NEXT_WEAPON)){let s=(R.indexOf(e.currentWeapon)+1)%R.length,o=0;for(;(!e.inventory[R[s]]||e.inventory[R[s]]===0)&&o<R.length;)s=(s+1)%R.length,o++;e.currentWeapon=R[s],console.log("Switched to",e.currentWeapon)}if(this.inputManager.isActionTriggered(w.TOGGLE_SHIELD)&&(e.activeShield?(console.log("Deactivating Shield"),e.activeShield=void 0,e.shieldHealth=0):e.accessories.shield>0?(console.log("Activating Shield"),e.accessories.shield--,e.activeShield="shield",e.shieldHealth=200):console.log("No shields!")),this.inputManager.isActionTriggered(w.FIRE)&&this.state.projectiles.length===0){if(console.log("Fire!"),this.soundManager.playFire(),Math.random()<.3){const n=["Eat this!","Take cover!","Incoming!","Bye bye!"];e.lastWords=n[Math.floor(Math.random()*n.length)],e.sayTimer=2}this.physicsSystem.fireProjectile(this.state,e.power,e.angle,e.currentWeapon)}}handleAiTurn(t){const e=this.state.tanks[this.state.currentPlayerIndex];if(!(!e||!e.aiController)&&(this.aiTurnTimer+=t,this.aiTurnTimer>=this.AI_TURN_DELAY)){this.aiTurnTimer=0;const a=e.aiController.decideShot(this.state,this.state.currentPlayerIndex);if(e.angle=a.angle,e.power=a.power,this.soundManager.playFire(),Math.random()<.5){const n=["Calculating...","Target Acquired","Exterminate!","Logic demands death"];e.lastWords=n[Math.floor(Math.random()*n.length)],e.sayTimer=2}this.physicsSystem.fireProjectile(this.state,e.power,e.angle,e.currentWeapon)}}handleBuyWeapon(t){const e=this.state.tanks[this.state.currentPlayerIndex],a=_[t];if(e.credits>=a.cost){if(a.type==="item"){e.credits-=a.cost,this.soundManager.playUI(),t==="fuel_can"?(e.fuel+=a.effectValue||250,console.log(`Bought Fuel. Current: ${e.fuel}`)):t==="shield"?(e.accessories.shield=(e.accessories.shield||0)+(a.effectValue||1),console.log(`Bought Shield. Count: ${e.accessories.shield}`)):t==="parachute"&&(e.accessories.parachute=(e.accessories.parachute||0)+(a.effectValue||1),console.log(`Bought Parachute. Count: ${e.accessories.parachute}`));return}if(e.inventory[t]===-1){this.soundManager.playUI();return}e.credits-=a.cost,e.inventory[t]=(e.inventory[t]||0)+1,this.soundManager.playUI()}}handleSetWeapon(t){const e=this.state.tanks[this.state.currentPlayerIndex];e&&e.inventory[t]!==void 0&&e.inventory[t]!==0&&(e.currentWeapon=t,this.soundManager.playUI())}handleSetShield(t){const e=this.state.tanks[this.state.currentPlayerIndex];e&&(e.accessories[t]||0)>0&&(e.activeShield?e.activeShield!==t&&(e.activeShield=t,e.shieldHealth=t==="super_shield"?400:200):(e.activeShield=t,e.shieldHealth=t==="super_shield"?400:200),this.soundManager.playUI())}handleNextRound(){if(this.state.roundNumber>=this.state.maxRounds){console.log("Max rounds reached - Game Over"),this.state.phase=I.GAME_OVER,this.soundManager.playUI();return}this.state.phase=I.AIMING,this.state.roundNumber++,this.state.wind=Math.random()*200-100,console.log(`Wind changed to: ${this.state.wind.toFixed(1)}`),this.terrainSystem.generate(this.state),this.state.tanks.forEach((t,e)=>{t.x=100+e*400,t.y=100,t.health=100,t.isDead=!1,t.hasLanded=!1}),this.state.currentPlayerIndex=0,this.soundManager.playUI()}handleStartGame(t){const e=["red","blue","green","yellow","purple","cyan"];this.state.tanks=[];const a=Y.SCREEN_WIDTH/t.playerCount;t.players.forEach((n,s)=>{let o,r;if(n.isAi){const l=n.aiPersonality;r=M[l]||M.UNKNOWN,o=new Ca(r)}this.state.tanks.push({id:s+1,name:n.name||`Player ${s+1}`,x:a*s+a/2,y:100,vy:0,angle:90,power:600,health:100,fuel:250,color:e[s%e.length],variant:n.variant||0,isAi:n.isAi,aiPersonality:r,aiController:o,isFalling:!0,hasLanded:!1,parachuteThreshold:15,isDead:!1,credits:0,currentWeapon:"baby_missile",inventory:n.testMode||t.testMode?this.getTestInventory():{missile:-1,baby_missile:-1},accessories:{parachute:t.testMode?10:0}})}),this.state.maxRounds=t.rounds||10,this.state.phase=I.AIMING,this.state.wind=Math.random()*200-100,console.log(`Initial Wind: ${this.state.wind.toFixed(1)}`),this.terrainSystem.generate(this.state),this.soundManager.playUI()}getTestInventory(){const t={};return R.forEach(e=>{_[e].cost===0?t[e]=-1:t[e]=100}),t}render(){this.renderSystem.render(this.state),this.uiManager.update(this.state)}}function Tt(i,t){(t==null||t>i.length)&&(t=i.length);for(var e=0,a=Array(t);e<t;e++)a[e]=i[e];return a}function Ua(i){if(Array.isArray(i))return i}function Ha(i){if(Array.isArray(i))return Tt(i)}function za(i,t){if(!(i instanceof t))throw new TypeError("Cannot call a class as a function")}function Ga(i,t){for(var e=0;e<t.length;e++){var a=t[e];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(i,Oe(a.key),a)}}function Ya(i,t,e){return t&&Ga(i.prototype,t),Object.defineProperty(i,"prototype",{writable:!1}),i}function ot(i,t){var e=typeof Symbol<"u"&&i[Symbol.iterator]||i["@@iterator"];if(!e){if(Array.isArray(i)||(e=Ut(i))||t){e&&(i=e);var a=0,n=function(){};return{s:n,n:function(){return a>=i.length?{done:!0}:{done:!1,value:i[a++]}},e:function(l){throw l},f:n}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var s,o=!0,r=!1;return{s:function(){e=e.call(i)},n:function(){var l=e.next();return o=l.done,l},e:function(l){r=!0,s=l},f:function(){try{o||e.return==null||e.return()}finally{if(r)throw s}}}}function y(i,t,e){return(t=Oe(t))in i?Object.defineProperty(i,t,{value:e,enumerable:!0,configurable:!0,writable:!0}):i[t]=e,i}function Va(i){if(typeof Symbol<"u"&&i[Symbol.iterator]!=null||i["@@iterator"]!=null)return Array.from(i)}function Ka(i,t){var e=i==null?null:typeof Symbol<"u"&&i[Symbol.iterator]||i["@@iterator"];if(e!=null){var a,n,s,o,r=[],l=!0,f=!1;try{if(s=(e=e.call(i)).next,t===0){if(Object(e)!==e)return;l=!1}else for(;!(l=(a=s.call(e)).done)&&(r.push(a.value),r.length!==t);l=!0);}catch(c){f=!0,n=c}finally{try{if(!l&&e.return!=null&&(o=e.return(),Object(o)!==o))return}finally{if(f)throw n}}return r}}function ja(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Xa(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Qt(i,t){var e=Object.keys(i);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(i);t&&(a=a.filter(function(n){return Object.getOwnPropertyDescriptor(i,n).enumerable})),e.push.apply(e,a)}return e}function d(i){for(var t=1;t<arguments.length;t++){var e=arguments[t]!=null?arguments[t]:{};t%2?Qt(Object(e),!0).forEach(function(a){y(i,a,e[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(i,Object.getOwnPropertyDescriptors(e)):Qt(Object(e)).forEach(function(a){Object.defineProperty(i,a,Object.getOwnPropertyDescriptor(e,a))})}return i}function ht(i,t){return Ua(i)||Ka(i,t)||Ut(i,t)||ja()}function C(i){return Ha(i)||Va(i)||Ut(i)||Xa()}function qa(i,t){if(typeof i!="object"||!i)return i;var e=i[Symbol.toPrimitive];if(e!==void 0){var a=e.call(i,t);if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(i)}function Oe(i){var t=qa(i,"string");return typeof t=="symbol"?t:t+""}function ft(i){"@babel/helpers - typeof";return ft=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},ft(i)}function Ut(i,t){if(i){if(typeof i=="string")return Tt(i,t);var e={}.toString.call(i).slice(8,-1);return e==="Object"&&i.constructor&&(e=i.constructor.name),e==="Map"||e==="Set"?Array.from(i):e==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)?Tt(i,t):void 0}}var te=function(){},Ht={},ke={},Re=null,Ne={mark:te,measure:te};try{typeof window<"u"&&(Ht=window),typeof document<"u"&&(ke=document),typeof MutationObserver<"u"&&(Re=MutationObserver),typeof performance<"u"&&(Ne=performance)}catch{}var Ja=Ht.navigator||{},ee=Ja.userAgent,ae=ee===void 0?"":ee,W=Ht,S=ke,ie=Re,rt=Ne;W.document;var $=!!S.documentElement&&!!S.head&&typeof S.addEventListener=="function"&&typeof S.createElement=="function",Ce=~ae.indexOf("MSIE")||~ae.indexOf("Trident/"),bt,Za=/fa(k|kd|s|r|l|t|d|dr|dl|dt|b|slr|slpr|wsb|tl|ns|nds|es|jr|jfr|jdr|usb|ufsb|udsb|cr|ss|sr|sl|st|sds|sdr|sdl|sdt)?[\-\ ]/,Qa=/Font ?Awesome ?([567 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit|Notdog Duo|Notdog|Chisel|Etch|Thumbprint|Jelly Fill|Jelly Duo|Jelly|Utility|Utility Fill|Utility Duo|Slab Press|Slab|Whiteboard)?.*/i,Fe={classic:{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fab:"brands","fa-brands":"brands"},duotone:{fa:"solid",fad:"solid","fa-solid":"solid","fa-duotone":"solid",fadr:"regular","fa-regular":"regular",fadl:"light","fa-light":"light",fadt:"thin","fa-thin":"thin"},sharp:{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light",fast:"thin","fa-thin":"thin"},"sharp-duotone":{fa:"solid",fasds:"solid","fa-solid":"solid",fasdr:"regular","fa-regular":"regular",fasdl:"light","fa-light":"light",fasdt:"thin","fa-thin":"thin"},slab:{"fa-regular":"regular",faslr:"regular"},"slab-press":{"fa-regular":"regular",faslpr:"regular"},thumbprint:{"fa-light":"light",fatl:"light"},whiteboard:{"fa-semibold":"semibold",fawsb:"semibold"},notdog:{"fa-solid":"solid",fans:"solid"},"notdog-duo":{"fa-solid":"solid",fands:"solid"},etch:{"fa-solid":"solid",faes:"solid"},jelly:{"fa-regular":"regular",fajr:"regular"},"jelly-fill":{"fa-regular":"regular",fajfr:"regular"},"jelly-duo":{"fa-regular":"regular",fajdr:"regular"},chisel:{"fa-regular":"regular",facr:"regular"},utility:{"fa-semibold":"semibold",fausb:"semibold"},"utility-duo":{"fa-semibold":"semibold",faudsb:"semibold"},"utility-fill":{"fa-semibold":"semibold",faufsb:"semibold"}},ti={GROUP:"duotone-group",PRIMARY:"primary",SECONDARY:"secondary"},_e=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-utility","fa-utility-duo","fa-utility-fill"],T="classic",et="duotone",Le="sharp",De="sharp-duotone",$e="chisel",We="etch",Be="jelly",Ue="jelly-duo",He="jelly-fill",ze="notdog",Ge="notdog-duo",Ye="slab",Ve="slab-press",Ke="thumbprint",je="utility",Xe="utility-duo",qe="utility-fill",Je="whiteboard",ei="Classic",ai="Duotone",ii="Sharp",ni="Sharp Duotone",ri="Chisel",si="Etch",oi="Jelly",li="Jelly Duo",ci="Jelly Fill",fi="Notdog",ui="Notdog Duo",di="Slab",hi="Slab Press",mi="Thumbprint",gi="Utility",pi="Utility Duo",vi="Utility Fill",yi="Whiteboard",Ze=[T,et,Le,De,$e,We,Be,Ue,He,ze,Ge,Ye,Ve,Ke,je,Xe,qe,Je];bt={},y(y(y(y(y(y(y(y(y(y(bt,T,ei),et,ai),Le,ii),De,ni),$e,ri),We,si),Be,oi),Ue,li),He,ci),ze,fi),y(y(y(y(y(y(y(y(bt,Ge,ui),Ye,di),Ve,hi),Ke,mi),je,gi),Xe,pi),qe,vi),Je,yi);var bi={classic:{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},duotone:{900:"fad",400:"fadr",300:"fadl",100:"fadt"},sharp:{900:"fass",400:"fasr",300:"fasl",100:"fast"},"sharp-duotone":{900:"fasds",400:"fasdr",300:"fasdl",100:"fasdt"},slab:{400:"faslr"},"slab-press":{400:"faslpr"},whiteboard:{600:"fawsb"},thumbprint:{300:"fatl"},notdog:{900:"fans"},"notdog-duo":{900:"fands"},etch:{900:"faes"},chisel:{400:"facr"},jelly:{400:"fajr"},"jelly-fill":{400:"fajfr"},"jelly-duo":{400:"fajdr"},utility:{600:"fausb"},"utility-duo":{600:"faudsb"},"utility-fill":{600:"faufsb"}},xi={"Font Awesome 7 Free":{900:"fas",400:"far"},"Font Awesome 7 Pro":{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},"Font Awesome 7 Brands":{400:"fab",normal:"fab"},"Font Awesome 7 Duotone":{900:"fad",400:"fadr",normal:"fadr",300:"fadl",100:"fadt"},"Font Awesome 7 Sharp":{900:"fass",400:"fasr",normal:"fasr",300:"fasl",100:"fast"},"Font Awesome 7 Sharp Duotone":{900:"fasds",400:"fasdr",normal:"fasdr",300:"fasdl",100:"fasdt"},"Font Awesome 7 Jelly":{400:"fajr",normal:"fajr"},"Font Awesome 7 Jelly Fill":{400:"fajfr",normal:"fajfr"},"Font Awesome 7 Jelly Duo":{400:"fajdr",normal:"fajdr"},"Font Awesome 7 Slab":{400:"faslr",normal:"faslr"},"Font Awesome 7 Slab Press":{400:"faslpr",normal:"faslpr"},"Font Awesome 7 Thumbprint":{300:"fatl",normal:"fatl"},"Font Awesome 7 Notdog":{900:"fans",normal:"fans"},"Font Awesome 7 Notdog Duo":{900:"fands",normal:"fands"},"Font Awesome 7 Etch":{900:"faes",normal:"faes"},"Font Awesome 7 Chisel":{400:"facr",normal:"facr"},"Font Awesome 7 Whiteboard":{600:"fawsb",normal:"fawsb"},"Font Awesome 7 Utility":{600:"fausb",normal:"fausb"},"Font Awesome 7 Utility Duo":{600:"faudsb",normal:"faudsb"},"Font Awesome 7 Utility Fill":{600:"faufsb",normal:"faufsb"}},wi=new Map([["classic",{defaultShortPrefixId:"fas",defaultStyleId:"solid",styleIds:["solid","regular","light","thin","brands"],futureStyleIds:[],defaultFontWeight:900}],["duotone",{defaultShortPrefixId:"fad",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp",{defaultShortPrefixId:"fass",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp-duotone",{defaultShortPrefixId:"fasds",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["chisel",{defaultShortPrefixId:"facr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["etch",{defaultShortPrefixId:"faes",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["jelly",{defaultShortPrefixId:"fajr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-duo",{defaultShortPrefixId:"fajdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-fill",{defaultShortPrefixId:"fajfr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["notdog",{defaultShortPrefixId:"fans",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog-duo",{defaultShortPrefixId:"fands",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["slab",{defaultShortPrefixId:"faslr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press",{defaultShortPrefixId:"faslpr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["thumbprint",{defaultShortPrefixId:"fatl",defaultStyleId:"light",styleIds:["light"],futureStyleIds:[],defaultFontWeight:300}],["utility",{defaultShortPrefixId:"fausb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-duo",{defaultShortPrefixId:"faudsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-fill",{defaultShortPrefixId:"faufsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["whiteboard",{defaultShortPrefixId:"fawsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}]]),Si={chisel:{regular:"facr"},classic:{brands:"fab",light:"fal",regular:"far",solid:"fas",thin:"fat"},duotone:{light:"fadl",regular:"fadr",solid:"fad",thin:"fadt"},etch:{solid:"faes"},jelly:{regular:"fajr"},"jelly-duo":{regular:"fajdr"},"jelly-fill":{regular:"fajfr"},notdog:{solid:"fans"},"notdog-duo":{solid:"fands"},sharp:{light:"fasl",regular:"fasr",solid:"fass",thin:"fast"},"sharp-duotone":{light:"fasdl",regular:"fasdr",solid:"fasds",thin:"fasdt"},slab:{regular:"faslr"},"slab-press":{regular:"faslpr"},thumbprint:{light:"fatl"},utility:{semibold:"fausb"},"utility-duo":{semibold:"faudsb"},"utility-fill":{semibold:"faufsb"},whiteboard:{semibold:"fawsb"}},Qe=["fak","fa-kit","fakd","fa-kit-duotone"],ne={kit:{fak:"kit","fa-kit":"kit"},"kit-duotone":{fakd:"kit-duotone","fa-kit-duotone":"kit-duotone"}},Ei=["kit"],Ai="kit",Ii="kit-duotone",Ti="Kit",Mi="Kit Duotone";y(y({},Ai,Ti),Ii,Mi);var Pi={kit:{"fa-kit":"fak"}},Oi={"Font Awesome Kit":{400:"fak",normal:"fak"},"Font Awesome Kit Duotone":{400:"fakd",normal:"fakd"}},ki={kit:{fak:"fa-kit"}},re={kit:{kit:"fak"},"kit-duotone":{"kit-duotone":"fakd"}},xt,st={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},Ri=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-utility","fa-utility-duo","fa-utility-fill"],Ni="classic",Ci="duotone",Fi="sharp",_i="sharp-duotone",Li="chisel",Di="etch",$i="jelly",Wi="jelly-duo",Bi="jelly-fill",Ui="notdog",Hi="notdog-duo",zi="slab",Gi="slab-press",Yi="thumbprint",Vi="utility",Ki="utility-duo",ji="utility-fill",Xi="whiteboard",qi="Classic",Ji="Duotone",Zi="Sharp",Qi="Sharp Duotone",tn="Chisel",en="Etch",an="Jelly",nn="Jelly Duo",rn="Jelly Fill",sn="Notdog",on="Notdog Duo",ln="Slab",cn="Slab Press",fn="Thumbprint",un="Utility",dn="Utility Duo",hn="Utility Fill",mn="Whiteboard";xt={},y(y(y(y(y(y(y(y(y(y(xt,Ni,qi),Ci,Ji),Fi,Zi),_i,Qi),Li,tn),Di,en),$i,an),Wi,nn),Bi,rn),Ui,sn),y(y(y(y(y(y(y(y(xt,Hi,on),zi,ln),Gi,cn),Yi,fn),Vi,un),Ki,dn),ji,hn),Xi,mn);var gn="kit",pn="kit-duotone",vn="Kit",yn="Kit Duotone";y(y({},gn,vn),pn,yn);var bn={classic:{"fa-brands":"fab","fa-duotone":"fad","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"},duotone:{"fa-regular":"fadr","fa-light":"fadl","fa-thin":"fadt"},sharp:{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl","fa-thin":"fast"},"sharp-duotone":{"fa-solid":"fasds","fa-regular":"fasdr","fa-light":"fasdl","fa-thin":"fasdt"},slab:{"fa-regular":"faslr"},"slab-press":{"fa-regular":"faslpr"},whiteboard:{"fa-semibold":"fawsb"},thumbprint:{"fa-light":"fatl"},notdog:{"fa-solid":"fans"},"notdog-duo":{"fa-solid":"fands"},etch:{"fa-solid":"faes"},jelly:{"fa-regular":"fajr"},"jelly-fill":{"fa-regular":"fajfr"},"jelly-duo":{"fa-regular":"fajdr"},chisel:{"fa-regular":"facr"},utility:{"fa-semibold":"fausb"},"utility-duo":{"fa-semibold":"faudsb"},"utility-fill":{"fa-semibold":"faufsb"}},xn={classic:["fas","far","fal","fat","fad"],duotone:["fadr","fadl","fadt"],sharp:["fass","fasr","fasl","fast"],"sharp-duotone":["fasds","fasdr","fasdl","fasdt"],slab:["faslr"],"slab-press":["faslpr"],whiteboard:["fawsb"],thumbprint:["fatl"],notdog:["fans"],"notdog-duo":["fands"],etch:["faes"],jelly:["fajr"],"jelly-fill":["fajfr"],"jelly-duo":["fajdr"],chisel:["facr"],utility:["fausb"],"utility-duo":["faudsb"],"utility-fill":["faufsb"]},Mt={classic:{fab:"fa-brands",fad:"fa-duotone",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"},duotone:{fadr:"fa-regular",fadl:"fa-light",fadt:"fa-thin"},sharp:{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light",fast:"fa-thin"},"sharp-duotone":{fasds:"fa-solid",fasdr:"fa-regular",fasdl:"fa-light",fasdt:"fa-thin"},slab:{faslr:"fa-regular"},"slab-press":{faslpr:"fa-regular"},whiteboard:{fawsb:"fa-semibold"},thumbprint:{fatl:"fa-light"},notdog:{fans:"fa-solid"},"notdog-duo":{fands:"fa-solid"},etch:{faes:"fa-solid"},jelly:{fajr:"fa-regular"},"jelly-fill":{fajfr:"fa-regular"},"jelly-duo":{fajdr:"fa-regular"},chisel:{facr:"fa-regular"},utility:{fausb:"fa-semibold"},"utility-duo":{faudsb:"fa-semibold"},"utility-fill":{faufsb:"fa-semibold"}},wn=["fa-solid","fa-regular","fa-light","fa-thin","fa-duotone","fa-brands","fa-semibold"],ta=["fa","fas","far","fal","fat","fad","fadr","fadl","fadt","fab","fass","fasr","fasl","fast","fasds","fasdr","fasdl","fasdt","faslr","faslpr","fawsb","fatl","fans","fands","faes","fajr","fajfr","fajdr","facr","fausb","faudsb","faufsb"].concat(Ri,wn),Sn=["solid","regular","light","thin","duotone","brands","semibold"],ea=[1,2,3,4,5,6,7,8,9,10],En=ea.concat([11,12,13,14,15,16,17,18,19,20]),An=["aw","fw","pull-left","pull-right"],In=[].concat(C(Object.keys(xn)),Sn,An,["2xs","xs","sm","lg","xl","2xl","beat","border","fade","beat-fade","bounce","flip-both","flip-horizontal","flip-vertical","flip","inverse","layers","layers-bottom-left","layers-bottom-right","layers-counter","layers-text","layers-top-left","layers-top-right","li","pull-end","pull-start","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","stack-1x","stack-2x","stack","ul","width-auto","width-fixed",st.GROUP,st.SWAP_OPACITY,st.PRIMARY,st.SECONDARY]).concat(ea.map(function(i){return"".concat(i,"x")})).concat(En.map(function(i){return"w-".concat(i)})),Tn={"Font Awesome 5 Free":{900:"fas",400:"far"},"Font Awesome 5 Pro":{900:"fas",400:"far",normal:"far",300:"fal"},"Font Awesome 5 Brands":{400:"fab",normal:"fab"},"Font Awesome 5 Duotone":{900:"fad"}},L="___FONT_AWESOME___",Pt=16,aa="fa",ia="svg-inline--fa",z="data-fa-i2svg",Ot="data-fa-pseudo-element",Mn="data-fa-pseudo-element-pending",zt="data-prefix",Gt="data-icon",se="fontawesome-i2svg",Pn="async",On=["HTML","HEAD","STYLE","SCRIPT"],na=["::before","::after",":before",":after"],ra=(function(){try{return!0}catch{return!1}})();function at(i){return new Proxy(i,{get:function(e,a){return a in e?e[a]:e[T]}})}var sa=d({},Fe);sa[T]=d(d(d(d({},{"fa-duotone":"duotone"}),Fe[T]),ne.kit),ne["kit-duotone"]);var kn=at(sa),kt=d({},Si);kt[T]=d(d(d(d({},{duotone:"fad"}),kt[T]),re.kit),re["kit-duotone"]);var oe=at(kt),Rt=d({},Mt);Rt[T]=d(d({},Rt[T]),ki.kit);var Yt=at(Rt),Nt=d({},bn);Nt[T]=d(d({},Nt[T]),Pi.kit);at(Nt);var Rn=Za,oa="fa-layers-text",Nn=Qa,Cn=d({},bi);at(Cn);var Fn=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],wt=ti,_n=[].concat(C(Ei),C(In)),Z=W.FontAwesomeConfig||{};function Ln(i){var t=S.querySelector("script["+i+"]");if(t)return t.getAttribute(i)}function Dn(i){return i===""?!0:i==="false"?!1:i==="true"?!0:i}if(S&&typeof S.querySelector=="function"){var $n=[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-search-pseudo-elements","searchPseudoElements"],["data-search-pseudo-elements-warnings","searchPseudoElementsWarnings"],["data-search-pseudo-elements-full-scan","searchPseudoElementsFullScan"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]];$n.forEach(function(i){var t=ht(i,2),e=t[0],a=t[1],n=Dn(Ln(e));n!=null&&(Z[a]=n)})}var la={styleDefault:"solid",familyDefault:T,cssPrefix:aa,replacementClass:ia,autoReplaceSvg:!0,autoAddCss:!0,searchPseudoElements:!1,searchPseudoElementsWarnings:!0,searchPseudoElementsFullScan:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};Z.familyPrefix&&(Z.cssPrefix=Z.familyPrefix);var X=d(d({},la),Z);X.autoReplaceSvg||(X.observeMutations=!1);var g={};Object.keys(la).forEach(function(i){Object.defineProperty(g,i,{enumerable:!0,set:function(e){X[i]=e,Q.forEach(function(a){return a(g)})},get:function(){return X[i]}})});Object.defineProperty(g,"familyPrefix",{enumerable:!0,set:function(t){X.cssPrefix=t,Q.forEach(function(e){return e(g)})},get:function(){return X.cssPrefix}});W.FontAwesomeConfig=g;var Q=[];function Wn(i){return Q.push(i),function(){Q.splice(Q.indexOf(i),1)}}var V=Pt,F={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function Bn(i){if(!(!i||!$)){var t=S.createElement("style");t.setAttribute("type","text/css"),t.innerHTML=i;for(var e=S.head.childNodes,a=null,n=e.length-1;n>-1;n--){var s=e[n],o=(s.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(o)>-1&&(a=s)}return S.head.insertBefore(t,a),i}}var Un="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function le(){for(var i=12,t="";i-- >0;)t+=Un[Math.random()*62|0];return t}function q(i){for(var t=[],e=(i||[]).length>>>0;e--;)t[e]=i[e];return t}function Vt(i){return i.classList?q(i.classList):(i.getAttribute("class")||"").split(" ").filter(function(t){return t})}function ca(i){return"".concat(i).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Hn(i){return Object.keys(i||{}).reduce(function(t,e){return t+"".concat(e,'="').concat(ca(i[e]),'" ')},"").trim()}function mt(i){return Object.keys(i||{}).reduce(function(t,e){return t+"".concat(e,": ").concat(i[e].trim(),";")},"")}function Kt(i){return i.size!==F.size||i.x!==F.x||i.y!==F.y||i.rotate!==F.rotate||i.flipX||i.flipY}function zn(i){var t=i.transform,e=i.containerWidth,a=i.iconWidth,n={transform:"translate(".concat(e/2," 256)")},s="translate(".concat(t.x*32,", ").concat(t.y*32,") "),o="scale(".concat(t.size/16*(t.flipX?-1:1),", ").concat(t.size/16*(t.flipY?-1:1),") "),r="rotate(".concat(t.rotate," 0 0)"),l={transform:"".concat(s," ").concat(o," ").concat(r)},f={transform:"translate(".concat(a/2*-1," -256)")};return{outer:n,inner:l,path:f}}function Gn(i){var t=i.transform,e=i.width,a=e===void 0?Pt:e,n=i.height,s=n===void 0?Pt:n,o="";return Ce?o+="translate(".concat(t.x/V-a/2,"em, ").concat(t.y/V-s/2,"em) "):o+="translate(calc(-50% + ".concat(t.x/V,"em), calc(-50% + ").concat(t.y/V,"em)) "),o+="scale(".concat(t.size/V*(t.flipX?-1:1),", ").concat(t.size/V*(t.flipY?-1:1),") "),o+="rotate(".concat(t.rotate,"deg) "),o}var Yn=`:root, :host {
  --fa-font-solid: normal 900 1em/1 "Font Awesome 7 Free";
  --fa-font-regular: normal 400 1em/1 "Font Awesome 7 Free";
  --fa-font-light: normal 300 1em/1 "Font Awesome 7 Pro";
  --fa-font-thin: normal 100 1em/1 "Font Awesome 7 Pro";
  --fa-font-duotone: normal 900 1em/1 "Font Awesome 7 Duotone";
  --fa-font-duotone-regular: normal 400 1em/1 "Font Awesome 7 Duotone";
  --fa-font-duotone-light: normal 300 1em/1 "Font Awesome 7 Duotone";
  --fa-font-duotone-thin: normal 100 1em/1 "Font Awesome 7 Duotone";
  --fa-font-brands: normal 400 1em/1 "Font Awesome 7 Brands";
  --fa-font-sharp-solid: normal 900 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-regular: normal 400 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-light: normal 300 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-thin: normal 100 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-duotone-solid: normal 900 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-sharp-duotone-regular: normal 400 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-sharp-duotone-light: normal 300 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-sharp-duotone-thin: normal 100 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-slab-regular: normal 400 1em/1 "Font Awesome 7 Slab";
  --fa-font-slab-press-regular: normal 400 1em/1 "Font Awesome 7 Slab Press";
  --fa-font-whiteboard-semibold: normal 600 1em/1 "Font Awesome 7 Whiteboard";
  --fa-font-thumbprint-light: normal 300 1em/1 "Font Awesome 7 Thumbprint";
  --fa-font-notdog-solid: normal 900 1em/1 "Font Awesome 7 Notdog";
  --fa-font-notdog-duo-solid: normal 900 1em/1 "Font Awesome 7 Notdog Duo";
  --fa-font-etch-solid: normal 900 1em/1 "Font Awesome 7 Etch";
  --fa-font-jelly-regular: normal 400 1em/1 "Font Awesome 7 Jelly";
  --fa-font-jelly-fill-regular: normal 400 1em/1 "Font Awesome 7 Jelly Fill";
  --fa-font-jelly-duo-regular: normal 400 1em/1 "Font Awesome 7 Jelly Duo";
  --fa-font-chisel-regular: normal 400 1em/1 "Font Awesome 7 Chisel";
  --fa-font-utility-semibold: normal 600 1em/1 "Font Awesome 7 Utility";
  --fa-font-utility-duo-semibold: normal 600 1em/1 "Font Awesome 7 Utility Duo";
  --fa-font-utility-fill-semibold: normal 600 1em/1 "Font Awesome 7 Utility Fill";
}

.svg-inline--fa {
  box-sizing: content-box;
  display: var(--fa-display, inline-block);
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
  width: var(--fa-width, 1.25em);
}
.svg-inline--fa.fa-2xs {
  vertical-align: 0.1em;
}
.svg-inline--fa.fa-xs {
  vertical-align: 0em;
}
.svg-inline--fa.fa-sm {
  vertical-align: -0.0714285714em;
}
.svg-inline--fa.fa-lg {
  vertical-align: -0.2em;
}
.svg-inline--fa.fa-xl {
  vertical-align: -0.25em;
}
.svg-inline--fa.fa-2xl {
  vertical-align: -0.3125em;
}
.svg-inline--fa.fa-pull-left,
.svg-inline--fa .fa-pull-start {
  float: inline-start;
  margin-inline-end: var(--fa-pull-margin, 0.3em);
}
.svg-inline--fa.fa-pull-right,
.svg-inline--fa .fa-pull-end {
  float: inline-end;
  margin-inline-start: var(--fa-pull-margin, 0.3em);
}
.svg-inline--fa.fa-li {
  width: var(--fa-li-width, 2em);
  inset-inline-start: calc(-1 * var(--fa-li-width, 2em));
  inset-block-start: 0.25em; /* syncing vertical alignment with Web Font rendering */
}

.fa-layers-counter, .fa-layers-text {
  display: inline-block;
  position: absolute;
  text-align: center;
}

.fa-layers {
  display: inline-block;
  height: 1em;
  position: relative;
  text-align: center;
  vertical-align: -0.125em;
  width: var(--fa-width, 1.25em);
}
.fa-layers .svg-inline--fa {
  inset: 0;
  margin: auto;
  position: absolute;
  transform-origin: center center;
}

.fa-layers-text {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center center;
}

.fa-layers-counter {
  background-color: var(--fa-counter-background-color, #ff253a);
  border-radius: var(--fa-counter-border-radius, 1em);
  box-sizing: border-box;
  color: var(--fa-inverse, #fff);
  line-height: var(--fa-counter-line-height, 1);
  max-width: var(--fa-counter-max-width, 5em);
  min-width: var(--fa-counter-min-width, 1.5em);
  overflow: hidden;
  padding: var(--fa-counter-padding, 0.25em 0.5em);
  right: var(--fa-right, 0);
  text-overflow: ellipsis;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-counter-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-bottom-right {
  bottom: var(--fa-bottom, 0);
  right: var(--fa-right, 0);
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom right;
}

.fa-layers-bottom-left {
  bottom: var(--fa-bottom, 0);
  left: var(--fa-left, 0);
  right: auto;
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom left;
}

.fa-layers-top-right {
  top: var(--fa-top, 0);
  right: var(--fa-right, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-top-left {
  left: var(--fa-left, 0);
  right: auto;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top left;
}

.fa-1x {
  font-size: 1em;
}

.fa-2x {
  font-size: 2em;
}

.fa-3x {
  font-size: 3em;
}

.fa-4x {
  font-size: 4em;
}

.fa-5x {
  font-size: 5em;
}

.fa-6x {
  font-size: 6em;
}

.fa-7x {
  font-size: 7em;
}

.fa-8x {
  font-size: 8em;
}

.fa-9x {
  font-size: 9em;
}

.fa-10x {
  font-size: 10em;
}

.fa-2xs {
  font-size: calc(10 / 16 * 1em); /* converts a 10px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 10 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 10 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-xs {
  font-size: calc(12 / 16 * 1em); /* converts a 12px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 12 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 12 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-sm {
  font-size: calc(14 / 16 * 1em); /* converts a 14px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 14 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 14 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-lg {
  font-size: calc(20 / 16 * 1em); /* converts a 20px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 20 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 20 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-xl {
  font-size: calc(24 / 16 * 1em); /* converts a 24px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 24 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 24 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-2xl {
  font-size: calc(32 / 16 * 1em); /* converts a 32px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 32 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 32 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-width-auto {
  --fa-width: auto;
}

.fa-fw,
.fa-width-fixed {
  --fa-width: 1.25em;
}

.fa-ul {
  list-style-type: none;
  margin-inline-start: var(--fa-li-margin, 2.5em);
  padding-inline-start: 0;
}
.fa-ul > li {
  position: relative;
}

.fa-li {
  inset-inline-start: calc(-1 * var(--fa-li-width, 2em));
  position: absolute;
  text-align: center;
  width: var(--fa-li-width, 2em);
  line-height: inherit;
}

/* Heads Up: Bordered Icons will not be supported in the future!
  - This feature will be deprecated in the next major release of Font Awesome (v8)!
  - You may continue to use it in this version *v7), but it will not be supported in Font Awesome v8.
*/
/* Notes:
* --@{v.$css-prefix}-border-width = 1/16 by default (to render as ~1px based on a 16px default font-size)
* --@{v.$css-prefix}-border-padding =
  ** 3/16 for vertical padding (to give ~2px of vertical whitespace around an icon considering it's vertical alignment)
  ** 4/16 for horizontal padding (to give ~4px of horizontal whitespace around an icon)
*/
.fa-border {
  border-color: var(--fa-border-color, #eee);
  border-radius: var(--fa-border-radius, 0.1em);
  border-style: var(--fa-border-style, solid);
  border-width: var(--fa-border-width, 0.0625em);
  box-sizing: var(--fa-border-box-sizing, content-box);
  padding: var(--fa-border-padding, 0.1875em 0.25em);
}

.fa-pull-left,
.fa-pull-start {
  float: inline-start;
  margin-inline-end: var(--fa-pull-margin, 0.3em);
}

.fa-pull-right,
.fa-pull-end {
  float: inline-end;
  margin-inline-start: var(--fa-pull-margin, 0.3em);
}

.fa-beat {
  animation-name: fa-beat;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-bounce {
  animation-name: fa-bounce;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
}

.fa-fade {
  animation-name: fa-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-beat-fade {
  animation-name: fa-beat-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-flip {
  animation-name: fa-flip;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-shake {
  animation-name: fa-shake;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin {
  animation-name: fa-spin;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 2s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin-reverse {
  --fa-animation-direction: reverse;
}

.fa-pulse,
.fa-spin-pulse {
  animation-name: fa-spin;
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, steps(8));
}

@media (prefers-reduced-motion: reduce) {
  .fa-beat,
  .fa-bounce,
  .fa-fade,
  .fa-beat-fade,
  .fa-flip,
  .fa-pulse,
  .fa-shake,
  .fa-spin,
  .fa-spin-pulse {
    animation: none !important;
    transition: none !important;
  }
}
@keyframes fa-beat {
  0%, 90% {
    transform: scale(1);
  }
  45% {
    transform: scale(var(--fa-beat-scale, 1.25));
  }
}
@keyframes fa-bounce {
  0% {
    transform: scale(1, 1) translateY(0);
  }
  10% {
    transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
  }
  30% {
    transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
  }
  50% {
    transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
  }
  57% {
    transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
  }
  64% {
    transform: scale(1, 1) translateY(0);
  }
  100% {
    transform: scale(1, 1) translateY(0);
  }
}
@keyframes fa-fade {
  50% {
    opacity: var(--fa-fade-opacity, 0.4);
  }
}
@keyframes fa-beat-fade {
  0%, 100% {
    opacity: var(--fa-beat-fade-opacity, 0.4);
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(var(--fa-beat-fade-scale, 1.125));
  }
}
@keyframes fa-flip {
  50% {
    transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
  }
}
@keyframes fa-shake {
  0% {
    transform: rotate(-15deg);
  }
  4% {
    transform: rotate(15deg);
  }
  8%, 24% {
    transform: rotate(-18deg);
  }
  12%, 28% {
    transform: rotate(18deg);
  }
  16% {
    transform: rotate(-22deg);
  }
  20% {
    transform: rotate(22deg);
  }
  32% {
    transform: rotate(-12deg);
  }
  36% {
    transform: rotate(12deg);
  }
  40%, 100% {
    transform: rotate(0deg);
  }
}
@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.fa-rotate-90 {
  transform: rotate(90deg);
}

.fa-rotate-180 {
  transform: rotate(180deg);
}

.fa-rotate-270 {
  transform: rotate(270deg);
}

.fa-flip-horizontal {
  transform: scale(-1, 1);
}

.fa-flip-vertical {
  transform: scale(1, -1);
}

.fa-flip-both,
.fa-flip-horizontal.fa-flip-vertical {
  transform: scale(-1, -1);
}

.fa-rotate-by {
  transform: rotate(var(--fa-rotate-angle, 0));
}

.svg-inline--fa .fa-primary {
  fill: var(--fa-primary-color, currentColor);
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa .fa-secondary {
  fill: var(--fa-secondary-color, currentColor);
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-primary {
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-secondary {
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa mask .fa-primary,
.svg-inline--fa mask .fa-secondary {
  fill: black;
}

.svg-inline--fa.fa-inverse {
  fill: var(--fa-inverse, #fff);
}

.fa-stack {
  display: inline-block;
  height: 2em;
  line-height: 2em;
  position: relative;
  vertical-align: middle;
  width: 2.5em;
}

.fa-inverse {
  color: var(--fa-inverse, #fff);
}

.svg-inline--fa.fa-stack-1x {
  --fa-width: 1.25em;
  height: 1em;
  width: var(--fa-width);
}
.svg-inline--fa.fa-stack-2x {
  --fa-width: 2.5em;
  height: 2em;
  width: var(--fa-width);
}

.fa-stack-1x,
.fa-stack-2x {
  inset: 0;
  margin: auto;
  position: absolute;
  z-index: var(--fa-stack-z-index, auto);
}`;function fa(){var i=aa,t=ia,e=g.cssPrefix,a=g.replacementClass,n=Yn;if(e!==i||a!==t){var s=new RegExp("\\.".concat(i,"\\-"),"g"),o=new RegExp("\\--".concat(i,"\\-"),"g"),r=new RegExp("\\.".concat(t),"g");n=n.replace(s,".".concat(e,"-")).replace(o,"--".concat(e,"-")).replace(r,".".concat(a))}return n}var ce=!1;function St(){g.autoAddCss&&!ce&&(Bn(fa()),ce=!0)}var Vn={mixout:function(){return{dom:{css:fa,insertCss:St}}},hooks:function(){return{beforeDOMElementCreation:function(){St()},beforeI2svg:function(){St()}}}},D=W||{};D[L]||(D[L]={});D[L].styles||(D[L].styles={});D[L].hooks||(D[L].hooks={});D[L].shims||(D[L].shims=[]);var N=D[L],ua=[],da=function(){S.removeEventListener("DOMContentLoaded",da),ut=1,ua.map(function(t){return t()})},ut=!1;$&&(ut=(S.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(S.readyState),ut||S.addEventListener("DOMContentLoaded",da));function Kn(i){$&&(ut?setTimeout(i,0):ua.push(i))}function it(i){var t=i.tag,e=i.attributes,a=e===void 0?{}:e,n=i.children,s=n===void 0?[]:n;return typeof i=="string"?ca(i):"<".concat(t," ").concat(Hn(a),">").concat(s.map(it).join(""),"</").concat(t,">")}function fe(i,t,e){if(i&&i[t]&&i[t][e])return{prefix:t,iconName:e,icon:i[t][e]}}var Et=function(t,e,a,n){var s=Object.keys(t),o=s.length,r=e,l,f,c;for(a===void 0?(l=1,c=t[s[0]]):(l=0,c=a);l<o;l++)f=s[l],c=r(c,t[f],f,t);return c};function ha(i){return C(i).length!==1?null:i.codePointAt(0).toString(16)}function ue(i){return Object.keys(i).reduce(function(t,e){var a=i[e],n=!!a.icon;return n?t[a.iconName]=a.icon:t[e]=a,t},{})}function Ct(i,t){var e=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},a=e.skipHooks,n=a===void 0?!1:a,s=ue(t);typeof N.hooks.addPack=="function"&&!n?N.hooks.addPack(i,ue(t)):N.styles[i]=d(d({},N.styles[i]||{}),s),i==="fas"&&Ct("fa",t)}var tt=N.styles,jn=N.shims,ma=Object.keys(Yt),Xn=ma.reduce(function(i,t){return i[t]=Object.keys(Yt[t]),i},{}),jt=null,ga={},pa={},va={},ya={},ba={};function qn(i){return~_n.indexOf(i)}function Jn(i,t){var e=t.split("-"),a=e[0],n=e.slice(1).join("-");return a===i&&n!==""&&!qn(n)?n:null}var xa=function(){var t=function(s){return Et(tt,function(o,r,l){return o[l]=Et(r,s,{}),o},{})};ga=t(function(n,s,o){if(s[3]&&(n[s[3]]=o),s[2]){var r=s[2].filter(function(l){return typeof l=="number"});r.forEach(function(l){n[l.toString(16)]=o})}return n}),pa=t(function(n,s,o){if(n[o]=o,s[2]){var r=s[2].filter(function(l){return typeof l=="string"});r.forEach(function(l){n[l]=o})}return n}),ba=t(function(n,s,o){var r=s[2];return n[o]=o,r.forEach(function(l){n[l]=o}),n});var e="far"in tt||g.autoFetchSvg,a=Et(jn,function(n,s){var o=s[0],r=s[1],l=s[2];return r==="far"&&!e&&(r="fas"),typeof o=="string"&&(n.names[o]={prefix:r,iconName:l}),typeof o=="number"&&(n.unicodes[o.toString(16)]={prefix:r,iconName:l}),n},{names:{},unicodes:{}});va=a.names,ya=a.unicodes,jt=gt(g.styleDefault,{family:g.familyDefault})};Wn(function(i){jt=gt(i.styleDefault,{family:g.familyDefault})});xa();function Xt(i,t){return(ga[i]||{})[t]}function Zn(i,t){return(pa[i]||{})[t]}function H(i,t){return(ba[i]||{})[t]}function wa(i){return va[i]||{prefix:null,iconName:null}}function Qn(i){var t=ya[i],e=Xt("fas",i);return t||(e?{prefix:"fas",iconName:e}:null)||{prefix:null,iconName:null}}function B(){return jt}var Sa=function(){return{prefix:null,iconName:null,rest:[]}};function tr(i){var t=T,e=ma.reduce(function(a,n){return a[n]="".concat(g.cssPrefix,"-").concat(n),a},{});return Ze.forEach(function(a){(i.includes(e[a])||i.some(function(n){return Xn[a].includes(n)}))&&(t=a)}),t}function gt(i){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},e=t.family,a=e===void 0?T:e,n=kn[a][i];if(a===et&&!i)return"fad";var s=oe[a][i]||oe[a][n],o=i in N.styles?i:null,r=s||o||null;return r}function er(i){var t=[],e=null;return i.forEach(function(a){var n=Jn(g.cssPrefix,a);n?e=n:a&&t.push(a)}),{iconName:e,rest:t}}function de(i){return i.sort().filter(function(t,e,a){return a.indexOf(t)===e})}var he=ta.concat(Qe);function pt(i){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},e=t.skipLookups,a=e===void 0?!1:e,n=null,s=de(i.filter(function(m){return he.includes(m)})),o=de(i.filter(function(m){return!he.includes(m)})),r=s.filter(function(m){return n=m,!_e.includes(m)}),l=ht(r,1),f=l[0],c=f===void 0?null:f,u=tr(s),h=d(d({},er(o)),{},{prefix:gt(c,{family:u})});return d(d(d({},h),rr({values:i,family:u,styles:tt,config:g,canonical:h,givenPrefix:n})),ar(a,n,h))}function ar(i,t,e){var a=e.prefix,n=e.iconName;if(i||!a||!n)return{prefix:a,iconName:n};var s=t==="fa"?wa(n):{},o=H(a,n);return n=s.iconName||o||n,a=s.prefix||a,a==="far"&&!tt.far&&tt.fas&&!g.autoFetchSvg&&(a="fas"),{prefix:a,iconName:n}}var ir=Ze.filter(function(i){return i!==T||i!==et}),nr=Object.keys(Mt).filter(function(i){return i!==T}).map(function(i){return Object.keys(Mt[i])}).flat();function rr(i){var t=i.values,e=i.family,a=i.canonical,n=i.givenPrefix,s=n===void 0?"":n,o=i.styles,r=o===void 0?{}:o,l=i.config,f=l===void 0?{}:l,c=e===et,u=t.includes("fa-duotone")||t.includes("fad"),h=f.familyDefault==="duotone",m=a.prefix==="fad"||a.prefix==="fa-duotone";if(!c&&(u||h||m)&&(a.prefix="fad"),(t.includes("fa-brands")||t.includes("fab"))&&(a.prefix="fab"),!a.prefix&&ir.includes(e)){var v=Object.keys(r).find(function(b){return nr.includes(b)});if(v||f.autoFetchSvg){var p=wi.get(e).defaultShortPrefixId;a.prefix=p,a.iconName=H(a.prefix,a.iconName)||a.iconName}}return(a.prefix==="fa"||s==="fa")&&(a.prefix=B()||"fas"),a}var sr=(function(){function i(){za(this,i),this.definitions={}}return Ya(i,[{key:"add",value:function(){for(var e=this,a=arguments.length,n=new Array(a),s=0;s<a;s++)n[s]=arguments[s];var o=n.reduce(this._pullDefinitions,{});Object.keys(o).forEach(function(r){e.definitions[r]=d(d({},e.definitions[r]||{}),o[r]),Ct(r,o[r]);var l=Yt[T][r];l&&Ct(l,o[r]),xa()})}},{key:"reset",value:function(){this.definitions={}}},{key:"_pullDefinitions",value:function(e,a){var n=a.prefix&&a.iconName&&a.icon?{0:a}:a;return Object.keys(n).map(function(s){var o=n[s],r=o.prefix,l=o.iconName,f=o.icon,c=f[2];e[r]||(e[r]={}),c.length>0&&c.forEach(function(u){typeof u=="string"&&(e[r][u]=f)}),e[r][l]=f}),e}}])})(),me=[],K={},j={},or=Object.keys(j);function lr(i,t){var e=t.mixoutsTo;return me=i,K={},Object.keys(j).forEach(function(a){or.indexOf(a)===-1&&delete j[a]}),me.forEach(function(a){var n=a.mixout?a.mixout():{};if(Object.keys(n).forEach(function(o){typeof n[o]=="function"&&(e[o]=n[o]),ft(n[o])==="object"&&Object.keys(n[o]).forEach(function(r){e[o]||(e[o]={}),e[o][r]=n[o][r]})}),a.hooks){var s=a.hooks();Object.keys(s).forEach(function(o){K[o]||(K[o]=[]),K[o].push(s[o])})}a.provides&&a.provides(j)}),e}function Ft(i,t){for(var e=arguments.length,a=new Array(e>2?e-2:0),n=2;n<e;n++)a[n-2]=arguments[n];var s=K[i]||[];return s.forEach(function(o){t=o.apply(null,[t].concat(a))}),t}function G(i){for(var t=arguments.length,e=new Array(t>1?t-1:0),a=1;a<t;a++)e[a-1]=arguments[a];var n=K[i]||[];n.forEach(function(s){s.apply(null,e)})}function U(){var i=arguments[0],t=Array.prototype.slice.call(arguments,1);return j[i]?j[i].apply(null,t):void 0}function _t(i){i.prefix==="fa"&&(i.prefix="fas");var t=i.iconName,e=i.prefix||B();if(t)return t=H(e,t)||t,fe(Ea.definitions,e,t)||fe(N.styles,e,t)}var Ea=new sr,cr=function(){g.autoReplaceSvg=!1,g.observeMutations=!1,G("noAuto")},fr={i2svg:function(){var t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return $?(G("beforeI2svg",t),U("pseudoElements2svg",t),U("i2svg",t)):Promise.reject(new Error("Operation requires a DOM of some kind."))},watch:function(){var t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},e=t.autoReplaceSvgRoot;g.autoReplaceSvg===!1&&(g.autoReplaceSvg=!0),g.observeMutations=!0,Kn(function(){dr({autoReplaceSvgRoot:e}),G("watch",t)})}},ur={icon:function(t){if(t===null)return null;if(ft(t)==="object"&&t.prefix&&t.iconName)return{prefix:t.prefix,iconName:H(t.prefix,t.iconName)||t.iconName};if(Array.isArray(t)&&t.length===2){var e=t[1].indexOf("fa-")===0?t[1].slice(3):t[1],a=gt(t[0]);return{prefix:a,iconName:H(a,e)||e}}if(typeof t=="string"&&(t.indexOf("".concat(g.cssPrefix,"-"))>-1||t.match(Rn))){var n=pt(t.split(" "),{skipLookups:!0});return{prefix:n.prefix||B(),iconName:H(n.prefix,n.iconName)||n.iconName}}if(typeof t=="string"){var s=B();return{prefix:s,iconName:H(s,t)||t}}}},P={noAuto:cr,config:g,dom:fr,parse:ur,library:Ea,findIconDefinition:_t,toHtml:it},dr=function(){var t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},e=t.autoReplaceSvgRoot,a=e===void 0?S:e;(Object.keys(N.styles).length>0||g.autoFetchSvg)&&$&&g.autoReplaceSvg&&P.dom.i2svg({node:a})};function vt(i,t){return Object.defineProperty(i,"abstract",{get:t}),Object.defineProperty(i,"html",{get:function(){return i.abstract.map(function(a){return it(a)})}}),Object.defineProperty(i,"node",{get:function(){if($){var a=S.createElement("div");return a.innerHTML=i.html,a.children}}}),i}function hr(i){var t=i.children,e=i.main,a=i.mask,n=i.attributes,s=i.styles,o=i.transform;if(Kt(o)&&e.found&&!a.found){var r=e.width,l=e.height,f={x:r/l/2,y:.5};n.style=mt(d(d({},s),{},{"transform-origin":"".concat(f.x+o.x/16,"em ").concat(f.y+o.y/16,"em")}))}return[{tag:"svg",attributes:n,children:t}]}function mr(i){var t=i.prefix,e=i.iconName,a=i.children,n=i.attributes,s=i.symbol,o=s===!0?"".concat(t,"-").concat(g.cssPrefix,"-").concat(e):s;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:d(d({},n),{},{id:o}),children:a}]}]}function gr(i){var t=["aria-label","aria-labelledby","title","role"];return t.some(function(e){return e in i})}function qt(i){var t=i.icons,e=t.main,a=t.mask,n=i.prefix,s=i.iconName,o=i.transform,r=i.symbol,l=i.maskId,f=i.extra,c=i.watchable,u=c===void 0?!1:c,h=a.found?a:e,m=h.width,v=h.height,p=[g.replacementClass,s?"".concat(g.cssPrefix,"-").concat(s):""].filter(function(k){return f.classes.indexOf(k)===-1}).filter(function(k){return k!==""||!!k}).concat(f.classes).join(" "),b={children:[],attributes:d(d({},f.attributes),{},{"data-prefix":n,"data-icon":s,class:p,role:f.attributes.role||"img",viewBox:"0 0 ".concat(m," ").concat(v)})};!gr(f.attributes)&&!f.attributes["aria-hidden"]&&(b.attributes["aria-hidden"]="true"),u&&(b.attributes[z]="");var x=d(d({},b),{},{prefix:n,iconName:s,main:e,mask:a,maskId:l,transform:o,symbol:r,styles:d({},f.styles)}),A=a.found&&e.found?U("generateAbstractMask",x)||{children:[],attributes:{}}:U("generateAbstractIcon",x)||{children:[],attributes:{}},E=A.children,O=A.attributes;return x.children=E,x.attributes=O,r?mr(x):hr(x)}function ge(i){var t=i.content,e=i.width,a=i.height,n=i.transform,s=i.extra,o=i.watchable,r=o===void 0?!1:o,l=d(d({},s.attributes),{},{class:s.classes.join(" ")});r&&(l[z]="");var f=d({},s.styles);Kt(n)&&(f.transform=Gn({transform:n,width:e,height:a}),f["-webkit-transform"]=f.transform);var c=mt(f);c.length>0&&(l.style=c);var u=[];return u.push({tag:"span",attributes:l,children:[t]}),u}function pr(i){var t=i.content,e=i.extra,a=d(d({},e.attributes),{},{class:e.classes.join(" ")}),n=mt(e.styles);n.length>0&&(a.style=n);var s=[];return s.push({tag:"span",attributes:a,children:[t]}),s}var At=N.styles;function Lt(i){var t=i[0],e=i[1],a=i.slice(4),n=ht(a,1),s=n[0],o=null;return Array.isArray(s)?o={tag:"g",attributes:{class:"".concat(g.cssPrefix,"-").concat(wt.GROUP)},children:[{tag:"path",attributes:{class:"".concat(g.cssPrefix,"-").concat(wt.SECONDARY),fill:"currentColor",d:s[0]}},{tag:"path",attributes:{class:"".concat(g.cssPrefix,"-").concat(wt.PRIMARY),fill:"currentColor",d:s[1]}}]}:o={tag:"path",attributes:{fill:"currentColor",d:s}},{found:!0,width:t,height:e,icon:o}}var vr={found:!1,width:512,height:512};function yr(i,t){!ra&&!g.showMissingIcons&&i&&console.error('Icon with name "'.concat(i,'" and prefix "').concat(t,'" is missing.'))}function Dt(i,t){var e=t;return t==="fa"&&g.styleDefault!==null&&(t=B()),new Promise(function(a,n){if(e==="fa"){var s=wa(i)||{};i=s.iconName||i,t=s.prefix||t}if(i&&t&&At[t]&&At[t][i]){var o=At[t][i];return a(Lt(o))}yr(i,t),a(d(d({},vr),{},{icon:g.showMissingIcons&&i?U("missingIconAbstract")||{}:{}}))})}var pe=function(){},$t=g.measurePerformance&&rt&&rt.mark&&rt.measure?rt:{mark:pe,measure:pe},J='FA "7.1.0"',br=function(t){return $t.mark("".concat(J," ").concat(t," begins")),function(){return Aa(t)}},Aa=function(t){$t.mark("".concat(J," ").concat(t," ends")),$t.measure("".concat(J," ").concat(t),"".concat(J," ").concat(t," begins"),"".concat(J," ").concat(t," ends"))},Jt={begin:br,end:Aa},lt=function(){};function ve(i){var t=i.getAttribute?i.getAttribute(z):null;return typeof t=="string"}function xr(i){var t=i.getAttribute?i.getAttribute(zt):null,e=i.getAttribute?i.getAttribute(Gt):null;return t&&e}function wr(i){return i&&i.classList&&i.classList.contains&&i.classList.contains(g.replacementClass)}function Sr(){if(g.autoReplaceSvg===!0)return ct.replace;var i=ct[g.autoReplaceSvg];return i||ct.replace}function Er(i){return S.createElementNS("http://www.w3.org/2000/svg",i)}function Ar(i){return S.createElement(i)}function Ia(i){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},e=t.ceFn,a=e===void 0?i.tag==="svg"?Er:Ar:e;if(typeof i=="string")return S.createTextNode(i);var n=a(i.tag);Object.keys(i.attributes||[]).forEach(function(o){n.setAttribute(o,i.attributes[o])});var s=i.children||[];return s.forEach(function(o){n.appendChild(Ia(o,{ceFn:a}))}),n}function Ir(i){var t=" ".concat(i.outerHTML," ");return t="".concat(t,"Font Awesome fontawesome.com "),t}var ct={replace:function(t){var e=t[0];if(e.parentNode)if(t[1].forEach(function(n){e.parentNode.insertBefore(Ia(n),e)}),e.getAttribute(z)===null&&g.keepOriginalSource){var a=S.createComment(Ir(e));e.parentNode.replaceChild(a,e)}else e.remove()},nest:function(t){var e=t[0],a=t[1];if(~Vt(e).indexOf(g.replacementClass))return ct.replace(t);var n=new RegExp("".concat(g.cssPrefix,"-.*"));if(delete a[0].attributes.id,a[0].attributes.class){var s=a[0].attributes.class.split(" ").reduce(function(r,l){return l===g.replacementClass||l.match(n)?r.toSvg.push(l):r.toNode.push(l),r},{toNode:[],toSvg:[]});a[0].attributes.class=s.toSvg.join(" "),s.toNode.length===0?e.removeAttribute("class"):e.setAttribute("class",s.toNode.join(" "))}var o=a.map(function(r){return it(r)}).join(`
`);e.setAttribute(z,""),e.innerHTML=o}};function ye(i){i()}function Ta(i,t){var e=typeof t=="function"?t:lt;if(i.length===0)e();else{var a=ye;g.mutateApproach===Pn&&(a=W.requestAnimationFrame||ye),a(function(){var n=Sr(),s=Jt.begin("mutate");i.map(n),s(),e()})}}var Zt=!1;function Ma(){Zt=!0}function Wt(){Zt=!1}var dt=null;function be(i){if(ie&&g.observeMutations){var t=i.treeCallback,e=t===void 0?lt:t,a=i.nodeCallback,n=a===void 0?lt:a,s=i.pseudoElementsCallback,o=s===void 0?lt:s,r=i.observeMutationsRoot,l=r===void 0?S:r;dt=new ie(function(f){if(!Zt){var c=B();q(f).forEach(function(u){if(u.type==="childList"&&u.addedNodes.length>0&&!ve(u.addedNodes[0])&&(g.searchPseudoElements&&o(u.target),e(u.target)),u.type==="attributes"&&u.target.parentNode&&g.searchPseudoElements&&o([u.target],!0),u.type==="attributes"&&ve(u.target)&&~Fn.indexOf(u.attributeName))if(u.attributeName==="class"&&xr(u.target)){var h=pt(Vt(u.target)),m=h.prefix,v=h.iconName;u.target.setAttribute(zt,m||c),v&&u.target.setAttribute(Gt,v)}else wr(u.target)&&n(u.target)})}}),$&&dt.observe(l,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}}function Tr(){dt&&dt.disconnect()}function Mr(i){var t=i.getAttribute("style"),e=[];return t&&(e=t.split(";").reduce(function(a,n){var s=n.split(":"),o=s[0],r=s.slice(1);return o&&r.length>0&&(a[o]=r.join(":").trim()),a},{})),e}function Pr(i){var t=i.getAttribute("data-prefix"),e=i.getAttribute("data-icon"),a=i.innerText!==void 0?i.innerText.trim():"",n=pt(Vt(i));return n.prefix||(n.prefix=B()),t&&e&&(n.prefix=t,n.iconName=e),n.iconName&&n.prefix||(n.prefix&&a.length>0&&(n.iconName=Zn(n.prefix,i.innerText)||Xt(n.prefix,ha(i.innerText))),!n.iconName&&g.autoFetchSvg&&i.firstChild&&i.firstChild.nodeType===Node.TEXT_NODE&&(n.iconName=i.firstChild.data)),n}function Or(i){var t=q(i.attributes).reduce(function(e,a){return e.name!=="class"&&e.name!=="style"&&(e[a.name]=a.value),e},{});return t}function kr(){return{iconName:null,prefix:null,transform:F,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function xe(i){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0},e=Pr(i),a=e.iconName,n=e.prefix,s=e.rest,o=Or(i),r=Ft("parseNodeAttributes",{},i),l=t.styleParser?Mr(i):[];return d({iconName:a,prefix:n,transform:F,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:s,styles:l,attributes:o}},r)}var Rr=N.styles;function Pa(i){var t=g.autoReplaceSvg==="nest"?xe(i,{styleParser:!1}):xe(i);return~t.extra.classes.indexOf(oa)?U("generateLayersText",i,t):U("generateSvgReplacementMutation",i,t)}function Nr(){return[].concat(C(Qe),C(ta))}function we(i){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!$)return Promise.resolve();var e=S.documentElement.classList,a=function(u){return e.add("".concat(se,"-").concat(u))},n=function(u){return e.remove("".concat(se,"-").concat(u))},s=g.autoFetchSvg?Nr():_e.concat(Object.keys(Rr));s.includes("fa")||s.push("fa");var o=[".".concat(oa,":not([").concat(z,"])")].concat(s.map(function(c){return".".concat(c,":not([").concat(z,"])")})).join(", ");if(o.length===0)return Promise.resolve();var r=[];try{r=q(i.querySelectorAll(o))}catch{}if(r.length>0)a("pending"),n("complete");else return Promise.resolve();var l=Jt.begin("onTree"),f=r.reduce(function(c,u){try{var h=Pa(u);h&&c.push(h)}catch(m){ra||m.name==="MissingIcon"&&console.error(m)}return c},[]);return new Promise(function(c,u){Promise.all(f).then(function(h){Ta(h,function(){a("active"),a("complete"),n("pending"),typeof t=="function"&&t(),l(),c()})}).catch(function(h){l(),u(h)})})}function Cr(i){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;Pa(i).then(function(e){e&&Ta([e],t)})}function Fr(i){return function(t){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=(t||{}).icon?t:_t(t||{}),n=e.mask;return n&&(n=(n||{}).icon?n:_t(n||{})),i(a,d(d({},e),{},{mask:n}))}}var _r=function(t){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=e.transform,n=a===void 0?F:a,s=e.symbol,o=s===void 0?!1:s,r=e.mask,l=r===void 0?null:r,f=e.maskId,c=f===void 0?null:f,u=e.classes,h=u===void 0?[]:u,m=e.attributes,v=m===void 0?{}:m,p=e.styles,b=p===void 0?{}:p;if(t){var x=t.prefix,A=t.iconName,E=t.icon;return vt(d({type:"icon"},t),function(){return G("beforeDOMElementCreation",{iconDefinition:t,params:e}),qt({icons:{main:Lt(E),mask:l?Lt(l.icon):{found:!1,width:null,height:null,icon:{}}},prefix:x,iconName:A,transform:d(d({},F),n),symbol:o,maskId:c,extra:{attributes:v,styles:b,classes:h}})})}},Lr={mixout:function(){return{icon:Fr(_r)}},hooks:function(){return{mutationObserverCallbacks:function(e){return e.treeCallback=we,e.nodeCallback=Cr,e}}},provides:function(t){t.i2svg=function(e){var a=e.node,n=a===void 0?S:a,s=e.callback,o=s===void 0?function(){}:s;return we(n,o)},t.generateSvgReplacementMutation=function(e,a){var n=a.iconName,s=a.prefix,o=a.transform,r=a.symbol,l=a.mask,f=a.maskId,c=a.extra;return new Promise(function(u,h){Promise.all([Dt(n,s),l.iconName?Dt(l.iconName,l.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(function(m){var v=ht(m,2),p=v[0],b=v[1];u([e,qt({icons:{main:p,mask:b},prefix:s,iconName:n,transform:o,symbol:r,maskId:f,extra:c,watchable:!0})])}).catch(h)})},t.generateAbstractIcon=function(e){var a=e.children,n=e.attributes,s=e.main,o=e.transform,r=e.styles,l=mt(r);l.length>0&&(n.style=l);var f;return Kt(o)&&(f=U("generateAbstractTransformGrouping",{main:s,transform:o,containerWidth:s.width,iconWidth:s.width})),a.push(f||s.icon),{children:a,attributes:n}}}},Dr={mixout:function(){return{layer:function(e){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=a.classes,s=n===void 0?[]:n;return vt({type:"layer"},function(){G("beforeDOMElementCreation",{assembler:e,params:a});var o=[];return e(function(r){Array.isArray(r)?r.map(function(l){o=o.concat(l.abstract)}):o=o.concat(r.abstract)}),[{tag:"span",attributes:{class:["".concat(g.cssPrefix,"-layers")].concat(C(s)).join(" ")},children:o}]})}}}},$r={mixout:function(){return{counter:function(e){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};a.title;var n=a.classes,s=n===void 0?[]:n,o=a.attributes,r=o===void 0?{}:o,l=a.styles,f=l===void 0?{}:l;return vt({type:"counter",content:e},function(){return G("beforeDOMElementCreation",{content:e,params:a}),pr({content:e.toString(),extra:{attributes:r,styles:f,classes:["".concat(g.cssPrefix,"-layers-counter")].concat(C(s))}})})}}}},Wr={mixout:function(){return{text:function(e){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=a.transform,s=n===void 0?F:n,o=a.classes,r=o===void 0?[]:o,l=a.attributes,f=l===void 0?{}:l,c=a.styles,u=c===void 0?{}:c;return vt({type:"text",content:e},function(){return G("beforeDOMElementCreation",{content:e,params:a}),ge({content:e,transform:d(d({},F),s),extra:{attributes:f,styles:u,classes:["".concat(g.cssPrefix,"-layers-text")].concat(C(r))}})})}}},provides:function(t){t.generateLayersText=function(e,a){var n=a.transform,s=a.extra,o=null,r=null;if(Ce){var l=parseInt(getComputedStyle(e).fontSize,10),f=e.getBoundingClientRect();o=f.width/l,r=f.height/l}return Promise.resolve([e,ge({content:e.innerHTML,width:o,height:r,transform:n,extra:s,watchable:!0})])}}},Oa=new RegExp('"',"ug"),Se=[1105920,1112319],Ee=d(d(d(d({},{FontAwesome:{normal:"fas",400:"fas"}}),xi),Tn),Oi),Bt=Object.keys(Ee).reduce(function(i,t){return i[t.toLowerCase()]=Ee[t],i},{}),Br=Object.keys(Bt).reduce(function(i,t){var e=Bt[t];return i[t]=e[900]||C(Object.entries(e))[0][1],i},{});function Ur(i){var t=i.replace(Oa,"");return ha(C(t)[0]||"")}function Hr(i){var t=i.getPropertyValue("font-feature-settings").includes("ss01"),e=i.getPropertyValue("content"),a=e.replace(Oa,""),n=a.codePointAt(0),s=n>=Se[0]&&n<=Se[1],o=a.length===2?a[0]===a[1]:!1;return s||o||t}function zr(i,t){var e=i.replace(/^['"]|['"]$/g,"").toLowerCase(),a=parseInt(t),n=isNaN(a)?"normal":a;return(Bt[e]||{})[n]||Br[e]}function Ae(i,t){var e="".concat(Mn).concat(t.replace(":","-"));return new Promise(function(a,n){if(i.getAttribute(e)!==null)return a();var s=q(i.children),o=s.filter(function(nt){return nt.getAttribute(Ot)===t})[0],r=W.getComputedStyle(i,t),l=r.getPropertyValue("font-family"),f=l.match(Nn),c=r.getPropertyValue("font-weight"),u=r.getPropertyValue("content");if(o&&!f)return i.removeChild(o),a();if(f&&u!=="none"&&u!==""){var h=r.getPropertyValue("content"),m=zr(l,c),v=Ur(h),p=f[0].startsWith("FontAwesome"),b=Hr(r),x=Xt(m,v),A=x;if(p){var E=Qn(v);E.iconName&&E.prefix&&(x=E.iconName,m=E.prefix)}if(x&&!b&&(!o||o.getAttribute(zt)!==m||o.getAttribute(Gt)!==A)){i.setAttribute(e,A),o&&i.removeChild(o);var O=kr(),k=O.extra;k.attributes[Ot]=t,Dt(x,m).then(function(nt){var Ra=qt(d(d({},O),{},{icons:{main:nt,mask:Sa()},prefix:m,iconName:A,extra:k,watchable:!0})),yt=S.createElementNS("http://www.w3.org/2000/svg","svg");t==="::before"?i.insertBefore(yt,i.firstChild):i.appendChild(yt),yt.outerHTML=Ra.map(function(Na){return it(Na)}).join(`
`),i.removeAttribute(e),a()}).catch(n)}else a()}else a()})}function Gr(i){return Promise.all([Ae(i,"::before"),Ae(i,"::after")])}function Yr(i){return i.parentNode!==document.head&&!~On.indexOf(i.tagName.toUpperCase())&&!i.getAttribute(Ot)&&(!i.parentNode||i.parentNode.tagName!=="svg")}var Vr=function(t){return!!t&&na.some(function(e){return t.includes(e)})},Kr=function(t){if(!t)return[];var e=new Set,a=t.split(/,(?![^()]*\))/).map(function(l){return l.trim()});a=a.flatMap(function(l){return l.includes("(")?l:l.split(",").map(function(f){return f.trim()})});var n=ot(a),s;try{for(n.s();!(s=n.n()).done;){var o=s.value;if(Vr(o)){var r=na.reduce(function(l,f){return l.replace(f,"")},o);r!==""&&r!=="*"&&e.add(r)}}}catch(l){n.e(l)}finally{n.f()}return e};function Ie(i){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1;if($){var e;if(t)e=i;else if(g.searchPseudoElementsFullScan)e=i.querySelectorAll("*");else{var a=new Set,n=ot(document.styleSheets),s;try{for(n.s();!(s=n.n()).done;){var o=s.value;try{var r=ot(o.cssRules),l;try{for(r.s();!(l=r.n()).done;){var f=l.value,c=Kr(f.selectorText),u=ot(c),h;try{for(u.s();!(h=u.n()).done;){var m=h.value;a.add(m)}}catch(p){u.e(p)}finally{u.f()}}}catch(p){r.e(p)}finally{r.f()}}catch(p){g.searchPseudoElementsWarnings&&console.warn("Font Awesome: cannot parse stylesheet: ".concat(o.href," (").concat(p.message,`)
If it declares any Font Awesome CSS pseudo-elements, they will not be rendered as SVG icons. Add crossorigin="anonymous" to the <link>, enable searchPseudoElementsFullScan for slower but more thorough DOM parsing, or suppress this warning by setting searchPseudoElementsWarnings to false.`))}}}catch(p){n.e(p)}finally{n.f()}if(!a.size)return;var v=Array.from(a).join(", ");try{e=i.querySelectorAll(v)}catch{}}return new Promise(function(p,b){var x=q(e).filter(Yr).map(Gr),A=Jt.begin("searchPseudoElements");Ma(),Promise.all(x).then(function(){A(),Wt(),p()}).catch(function(){A(),Wt(),b()})})}}var jr={hooks:function(){return{mutationObserverCallbacks:function(e){return e.pseudoElementsCallback=Ie,e}}},provides:function(t){t.pseudoElements2svg=function(e){var a=e.node,n=a===void 0?S:a;g.searchPseudoElements&&Ie(n)}}},Te=!1,Xr={mixout:function(){return{dom:{unwatch:function(){Ma(),Te=!0}}}},hooks:function(){return{bootstrap:function(){be(Ft("mutationObserverCallbacks",{}))},noAuto:function(){Tr()},watch:function(e){var a=e.observeMutationsRoot;Te?Wt():be(Ft("mutationObserverCallbacks",{observeMutationsRoot:a}))}}}},Me=function(t){var e={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return t.toLowerCase().split(" ").reduce(function(a,n){var s=n.toLowerCase().split("-"),o=s[0],r=s.slice(1).join("-");if(o&&r==="h")return a.flipX=!0,a;if(o&&r==="v")return a.flipY=!0,a;if(r=parseFloat(r),isNaN(r))return a;switch(o){case"grow":a.size=a.size+r;break;case"shrink":a.size=a.size-r;break;case"left":a.x=a.x-r;break;case"right":a.x=a.x+r;break;case"up":a.y=a.y-r;break;case"down":a.y=a.y+r;break;case"rotate":a.rotate=a.rotate+r;break}return a},e)},qr={mixout:function(){return{parse:{transform:function(e){return Me(e)}}}},hooks:function(){return{parseNodeAttributes:function(e,a){var n=a.getAttribute("data-fa-transform");return n&&(e.transform=Me(n)),e}}},provides:function(t){t.generateAbstractTransformGrouping=function(e){var a=e.main,n=e.transform,s=e.containerWidth,o=e.iconWidth,r={transform:"translate(".concat(s/2," 256)")},l="translate(".concat(n.x*32,", ").concat(n.y*32,") "),f="scale(".concat(n.size/16*(n.flipX?-1:1),", ").concat(n.size/16*(n.flipY?-1:1),") "),c="rotate(".concat(n.rotate," 0 0)"),u={transform:"".concat(l," ").concat(f," ").concat(c)},h={transform:"translate(".concat(o/2*-1," -256)")},m={outer:r,inner:u,path:h};return{tag:"g",attributes:d({},m.outer),children:[{tag:"g",attributes:d({},m.inner),children:[{tag:a.icon.tag,children:a.icon.children,attributes:d(d({},a.icon.attributes),m.path)}]}]}}}},It={x:0,y:0,width:"100%",height:"100%"};function Pe(i){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return i.attributes&&(i.attributes.fill||t)&&(i.attributes.fill="black"),i}function Jr(i){return i.tag==="g"?i.children:[i]}var Zr={hooks:function(){return{parseNodeAttributes:function(e,a){var n=a.getAttribute("data-fa-mask"),s=n?pt(n.split(" ").map(function(o){return o.trim()})):Sa();return s.prefix||(s.prefix=B()),e.mask=s,e.maskId=a.getAttribute("data-fa-mask-id"),e}}},provides:function(t){t.generateAbstractMask=function(e){var a=e.children,n=e.attributes,s=e.main,o=e.mask,r=e.maskId,l=e.transform,f=s.width,c=s.icon,u=o.width,h=o.icon,m=zn({transform:l,containerWidth:u,iconWidth:f}),v={tag:"rect",attributes:d(d({},It),{},{fill:"white"})},p=c.children?{children:c.children.map(Pe)}:{},b={tag:"g",attributes:d({},m.inner),children:[Pe(d({tag:c.tag,attributes:d(d({},c.attributes),m.path)},p))]},x={tag:"g",attributes:d({},m.outer),children:[b]},A="mask-".concat(r||le()),E="clip-".concat(r||le()),O={tag:"mask",attributes:d(d({},It),{},{id:A,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[v,x]},k={tag:"defs",children:[{tag:"clipPath",attributes:{id:E},children:Jr(h)},O]};return a.push(k,{tag:"rect",attributes:d({fill:"currentColor","clip-path":"url(#".concat(E,")"),mask:"url(#".concat(A,")")},It)}),{children:a,attributes:n}}}},Qr={provides:function(t){var e=!1;W.matchMedia&&(e=W.matchMedia("(prefers-reduced-motion: reduce)").matches),t.missingIconAbstract=function(){var a=[],n={fill:"currentColor"},s={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};a.push({tag:"path",attributes:d(d({},n),{},{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"})});var o=d(d({},s),{},{attributeName:"opacity"}),r={tag:"circle",attributes:d(d({},n),{},{cx:"256",cy:"364",r:"28"}),children:[]};return e||r.children.push({tag:"animate",attributes:d(d({},s),{},{attributeName:"r",values:"28;14;28;28;14;28;"})},{tag:"animate",attributes:d(d({},o),{},{values:"1;0;1;1;0;1;"})}),a.push(r),a.push({tag:"path",attributes:d(d({},n),{},{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),children:e?[]:[{tag:"animate",attributes:d(d({},o),{},{values:"1;0;0;0;0;1;"})}]}),e||a.push({tag:"path",attributes:d(d({},n),{},{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),children:[{tag:"animate",attributes:d(d({},o),{},{values:"0;0;1;1;0;0;"})}]}),{tag:"g",attributes:{class:"missing"},children:a}}}},ts={hooks:function(){return{parseNodeAttributes:function(e,a){var n=a.getAttribute("data-fa-symbol"),s=n===null?!1:n===""?!0:n;return e.symbol=s,e}}}},es=[Vn,Lr,Dr,$r,Wr,jr,Xr,qr,Zr,Qr,ts];lr(es,{mixoutsTo:P});P.noAuto;P.config;var as=P.library,is=P.dom;P.parse;P.findIconDefinition;P.toHtml;P.icon;P.layer;P.text;P.counter;var ns={prefix:"fas",iconName:"heart",icon:[512,512,[128153,128154,128155,128156,128420,129293,129294,129505,9829,10084,61578],"f004","M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z"]},rs={prefix:"fas",iconName:"gear",icon:[512,512,[9881,"cog"],"f013","M195.1 9.5C198.1-5.3 211.2-16 226.4-16l59.8 0c15.2 0 28.3 10.7 31.3 25.5L332 79.5c14.1 6 27.3 13.7 39.3 22.8l67.8-22.5c14.4-4.8 30.2 1.2 37.8 14.4l29.9 51.8c7.6 13.2 4.9 29.8-6.5 39.9L447 233.3c.9 7.4 1.3 15 1.3 22.7s-.5 15.3-1.3 22.7l53.4 47.5c11.4 10.1 14 26.8 6.5 39.9l-29.9 51.8c-7.6 13.1-23.4 19.2-37.8 14.4l-67.8-22.5c-12.1 9.1-25.3 16.7-39.3 22.8l-14.4 69.9c-3.1 14.9-16.2 25.5-31.3 25.5l-59.8 0c-15.2 0-28.3-10.7-31.3-25.5l-14.4-69.9c-14.1-6-27.2-13.7-39.3-22.8L73.5 432.3c-14.4 4.8-30.2-1.2-37.8-14.4L5.8 366.1c-7.6-13.2-4.9-29.8 6.5-39.9l53.4-47.5c-.9-7.4-1.3-15-1.3-22.7s.5-15.3 1.3-22.7L12.3 185.8c-11.4-10.1-14-26.8-6.5-39.9L35.7 94.1c7.6-13.2 23.4-19.2 37.8-14.4l67.8 22.5c12.1-9.1 25.3-16.7 39.3-22.8L195.1 9.5zM256.3 336a80 80 0 1 0 -.6-160 80 80 0 1 0 .6 160z"]},ss={prefix:"fas",iconName:"bomb",icon:[576,512,[128163],"f1e2","M480-16c6.9 0 13 4.4 15.2 10.9l13.5 40.4 40.4 13.5C555.6 51 560 57.1 560 64s-4.4 13-10.9 15.2l-40.4 13.5-13.5 40.4C493 139.6 486.9 144 480 144s-13-4.4-15.2-10.9l-13.5-40.4-40.4-13.5C404.4 77 400 70.9 400 64s4.4-13 10.9-15.2l40.4-13.5 13.5-40.4C467-11.6 473.1-16 480-16zM321.4 97.4c12.5-12.5 32.8-12.5 45.3 0l80 80c12.5 12.5 12.5 32.8 0 45.3l-10.9 10.9c7.9 22 12.2 45.7 12.2 70.5 0 114.9-93.1 208-208 208S32 418.9 32 304 125.1 96 240 96c24.7 0 48.5 4.3 70.5 12.3l10.9-10.9zM144 304c0-53 43-96 96-96 13.3 0 24-10.7 24-24s-10.7-24-24-24c-79.5 0-144 64.5-144 144 0 13.3 10.7 24 24 24s24-10.7 24-24z"]},os={prefix:"fas",iconName:"shield-halved",icon:[512,512,["shield-alt"],"f3ed","M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"]},ls=os,cs={prefix:"fas",iconName:"bolt",icon:[448,512,[9889,"zap"],"f0e7","M338.8-9.9c11.9 8.6 16.3 24.2 10.9 37.8L271.3 224 416 224c13.5 0 25.5 8.4 30.1 21.1s.7 26.9-9.6 35.5l-288 240c-11.3 9.4-27.4 9.9-39.3 1.3s-16.3-24.2-10.9-37.8L176.7 288 32 288c-13.5 0-25.5-8.4-30.1-21.1s-.7-26.9 9.6-35.5l288-240c11.3-9.4 27.4-9.9 39.3-1.3z"]},fs={prefix:"fas",iconName:"coins",icon:[512,512,[],"f51e","M128 96l0-16c0-44.2 86-80 192-80S512 35.8 512 80l0 16c0 30.6-41.3 57.2-102 70.7-2.4-2.8-4.9-5.5-7.4-8-15.5-15.3-35.5-26.9-56.4-35.5-41.9-17.5-96.5-27.1-154.2-27.1-21.9 0-43.3 1.4-63.8 4.1-.2-1.3-.2-2.7-.2-4.1zM432 353l0-46.2c15.1-3.9 29.3-8.5 42.2-13.9 13.2-5.5 26.1-12.2 37.8-20.3l0 15.4c0 26.8-31.5 50.5-80 65zm0-96l0-33c0-4.5-.4-8.8-1-13 15.5-3.9 30-8.6 43.2-14.2s26.1-12.2 37.8-20.3l0 15.4c0 26.8-31.5 50.5-80 65zM0 240l0-16c0-44.2 86-80 192-80s192 35.8 192 80l0 16c0 44.2-86 80-192 80S0 284.2 0 240zm384 96c0 44.2-86 80-192 80S0 380.2 0 336l0-15.4c11.6 8.1 24.5 14.7 37.8 20.3 41.9 17.5 96.5 27.1 154.2 27.1s112.3-9.7 154.2-27.1c13.2-5.5 26.1-12.2 37.8-20.3l0 15.4zm0 80.6l0 15.4c0 44.2-86 80-192 80S0 476.2 0 432l0-15.4c11.6 8.1 24.5 14.7 37.8 20.3 41.9 17.5 96.5 27.1 154.2 27.1s112.3-9.7 154.2-27.1c13.2-5.5 26.1-12.2 37.8-20.3z"]},us={prefix:"fas",iconName:"wind",icon:[512,512,[],"f72e","M288 32c0 17.7 14.3 32 32 32l40 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L32 112c-17.7 0-32 14.3-32 32s14.3 32 32 32l328 0c48.6 0 88-39.4 88-88S408.6 0 360 0L320 0c-17.7 0-32 14.3-32 32zm64 352c0 17.7 14.3 32 32 32l32 0c53 0 96-43 96-96s-43-96-96-96L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-32 0c-17.7 0-32 14.3-32 32zM128 512l40 0c48.6 0 88-39.4 88-88s-39.4-88-88-88L32 336c-17.7 0-32 14.3-32 32s14.3 32 32 32l136 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-40 0c-17.7 0-32 14.3-32 32s14.3 32 32 32z"]};class ds{inputManager;container;constructor(t){this.inputManager=t,this.container=document.getElementById("touch-controls"),this.container&&(this.attachListeners(),("ontouchstart"in window||navigator.maxTouchPoints>0)&&(this.container.style.display="block"))}attachListeners(){this.bindButton("btn-up",w.POWER_UP),this.bindButton("btn-down",w.POWER_DOWN),this.bindButton("btn-left",w.AIM_UP),this.bindButton("btn-right",w.AIM_DOWN),this.bindButton("btn-fire",w.FIRE),this.bindButton("btn-shield",w.TOGGLE_SHIELD),this.bindButton("btn-weapon",w.NEXT_WEAPON)}bindButton(t,e){const a=document.getElementById(t);if(!a)return;const n=o=>{o.preventDefault(),this.inputManager.setInternalState(e,!0),a.style.opacity="1.0",a.style.transform="scale(0.95)"},s=o=>{o.preventDefault(),this.inputManager.setInternalState(e,!1),a.style.opacity="0.7",a.style.transform="scale(1.0)"};a.addEventListener("mousedown",n),a.addEventListener("touchstart",n,{passive:!1}),a.addEventListener("mouseup",s),a.addEventListener("mouseleave",s),a.addEventListener("touchend",s),a.addEventListener("touchcancel",s)}}as.add(rs,cs,ss,ns,ls,fs,us);is.watch();document.querySelector("#app").innerHTML=`
  <div id="game-container">
    <canvas id="game-canvas"></canvas>
    <div id="ui-layer"></div>
  </div>
`;const hs=document.getElementById("game-canvas"),ka=new Ba(hs);ka.start();new ds(ka.inputManager);console.log("Game Started");
