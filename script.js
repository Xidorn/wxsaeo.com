const menuBtn = document.querySelector('.menu-btn');
const links = document.querySelector('.links');
if (menuBtn && links) {
  menuBtn.addEventListener('click', () => links.classList.toggle('open'));
}

document.querySelectorAll('[data-year]').forEach(el => {
  el.textContent = new Date().getFullYear();
});

const form = document.querySelector('#aeoForm');
const ipInput = document.querySelector('input[name="ip"]');
const uaInput = document.querySelector('input[name="user_agent"]');
const pageInput = document.querySelector('input[name="page_url"]');

if (uaInput) uaInput.value = navigator.userAgent || '';
if (pageInput) pageInput.value = location.href;

async function loadNetworkInfo(){
  try{
    const res = await fetch('https://api.ipify.org?format=json', {cache:'no-store'});
    const data = await res.json();
    if(ipInput) ipInput.value = data.ip || '';
  }catch(e){
    if(ipInput) ipInput.value = '';
  }
}
loadNetworkInfo();

if(form){
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const original = submitBtn ? submitBtn.textContent : '';
    if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = '正在提交...'; }
    try{
      const endpoint = form.getAttribute('action');
      const res = await fetch(endpoint, {method:'POST', body:new FormData(form), mode:'cors'});
      if(!res.ok) throw new Error('submit failed');
      alert('提交成功，我们会尽快与您联系。');
      form.reset();
      if (uaInput) uaInput.value = navigator.userAgent || '';
      if (pageInput) pageInput.value = location.href;
      loadNetworkInfo();
    }catch(err){
      alert('提交未完成，请稍后重试，或直接通过电话、邮箱、微信联系王先生。');
    }finally{
      if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = original; }
    }
  });
}