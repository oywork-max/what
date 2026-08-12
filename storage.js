
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

  exportToCSV() {
    const data = this.getAll();
    if (data.length === 0) {
      alert('저장된 데이터가 없습니다.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "ID,일시,Q1_방문빈도,Q2_미가입이유,Q3_혜택인지,Q4_희망혜택,Q5_가입의향\n";

    data.forEach(row => {
      const a = row.answers;
      const q4Val = Array.isArray(a.q4) ? a.q4.join(';') : (a.q4 || '');
      csvContent += `${row.id},"${row.timestamp}","${a.q1 || ''}","${a.q2 || ''}","${a.q3 || ''}","${q4Val}","${a.q5 || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `survey_result_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
