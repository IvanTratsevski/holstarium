"use client";

import type { Post, PostView, StallData } from "@/types";
import {
  MAX_POSTS_PER_DAY,
  addPost,
  editPost,
  recentCount,
  removePost,
  sortPosts,
  togglePin,
  validatePost,
} from "@/lib/posts";
import PostComposer from "./PostComposer";
import PostList from "./PostList";
import type { PostOwnerActions } from "./PostCard";
import styles from "./Posts.module.css";

type Props = {
  stall: StallData;
  posts: Post[];
  onChange: (posts: Post[]) => void;
  isOwner: boolean;
};

export default function PostBoard({ stall, posts, onChange, isOwner }: Props) {
  const views: PostView[] = sortPosts(posts).map((p) => ({
    ...p,
    stallSlug: stall.slug,
    artistName: stall.artistName,
    accentColor: stall.accentColor,
  }));

  const publish = (post: Post): string | null => {
    if (recentCount(posts, Date.now()) >= MAX_POSTS_PER_DAY) {
      return `Не больше ${MAX_POSTS_PER_DAY} объявлений в сутки. Попробуйте позже.`;
    }
    onChange(addPost(posts, post));
    return null;
  };

  const owner: PostOwnerActions | undefined = isOwner
    ? {
        onTogglePin: (id) => onChange(togglePin(posts, id)),
        onEdit: (id, text) => {
          const post = posts.find((p) => p.id === id);
          const invalid = validatePost(text, post?.images.length ?? 0);
          if (invalid) return invalid;
          onChange(editPost(posts, id, text, Date.now()));
          return null;
        },
        onDelete: (id) => {
          const post = posts.find((p) => p.id === id);
          post?.images.forEach((img) => {
            if (img.imageUrl?.startsWith("blob:")) URL.revokeObjectURL(img.imageUrl);
          });
          onChange(removePost(posts, id));
        },
      }
    : undefined;

  return (
    <section className={styles.board} aria-label="Объявления">
      {isOwner && <PostComposer onPublish={publish} />}

      {views.length === 0 ? (
        <p className={styles.empty}>
          {isOwner
            ? "Здесь пока пусто. Расскажите подписчикам о планах, новых работах или открытии заказов."
            : "Автор пока ничего не публиковал."}
        </p>
      ) : (
        <PostList posts={views} canModerate={isOwner} owner={owner} />
      )}
    </section>
  );
}