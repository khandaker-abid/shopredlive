import { Box, Chip, Tooltip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import BoltIcon from '@mui/icons-material/Bolt';
import ShieldIcon from '@mui/icons-material/Shield';
import { buildReputationBadges } from '../lib/reputation';

const ICONS = {
  verified: VerifiedIcon,
  'top-rated': StarIcon,
  'fast-responder': BoltIcon,
  trusted: ShieldIcon
};

export default function ReputationBadges({
  user,
  avgRating = 0,
  reviewCount = 0,
  size = 'small',
  includeVerified = true
}) {
  let badges = buildReputationBadges({ user: user || {}, avgRating, reviewCount });
  if (!includeVerified) {
    badges = badges.filter((badge) => badge.id !== 'verified');
  }

  if (!badges.length) return null;

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {badges.map((badge) => {
        const Icon = ICONS[badge.id];
        const chip = (
          <Chip
            icon={Icon ? <Icon /> : undefined}
            label={badge.label}
            size={size}
            color={badge.tone || 'default'}
            variant="outlined"
          />
        );

        if (!badge.description) return <span key={badge.id}>{chip}</span>;

        return (
          <Tooltip key={badge.id} title={badge.description} arrow>
            <span>{chip}</span>
          </Tooltip>
        );
      })}
    </Box>
  );
}
