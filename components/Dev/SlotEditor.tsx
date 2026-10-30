"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import type { District, MapSlot } from "@/types";
import styles from "./SlotEditor.module.css";
import { withBase } from "@/lib/withBase";

type Point = { id: string; x: number; y: number };
type Props = { districts: District[]; slots: MapSlot[] };

export default function SlotEditor({ districts, slots }: Props) {
  const nextId = useRef(1);
  const svgRef = useRef<SVGSVGElement>(null);

  const loadPoints = (slug: string): Point[] =>
  slots
    .filter((s) => s.districtSlug === slug)
    .map((s) => ({ id: s.id, x: s.x, y: s.y }));

  const [slug, setSlug] = useState(districts[0].slug);
  const [points, setPoints] = useState<Point[]>(() => loadPoints(districts[0].slug));
  const [selected, setSelected] = useState<string | null>(null);
  const [size, setSize] = useState(120);
  const [snapStep, setSnapStep] = useState(10);
  const [zoom, setZoom] = useState(100);
  const [copied, setCopied] = useState(false);

  const district = districts.find((d) => d.slug === slug)!;
  const { mapWidth: w, mapHeight: h } = district;

  const changeDistrict = (newSlug: string) => {
    setSlug(newSlug);
    setPoints(loadPoints(newSlug));
    setSelected(null);
  };

  // экранные координаты → координаты карты
  const toMapCoords = (e: { clientX: number; clientY: number }) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(ctm.inverse());
    const snap = (v: number) =>
      snapStep > 1 ? Math.round(v / snapStep) * snapStep : Math.round(v);
    return {
      x: Math.min(w, Math.max(0, snap(p.x))),
      y: Math.min(h, Math.max(0, snap(p.y))),
    };
  };

  const addPoint = (e: PointerEvent) => {
  const c = toMapCoords(e);
  if (!c) return;
  const id = `new-${nextId.current++}`; // ref используется только в обработчике, не в рендере
  setPoints((prev) => [...prev, { id, ...c }]);
  setSelected(id);
};

const startDrag = (e: PointerEvent<SVGGElement>, id: string) => {
  e.stopPropagation();
  e.currentTarget.setPointerCapture(e.pointerId);
  setSelected(id);
};

const drag = (e: PointerEvent<SVGGElement>, id: string) => {
  if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
  const c = toMapCoords(e);
  if (!c) return;
  setPoints((prev) => prev.map((p) => (p.id === id ? { ...p, ...c } : p)));
};

  const endDrag = (e: PointerEvent<SVGGElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const removeSelected = () => {
    if (selected === null) return;
    setPoints((prev) => prev.filter((p) => p.id !== selected));
    setSelected(null);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (selected === null) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      removeSelected();
      return;
    }
    const step = e.shiftKey ? 10 : 1;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const d = delta[e.key];
    if (!d) return;
    e.preventDefault();
    setPoints((prev) =>
      prev.map((p) => (p.id === selected ? { ...p, x: p.x + d[0], y: p.y + d[1] } : p))
    );
  };

  const code =
    `// район: ${district.name}, карта ${w}×${h}, рекомендуемый size: ${size}\n` +
    `const ${slug}Positions: [number, number][] = [\n` +
    points.map((p) => `  [${p.x}, ${p.y}],`).join("\n") +
    `\n];`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // если буфер недоступен, текст можно скопировать вручную из поля ниже
    }
  };

  return (
    <div className={styles.root}>
      <h1>Разметка слотов</h1>
      <p className={styles.hint}>
        Клик по карте: новый маркер. Перетаскивание: сдвиг. Delete: удалить выбранный.
        Стрелки: подвинуть на 1 px (Shift: на 10 px). Номер на маркере совпадает с
        индексом в массиве.
      </p>

      <div className={styles.toolbar}>
        <label>
          Район{" "}
          <select value={slug} onChange={(e) => changeDistrict(e.target.value)}>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Размер маркера{" "}
          <input
            type="number"
            min={20}
            max={400}
            value={size}
            onChange={(e) => setSize(Number(e.target.value) || 120)}
          />
        </label>
        <label>
          Привязка к сетке (px){" "}
          <input
            type="number"
            min={1}
            max={200}
            value={snapStep}
            onChange={(e) => setSnapStep(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
        <label>
          Масштаб просмотра{" "}
          <input
            type="range"
            min={50}
            max={300}
            step={10}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />{" "}
          {zoom}%
        </label>
        <button type="button" onClick={removeSelected} disabled={selected === null}>
          Удалить выбранный
        </button>
        <button type="button" onClick={() => { setPoints([]); setSelected(null); }}>
          Очистить всё
        </button>
        <button type="button" onClick={() => { setPoints(loadPoints(slug)); setSelected(null); }}>
          Загрузить из mock.ts
        </button>
      </div>

      <div className={styles.viewport} tabIndex={0} onKeyDown={onKeyDown}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${w} ${h}`}
          className={styles.svg}
          style={{ width: `${zoom}%` }}
        >
          {district.mapImage ? (
            <image href={withBase(district.mapImage)} width={w} height={h} />
          ) : (
            <>
              <defs>
                <pattern id="dev-grid" width="200" height="200" patternUnits="userSpaceOnUse">
                  <path d="M200 0H0V200" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                </pattern>
              </defs>
              <rect width={w} height={h} fill="#2f3b34" />
              <rect width={w} height={h} fill="url(#dev-grid)" />
            </>
          )}

          {/* прозрачный слой ловит клики по пустому месту */}
          <rect width={w} height={h} fill="transparent" onPointerDown={addPoint} />

          {points.map((p, i) => (
            <g
              key={p.id}
              transform={`translate(${p.x} ${p.y})`}
              className={styles.marker}
              onPointerDown={(e) => startDrag(e, p.id)}
              onPointerMove={(e) => drag(e, p.id)}
              onPointerUp={endDrag}
            >
              <circle
                r={size / 2}
                fill={p.id === selected ? "rgba(255,209,102,0.45)" : "rgba(224,122,95,0.45)"}
                stroke={p.id === selected ? "#ffd166" : "#fff"}
                strokeWidth={size * 0.04}
              />
              <circle r={size * 0.04} fill="#fff" />
              <text
                y={size * 0.1}
                fontSize={size * 0.3}
                textAnchor="middle"
                className={styles.num}
              >
                {i}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <p>
        Маркеров: <strong>{points.length}</strong>
        {selected !== null && (() => {
          const p = points.find((x) => x.id === selected);
          return p ? <> · выбран: x {p.x}, y {p.y}</> : null;
        })()}
      </p>

      <div className={styles.output}>
        <div className={styles.outputHead}>
          <strong>Готовый код</strong>
          <button type="button" onClick={copy}>
            {copied ? "Скопировано ✓" : "Копировать"}
          </button>
        </div>
        <textarea readOnly value={code} rows={Math.min(points.length + 3, 20)} />
      </div>
    </div>
  );
}