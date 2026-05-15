import { STATUS_COLORS, type StatusValue } from '../../types';

interface AvatarSpriteProps {
  avatarId: number;
  status: StatusValue;
}

// Platzhalter — später Sprite-Sheet aus /public/assets verwenden.
export function AvatarSprite({ avatarId, status }: AvatarSpriteProps) {
  return (
    <div className="relative">
      <div
        className="pixelated flex h-8 w-8 items-center justify-center rounded-sm border border-black/40 text-xs font-bold text-black"
        style={{ backgroundColor: avatarId ? `hsl(${avatarId * 47}, 60%, 70%)` : '#444' }}
      >
        {avatarId || '·'}
      </div>
      <span
        className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full border border-black/50"
        style={{ backgroundColor: STATUS_COLORS[status] }}
      />
    </div>
  );
}
