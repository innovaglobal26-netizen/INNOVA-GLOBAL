import { dbStore } from '../db/store';
import { MemberFinancialSummary, Profile, PackagePurchase, PaymentMethod, Package } from '../../types';

export const memberService = {
  getProfile(innovaId: string): Profile | undefined {
    return dbStore.getProfileByInnovaId(innovaId);
  },

  getFinancialSummary(innovaId: string): MemberFinancialSummary {
    return dbStore.getMemberFinancialSummary(innovaId);
  },

  getActivePackages(innovaId: string): PackagePurchase[] {
    return dbStore.getActivePackages(innovaId);
  },

  getAllPurchasedPackages(innovaId: string): PackagePurchase[] {
    return dbStore.getAllMemberPackages(innovaId);
  },

  getAvailablePackages(): Package[] {
    return dbStore.getPackages();
  },

  purchasePackage(innovaId: string, packageId: string): PackagePurchase {
    return dbStore.purchasePackage(innovaId, packageId);
  },

  requestPackagePurchase(data: {
    innova_id: string;
    package_id: string;
    payment_method: PaymentMethod;
    sender_number: string;
    transaction_id: string;
    screenshot_url?: string;
  }): PackagePurchase {
    return dbStore.requestPackagePurchase(data);
  },

  updateAvatar(innovaId: string, avatarUrl: string | null): Profile {
    return dbStore.updateProfileAvatar(innovaId, avatarUrl);
  },

  saveWithdrawalAccount(innovaId: string, method: PaymentMethod, accountNumber: string): Profile {
    return dbStore.saveWithdrawalAccount(innovaId, method, accountNumber);
  },

  getWithdrawalEligibility(innovaId: string) {
    return dbStore.getWithdrawalEligibility(innovaId);
  },

  getReferralMetrics(innovaId: string) {
    return dbStore.getReferralMetrics(innovaId);
  },

  getLedger(innovaId: string) {
    return dbStore.getMemberLedger(innovaId);
  },
};

