(function(){
  var EMAIL='info@mphithitech.co.za';
  // Mobile menu
  var t=document.querySelector('.menu-toggle'),n=document.querySelector('[data-nav]');
  if(t&&n){t.addEventListener('click',function(){var o=n.classList.toggle('open');t.setAttribute('aria-expanded',o)});
    n.addEventListener('click',function(e){if(e.target.tagName==='A')n.classList.remove('open')})}
  // Year
  document.querySelectorAll('[data-year]').forEach(function(e){e.textContent=new Date().getFullYear()});
  // Back to top
  var b=document.createElement('button');b.className='to-top';b.setAttribute('aria-label','Back to top');b.textContent='↑';
  b.onclick=function(){window.scrollTo({top:0,behavior:'smooth'})};document.body.appendChild(b);
  addEventListener('scroll',function(){b.classList.toggle('show',scrollY>600)});
  // Contact form -> opens visitor's email app (no backend needed)
  document.querySelectorAll('form[data-contact]').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      if(f.hp&&f.hp.value)return;
      var ok=true;
      ['name','email','message'].forEach(function(k){
        var el=f.elements[k],box=el.closest('.field'),v=el.value.trim();
        var bad=!v||(k==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));
        box.classList.toggle('bad',bad);if(bad)ok=false});
      if(!ok)return;
      var s=encodeURIComponent('['+f.topic.value+'] Enquiry from '+f.name.value.trim());
      var body=encodeURIComponent('Name: '+f.name.value.trim()+'\nEmail: '+f.email.value.trim()+'\nPhone: '+(f.phone.value||'-')+'\n\n'+f.message.value.trim());
      var m=f.querySelector('.form-msg');m.style.display='block';
      m.textContent='Opening your email app… if nothing happens, email us at '+EMAIL+'.';
      location.href='mailto:'+(f.topic.value==='Sponsorship'?'sponsors@mphithitech.co.za':EMAIL)+'?subject='+s+'&body='+body;
    });
  });
  // Portfolio filter
  var fb=document.querySelectorAll('.filters button');
  fb.forEach(function(x){x.addEventListener('click',function(){
    fb.forEach(function(y){y.classList.remove('active')});x.classList.add('active');
    document.querySelectorAll('[data-cat]').forEach(function(c){
      c.style.display=(x.dataset.f==='all'||c.dataset.cat===x.dataset.f)?'':'none'})})});
})();
