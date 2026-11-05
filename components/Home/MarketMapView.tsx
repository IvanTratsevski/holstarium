"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import type { MapDistrictView, MarketMap } from "@/types";
import { withBase } from "@/lib/withBase";
import styles from "./Home.module.css";

const MAX_SCALE = 5;
const NAME_PX = 14; // размер названия на экране
const SUB_PX = 12;  // размер строки со счётчиками
const DRAG_PX = 6;  // насколько надо сдвинуть мышь, чтобы это считалось перетаскиванием

type Props = {
  map: MarketMap;
  districts: MapDistrictView[];
  active: string | null;
  onActive: (slug: string | null) => void;
};

export default function MarketMapView({ map, districts, active, onActive }: Props) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const downPos = useRef<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [width, setWidth] = useState(0); // ширина карты на экране, нужна для размера подписей

  const { width: w, height: h } = map;
  const mode = map.labels ?? "always";

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // наблюдатель сработает сразу при подключении и дальше при каждом изменении размера
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // сколько единиц карты помещается в один пиксель экрана: по нему подпись получает постоянный размер
  const unit = width > 0 ? w / (width * scale) : 1;
  const nameSize = NAME_PX * unit;
  const subSize = SUB_PX * unit;
  const crowded = width < 700 && scale < 2; // на узком экране подписи без приближения слипаются

  const open = (slug: string) => router.push(`/district/${slug}`);

  const handleClick = (e: MouseEvent, slug: string) => {
    // если карту тянули и отпустили над районом, это не клик
    const d = downPos.current;
    if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > DRAG_PX) return;
    open(slug);
  };

  const onKeyDown = (e: KeyboardEvent, slug: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open(slug);
    }
  };

  return (
    <>
      <TransformWrapper
        minScale={1}
        maxScale={MAX_SCALE}
        wheel={{ activationKeys: ["Control", "Meta"], step: 0.15 }}
        panning={{ velocityDisabled: true }}
        doubleClick={{ disabled: true }}
        onTransform={(_, s) => setScale(Math.round(s.scale * 20) / 20)}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <div ref={rootRef} className={styles.mapRoot}>
            <div className={styles.controls}>
              <button
                type="button"
                onClick={() => zoomIn()}
                disabled={scale >= MAX_SCALE}
                aria-label="Приблизить карту"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => zoomOut()}
                disabled={scale <= 1}
                aria-label="Отдалить карту"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => resetTransform()}
                disabled={scale <= 1}
                aria-label="Сбросить масштаб"
              >
                ⟲
              </button>
            </div>

            <TransformComponent
              wrapperClass={styles.wrapper}
              contentClass={styles.content}
              wrapperStyle={{ touchAction: scale > 1 ? "none" : "pan-y" }}
            >
              <svg
                viewBox={`0 0 ${w} ${h}`}
                className={styles.svg}
                role="group"
                aria-label="Карта рынка: нажмите на район, чтобы увидеть его лавки"
              >
                {map.image ? (
                  <image href={withBase(map.image)} width={w} height={h} />
                ) : (
                  <>
                    <defs>
                      <pattern id="market-grid" width="200" height="200" patternUnits="userSpaceOnUse">
                        <path d="M200 0H0V200" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                      </pattern>
                    </defs>
                    <rect width={w} height={h} fill="#2f3b34" />
                    <rect width={w} height={h} fill="url(#market-grid)" />
                  </>
                )}

                {districts.map((d) => {
                  if (!d.area) return null;
                  return (
                    <g
                      key={d.slug}
                      className={styles.area}
                      data-active={active === d.slug}
                      role="link"
                      tabIndex={0}
                      aria-label={`Район «${d.name}»: лавок ${d.stalls}, свободных мест ${d.free}`}
                      onPointerDown={(e) => {
                        downPos.current = { x: e.clientX, y: e.clientY };
                      }}
                      onClick={(e) => handleClick(e, d.slug)}
                      onKeyDown={(e) => onKeyDown(e, d.slug)}
                      onMouseEnter={() => onActive(d.slug)}
                      onMouseLeave={() => onActive(null)}
                      onFocus={() => onActive(d.slug)}
                      onBlur={() => onActive(null)}
                    >
                      <polygon
                        points={d.area.points.map((p) => p.join(",")).join(" ")}
                        style={{ fill: d.area.color }}
                      />
                    </g>
                  );
                })}

                {/* подписи в отдельном слое поверх всех областей, мыши они не мешают */}
                {width > 0 && (
                  <g className={styles.labels} aria-hidden="true">
                    {districts.map((d) => {
                      if (!d.area) return null;
                      const isActive = active === d.slug;
                      const showName = isActive || (mode === "always" && !crowded);
                      if (!showName) return null;
                      const showStats = isActive || scale >= 2.5;
                      const [lx, ly] = d.area.label;
                      return (
                        <g key={d.slug}>
                          <text
                            x={lx}
                            y={ly}
                            textAnchor="middle"
                            fontSize={nameSize}
                            className={styles.name}
                            style={{ strokeWidth: nameSize * 0.28 }}
                          >
                            {d.name}
                          </text>
                          {showStats && (
                            <text
                              x={lx}
                              y={ly + nameSize * 1.3}
                              textAnchor="middle"
                              fontSize={subSize}
                              className={styles.sub}
                              style={{ strokeWidth: subSize * 0.3 }}
                            >
                              Лавок: {d.stalls} · Свободно: {d.free}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                )}
              </svg>
            </TransformComponent>
          </div>
        )}
      </TransformWrapper>

      <p className={styles.mapHint}>
        Приближайте карту кнопками «+» и «−», колесом мыши с Ctrl или щипком пальцев. Чтобы
        двигать карту, перетащите её.
      </p>
    </>
  );
}