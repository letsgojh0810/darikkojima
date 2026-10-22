import type { ReminderId } from "../store/settings";

const MAX_TITLE = 20;
const shorten = (title: string) => (title.length > MAX_TITLE ? `${title.slice(0, MAX_TITLE)}…` : title);
const pick = <T>(xs: readonly T[], rand: () => number) => xs[Math.floor(rand() * xs.length)];
const clock = (d: Date) => (d.getMinutes() ? `${d.getHours()}시 ${d.getMinutes()}분` : `${d.getHours()}시`);

/* ───────── 리마인더 ───────── */

export const reminderMessages: Record<ReminderId, string[]> = {
  legs: [
    "다리 또 꼬셨죠?",
    "다리 풀어요, 척추가 울고 있어요",
    "꼰 다리, 지금 바로 내려놓아요!",
    "두 발을 바닥에 딱 붙여 봐요",
    "다리 꼬면 골반이 삐뚤어져요. 풀어요",
    "지금 다리 어떻게 하고 있어요? 확인해 봐요",
    "한쪽 다리가 위에 올라가 있진 않나요?",
    "의자에 깊숙이, 발은 바닥에 두어요",
    "꼰 다리는 오래 못 간대요. 풀어요",
    "다리 꼬는 습관, 오늘만 참아 봐요",
    "혈액순환이 부탁했어요. 다리 풀어 주세요",
    "발바닥이 바닥을 그리워해요",
  ],
  posture: [
    "허리 펴세요, 거북목 되기 싫으면",
    "어깨 좀 펴볼까요?",
    "화면에 코 박고 있진 않나요?",
    "등을 의자에 붙여 봐요",
    "턱을 살짝 당겨 봐요",
    "모니터와 눈높이를 맞춰요",
    "어깨가 귀에 붙어 있진 않나요?",
    "허리에 힘 빼고, 가슴은 활짝 펴요",
    "지금 자세, 10점 만점에 몇 점이에요?",
    "구부정한 건 허리가 제일 먼저 알아요",
    "앉은 자세 점검 시간이에요",
    "화면이 당신을 끌어당기고 있어요. 버텨요",
  ],
  water: [
    "물 한 잔 하고 오세요",
    "물 마실 타임이에요",
    "커피 말고 물이요, 물!",
    "입술이 마르지 않았나요? 물 한 잔 해요",
    "오늘 물 몇 잔 마셨어요?",
    "수분 충전 시간이에요",
    "컵이 비었다면 지금이 채울 때예요",
    "물 뜨러 가는 길에 기지개도 켜요",
    "몸의 절반은 물이에요. 채워 줘요",
    "목마르다고 느끼면 이미 늦었대요. 한 잔 해요",
    "자리에서 일어나 물 뜨러 가요",
    "물 한 잔이 집중력을 살려 줘요",
  ],
  stretch: [
    "일어나서 기지개 한번 켜요",
    "목이랑 어깨 돌려볼까요?",
    "잠깐 스트레칭하고 올까요?",
    "손목을 천천히 돌려 봐요",
    "팔을 위로 쭉 뻗어 봐요",
    "자리에서 일어나 한 바퀴 걸어요",
    "목을 좌우로 천천히 기울여 봐요",
    "어깨를 뒤로 크게 세 번 돌려요",
    "허리를 좌우로 살짝 비틀어 봐요",
    "눈도 쉬어요. 먼 곳을 20초만 봐요",
    "발목도 돌려 봐요",
    "굳은 몸이 부르고 있어요. 한 번만 풀어요",
  ],
};

export const reminderLabels: Record<ReminderId, string> = {
  legs: "다리 꼬지 않기",
  posture: "허리 펴기",
  water: "물 마시기",
  stretch: "스트레칭",
};

/* ───────── 일정 알림 ───────── */

const calendarLines = [
  "'{t}' 일정이 {m}분 뒤에 있어요",
  "{m}분 뒤 '{t}' 일정이에요. 슬슬 준비해요",
  "곧 '{t}' 일정이에요. {m}분 남았어요",
  "'{t}' 일정까지 {m}분이에요. 물 한 잔 챙겨요",
  "'{t}' 일정 {m}분 전이에요. 자료는 준비됐나요?",
  "{m}분 뒤 '{t}' 일정이 시작돼요. 노트북 챙겨요",
  "'{t}' 일정이 {m}분 앞이에요. 하던 일은 저장해요",
  "곧 '{t}' 일정이에요. 마음의 준비는 됐나요?",
  "'{t}' 일정까지 {m}분! 지각하지 않게 슬슬 움직여요",
  "{m}분 뒤에 '{t}' 일정이 있어요. 지금 일은 잠깐 멈춰도 돼요",
];

export const calendarMessage = (title: string, min: number, rand: () => number = Math.random) =>
  pick(calendarLines, rand).replace("{t}", shorten(title)).replace("{m}", String(min));

/* ───────── 켰을 때 인사 ───────── */

const greetings = {
  morning: [
    "좋은 아침이에요",
    "오늘도 같이 힘내요",
    "커피부터 한 잔 하고 시작해요",
    "출근하느라 고생했어요",
    "아침엔 시동이 천천히 걸려도 괜찮아요",
    "오늘의 첫 번째 할 일: 물 한 잔",
    "메일함은 잠깐 모르는 척해도 돼요",
    "오늘 하루도 무사히 가 봐요",
  ],
  noon: [
    "점심시간이 가까워요",
    "슬슬 배고플 시간이네요",
    "오전 일은 거의 다 끝났죠?",
    "메뉴는 정하셨어요? 안 정했으면 제가 도울게요",
    "점심 전에 일 하나만 더 끝내 볼까요?",
    "배에서 신호가 오기 시작했어요",
    "오전 수고했어요, 곧 밥이에요",
  ],
  afternoon: [
    "오후도 같이 버텨요",
    "졸리면 스트레칭 한번 해요",
    "점심 먹고 나면 졸린 게 정상이에요",
    "오후 3시는 원래 당이 떨어지는 시간이에요",
    "커피 한 잔 더 해도 괜찮아요",
    "퇴근이 조금씩 가까워지고 있어요",
    "지금 하는 일, 내일 해도 되는 거면 내일 해요",
    "오후 일은 천천히, 하지만 꾸준히요",
  ],
  evening: [
    "아직 일하고 있어요? 고생이 많아요",
    "퇴근했으면 이제 쉬어요",
    "저녁은 챙겨 드셨어요?",
    "야근이라면 간식이라도 챙겨요",
    "오늘 하루도 정말 수고했어요",
    "이제 일은 내려놓고 숨 좀 쉬어요",
    "퇴근 후엔 회사 생각은 잠시 꺼 둬요",
    "늦게까지 고생이에요, 무리하지 마요",
  ],
  night: [
    "이 시간엔 쉬는 게 좋아요",
    "아직 안 주무셨어요?",
    "내일의 나를 위해 오늘은 그만 자요",
    "밤에는 화면 밝기를 낮춰 봐요",
    "늦게까지 일하는 건 멋있지 않아요, 자요",
    "눈이 피곤하겠어요, 잠깐 감아 봐요",
    "오늘 일은 내일의 내가 할 거예요",
    "이 시간에 만나다니, 깜짝이야",
  ],
  monday: [
    "월요일이네요, 천천히 시동 걸어요",
    "월요일은 원래 그래요. 같이 가요",
    "월요일에 출근한 것만으로 대단해요",
    "이번 주도 시작이네요. 일단 커피부터요",
    "월요병엔 느린 시작이 약이에요",
    "월요일 아침엔 큰 목표 말고 작은 목표 하나만요",
    "한 주의 첫날, 부담은 반만 가져가요",
    "금요일까지 4일 남았어요. 위로가 안 되죠?",
  ],
  friday: [
    "금요일이에요, 조금만 더 힘내요",
    "내일이면 주말이에요, 오늘만 버텨요",
    "금요일 출근, 마음은 벌써 반쯤 퇴근했죠?",
    "오늘은 새 일 벌리지 않기로 해요",
    "주말이 코앞이에요. 조금만 더요",
    "금요일엔 일이 잘 안 되는 게 정상이에요",
    "이번 주도 정말 고생 많았어요",
    "금요일 오후엔 마음이 먼저 퇴근해요",
  ],
  weekend: [
    "주말에도 만나서 반가워요",
    "쉬는 날인데 열었네요",
    "주말에 일하는 거면 평일에 꼭 쉬어요",
    "오늘은 아무것도 안 해도 괜찮은 날이에요",
    "주말인데 컴퓨터 앞이라니, 제가 말릴게요",
    "쉬는 날엔 쉬는 게 일이에요",
    "주말엔 알림도 쉬어요. 인사만 드릴게요",
    "휴일 출근이면 제가 더 응원할게요",
  ],
};

