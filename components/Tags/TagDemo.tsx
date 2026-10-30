"use client";

import { useState } from "react";
import type { TagInfo } from "@/types";
import TagInput from "./TagInput";

export default function TagDemo({ catalog }: { catalog: TagInfo[] }) {
  const [tags, setTags] = useState<string[]>(["пейзаж"]);

  return (
    <div>
      <h2>Теги работы</h2>
      <TagInput catalog={catalog} value={tags} onChange={setTags} />
      <h2>Что сохранится в базе</h2>
      <pre>{JSON.stringify(tags, null, 2)}</pre>
    </div>
  );
}