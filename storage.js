
const SurveyStorage = {
  SAVE_KEY: 'oliveyoung_survey_responses',

  saveResponse(data) {
    const history = JSON.parse(localStorage.getItem(this.SAVE_KEY) || '[]');
    const newRecord = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('ko-KR'),
      answers: data
    };
    history.push(newRecord);
    localStorage.setItem(this.SAVE_KEY, JSON.stringify(history));
  },

  getAll() {
    return JSON.parse(localStorage.getItem(this.SAVE_KEY) || '[]');
  },

  // 내부적으로 CSV 데이터 생성
  generateCSVContent() {
    const data = this.getAll();
    let csvContent = "\uFEFFID,일시,Q1_방문빈도,Q2_미가입이유,Q3_혜택인지,Q4_희망혜택,Q5_가입의향\n";
    data.forEach(row => {
      const a = row.answers;
      const q4Val = Array.isArray(a.q4) ? a.q4.join(';') : (a.q4 || '');
      csvContent += `${row.id},"${row.timestamp}","${a.q1 || ''}","${a.q2 || ''}","${a.q3 || ''}","${q4Val}","${a.q5 || ''}"\n`;
    });
    return csvContent;
  },

  // 🚀 이메일/앱으로 파일 공유하기 (Web Share API)
  async shareViaEmail() {
    const data = this.getAll();
    if (data.length === 0) {
      alert('공유할 데이터가 없습니다.');
      return;
    }

    const csvContent = this.generateCSVContent();
    const fileName = `survey_result_${Date.now()}.csv`;

    // CSV 파일 객체 생성
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const file = new File([blob], fileName, { type: 'text/csv' });

    // Web Share API 지원 여부 및 파일 공유 가능 여부 확인
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: '올리브영 설문 결과 데이터',
          text: '태블릿에서 수집된 설문조사 결과 CSV 파일입니다.'
        });
      } catch (error) {
        console.log('사용자가 공유를 취소했거나 오류가 발생했습니다.', error);
      }
    } else {
      // 태블릿/브라우저가 파일 공유를 미지원하는 경우 (기존 다운로드 방식으로 폴백)
      alert('현재 기기에서 파일 이메일 공유 기능을 지원하지 않아 기기에 파일로 바로 다운로드합니다.');
      this.fallbackDownload(blob, fileName);
    }
  },

  // Fallback: 기기에 직접 다운로드
  fallbackDownload(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
