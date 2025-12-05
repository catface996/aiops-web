# EmptyState Component

A reusable component for displaying empty states in lists and search results.

## Features

- Two built-in scenarios: empty list and no search results
- Customizable title, description, and action button
- Consistent styling and layout
- Accessibility support
- TypeScript type safety

## Usage

### Empty List Scenario

Display when there's no data in the list:

```tsx
import { EmptyState } from '@/components';

<EmptyState
  type="empty"
  title="No subgraphs found"
  description="Get started by creating your first subgraph"
  actionText="Create Subgraph"
  onAction={handleCreate}
/>
```

### No Search Results Scenario

Display when search/filter returns no results:

```tsx
import { EmptyState } from '@/components';

<EmptyState
  type="no-results"
  title="No subgraphs match your search"
  description="Try adjusting your search criteria"
  actionText="Clear Search"
  onAction={handleClearSearch}
/>
```

### Without Action Button

You can hide the action button by setting `showAction={false}` or not providing `onAction`:

```tsx
<EmptyState
  type="empty"
  title="No data available"
  description="Data will appear here when available"
  showAction={false}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `type` | `'empty' \| 'no-results'` | Yes | - | The type of empty state to display |
| `title` | `string` | No | Type-specific default | Custom title text |
| `description` | `string` | No | Type-specific default | Custom description text |
| `actionText` | `string` | No | Type-specific default | Custom action button text |
| `onAction` | `() => void` | No | - | Callback when action button is clicked |
| `showAction` | `boolean` | No | `true` | Whether to show the action button |

## Default Configurations

### Empty Type
- Icon: Plus icon
- Title: "No data"
- Description: "Get started by creating a new item"
- Action Text: "Create"
- Button Type: Primary

### No-Results Type
- Icon: Search icon
- Title: "No results found"
- Description: "Try adjusting your search or filters"
- Action Text: "Clear Search"
- Button Type: Default

## Requirements

This component satisfies the following requirements:
- **REQ-FR-019**: Empty state display when list has no data
- **REQ-FR-020**: Empty state display when search returns no results
- **REQ-NFR-024**: Friendly empty states with clear explanatory text

## Examples in Codebase

See `src/pages/SubgraphManagement/SubgraphList/SubgraphTable.tsx` for a real-world usage example.
