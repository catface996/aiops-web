/**
 * CreateSubgraphModal Component Tests
 * 
 * Tests for the CreateSubgraphModal component covering:
 * - Form rendering and field validation
 * - Tag input and validation
 * - Name uniqueness validation
 * - Form submission
 * - Cancel confirmation with dirty state
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateSubgraphModal from './CreateSubgraphModal';
import SubgraphService from '@/services/subgraph';
import type { Subgraph } from '@/types/subgraph';

// Mock the SubgraphService
vi.mock('@/services/subgraph', () => ({
  default: {
    createSubgraph: vi.fn(),
    checkNameUnique: vi.fn(),
  },
}));

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
  };
});

describe('CreateSubgraphModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any existing modals
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clean up any remaining modals
    document.body.innerHTML = '';
  });

  describe('Rendering', () => {
    it('should render modal with title and form fields', () => {
      render(<CreateSubgraphModal {...defaultProps} />);

      expect(screen.getByText('Create Subgraph')).toBeInTheDocument();
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      expect(screen.getByText(/Tags/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Business Domain/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Environment/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Team/i)).toBeInTheDocument();
    });

    it('should not render when visible is false', () => {
      render(<CreateSubgraphModal {...defaultProps} visible={false} />);

      expect(screen.queryByText('Create Subgraph')).not.toBeInTheDocument();
    });

    it('should render Create and Cancel buttons', () => {
      render(<CreateSubgraphModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });
  });

  describe('Name Field Validation', () => {
    it('should show error when name is empty', async () => {
      render(<CreateSubgraphModal {...defaultProps} />);

      const createButton = screen.getByRole('button', { name: /Create/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter subgraph name')).toBeInTheDocument();
      });
    });

    it('should show error when name exceeds 255 characters', async () => {
      render(<CreateSubgraphModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Name/i);
      const longName = 'a'.repeat(256);
      
      await userEvent.type(nameInput, longName);
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText('Name must be 1-255 characters')).toBeInTheDocument();
      });
    });

    it('should validate name uniqueness', async () => {
      vi.mocked(SubgraphService.checkNameUnique).mockResolvedValue(false);

      render(<CreateSubgraphModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Name/i);
      await userEvent.type(nameInput, 'Existing Subgraph');
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText('Subgraph name already exists')).toBeInTheDocument();
      });

      expect(SubgraphService.checkNameUnique).toHaveBeenCalledWith('Existing Subgraph');
    });

    it('should pass validation when name is unique', async () => {
      vi.mocked(SubgraphService.checkNameUnique).mockResolvedValue(true);

      render(<CreateSubgraphModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Name/i);
      await userEvent.type(nameInput, 'New Subgraph');
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.queryByText('Subgraph name already exists')).not.toBeInTheDocument();
      });
    });
  });

  describe('Tag Input', () => {
    it('should add tag when Enter is pressed', async () => {
      render(<CreateSubgraphModal {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('Enter tag and press Enter');
      await userEvent.type(tagInput, 'test-tag{Enter}');

      await waitFor(() => {
        expect(screen.getByText('test-tag')).toBeInTheDocument();
      });
    });

    it('should add tag when plus icon is clicked', async () => {
      render(<CreateSubgraphModal {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('Enter tag and press Enter');
      await userEvent.type(tagInput, 'test-tag');
      
      const plusIcon = screen.getByRole('img', { hidden: true });
      fireEvent.click(plusIcon);

      await waitFor(() => {
        expect(screen.getByText('test-tag')).toBeInTheDocument();
      });
    });

    it('should remove tag when close icon is clicked', async () => {
      render(<CreateSubgraphModal {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('Enter tag and press Enter');
      await userEvent.type(tagInput, 'test-tag{Enter}');

      await waitFor(() => {
        expect(screen.getByText('test-tag')).toBeInTheDocument();
      });

      const closeIcon = screen.getByLabelText('close');
      fireEvent.click(closeIcon);

      await waitFor(() => {
        expect(screen.queryByText('test-tag')).not.toBeInTheDocument();
      });
    });

    it('should reject tag with invalid characters', async () => {
      const { message } = await import('antd');
      
      render(<CreateSubgraphModal {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('Enter tag and press Enter');
      await userEvent.type(tagInput, 'invalid tag!{Enter}');

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith(
          'Tag must contain only letters, numbers, hyphens, and underscores'
        );
      });
    });

    it('should reject tag longer than 50 characters', async () => {
      const { message } = await import('antd');
      
      render(<CreateSubgraphModal {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('Enter tag and press Enter');
      const longTag = 'a'.repeat(51);
      await userEvent.type(tagInput, `${longTag}{Enter}`);

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('Tag must be 1-50 characters');
      });
    });

    it('should reject more than 10 tags', async () => {
      const { message } = await import('antd');
      
      render(<CreateSubgraphModal {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('Enter tag and press Enter');

      // Add 10 tags
      for (let i = 0; i < 10; i++) {
        await userEvent.clear(tagInput);
        await userEvent.type(tagInput, `tag${i}{Enter}`);
      }

      // Try to add 11th tag
      await userEvent.clear(tagInput);
      await userEvent.type(tagInput, 'tag11{Enter}');

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('Maximum 10 tags allowed');
      });
    });

    it('should reject duplicate tags', async () => {
      const { message } = await import('antd');
      
      render(<CreateSubgraphModal {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('Enter tag and press Enter');
      await userEvent.type(tagInput, 'test-tag{Enter}');
      await userEvent.type(tagInput, 'test-tag{Enter}');

      await waitFor(() => {
        expect(message.warning).toHaveBeenCalledWith('Tag already exists');
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const mockSubgraph: Subgraph = {
        id: 1,
        name: 'Test Subgraph',
        description: 'Test description',
        tags: ['tag1'],
        metadata: { businessDomain: 'payment' },
        createdBy: 1,
        createdAt: '2024-12-04T10:00:00Z',
        updatedAt: '2024-12-04T10:00:00Z',
        version: 1,
      };

      vi.mocked(SubgraphService.checkNameUnique).mockResolvedValue(true);
      vi.mocked(SubgraphService.createSubgraph).mockResolvedValue(mockSubgraph);

      render(<CreateSubgraphModal {...defaultProps} />);

      // Fill in form
      const nameInput = screen.getByLabelText(/Name/i);
      await userEvent.type(nameInput, 'Test Subgraph');

      const descriptionInput = screen.getByLabelText(/Description/i);
      await userEvent.type(descriptionInput, 'Test description');

      const tagInput = screen.getByPlaceholderText('Enter tag and press Enter');
      await userEvent.type(tagInput, 'tag1{Enter}');

      // Submit form
      const createButton = screen.getByRole('button', { name: /Create/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(SubgraphService.createSubgraph).toHaveBeenCalledWith({
          name: 'Test Subgraph',
          description: 'Test description',
          tags: ['tag1'],
          metadata: {},
        });
      });

      expect(mockOnSuccess).toHaveBeenCalledWith(mockSubgraph);
    });

    it('should handle submission error', async () => {
      const { message } = await import('antd');
      
      vi.mocked(SubgraphService.checkNameUnique).mockResolvedValue(true);
      vi.mocked(SubgraphService.createSubgraph).mockRejectedValue(
        new Error('API Error')
      );

      render(<CreateSubgraphModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Name/i);
      await userEvent.type(nameInput, 'Test Subgraph');

      const createButton = screen.getByRole('button', { name: /Create/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(message.error).toHaveBeenCalled();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Confirmation', () => {
    it('should close modal without confirmation when form is pristine', async () => {
      render(<CreateSubgraphModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show confirmation dialog when form is dirty', async () => {
      render(<CreateSubgraphModal {...defaultProps} />);

      // Make form dirty
      const nameInput = screen.getByLabelText(/Name/i);
      await userEvent.type(nameInput, 'Test');

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getAllByText('Unsaved Changes').length).toBeGreaterThan(0);
        expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument();
      });
    });

    it('should close modal when discard is confirmed', async () => {
      render(<CreateSubgraphModal {...defaultProps} />);

      // Make form dirty
      const nameInput = screen.getByLabelText(/Name/i);
      await userEvent.type(nameInput, 'Test');

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getAllByText('Unsaved Changes').length).toBeGreaterThan(0);
      });

      const discardButton = screen.getByRole('button', { name: /Discard/i });
      fireEvent.click(discardButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Description Field', () => {
    it('should preserve line breaks in description', async () => {
      render(<CreateSubgraphModal {...defaultProps} />);

      const descriptionInput = screen.getByLabelText(/Description/i);
      const multilineText = 'Line 1\nLine 2\nLine 3';
      
      await userEvent.type(descriptionInput, multilineText);

      expect(descriptionInput).toHaveValue(multilineText);
    });

    it('should enforce 1000 character limit', async () => {
      render(<CreateSubgraphModal {...defaultProps} />);

      const descriptionInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
      
      // TextArea with maxLength prevents typing more than 1000 characters
      // So we verify the maxLength attribute is set correctly
      expect(descriptionInput).toHaveAttribute('maxlength', '1000');
    });
  });

  describe('Metadata Fields', () => {
    it('should include metadata in submission when provided', async () => {
      const mockSubgraph: Subgraph = {
        id: 1,
        name: 'Test Subgraph',
        metadata: {
          businessDomain: 'payment',
          environment: 'production',
          team: 'Platform Team',
        },
        createdBy: 1,
        createdAt: '2024-12-04T10:00:00Z',
        updatedAt: '2024-12-04T10:00:00Z',
        version: 1,
      };

      vi.mocked(SubgraphService.checkNameUnique).mockResolvedValue(true);
      vi.mocked(SubgraphService.createSubgraph).mockResolvedValue(mockSubgraph);

      render(<CreateSubgraphModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Name/i);
      await userEvent.type(nameInput, 'Test Subgraph');

      // Select business domain
      const businessDomainSelect = screen.getByLabelText(/Business Domain/i);
      await userEvent.click(businessDomainSelect);
      await userEvent.click(screen.getByText('Payment'));

      // Select environment
      const environmentSelect = screen.getByLabelText(/Environment/i);
      await userEvent.click(environmentSelect);
      await userEvent.click(screen.getByText('Production'));

      // Enter team
      const teamInput = screen.getByLabelText(/Team/i);
      await userEvent.type(teamInput, 'Platform Team');

      const createButton = screen.getByRole('button', { name: /Create/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(SubgraphService.createSubgraph).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: {
              businessDomain: 'payment',
              environment: 'production',
              team: 'Platform Team',
            },
          })
        );
      });
    });
  });
});
