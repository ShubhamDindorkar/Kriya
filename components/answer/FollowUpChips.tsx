"use client";

interface FollowUpChipsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export function FollowUpChips({ questions, onSelect }: FollowUpChipsProps) {
  if (questions.length === 0) return null;

  return (
    <section className="space-y-3 border-t border-border pt-6">
      <h2 className="text-sm font-medium text-muted-foreground">
        Related questions
      </h2>
      <div className="flex flex-wrap gap-2">
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSelect(question)}
            className="rounded-full border border-border bg-white px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-teal/40 hover:bg-accent"
          >
            {question}
          </button>
        ))}
      </div>
    </section>
  );
}
