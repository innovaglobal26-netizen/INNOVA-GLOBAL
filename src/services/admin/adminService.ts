import { dbStore } from '../db/store';
import { AccountStatus, Package, SiteSettings, Task } from '../../types';

export const adminService = {
  assertAdmin(adminInnovaId: string) {
    dbStore.assertRootAdmin(adminInnovaId);
  },

  getAllMembers(adminInnovaId: string) {
    dbStore.assertRootAdmin(adminInnovaId);
    return dbStore.getProfiles();
  },

  updateMemberStatus(adminInnovaId: string, targetInnovaId: string, status: AccountStatus) {
    return dbStore.updateProfileStatus(adminInnovaId, targetInnovaId, status);
  },

  getAllPayments(adminInnovaId: string) {
    dbStore.assertRootAdmin(adminInnovaId);
    return dbStore.getPayments();
  },

  approvePayment(adminInnovaId: string, paymentId: string) {
    return dbStore.approvePayment(adminInnovaId, paymentId);
  },

  rejectPayment(adminInnovaId: string, paymentId: string, reason?: string) {
    return dbStore.rejectPayment(adminInnovaId, paymentId, reason);
  },

  getAllWithdrawals(adminInnovaId: string) {
    dbStore.assertRootAdmin(adminInnovaId);
    return dbStore.getWithdrawals();
  },

  updateWithdrawalStatus(
    adminInnovaId: string,
    withdrawalId: string,
    status: 'APPROVED' | 'REJECTED' | 'PAID',
    adminNotes?: string
  ) {
    return dbStore.updateWithdrawalStatus(adminInnovaId, withdrawalId, status, adminNotes);
  },

  updatePackage(adminInnovaId: string, pkg: Package) {
    return dbStore.updatePackage(adminInnovaId, pkg);
  },

  createPackage(adminInnovaId: string, pkg: Omit<Package, 'created_at'>) {
    return dbStore.createPackage(adminInnovaId, pkg);
  },

  togglePackageActive(adminInnovaId: string, packageId: string) {
    return dbStore.togglePackageActive(adminInnovaId, packageId);
  },

  getAllPackagePurchases(adminInnovaId: string) {
    dbStore.assertRootAdmin(adminInnovaId);
    return dbStore.getAllPackagePurchases();
  },

  approvePackagePurchase(adminInnovaId: string, purchaseId: string) {
    return dbStore.approvePackagePurchase(adminInnovaId, purchaseId);
  },

  rejectPackagePurchase(adminInnovaId: string, purchaseId: string, reason?: string) {
    return dbStore.rejectPackagePurchase(adminInnovaId, purchaseId, reason);
  },

  sendAnnouncement(adminInnovaId: string, title: string, message: string, targetId: string = 'ALL') {
    dbStore.assertRootAdmin(adminInnovaId);
    return dbStore.addNotification({
      target_innova_id: targetId,
      title,
      message,
    });
  },

  updateSiteSettings(adminInnovaId: string, settings: Partial<SiteSettings>) {
    return dbStore.updateSiteSettings(adminInnovaId, settings);
  },

  getAdminLogs(adminInnovaId: string) {
    return dbStore.getAdminLogs(adminInnovaId);
  },

  manualFinancialAdjustment(
    adminInnovaId: string,
    memberInnovaId: string,
    amount: number,
    description: string
  ) {
    dbStore.assertRootAdmin(adminInnovaId);
    const profile = dbStore.getProfileByInnovaId(memberInnovaId);
    if (!profile) throw new Error('Member not found');

    return dbStore.creditLedger({
      member_id: profile.id,
      innova_id: profile.innova_id,
      amount,
      type: 'AUTHORIZED_ADJUSTMENT',
      description: `Admin Adjustment (${adminInnovaId}): ${description}`,
    });
  },
};
