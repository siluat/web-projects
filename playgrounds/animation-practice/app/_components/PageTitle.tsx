import { Badge } from '@siluat/shadcn-ui/components/badge';

interface Props {
  title: string;
}

export function PageTitle({ title }: Props) {
  return (
    <Badge variant="outline" className="absolute top-2 text-sm font-light">
      {title}
    </Badge>
  );
}
