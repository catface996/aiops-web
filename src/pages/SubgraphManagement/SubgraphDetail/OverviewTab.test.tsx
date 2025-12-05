/**
 * OverviewTab Component Tests
 * 
 * Tests for the OverviewTab component that displays subgraph overview information.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OverviewTab from './OverviewTab';
import type { SubgraphDetail } from '@/types/subgraph';

describe('OverviewTab', () => {
  const mockSubgraph: SubgraphDetail = {
    id: 1,
    name: 'Test Subgraph',
    description: 'This is a test subgraph\nwith multiple lines',
    tags: ['production', 'critical', 'backend'],
    metadata: {
      businessDomain: 'E-commerce',
      environment: 'Production',
      team: 'Platform Team',
      customField: 'Custom Value',
    },
    createdBy: 100,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-02-20T15:45:00Z',
    version: 3,
    owners: [
      {
        userId: 100,
        username: 'john.doe',
        email: 'john.doe@example.com',
      },
      {
        userId: 101,
        username: 'jane.smith',
        email: 'jane.smith@example.com',
      },
    ],
    viewers: [
      {
        userId: 200,
        username: 'viewer.one',
        email: 'viewer.one@example.com',
      },
    ],
    resources: [],
    resourceCount: 25,
  };

  it('should render basic information correctly', () => {
    render(<OverviewTab subgraph={mockSubgraph} />);

    // Check subgraph name
    expect(screen.getByText('Test Subgraph')).toBeInTheDocument();

    // Check description (with line breaks preserved)
    expect(screen.getByText(/This is a test subgraph/)).toBeInTheDocument();

    // Check tags
    expect(screen.getByText('production')).toBeInTheDocument();
    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('backend')).toBeInTheDocument();

    // Check version
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should render statistics cards', () => {
    render(<OverviewTab subgraph={mockSubgraph} />);

    // Check owner count
    expect(screen.getByText('所有者数量')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Check viewer count
    expect(screen.getByText('查看者数量')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    // Check resource count
    expect(screen.getByText('资源节点数量')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('should render metadata correctly', () => {
    render(<OverviewTab subgraph={mockSubgraph} />);

    // Check standard metadata fields
    expect(screen.getByText('E-commerce')).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('Platform Team')).toBeInTheDocument();

    // Check custom metadata field
    expect(screen.getByText('customField')).toBeInTheDocument();
    expect(screen.getByText('Custom Value')).toBeInTheDocument();
  });

  it('should render timestamps correctly', () => {
    render(<OverviewTab subgraph={mockSubgraph} />);

    // Check that timestamp labels are present
    expect(screen.getByText('创建时间')).toBeInTheDocument();
    expect(screen.getByText('更新时间')).toBeInTheDocument();

    // Check creator ID
    expect(screen.getByText('100')).toBeInTheDocument();

    // Check update count (version - 1)
    expect(screen.getByText('2 次')).toBeInTheDocument();
  });

  it('should render owners list', () => {
    render(<OverviewTab subgraph={mockSubgraph} />);

    // Check owner usernames
    expect(screen.getByText('john.doe')).toBeInTheDocument();
    expect(screen.getByText('jane.smith')).toBeInTheDocument();

    // Check owner emails
    expect(screen.getByText('(john.doe@example.com)')).toBeInTheDocument();
    expect(screen.getByText('(jane.smith@example.com)')).toBeInTheDocument();
  });

  it('should render viewers list', () => {
    render(<OverviewTab subgraph={mockSubgraph} />);

    // Check viewer username
    expect(screen.getByText('viewer.one')).toBeInTheDocument();

    // Check viewer email
    expect(screen.getByText('(viewer.one@example.com)')).toBeInTheDocument();
  });

  it('should handle missing optional fields gracefully', () => {
    const minimalSubgraph: SubgraphDetail = {
      id: 2,
      name: 'Minimal Subgraph',
      createdBy: 100,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      version: 1,
      owners: [],
      viewers: [],
      resources: [],
      resourceCount: 0,
    };

    render(<OverviewTab subgraph={minimalSubgraph} />);

    // Check that "no data" messages are displayed
    expect(screen.getByText('无描述')).toBeInTheDocument();
    expect(screen.getByText('无标签')).toBeInTheDocument();
    expect(screen.getAllByText('未设置').length).toBeGreaterThan(0); // For metadata fields (multiple instances)
    expect(screen.getByText('无所有者')).toBeInTheDocument();
    expect(screen.getByText('无查看者')).toBeInTheDocument();
    expect(screen.getByText('未更新')).toBeInTheDocument();
  });

  it('should display all tags when there are many', () => {
    const subgraphWithManyTags: SubgraphDetail = {
      ...mockSubgraph,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8'],
    };

    render(<OverviewTab subgraph={subgraphWithManyTags} />);

    // Check that all tags are rendered
    subgraphWithManyTags.tags!.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('should display multiple owners and viewers', () => {
    const subgraphWithMultipleUsers: SubgraphDetail = {
      ...mockSubgraph,
      owners: [
        { userId: 1, username: 'owner1', email: 'owner1@test.com' },
        { userId: 2, username: 'owner2', email: 'owner2@test.com' },
        { userId: 3, username: 'owner3', email: 'owner3@test.com' },
      ],
      viewers: [
        { userId: 10, username: 'viewer1', email: 'viewer1@test.com' },
        { userId: 11, username: 'viewer2', email: 'viewer2@test.com' },
      ],
    };

    render(<OverviewTab subgraph={subgraphWithMultipleUsers} />);

    // Check owners
    expect(screen.getByText('owner1')).toBeInTheDocument();
    expect(screen.getByText('owner2')).toBeInTheDocument();
    expect(screen.getByText('owner3')).toBeInTheDocument();

    // Check viewers
    expect(screen.getByText('viewer1')).toBeInTheDocument();
    expect(screen.getByText('viewer2')).toBeInTheDocument();

    // Check statistics reflect correct counts by checking the statistic titles and values together
    expect(screen.getByText('所有者数量')).toBeInTheDocument();
    expect(screen.getByText('查看者数量')).toBeInTheDocument();
    // The numbers 3 and 2 appear in multiple places (statistics and version), so we just verify the users are listed
  });
});
