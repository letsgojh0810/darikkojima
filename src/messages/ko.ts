import type { ReminderId } from "../store/settings";

export const reminderMessages: Record<ReminderId, string[]> = {
  legs: ["다리 또 꼬셨죠?", "다리 풀어요, 척추가 울고 있어요", "꼬은 다리, 지금 바로 내려놓기!"],
  posture: ["허리 펴세요, 거북이 되기 싫으면", "어깨 좀 펴볼까요?", "화면에 코 박고 있진 않나요?"],
  water: ["물 한 잔 하고 오세요", "수분 보충 타임이에요", "커피 말고 물이요, 물!"],
  stretch: ["일어나서 기지개 한번 켜요", "목이랑 어깨 돌려볼까요?", "잠깐 스트레칭하고 올까요?"],
};

export const calendarMessage = (title: string, min: number) =>
  `${min}분 뒤 '${title}'예요. 화장실 미리 다녀오세요`;

export const bubbleButtons = { ok: "확인", snooze: "5분 뒤", skipToday: "오늘은 그만" };
