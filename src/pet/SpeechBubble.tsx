import { bubbleButtons } from "../messages/ko";
import "./SpeechBubble.css";

export interface BubbleProps {
  message: string;
  onOk(): void;
  onSnooze(): void;
  onSkipToday(): void;
}

export function SpeechBubble({ message, onOk, onSnooze, onSkipToday }: BubbleProps) {
  return (
    <div className="bubble">
      <p>{message}</p>
      <div className="bubble-actions">
        <button onClick={onOk}>{bubbleButtons.ok}</button>
        <button onClick={onSnooze}>{bubbleButtons.snooze}</button>
        <button onClick={onSkipToday}>{bubbleButtons.skipToday}</button>
      </div>
    </div>
  );
}
