import { Button } from '@siluat/shadcn-ui/components/button';

export default function Page() {
  return <ButtonWithAnimation />;
}

function ButtonWithAnimation() {
  return (
    /**
     * in Plain CSS, it would be like this:
     * .button {
     *   transition: transform 150ms ease;
     * }
     * .button:active {
     *   transform: scale(0.97);
     * }
     */
    <Button className="cursor-pointer transition-transform active:scale-[0.97]">
      Complete
    </Button>
  );
}