/* ───────── 친밀도에 따른 말투 ───────── */

/** how close the pet feels; shapes greetings, click lines and nagging. Polite (해요체) all the way, never 반말. */
export type Tone = "shy" | "familiar" | "seasoned" | "close";
export const toneOf = (level: number): Tone => (level >= 8 ? "close" : level >= 5 ? "seasoned" : level >= 3 ? "familiar" : "shy");

const toneGreetings: Record<Tone, string[]> = {
  shy: ["안녕하세요… 오늘도 잘 부탁드려요", "저 왔어요. 아직 조금 어색하네요", "오늘도 옆에 있어도 되죠?"],
  familiar: ["오셨어요? 오늘도 같이 해요", "이제 출근 인사가 익숙하네요", "왔어요! 오늘도 제가 챙길게요"],
  seasoned: ["왔어요? 오늘 할 일 다 알고 있어요", "출근하셨군요. 저 오늘도 컨디션 좋아요", "이 시간에 오시는 거, 이제 다 알죠"],
  close: ["왔군요! 오늘도 같이 버텨 봐요", "든든한 동료 출근했어요", "기다렸어요. 오늘도 우리 잘해 봐요"],
};

const toneQuips: Record<Tone, string[]> = {
  shy: ["아직 어색하지만 잘 부탁해요", "저… 여기 있어도 되죠?", "처음이라 조금 긴장돼요", "조금씩 친해져요, 우리"],
  familiar: ["이제 좀 익숙해졌어요", "이 자리가 슬슬 편해요", "제 자리 여기 맞죠?", "오늘도 같이 있어요"],
  seasoned: [
    "저도 이제 이 정도는 아는 짬이에요",
    "이 시간엔 물 한 잔 하실 때죠? 제가 압니다",
    "척하면 척이죠",
    "회의 끝나면 피곤하실 거 알아요",
    "말 안 해도 알아요, 커피죠?",
  ],
  close: ["우리 벌써 이렇게 됐네요", "오늘도 제가 옆에 있잖아요", "이제 말 안 해도 통하죠", "든든한 동료 생겼죠?", "같이 퇴근하는 기분이에요"],
};

/** From Lv.5 the pet sometimes nags like someone who has seen it all before, from Lv.8 like a colleague. */
const reminderToneLines: Record<ReminderId, Partial<Record<Tone, string[]>>> = {
  legs: {
    seasoned: ["다리, 또요? 이제 눈 감고도 알아요", "다리 꼬는 타이밍, 제가 다 알아요"],
    close: ["우리 사이에 다리 꼬는 거 다 보여요", "다리 풀어요. 동료로서 하는 말이에요"],
  },
  posture: {
    seasoned: ["허리 굽은 거 여기서도 보여요", "자세 무너질 시간인 거 알아요"],
    close: ["허리 펴요. 오래오래 같이 일해야죠", "제가 허리 담당이잖아요. 펴요"],
  },
  water: {
    seasoned: ["물 마실 때 됐죠? 시계 안 봐도 알아요", "목마를 시간인 거 다 알아요"],
    close: ["물 한 잔 같이 해요. 저도 마실게요", "우리 오늘 물 목표 채워 봐요"],
  },
  stretch: {
    seasoned: ["지금쯤 어깨 뭉쳤을 거예요. 저 짬 있어요", "스트레칭 타이밍 정확하죠?"],
    close: ["같이 기지개 켜요. 하나, 둘!", "몸 풀고 오면 제가 기다릴게요"],
  },
};

/** half the time from Lv.5 a reminder is said in the closer tone; undefined = keep the ordinary line */
export function reminderLine(id: string, level: number, rand: () => number = Math.random): string | undefined {
  const lines = reminderToneLines[id as ReminderId]?.[toneOf(level)];
  return lines && rand() < 0.5 ? pick(lines, rand) : undefined;
}

/** From Lv.7 the pet remembers: lines built from what has been recorded so far. */
function statQuips(t: { done: Record<string, number>; streak: number }) {
  const out: string[] = [];
  const n = (id: string) => t.done[id] ?? 0;
  if (n("water") >= 5) out.push(`물 마시기, 지금까지 ${n("water")}번 챙겼어요`);
  if (n("posture") >= 5) out.push(`허리 펴기 ${n("posture")}번! 자세가 좋아지고 있어요`);
  if (n("legs") >= 5) out.push(`다리 안 꼬기 ${n("legs")}번, 대단해요`);
  if (n("stretch") >= 5) out.push(`스트레칭 ${n("stretch")}번 했어요. 몸이 고마워할 거예요`);
  if (t.streak >= 2) out.push(`${t.streak}일째 잘 챙기고 있어요`);
  return out;
}

/** Said when the app starts. Names the first event still to come today, if the calendar knows one. */
export function greetingMessage(
  now: Date,
  firstEvent?: { title: string; start: Date },
  rand: () => number = Math.random,
  level?: number,
) {
  const h = now.getHours();
  const day = now.getDay();
  // with a level, now and then the greeting shows how close the pet has become
  const pool = level !== undefined && h >= 5 && h < 22 && rand() < 0.4 ? toneGreetings[toneOf(level)] : timeGreetings(h, day);
  const hello = pick(pool, rand);
  if (!firstEvent) return hello;
  const stop = /[.!?…]$/.test(hello) ? " " : ". ";
  return `${hello}${stop}오늘 첫 일정은 ${clock(firstEvent.start)} '${shorten(firstEvent.title)}'예요`;
}

