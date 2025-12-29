# Unified Feed Implementation Plan

## Objective
Develop a unified, chronological feed for the Viillaage application that aggregates content from various sources (User posts, Alerts, Pro posts, Association posts, Events, Marketplace listings).

## Tasks

### 1. Backend & Data Aggregation
- [x] Create `FeedService` to aggregate data from different Prisma models.
    - Fetch logic for: `FeedPost`, `Alert`, `ProPost`, `AssociationPost`, `Listing`, `Event`.
    - Normalization logic to convert different types into a common `FeedItem` interface.
    - Sorting by date (descending).
    - Pagination support (MVP interleaving).
- [x] Create API Route `GET /api/feed` to serve the aggregated feed.
- [x] Create API Route `POST /api/feed` for creating new user posts.

### 2. Frontend Components
- [x] Design and implement `FeedCard` component.
    - Handle different content types.
    - Display author info.
    - Action buttons (Like, Comment, Share).
- [x] Create `FeedList` component with infinite scroll.
- [x] Create `CreatePost` component.

### 3. Page Integration
- [x] Implement `src/app/(app)/feed/page.tsx`.
- [x] (Optional) Integrate feed into the Dashboard if requested later.

### 4. Interactions
- [x] Implement Like functionality for unified items.
- [x] Implement Comment functionality.

## Technical Details
- **Schema**: Already updated with `FeedPost`, `FeedPostLike`, `FeedComment`.
- **Existing Models**: `Alert`, `Listing`, `Event`, `ProPost`, `AssociationPost`.
