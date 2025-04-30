import { LiaSlideshare as LogoIcon } from 'react-icons/lia';
import Link from 'next/link';

export function LogoSection() {
  return (
    <div className="flex items-center gap-2">
      <Link className="flex items-center gap-1" href="/">
        <LogoIcon size={20} className="text-violet-700 dark:text-neutral-100" />
        <p className="text-lg font-medium dark:text-neutral-50">SnapRetro</p>
      </Link>
    </div>
  );
}
