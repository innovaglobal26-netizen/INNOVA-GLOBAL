import { dbStore } from '../db/store';
import { Payment, PaymentMethod } from '../../types';

export const paymentService = {
  submitActivationPayment(data: {
    innova_id: string;
    payment_method: PaymentMethod;
    amount: number;
    transaction_id: string;
    sender_number: string;
    screenshot_url?: string;
  }): Payment {
    return dbStore.submitPayment(data);
  },

  getMemberPayments(innovaId: string): Payment[] {
    return dbStore.getMemberPayments(innovaId);
  },

  getAllPayments(): Payment[] {
    return dbStore.getPayments();
  },

  approvePayment(adminInnovaId: string, paymentId: string): Payment {
    return dbStore.approvePayment(adminInnovaId, paymentId);
  },

  rejectPayment(adminInnovaId: string, paymentId: string, reason?: string): Payment {
    return dbStore.rejectPayment(adminInnovaId, paymentId, reason);
  },
};
