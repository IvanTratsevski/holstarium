"use client";

import { useRef } from "react";
import type { PointerEvent, MouseEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { District, MapSlotView } from "@/types";
import styles from "./DistrictMap.module.css";

type Props = { district: District; slots: MapSlotView[] };

export default function DistrictMap({ district, slots }: Props) {
  const router = useRouter();
  const downPos = useRef<{ x: number; y: number } | null>(null);

  const openStall = (slug: string) => router.push(`/stall/${slug}`);

  // Если пользователь тянул карту и отпустил над маркером, это не клик
  const handleClick = (e: MouseEvent, slug: string) => {
    const d = downPos.current;
    if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) return;
    openStall(slug);
  };

  const { mapWidth: w, mapHeight: h } = district;

  return (
    <TransformWrapper
      minScale={1}
      maxScale={6}
      panning={{ velocityDisabled: true }}
      doubleClick={{ disabled: true }}
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <div className={styles.root}>
          <div className={styles.controls}>
            <button type="button" onClick={() => zoomIn()} aria-label="Приблизить">+</button>
            <button type="button" onClick={() => zoomOut()} aria-label="Отдалить">−</button>
            <button type="button" onClick={() => resetTransform()} aria-label="Сбросить масштаб">⟲</button>
          </div>

          <TransformComponent wrapperClass={styles.wrapper} contentClass={styles.content}>
            <svg
              viewBox={`0 0 ${w} ${h}`}
              className={styles.svg}
              role="group"
              aria-label={`Карта района «${district.name}»`}
            >
              {/* фон: настоящая карта или заглушка */}
              {district.mapImage ? (
                <image href={district.mapImage} width={w} height={h} />
              ) : (
                <>
                  <defs>
                    <pattern id="grid" width="200" height="200" patternUnits="userSpaceOnUse">
                      <path d="M200 0H0V200" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                    </pattern>
                  </defs>
                  <rect width={w} height={h} fill="#2f3b34" />
                  <rect width={w} height={h} fill="url(#grid)" />
                  <text x={w / 2} y={h / 2} className={styles.bgTitle} textAnchor="middle" fontSize={140}>
                    {district.name}
                  </text>
                </>
              )}

              {/* маркеры слотов */}
              {slots.map((slot) => {
                const r = slot.size / 2;
                const st = slot.stall;

                return (
                  <g key={slot.id} transform={`translate(${slot.x} ${slot.y})`}>
                    {st ? (
                      <g
                        className={styles.marker}
                        role="link"
                        tabIndex={0}
                        aria-label={`Лавка: ${st.signText}`}
                        onPointerDown={(e: PointerEvent) => {
                          downPos.current = { x: e.clientX, y: e.clientY };
                        }}
                        onClick={(e) => handleClick(e, st.slug)}
                        onKeyDown={(e: KeyboardEvent) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openStall(st.slug);
                          }
                        }}
                      >
                        <title>{st.artistName}</title>
                        <circle r={r} fill={st.accentColor} stroke="#fff" strokeWidth={slot.size * 0.05} />
                        <text className={styles.initial} fontSize={slot.size * 0.45} dy="0.35em" textAnchor="middle">
                          {st.artistName.charAt(0).toUpperCase()}
                        </text>
                        <text
                          className={styles.label}
                          y={r + slot.size * 0.28}
                          fontSize={slot.size * 0.22}
                          textAnchor="middle"
                        >
                          {st.artistName}
                        </text>
                      </g>
                    ) : (
                      <g className={styles.free}>
                        <title>Место свободно</title>
                        <circle
                          r={r}
                          fill="rgba(255,255,255,0.06)"
                          stroke="rgba(255,255,255,0.45)"
                          strokeWidth={slot.size * 0.04}
                          strokeDasharray={`${slot.size * 0.12} ${slot.size * 0.1}`}
                        />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </TransformComponent>
        </div>
      )}
    </TransformWrapper>
  );
}