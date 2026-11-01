"use client";

import { useState } from "react";
import type { PostView } from "@/types";
import { postImagesToLightbox, postRef } from "@/lib/posts";
import Lightbox from "@/components/Lightbox/Lightbox";
import PostCard from "./PostCard";
import type { PostOwnerActions } from "./PostCard";
import styles from "./Posts.module.css";

type Props = {
  posts: PostView[];
  showAuthor?: boolean;
  canModerate?: boolean;
  owner?: PostOwnerActions;
};

export default function PostList({ posts, showAuthor = false, canModerate = false, owner }: Props) {
  const [viewer, setViewer] = useState<{ ref: string; index: number } | null>(null);

  const current = viewer
    ? posts.find((p) => postRef(p.stallSlug, p.id) === viewer.ref)
    : undefined;
  const items = current ? postImagesToLightbox(current) : [];

  return (
    <>
      <ul className={styles.list}>
        {posts.map((post) => {
          const ref = postRef(post.stallSlug, post.id);
          return (
            <li key={ref} className={styles.listItem}>
              <PostCard
                post={post}
                showAuthor={showAuthor}
                canModerate={canModerate}
                owner={owner}
                onOpenImage={(index) => setViewer({ ref, index })}
              />
            </li>
          );
        })}
      </ul>

      <Lightbox
        artworks={items}
        index={current && viewer ? viewer.index : null}
        onClose={() => setViewer(null)}
        onChange={(index) => setViewer((v) => (v ? { ...v, index } : v))}
      />
    </>
  );
}