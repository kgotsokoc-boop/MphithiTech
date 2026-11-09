/* Mphithi-Tech Guide Assistant
   Self-contained chat widget (injects its own CSS + HTML). Add before </body>:
   <script src="assistant.js"></script>
   It is a rule-based guide: it needs no server or API key. */
(function () {
  var EMAIL = 'kgotsokoc@gmail.com', SPONSOR = 'sponsors@mphithitech.co.za';
  var TOPICS = ['Website/app failure', 'Performance optimization', 'Custom software', 'Maintenance & support', 'Sponsorship', 'Other'];

  var css = '#mt-btn{position:fixed;left:1.2rem;bottom:1.2rem;z-index:1000;display:flex;align-items:center;gap:.5rem;background:linear-gradient(135deg,#38bdf8,#6366f1);color:#fff;border:0;border-radius:50px;padding:.8rem 1.2rem;font:600 .95rem "Segoe UI",system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(56,189,248,.4)}' +
    '#mt-box{position:fixed;left:1.2rem;bottom:5rem;z-index:1000;width:min(380px,calc(100vw - 2.4rem));height:min(560px,calc(100vh - 7rem));background:#0f172a;border:1px solid #334155;border-radius:16px;display:none;flex-direction:column;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.6);font:.95rem/1.5 "Segoe UI",system-ui,sans-serif;color:#e2e8f0}' +
    '#mt-box.open{display:flex}' +
    '#mt-head{background:#1e293b;padding:.9rem 1rem;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #334155}' +
    '#mt-head b{color:#f1f5f9}#mt-head small{display:block;color:#94a3b8;font-size:.75rem}' +
    '#mt-head button{background:none;border:0;color:#94a3b8;font-size:1.2rem;cursor:pointer;margin-left:.4rem}' +
    '#mt-log{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.6rem}' +
    '.mt-m{max-width:88%;padding:.6rem .85rem;border-radius:12px;word-wrap:break-word}' +
    '.mt-b{background:#1e293b;border:1px solid #334155;align-self:flex-start}.mt-b a{color:#38bdf8}' +
    '.mt-u{background:#38bdf8;color:#0f172a;align-self:flex-end}' +
    '.mt-chips{display:flex;flex-wrap:wrap;gap:.4rem;align-self:flex-start}' +
    '.mt-chips button{background:transparent;color:#93c5fd;border:1px solid #334155;border-radius:50px;padding:.3rem .8rem;font:inherit;font-size:.85rem;cursor:pointer}' +
    '.mt-chips button:hover{border-color:#38bdf8;color:#38bdf8}' +
    '#mt-form{display:flex;gap:.5rem;padding:.7rem;border-top:1px solid #334155;background:#1e293b}' +
    '#mt-in{flex:1;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#e2e8f0;padding:.6rem .8rem;font:inherit}' +
    '#mt-in:focus{outline:2px solid #38bdf8;border-color:transparent}' +
    '#mt-form button{background:#38bdf8;border:0;border-radius:8px;padding:0 1rem;font-weight:700;cursor:pointer;color:#0f172a}';

  // Knowledge base: first matching rule wins
  var KB = [
    { k: /^(hi|hello|hey|howzit|sawubona|dumela|good (morning|afternoon|evening))\b/, a: 'Hello! 👋 I\'m the Mphithi-Tech guide. I can explain our services, show you around the site, or help you send a request.', c: ['Send a request', 'How do I use this site?', 'Our services'] },
    { k: /(send|submit|make|start).*(request|enquiry|inquiry)|request|quote|hire|book|need help|help me|fix my|get started/, flow: true },
    { k: /how.*(use|work|navigate)|guide|tour|where.*(find|go)|site map|menu/, a: 'Here is a quick tour:<br>• <a href="index.html">Home</a>: overview and a quick contact form<br>• <a href="services.html">Services</a>: everything we offer<br>• <a href="portfolio.html">Portfolio</a>: example problems we solve (filter by type)<br>• <a href="about.html">About</a>: the founder and our mission<br>• <a href="contact.html">Contact</a>: form, emails and FAQ<br>On a phone, tap ☰ to open the menu.', c: ['Send a request', 'What do I need to send?'] },
    { k: /service|offer|what do you do|solutions?/, a: 'We offer: app failure diagnosis &amp; repair, website performance optimization, custom software development, website fault detection, maintenance &amp; support, and tech consulting. Details are on the <a href="services.html">Services page</a>.', c: ['Send a request', 'Do you build software?'] },
    { k: /\bbuild|develop|custom|web app|mobile app|software/, a: 'Yes. Besides fixing broken systems, we design and build custom web and mobile apps, integrations and system architecture tailored to your business.', c: ['Send a request', 'Pricing'] },
    { k: /slow|speed|performance|load|vitals/, a: 'For slow sites we run a performance audit, reduce load time, and tune Core Web Vitals so pages feel fast on every device.', c: ['Send a request', 'Our services'] },
    { k: /crash|error|bug|broken|down|fail|not working|outage/, a: 'Sorry you\'re dealing with that. We diagnose the root cause first, then apply a lasting fix instead of a patch. The fastest way to start is to send us the details.', c: ['Send a request', 'What do I need to send?'] },
    { k: /need to send|prepare|information|details|what should i/, a: 'To speed up diagnosis, include:<br>1. The site/app link<br>2. The exact error message or what goes wrong<br>3. When it started and what changed recently<br>4. Screenshots (you can reply to our email with them)', c: ['Send a request'] },
    { k: /price|cost|how much|rate|fee|pay/, a: 'Pricing depends on the problem and the scope. We confirm a plan and cost after diagnosing the issue, so send us the details and we\'ll come back with a quote.', c: ['Send a request'] },
    { k: /how (long|fast|soon)|turnaround|time|when/, a: 'We aim to reply within one business day. Fix times depend on the issue; we give you a timeline once we\'ve diagnosed it.', c: ['Send a request'] },
    { k: /sponsor|partner|invest|support us/, a: 'We welcome sponsors and partners who want to grow local tech talent. Choose "Sponsorship" in the request flow or email <a href="mailto:' + SPONSOR + '">' + SPONSOR + '</a>.', c: ['Send a request'] },
    { k: /who|founder|comfort|about|tut|team|company/, a: 'Mphithi-Tech Holdings (Pty) Ltd was founded by Comfort Oratile Kgotsoko, a software developer studying at Tshwane University of Technology. Read more on the <a href="about.html">About page</a>.', c: ['Our services', 'Contact details'] },
    { k: /contact|email|phone|call|reach|whatsapp|address/, a: 'Email us at <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> or use the <a href="contact.html">contact page</a>. I can also prepare a message for you right here.', c: ['Send a request'] },
    { k: /thank|thanks|cheers|great|awesome/, a: 'You\'re welcome! Anything else I can help with?', c: ['Send a request', 'How do I use this site?'] },
    { k: /bye|goodbye|that\'s all/, a: 'Goodbye! Come back any time. 👋' }
  ];

  var box, log, input, flow = null;

  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function esc(s) { return s.replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }
  function scroll() { log.scrollTop = log.scrollHeight; }
  function clearChips() { var c = log.querySelectorAll('.mt-chips'); c.forEach(function (x) { x.remove(); }); }

  function bot(html, chips) {
    clearChips();
    log.appendChild(el('div', 'mt-m mt-b', html));
    if (chips && chips.length) {
      var w = el('div', 'mt-chips');
      chips.forEach(function (t) { var b = el('button', '', esc(t)); b.type = 'button'; b.onclick = function () { handle(t); }; w.appendChild(b); });
      log.appendChild(w);
    }
    scroll();
  }
  function user(text) { clearChips(); log.appendChild(el('div', 'mt-m mt-u', esc(text))); scroll(); }

  function startFlow() {
    flow = { step: 'name', d: {} };
    bot('Great, let\'s prepare your request. It takes under a minute (type <b>cancel</b> any time).<br><br>What is your <b>name</b>?');
  }

  function runFlow(t) {
    var d = flow.d;
    if (/^(cancel|stop|restart|start over)$/i.test(t)) { flow = null; return bot('No problem, request cancelled.', ['Send a request', 'Our services']); }
    if (flow.step === 'name') { d.name = t; flow.step = 'email'; return bot('Nice to meet you, ' + esc(t) + '. What\'s your <b>email address</b>?'); }
    if (flow.step === 'email') {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t)) return bot('That email doesn\'t look right. Please enter it like <i>name@example.com</i>.');
      d.email = t; flow.step = 'topic'; return bot('What do you need help with?', TOPICS);
    }
    if (flow.step === 'topic') {
      var m = TOPICS.filter(function (x) { return x.toLowerCase() === t.toLowerCase(); })[0];
      if (!m) return bot('Please pick one of the options below.', TOPICS);
      d.topic = m; flow.step = 'msg';
      return bot('Describe the problem or goal. Include the link, any error message, and when it started.');
    }
    if (flow.step === 'msg') {
      if (t.length < 10) return bot('Could you add a bit more detail? A sentence or two helps us diagnose faster.');
      d.msg = t; flow.step = 'confirm';
      return bot('Here\'s your request:<br><b>Name:</b> ' + esc(d.name) + '<br><b>Email:</b> ' + esc(d.email) + '<br><b>Topic:</b> ' + esc(d.topic) + '<br><b>Details:</b> ' + esc(d.msg) + '<br><br>Ready to send? This opens your email app with everything filled in.', ['Send now', 'Start over']);
    }
    if (flow.step === 'confirm') {
      if (/^(send|send now|yes|ok|okay|confirm)$/i.test(t)) {
        var to = d.topic === 'Sponsorship' ? SPONSOR : EMAIL;
        var subj = encodeURIComponent('[' + d.topic + '] Enquiry from ' + d.name);
        var body = encodeURIComponent('Name: ' + d.name + '\nEmail: ' + d.email + '\n\n' + d.msg);
        flow = null;
        bot('Opening your email app… just press <b>Send</b> there. If nothing opens, email <a href="mailto:' + to + '">' + to + '</a> directly. We aim to reply within one business day. ✅', ['Our services', 'How do I use this site?']);
        location.href = 'mailto:' + to + '?subject=' + subj + '&body=' + body;
        return;
      }
      return bot('Choose <b>Send now</b> to submit, or <b>Start over</b> to redo it.', ['Send now', 'Start over']);
    }
  }

  function handle(text) {
    text = text.trim(); if (!text) return;
    user(text);
    if (flow) { if (/^start over$/i.test(text)) return startFlow(); return runFlow(text); }
    var low = text.toLowerCase();
    for (var i = 0; i < KB.length; i++) {
      if (KB[i].k.test(low)) { if (KB[i].flow) return startFlow(); return bot(KB[i].a, KB[i].c); }
    }
    bot('I\'m not sure about that one, but I can help with our services, how to use the site, or sending a request to the team.', ['Our services', 'How do I use this site?', 'Send a request']);
  }

  function init() {
    var st = el('style'); st.textContent = css; document.head.appendChild(st);
    var btn = el('button', '', '💬 Ask Mphithi-Tech'); btn.id = 'mt-btn'; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'mt-box');
    box = el('div'); box.id = 'mt-box'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Mphithi-Tech guide assistant');
    box.innerHTML = '<div id="mt-head"><div><b>Mphithi-Tech Guide</b><small>Guides, answers &amp; requests</small></div><div><button type="button" id="mt-reset" title="Restart chat" aria-label="Restart chat">↺</button><button type="button" id="mt-x" aria-label="Close chat">✕</button></div></div><div id="mt-log" aria-live="polite"></div><form id="mt-form"><input id="mt-in" placeholder="Type your question…" autocomplete="off" aria-label="Your message"><button type="submit">Send</button></form>';
    document.body.appendChild(box); document.body.appendChild(btn);
    log = box.querySelector('#mt-log'); input = box.querySelector('#mt-in');

    function greet() { log.innerHTML = ''; flow = null; bot('Hi!  I\'m the Mphithi-Tech guide. I can show you around, explain what we do, and help you send a request to our team. What would you like to do?', ['Send a request', 'How do I use this site?', 'Our services', 'Pricing']); }
    function toggle(open) {
      var o = typeof open === 'boolean' ? open : !box.classList.contains('open');
      box.classList.toggle('open', o); btn.setAttribute('aria-expanded', o);
      if (o) { if (!log.children.length) greet(); input.focus(); }
    }
    btn.onclick = function () { toggle(); };
    box.querySelector('#mt-x').onclick = function () { toggle(false); btn.focus(); };
    box.querySelector('#mt-reset').onclick = greet;
    box.querySelector('#mt-form').onsubmit = function (e) { e.preventDefault(); var v = input.value; input.value = ''; handle(v); };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('open')) toggle(false); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