function timeGreetings(h: number, day: number) {
  return h >= 22 || h < 5
      ? greetings.night
      : day === 0 || day === 6
        ? greetings.weekend
        : day === 1 && h < 14
          ? greetings.monday
          : day === 5 && h < 18
            ? greetings.friday
            : h < 11
              ? greetings.morning
              : h < 14
                ? greetings.noon
                : h < 18
                  ? greetings.afternoon
                  : greetings.evening;
}

/* ───────── 퇴근 ───────── */

const momentLines = {
  countdown3h: [
    "퇴근까지 3시간 남았어요",
    "퇴근까지 3시간! 커피 한 잔 어때요?",
    "퇴근까지 3시간, 슬슬 정리할 것 정해요",
    "3시간 뒤면 퇴근이에요. 급한 것부터 끝내요",
    "퇴근까지 3시간이에요. 길어 보여도 금방이에요",
    "남은 시간 3시간, 오늘 안에 끝낼 것만 골라 봐요",
    "퇴근 3시간 전! 오후 일은 천천히 가요",
    "3시간만 버티면 자유예요",
    "퇴근까지 3시간. 간식 타임이 필요하지 않나요?",
    "퇴근 3시간 전이에요. 물 한 잔 마시고 가요",
    "퇴근이 3시간 앞이에요. 마음은 이미 반쯤 가 있죠?",
    "퇴근까지 3시간. 메일 정리부터 해 볼까요?",
    "3시간 뒤 퇴근이에요. 오늘의 목표를 하나만 남겨요",
    "퇴근 3시간 전, 슬슬 마무리 모드 준비해요",
    "3시간이면 꽤 많은 걸 끝낼 수 있어요",
  ],
  countdown1h: [
    "퇴근까지 1시간이에요. 마무리 모드로 가요",
    "이제 1시간만 버티면 돼요",
    "퇴근까지 1시간! 새 일은 내일로 미뤄요",
    "퇴근 1시간 전이에요. 오늘 안에 끝낼 것만 챙겨요",
    "1시간 남았어요. 슬슬 정리 시작해요",
    "퇴근까지 1시간, 마지막 스퍼트예요",
    "1시간 뒤면 퇴근이에요. 급한 건 지금 처리해요",
    "퇴근 1시간 전! 커피 마지막 잔 어때요?",
    "퇴근까지 1시간. 새 회의는 정중히 거절해요",
    "이제 1시간이에요. 오늘 한 일을 정리해 봐요",
    "퇴근 1시간 전이에요. 내일 할 일 목록을 적어 둬요",
    "1시간만 더! 거의 다 왔어요",
    "퇴근까지 1시간, 마음은 이미 문 앞이죠?",
    "퇴근 1시간 전이에요. 무리하지 말고 마무리해요",
    "남은 시간 1시간. 오늘도 꽤 잘했어요",
  ],
  goodbye: [
    "5분 뒤면 퇴근이에요. 오늘도 수고했어요",
    "퇴근 5분 전! 노트북 덮을 준비해요",
    "퇴근 5분 전이에요. 새 일은 시작하지 말아요",
    "곧 퇴근이에요. 오늘 한 일을 한 번 훑어봐요",
    "5분만 더 버티면 자유예요",
    "퇴근 5분 전, 마음은 이미 현관이죠?",
    "책상 정리하고 퇴근해요",
    "오늘도 무사히 끝났네요. 수고했어요",
    "퇴근 5분 전! 내일의 나에게 메모만 남겨요",
    "이제 곧 퇴근이에요. 오늘의 나를 칭찬해 줘요",
    "5분 뒤 퇴근이에요. 메일은 내일 열어도 돼요",
    "퇴근 5분 전! 슬슬 가방 챙겨요",
    "곧 퇴근이에요. 오늘 정말 고생했어요",
    "5분 뒤면 오늘의 일은 끝이에요",
    "퇴근 5분 전이에요. 마지막 저장은 하셨죠?",
    "시계 보세요. 퇴근이 코앞이에요",
    "5분 남았어요. 이제 마무리해도 돼요",
    "퇴근 직전엔 새 메일을 열지 않는 게 예의예요",
    "퇴근 5분 전! 오늘 저녁엔 뭐 드실래요?",
    "거의 다 왔어요. 퇴근까지 5분이에요",
    "오늘도 해냈어요. 5분 뒤에 퇴근이에요",
    "퇴근 5분 전, 컴퓨터 끄기 전에 물 한 잔 해요",
    "곧 퇴근이에요. 오늘 하루도 잘 버텼어요",
    "퇴근 5분 전! 노트북 덮고 숨 한번 크게 쉬어요",
    "5분 뒤 퇴근이에요. 오늘은 일찍 쉬어요",
  ],
  goodbyeFriday: [
    "5분 뒤면 퇴근, 그리고 주말이에요!",
    "퇴근 5분 전! 이번 주도 고생했어요",
    "금요일 퇴근 5분 전이에요. 주말이 기다려요",
    "곧 퇴근이에요. 이번 주 정말 수고했어요",
    "5분만 더! 그러면 주말이에요",
    "퇴근 5분 전, 월요일의 일은 월요일의 내가 할 거예요",
    "주말 시작까지 5분 남았어요",
    "이번 주도 버텼어요. 5분 뒤에 자유예요",
    "금요일 퇴근 5분 전! 노트북 덮고 주말 모드로요",
    "곧 퇴근이에요. 주말엔 푹 쉬어요",
    "5분 뒤면 주말이에요. 오늘은 칭찬받을 날이에요",
    "퇴근 5분 전! 주말 계획은 세워 뒀어요?",
    "이번 주 마지막 5분이에요. 힘내요",
    "주말이 코앞이에요. 마지막 저장하고 나가요",
    "금요일 퇴근 5분 전, 메일함은 월요일에 열어요",
    "5분 뒤 퇴근, 그리고 이틀의 휴가가 시작돼요",
    "퇴근 5분 전! 이번 주 고생한 나에게 맛있는 걸 줘요",
    "곧 주말이에요. 무사히 한 주를 마쳤어요",
    "금요일 퇴근 5분 전이에요. 일은 월요일로 던져요",
    "5분 뒤에 주말이에요. 오늘은 마음껏 쉬어요",
  ],
};

/** Timed lines that need no buttons: the two countdowns and the goodbye (a different set on Fridays). */
export function momentMessage(id: "countdown3h" | "countdown1h" | "goodbye", friday: boolean, rand: () => number = Math.random) {
  return pick(id === "goodbye" && friday ? momentLines.goodbyeFriday : momentLines[id], rand);
}

/* ───────── 우클릭 메뉴의 부탁하기 ───────── */

const duration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? (m ? `${h}시간 ${m}분` : `${h}시간`) : `${m}분`;
};

