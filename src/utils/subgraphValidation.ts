/**
 * Subgraph Form Validation Utilities
 * 
 * Requirements:
 * - REQ-FR-003: Name field validation (1-255 characters)
 * - REQ-FR-004: Name uniqueness validation (async)
 * - REQ-FR-002-A: Tag input validation (format, length, quantity)
 * - REQ-NFR-015: Form validation error handling
 */

import type { Rule } from 'antd/es/form';
import SubgraphService from '@/services/subgraph';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  message: string;
}

/**
 * Name validation rules for Ant Design Form
 * 
 * Requirements:
 * - REQ-FR-003: Real-time validation (1-255 characters)
 * - REQ-FR-004: Async uniqueness check
 * 
 * @param excludeId - Optional subgraph ID to exclude from uniqueness check (for edit mode)
 * @returns Array of Ant Design validation rules
 */
export function getNameRules(excludeId?: number): Rule[] {
  return [
    {
      required: true,
      message: 'Please enter subgraph name',
    },
    {
      min: 1,
      max: 255,
      message: 'Name must be 1-255 characters',
    },
    {
      validator: async (_: unknown, value: string) => {
        if (!value || value.trim().length === 0) {
          return Promise.resolve();
        }

        const isUnique = await SubgraphService.checkNameUnique(value, excludeId);
        if (!isUnique) {
          return Promise.reject(new Error('Subgraph name already exists'));
        }

        return Promise.resolve();
      },
    },
  ];
}

/**
 * Description validation rules for Ant Design Form
 * 
 * Requirements:
 * - REQ-FR-002-B: Max 1000 characters
 * 
 * @returns Array of Ant Design validation rules
 */
export function getDescriptionRules(): Rule[] {
  return [
    {
      max: 1000,
      message: 'Description must not exceed 1000 characters',
    },
  ];
}

/**
 * Tag validation rules for Ant Design Form
 * 
 * Requirements:
 * - REQ-FR-002-A: Tag format validation
 *   - Each tag: 1-50 characters
 *   - Only alphanumeric, hyphens, underscores
 *   - Max 10 tags
 * 
 * @returns Array of Ant Design validation rules
 */
export function getTagRules(): Rule[] {
  return [
    {
      validator: (_: unknown, value: string[]) => {
        if (!value || value.length === 0) {
          return Promise.resolve();
        }

        // Check max number of tags
        if (value.length > 10) {
          return Promise.reject(new Error('Maximum 10 tags allowed'));
        }

        // Validate each tag
        const invalidTags = value.filter((tag) => {
          // Check length
          if (tag.length < 1 || tag.length > 50) {
            return true;
          }

          // Check format (alphanumeric, hyphens, underscores only)
          if (!/^[a-zA-Z0-9_-]+$/.test(tag)) {
            return true;
          }

          return false;
        });

        if (invalidTags.length > 0) {
          return Promise.reject(
            new Error(
              'Tag must be 1-50 characters and contain only letters, numbers, hyphens, and underscores'
            )
          );
        }

        return Promise.resolve();
      },
    },
  ];
}

/**
 * Validate a single tag (for real-time validation during input)
 * 
 * Requirements:
 * - REQ-FR-002-A: Tag format validation
 * 
 * @param tag - Tag string to validate
 * @returns Validation result with valid flag and error message
 */
export function validateTag(tag: string): ValidationResult {
  if (!tag || tag.trim().length === 0) {
    return { valid: false, message: 'Tag cannot be empty' };
  }

  const trimmedTag = tag.trim();

  // Check length
  if (trimmedTag.length < 1 || trimmedTag.length > 50) {
    return { valid: false, message: 'Tag must be 1-50 characters' };
  }

  // Check format
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedTag)) {
    return {
      valid: false,
      message: 'Tag must contain only letters, numbers, hyphens, and underscores',
    };
  }

  return { valid: true, message: '' };
}

/**
 * Validate tag array (for checking max count and duplicates)
 * 
 * Requirements:
 * - REQ-FR-002-A: Max 10 tags, no duplicates
 * 
 * @param tags - Array of tags to validate
 * @param newTag - Optional new tag to add (for checking before adding)
 * @returns Validation result with valid flag and error message
 */
export function validateTagArray(tags: string[], newTag?: string): ValidationResult {
  // Check max count
  const totalCount = newTag ? tags.length + 1 : tags.length;
  if (totalCount > 10) {
    return { valid: false, message: 'Maximum 10 tags allowed' };
  }

  // Check for duplicates if adding new tag
  if (newTag && tags.includes(newTag)) {
    return { valid: false, message: 'Tag already exists' };
  }

  return { valid: true, message: '' };
}

/**
 * Validate subgraph name (for standalone validation)
 * 
 * Requirements:
 * - REQ-FR-003: Name length validation
 * 
 * @param name - Subgraph name to validate
 * @returns Validation result with valid flag and error message
 */
export function validateSubgraphName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 1 || trimmedName.length > 255) {
    return { valid: false, message: 'Name must be 1-255 characters' };
  }

  return { valid: true, message: '' };
}

/**
 * Validate subgraph description (for standalone validation)
 * 
 * Requirements:
 * - REQ-FR-002-B: Description length validation
 * 
 * @param description - Subgraph description to validate
 * @returns Validation result with valid flag and error message
 */
export function validateSubgraphDescription(description: string): ValidationResult {
  if (!description) {
    return { valid: true, message: '' }; // Description is optional
  }

  if (description.length > 1000) {
    return { valid: false, message: 'Description must not exceed 1000 characters' };
  }

  return { valid: true, message: '' };
}
