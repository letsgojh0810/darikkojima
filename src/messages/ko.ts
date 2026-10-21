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
];

export const petMenuText = { settings: "설정", quiet: "1시간 조용히", quit: "종료" };

export const petQuips = {
  skipped: "오늘은 그만 말할게요",
  quiet: "한 시간 동안 조용히 있을게요",
  menuHint: "마우스 오른쪽 버튼을 누르면 설정이 열려요",
};

/** `done` for repeating reminders, `got` for one-off alerts (calendar) */
export const bubbleButtons = { done: "했어요", got: "확인했어요", snooze: "5분 뒤에 다시", skipToday: "오늘은 그만" };