const leaveLines = {
  working: ["퇴근까지 {d} 남았어요", "{d}만 버티면 퇴근이에요", "퇴근까지 {d}! 조금만 더 힘내요", "남은 시간 {d}. 할 수 있어요"],
  lunch: ["지금은 점심시간이에요. 퇴근까지는 {d} 남았어요", "점심 맛있게 드세요. 퇴근까지는 {d}이에요"],
  before: ["아직 출근 전이에요. 일 시작까지 {d} 남았어요", "벌써 퇴근 생각이요? 아직 일 시작 {d} 전이에요"],
  after: ["퇴근 시간이 지났어요. 얼른 퇴근해요!", "벌써 퇴근 시간이 지났어요. 오늘은 여기까지요", "퇴근 시간 지났어요. 나머지는 내일의 몫이에요"],
  off: ["오늘은 쉬는 날이에요. 퇴근 걱정은 내려놔요", "쉬는 날엔 퇴근 시간도 쉬어요"],
};

/** Answer to "퇴근까지 얼마나 남았어?" for a status from greetings/moments.ts leaveStatus. */
export function leaveMessage(st: { kind: keyof typeof leaveLines; min?: number }, rand: () => number = Math.random) {
  return pick(leaveLines[st.kind], rand).split("{d}").join(duration(st.min ?? 0));
}

const scheduleLines = {
  none: ["오늘 남은 일정이 없어요. 집중하기 좋은 날이에요", "오늘은 더 남은 일정이 없어요"],
  notConnected: ["연결된 캘린더가 없어요. 설정의 일정 탭에서 연결할 수 있어요"],
};

/** Answer to "오늘 일정 알려줘": how many are left today and which one is next. */
export function scheduleMessage(left: { title: string; start: Date }[], connected: boolean, rand: () => number = Math.random) {
  if (!connected) return pick(scheduleLines.notConnected, rand);
  if (!left.length) return pick(scheduleLines.none, rand);
  const head = left.length === 1 ? "오늘 남은 일정은 하나예요" : `오늘 남은 일정은 ${left.length}개예요`;
  return `${head}. 다음은 ${clock(left[0].start)} '${shorten(left[0].title)}'`;
}

/* ───────── 점심 룰렛 ───────── */

const lunchAsk = [
  "점심 뭐 먹을까요?",
  "오늘 점심은 뭐로 할까요?",
  "배고플 시간이에요. 메뉴 골라 드릴까요?",
  "점심 메뉴 고민되시죠? 제가 정해 드릴게요",
  "오늘의 가장 큰 결정, 점심 메뉴예요",
  "메뉴 고르는 시간이 제일 아까워요. 맡겨 주세요",
  "점심 30분 전이에요. 메뉴는 정하셨어요?",
  "아직 안 정했으면 룰렛 한번 돌려 볼까요?",
  "'아무거나'라고 하실 거죠? 제가 정해 줄게요",
  "점심 고민은 저한테 던지세요",
  "오늘은 어떤 맛이 당겨요?",
  "같이 먹을 사람은 정했어요? 메뉴는 제가 정할게요",
  "슬슬 점심 생각날 때죠?",
  "밥 먹을 준비 되셨어요?",
  "점심 룰렛 돌릴 시간이에요",
  "오전 일 끝내고 맛있는 거 먹어요",
  "어제와 겹치지 않는 점심을 골라 볼까요?",
  "뭐 먹을지 고민하다 점심시간 다 가요. 빨리 정해요",
  "배에서 소리 나기 전에 메뉴부터 정해요",
  "오늘 점심은 운에 맡겨 볼까요?",
  "점심 뭐 드시고 싶어요? 모르겠으면 제가 알려 드려요",
  "결정 장애 해결사 등장! 점심 뭐 먹을래요?",
  "메뉴 후보가 많죠? 제가 하나로 줄여 드릴게요",
  "점심시간 전에 미리 정해 두면 마음이 편해요",
  "점심 투표 대신 룰렛 어때요?",
  "한 번만 돌려 볼래요?",
  "밥때가 다가와요. 메뉴 정해 드릴까요?",
  "오늘은 새로운 메뉴에 도전해 볼까요?",
  "뭐 먹을지 이제 그만 고민하고 맡겨요",
  "맛있는 점심은 좋은 오후의 시작이에요",
  "점심 메뉴 추천 서비스, 지금 영업 중이에요",
  "룰렛이 배고프대요. 돌려 볼까요?",
  "오늘도 점심은 중요해요. 메뉴 골라요",
  "점심 전에 메뉴만 정하면 반은 성공이에요",
  "고민 5분이면 식사 시간이 줄어요. 룰렛이 대신할게요",
  "메뉴 정하기 어렵죠? 저도 어려워요. 그래서 룰렛이 있어요",
  "배고픈 사람 손! 메뉴는 제가 정해 줄게요",
  "점심 어디로 갈지, 뭘 먹을지 같이 정해요",
  "오늘 점심은 특별하게 가 볼까요?",
  "룰렛 대기 중이에요. 언제든 누르세요",
  "오늘 메뉴를 운명에 맡겨 봐요",
  "회의 전에 배부터 채워요. 메뉴 정해 드릴까요?",
  "이 시간에 메뉴를 못 정하면 줄이 길어져요",
  "점심 줄 서기 전에 메뉴부터 정해요",
  "오늘은 가볍게? 든든하게? 룰렛이 정해 줄게요",
  "점심 후보 말고 정답을 알려 드릴게요",
  "고민은 짧게, 점심은 길게요",
  "메뉴 고민 끝내 드릴게요",
  "시계 보세요, 점심이 다가와요. 메뉴 정해요",
  "점심 메뉴 뽑기, 한 번 하고 가요",
  "오늘 점심은 뭐가 좋을지 같이 볼까요?",
  "오늘의 점심, 한 번 뽑아 볼까요?",
];

/** `{menu}` is always followed by punctuation or a particle-free word, so no particle has to match its last letter */
const lunchResults = [
  "{menu}, 어때요?",
  "{menu}! 이거예요",
  "오늘의 점심은 {menu}!",
  "룰렛의 선택은 {menu}!",
  "{menu}. 오늘은 이걸로 가요",
  "점심 메뉴: {menu}",
  "{menu}, 지금 딱 땡기지 않아요?",
  "제가 보기엔 {menu}, 이거예요",
  "{menu}! 제 직감이에요",
  "{menu}? 나쁘지 않죠?",
  "운명이 정했어요. {menu}!",
  "배 속에서 {menu}, 하고 외치는 소리가 들려요",
  "오늘은 {menu} 먹는 날이에요",
  "{menu} 어때요? 든든할 것 같아요",
  "{menu}! 오후에 힘이 날 거예요",
  "오늘의 추천: {menu}",
  "{menu}, 이거 먹으면 오후가 편해요",
  "룰렛이 자신 있게 골랐어요. {menu}!",
  "{menu} 한 그릇 하고 와요",
  "점심은 {menu}, 이걸로 정했어요!",
  "{menu}, 오늘의 정답이에요",
  "딱 {menu} 먹을 날씨예요",
  "{menu}! 먹고 오면 오후도 거뜬해요",
  "제 마음은 이미 {menu}에 가 있어요",
  "{menu}, 후회 없을 거예요",
  "오늘은 {menu} 한번 믿어 봐요",
  "{menu}, 이게 오늘의 운명이에요",
  "룰렛이 멈췄어요. {menu}!",
  "{menu}! 다녀오세요",
  "점심 메뉴 확정: {menu}",
  "{menu}, 지금 출발하면 줄 안 서요",
  "{menu} 어때요? 싫으면 한 번 더 돌려요",
  "{menu}, 이름만 들어도 배고파요",
  "오늘은 {menu}에 마음을 맡겨 봐요",
  "{menu}! 맛있게 먹고 오세요",
  "룰렛의 한 수, {menu}!",
  "{menu}, 오늘의 선택이에요",
  "이 정도면 {menu}, 괜찮은 선택이죠?",
  "{menu} 먹고 오후도 힘내요",
  "정했어요, {menu}!",
];

