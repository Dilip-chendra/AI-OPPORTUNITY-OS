import { describe, it, expect } from 'vitest'
import { RolePermissions, getRoleBadgeConfig } from '@/lib/permissions'

describe('Role-Based Access Control (RBAC) Permissions Matrix', () => {
  it('enforces Business DNA profile editing permissions strictly for Owner and Admin', () => {
    expect(RolePermissions.canEditBusinessDNA('owner')).toBe(true)
    expect(RolePermissions.canEditBusinessDNA('admin')).toBe(true)
    expect(RolePermissions.canEditBusinessDNA('manager')).toBe(false)
    expect(RolePermissions.canEditBusinessDNA('analyst')).toBe(false)
    expect(RolePermissions.canEditBusinessDNA('member')).toBe(false)
    expect(RolePermissions.canEditBusinessDNA('viewer')).toBe(false)
    expect(RolePermissions.canEditBusinessDNA(undefined)).toBe(false)
  })

  it('enforces Application Creation permissions for executing personas', () => {
    expect(RolePermissions.canCreateApplication('owner')).toBe(true)
    expect(RolePermissions.canCreateApplication('admin')).toBe(true)
    expect(RolePermissions.canCreateApplication('manager')).toBe(true)
    expect(RolePermissions.canCreateApplication('member')).toBe(true)
    // Analysts and Viewers cannot initiate applications
    expect(RolePermissions.canCreateApplication('analyst')).toBe(false)
    expect(RolePermissions.canCreateApplication('viewer')).toBe(false)
  })

  it('enforces Opportunity Save restrictions against Viewer role', () => {
    expect(RolePermissions.canSaveOpportunity('owner')).toBe(true)
    expect(RolePermissions.canSaveOpportunity('admin')).toBe(true)
    expect(RolePermissions.canSaveOpportunity('manager')).toBe(true)
    expect(RolePermissions.canSaveOpportunity('analyst')).toBe(true)
    expect(RolePermissions.canSaveOpportunity('member')).toBe(true)
    expect(RolePermissions.canSaveOpportunity('viewer')).toBe(false)
  })

  it('enforces Proposal Drafting restrictions against Viewer role', () => {
    expect(RolePermissions.canDraftProposal('owner')).toBe(true)
    expect(RolePermissions.canDraftProposal('admin')).toBe(true)
    expect(RolePermissions.canDraftProposal('manager')).toBe(true)
    expect(RolePermissions.canDraftProposal('analyst')).toBe(true)
    expect(RolePermissions.canDraftProposal('member')).toBe(true)
    expect(RolePermissions.canDraftProposal('viewer')).toBe(false)
  })

  it('identifies read-only users accurately', () => {
    expect(RolePermissions.isReadOnly('viewer')).toBe(true)
    expect(RolePermissions.isReadOnly('owner')).toBe(false)
    expect(RolePermissions.isReadOnly('manager')).toBe(false)
  })

  it('returns valid badge styling and label for each of the 6 roles', () => {
    const roles = ['owner', 'admin', 'manager', 'analyst', 'member', 'viewer'] as const
    for (const r of roles) {
      const config = getRoleBadgeConfig(r)
      expect(config.label).toBe(r.toUpperCase())
      expect(config.color).toContain(r === 'analyst' ? 'cyan' : r === 'viewer' ? 'slate' : '')
    }
  })
})
