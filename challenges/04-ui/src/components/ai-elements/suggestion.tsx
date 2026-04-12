import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

type SuggestionsProps = ComponentProps<'div'>;

export function Suggestions({ className, ...props }: SuggestionsProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2',
        className,
      )}
      {...props}
    />
  );
}

type SuggestionProps = Omit<ComponentProps<typeof Button>, 'onClick' | 'children'> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

export function Suggestion({ suggestion, onClick, className, ...props }: SuggestionProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        'h-auto rounded-full border-white/10 bg-white/6 px-3 py-2 text-left text-xs text-slate-200 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-white',
        className,
      )}
      onClick={() => onClick?.(suggestion)}
      {...props}
    >
      {suggestion}
    </Button>
  );
}
