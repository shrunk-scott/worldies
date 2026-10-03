const tabs=[...document.querySelectorAll('.tab')];
const views=[...document.querySelectorAll('.view')];
function showView(id){
  views.forEach(v=>v.classList.toggle('active',v.id===id));
  tabs.forEach(t=>t.classList.toggle('active',t.dataset.view===id));
  window.scrollTo({top:0,behavior:'smooth'});
}
tabs.forEach(t=>t.addEventListener('click',()=>showView(t.dataset.view)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.go)));
document.querySelectorAll('.pick').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const group=btn.parentElement;
    group.querySelectorAll('.pick').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
  });
});
const jb=document.getElementById('jokerBtn');
const banner=document.getElementById('jokerBanner');
jb.addEventListener('click',()=>{
  const on=banner.style.display==='none';
  banner.style.display=on?'block':'none';
  jb.innerHTML=on
    ? '<span class="icon sm"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 2h2l1.1 4.2L18 7l-3 3 .9 4-3.9-2.2L8.1 14 9 10 6 7l3.9-.8L11 2z"/><path d="M12 13.2l5.1 2.9L16 10.9l3.8-3.7-5.2-1-2.6-4.8-2.6 4.8-5.2 1L8 10.9 6.9 16.1 12 13.2z" opacity=".35"/></svg></span> Joker selected'
    : '<span class="icon sm"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 2h2l1.1 4.2L18 7l-3 3 .9 4-3.9-2.2L8.1 14 9 10 6 7l3.9-.8L11 2z"/><path d="M12 13.2l5.1 2.9L16 10.9l3.8-3.7-5.2-1-2.6-4.8-2.6 4.8-5.2 1L8 10.9 6.9 16.1 12 13.2z" opacity=".35"/></svg></span> Use Joker this round';
  jb.classList.toggle('good',on);
});



