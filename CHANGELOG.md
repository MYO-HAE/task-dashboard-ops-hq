# Task Dashboard - Ops HQ

## What I Built
A real-time Task Dashboard that visualizes David's Notion Tasks DB from Ops HQ. Built with React + TypeScript + Vite + Tailwind CSS + Framer Motion.

## Why It Helps
- **Problem:** From outcomes.jsonl, there were 6 overdue P1 tasks repeatedly surfacing with no easy way to visualize them
- **Solution:** A beautiful, animated dashboard that shows:
  - Overdue tasks with prominent red alerts and "days overdue" badges
  - P0/P1 priority tasks prioritized
  - Stats cards (Total, Overdue, P0/P1/P2/Done counts)
  - Project grouping and status badges

## Live URL
https://myo-hae.github.io/task-dashboard-ops-hq/

## GitHub Repo
https://github.com/MYO-HAE/task-dashboard-ops-hq

## How to Test
1. Visit the live URL above
2. You should see:
   - 6 stat cards at top (Total: 31, Overdue: 6, etc.)
   - Overdue Tasks section with red glowing cards
   - P0/P1 Priorities section
   - Other Tasks section
3. All data is from Notion Tasks DB (as of build time)

## Next Optimization
1. **Real-time sync:** Add Notion API integration to refresh data automatically
2. **Interactive filters:** Add ability to filter by project, status, priority
3. **Task actions:** Add buttons to mark tasks done/change status directly from dashboard
4. **Dark/light mode:** Add theme toggle

## Build Details
- Built: Saturday, February 21, 2026 at 01:00 KST
- Build tool: Vite
- Deploy target: GitHub Pages (docs folder)
- Data source: Notion Ops HQ Tasks DB (2fced264-4bae-817c-9b81-f39008167d85)

## Deployment Notes
- Cloudflare Pages deployment failed due to invalid API token permissions
- Fallback to GitHub Pages successful
- Deployed via /docs folder on main branch