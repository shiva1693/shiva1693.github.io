/* helpers */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* HERO (name & role only; chips are static in HTML) */
(function renderHero(p){
  $("#name").textContent = p.name;
  $("#role").textContent = p.role;
  $("#emailLink").href = `mailto:${p.email}`;
  $("#emailLink").textContent = p.email;
})(DATA.person);

/* ABOUT */
(function renderAbout(){
  const wrap = document.createElement("div");
  const p = document.createElement("p"); p.className="muted"; p.textContent = DATA.person.summary;
  const badges = document.createElement("div"); badges.className="badges";
  DATA.person.badges.forEach(b => {
    const s = document.createElement("span"); s.className="badge"; s.textContent=b; badges.append(s);
  });
  wrap.append(p,badges);
  $("#aboutContent").append(wrap);
})();

/* RESUME */
(function renderResume(){
  const xp = $("#experience");
  DATA.experience.forEach(role => {
    const card = document.createElement("article"); card.className="card";
    card.innerHTML = `<div class="label">${role.period}${role.location?` • ${role.location}`:""}</div>
      <h4>${role.company} — ${role.title}</h4>`;
    const ul = document.createElement("ul");
    role.bullets.forEach(b => { const li=document.createElement("li"); li.textContent=b; ul.append(li); });
    card.append(ul);
    xp.append(card);
  });

  const skills = $("#skills");
  DATA.skills.forEach(s => { const t=document.createElement("span"); t.className="tag"; t.textContent=s; skills.append(t); });

  DATA.education.forEach(e => { const li=document.createElement("li"); li.textContent=e; $("#education").append(li); });
  DATA.awards.forEach(a => { const li=document.createElement("li"); li.textContent=a; $("#awards").append(li); });
})();

/* PORTFOLIO */
(function renderPortfolio(){
  const grid = $("#portfolioGrid");
  const items = [
    ...DATA.portfolio.certifications.map(x=>({...x,type:"certifications"})),
    ...DATA.portfolio.projects.map(x=>({...x,type:"projects"})),
    ...DATA.portfolio.badges.map(x=>({...x,type:"badges"}))
  ];
  function draw(filter="all"){
    grid.innerHTML="";
    items.filter(i => filter==="all" || i.type===filter).forEach(i=>{
      const art=document.createElement("article"); art.className="card";
      art.innerHTML = `<span class="label">${i.label || i.type[0].toUpperCase()+i.type.slice(1)}</span>
        <h3>${i.title}</h3>
        <p class="small">${i.subtitle||""}</p>
        <div class="cta"><a class="btn" href="${i.url||'#'}" target="_blank" rel="noopener">Open</a></div>`;
      grid.append(art);
    });
  }
  draw();
  $$(".filters .pill").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      $$(".filters .pill").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      draw(btn.dataset.filter);
      $$(".filters .pill").forEach(b=>b.setAttribute("aria-selected", b===btn ? "true":"false"));
    });
  });
})();

/* BLOG */
(function renderBlog(){
  const list = $("#blogList");
  DATA.blog.forEach(p=>{
    const el=document.createElement("a");
    el.className="post"; el.href=p.url||"#"; el.target="_blank"; el.rel="noopener";
    el.innerHTML = `<time>${p.date}</time><h3>${p.title}</h3><p class="small">${p.excerpt}</p>`;
    list.append(el);
  });
})();

/* NAV highlight on scroll */
(function scrollSpy(){
  const nav = $$(".sidenav a");
  const secs = $$("main section");
  function setActive(idx){
    nav.forEach(n=>n.classList.remove("active"));
    if(idx>=0) nav[idx].classList.add("active");
  }
  function onScroll(){
    let idx = secs.findIndex(s => s.getBoundingClientRect().top > 90);
    idx = (idx === -1 ? secs.length : idx) - 1;
    setActive(idx);
  }
  document.addEventListener("scroll", onScroll, {passive:true}); onScroll();
})();

/* Formspree AJAX submit */
(function wireContactForm(){
  const form = document.getElementById("contactForm");
  const alertBox = document.getElementById("contactAlert");
  if (!form) return;

  function showAlert(msg, ok=true){
    alertBox.textContent = msg;
    alertBox.className = "alert " + (ok ? "alert--ok" : "alert--err");
    alertBox.hidden = false;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertBox.hidden = true;

    if (!form.name.value.trim() || !form.email.value.trim() || !form.message.value.trim()) {
      showAlert("Please fill out all required fields.", false);
      return;
    }

    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      });

      if (res.ok) {
        form.reset();
        showAlert("Thanks! Your message has been sent.");
      } else {
        const data = await res.json().catch(() => ({}));
        const err = data?.errors?.[0]?.message || "Something went wrong. Please try again later.";
        showAlert(err, false);
      }
    } catch (err) {
      showAlert("Network error. Please check your connection and try again.", false);
    }
  });
})();

/* footer year */
document.getElementById("year").textContent = new Date().getFullYear();