/* ---------- Uploaded STL 3D background ---------- */
(async function initTrophy3D(){
  const canvas = document.getElementById('trophy3d');
  if (!canvas || !window.THREE || !THREE.STLLoader) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 1000);
  camera.position.set(0, 0.5, 8);

  const root = new THREE.Group();
  scene.add(root);

  const material = new THREE.MeshStandardMaterial({
    color: 0xcfd6dd,
    metalness: 0.88,
    roughness: 0.22
  });

  const loader = new THREE.STLLoader();

  function b64ToArrayBuffer(b64){
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for(let i=0;i<len;i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  
async function loadStlGeometry(){
  const response = await fetch('assets/Collingwood_Magpies_2023.stl');
  if(!response.ok) throw new Error('Unable to load 3D model');
  const buffer = await response.arrayBuffer();
  return loader.parse(buffer);
}

try {
    const geometry = await loadStlGeometry();
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();

    const box = geometry.boundingBox;
    const center = new THREE.Vector3();
    box.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);

    geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    geometry.boundingBox.getSize(size);

    const mesh = new THREE.Mesh(geometry, material);

    // Normalize STL regardless of source units.
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetSize = 5.1;
    const scale = targetSize / maxDim;
    mesh.scale.setScalar(scale);

    // Orient model for portrait presentation.
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = 0.08;

    root.add(mesh);

    // Ground shadow.
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(2.5, 64),
      new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.22})
    );
    shadow.rotation.x = -Math.PI/2;
    shadow.position.y = -2.8;
    shadow.scale.y = 0.38;
    scene.add(shadow);

  } catch(err) {
    console.error('Could not parse uploaded STL:', err);
    return;
  }

  scene.add(new THREE.HemisphereLight(0xeaf3ff, 0x0a0e14, 1.15));

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(4, 6, 7);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x6ca8ff, 1.0);
  fill.position.set(-5, 2, 4);
  scene.add(fill);

  const rim = new THREE.PointLight(0x8b5cf6, 1.25, 18);
  rim.position.set(0, 2, -5);
  scene.add(rim);

  function resize(){
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w/h;
    camera.updateProjectionMatrix();

    const mobile = w < 760;
    const portrait = h > w;
    root.scale.setScalar(mobile ? (portrait ? 0.93 : 0.86) : 0.88);
    root.position.y = mobile ? 0.35 : 0.15;
    camera.position.z = mobile ? (portrait ? 8.5 : 9.0) : 8.3;
  }
  resize();
  window.addEventListener('resize', resize, {passive:true});

  let last = performance.now();
  function animate(now){
    const dt = Math.min((now-last)/1000, 0.05);
    last = now;

    root.rotation.y += dt * 0.28;
    root.rotation.x = Math.sin(now*0.00045)*0.035;
    root.position.y += Math.sin(now*0.0007)*0.0007;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();


const loginScreen=document.getElementById('loginScreen');
const userChip=document.getElementById('userChip');
const avatar=document.getElementById('avatar');
function demoSignIn(name='Scott'){
  loginScreen.classList.add('hidden');
  userChip.style.display='flex';
  avatar.textContent=(name.trim()[0]||'U').toUpperCase();
  localStorage.setItem('afl27.demoUser',name);
}
document.getElementById('googleLogin').addEventListener('click',()=>demoSignIn('Scott'));
document.getElementById('emailLoginBtn').addEventListener('click',()=>{
  const email=document.getElementById('emailLogin').value.trim();
  demoSignIn(email?email.split('@')[0]:'Scott');
});
document.getElementById('logoutBtn').addEventListener('click',()=>{
  localStorage.removeItem('afl27.demoUser');
  userChip.style.display='none';
  loginScreen.classList.remove('hidden');
});
const savedUser=localStorage.getItem('afl27.demoUser');
if(savedUser) demoSignIn(savedUser);

/* AFL ladder / fixture switch */
const aflSwitchBtns=[...document.querySelectorAll('[data-afl-view]')];
const aflPanels=[...document.querySelectorAll('.afl-panel')];
function showAflPanel(id){
  aflPanels.forEach(p=>p.classList.toggle('active',p.id===id));
  aflSwitchBtns.forEach(b=>b.classList.toggle('active',b.dataset.aflView===id));
}
aflSwitchBtns.forEach(b=>b.addEventListener('click',()=>showAflPanel(b.dataset.aflView)));
document.querySelectorAll('[data-open-afl]').forEach(b=>{
  b.addEventListener('click',()=>{
    setTimeout(()=>{
      showAflPanel(b.dataset.openAfl);
      const el=document.querySelector('.afl-switch');
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    },60);
  });
});


/* ---------- Motion hooks ---------- */
document.querySelectorAll('.pick').forEach(btn=>{
  btn.addEventListener('click',()=>{
    btn.classList.remove('just-selected');
    void btn.offsetWidth;
    btn.classList.add('just-selected');
    setTimeout(()=>btn.classList.remove('just-selected'),420);
  });
});

if (typeof jb !== 'undefined' && jb){
  jb.addEventListener('click',()=>{
    const isOn = banner && banner.style.display !== 'none';
    jb.classList.toggle('joker-active',isOn);
    if (banner && isOn){
      banner.classList.remove('showing');
      void banner.offsetWidth;
      banner.classList.add('showing');
      setTimeout(()=>banner.classList.remove('showing'),400);
    }
  });
}

/* subtle stagger on view entry */
const staggerView = (view)=>{
  const items=[...view.querySelectorAll('.card,.banner,.section h2')].slice(0,10);
  items.forEach((el,i)=>{
    el.animate(
      [
        {opacity:0,transform:'translateY(9px)'},
        {opacity:1,transform:'translateY(0)'}
      ],
      {duration:280,delay:i*32,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'}
    );
  });
};

const _showView = showView;
showView = function(id){
  _showView(id);
  const view=document.getElementById(id);
  if(view && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    staggerView(view);
  }
};

/* score/ladder feedback demo */
document.querySelectorAll('.table tbody tr').forEach(row=>{
  row.addEventListener('click',()=>{
    row.classList.remove('row-flash');
    void row.offsetWidth;
    row.classList.add('row-flash');
    setTimeout(()=>row.classList.remove('row-flash'),600);
  });
});


/* ---------- Profile ---------- */
const PROFILE_KEY='afl27.profile';
const CLUB_CODES={'Adelaide':'ADE','Brisbane':'BRI','Carlton':'CAR','Collingwood':'COL','Essendon':'ESS','Fremantle':'FRE','Geelong':'GEE','Gold Coast':'GC','GWS':'GWS','Hawthorn':'HAW','Melbourne':'MEL','North Melbourne':'NM','Port Adelaide':'PA','Richmond':'RIC','St Kilda':'STK','Sydney':'SYD','West Coast':'WCE','Western Bulldogs':'WB'};
const defaultProfile={firstName:'Scott',lastName:'',displayName:'Scott',nickname:'scott',email:'',phone:'',club:'',bio:'',toggles:{showFullName:true,showClub:true,showStreak:true,tipReminders:true,streakReminders:true,roundResults:true}};
function getProfile(){try{const saved=JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');return {...defaultProfile,...(saved||{}),toggles:{...defaultProfile.toggles,...((saved||{}).toggles||{})}}}catch(e){return {...defaultProfile,toggles:{...defaultProfile.toggles}}}}
function setInput(id,val){const el=document.getElementById(id);if(el)el.value=val||''}
function renderClubPreview(club){const wrap=document.getElementById('profileClubPreview'),code=document.getElementById('profileClubCode'),name=document.getElementById('profileClubName');if(!wrap||!code||!name)return;if(!club){wrap.hidden=true;return}wrap.hidden=false;code.textContent=CLUB_CODES[club]||'AFL';name.textContent=club}
function updateProfileHero(p){const full=[p.firstName,p.lastName].filter(Boolean).join(' ').trim();const publicName=(p.toggles.showFullName&&full)?full:(p.displayName||p.firstName||'User');document.getElementById('profileHeroName').textContent=publicName;document.getElementById('profileHeroHandle').textContent='@'+(p.nickname||String(publicName).toLowerCase().replace(/\s+/g,''));const initial=(publicName.trim()[0]||'U').toUpperCase();document.getElementById('profileAvatar').textContent=initial;if(avatar)avatar.textContent=initial}
function loadProfile(){const p=getProfile();setInput('pfFirstName',p.firstName);setInput('pfLastName',p.lastName);setInput('pfDisplayName',p.displayName);setInput('pfNickname',p.nickname);setInput('pfEmail',p.email);setInput('pfPhone',p.phone);setInput('pfClub',p.club);setInput('pfBio',p.bio);document.querySelectorAll('[data-profile-toggle]').forEach(btn=>btn.classList.toggle('on',!!p.toggles[btn.dataset.profileToggle]));renderClubPreview(p.club);updateProfileHero(p)}
function collectProfile(){const current=getProfile(),value=id=>document.getElementById(id)?.value.trim()||'',toggles={...current.toggles};document.querySelectorAll('[data-profile-toggle]').forEach(btn=>toggles[btn.dataset.profileToggle]=btn.classList.contains('on'));return {firstName:value('pfFirstName'),lastName:value('pfLastName'),displayName:value('pfDisplayName'),nickname:value('pfNickname').replace(/^@/,''),email:value('pfEmail'),phone:value('pfPhone'),club:document.getElementById('pfClub')?.value||'',bio:value('pfBio').slice(0,140),toggles}}
document.querySelectorAll('[data-profile-toggle]').forEach(btn=>btn.addEventListener('click',()=>{btn.classList.toggle('on');btn.setAttribute('aria-pressed',btn.classList.contains('on')?'true':'false')}));
document.getElementById('pfClub')?.addEventListener('change',e=>renderClubPreview(e.target.value));
document.getElementById('saveProfileBtn')?.addEventListener('click',()=>{const p=collectProfile();localStorage.setItem(PROFILE_KEY,JSON.stringify(p));updateProfileHero(p);renderClubPreview(p.club);const saved=document.getElementById('profileSaved');if(saved){saved.classList.remove('show');void saved.offsetWidth;saved.classList.add('show');setTimeout(()=>saved.classList.remove('show'),1700)}});
document.getElementById('avatar')?.addEventListener('click',()=>showView('profile'));
loadProfile();


/* ---------- 2027 modern interaction layer ---------- */
document.querySelectorAll('[data-home-tip]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-home-tip]').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');
    const status=document.getElementById('homeTipStatus');
    if(status){
      status.textContent='Your '+btn.dataset.homeTip+' tip is saved · hidden from other users until bounce.';
      status.animate([{opacity:.45,transform:'translateY(3px)'},{opacity:1,transform:'none'}],
        {duration:320,easing:'cubic-bezier(.22,1,.36,1)'});
    }
    if(navigator.vibrate) navigator.vibrate(12);
  });
});

