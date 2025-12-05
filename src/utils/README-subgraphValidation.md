# Subgraph Validation Utilities

Reusable validation functions for subgraph form fields.

## Overview

This module provides validation utilities for subgraph management forms, including:
- Ant Design Form validation rules
- Standalone validation functions for real-time checks
- Comprehensive error messages

## Requirements

- REQ-FR-003: Name field validation (1-255 characters)
- REQ-FR-004: Name uniqueness validation (async)
- REQ-FR-002-A: Tag input validation (format, length, quantity)

## Usage

### Ant Design Form Integration

```typescript
import { Form, Input } from 'antd';
import { getNameRules, getDescriptionRules, getTagRules } from '@/utils/subgraphValidation';

<Form form={form}>
  {/* Name field with async uniqueness check */}
  <Form.Item
    name="name"
    label="Name"
    rules={getNameRules()}
    validateDebounce={500}
  >
    <Input placeholder="Enter subgraph name" />
  </Form.Item>

  {/* Description field */}
  <Form.Item
    name="description"
    label="Description"
    rules={getDescriptionRules()}
  >
    <Input.TextArea rows={4} />
  </Form.Item>

  {/* Tags field (hidden, managed by custom component) */}
  <Form.Item name="tags" rules={getTagRules()} hidden>
    <Input />
  </Form.Item>
</Form>
```

### Edit Mode (Exclude Current Subgraph from Uniqueness Check)

```typescript
// When editing, pass the current subgraph ID to exclude it from uniqueness check
const rules = getNameRules(currentSubgraphId);

<Form.Item name="name" rules={rules}>
  <Input />
</Form.Item>
```

### Real-time Tag Validation

```typescript
import { validateTag, validateTagArray } from '@/utils/subgraphValidation';

const handleAddTag = () => {
  const trimmedTag = tagInput.trim();
  
  // Validate individual tag
  const tagResult = validateTag(trimmedTag);
  if (!tagResult.valid) {
    message.error(tagResult.message);
    return;
  }

  // Validate tag array
  const arrayResult = validateTagArray(tags, trimmedTag);
  if (!arrayResult.valid) {
    message.error(arrayResult.message);
    return;
  }

  // Add tag
  setTags([...tags, trimmedTag]);
};
```

### Standalone Validation

```typescript
import { validateSubgraphName, validateSubgraphDescription } from '@/utils/subgraphValidation';

// Validate name
const nameResult = validateSubgraphName(nameInput);
if (!nameResult.valid) {
  console.error(nameResult.message);
}

// Validate description
const descResult = validateSubgraphDescription(descInput);
if (!descResult.valid) {
  console.error(descResult.message);
}
```

## API Reference

### getNameRules(excludeId?: number): Rule[]

Returns Ant Design Form validation rules for subgraph name field.

**Parameters:**
- `excludeId` (optional): Subgraph ID to exclude from uniqueness check (for edit mode)

**Validation:**
- Required field
- Length: 1-255 characters
- Async uniqueness check via API

**Example:**
```typescript
const rules = getNameRules(); // For create mode
const editRules = getNameRules(123); // For edit mode
```

---

### getDescriptionRules(): Rule[]

Returns Ant Design Form validation rules for description field.

**Validation:**
- Optional field
- Max length: 1000 characters

---

### getTagRules(): Rule[]

Returns Ant Design Form validation rules for tags array field.

**Validation:**
- Optional field
- Max 10 tags
- Each tag: 1-50 characters
- Allowed characters: a-z, A-Z, 0-9, hyphen (-), underscore (_)

---

### validateTag(tag: string): ValidationResult

Validates a single tag string (for real-time validation during input).

**Parameters:**
- `tag`: Tag string to validate

**Returns:**
```typescript
{
  valid: boolean;
  message: string; // Error message if invalid, empty if valid
}
```

**Example:**
```typescript
const result = validateTag('my-tag');
if (!result.valid) {
  message.error(result.message);
}
```

---

### validateTagArray(tags: string[], newTag?: string): ValidationResult

Validates tag array for max count and duplicates.

**Parameters:**
- `tags`: Current array of tags
- `newTag` (optional): New tag to add (for pre-add validation)

**Returns:**
```typescript
{
  valid: boolean;
  message: string;
}
```

**Example:**
```typescript
// Check if we can add a new tag
const result = validateTagArray(currentTags, 'new-tag');
if (result.valid) {
  setTags([...currentTags, 'new-tag']);
}
```

---

### validateSubgraphName(name: string): ValidationResult

Validates subgraph name (standalone, without async uniqueness check).

**Parameters:**
- `name`: Subgraph name to validate

**Returns:**
```typescript
{
  valid: boolean;
  message: string;
}
```

---

### validateSubgraphDescription(description: string): ValidationResult

Validates subgraph description.

**Parameters:**
- `description`: Description text to validate

**Returns:**
```typescript
{
  valid: boolean;
  message: string;
}
```

## Validation Rules Summary

| Field | Required | Min Length | Max Length | Format | Async Check |
|-------|----------|------------|------------|--------|-------------|
| Name | Yes | 1 | 255 | Any | Uniqueness |
| Description | No | - | 1000 | Any | No |
| Tags (array) | No | - | 10 items | - | No |
| Tag (individual) | - | 1 | 50 | `[a-zA-Z0-9_-]+` | No |

## Error Messages

| Validation | Error Message |
|------------|---------------|
| Name required | "Please enter subgraph name" |
| Name length | "Name must be 1-255 characters" |
| Name duplicate | "Subgraph name already exists" |
| Description length | "Description must not exceed 1000 characters" |
| Tag empty | "Tag cannot be empty" |
| Tag length | "Tag must be 1-50 characters" |
| Tag format | "Tag must contain only letters, numbers, hyphens, and underscores" |
| Tag count | "Maximum 10 tags allowed" |
| Tag duplicate | "Tag already exists" |

## Testing

Run tests with:
```bash
npm test -- subgraphValidation.test.ts --run
```

Test coverage: 50 tests, 100% passing

## Related Files

- Implementation: `src/utils/subgraphValidation.ts`
- Tests: `src/utils/subgraphValidation.test.ts`
- Usage: `src/components/SubgraphManagement/CreateSubgraphModal.tsx`
- Service: `src/services/subgraph.ts` (for async uniqueness check)
