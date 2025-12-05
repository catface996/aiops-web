/**
 * Subgraph Management - English Translation
 */
export default {
  // Page titles
  'subgraph.list.title': 'Subgraph Management',
  'subgraph.detail.title': 'Subgraph Detail',
  'subgraph.create.title': 'Create Subgraph',
  'subgraph.edit.title': 'Edit Subgraph',

  // Buttons
  'subgraph.button.create': 'Create Subgraph',
  'subgraph.button.edit': 'Edit',
  'subgraph.button.delete': 'Delete',
  'subgraph.button.addNode': 'Add Node',
  'subgraph.button.save': 'Save',
  'subgraph.button.cancel': 'Cancel',
  'subgraph.button.confirm': 'Confirm',
  'subgraph.button.reset': 'Reset',
  'subgraph.button.refresh': 'Refresh',
  'subgraph.button.export': 'Export',
  'subgraph.button.search': 'Search',
  'subgraph.button.clearSearch': 'Clear Search',
  'subgraph.button.resetFilters': 'Reset Filters',
  'subgraph.button.selectAll': 'Select All',
  'subgraph.button.batchRemove': 'Batch Remove',

  // Form fields
  'subgraph.form.name': 'Name',
  'subgraph.form.name.placeholder': 'Enter subgraph name',
  'subgraph.form.name.required': 'Name is required',
  'subgraph.form.name.length': 'Name must be 1-255 characters',
  'subgraph.form.name.exists': 'Subgraph name already exists',
  'subgraph.form.description': 'Description',
  'subgraph.form.description.placeholder': 'Enter subgraph description',
  'subgraph.form.description.maxLength': 'Description must not exceed 1000 characters',
  'subgraph.form.tags': 'Tags',
  'subgraph.form.tags.placeholder': 'Enter tags',
  'subgraph.form.tags.maxCount': 'Maximum 10 tags allowed',
  'subgraph.form.tags.format': 'Tags must be 1-50 characters and contain only letters, numbers, hyphens, and underscores',
  'subgraph.form.metadata': 'Metadata',
  'subgraph.form.businessDomain': 'Business Domain',
  'subgraph.form.businessDomain.placeholder': 'Enter business domain',
  'subgraph.form.environment': 'Environment',
  'subgraph.form.environment.placeholder': 'Select environment',
  'subgraph.form.team': 'Team',
  'subgraph.form.team.placeholder': 'Enter team name',

  // Table columns
  'subgraph.table.name': 'Name',
  'subgraph.table.description': 'Description',
  'subgraph.table.tags': 'Tags',
  'subgraph.table.ownerCount': 'Owners',
  'subgraph.table.resourceCount': 'Resources',
  'subgraph.table.createdAt': 'Created',
  'subgraph.table.updatedAt': 'Updated',
  'subgraph.table.actions': 'Actions',
  'subgraph.table.type': 'Type',
  'subgraph.table.status': 'Status',
  'subgraph.table.addedAt': 'Added',
  'subgraph.table.addedBy': 'Added By',
  'subgraph.table.owner': 'Owner',

  // Filters
  'subgraph.filter.title': 'Filters',
  'subgraph.filter.tags': 'Filter by Tags',
  'subgraph.filter.owner': 'Filter by Owner',
  'subgraph.filter.noTags': 'No tags',
  'subgraph.filter.noOwners': 'No owners',

  // Tabs
  'subgraph.tab.overview': 'Overview',
  'subgraph.tab.resources': 'Resource Nodes',
  'subgraph.tab.topology': 'Topology',
  'subgraph.tab.permissions': 'Permissions',

  // Overview
  'subgraph.overview.basicInfo': 'Basic Information',
  'subgraph.overview.statistics': 'Statistics',
  'subgraph.overview.creator': 'Creator',
  'subgraph.overview.version': 'Version',

  // Topology
  'subgraph.topology.layout': 'Layout',
  'subgraph.topology.layout.force': 'Force-Directed',
  'subgraph.topology.layout.hierarchical': 'Hierarchical',
  'subgraph.topology.layout.circular': 'Circular',
  'subgraph.topology.export.png': 'Export as PNG',
  'subgraph.topology.export.svg': 'Export as SVG',
  'subgraph.topology.empty': 'No nodes in this subgraph',
  'subgraph.topology.noRelationships': 'No relationships defined between nodes',

  // Permissions
  'subgraph.permission.owners': 'Owners',
  'subgraph.permission.viewers': 'Viewers',
  'subgraph.permission.addOwner': 'Add Owner',
  'subgraph.permission.addViewer': 'Add Viewer',
  'subgraph.permission.removeOwner': 'Remove Owner',
  'subgraph.permission.removeViewer': 'Remove Viewer',
  'subgraph.permission.noOwners': 'No owners assigned',
  'subgraph.permission.noViewers': 'No viewers assigned',
  'subgraph.permission.lastOwnerWarning': 'Cannot remove the last owner. Please add another owner first',

  // Resources
  'subgraph.resource.search.placeholder': 'Search resource nodes',
  'subgraph.resource.type.filter': 'Filter by Type',
  'subgraph.resource.alreadyAdded': 'Already Added',
  'subgraph.resource.selected': '{count} selected',
  'subgraph.resource.maxSelection': 'You can add up to 50 nodes at once. Please reduce your selection',
  'subgraph.resource.remove': 'Remove',

  // Empty states
  'subgraph.empty.list': 'No subgraphs found',
  'subgraph.empty.list.description': 'No subgraphs have been created yet',
  'subgraph.empty.search': 'No subgraphs match your search',
  'subgraph.empty.search.description': 'Try adjusting your search or filters',
  'subgraph.empty.resources': 'No resource nodes in this subgraph',
  'subgraph.empty.resources.description': 'Click "Add Node" button to start adding resources',

  // Success messages
  'subgraph.message.createSuccess': 'Subgraph created successfully',
  'subgraph.message.updateSuccess': 'Subgraph updated successfully',
  'subgraph.message.deleteSuccess': 'Subgraph deleted successfully',
  'subgraph.message.addResourceSuccess': '{count} nodes added successfully',
  'subgraph.message.removeResourceSuccess': 'Node removed successfully',
  'subgraph.message.addOwnerSuccess': 'Owner added successfully',
  'subgraph.message.removeOwnerSuccess': 'Owner removed successfully',

  // Error messages
  'subgraph.error.loadFailed': 'Failed to load subgraph',
  'subgraph.error.createFailed': 'Failed to create subgraph',
  'subgraph.error.updateFailed': 'Failed to update subgraph',
  'subgraph.error.deleteFailed': 'Failed to delete subgraph',
  'subgraph.error.addResourceFailed': 'Failed to add nodes',
  'subgraph.error.removeResourceFailed': 'Failed to remove node',
  'subgraph.error.permissionDenied': 'You do not have permission to perform this action',
  'subgraph.error.notFound': 'Subgraph not found or has been deleted',
  'subgraph.error.conflict': 'Subgraph has been modified by others. Please refresh and try again',
  'subgraph.error.networkError': 'Network error. Please check your connection',
  'subgraph.error.timeout': 'Request timed out. Please check your network connection and try again',

  // Confirmation dialogs
  'subgraph.confirm.delete.title': 'Delete Subgraph',
  'subgraph.confirm.delete.content': 'This action cannot be undone. Are you sure you want to delete this subgraph?',
  'subgraph.confirm.delete.nonEmpty': 'Cannot delete subgraph with resources. Please remove all resources first',
  'subgraph.confirm.delete.inputName': 'Enter the subgraph name to confirm deletion',
  'subgraph.confirm.delete.resourceNote': 'Resource nodes will not be deleted, only the subgraph association will be removed',
  'subgraph.confirm.removeResource.title': 'Remove Node',
  'subgraph.confirm.removeResource.content': 'Are you sure you want to remove this node from the subgraph? The node itself will not be deleted or modified',
  'subgraph.confirm.batchRemove.title': 'Batch Remove Nodes',
  'subgraph.confirm.batchRemove.content': 'Are you sure you want to remove {count} nodes?',
  'subgraph.confirm.unsavedChanges.title': 'Unsaved Changes',
  'subgraph.confirm.unsavedChanges.content': 'You have unsaved changes. Are you sure you want to discard them?',
  'subgraph.confirm.removeOwner.title': 'Remove Owner',
  'subgraph.confirm.removeOwner.content': 'Are you sure you want to remove this owner?',

  // Pagination
  'subgraph.pagination.total': 'Total {total} items',
  'subgraph.pagination.pageSize': '{size} items per page',

  // Loading states
  'subgraph.loading': 'Loading...',
  'subgraph.loading.list': 'Loading subgraph list...',
  'subgraph.loading.detail': 'Loading subgraph detail...',
  'subgraph.loading.topology': 'Loading topology...',
  'subgraph.loading.resources': 'Loading resource nodes...',

  // Others
  'subgraph.breadcrumb.home': 'Home',
  'subgraph.breadcrumb.list': 'Subgraph Management',
  'subgraph.breadcrumb.detail': 'Subgraph Detail',
  'subgraph.notificationLogged': 'Operation has been logged to audit log',
  'subgraph.ownerNotification': 'Affected users will be notified',
};
