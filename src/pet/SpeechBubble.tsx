import { bubbleButtons } from "../messages/ko";
import "./SpeechBubble.css";

export interface BubbleProps {
  message: string;
  onOk(): void;
  /** omitted for one-off alerts (calendar), which only offer the single confirm button */
  onSnooze?(): void;
  onSkipToday?(): void;
}

export function SpeechBubble({ message, onOk, onSnooze, onSkipToday }: BubbleProps) {
  return (
    <div className="bubble">
      <p>{message}</p>
      <button className="bubble-ok" onClick={onOk}>
        {onSnooze ? bubbleButtons.done : bubbleButtons.got}
      </button>
      {(onSnooze || onSkipToday) && (
        <div className="bubble-actions">
          {onSnooze && <button onClick={onSnooze}>{bubbleButtons.snooze}</button>}
          {onSkipToday && <button onClick={onSkipToday}>{bubbleButtons.skipToday}</button>}
        </div>
      )}
    </div>
  );
}
