
const surveySteps = [
  {
    id: 'q1',
    title: '1. 올리브영에 얼마나 자주 방문하시나요?',
    icon: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png',
    options: ['주 1회 미만', '주 1~2회', '주 3~4회', '주 5회 이상']
  },
  {
    id: 'q2',
    title: '2. 회원가입을 하지 않는 가장 큰 이유는 무엇인가요?',
    icon: 'https://cdn-icons-png.flaticon.com/512/2889/2889676.png',
    options: ['가입 절차가 번거로워서', '개인정보 제공이 싫어서', '혜택을 느끼지 못해서', '자주 방문하지 않아서', '가족 계정 이용 중이라서']
  },
  {
    id: 'q3',
    title: '3. 올리브영 회원 혜택에 대해 얼마나 알고 계신가요?',
    icon: 'https://cdn-icons-png.flaticon.com/512/4213/4213958.png',
    options: ['잘 알고 있었다', '조금 알고 있었다', '이름만 들어봤다', '전혀 모른다']
  },
  {
    id: 'q4',
    title: '4. 어떤 혜택이 있다면 회원가입을 하실 의향이 있으신가요? (복수선택)',
    icon: 'https://cdn-icons-png.flaticon.com/512/3209/3209955.png',
    isMultiple: true,
    options: ['즉시 할인', '적립금/포인트', '생일 쿠폰', '샘플 증정', '회원 전용 행사', '특별히 가입할 생각이 없다']
  },
  {
    id: 'q5',
    title: '5. 앞으로 회원가입을 하실 의향이 있으신가요?',
    icon: 'https://cdn-icons-png.flaticon.com/512/2107/2107845.png',
    options: ['있다', '고민해 보겠다', '없다']
  }
];

let currentStep = 0;
let answers = {};
let multiSelections = [];

function renderStep() {
  const app = document.getElementById('app');
  const data = surveySteps[currentStep];

  if (!data) {
    renderComplete();
    return;
  }

  multiSelections = [];

  let html = `<div class="question-title">${data.title}</div>`;
  html += `<div class="option-grid">`;
  
  data.options.forEach(opt => {
    html += `<button class="option-btn" id="btn-${opt}" onclick="handleSelect('${data.id}', '${opt}', ${data.isMultiple || false})">${opt}</button>`;
  });
  html += `</div>`;

  if (data.isMultiple) {
    html += `<button class="next-btn" onclick="submitMultiple('${data.id}')">다음으로</button>`;
  }

  app.innerHTML = html;
}

function handleSelect(questionId, value, isMultiple) {
  if (isMultiple) {
    const btn = document.getElementById(`btn-${value}`);
    const idx = multiSelections.indexOf(value);
    if (idx > -1) {
      multiSelections.splice(idx, 1);
      btn.classList.remove('selected');
    } else {
      multiSelections.push(value);
      btn.classList.add('selected');
    }
  } else {
    answers[questionId] = value;
    goNext();
  }
}

function submitMultiple(questionId) {
  if (multiSelections.length === 0) {
    alert('최소 1개 이상의 항목을 선택해주세요.');
    return;
  }
  answers[questionId] = multiSelections;
  goNext();
}

function goNext() {
  if (currentStep < surveySteps.length - 1) {
    showTransition(surveySteps[currentStep + 1].icon, () => {
      currentStep++;
      renderStep();
    });
  } else {
    showTransition('https://cdn-icons-png.flaticon.com/512/742/742751.png', () => {
      currentStep++;
      renderStep();
    });
  }
}

function showTransition(iconUrl, callback) {
  const overlay = document.getElementById('clayOverlay');
  const icon = document.getElementById('overlayIcon');
  icon.src = iconUrl;
  overlay.classList.add('active');
  setTimeout(() => {
    overlay.classList.remove('active');
    callback();
  }, 900);
}

function renderComplete() {
  SurveyStorage.saveResponse(answers);
  const app = document.getElementById('app');
  app.innerHTML = `
    <div style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
      <h2 style="font-size:2rem; color:var(--color-primary);">설문 완료! 🎉</h2>
      <p style="color: var(--color-text-sub); font-size:1.1rem;">아래 QR 코드를 스캔하여 올리브영 앱을 설치해보세요.</p>
      <div style="margin: 30px 0; background: white; padding: 16px; border-radius: 24px; box-shadow: var(--clay-shadow);">
        <!-- QR code directs to deep link -->
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://m.oliveyoung.co.kr/m/store/getApp.do" alt="QR" style="border-radius:12px;">
      </div>
      <button onclick="resetSurvey()" class="next-btn" style="width: 200px;">처음으로 돌아가기</button>
    </div>
  `;
}

function resetSurvey() {
  currentStep = 0;
  answers = {};
  renderStep();
}

// Admin Access Logic (Hidden 5 clicks on header)
let clickCount = 0;
let clickTimer = null;
function handleAdminClick() {
  clickCount++;
  if (clickCount >= 5) {
    clickCount = 0;
    showAdminDashboard();
  }
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
}

function showAdminDashboard() {
  const data = SurveyStorage.getAll();
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div style="text-align: center;">
      <h2 style="color: #E74C3C;">관리자 대시보드</h2>
      <p>총 누적 설문 응답: <b>${data.length}</b> 건</p>
      <div style="margin: 20px 0; display:flex; gap: 10px; justify-content: center;">
        <button onclick="SurveyStorage.exportToCSV()" class="next-btn" style="background:#2ecc71;">스프레드시트(CSV) 다운로드</button>
        <button onclick="resetSurvey()" class="next-btn" style="background:#95a5a6;">닫기</button>
      </div>
    </div>
  `;
}

renderStep();
