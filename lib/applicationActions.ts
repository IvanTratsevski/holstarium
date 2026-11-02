import type { ApplicationDecision, ApplicationRecord } from "@/types";
import type { ApplicationForm } from "@/lib/application";
import { samplePreviews } from "@/lib/applications";
import { getSnapshot, update } from "@/lib/socialStore";

export type SubmitResult = { ok: true; id: string } | { ok: false; error: string };

export function submitApplication(form: ApplicationForm): SubmitResult {
  const email = form.email.trim().toLowerCase();
  const s = getSnapshot();

  const hasPending = s.applications.some(
    (a) => a.email.toLowerCase() === email && !s.decisions[a.id]
  );
  if (hasPending) {
    return { ok: false, error: "С этой почты уже есть заявка на рассмотрении. Дождитесь решения." };
  }

  const now = Date.now();
  const id = `A-${now.toString(36).toUpperCase().slice(-6)}`;

  form.samples.forEach((smp) => samplePreviews.set(smp.id, smp.url));

  const record: ApplicationRecord = {
    id,
    nick: form.nick.trim(),
    email: form.email.trim(),
    links: form.links.map((l) => l.trim()).filter(Boolean),
    samples: form.samples.map((smp) => ({
      id: smp.id,
      name: smp.name,
      aiGenerated: smp.aiGenerated,
    })),
    district: form.district,
    placeWish: form.placeWish.trim(),
    about: form.about.trim(),
    createdAt: now,
  };

  update((st) => ({ ...st, applications: [record, ...st.applications] }));
  return { ok: true, id };
}

export function decide(id: string, decision: ApplicationDecision) {
  update((st) => ({ ...st, decisions: { ...st.decisions, [id]: decision } }));
}

// только для прототипа: вернуть заявку в очередь, чтобы пройти сценарий заново
export function undoDecision(id: string) {
  update((st) => {
    const next = { ...st.decisions };
    delete next[id];
    return { ...st, decisions: next };
  });
}