export function buildReputationBadges({ user = {}, avgRating = 0, reviewCount = 0 }) {
  const badges = [];

  if (user.isVerifiedStudent) {
    badges.push({
      id: 'verified',
      label: 'SBU Verified',
      tone: 'success',
      description: 'Verified Stony Brook student'
    });
  }

  if (typeof avgRating === 'number' && reviewCount >= 3 && avgRating >= 4.6) {
    badges.push({
      id: 'top-rated',
      label: 'Top Rated',
      tone: 'primary',
      description: 'Consistently strong reviews'
    });
  }

  if (typeof user.responseTimeAvgMinutes === 'number' && user.responseTimeAvgMinutes <= 60) {
    badges.push({
      id: 'fast-responder',
      label: 'Fast Responder',
      tone: 'info',
      description: 'Typically replies within an hour'
    });
  }

  if (typeof user.karma === 'number' && user.karma >= 150) {
    badges.push({
      id: 'trusted',
      label: 'Trusted',
      tone: 'secondary',
      description: 'High community trust score'
    });
  }

  return badges;
}
