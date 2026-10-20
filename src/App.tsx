import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./App.css";

// P1 PoC: placeholder pet that reports its rect so Rust can toggle click-through.
function App() {
  const pet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const r = pet.current!.getBoundingClientRect();
    invoke("set_hit_rect", { x: r.x, y: r.y, w: r.width, h: r.height });
  }, []);

  // P2 PoC only: show the raw Windows notification state (2=busy 3=D3D fullscreen 4=presentation).
  const [state, setState] = useState<number>();
  useEffect(() => {
    const t = setInterval(() => invoke<number>("notification_state").then(setState), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      ref={pet}
      className="pet"
      onMouseDown={(e) => e.button === 0 && getCurrentWindow().startDragging()}
    >
      🐢
      <span className="debug">state {state}</span>
    </div>
  );
}

export default App;
