var CONFIG = {
  api: {
    contact: 'https://lianxi.wangxiansheng.com/hezuo.php'
  }
};

function byId(id) {
  return document.getElementById(id);
}

function setContactResult(message, isSuccess) {
  var resultElement = byId('contact-result');
  if (!resultElement) return;
  resultElement.textContent = message;
  resultElement.className = 'contact-form__result is-visible ' + (isSuccess ? 'contact-form__result--success' : 'contact-form__result--error');
}

async function getPublicIp() {
  var endpoints = [
    'https://api64.ipify.org?format=json',
    'https://api.ipify.org?format=json'
  ];

  for (var i = 0; i < endpoints.length; i++) {
    try {
      var response = await fetch(endpoints[i], { method: 'GET', cache: 'no-store' });
      var data = await response.json();
      if (data && data.ip) return data.ip;
    } catch (error) {}
  }

  throw new Error('公网 IP 获取失败');
}

function getBrowserInfo() {
  var nav = window.navigator || {};
  var screenInfo = window.screen || {};
  var timezone = '';

  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch (error) {
    timezone = '';
  }

  var connection = nav.connection || nav.mozConnection || nav.webkitConnection || null;

  return {
    user_agent: nav.userAgent || '',
    language: nav.language || '',
    languages: Array.isArray(nav.languages) ? nav.languages.join(', ') : '',
    platform: nav.platform || '',
    cookie_enabled: typeof nav.cookieEnabled === 'boolean' ? nav.cookieEnabled : '',
    do_not_track: nav.doNotTrack || window.doNotTrack || '',
    hardware_concurrency: nav.hardwareConcurrency || '',
    device_memory: nav.deviceMemory || '',
    max_touch_points: nav.maxTouchPoints || '',
    screen_width: screenInfo.width || '',
    screen_height: screenInfo.height || '',
    color_depth: screenInfo.colorDepth || '',
    pixel_ratio: window.devicePixelRatio || '',
    viewport_width: window.innerWidth || '',
    viewport_height: window.innerHeight || '',
    timezone: timezone,
    referrer: document.referrer || '',
    page_url: window.location.href,
    page_path: window.location.pathname,
    hostname: window.location.hostname,
    online: typeof nav.onLine === 'boolean' ? nav.onLine : '',
    connection_type: connection && connection.effectiveType ? connection.effectiveType : '',
    timestamp: new Date().toISOString()
  };
}

function buildContactPayload(publicIp) {
  return {
    name: byId('contact-name') ? byId('contact-name').value.trim() : '',
    contactInfo: byId('contact-info') ? byId('contact-info').value.trim() : '',
    email: byId('contact-email') ? byId('contact-email').value.trim() : '',
    company: byId('contact-company') ? byId('contact-company').value.trim() : '',
    industry: byId('contact-industry') ? byId('contact-industry').value.trim() : '',
    subject: byId('contact-subject') ? byId('contact-subject').value.trim() : 'AI平台GEO优化诊断',
    siteStage: '',
    website: byId('contact-website') ? byId('contact-website').value.trim() : '',
    market: '',
    message: byId('contact-message') ? byId('contact-message').value.trim() : '',
    client_ip: publicIp,
    user_agent: navigator.userAgent || '',
    browser_info: JSON.stringify(getBrowserInfo())
  };
}

function validateContactPayload(payload) {
  return Boolean(payload.name && payload.contactInfo && payload.industry && payload.subject && payload.message);
}

async function bindContactForm() {
  var formElement = byId('contact-form');
  var submitButton = byId('contact-submit');
  var ipStatusElement = byId('contact-ip-status');

  if (!formElement || !submitButton || !ipStatusElement) return;

  var currentIp = '';
  var originalButtonText = submitButton.textContent;
  ipStatusElement.textContent = '正在获取网络环境信息...';

  try {
    currentIp = await getPublicIp();
    ipStatusElement.textContent = '网络环境校验完成，可正常提交表单。';
  } catch (error) {
    currentIp = '';
    ipStatusElement.textContent = '网络环境信息获取失败，请检查网络后重试。';
  }

  formElement.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!currentIp) {
      setContactResult('网络环境信息尚未获取成功，暂时不能提交。', false);
      return;
    }

    var payload = buildContactPayload(currentIp);

    if (!validateContactPayload(payload)) {
      setContactResult('请填写所有必填字段。', false);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = '提交中...';

    try {
      var response = await fetch(CONFIG.api.contact, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      var rawText = await response.text();
      var result;

      try {
        result = JSON.parse(rawText);
      } catch (error) {
        setContactResult('提交失败，请稍后重试。', false);
        return;
      }

      if (response.ok && result.success === true) {
        setContactResult(result.message || '提交成功，我们会尽快与您联系。', true);
        formElement.reset();
      } else {
        setContactResult(result.message || '提交失败，请稍后再试。', false);
      }
    } catch (error) {
      setContactResult('请求失败：' + error.message, false);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  var menuBtn = document.getElementById('menuBtn');
  var navLinks = document.getElementById('navLinks');

  if (menuBtn && navLinks) {
    menuBtn.setAttribute('aria-expanded', 'false');

    menuBtn.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      navLinks.classList.toggle('active', isOpen);
      menuBtn.classList.toggle('open', isOpen);
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navLinks.classList.remove('active');
        menuBtn.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('[data-year]').forEach(function (node) {
    node.textContent = new Date().getFullYear();
  });

  document.querySelectorAll('[data-faq-question]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      if (!item) return;
      var isOpen = item.classList.toggle('open');
      item.classList.toggle('active', isOpen);
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  bindContactForm();
});