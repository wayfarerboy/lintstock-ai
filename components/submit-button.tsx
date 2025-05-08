'use client';

import { useFormStatus } from 'react-dom';

import { LoaderIcon, CheckCircleFillIcon } from '@/components/icons';

import { Button } from './ui/button';

export function SubmitButton({
  children,
  isSuccessful,
}: {
  children: React.ReactNode;
  isSuccessful: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type={pending ? 'button' : 'submit'}
      aria-disabled={pending || isSuccessful}
      disabled={pending || isSuccessful}
      className="relative"
    >
      {children}

      {pending && (
        <span className="animate-spin absolute right-4">
          <LoaderIcon />
        </span>
      )}

      {isSuccessful && (
        <span className="absolute right-4">
          <CheckCircleFillIcon />
        </span>
      )}

      <output aria-live="polite" className="sr-only">
        {pending ? 'Loading' : isSuccessful ? 'Submitted' : 'Submit form'}
      </output>
    </Button>
  );
}
