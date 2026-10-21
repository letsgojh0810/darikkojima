import type { ReminderId } from "../store/settings";

export const reminderMessages: Record<ReminderId, string[]> = {
  legs: ["다리 또 꼬셨죠?", "다리 풀어요, 척추가 울고 있어요", "꼰 다리, 지금 바로 내려놓아요!"],
  posture: ["허리 펴세요, 거북목 되기 싫으면", "어깨 좀 펴볼까요?", "화면에 코 박고 있진 않나요?"],
  water: ["물 한 잔 하고 오세요", "물 마실 타임이에요", "커피 말고 물이요, 물!"],
  stretch: ["일어나서 기지개 한번 켜요", "목이랑 어깨 돌려볼까요?", "잠깐 스트레칭하고 올까요?"],
};

const MAX_TITLE = 20;

export const calendarMessage = (title: string, min: number) => {
  const short = title.length > MAX_TITLE ? `${title.slice(0, MAX_TITLE)}…` : title;
  return `'${short}' 일정이 ${min}분 뒤에 있어요`;
};

export const reminderLabels: Record<ReminderId, string> = {
  legs: "다리 꼬지 않기",
  posture: "허리 펴기",
  water: "물 마시기",
  stretch: "스트레칭",
};

export const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

export const settingsText = {
  title: "설정",
  reminders: "알려줄 것들",
  every: "분마다",
  customPlaceholder: "알려줄 말 (예: 약 먹기)",
  hours: "알림 시간",
  work: "일하는 시간",
  lunch: "점심시간",
  calendar: "일정 알림",
  calendarHint: "구글·아웃룩 캘린더의 '비공개 주소'를 붙여 넣으면 일정 전에 알려드려요",
  lead: "일정 시작 전에 알려줘요",
  leadUnit: "분 전",
  urlPlaceholder: "https://로 시작하는 주소",
  add: "추가하기",
  remove: "삭제",
  badUrl: "주소가 올바르지 않아요. https://로 시작하는지 확인해 주세요",
  system: "기본 설정",
  autostart: "컴퓨터를 켜면 같이 시작해요",
  save: "저장",
  cancel: "취소",
};

export const clickQuips = [
  "부르셨어요?",
  "물은 마셨어요?",
  "간지러워요",
  "저 느려도 일은 잘해요",
  "일하세요, 일!",
  "거북이라고 무시하지 마세요",
  "쓰다듬어 주셔서 감사해요",
  // 직장인 공감
  "퇴근까지 몇 시간 남았죠?",
  "월요일은 원래 그래요",
  "점심 메뉴 고르는 게 제일 어려운 일이에요",
  "메일함은 비울수록 차요",
  "이 회의, 메일로 충분했을지도요",
  "커피 한 잔이 필요한 시간이네요",
  "금요일까지 얼마 안 남았어요",
  "방금 한 일, 저장은 하셨죠?",
  "야근은 거북이도 싫어요",
  "읽씹은 안 돼요, 답장해요",
  "퇴근하고 싶다는 생각, 저도 해요",
  "오늘 할 일은 내일 해도 돼요",
  "회의 중에 딴생각하셨죠?",
  "알림은 저만 울리고 싶어요",
  // 격언
  "천 리 길도 한 걸음부터예요",
  "느려도 멈추지 않으면 돼요",
  "토끼는 낮잠 자다 졌어요",
  "시작이 반이에요",
  "오늘의 한 걸음이 내일의 퇴근이에요",
  "급할수록 돌아가요",
  "하루하루가 쌓여 큰 일이 돼요",
  "완벽보다 완료가 좋아요",
  "쉬어가는 것도 일이에요",
  "지금도 충분히 잘하고 있어요",
  // 쓸데없는 소리
  "저 사실 헤엄도 잘 쳐요",
  "등껍질은 제 집이에요, 월세는 없어요",
  "저는 상추를 좋아해요",
  "목이 짧은 게 아니라 넣은 거예요",
  "거북이가 오래 산다더니, 전 아직 어려요",
  "혹시 지금 제 얘기 듣고 계세요?",
  "아무 일도 없었어요. 정말로요",
  "방금 눈 마주친 것 같아요",
  "저를 누른다고 레벨이 오르진 않아요",
  "이건 그냥 해본 말이에요",
  "심심해서 말 걸어봤어요",
  "하품 나와요",
  "저도 월급 받고 싶어요",
  "오늘 날씨 어때요? 전 모르겠어요",
  // 효과음
  "뿅!",
  "톡톡!",
  "꾸벅",
  "음냐음냐...",
  "후다닥!",
  "두근두근",
  "삐리릭",
  "헤헷",
  "슈웅~",
  "짠!",
  "으쌰!",
  "꼬르륵...",
  "찰칵!",
];

export const petMenuText = { settings: "설정", quiet: "1시간 조용히", quit: "종료" };

export const petQuips = {
  skipped: "오늘은 그만 말할게요",
  quiet: "한 시간 동안 조용히 있을게요",
  menuHint: "마우스 오른쪽 버튼을 누르면 설정이 열려요",
};

/** `done` for repeating reminders, `got` for one-off alerts (calendar) */
export const bubbleButtons = { done: "했어요", got: "확인했어요", snooze: "5분 뒤에 다시", skipToday: "오늘은 그만" };