/** From the third spin on the roulette starts to tease: lines by how many times it was spun. */
const lunchNag = {
  third: [
    "이럴 거면 그냥 드시고 싶은 거 드세요...",
    "벌써 세 번째예요. 사실 마음속에 정해 둔 거 있죠?",
    "세 번 돌렸는데 마음에 안 든다면, 답은 이미 정해져 있는 거예요",
    "룰렛이 슬슬 눈치 보기 시작했어요",
    "사람은 룰렛을 돌리면서 진짜 먹고 싶은 걸 깨닫는대요",
    "세 번째 결과예요. 이번엔 진짜일지도요",
    "계속 돌리면 점심시간이 줄어요",
    "혹시 룰렛이 아니라 확인이 필요했던 건 아니죠?",
  ],
  fourth: [
    "네 번째예요. 룰렛이 부담스러워하고 있어요",
    "이쯤 되면 룰렛이 아니라 제가 고민돼요",
    "그냥 첫 번째로 가면 안 될까요?",
    "돌릴수록 배는 더 고파져요",
    "솔직히 말해요, 먹고 싶은 거 있죠?",
    "룰렛이 이렇게 어려운 일인 줄 몰랐어요",
    "네 번째 결과예요. 이게 마지막이길 바라요",
    "메뉴 고민이 어느새 점심 고민이 되어 버렸네요",
  ],
  fifth: [
    "다섯 번이면 룰렛도 포기했어요",
    "이제 그만 정해요. 점심시간 끝나요",
    "이쯤 되면 제가 제일 지쳤어요",
    "룰렛 누르는 손가락 아프지 않아요?",
    "이번에도 마음에 안 들면 그냥 아무거나 드세요",
    "지금까지 나온 것 중에 하나 골라요, 진심이에요",
    "이 정도면 메뉴 선택이 아니라 놀이예요",
    "배고픈 건 룰렛 탓이 아니에요",
  ],
  many: [
    "더 돌려도 되는데요, 그래도 밥은 먹어요",
    "점심시간 끝나고도 돌리고 있겠어요",
    "룰렛과 저는 이제 친구예요. 그러니 밥을 먹어요",
    "말려도 돌리실 걸 알아요",
    "이 정도면 점심이 아니라 취미예요",
    "메뉴보다 소중한 건 점심시간이에요. 가세요",
    "이제 밥 먹으러 가요, 제발요",
    "그만! 이 중에 아무거나 드세요",
  ],
};

export const lunchText = {
  pick: "추천해 줘요",
  good: "좋아요",
  again: "다시",
  empty: "점심 메뉴가 비어 있어요. 설정에서 추가해 주세요",
};

/** The question the lunch bubble opens with. */
export const lunchAskLine = (rand: () => number = Math.random) => pick(lunchAsk, rand);

/**
 * The reply to the `spin`-th roll (1 = first). The first two just name the menu; from the third on the roulette teases
 * and the menu is shown on its own line (`showMenu`).
 */
export function lunchReply(menu: string, spin: number, rand: () => number = Math.random) {
  if (spin < 3) return { line: pick(lunchResults, rand).split("{menu}").join(menu), showMenu: false };
  const tier = spin === 3 ? lunchNag.third : spin === 4 ? lunchNag.fourth : spin < 7 ? lunchNag.fifth : lunchNag.many;
  return { line: pick(tier, rand), showMenu: true };
}

export const defaultLunchMenus = [
  "김치찌개", "된장찌개", "순두부찌개", "부대찌개", "제육볶음", "비빔밥", "불고기", "칼국수", "냉면", "국밥",
  "설렁탕", "삼계탕", "쌈밥", "갈비탕", "떡볶이", "김밥", "라면", "돈까스", "우동", "초밥",
  "짜장면", "짬뽕", "볶음밥", "마라탕", "쌀국수", "파스타", "피자", "햄버거", "샌드위치", "샐러드",
  "덮밥", "카레", "오므라이스", "곰탕", "순댓국", "감자탕", "닭갈비", "쭈꾸미볶음", "회덮밥", "차돌박이",
];

/* ───────── 설정 창 ───────── */

export const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

