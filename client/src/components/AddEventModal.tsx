import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ApiError, type FieldErrors } from "../api/client";
import { useCategories, useClubs, useCreateEvent } from "../api/queries";
import { CAMPUSES, PERKS, type Campus, type EventWithClub, type NewEventPayload } from "../api/types";
import { toDateKey } from "../lib/dates";
import { CloseIcon } from "./icons";

interface FormState {
  title: string;
  clubId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  campus: Campus;
  description: string;
  perks: string[];
}

type FormField = keyof FormState;
type FormErrors = Partial<Record<FormField, string>>;

const emptyForm = (): FormState => ({
  title: "",
  clubId: "",
  date: toDateKey(new Date()),
  startTime: "",
  endTime: "",
  location: "",
  campus: "MMC",
  description: "",
  perks: [],
});

const toDate = (date: string, time: string) => new Date(`${date}T${time}`);

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.title.trim()) errors.title = "Title is required";
  if (!form.clubId) errors.clubId = "Choose a club";
  if (!form.date) errors.date = "Date is required";
  if (!form.startTime) errors.startTime = "Start time is required";
  if (!form.endTime) errors.endTime = "End time is required";
  if (!form.location.trim()) errors.location = "Location is required";

  if (form.date && form.startTime && toDate(form.date, form.startTime) <= new Date()) {
    errors.startTime = "Start must be in the future";
  }
  if (form.date && form.startTime && form.endTime && form.endTime <= form.startTime) {
    errors.endTime = "End must be after start";
  }
  return errors;
}

/** Maps API field names (start, end...) onto the form's inputs. */
function fromApiErrors(fieldErrors: FieldErrors): FormErrors {
  const fieldMap: Record<string, FormField> = { start: "startTime", end: "endTime" };
  const errors: FormErrors = {};
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages?.length) errors[fieldMap[field] ?? (field as FormField)] = messages[0];
  }
  return errors;
}

function addHour(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return `${String(Math.min(hours + 1, 23)).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (event: EventWithClub) => void;
}

export function AddEventModal({ open, onClose, onCreated }: AddEventModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const clubs = useClubs();
  const categories = useCategories();
  const createEvent = useCreateEvent();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setForm(emptyForm());
      setErrors({});
      setSubmitted(false);
      setFormError("");
      createEvent.reset();
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- only react to open/close

  const clubGroups = useMemo(
    () =>
      (categories.data ?? [])
        .map((category) => ({
          category,
          clubs: (clubs.data ?? []).filter((club) => club.categoryId === category.id),
        }))
        .filter((group) => group.clubs.length > 0),
    [categories.data, clubs.data],
  );

  const update = <K extends FormField>(field: K, value: FormState[K]) => {
    const next = { ...form, [field]: value };
    if (field === "startTime" && value && !form.endTime) next.endTime = addHour(value as string);
    setForm(next);
    // After the first submit, re-validate as the user fixes things.
    if (submitted) setErrors(validate(next));
  };

  const togglePerk = (perk: string) =>
    update("perks", form.perks.includes(perk) ? form.perks.filter((p) => p !== perk) : [...form.perks, perk]);

  // Wait for the error state to render, then move focus to the first invalid input.
  const focusFirstError = () =>
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError("");
    const clientErrors = validate(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) {
      focusFirstError();
      return;
    }

    const payload: NewEventPayload = {
      title: form.title.trim(),
      clubId: form.clubId,
      start: toDate(form.date, form.startTime).toISOString(),
      end: toDate(form.date, form.endTime).toISOString(),
      location: form.location.trim(),
      campus: form.campus,
      description: form.description.trim(),
      perks: form.perks,
    };

    try {
      const created = await createEvent.mutateAsync(payload);
      onCreated(created);
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length) {
        setErrors(fromApiErrors(error.fieldErrors));
        setFormError("Please fix the highlighted fields.");
        focusFirstError();
      } else {
        setFormError(error instanceof Error ? error.message : "Could not save the event.");
      }
    }
  };

  const inputClass = (field: FormField) =>
    `w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 ${
      errors[field] ? "border-red-500 focus:ring-red-200" : "border-slate-300 focus:border-navy focus:ring-gold/40"
    }`;

  const fieldProps = (field: FormField) => ({
    id: `event-${field}`,
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `event-${field}-error` : undefined,
    className: inputClass(field),
  });

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl p-0 shadow-2xl backdrop:bg-navy/60 backdrop:backdrop-blur-sm"
    >
      <form noValidate onSubmit={handleSubmit} className="flex max-h-[90dvh] flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id={titleId} className="text-lg font-bold text-navy">
            Add an event
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-navy"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          {formError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              {formError}
            </p>
          )}

          <Field label="Title" field="title" error={errors.title}>
            <input
              {...fieldProps("title")}
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Intro to Git Workshop"
              autoFocus
            />
          </Field>

          <Field label="Club" field="clubId" error={errors.clubId}>
            <select {...fieldProps("clubId")} value={form.clubId} onChange={(e) => update("clubId", e.target.value)}>
              <option value="">{clubs.isPending ? "Loading clubs…" : "Select a club"}</option>
              {clubGroups.map(({ category, clubs }) => (
                <optgroup key={category.id} label={category.name}>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="col-span-2 sm:col-span-1">
              <Field label="Date" field="date" error={errors.date}>
                <input
                  {...fieldProps("date")}
                  type="date"
                  min={toDateKey(new Date())}
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Start" field="startTime" error={errors.startTime}>
              <input
                {...fieldProps("startTime")}
                type="time"
                value={form.startTime}
                onChange={(e) => update("startTime", e.target.value)}
              />
            </Field>
            <Field label="End" field="endTime" error={errors.endTime}>
              <input
                {...fieldProps("endTime")}
                type="time"
                value={form.endTime}
                onChange={(e) => update("endTime", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr]">
            <Field label="Location" field="location" error={errors.location}>
              <input
                {...fieldProps("location")}
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. GC 243"
              />
            </Field>
            <Field label="Campus" field="campus" error={errors.campus}>
              <select
                {...fieldProps("campus")}
                value={form.campus}
                onChange={(e) => update("campus", e.target.value as Campus)}
              >
                {CAMPUSES.map((campus) => (
                  <option key={campus} value={campus}>
                    {campus}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description" field="description" error={errors.description} optional>
            <textarea
              {...fieldProps("description")}
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="What should students know?"
            />
          </Field>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-slate-700">Perks</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PERKS.map((perk) => (
                <label key={perk} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.perks.includes(perk)}
                    onChange={() => togglePerk(perk)}
                    className="h-4 w-4 rounded border-slate-300 accent-navy"
                  />
                  {perk}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createEvent.isPending}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light disabled:opacity-60"
          >
            {createEvent.isPending ? "Saving…" : "Add event"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

interface FieldProps {
  label: string;
  field: FormField;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}

function Field({ label, field, error, optional, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={`event-${field}`} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {optional && <span className="font-normal text-slate-400"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`event-${field}-error`} className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
