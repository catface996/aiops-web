/**
 * Unit Tests for Subgraph Validation Utilities
 * 
 * Requirements:
 * - REQ-FR-003: Name field validation
 * - REQ-FR-004: Name uniqueness validation
 * - REQ-FR-002-A: Tag input validation
 * - REQ-NFR-015: Form validation error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getNameRules,
  getDescriptionRules,
  getTagRules,
  validateTag,
  validateTagArray,
  validateSubgraphName,
  validateSubgraphDescription,
} from './subgraphValidation';
import SubgraphService from '@/services/subgraph';

// Mock SubgraphService
vi.mock('@/services/subgraph', () => ({
  default: {
    checkNameUnique: vi.fn(),
  },
}));

describe('subgraphValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNameRules', () => {
    it('should return validation rules array', () => {
      const rules = getNameRules();
      expect(rules).toBeInstanceOf(Array);
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should require name field', () => {
      const rules = getNameRules();
      const requiredRule = rules.find((rule) => 
        typeof rule === 'object' && 'required' in rule
      );
      expect(requiredRule).toBeDefined();
      expect((requiredRule as { required: boolean }).required).toBe(true);
    });

    it('should validate name length (1-255 characters)', () => {
      const rules = getNameRules();
      const lengthRule = rules.find((rule) => 
        typeof rule === 'object' && 'min' in rule && 'max' in rule
      );
      expect(lengthRule).toBeDefined();
      expect((lengthRule as { min: number; max: number }).min).toBe(1);
      expect((lengthRule as { min: number; max: number }).max).toBe(255);
    });

    it('should include async uniqueness validator', async () => {
      const rules = getNameRules();
      const asyncRule = rules.find((rule) => 
        typeof rule === 'object' && 'validator' in rule
      );
      expect(asyncRule).toBeDefined();
      expect(typeof (asyncRule as { validator: unknown }).validator).toBe('function');
    });

    it('should pass validation for unique name', async () => {
      vi.mocked(SubgraphService.checkNameUnique).mockResolvedValue(true);

      const rules = getNameRules();
      const asyncRule = rules.find((rule) => 
        typeof rule === 'object' && 'validator' in rule
      ) as { validator: (rule: unknown, value: string) => Promise<void> };

      await expect(asyncRule.validator({}, 'unique-name')).resolves.toBeUndefined();
      expect(SubgraphService.checkNameUnique).toHaveBeenCalledWith('unique-name', undefined);
    });

    it('should fail validation for duplicate name', async () => {
      vi.mocked(SubgraphService.checkNameUnique).mockResolvedValue(false);

      const rules = getNameRules();
      const asyncRule = rules.find((rule) => 
        typeof rule === 'object' && 'validator' in rule
      ) as { validator: (rule: unknown, value: string) => Promise<void> };

      await expect(asyncRule.validator({}, 'duplicate-name')).rejects.toThrow(
        'Subgraph name already exists'
      );
    });

    it('should skip uniqueness check for empty value', async () => {
      const rules = getNameRules();
      const asyncRule = rules.find((rule) => 
        typeof rule === 'object' && 'validator' in rule
      ) as { validator: (rule: unknown, value: string) => Promise<void> };

      await expect(asyncRule.validator({}, '')).resolves.toBeUndefined();
      expect(SubgraphService.checkNameUnique).not.toHaveBeenCalled();
    });

    it('should pass excludeId to uniqueness check', async () => {
      vi.mocked(SubgraphService.checkNameUnique).mockResolvedValue(true);

      const rules = getNameRules(123);
      const asyncRule = rules.find((rule) => 
        typeof rule === 'object' && 'validator' in rule
      ) as { validator: (rule: unknown, value: string) => Promise<void> };

      await asyncRule.validator({}, 'test-name');
      expect(SubgraphService.checkNameUnique).toHaveBeenCalledWith('test-name', 123);
    });
  });

  describe('getDescriptionRules', () => {
    it('should return validation rules array', () => {
      const rules = getDescriptionRules();
      expect(rules).toBeInstanceOf(Array);
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should validate max length (1000 characters)', () => {
      const rules = getDescriptionRules();
      const maxRule = rules.find((rule) => 
        typeof rule === 'object' && 'max' in rule
      );
      expect(maxRule).toBeDefined();
      expect((maxRule as { max: number }).max).toBe(1000);
    });
  });

  describe('getTagRules', () => {
    it('should return validation rules array', () => {
      const rules = getTagRules();
      expect(rules).toBeInstanceOf(Array);
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should pass validation for empty tag array', async () => {
      const rules = getTagRules();
      const validatorRule = rules[0] as { validator: (rule: unknown, value: string[]) => Promise<void> };

      await expect(validatorRule.validator({}, [])).resolves.toBeUndefined();
    });

    it('should pass validation for valid tags', async () => {
      const rules = getTagRules();
      const validatorRule = rules[0] as { validator: (rule: unknown, value: string[]) => Promise<void> };

      const validTags = ['tag1', 'tag-2', 'tag_3', 'TAG123'];
      await expect(validatorRule.validator({}, validTags)).resolves.toBeUndefined();
    });

    it('should fail validation for more than 10 tags', async () => {
      const rules = getTagRules();
      const validatorRule = rules[0] as { validator: (rule: unknown, value: string[]) => Promise<void> };

      const tooManyTags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
      await expect(validatorRule.validator({}, tooManyTags)).rejects.toThrow(
        'Maximum 10 tags allowed'
      );
    });

    it('should fail validation for tag too short', async () => {
      const rules = getTagRules();
      const validatorRule = rules[0] as { validator: (rule: unknown, value: string[]) => Promise<void> };

      await expect(validatorRule.validator({}, [''])).rejects.toThrow(
        'Tag must be 1-50 characters'
      );
    });

    it('should fail validation for tag too long', async () => {
      const rules = getTagRules();
      const validatorRule = rules[0] as { validator: (rule: unknown, value: string[]) => Promise<void> };

      const longTag = 'a'.repeat(51);
      await expect(validatorRule.validator({}, [longTag])).rejects.toThrow(
        'Tag must be 1-50 characters'
      );
    });

    it('should fail validation for invalid tag characters', async () => {
      const rules = getTagRules();
      const validatorRule = rules[0] as { validator: (rule: unknown, value: string[]) => Promise<void> };

      const invalidTags = ['tag with spaces', 'tag@special', 'tag.dot'];
      await expect(validatorRule.validator({}, invalidTags)).rejects.toThrow(
        'Tag must be 1-50 characters and contain only letters, numbers, hyphens, and underscores'
      );
    });
  });

  describe('validateTag', () => {
    it('should return valid for correct tag', () => {
      const result = validateTag('valid-tag');
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should return invalid for empty tag', () => {
      const result = validateTag('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Tag cannot be empty');
    });

    it('should return invalid for tag with only whitespace', () => {
      const result = validateTag('   ');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Tag cannot be empty');
    });

    it('should return invalid for tag too short (after trim)', () => {
      const result = validateTag('');
      expect(result.valid).toBe(false);
    });

    it('should return invalid for tag too long', () => {
      const longTag = 'a'.repeat(51);
      const result = validateTag(longTag);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Tag must be 1-50 characters');
    });

    it('should return invalid for tag with spaces', () => {
      const result = validateTag('tag with spaces');
      expect(result.valid).toBe(false);
      expect(result.message).toBe(
        'Tag must contain only letters, numbers, hyphens, and underscores'
      );
    });

    it('should return invalid for tag with special characters', () => {
      const result = validateTag('tag@special');
      expect(result.valid).toBe(false);
      expect(result.message).toBe(
        'Tag must contain only letters, numbers, hyphens, and underscores'
      );
    });

    it('should return valid for tag with hyphens', () => {
      const result = validateTag('tag-with-hyphens');
      expect(result.valid).toBe(true);
    });

    it('should return valid for tag with underscores', () => {
      const result = validateTag('tag_with_underscores');
      expect(result.valid).toBe(true);
    });

    it('should return valid for tag with numbers', () => {
      const result = validateTag('tag123');
      expect(result.valid).toBe(true);
    });

    it('should return valid for tag with mixed case', () => {
      const result = validateTag('TagWithMixedCase');
      expect(result.valid).toBe(true);
    });

    it('should trim whitespace before validation', () => {
      const result = validateTag('  valid-tag  ');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateTagArray', () => {
    it('should return valid for empty array', () => {
      const result = validateTagArray([]);
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should return valid for array with less than 10 tags', () => {
      const tags = ['tag1', 'tag2', 'tag3'];
      const result = validateTagArray(tags);
      expect(result.valid).toBe(true);
    });

    it('should return valid for array with exactly 10 tags', () => {
      const tags = Array.from({ length: 10 }, (_, i) => `tag${i}`);
      const result = validateTagArray(tags);
      expect(result.valid).toBe(true);
    });

    it('should return invalid for array with more than 10 tags', () => {
      const tags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
      const result = validateTagArray(tags);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Maximum 10 tags allowed');
    });

    it('should return invalid when adding tag would exceed 10', () => {
      const tags = Array.from({ length: 10 }, (_, i) => `tag${i}`);
      const result = validateTagArray(tags, 'new-tag');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Maximum 10 tags allowed');
    });

    it('should return invalid for duplicate tag', () => {
      const tags = ['tag1', 'tag2', 'tag3'];
      const result = validateTagArray(tags, 'tag2');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Tag already exists');
    });

    it('should return valid when adding unique tag', () => {
      const tags = ['tag1', 'tag2', 'tag3'];
      const result = validateTagArray(tags, 'tag4');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateSubgraphName', () => {
    it('should return valid for correct name', () => {
      const result = validateSubgraphName('Valid Subgraph Name');
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should return invalid for empty name', () => {
      const result = validateSubgraphName('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Name is required');
    });

    it('should return invalid for name with only whitespace', () => {
      const result = validateSubgraphName('   ');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Name is required');
    });

    it('should return invalid for name too long', () => {
      const longName = 'a'.repeat(256);
      const result = validateSubgraphName(longName);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Name must be 1-255 characters');
    });

    it('should return valid for name at max length', () => {
      const maxName = 'a'.repeat(255);
      const result = validateSubgraphName(maxName);
      expect(result.valid).toBe(true);
    });

    it('should trim whitespace before validation', () => {
      const result = validateSubgraphName('  Valid Name  ');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateSubgraphDescription', () => {
    it('should return valid for empty description', () => {
      const result = validateSubgraphDescription('');
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should return valid for correct description', () => {
      const result = validateSubgraphDescription('This is a valid description');
      expect(result.valid).toBe(true);
    });

    it('should return invalid for description too long', () => {
      const longDescription = 'a'.repeat(1001);
      const result = validateSubgraphDescription(longDescription);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Description must not exceed 1000 characters');
    });

    it('should return valid for description at max length', () => {
      const maxDescription = 'a'.repeat(1000);
      const result = validateSubgraphDescription(maxDescription);
      expect(result.valid).toBe(true);
    });

    it('should preserve line breaks and special characters', () => {
      const description = 'Line 1\nLine 2\nSpecial: @#$%';
      const result = validateSubgraphDescription(description);
      expect(result.valid).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined inputs gracefully', () => {
      expect(validateSubgraphName(null as unknown as string).valid).toBe(false);
      expect(validateSubgraphDescription(null as unknown as string).valid).toBe(true);
      expect(validateTag(null as unknown as string).valid).toBe(false);
    });

    it('should handle unicode characters in tags', () => {
      const result = validateTag('tag-中文');
      expect(result.valid).toBe(false); // Only alphanumeric, hyphens, underscores allowed
    });

    it('should handle very long tag arrays', () => {
      const tags = Array.from({ length: 100 }, (_, i) => `tag${i}`);
      const result = validateTagArray(tags);
      expect(result.valid).toBe(false);
    });
  });
});
