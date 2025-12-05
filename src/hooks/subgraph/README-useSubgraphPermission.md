# useSubgraphPermission Hook

## Overview

The `useSubgraphPermission` hook provides a convenient way to check user permissions for subgraph operations. It determines whether the current user can perform various actions based on their role (Owner or Viewer) in the subgraph.

## Features

- ✅ Check if user is Owner or Viewer
- ✅ Determine edit, delete, add node, and remove node permissions
- ✅ Performance optimized with `useMemo`
- ✅ Handles edge cases (null user, null subgraph, empty arrays)
- ✅ Fully typed with TypeScript
- ✅ Comprehensive unit tests (23 test cases)

## Requirements Implemented

- **REQ-FR-034**: Owner can edit subgraph
- **REQ-FR-035**: Non-owner cannot edit subgraph
- **REQ-FR-047**: Owner can delete subgraph
- **REQ-FR-048**: Non-owner cannot delete subgraph
- **REQ-FR-057**: Owner can add nodes
- **REQ-FR-058**: Non-owner cannot add nodes
- **REQ-NFR-028**: Performance optimization with memoization

## Usage

### Basic Usage

```tsx
import { useSubgraphDetail, useSubgraphPermission } from '@/hooks/subgraph';

function SubgraphDetailPage() {
  const { subgraphId } = useParams();
  const { subgraph, loading } = useSubgraphDetail(Number(subgraphId));
  const { canEdit, canDelete, canAddNode, canRemoveNode } = useSubgraphPermission(subgraph);

  if (loading) return <Spin />;

  return (
    <div>
      <h1>{subgraph?.name}</h1>
      
      {/* Show Edit button only if user can edit */}
      {canEdit && (
        <Button onClick={handleEdit}>Edit</Button>
      )}
      
      {/* Show Delete button only if user can delete */}
      {canDelete && (
        <Button danger onClick={handleDelete}>Delete</Button>
      )}
      
      {/* Show Add Node button only if user can add nodes */}
      {canAddNode && (
        <Button onClick={handleAddNode}>Add Node</Button>
      )}
    </div>
  );
}
```

### Checking Role

```tsx
function SubgraphHeader() {
  const { subgraph } = useSubgraphDetail(subgraphId);
  const { isOwner, isViewer } = useSubgraphPermission(subgraph);

  return (
    <div>
      <h1>{subgraph?.name}</h1>
      {isOwner && <Tag color="blue">Owner</Tag>}
      {isViewer && <Tag color="green">Viewer</Tag>}
    </div>
  );
}
```

### Conditional Rendering in Tables

```tsx
function ResourceNodesTable() {
  const { subgraph } = useSubgraphDetail(subgraphId);
  const { canRemoveNode } = useSubgraphPermission(subgraph);

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Type', dataIndex: 'type' },
    {
      title: 'Actions',
      render: (_, record) => (
        <>
          {canRemoveNode && (
            <Button danger onClick={() => handleRemove(record.id)}>
              Remove
            </Button>
          )}
        </>
      ),
    },
  ];

  return <Table columns={columns} dataSource={resources} />;
}
```

### Managing Permissions Tab

```tsx
function PermissionsTab() {
  const { subgraph } = useSubgraphDetail(subgraphId);
  const { canManagePermissions } = useSubgraphPermission(subgraph);

  return (
    <div>
      <h2>Owners</h2>
      <List dataSource={subgraph?.owners} />
      
      {canManagePermissions && (
        <Button onClick={handleAddOwner}>Add Owner</Button>
      )}
    </div>
  );
}
```

## API Reference

### Return Values

```typescript
interface SubgraphPermissionResult {
  isOwner: boolean;              // Whether user is an owner
  isViewer: boolean;             // Whether user is a viewer
  canEdit: boolean;              // Can edit subgraph metadata
  canDelete: boolean;            // Can delete subgraph
  canAddNode: boolean;           // Can add resource nodes
  canRemoveNode: boolean;        // Can remove resource nodes
  canView: boolean;              // Can view subgraph (owner or viewer)
  canManagePermissions: boolean; // Can manage owners/viewers
}
```

### Permission Matrix

| Role | canEdit | canDelete | canAddNode | canRemoveNode | canView | canManagePermissions |
|------|---------|-----------|------------|---------------|---------|---------------------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Viewer | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Non-member | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Edge Cases Handled

1. **Null subgraph**: Returns all permissions as `false`
2. **Null user**: Returns all permissions as `false`
3. **Empty owners/viewers**: Returns all permissions as `false`
4. **User is both owner and viewer**: Owner permissions take precedence
5. **Multiple owners**: Correctly identifies user as owner if in the list

## Performance

The hook uses `useMemo` for all computed values to avoid unnecessary recalculations. Values are only recomputed when:
- The current user changes
- The subgraph data changes

This ensures optimal performance even with frequent re-renders.

## Testing

The hook has comprehensive unit tests covering:
- Owner permissions (3 tests)
- Viewer permissions (4 tests)
- Non-member permissions (2 tests)
- Edge cases (4 tests)
- Performance optimization (3 tests)
- Requirement validation (7 tests)

**Total: 23 test cases, all passing ✅**

## Related Hooks

- `useSubgraphDetail`: Fetch subgraph detail data
- `useSubgraphList`: Manage subgraph list
- `useAuth`: Get current user information

## Notes

- Always pass the subgraph from `useSubgraphDetail` to ensure data consistency
- The hook handles loading states gracefully (returns `false` for all permissions when subgraph is `null`)
- Permission checks are purely client-side; backend should also validate permissions
