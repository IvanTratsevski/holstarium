"use client";

import type { TagInfo } from "@/types";
import TagInput from "@/components/Tags/TagInput";
import styles from "./ArtworkManager.module.css";

export type ArtworkFieldsValue = {
  title: string;
  description: string;
  alt: string;
  tags: string[];
};

type Props = {
  value: ArtworkFieldsValue;
  onChange: (patch: Partial<ArtworkFieldsValue>) => void;
  catalog: TagInfo[];
};

export default function ArtworkFields({ value, onChange, catalog }: Props) {
  return (
    <div className={styles.fields}>
      <label className={styles.field}>
        <span>Название</span>
        <input
          type="text"
          maxLength={60}
          value={value.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </label>

      <label className={styles.field}>
        <span>Описание</span>
        <textarea
          rows={3}
          maxLength={500}
          value={value.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </label>

      <label className={styles.field}>
        <span>Что изображено (alt)</span>
        <input
          type="text"
          maxLength={200}
          value={value.alt}
          onChange={(e) => onChange({ alt: e.target.value })}
        />
        <small>Коротко, для тех, кто не видит картинку: «Рыжий кот спит на подоконнике».</small>
      </label>

      <div className={styles.field}>
        <span>Теги</span>
        <TagInput catalog={catalog} value={value.tags} onChange={(tags) => onChange({ tags })} />
      </div>
    </div>
  );
}