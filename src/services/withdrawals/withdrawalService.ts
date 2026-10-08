import { dbStore } from '../db/store';
import { PaymentMethod, Withdrawal, WithdrawalStatus } from '../../types';

export const withdrawalService = {
  requestWithdrawal(data: {
    innova_id: string;
    amount: number;
    payment_method: PaymentMethod;
    account_number: string;
    user_note?: string;
  }): Withdrawal {
    return dbStore.requestWithdrawal(data);
  },

  getMemberWithdrawals(innovaId: string): Withdrawal[] {
    return dbStore.getMemberWithdrawals(innovaId);
  },

  getAllWithdrawals(): Withdrawal[] {
    return dbStore.getWithdrawals();
  },

  updateStatus(
    adminInnovaId: string,
    withdrawalId: string,
    status: 'APPROVED' | 'REJECTED' | 'PAID',
    adminNotes?: string
  ): Withdrawal {
    return dbStore.updateWithdrawalStatus(adminInnovaId, withdrawalId, status, adminNotes);
  },
};
