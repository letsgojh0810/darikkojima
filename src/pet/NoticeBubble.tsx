import { bubbleButtons } from "../messages/ko";
import type { Notice } from "./notices";
import "./SpeechBubble.css";

const okLabel = (n: Notice) => (n.kind === "reminder" ? bubbleButtons.done : bubbleButtons.got);

export interface NoticeBubbleProps {
  /** already ordered: important rows first */
  notices: Notice[];
  onDone(key: string): void;
  onDoneAll(): void;
  onSnoozeAll(): void;
  /** only offered when a single reminder is showing */
  onSkipToday(): void;
}

/** One bubble for everything waiting. A lone notice looks like before; several become rows. */
export function NoticeBubble({ notices, onDone, onDoneAll, onSnoozeAll, onSkipToday }: NoticeBubbleProps) {
  const only = notices.length === 1 ? notices[0] : undefined;
  const hasReminder = notices.some((n) => n.kind === "reminder");

  if (only) {
    return (
      <div className="bubble">
        <p>{only.message}</p>
        <button className="bubble-ok" onClick={() => onDone(only.key)}>
          {okLabel(only)}
        </button>
        {only.kind === "reminder" && (
          <div className="bubble-actions">
            <button onClick={onSnoozeAll}>{bubbleButtons.snooze}</button>
            <button onClick={onSkipToday}>{bubbleButtons.skipToday}</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bubble stack">
      {notices.map((n) => (
        <div className={n.kind === "reminder" ? "notice" : "notice pinned"} key={n.key}>
          <span>{n.message}</span>
          <button onClick={() => onDone(n.key)}>{okLabel(n)}</button>
        </div>
      ))}
      <button className="bubble-ok" onClick={onDoneAll}>
        {bubbleButtons.allDone}
      </button>
      {hasReminder && (
        <div className="bubble-actions">
          <button onClick={onSnoozeAll}>{bubbleButtons.allSnooze}</button>
        </div>
      )}
    </div>
  );
}