export const settingsText = {
  title: "설정",
  tabGeneral: "일반",
  looks: "화면",
  themeLabel: "모드",
  themeOptions: { system: "시스템", light: "라이트", dark: "다크" },
  accentLabel: "대표 색",
  about: "정보",
  appName: "다리꼬지마",
  tagline: "책상 위에서 자세와 물을 챙겨 주는 작은 친구",
  star: "GitHub에서 별 눌러 주기",
  report: "문제 알리기",
  copyright: (year: number) => `© ${year} 다리꼬지마. All rights reserved.`,
  tabRemind: "알림",
  tabCalendar: "일정",
  tabPet: "펫",
  tabGrow: "성장",
  wardrobe: (name: string) => `옷장 · ${name}`,
  secretCount: (n: number, total: number) => `숨은 옷 ${n}/${total} · 꾸준히 챙기면 펫이 몰래 선물해요`,
  secretBadge: "히든",
  itemNone: "없음",
  wardrobeSlots: "옷 종류",
  resetOpen: "친밀도 초기화",
  resetTitle: "정말 처음부터 다시 시작할까요?",
  resetWarn: "레벨, 친밀도, 숨은 옷, 그동안의 기록이 모두 사라지고 되돌릴 수 없어요. 펫과 이름, 다른 설정은 그대로예요.",
  resetKeep: "그만두기",
  resetAllLabel: "처음 상태로 되돌리기",
  resetAllOpen: "모두 초기화",
  resetAllTitle: "정말 모두 초기화할까요?",
  resetAllWarn: "모든 설정, 펫 이름·옷·색깔, 캘린더, 레벨과 기록이 처음 상태로 돌아가고 되돌릴 수 없어요. 컴퓨터를 켤 때 같이 시작하는 설정만 그대로예요.",
  resetAllConfirm: "모두 초기화할게요",
  resetConfirm: "초기화할게요",
  tabTalk: "말 걸기",
  talkTitle: "펫이 먼저 말을 걸어요",
  moments: {
    greeting: "앱을 켰을 때 인사",
    lunch: "점심시간 30분 전에 메뉴 추천",
    countdown: "퇴근 3시간, 1시간 전에 알림",
    goodbye: "퇴근 5분 전에 인사",
    chatter: "가끔 심심하다고 말 걸기",
  },
  lunchMenus: "점심 메뉴",
  menuPlaceholder: "메뉴 추가 (예: 칼국수)",
  menuReset: "기본 메뉴로 되돌리기",
  pickPet: "펫 고르기",
  resetPosition: "펫 위치 초기화",
  petSize: "펫 크기",
  profile: "내 펫",
  petName: "이름",
  petColor: "색깔",
  level: "친밀도",
  levelNext: (points: number) => `다음 레벨까지 ${points}점`,
  levelMax: "최고 레벨이에요",
  levelHint: "알림에 '했어요'를 누르거나 펫을 쓰다듬으면 친해져요",
  labelTitle: "펫 아래 표시",
  labelOptions: { both: "레벨+이름", name: "이름만", level: "레벨만", off: "끄기" },
  reminders: "알려줄 것들",
  every: "분마다",
  customPlaceholder: "알려줄 말 (예: 약 먹기)",
  hours: "알림 시간",
  work: "일하는 시간",
  lunch: "점심시간",
  calendar: "일정 알림",
  calendarHint: "캘린더의 비공개 주소를 붙여 넣으면 일정 전에 알려드려요",
  guideTitle: "비공개 주소는 어디서 찾나요?",
  guideGoogle: "구글 캘린더 (PC 웹에서)",
  guideGoogleSteps: [
    "톱니바퀴 → 설정을 눌러요",
    "왼쪽 '내 캘린더 설정'에서 캘린더 이름을 눌러요",
    "'캘린더 통합'의 'iCal 형식의 비공개 주소'를 복사해요",
  ],
  guideOutlook: "아웃룩",
  guideOutlookSteps: ["설정 → 캘린더 → 공유 캘린더를 열어요", "캘린더를 게시하고 ICS 링크를 복사해요"],
  guideNote: "이 주소는 비밀번호처럼 쓰여요. 남에게 보여 주지 말고, 같은 화면의 '재설정'은 누르지 마세요. 회사 계정은 관리자가 막아 두었을 수 있어요.",
  leadGroup: "알림 시점",
  lead: "일정 시작 전에 알려줘요",
  leadUnit: "분 전",
  urlPlaceholder: "https://로 시작하는 주소",
  add: "추가하기",
  remove: "삭제",
  badUrl: "주소가 올바르지 않아요. https://로 시작하는지 확인해 주세요",
  googlePage: "캘린더 화면 주소예요. 캘린더 설정 → 캘린더 통합의 'iCal 형식의 비공개 주소'를 붙여 넣어 주세요",
  notFeed: "캘린더 형식이 아니에요. 'iCal 형식의 비공개 주소'를 붙여 넣었는지 확인해 주세요",
  edit: "수정",
  done: "완료",
  recheck: "연결 다시 확인",
  addCalendar: "캘린더 추가",
  checking: "확인하는 중…",
  notChecked: "아직 확인하지 않았어요",
  calNamePlaceholder: "이름 (예: 내 캘린더, 팀 캘린더)",
  upcomingTitle: "앞으로 7일 일정",
  upcomingNoCal: "캘린더를 추가하면 앞으로 7일 동안의 일정이 여기 보여요",
  upcomingNone: "앞으로 7일 동안은 일정이 없어요",
  eventWhen: (d: Date) =>
    `${d.getMonth() + 1}/${d.getDate()} (${dayLabels[d.getDay()]}) ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
  check: {
    ok: (n: number) => (n ? `연결됐어요. 앞으로 7일 동안 일정 ${n}개` : "연결됐어요. 앞으로 7일 동안은 일정이 없어요"),
    offline: "연결하지 못했어요. 인터넷이 연결돼 있는지, 회사 네트워크가 막고 있지 않은지 확인해 주세요",
    denied: "접근이 막혔어요. 비공개 주소가 맞는지, 회사 계정이라면 관리자가 막아 두지 않았는지 확인해 주세요",
    gone: "주소를 찾을 수 없어요. 캘린더에서 주소를 '재설정'했다면 새 주소를 다시 복사해 주세요",
    status: (code: number) => `캘린더 서버가 응답하지 않아요 (오류 ${code}). 잠시 뒤에 다시 확인해 주세요`,
    broken: "캘린더 내용을 읽지 못했어요. 다른 캘린더의 주소로 시도해 보세요",
  },
  liveSaved: "이 탭은 바꾸는 즉시 저장돼요",
  otherUnsaved: "다른 탭에 저장하지 않은 변경이 있어요",
  system: "기본 설정",
  autostart: "컴퓨터를 켜면 같이 시작해요",
  save: "저장",
  cancel: "닫기",
  refresh: "새로고침",
};

/* ───────── 클릭 한마디 ───────── */

/** Click one-liners every pet can say; nothing here may mention what species the pet is. */
/** Said on its own now and then during work hours; the `woke` ones when the pet was asleep and wakes up for it. */
export const chatterLines = {
  awake: [
    "심심하네요… 바쁘신가요?",
    "저 여기 있어요~ 잊으신 거 아니죠?",
    "오늘 일 많아요? 저는 한가해요",
    "잠깐 저 좀 봐 주세요",
    "다들 바쁘네요. 저만 한가해요",
    "뭐 하고 계세요?",
    "조용하니까 괜히 말 걸고 싶어요",
    "혼자 놀기 지루해요",
    "저랑 잠깐 수다 떨래요?",
    "똑똑, 잘 지내고 있어요?",
  ],
  woke: [
    "하암… 깜빡 졸았어요. 심심하네요",
    "음냐… 아직 일하는 중이세요?",
    "꾸벅… 앗, 안 잤어요! 심심했을 뿐이에요",
    "하암~ 너무 조용해서 잠들 뻔했어요",
    "자다 깼어요. 바쁘신가요?",
  ],
};

const commonQuips = [
  "부르셨어요?",
  "물은 마셨어요?",
  "간지러워요",
  "일하세요, 일!",
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
  "야근은 저도 싫어요",
  "읽씹은 안 돼요, 답장해요",
  "퇴근하고 싶다는 생각, 저도 해요",
  "오늘 할 일은 내일 해도 돼요",
  "회의 중에 딴생각하셨죠?",
  "알림은 저만 울리고 싶어요",
  // 격언
  "천 리 길도 한 걸음부터예요",
  "시작이 반이에요",
  "오늘의 한 걸음이 내일의 퇴근이에요",
  "급할수록 돌아가요",
  "하루하루가 쌓여 큰 일이 돼요",
  "완벽보다 완료가 좋아요",
  "쉬어가는 것도 일이에요",
  "지금도 충분히 잘하고 있어요",
  // 쓸데없는 소리
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

/** Species-specific lines, keyed by pet id (see pet/anim/pets.ts). */
const petQuipsById: Record<string, string[]> = {
  robot: [
    "삐빅, 업무 효율 분석 중이에요",
    "삐리빅! 칭찬을 감지했어요",
    "충전 중이에요... 아니, 일하는 중이에요",
    "안테나에 좋은 기운이 잡혀요",
    "오늘도 버그 없이 가 봐요",
    "전 커피 대신 전기를 마셔요",
    "AI라고 다 아는 건 아니에요",
    "재부팅하고 싶은 날이에요",
    "배터리 100%, 기분도 100%",
    "오류 없음. 기분 좋음.",
    "안테나 만지면 간지러워요",
    "제가 대신 일해 드리면 좋을 텐데요",
    "학습 결과: 당신은 오늘도 열심히 했어요",
    "로딩 중... 아, 그냥 멍때렸어요",
  ],
  cat: [
    "야옹~",
    "그르릉...",
    "골골골",
    "냥!",
    "키보드 위에 앉아도 돼요?",
    "책상 위 물건, 떨어뜨려 볼까요?",
    "츄르 주세요",
    "낮잠 자고 싶어요",
    "상자만 보면 들어가고 싶어요",
    "아무 일도 없었다냥",
    "꼬리를 밟으면 화낼 거예요",
    "모니터 뒤가 제일 따뜻해요",
    "새벽 세 시엔 괜히 뛰고 싶어요",
    "사료는 있는데 먹을 게 없어요",
  ],
  dog: [
    "멍!",
    "왈왈!",
    "헥헥",
    "산책 가요?",
    "꼬리가 멈추질 않아요",
    "간식 소리 들렸는데요?",
    "퇴근하면 같이 놀아요",
    "공 던져 주세요",
    "앉아, 손, 기다려... 다 할 수 있어요",
    "택배 아저씨가 왔나 봐요",
    "배 쓰다듬어 주세요",
    "오늘도 같이 있어서 좋아요",
    "킁킁, 점심 냄새가 나요",
    "혼자 두고 가면 서운해요",
  ],
  rabbit: [
    "깡충!",
    "쫑긋",
    "당근 주세요",
    "오물오물",
    "귀를 만지면 간지러워요",
    "점프는 자신 있어요",
    "풀 냄새가 그리워요",
    "발을 쿵쿵 구르면 화난 거예요",
    "귀가 길어서 소문은 다 들려요",
    "달에서 떡을 찧고 있어야 하는데",
    "한 번 점프하면 퇴근길이에요",
    "양배추도 좋아해요",
    "깜짝이야, 놀랐잖아요",
    "토끼와 거북이 얘기는 다시 하면 제가 이겨요",
  ],
};

/**
 * What this pet may say when poked: the shared lines, its own, the ones of its closeness tone, and from Lv.7 lines
 * built from the record (`totals`).
 */
export const quipsFor = (petId: string, level = 1, totals?: { done: Record<string, number>; streak: number }) => [
  ...commonQuips,
  ...(petQuipsById[petId] ?? []),
  ...toneQuips[toneOf(level)],
  ...(level >= 7 && totals ? statQuips(totals) : []),
];

/* ───────── 옷과 숨은 선물 ───────── */

export const itemNames: Record<string, string> = {
  tie: "넥타이",
  bandana: "반다나",
  beanie: "비니",
  flower: "꽃 핀",
  glasses: "안경",
  cap: "야구모자",
  headphones: "헤드폰",
  sunglasses: "선글라스",
  scarf: "목도리",
  bow: "리본",
  crown: "왕관",
  wizard: "마법사 모자",
  heart: "하트 안경",
  monocle: "외알 안경",
  medal: "금메달",
  drop: "물방울 핀",
  goggles: "수경",
  book: "머리 위 책",
  halo: "천사 링",
  sweatband: "땀 밴드",
  lei: "꽃목걸이",
  laurel: "월계관",
  chef: "요리사 모자",
  nightcap: "수면 모자",
  locket: "하트 목걸이",
  badge: "사원증",
  airpods: "에어팟",
  headset: "회의용 헤드셋",
};

export const slotNames = { head: "머리", face: "얼굴", neck: "목" };

/** how a locked level item is opened; secret ones are never shown locked */
export const unlockHint = (item: { level?: number }) => `Lv.${item.level}에 열려요`;

/** what the pet says when a secret (pet/titles.ts) is found, handing over its item */
const secretLines: Record<string, string> = {
  water10: "물 마시기 벌써 10번째예요! 선물로 물방울 핀을 옷장에 넣어 뒀어요",
  water100: "물을 100번이나 챙겼어요! 이 정도면 수영도 하겠어요. 수경 선물이에요",
  posture50: "허리 펴기 50번! 자세가 좋아서 책도 올릴 수 있겠어요. 선물 넣어 뒀어요",
  legs100: "다리 안 꼬기 100번 성공! 천사 링을 드릴게요",
  stretch50: "스트레칭 50번! 운동선수 같아요. 땀 밴드 선물이에요",
  streak7: "일주일 내내 잘 챙겼어요! 축하의 꽃목걸이를 드려요",
  streak30: "30일 연속이라니, 정말 대단해요! 월계관을 씌워 드릴게요",
  roulette: "점심 룰렛 단골손님이네요! 요리사 모자 하나 드릴게요",
  goodbye20: "퇴근 인사만 20번째예요. 푹 쉬라고 수면 모자 선물이에요",
  petter: "벌써 500번이나 쓰다듬어 줬어요! 하트 목걸이 받아 주세요",
  meetings: "일정 30개를 함께 버텼어요! 회의용 헤드셋을 선물할게요",
};
/** hover hints on a secret item not found yet: enough to guess at, without the exact count */
export const secretHints: Record<string, string> = {
  water10: "물 마시기 알림을 몇 번 챙기면 받을 수 있어요",
  water100: "물 마시기를 아주 오래 챙기면 받을 수 있어요",
  posture50: "허리 펴기를 꾸준히 챙기면 받을 수 있어요",
  legs100: "다리 꼬지 않기를 정말 많이 지키면 받을 수 있어요",
  stretch50: "스트레칭을 꾸준히 챙기면 받을 수 있어요",
  streak7: "일주일 동안 하루도 빠짐없이 알림을 챙기면 받을 수 있어요",
  streak30: "한 달 내내 빠짐없이 챙기면 받을 수 있어요",
  roulette: "점심 메뉴 룰렛을 자주 돌리다 보면 받을 수 있어요",
  goodbye20: "퇴근 인사를 여러 번 듣다 보면 받을 수 있어요",
  petter: "펫을 아주 많이 쓰다듬어 주면 받을 수 있어요",
  meetings: "일정 알림을 많이 받다 보면 받을 수 있어요",
};
const itemGotLines = ["옷장에 새 옷이 생겼어요: {x}", "{x}, 입어 볼래요? 설정 → 성장에 있어요", "새 옷 {x}! 어울릴 것 같아요"];

export const secretMessage = (id: string) => secretLines[id] ?? "깜짝 선물을 옷장에 넣어 뒀어요";
/** several items open together at Lv.5 and Lv.10, so they are announced as one line */
export const itemGotMessage = (names: string[], rand: () => number = Math.random) =>
  names.length === 1
    ? pick(itemGotLines, rand).split("{x}").join(names[0])
    : `옷장에 새 옷이 ${names.length}벌 생겼어요! 설정 → 성장에서 입혀 볼래요?`;

/** `{n}` is the new level, `{name}` the pet's name; no particle follows either, so none has to match the last letter */
const levelUpLines = [
  "레벨 업! 이제 Lv.{n}",
  "Lv.{n} 달성! 우리 더 친해졌네요",
  "{name}, Lv.{n} 달성!",
  "축하해요, Lv.{n} 달성! 앞으로도 잘 부탁해요",
  "Lv.{n}! 조금 더 편하게 지내요",
];

export const levelUpMessage = (level: number, name: string, rand: () => number = Math.random) =>
  pick(levelUpLines, rand).split("{n}").join(String(level)).split("{name}").join(name);

/** Every line that is said whatever the pet is; the test checks none of them names a species. */
export const sharedLines = () => [
  ...Object.values(greetings).flat(),
  ...Object.values(momentLines).flat(),
  ...lunchAsk,
  ...lunchResults,
  ...Object.values(lunchNag).flat(),
  ...Object.values(reminderMessages).flat(),
  ...calendarLines,
  ...levelUpLines,
  ...chatterLines.awake,
  ...chatterLines.woke,
  ...Object.values(toneGreetings).flat(),
  ...Object.values(toneQuips).flat(),
  ...Object.values(reminderToneLines).flatMap((t) => Object.values(t).flat()),
  ...Object.values(secretLines),
  ...itemGotLines,
  ...Object.values(leaveLines).flat(),
  ...Object.values(scheduleLines).flat(),
  ...petQuips.skipped,
  ...petQuips.quiet,
  ...petQuips.resumed,
  ...petQuips.found,
  ...petQuips.edgeNo,
  ...petQuips.edgeGiveUp,
  ...commonQuips,
];

/* ───────── 펫 창 ───────── */

export const petNames: Record<string, string> = { cat: "고양이", dog: "강아지", rabbit: "토끼", robot: "AI봇" };

/** accent ids from src/theme.ts */
export const accentNames: Record<string, string> = { coral: "코랄", blue: "블루", mint: "민트", lavender: "라벤더", charcoal: "차콜" };

/** coat colour ids from each pet's list (pet/anim/*.tsx *_COLORS) */
export const colorNames: Record<string, string> = {
  cheese: "치즈",
  gray: "회색",
  tabby: "고등어",
  white: "흰둥이",
  golden: "누렁이",
  jindo: "백구",
  choco: "초코",
  schnauzer: "슈나우저",
  snow: "눈송이",
  brown: "갈색",
  ash: "잿빛",
  beige: "베이지",
  silver: "실버",
  sky: "하늘",
  mint: "민트",
  lemon: "레몬",
};

export const petMenuText = {
  ask: "부탁하기",
  lunch: "점심 메뉴 추천",
  leave: "퇴근까지 얼마나 남았어?",
  schedule: "오늘 일정 알려줘",
  settings: "설정",
  quietOn: "조용히 하기",
  quietOff: "다시 말 걸기",
  quit: "종료",
};

export const petQuips = {
  skipped: [
    "오늘은 그만 말할게요",
    "알겠어요, 오늘은 이 얘기 안 할게요",
    "네, 오늘은 쉬어 갈게요",
    "오늘은 모른 척할게요",
    "이 알림은 내일 다시 올게요",
    "알았어요, 오늘은 조용히 있을게요",
  ],
  quiet: [
    "조용히 있을게요. 필요하면 다시 불러 주세요",
    "쉿, 방해 안 할게요",
    "쥐 죽은 듯 있을게요",
    "집중하세요, 제가 지켜볼게요",
    "조용히 옆에 있을게요",
    "잠깐 눈 좀 붙이고 있을게요",
  ],
  edgeNo: ["거기는 너무 구석이에요!", "앗, 거긴 너무 끝이에요", "벽에 끼면 답답해요", "저 안 보이잖아요. 여기 있을게요"],
  edgeGiveUp: ["알겠어요... 여기 있을게요", "정 그렇다면 여기서 지낼게요", "좁지만 참아 볼게요"],
  found: ["여기 있어요!", "찾았다! 제자리로 왔어요", "길을 잃었었어요. 이제 괜찮아요", "구석은 좀 답답했어요"],
  resumed: [
    "다시 말 걸게요!",
    "저 왔어요. 다시 챙겨 드릴게요",
    "푹 쉬었어요. 다시 시작해요",
    "다시 잔소리 모드예요",
  ],
  menuHint: "마우스 오른쪽 버튼을 누르면 설정이 열려요",
};

export const oneOf = (xs: readonly string[], rand: () => number = Math.random) => pick(xs, rand);

/** `done` for repeating reminders, `got` for everything else (calendar, greetings); the `all*` ones close a stack */
export const bubbleButtons = {
  done: "했어요",
  got: "확인했어요",
  snooze: "5분 뒤에 다시",
  skipToday: "오늘은 그만",
  allDone: "모두 확인했어요",
  allSnooze: "모두 5분 뒤에 다시",
};

/** Labels of the dev-only "테스트" tab (see src/debug.ts); not shown in a production build. */
export const devText = {
  tab: "테스트",
  hint: "개발 모드에서만 보여요. 버튼을 누르면 펫 창에서 바로 재생돼요.",
  talk: "말 걸기 미리보기",
  greeting: "켰을 때 인사",
  lunch: "점심 룰렛",
  countdown3h: "퇴근 3시간 전",
  countdown1h: "퇴근 1시간 전",
  goodbye: "퇴근 5분 전",
  goodbyeFriday: "퇴근 5분 전 (금요일)",
  chatter: "심심해요",
  chatterWoke: "심심해요 (자다 깸)",
  alerts: "알림",
  calendar: "일정 알림 (10분 전)",
  pile: "알림 4개 한꺼번에 (3줄까지만)",
  clear: "말풍선 모두 닫기",
  ttl: "말풍선 수명",
  ttl30: "기본 (인사 1분, 알림 3분)",
  ttl5: "5초 (빠른 확인)",
  progress: "펫 성장 (친밀도·레벨)",
  expPlus: (n: number) => `+${n}점`,
  toLevel: (n: number) => `Lv.${n} 만들기`,
  resetExp: "친밀도 0으로",
  levelUp: "레벨업 말풍선",
  unlockAll: "옷 모두 열기",
  petSwap: "펫 바꿔 보기 (저장 안 됨)",
  states: "펫 상태 고정",
  release: "고정 해제",
  quip: "클릭 한마디",
  schedule: "오늘의 말 걸기 일정",
  none: "오늘은 예정이 없어요 (근무일이 아니거나 모두 꺼져 있어요)",
  stateNames: { idle: "평소", walk: "걷기", nag: "잔소리", sleep: "졸기", hover: "호버", click: "클릭", drag: "드래그" },
  momentNames: { lunch: "점심 메뉴 추천", countdown3h: "퇴근 3시간 전", countdown1h: "퇴근 1시간 전", goodbye: "퇴근 5분 전" },
  myCalendar: "내 캘린더 일정 (불러오기 확인)",
  load: "일정 불러오기",
  noUrls: "일반 탭에서 캘린더 주소를 먼저 추가해 주세요 (저장 전이어도 입력한 주소로 불러와요)",
  noEvents: "어제부터 모레까지 시각이 있는 일정이 없어요 (종일 일정은 제외돼요)",
  loadFail: "불러오지 못했어요: ",
  sendAlert: "알림 보내기",
  sendHello: "인사 보내기",
  past: "지남",
  now: "지금 보낼 수 있어요",
  inMin: (m: number) => `${m}분 뒤`,
};
