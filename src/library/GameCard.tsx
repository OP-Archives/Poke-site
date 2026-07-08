import { Link } from 'react-router-dom';
import sadge from '../assets/sadge.jpg';
import CustomWidthTooltip from '../utils/CustomToolTip';
import { getImage } from '../utils/helpers';

interface GameCardProps {
  game_id: string;
  name: string;
  image?: string;
  count: number;
}

export default function GameCard({ game_id, name, image, count }: GameCardProps) {
  return (
    <Link
      to={`/vods?game_id=${game_id}`}
      className="rounded cursor-pointer no-underline block hover:shadow-[0_0_8px_rgba(255,255,255,.6)] transition-shadow min-w-0"
    >
      <div className="w-full relative overflow-hidden rounded-t aspect-[400/530] bg-dark-light">
        {image ? (
          <img
            src={getImage(image, 400, 530)}
            alt=""
            width={400}
            height={530}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <img
            alt=""
            src={sadge}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div className="px-1 py-0.5 text-center min-w-0 w-full">
        <CustomWidthTooltip title={name}>
          <span className="text-primary font-medium block text-xs truncate">{name}</span>
        </CustomWidthTooltip>
        <span className="text-primary text-xs">{count} EPs</span>
      </div>
    </Link>
  );
}
