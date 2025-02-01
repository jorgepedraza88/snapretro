import { ImSpinner as SpinnerIcon } from 'react-icons/im';

export default function Loading() {
  return (
    <div className="flex size-full items-center justify-center">
      <SpinnerIcon size={50} className="animate-spin text-violet-700" />
    </div>
  );
}
