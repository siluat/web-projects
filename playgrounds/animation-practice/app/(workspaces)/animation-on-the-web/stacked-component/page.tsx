'use client';

import { useControls } from 'leva';
import { PageTitle } from '@/app/_components/PageTitle';
import './styles.css';

export default function Page() {
  const { length } = useControls({
    length: {
      value: 3,
      min: 1,
      step: 1,
    },
  });

  return (
    <>
      <PageTitle title="Stacked Component" />
      <StackedComponent length={length} />
    </>
  );
}

interface StackedComponentProps {
  length?: number;
}

export function StackedComponent({ length = 3 }: StackedComponentProps) {
  return (
    <div className="wrapper">
      {new Array(length).fill(0).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: not important in this case
        <div className="card" key={i} />
      ))}
    </div>
  );
}
