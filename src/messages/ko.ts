import type { ReminderId } from "../store/settings";

export const reminderMessages: Record<ReminderId, string[]> = {
  legs: ["다리 또 꼬셨죠?", "다리 풀어요, 척추가 울고 있어요", "꼬은 다리, 지금 바로 내려놓기!"],
  posture: ["허리 펴세요, 거북이 되기 싫으면", "어깨 좀 펴볼까요?", "화면에 코 박고 있진 않나요?"],
  water: ["물 한 잔 하고 오세요", "수분 보충 타임이에요", "커피 말고 물이요, 물!"],
  stretch: ["일어나서 기지개 한번 켜요", "목이랑 어깨 돌려볼까요?", "잠깐 스트레칭하고 올까요?"],
};

export const calendarMessage = (title: string, min: number) =>
  `${min}분 뒤 '${title}'예요. 화장실 미리 다녀오세요`;

export const reminderLabels: Record<ReminderId, string> = {
  legs: "다리 꼬지 마",
  posture: "허리 펴기",
  water: "물 마시기",
  stretch: "스트레칭",
};

export const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

export const settingsText = {
  title: "다리꼬지마 설정",
  reminders: "리마인더",
  every: "주기(분)",
  work: "근무 시간 (선택한 요일에만 알림)",
  lunch: "점심시간 (알림 없음)",
  calendar: "캘린더 (ICS 구독 URL)",
  lead: "일정 사전 알림(분)",
  urlPlaceholder: "https:// 또는 webcal:// 로 시작하는 ICS 주소",
  add: "추가",
  remove: "삭제",
  badUrl: "올바른 http(s) 주소가 아니에요",
  autostart: "Windows 시작 시 자동 실행",
};

export const bubbleButtons = { ok: "확인", snooze: "5분 뒤", skipToday: "오늘은 그만" };
