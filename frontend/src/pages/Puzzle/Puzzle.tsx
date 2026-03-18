import React, { useEffect, useMemo, useRef, useState } from "react";

type GameStage = "idle" | "loading" | "prompt" | "generating" | "playing" | "won";

type Piece = {
  id: number;
  correctIndex: number;
  currentSlot: number | null;
  bgX: number;
  bgY: number;
};

const DEFAULT_GRID = 3;
const IMAGE_SIZE = 1024;

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createPieces(gridSize: number): Piece[] {
  const total = gridSize * gridSize;
  const pieces: Piece[] = [];

  for (let index = 0; index < total; index++) {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    pieces.push({
      id: index,
      correctIndex: index,
      currentSlot: null,
      bgX: col,
      bgY: row,
    });
  }

  return shuffle(pieces);
}

function isSolved(pieces: Piece[]) {
  return pieces.length > 0 && pieces.every((piece) => piece.currentSlot === piece.correctIndex);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function animateProgress(
  setProgress: React.Dispatch<React.SetStateAction<number>>,
  target = 100,
  stepDelay = 35,
) {
  let value = 0;
  while (value < target) {
    value = Math.min(target, value + Math.floor(Math.random() * 8) + 2);
    setProgress(value);
    await sleep(stepDelay);
  }
}

function buildImageUrl(prompt: string, seed: number) {
  const safePrompt = encodeURIComponent(`${prompt}, puzzle art, clean background, centered subject`);
  return `https://image.pollinations.ai/prompt/${safePrompt}?width=${IMAGE_SIZE}&height=${IMAGE_SIZE}&seed=${seed}&nologo=true`;
}

function buildFallbackCatSvg(seed: number) {
  const hue = seed % 360;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${hue}, 80%, 18%)" />
          <stop offset="50%" stop-color="hsl(${(hue + 40) % 360}, 70%, 12%)" />
          <stop offset="100%" stop-color="hsl(${(hue + 90) % 360}, 80%, 10%)" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.35)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="1024" height="1024" fill="url(#bg)" />
      <circle cx="512" cy="300" r="280" fill="url(#glow)" />
      <g transform="translate(512 540)">
        <ellipse cx="0" cy="40" rx="235" ry="220" fill="#f5c48a" />
        <path d="M-170 -90 L-105 -255 L-25 -115 Z" fill="#f5c48a" />
        <path d="M170 -90 L105 -255 L25 -115 Z" fill="#f5c48a" />
        <path d="M-140 -105 L-98 -210 L-42 -120 Z" fill="#f59db0" opacity="0.9" />
        <path d="M140 -105 L98 -210 L42 -120 Z" fill="#f59db0" opacity="0.9" />
        <ellipse cx="-82" cy="10" rx="34" ry="42" fill="#111827" />
        <ellipse cx="82" cy="10" rx="34" ry="42" fill="#111827" />
        <circle cx="-74" cy="-3" r="10" fill="#ffffff" opacity="0.9" />
        <circle cx="90" cy="-3" r="10" fill="#ffffff" opacity="0.9" />
        <path d="M0 35 L-18 68 L18 68 Z" fill="#ec4899" />
        <path d="M-6 70 C-34 88 -56 100 -84 110" stroke="#111827" stroke-width="9" stroke-linecap="round" fill="none" />
        <path d="M6 70 C34 88 56 100 84 110" stroke="#111827" stroke-width="9" stroke-linecap="round" fill="none" />
        <path d="M-48 78 H-182" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.75" />
        <path d="M-48 96 H-192" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.65" />
        <path d="M48 78 H182" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.75" />
        <path d="M48 96 H192" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.65" />
        <ellipse cx="0" cy="238" rx="145" ry="76" fill="rgba(255,255,255,0.08)" />
      </g>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function preloadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Could not load image: ${src}`));
    img.src = src;
  });
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function CatPuzzleGame() {
  const [stage, setStage] = useState<GameStage>("idle");
  const [progress, setProgress] = useState(0);
  const [gridSize, setGridSize] = useState(DEFAULT_GRID);
  const [imageUrl, setImageUrl] = useState("");
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [draggingPieceId, setDraggingPieceId] = useState<number | null>(null);
  const [message, setMessage] = useState("Press Start Game to begin.");
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  const totalPieces = useMemo(() => gridSize * gridSize, [gridSize]);

  useEffect(() => {
    if (stage === "playing") {
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [stage]);

  useEffect(() => {
    if (pieces.length > 0 && stage === "playing" && isSolved(pieces)) {
      setStage("won");
      setMessage("Perfect. You solved the puzzle.");
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [pieces, stage]);

  const startGame = async () => {
    setStage("loading");
    setProgress(0);
    setMoves(0);
    setSeconds(0);
    setImageUrl("");
    setPieces([]);
    setMessage("Preparing your puzzle...");
    await animateProgress(setProgress, 100, 24);
    setStage("prompt");
    setMessage("Tap the button to generate an AI cat image.");
  };

  const generateCatImage = async () => {
    setStage("generating");
    setProgress(0);
    setMessage("Generating cat image...");

    try {
      const catPrompts = [
        "cute fluffy orange cat, ultra detailed, soft cinematic lighting, centered portrait",
        "adorable white kitten, dreamy glow, highly detailed fur, centered composition",
        "playful tabby cat, studio photo, soft shadows, centered subject",
        "elegant long hair cat, fantasy lighting, ultra realistic, centered frame",
        "blue eyed kitten, luxury portrait, highly detailed, centered composition",
        "sleepy cat with soft fur, cozy warm light, photorealistic, centered portrait",
      ];

      const randomPrompt = catPrompts[Math.floor(Math.random() * catPrompts.length)];
      const seed = Date.now();
      const aiUrl = buildImageUrl(randomPrompt, seed);

      try {
        await Promise.all([preloadImage(aiUrl), animateProgress(setProgress, 100, 30)]);
        setImageUrl(aiUrl);
        setMessage("AI cat image generated. Drag pieces into the correct places.");
      } catch (providerError) {
        console.warn("AI provider failed, using built-in fallback cat image instead.", providerError);
        const fallbackUrl = buildFallbackCatSvg(seed);
        await Promise.all([preloadImage(fallbackUrl), animateProgress(setProgress, 100, 18)]);
        setImageUrl(fallbackUrl);
        setMessage("Drag pieces into the correct places.");
      }

      setPieces(createPieces(gridSize));
      setMoves(0);
      setSeconds(0);
      setStage("playing");
    } catch (error) {
      console.error(error);
      setStage("prompt");
      setMessage("Image loading failed. Try again.");
    }
  };

  const movePieceToSlot = (pieceId: number, targetSlot: number) => {
    setPieces((prev) => {
      const next = prev.map((piece) => ({ ...piece }));
      const draggedPiece = next.find((piece) => piece.id === pieceId);
      if (!draggedPiece) return prev;

      const occupyingPiece = next.find((piece) => piece.currentSlot === targetSlot && piece.id !== pieceId);
      const originalSlot = draggedPiece.currentSlot;

      draggedPiece.currentSlot = targetSlot;
      if (occupyingPiece) {
        occupyingPiece.currentSlot = originalSlot;
      }

      return next;
    });

    setMoves((prev) => prev + 1);
  };

  const returnPieceToTray = (pieceId: number) => {
    setPieces((prev) => {
      const next = prev.map((piece) => ({ ...piece }));
      const draggedPiece = next.find((piece) => piece.id === pieceId);
      if (!draggedPiece) return prev;
      draggedPiece.currentSlot = null;
      return next;
    });
  };

  const handleDropOnSlot = (slotIndex: number) => {
    if (draggingPieceId === null) return;
    movePieceToSlot(draggingPieceId, slotIndex);
    setDraggingPieceId(null);
  };

  const resetPuzzle = () => {
    if (!imageUrl) return;
    setPieces(createPieces(gridSize));
    setMoves(0);
    setSeconds(0);
    setStage("playing");
    setMessage("Puzzle reshuffled.");
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .cat-page {
          min-height: 100vh;
          padding: 24px;
          color: white;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          background:
            radial-gradient(circle at top, #312e81 0%, #0f172a 30%, #020617 65%, #000 100%);
        }
        .cat-shell {
          max-width: 1380px;
          margin: 0 auto;
          min-height: calc(100vh - 48px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cat-app {
          width: 100%;
          position: relative;
          overflow: hidden;
          border-radius: 40px;
          border: 1px solid rgba(255,255,255,0.12);
          background: linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.06));
          box-shadow: 0 40px 120px rgba(0,0,0,0.45);
          backdrop-filter: blur(30px);
          padding: 28px;
        }
        .cat-glow, .cat-glow2, .cat-glow3 {
          position: absolute;
          border-radius: 999px;
          filter: blur(60px);
          pointer-events: none;
        }
        .cat-glow { left: -80px; top: -10px; width: 260px; height: 260px; background: rgba(34,211,238,0.22); }
        .cat-glow2 { right: -70px; top: 80px; width: 260px; height: 260px; background: rgba(217,70,239,0.2); }
        .cat-glow3 { left: 32%; bottom: -80px; width: 300px; height: 300px; background: rgba(251,191,36,0.12); }
        .cat-hero {
          position: relative;
          text-align: center;
          max-width: 860px;
          margin: 0 auto 28px;
        }
        .cat-badge {
          display: inline-flex;
          align-items: center;
          padding: 10px 18px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 10px 30px rgba(255,255,255,0.08);
          backdrop-filter: blur(14px);
          font-size: 14px;
          color: rgba(255,255,255,0.86);
        }
        .cat-title {
          margin: 16px 0 10px;
          font-size: clamp(38px, 8vw, 76px);
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.04em;
          background: linear-gradient(90deg, #fff, #dbeafe, #f5d0fe);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .cat-subtitle {
          margin: 0 auto;
          max-width: 760px;
          color: #dbe4f2;
          font-size: 18px;
          line-height: 1.6;
        }
        .top-bar, .message-box, .prompt-box, .panel {
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(22px);
        }
        .top-bar {
          margin: 0 auto 24px;
          max-width: 1120px;
          display: flex;
          gap: 18px;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          border-radius: 32px;
          padding: 18px;
          background: linear-gradient(180deg, rgba(0,0,0,0.28), rgba(255,255,255,0.04));
          box-shadow: 0 20px 70px rgba(0,0,0,0.28);
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(100px, 1fr));
          gap: 12px;
          flex: 1;
          min-width: 280px;
        }
        .stat {
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.1);
          background: linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06));
          box-shadow: 0 16px 40px rgba(0,0,0,0.18);
          padding: 14px;
          text-align: center;
        }
        .stat-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.24em;
          color: #cbd5e1;
        }
        .stat-value {
          margin-top: 6px;
          font-size: 20px;
          font-weight: 800;
        }
        .controls {
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
        }
        .glass-select, .ghost-btn, .solid-btn, .gradient-btn {
          border: 0;
          outline: none;
          cursor: pointer;
          transition: transform .2s ease, opacity .2s ease, box-shadow .2s ease;
          font-weight: 700;
        }
        .glass-select {
          padding: 14px 16px;
          border-radius: 18px;
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.1);
          min-width: 110px;
        }
        .glass-select option { color: #0f172a; }
        .solid-btn {
          padding: 14px 24px;
          border-radius: 20px;
          color: #0f172a;
          background: white;
          box-shadow: 0 18px 45px rgba(255,255,255,0.18);
        }
        .ghost-btn {
          padding: 14px 24px;
          border-radius: 20px;
          color: white;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
        }
        .gradient-btn {
          position: relative;
          padding: 16px 28px;
          border-radius: 22px;
          color: white;
          background: linear-gradient(90deg, #22d3ee, #d946ef, #f59e0b);
          box-shadow: 0 20px 60px rgba(168,85,247,0.32);
          font-size: 18px;
        }
        .solid-btn:hover, .ghost-btn:hover, .gradient-btn:hover { transform: translateY(-1px) scale(1.02); }
        .progress-wrap {
          margin: 0 auto 24px;
          max-width: 920px;
          border-radius: 28px;
          padding: 20px;
          border: 1px solid rgba(34,211,238,0.22);
          background: rgba(34,211,238,0.1);
        }
        .progress-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          color: #cffafe;
          font-size: 14px;
          margin-bottom: 12px;
        }
        .progress-track {
          height: 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #67e8f9, #e879f9, #fcd34d);
          transition: width .3s ease;
        }
        .message-box {
          margin: 0 auto 24px;
          max-width: 920px;
          padding: 18px;
          border-radius: 28px;
          text-align: center;
          background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04));
          box-shadow: 0 15px 45px rgba(0,0,0,0.18);
          color: #f1f5f9;
        }
        .prompt-box {
          margin: 0 auto 32px;
          max-width: 920px;
          border-radius: 36px;
          padding: 24px;
          background: linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06));
          box-shadow: 0 30px 80px rgba(0,0,0,0.35);
        }
        .prompt-inner {
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          padding: 36px 24px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.1);
          background: radial-gradient(circle at top, rgba(34,211,238,0.22), rgba(168,85,247,0.14), rgba(255,255,255,0.04));
        }
        .paw {
          width: 84px;
          height: 84px;
          margin: 0 auto 18px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 20px 50px rgba(34,211,238,0.18);
        }
        .prompt-title {
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 800;
          margin: 0 0 10px;
        }
        .prompt-copy {
          max-width: 680px;
          margin: 0 auto 24px;
          color: #e2e8f0;
          line-height: 1.7;
        }
        .game-grid {
          margin: 0 auto;
          max-width: 1200px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 28px;
        }
        .panel {
          border-radius: 34px;
          padding: 22px;
          background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05));
          box-shadow: 0 24px 60px rgba(0,0,0,0.22);
        }
        .panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }
        .panel-title {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
        }
        .solved-chip {
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(74, 222, 128, 0.18);
          color: #bbf7d0;
          font-size: 14px;
          font-weight: 700;
        }
        .board {
          aspect-ratio: 1 / 1;
          width: 100%;
          display: grid;
          overflow: hidden;
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.12);
          background: linear-gradient(180deg, rgba(0,0,0,0.30), rgba(255,255,255,0.03));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .tray-label {
          margin: 18px 0 10px;
          font-size: 14px;
          font-weight: 700;
          color: #cbd5e1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .tray {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
          gap: 12px;
          padding: 14px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.1);
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
        }
        .tray-slot {
          aspect-ratio: 1 / 1;
          overflow: hidden;
          border-radius: 18px;
          border: 1px dashed rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.03);
          min-height: 110px;
        }
        .slot {
          position: relative;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.03);
        }
        .slot.correct { background: rgba(74, 222, 128, 0.14); }
        .slot-empty {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 12px;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .piece {
          width: 100%;
          height: 100%;
          min-height: 100%;
          display: block;
          position: relative;
          overflow: hidden;
          cursor: grab;
          transition: transform .18s ease, box-shadow .18s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.18);
          border-radius: 0;
          background: transparent;
        }
        .piece-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          max-width: none;
          object-fit: cover;
          user-select: none;
          -webkit-user-drag: none;
          pointer-events: none;
        }
        .piece:hover { transform: scale(0.985); }
        .piece:active { cursor: grabbing; }
        .reference-image {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          display: block;
          border-radius: 24px;
          transition: transform .4s ease;
        }
        .reference-frame {
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.25);
        }
        .reference-frame:hover .reference-image { transform: scale(1.03); }
        .info-card {
          margin-top: 24px;
          border-radius: 30px;
          padding: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05));
        }
        .win-card {
          margin-top: 24px;
          border-radius: 30px;
          padding: 20px;
          border: 1px solid rgba(167,243,208,0.18);
          background: rgba(16,185,129,0.12);
          color: #d1fae5;
        }
        @media (max-width: 1024px) {
          .game-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 720px) {
          .cat-page { padding: 14px; }
          .cat-shell { min-height: calc(100vh - 28px); }
          .cat-app { padding: 16px; border-radius: 28px; }
          .top-bar { padding: 14px; }
          .stats { grid-template-columns: repeat(2, minmax(110px, 1fr)); }
          .controls { width: 100%; }
          .glass-select, .solid-btn, .ghost-btn, .gradient-btn { width: 100%; }
          .panel { padding: 16px; }
          .prompt-inner { padding: 28px 18px; }
        }
      `}</style>

      <div className="cat-page">
        <div className="cat-shell">
          <div className="cat-app">
            <div className="cat-glow" />
            <div className="cat-glow2" />
            <div className="cat-glow3" />

            <div className="cat-hero">
              <div className="cat-badge">AI Cat Puzzle</div>
              <h1 className="cat-title">Generate. Split. Solve.</h1>
              <p className="cat-subtitle">
                Create a cat image, turn it into a beautiful puzzle, and drag every piece into the correct place.
              </p>
            </div>

            <div className="top-bar">
              <div className="stats">
                <StatCard label="Pieces" value={String(totalPieces)} />
                <StatCard label="Moves" value={String(moves)} />
                <StatCard label="Time" value={formatTime(seconds)} />
                <StatCard label="Mode" value={`${gridSize}×${gridSize}`} />
              </div>

              <div className="controls">
                <select
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  disabled={stage === "loading" || stage === "generating" || stage === "playing"}
                  className="glass-select"
                >
                  <option value={2}>2 × 2</option>
                  <option value={3}>3 × 3</option>
                  <option value={4}>4 × 4</option>
                  <option value={5}>5 × 5</option>
                </select>

                <button onClick={startGame} className="solid-btn">
                  Start Game
                </button>

                {(stage === "playing" || stage === "won") && imageUrl && (
                  <button onClick={resetPuzzle} className="ghost-btn">
                    Reshuffle
                  </button>
                )}
              </div>
            </div>

            {(stage === "loading" || stage === "generating") && (
              <div className="progress-wrap">
                <div className="progress-row">
                  <span>{stage === "loading" ? "Loading game" : "Generating image"}</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="message-box">{message}</div>

            {stage === "prompt" && (
              <div className="prompt-box">
                <div className="prompt-inner">
                  <div className="paw">🐾</div>
                  <h2 className="prompt-title">Generate your AI cat puzzle</h2>
                  <p className="prompt-copy">
                    One click creates a fresh cat image and instantly transforms it into a polished puzzle board.
                  </p>
                  <button onClick={generateCatImage} className="gradient-btn">
                    ✨ Generate AI Cats
                  </button>
                </div>
              </div>
            )}

            {imageUrl && (stage === "playing" || stage === "won") && (
              <div className="game-grid">
                <div className="panel">
                  <div className="panel-head">
                    <h3 className="panel-title">Puzzle Board</h3>
                    {stage === "won" && <div className="solved-chip">Solved</div>}
                  </div>

                  <div className="board" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
                    {Array.from({ length: totalPieces }).map((_, slotIndex) => {
                      const placedPiece = pieces.find((piece) => piece.currentSlot === slotIndex);
                      const isCorrect = placedPiece?.correctIndex === slotIndex;

                      return (
                        <div
                          key={slotIndex}
                          className={`slot ${isCorrect ? "correct" : ""}`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDropOnSlot(slotIndex)}
                        >
                          {!placedPiece && <div className="slot-empty">Drop</div>}

                          {placedPiece && (
                            <div
                              draggable
                              onDragStart={() => setDraggingPieceId(placedPiece.id)}
                              onDragEnd={() => setDraggingPieceId(null)}
                              className="piece"
                            >
                              <img
                                src={imageUrl}
                                alt=""
                                draggable={false}
                                className="piece-image"
                                style={{
                                  width: `${gridSize * 100}%`,
                                  height: `${gridSize * 100}%`,
                                  maxWidth: "none",
                                  transform: `translate(-${placedPiece.bgX * (100 / gridSize)}%, -${placedPiece.bgY * (100 / gridSize)}%)`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="tray-label">Pieces Tray</div>
                  <div
                    className="tray"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggingPieceId !== null) {
                        returnPieceToTray(draggingPieceId);
                        setDraggingPieceId(null);
                      }
                    }}
                  >
                    {pieces.filter((piece) => piece.currentSlot === null).map((piece) => (
                      <div key={piece.id} className="tray-slot">
                        <div
                          draggable
                          onDragStart={() => setDraggingPieceId(piece.id)}
                          onDragEnd={() => setDraggingPieceId(null)}
                          className="piece"
                        >
                          <img
                            src={imageUrl}
                            alt=""
                            draggable={false}
                            className="piece-image"
                            style={{
                              width: `${gridSize * 100}%`,
                              height: `${gridSize * 100}%`,
                              maxWidth: "none",
                              transform: `translate(-${piece.bgX * (100 / gridSize)}%, -${piece.bgY * (100 / gridSize)}%)`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="panel">
                    <div className="panel-head">
                      <h3 className="panel-title">Reference Image</h3>
                    </div>
                    <div className="reference-frame">
                      <img src={imageUrl} alt="Generated cat" className="reference-image" />
                    </div>
                  </div>

                  <div className="info-card">
                    <h3 className="panel-title" style={{ marginBottom: 10 }}>How to play</h3>
                    <div style={{ color: "#cbd5e1", lineHeight: 1.7 }}>
                      Drag puzzle pieces and drop them into the correct squares. When every piece is in the right position, you win.
                    </div>
                  </div>

                  {stage === "won" && (
                    <div className="win-card">
                      <h3 className="panel-title" style={{ marginBottom: 8 }}>Puzzle complete!</h3>
                      <div>Finished in {moves} moves and {formatTime(seconds)}.</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
