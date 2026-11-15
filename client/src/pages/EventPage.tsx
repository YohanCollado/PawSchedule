import { useState, type FormEvent } from "react";
import { ApiError, type FieldErrors } from "../api/client";
import { useCreateComment, useCreatePost, useEvent, usePosts } from "../api/queries";
import { POST_LIMITS, type PostWithComments } from "../api/types";
import { Header } from "../components/Header";
import { ClockIcon, PinIcon } from "../components/icons";
import { dayLabel, timeRange } from "../lib/dates";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-xs text-red-700">{messages[0]}</p>;
}

/** Client-side checks that mirror the server rules, so most mistakes never hit the API. */
function checkText(label: string, value: string, min: number, max: number): string[] | undefined {
  const trimmed = value.trim();
  if (!trimmed) return [`${label} is required`];
  if (trimmed.length < min) return [`${label} must be at least ${min} characters`];
  if (trimmed.length > max) return [`${label} must be at most ${max} characters`];
  return undefined;
}

function compact(errors: FieldErrors): FieldErrors {
  return Object.fromEntries(Object.entries(errors).filter(([, value]) => value?.length));
}

export function EventPage({ eventId }: { eventId: string }) {
  const event = useEvent(eventId);
  const posts = usePosts(eventId);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <a href="/" className="text-sm font-medium text-navy hover:underline">
          ← All events
        </a>

        {event.isPending ? (
          <p className="text-slate-600">Loading event…</p>
        ) : event.isError ? (
          <p className="rounded-lg bg-red-50 p-4 text-red-800">
            {event.error instanceof ApiError && event.error.status === 404
              ? "This event doesn't exist."
              : `Could not load the event: ${event.error.message}`}
          </p>
        ) : (
          <>
            <section className="rounded-xl border border-slate-200 border-l-4 border-l-gold bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-600">
                {event.data.clubName} · {event.data.category.name}
              </p>
              <h1 className="text-2xl font-bold text-navy">{event.data.title}</h1>
              <div className="mt-3 space-y-1.5 text-sm text-slate-700">
                <p className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 shrink-0 text-gold" />
                  {dayLabel(new Date(event.data.start))}, {timeRange(event.data.start, event.data.end)}
                </p>
                <p className="flex items-center gap-2">
                  <PinIcon className="h-4 w-4 shrink-0 text-gold" />
                  {event.data.location} · {event.data.campus}
                </p>
              </div>
              {event.data.description && <p className="mt-3 text-sm text-slate-700">{event.data.description}</p>}
            </section>

            <ShareExperienceForm eventId={eventId} />

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-navy">
                Student experiences{posts.data ? ` (${posts.data.length})` : ""}
              </h2>
              {posts.isPending ? (
                <p className="text-slate-600">Loading posts…</p>
              ) : posts.isError ? (
                <p className="text-red-700">Could not load posts: {posts.error.message}</p>
              ) : posts.data.length === 0 ? (
                <p className="text-slate-600">No posts yet. Be the first to share what you learned!</p>
              ) : (
                posts.data.map((post) => <PostCard key={post.id} eventId={eventId} post={post} />)
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function ShareExperienceForm({ eventId }: { eventId: string }) {
  const createPost = useCreatePost(eventId);
  const [authorName, setAuthorName] = useState("");
  const [whatIDid, setWhatIDid] = useState("");
  const [whatILearned, setWhatILearned] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    const local = compact({
      authorName: checkText("Your name", authorName, 1, POST_LIMITS.name),
      whatIDid: checkText("What you did", whatIDid, POST_LIMITS.textMin, POST_LIMITS.textMax),
      whatILearned: checkText("What you learned", whatILearned, POST_LIMITS.textMin, POST_LIMITS.textMax),
    });
    setErrors(local);
    if (Object.keys(local).length) return;

    createPost.mutate(
      { authorName, whatIDid, whatILearned },
      {
        onSuccess: () => {
          setWhatIDid("");
          setWhatILearned("");
          setSaved(true);
        },
        onError: (error) => setErrors(error instanceof ApiError ? error.fieldErrors : {}),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-navy">Share your experience</h2>

      <label className="block text-sm font-medium text-slate-700">
        Your name
        <input
          className={inputClass}
          value={authorName}
          maxLength={POST_LIMITS.name}
          onChange={(e) => setAuthorName(e.target.value)}
        />
        <FieldError messages={errors.authorName} />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        What did you do?
        <textarea
          className={inputClass}
          rows={3}
          value={whatIDid}
          maxLength={POST_LIMITS.textMax}
          onChange={(e) => setWhatIDid(e.target.value)}
        />
        <span className="text-xs text-slate-500">
          {whatIDid.trim().length}/{POST_LIMITS.textMax} (min {POST_LIMITS.textMin})
        </span>
        <FieldError messages={errors.whatIDid} />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        What did you learn?
        <textarea
          className={inputClass}
          rows={3}
          value={whatILearned}
          maxLength={POST_LIMITS.textMax}
          onChange={(e) => setWhatILearned(e.target.value)}
        />
        <span className="text-xs text-slate-500">
          {whatILearned.trim().length}/{POST_LIMITS.textMax} (min {POST_LIMITS.textMin})
        </span>
        <FieldError messages={errors.whatILearned} />
      </label>

      {createPost.isError && !(createPost.error instanceof ApiError && createPost.error.status === 400) && (
        <p className="text-sm text-red-700">Could not save your post: {createPost.error.message}</p>
      )}
      {saved && <p className="text-sm text-emerald-700">Thanks! Your post is up.</p>}

      <button
        type="submit"
        disabled={createPost.isPending}
        className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-60"
      >
        {createPost.isPending ? "Posting…" : "Post"}
      </button>
    </form>
  );
}

function PostCard({ eventId, post }: { eventId: string; post: PostWithComments }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-600">
        <span className="font-semibold text-navy">{post.authorName}</span> · {formatWhen(post.createdAt)}
      </p>
      <h3 className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">What I did</h3>
      <p className="whitespace-pre-line text-sm text-slate-800">{post.whatIDid}</p>
      <h3 className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">What I learned</h3>
      <p className="whitespace-pre-line text-sm text-slate-800">{post.whatILearned}</p>

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
        {post.comments.map((comment) => (
          <div key={comment.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="font-semibold text-navy">{comment.authorName}</span>{" "}
            <span className="text-xs text-slate-500">· {formatWhen(comment.createdAt)}</span>
            <p className="whitespace-pre-line text-slate-800">{comment.body}</p>
          </div>
        ))}
        <CommentBox eventId={eventId} postId={post.id} />
      </div>
    </article>
  );
}

function CommentBox({ eventId, postId }: { eventId: string; postId: string }) {
  const createComment = useCreateComment(eventId, postId);
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const local = compact({
      authorName: checkText("Your name", authorName, 1, POST_LIMITS.name),
      body: checkText("Comment", body, 1, POST_LIMITS.comment),
    });
    setErrors(local);
    if (Object.keys(local).length) return;

    createComment.mutate(
      { authorName, body },
      {
        onSuccess: () => setBody(""),
        onError: (error) => setErrors(error instanceof ApiError ? error.fieldErrors : {}),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-wrap items-start gap-2 pt-1">
      <div className="w-full sm:w-36">
        <input
          aria-label="Your name"
          placeholder="Your name"
          className={`${inputClass} mt-0`}
          value={authorName}
          maxLength={POST_LIMITS.name}
          onChange={(e) => setAuthorName(e.target.value)}
        />
        <FieldError messages={errors.authorName} />
      </div>
      <div className="min-w-0 flex-1">
        <input
          aria-label="Write a comment"
          placeholder="Write a comment…"
          className={`${inputClass} mt-0`}
          value={body}
          maxLength={POST_LIMITS.comment}
          onChange={(e) => setBody(e.target.value)}
        />
        <FieldError messages={errors.body} />
      </div>
      <button
        type="submit"
        disabled={createComment.isPending}
        className="rounded-lg border border-navy px-3 py-2 text-sm font-semibold text-navy hover:bg-navy/5 disabled:opacity-60"
      >
        {createComment.isPending ? "…" : "Comment"}
      </button>
      {createComment.isError && !(createComment.error instanceof ApiError && createComment.error.status === 400) && (
        <p className="w-full text-xs text-red-700">Could not post comment: {createComment.error.message}</p>
      )}
    </form>
  );
}
