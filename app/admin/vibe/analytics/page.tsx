"use client";

import StoryRewardsAnalytics from "../StoryRewardsAnalytics";

export default function StoryRewardsAnalyticsPage() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Story reward analytics</h1>
      <p className="mt-1 text-sm text-gray-400">
        Conversion funnel for Interactive Stories, Pippinway Rewards, and Marketplace ads.
      </p>
      <StoryRewardsAnalytics />
    </div>
  );
}
