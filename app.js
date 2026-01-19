/* app.js
 * 기능: 학번+이름으로 계정 ID 조회, 결과 표시/에러 표시, 초기화
 * 주의: 비밀번호는 저장/표시하지 않음(보안상)
 */

// 1) (임시) 로컬 더미 데이터: 실제 운영 시 서버/Apps Script로 대체
//    - 이름은 공백 제거 후 비교(예: "홍 길동" -> "홍길동")
const ACCOUNT_DB = [
  { studentNo: "30101", name: "홍길동", googleId: "30101.hong@school.example" },
  { studentNo: "30102", name: "김철수", googleId: "30102.kim@school.example" },
];


// 2) DOM
const form = document.getElementById("searchForm");
const studentNoEl = document.getElementById("studentNo");
const studentNameEl = document.getElementById("studentName");
const resetBtn = document.getElementById("resetBtn");

const resultEmpty = document.getElementById("resultEmpty");
const resultBox = document.getElementById("resultBox");
const errorBox = document.getElementById("errorBox");

const accountIdEl = document.getElementById("accountId");
const resetPwLink = document.getElementById("resetPwLink");

// Inko 초기화 (브라우저 전역 Inko 사용)
const inko = new Inko();

let isComposing = false;

// 3) 유틸
function normalizeStudentNo(v) {
  return String(v ?? "").trim();
}

function normalizeName(v) {
  // 공백 전부 제거 + trim
  return String(v ?? "").replace(/\s+/g, "").trim();
}

function normalizeNameSmart(raw) {
  let v = String(raw ?? "").trim();

  // 1) 영문(영타) 포함이면 한글로 변환
  if (/[a-zA-Z]/.test(v)) {
    v = inko.en2ko(v);
  }

  // 2) 자모만 있는 경우(ㅎㅗㅇ...) -> 한 번 재조합 시도
  //    (자모가 있고, 완성형(가-힣)은 거의 없을 때)
  if (/[ㄱ-ㅎㅏ-ㅣ]/.test(v) && !/[가-힣]/.test(v)) {
    const en = inko.ko2en(v);
    v = inko.en2ko(en);
  }

  // 3) 공백 제거(기존 정책 유지)
  return v.replace(/\s+/g, "");
}

function showResult(googleId) {
  accountIdEl.textContent = googleId;

  // 상태 토글
  resultEmpty.hidden = true;
  errorBox.hidden = true;
  resultBox.hidden = false;
}

function showError(message = "일치하는 정보를 찾지 못했습니다.") {
  errorBox.textContent = message;

  // 상태 토글
  resultBox.hidden = true;
  resultEmpty.hidden = true;
  errorBox.hidden = false;
}

function showEmpty() {
  resultBox.hidden = true;
  errorBox.hidden = true;
  resultEmpty.hidden = false;

  accountIdEl.textContent = "-";
}

// 4) 조회 로직 (로컬 DB 버전)
//    실제 운영에서는 이 함수를 fetch()로 교체하면 됨.
function findAccountLocal(studentNo, name) {
  const targetNo = normalizeStudentNo(studentNo);
  const targetName = normalizeName(name);

  return ACCOUNT_DB.find(
    (row) =>
      normalizeStudentNo(row.studentNo) === targetNo &&
      normalizeName(row.name) === targetName
  );
}

// 5) 이벤트: 검색(Enter 포함)
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const studentNo = normalizeStudentNo(studentNoEl.value);
  const name = normalizeNameSmart(studentNameEl.value);

  if (!studentNo || !name) {
    showError("학번과 이름을 모두 입력하세요.");
    return;
  }

  // 숫자 입력 유도(필수는 아님)
  if (!/^\d+$/.test(studentNo)) {
    showError("학번은 숫자만 입력하세요.");
    return;
  }

  const found = findAccountLocal(studentNo, name);

  if (!found) {
    showError();
    return;
  }

  showResult(found.googleId);
});

// 6) 초기화
resetBtn.addEventListener("click", () => {
  form.reset();
  showEmpty();
  studentNoEl.focus();
});

// 7) 비밀번호 재설정 안내 링크(운영 환경에 맞게 수정)
//    - 예: 학교 내부 안내 페이지 / Google 계정 복구 안내 페이지 / 관리자 요청 폼 등
resetPwLink.addEventListener("click", (e) => {
  e.preventDefault();

  // 예시: 안내 페이지로 이동(원하시는 URL로 교체)
  // location.href = "https://intranet.school.example/reset-password-guide";

  alert("비밀번호는 보안상 표시하지 않습니다.\n관리자 재설정 또는 안내된 절차로 재설정해 주세요.");
});

// 초기 화면 상태
showEmpty();