/* Subtle number count-up when Home becomes visible */
function animateHomeNumbers(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('#home .animated-num').forEach(el=>{
    const target=Number(el.dataset.target||0);
    const duration=520;
    const start=performance.now();
    function tick(now){
      const p=Math.min((now-start)/duration,1);
      const eased=1-Math.pow(1-p,3);
      el.textContent=Math.round(target*eased);
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
setTimeout(animateHomeNumbers,120);

/* Context island responds to navigation */
document.getElementById('contextIsland')?.addEventListener('click',()=>{
  if(navigator.vibrate) navigator.vibrate(8);
});

/* pointer/device parallax for the 3D background canvas without interfering with controls */
const trophyCanvas=document.getElementById('trophy3d');
if(trophyCanvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  let tx=0,ty=0,cx=0,cy=0;
  window.addEventListener('pointermove',e=>{
    tx=(e.clientX/window.innerWidth-.5)*8;
    ty=(e.clientY/window.innerHeight-.5)*6;
  },{passive:true});
  const parallax=()=>{
    cx+=(tx-cx)*.055; cy+=(ty-cy)*.055;
    trophyCanvas.style.transform=`translate3d(${cx}px,${cy}px,0) scale(1.015)`;
    requestAnimationFrame(parallax);
  };
  requestAnimationFrame(parallax);
}

/* quick cards using AFL switch also open the correct sub-panel */
document.querySelectorAll('.quick-card[data-open-afl]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    setTimeout(()=>{
      if(typeof showAflPanel==='function') showAflPanel(btn.dataset.openAfl);
    },120);
  });
});