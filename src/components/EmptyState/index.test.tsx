import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from './index';

describe('EmptyState Component', () => {
  describe('Empty List Scenario', () => {
    it('should render empty state with default empty configuration', () => {
      render(<EmptyState type="empty" onAction={() => {}} />);

      expect(screen.getByText('No data')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating a new item')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });

    it('should render with custom title and description', () => {
      render(
        <EmptyState
          type="empty"
          title="No subgraphs found"
          description="Get started by creating your first subgraph"
        />
      );

      expect(screen.getByText('No subgraphs found')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating your first subgraph')).toBeInTheDocument();
    });

    it('should render with custom action text', () => {
      render(
        <EmptyState
          type="empty"
          actionText="Create Subgraph"
          onAction={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /create subgraph/i })).toBeInTheDocument();
    });

    it('should call onAction when action button is clicked', () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          type="empty"
          actionText="Create Subgraph"
          onAction={handleAction}
        />
      );

      const button = screen.getByRole('button', { name: /create subgraph/i });
      fireEvent.click(button);

      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('should render primary button for empty type', () => {
      render(<EmptyState type="empty" onAction={() => {}} />);

      const button = screen.getByRole('button', { name: /create/i });
      expect(button).toHaveClass('ant-btn-primary');
    });

    it('should not render action button when showAction is false', () => {
      render(
        <EmptyState
          type="empty"
          showAction={false}
          onAction={() => {}}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not render action button when onAction is not provided', () => {
      render(<EmptyState type="empty" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('No Search Results Scenario', () => {
    it('should render no-results state with default configuration', () => {
      render(<EmptyState type="no-results" onAction={() => {}} />);

      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });

    it('should render with custom title and description', () => {
      render(
        <EmptyState
          type="no-results"
          title="No subgraphs match your search"
          description="Try adjusting your search criteria"
        />
      );

      expect(screen.getByText('No subgraphs match your search')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument();
    });

    it('should render with custom action text', () => {
      render(
        <EmptyState
          type="no-results"
          actionText="Clear Filters"
          onAction={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();
    });

    it('should call onAction when clear search button is clicked', () => {
      const handleClearSearch = vi.fn();
      render(
        <EmptyState
          type="no-results"
          actionText="Clear Search"
          onAction={handleClearSearch}
        />
      );

      const button = screen.getByRole('button', { name: 'Clear Search' });
      fireEvent.click(button);

      expect(handleClearSearch).toHaveBeenCalledTimes(1);
    });

    it('should render default button for no-results type', () => {
      render(<EmptyState type="no-results" onAction={() => {}} />);

      const button = screen.getByRole('button', { name: /clear search/i });
      expect(button).not.toHaveClass('ant-btn-primary');
    });
  });

  describe('Accessibility', () => {
    it('should have proper structure for screen readers', () => {
      const { container } = render(
        <EmptyState
          type="empty"
          title="No data"
          description="Create your first item"
          onAction={() => {}}
        />
      );

      // Check that the component has proper structure
      expect(container.querySelector('.ant-empty')).toBeInTheDocument();
    });

    it('should render button with proper role', () => {
      render(
        <EmptyState
          type="empty"
          actionText="Create"
          onAction={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /create/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Visual Layout', () => {
    it('should render with centered layout', () => {
      const { container } = render(<EmptyState type="empty" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      });
    });

    it('should have minimum height for proper spacing', () => {
      const { container } = render(<EmptyState type="empty" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({
        minHeight: '400px',
      });
    });
  });
});
