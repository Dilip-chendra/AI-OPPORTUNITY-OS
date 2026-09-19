import { UserRole } from '@/types';

export const RolePermissions = {
  canEditBusinessDNA: (role?: string): boolean => {
    return role === 'owner' || role === 'admin';
  },
  canCreateApplication: (role?: string): boolean => {
    return role === 'owner' || role === 'admin' || role === 'manager' || role === 'member';
  },
  canUpdateApplication: (role?: string): boolean => {
    return role === 'owner' || role === 'admin' || role === 'manager' || role === 'member';
  },
  canSaveOpportunity: (role?: string): boolean => {
    return role !== 'viewer';
  },
  canDraftProposal: (role?: string): boolean => {
    return role !== 'viewer';
  },
  canAccessAdmin: (role?: string, isAdmin?: boolean): boolean => {
    return Boolean(isAdmin || role === 'owner' || role === 'admin');
  },
  isReadOnly: (role?: string): boolean => {
    return role === 'viewer';
  },
};

export function getRoleBadgeConfig(role?: string) {
  switch (role) {
    case 'owner':
      return { label: 'OWNER', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    case 'admin':
      return { label: 'ADMIN', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
    case 'manager':
      return { label: 'MANAGER', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
    case 'analyst':
      return { label: 'ANALYST', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
    case 'member':
      return { label: 'MEMBER', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
    case 'viewer':
    default:
      return { label: 'VIEWER', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  }
}
