'use client';

import { useControls } from 'leva';
import { PageTitle } from '@/app/_components/PageTitle';
import './styles.css';

export default function Page() {
  const { scaleIncrement, translateIncrement } = useControls({
    scaleIncrement: {
      value: defaultProps.scaleIncrement,
      step: 0.01,
    },
    translateIncrement: {
      value: defaultProps.translateIncrement,
      step: 1,
    },
  });

  return (
    <>
      <PageTitle title="Stacked Component" />
      <StackedComponent
        scaleIncrement={scaleIncrement}
        translateIncrement={translateIncrement}
      />
    </>
  );
}

interface StackedComponentProps {
  scaleIncrement: number;
  translateIncrement: string;
}

const defaultProps: StackedComponentProps = {
  scaleIncrement: 0.05,
  translateIncrement: '-13%',
};

const LENGTH = 3;

export function StackedComponent({
  scaleIncrement = defaultProps.scaleIncrement,
  translateIncrement = defaultProps.translateIncrement,
}: StackedComponentProps) {
  return (
    <div className="wrapper">
      {Array.from({ length: LENGTH }).map((_, i) => (
        <div
          className="card"
          // biome-ignore lint/suspicious/noArrayIndexKey: not important in this case
          key={i}
          style={
            {
              '--index': LENGTH - 1 - i,
              '--scale-increment': `${scaleIncrement}`,
              '--translate-increment': `${translateIncrement}`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
