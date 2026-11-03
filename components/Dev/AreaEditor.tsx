"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import type { District, MarketMap } from "@/types";
import { withBase } from "@/lib/withBase";
import styles from "./SlotEditor.module.css";

type Pt = [number, number];
type Props = { map: MarketMap; districts: District[] };

const centroid = (pts: Pt[]): Pt =>
  pts.length === 0
    ? [0, 0]
    : [
        Math.round(pts.reduce((s, p) => s + p[0], 0) / pts.length / 10) * 10,
        Math.round(pts.reduce((s, p) => s + p[1], 0) / pts.length / 10) * 10,
      ];

export default function AreaEditor({ map, districts }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [areas, setAreas] = useState<Record<string, Pt[]>>(() =>
    Object.fromEntries(
      districts.map((d) => [d.slug, (d.area?.points ?? []).map((p): Pt => [p[0], p[1]])])
    )
  );
  const [current, setCurrent] = useState(districts[0].slug);
  const [selected, setSelected] = useState<number | null>(null);
  const [snapStep, setSnapStep] = useState(10);
  const [zoom, setZoom] = useState(100);
  const [copied, setCopied] = useState(false);

  const { width: w, height: h } = map;
  const currentPoints = areas[current] ?? [];

  const toMapCoords = (e: { clientX: number; clientY: number }): Pt | null => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(ctm.inverse());
    const snap = (v: number) =>
      snapStep > 1 ? Math.round(v / snapStep) * snapStep : Math.round(v);
    return [Math.min(w, Math.max(0, snap(p.x))), Math.min(h, Math.max(0, snap(p.y)))];
  };

  const setCurrentPoints = (fn: (pts: Pt[]) => Pt[]) =>
    setAreas((a) => ({ ...a, [current]: fn(a[current] ?? []) }));

  const changeDistrict = (slug: string) => {
    setCurrent(slug);
    setSelected(null);
  };

  const addPoint = (e: PointerEvent) => {
    const c = toMapCoords(e);
    if (!c) return;
    setCurrentPoints((pts) => [...pts, c]);
    setSelected(currentPoints.length);
  };

  const startDrag = (e: PointerEvent<SVGGElement>, i: number) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelected(i);
  };

  const drag = (e: PointerEvent<SVGGElement>, i: number) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const c = toMapCoords(e);
    if (!c) return;
    setCurrentPoints((pts) => pts.map((p, idx) => (idx === i ? c : p)));
  };

  const endDrag = (e: PointerEvent<SVGGElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const removeSelected = () => {
    if (selected === null) return;
    setCurrentPoints((pts) => pts.filter((_, idx) => idx !== selected));
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
    const delta: Record<string, Pt> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const d = delta[e.key];
    if (!d) return;
    e.preventDefault();
    setCurrentPoints((pts) =>
      pts.map((p, idx): Pt => (idx === selected ? [p[0] + d[0], p[1] + d[1]] : p))
    );
  };

  const code = districts
    .map((d) => {
      const pts = areas[d.slug] ?? [];
      if (pts.length < 3) return `// ${d.slug}: нужно минимум 3 точки`;
      const label = centroid(pts);
      return (
        `// ${d.slug}\n` +
        `area: {\n` +
        `  points: [${pts.map((p) => `[${p[0]}, ${p[1]}]`).join(", ")}],\n` +
        `  label: [${label[0]}, ${label[1]}],\n` +
        `  color: "${d.area?.color ?? "#5fa8d3"}",\n` +
        `},`
      );
    })
    .join("\n\n");

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
      <h1>Разметка районов</h1>
      <p className={styles.hint}>
        Выберите район и кликайте по карте, чтобы ставить вершины многоугольника по порядку
        обхода. Перетаскивание сдвигает вершину, Delete удаляет выбранную, стрелки двигают на 1
        px (Shift: на 10 px). Другие районы показаны бледнее.
      </p>

      <div className={styles.toolbar}>
        <label>
          Район{" "}
          <select value={current} onChange={(e) => changeDistrict(e.target.value)}>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name} ({(areas[d.slug] ?? []).length} точек)
              </option>
            ))}
          </select>
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
          Удалить точку
        </button>
        <button
          type="button"
          onClick={() => {
            setCurrentPoints(() => []);
            setSelected(null);
          }}
        >
          Очистить район
        </button>
        <button
          type="button"
          onClick={() => {
            const original = districts.find((d) => d.slug === current)?.area?.points ?? [];
            setCurrentPoints(() => original.map((p): Pt => [p[0], p[1]]));
            setSelected(null);
          }}
        >
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
          {map.image ? (
            <image href={withBase(map.image)} width={w} height={h} />
          ) : (
            <>
              <defs>
                <pattern id="area-grid" width="200" height="200" patternUnits="userSpaceOnUse">
                  <path d="M200 0H0V200" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                </pattern>
              </defs>
              <rect width={w} height={h} fill="#2f3b34" />
              <rect width={w} height={h} fill="url(#area-grid)" />
            </>
          )}

          {/* прозрачный слой ловит клики по пустому месту */}
          <rect width={w} height={h} fill="transparent" onPointerDown={addPoint} />

          <g style={{ pointerEvents: "none" }}>
            {districts.map((d) => {
              const pts = areas[d.slug] ?? [];
              const isCurrent = d.slug === current;
              const color = d.area?.color ?? "#5fa8d3";
              const str = pts.map((p) => p.join(",")).join(" ");
              const label = centroid(pts);
              return (
                <g key={d.slug}>
                  {pts.length >= 3 ? (
                    <polygon
                      points={str}
                      fill={color}
                      fillOpacity={isCurrent ? 0.4 : 0.18}
                      stroke={isCurrent ? "#fff" : color}
                      strokeWidth={isCurrent ? 8 : 4}
                    />
                  ) : (
                    pts.length === 2 && (
                      <polyline points={str} fill="none" stroke="#fff" strokeWidth={8} />
                    )
                  )}
                  {pts.length >= 3 && (
                    <text
                      x={label[0]}
                      y={label[1]}
                      textAnchor="middle"
                      fontSize={90}
                      className={styles.num}
                    >
                      {d.name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {currentPoints.map((p, i) => (
            <g
              key={i}
              transform={`translate(${p[0]} ${p[1]})`}
              className={styles.marker}
              onPointerDown={(e) => startDrag(e, i)}
              onPointerMove={(e) => drag(e, i)}
              onPointerUp={endDrag}
            >
              <circle
                r={20}
                fill={i === selected ? "#ffd166" : "#fff"}
                stroke="#000"
                strokeWidth={4}
              />
              <text y={-30} fontSize={48} textAnchor="middle" className={styles.num}>
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <p>
        Точек у района: <strong>{currentPoints.length}</strong>
        {selected !== null && currentPoints[selected] && (
          <>
            {" "}
            · выбрана №{selected + 1}: x {currentPoints[selected][0]}, y {currentPoints[selected][1]}
          </>
        )}
      </p>

      <div className={styles.output}>
        <div className={styles.outputHead}>
          <strong>Готовый код (вставьте в нужный район в mock.ts)</strong>
          <button type="button" onClick={copy}>
            {copied ? "Скопировано ✓" : "Копировать"}
          </button>
        </div>
        <textarea readOnly value={code} rows={Math.min(districts.length * 8 + 2, 26)} />
      </div>
    </div>
  );
}