import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { PrepQuestion } from "@/lib/prep/types";
import { EmptyState } from "./EmptyState";

const LETTERS = ["A", "B", "C", "D"] as const;

type Status = "answered" | "skipped" | "unseen";

/**
 * Interactive MCQ test: question palette, prev/next, confirm-submit and a
 * full results review (correct = green, wrong pick = red).
 */
export function McqTest({
  questions,
  backPath,
}: {
  questions: PrepQuestion[];
  /** route back to the model-set list */
  backPath: string;
}) {
  const [screen, setScreen] = useState<"test" | "results">("test");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | undefined>>({});
  const [visited, setVisited] = useState<Record<number, boolean>>({ 0: true });

  if (questions.length === 0) {
    return (
      <EmptyState
        title="प्रश्नहरू अहिले उपलब्ध छैनन्।"
        description="चाँडै नै नयाँ प्रश्नहरू प्रकाशित हुनेछन्।"
      />
    );
  }

  const total = questions.length;
  const answeredCount = questions.reduce((n, _q, i) => (answers[i] !== undefined ? n + 1 : n), 0);

  const status = (index: number): Status => {
    if (answers[index] !== undefined) return "answered";
    if (visited[index]) return "skipped";
    return "unseen";
  };

  const goTo = (index: number) => {
    if (index < 0 || index >= total) return;
    setCurrent(index);
    setVisited((v) => ({ ...v, [index]: true }));
  };

  const choose = (optionIndex: number) => {
    setAnswers((a) => ({ ...a, [current]: optionIndex }));
    setVisited((v) => ({ ...v, [current]: true }));
  };

  const submit = () => {
    const ok = window.confirm(
      "के तपाईं उत्तरहरू जम्मा गर्न चाहनुहुन्छ? जम्मा गरेपछि उत्तर परिवर्तन गर्न मिल्दैन।",
    );
    if (!ok) return;
    setScreen("results");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const reset = () => {
    setAnswers({});
    setVisited({ 0: true });
    setCurrent(0);
    setScreen("test");
  };

  if (screen === "results") {
    const correct = questions.reduce((n, q, i) => (answers[i] === q.correctIndex ? n + 1 : n), 0);
    const wrong = total - correct;
    const percent = total ? Math.round((correct / total) * 100) : 0;

    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-black text-slate-900">परिणाम</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              पुनः प्रयास
            </button>
            <Link
              to={backPath}
              className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
            >
              ← मोडेल सेटहरू
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
            <p className="text-lg font-black text-slate-900">
              प्राप्ताङ्क: {correct}/{total}
            </p>
          </div>
          <div className="rounded-xl border bg-emerald-50 p-4 text-center shadow-sm">
            <p className="flex items-center justify-center gap-1.5 text-lg font-black text-emerald-700">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              सही: {correct}
            </p>
          </div>
          <div className="rounded-xl border bg-red-50 p-4 text-center shadow-sm">
            <p className="flex items-center justify-center gap-1.5 text-lg font-black text-red-700">
              <XCircle className="h-5 w-5" aria-hidden="true" />
              गलत: {wrong}
            </p>
          </div>
          <div className="rounded-xl border bg-navy/10 p-4 text-center shadow-sm">
            <p className="text-lg font-black text-navy">प्रतिशत: {percent}%</p>
          </div>
        </div>

        <h3 className="mt-8 text-lg font-bold text-slate-900">उत्तर समीक्षा</h3>
        <ol className="mt-4 space-y-4">
          {questions.map((q, qi) => {
            const userPick = answers[qi];
            return (
              <li key={q.id} className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="font-semibold text-slate-900">
                  <span className="mr-2 font-black text-brand-red">{qi + 1}.</span>
                  {q.text}
                </p>
                <ul className="mt-3 space-y-2">
                  {q.options.map((option, oi) => {
                    const isCorrect = oi === q.correctIndex;
                    const isWrongPick = userPick === oi && !isCorrect;
                    return (
                      <li
                        key={oi}
                        className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
                          isCorrect
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                            : isWrongPick
                              ? "border-red-500 bg-red-50 text-red-900"
                              : "border-slate-200 text-slate-600"
                        }`}
                      >
                        <span>
                          <span className="mr-1.5 font-black">{LETTERS[oi]}.</span>
                          {option}
                        </span>
                        {isCorrect ? (
                          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            सही उत्तर
                          </span>
                        ) : isWrongPick ? (
                          <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            तपाईंको उत्तर
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                {userPick === undefined ? (
                  <p className="mt-2 text-xs font-semibold text-amber-600">छोडिएको प्रश्न</p>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            पुनः प्रयास
          </button>
          <Link
            to={backPath}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
          >
            ← मोडेल सेटहरू
          </Link>
        </div>
      </div>
    );
  }

  const question = questions[current];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {/* progress + question counter */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-700">
              प्रश्न {current + 1} / {total}
            </p>
            <p className="text-xs font-semibold text-slate-500">
              जवाफ दिइएको: {answeredCount} / {total}
            </p>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-red transition-all"
              style={{ width: `${((current + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* question */}
        <div className="mt-4 rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-red">प्रश्न</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{question.text}</p>
          <div className="mt-4 space-y-2">
            {question.options.map((option, oi) => {
              const selected = answers[current] === oi;
              return (
                <button
                  key={oi}
                  type="button"
                  onClick={() => choose(oi)}
                  aria-pressed={selected}
                  aria-label={`विकल्प ${LETTERS[oi]}`}
                  className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red ${
                    selected
                      ? "border-brand-red bg-brand-red/5 font-semibold text-slate-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-black ${
                      selected
                        ? "border-brand-red bg-brand-red text-white"
                        : "border-slate-300 text-slate-500"
                    }`}
                    aria-hidden="true"
                  >
                    {LETTERS[oi]}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* navigation */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            अघिल्लो
          </button>
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            disabled={current === total - 1}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:cursor-not-allowed disabled:opacity-50"
          >
            अर्को
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={submit}
            className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-red px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
          >
            जम्मा गर्नुहोस्
          </button>
        </div>
      </div>

      {/* question palette */}
      <aside className="rounded-xl border bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:self-start">
        <h3 className="text-sm font-bold text-slate-900">प्रश्न सूची</h3>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {questions.map((_, i) => {
            const st = status(i);
            const isCurrent = i === current;
            return (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`प्रश्न ${i + 1}`}
                aria-current={isCurrent ? "true" : undefined}
                className={`flex h-9 items-center justify-center rounded-md border text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red ${
                  st === "answered"
                    ? "border-emerald-400 bg-emerald-100 text-emerald-700"
                    : st === "skipped"
                      ? "border-amber-400 bg-amber-100 text-amber-700"
                      : "border-slate-300 bg-white text-slate-500"
                } ${isCurrent ? "ring-2 ring-brand-red" : ""}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border border-emerald-400 bg-emerald-100" />
            जवाफ दिइएको
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border border-amber-400 bg-amber-100" />
            छोडिएको
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border border-slate-300 bg-white" />
            बाँकी
          </li>
        </ul>
        <button
          type="button"
          onClick={submit}
          className="mt-4 w-full cursor-pointer rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
        >
          जम्मा गर्नुहोस्
        </button>
      </aside>
    </div>
  );
}
