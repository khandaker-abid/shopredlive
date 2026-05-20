import { buildReputationBadges } from '../../src/lib/reputation';

describe('buildReputationBadges', () => {
  test('includes SBU verified badge', () => {
    const badges = buildReputationBadges({ user: { isVerifiedStudent: true } });
    expect(badges.some((badge) => badge.id === 'verified')).toBe(true);
  });

  test('includes top rated badge with high rating and enough reviews', () => {
    const badges = buildReputationBadges({
      user: {},
      avgRating: 4.8,
      reviewCount: 5
    });
    expect(badges.some((badge) => badge.id === 'top-rated')).toBe(true);
  });

  test('includes fast responder badge when response time is under an hour', () => {
    const badges = buildReputationBadges({
      user: { responseTimeAvgMinutes: 42 },
      avgRating: 0,
      reviewCount: 0
    });
    expect(badges.some((badge) => badge.id === 'fast-responder')).toBe(true);
  });

  test('includes trusted badge when karma is high', () => {
    const badges = buildReputationBadges({ user: { karma: 180 } });
    expect(badges.some((badge) => badge.id === 'trusted')).toBe(true);
  });
});
