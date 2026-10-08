import React, { useState } from 'react';
import { Profile, PaymentMethod, Payment } from '../../types';
import { paymentService } from '../../services/payments/paymentService';
import { storageService } from '../../services/storage/storageService';
import { DEFAULT_SITE_SETTINGS } from '../../config/site';
import { CreditCard, Upload, CheckCircle2, Clock, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

interface PaymentActivationCardProps {
  profile: Profile;
  onPaymentSubmitted: () => void;
}

export const PaymentActivationCard: React.FC<PaymentActivationCardProps> = ({
  profile,
  onPaymentSubmitted,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('bKash');
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState(profile.mobile);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Check if member already has pending payment
  const existingPayments = paymentService.getMemberPayments(profile.innova_id);
  const pendingPayment = existingPayments.find((p) => p.status === 'PENDING');
  const rejectedPayment = existingPayments.find((p) => p.status === 'REJECTED');

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Screenshot size must be under 5MB');
        return;
      }
      setUploadingImage(true);
      setError(null);
      try {
        const url = await storageService.uploadPaymentScreenshot(profile.innova_id, file);
        setScreenshotPreview(url);
      } catch (err: any) {
        setError(err?.message || 'Failed to upload screenshot image');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!trxId.trim() || trxId.trim().length < 6) {
      setError('Please provide a valid Transaction ID from your bKash or Nagad SMS receipt');
      return;
    }
    if (!senderNumber.trim() || !/^01[3-9]\d{8}$/.test(senderNumber.trim())) {
      setError('Please provide the 11-digit mobile number used to send the payment');
      return;
    }

    setLoading(true);
    try {
      paymentService.submitActivationPayment({
        innova_id: profile.innova_id,
        payment_method: method,
        amount: 200,
        transaction_id: trxId.trim(),
        sender_number: senderNumber.trim(),
        screenshot_url: screenshotPreview || undefined,
      });

      setSubmittedSuccess(true);
      onPaymentSubmitted();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit payment verification request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">
            Account Activation Required
          </span>
          <h2 className="text-2xl font-serif font-bold text-neutral-100">
            Submit Activation Payment (৳200)
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Status: <strong className="text-amber-400 uppercase font-mono">{profile.account_status}</strong> · INNOVA ID: <strong className="text-white font-mono">{profile.innova_id}</strong>
          </p>
        </div>

        <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-right">
          <p className="text-[10px] text-neutral-400 uppercase font-mono">Fee Amount</p>
          <p className="text-2xl font-mono font-bold text-amber-400">৳200</p>
        </div>
      </div>

      {/* Pending status banner if already submitted */}
      {pendingPayment && (
        <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-start gap-3 text-xs text-sky-300">
          <Clock className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-sky-200">Payment Verification Under Review</p>
            <p className="text-neutral-300">
              Your payment of ৳{pendingPayment.amount} via {pendingPayment.payment_method} (TrxID: {pendingPayment.transaction_id}) has been received and is awaiting Root Admin (000001) approval. Once approved, your account will activate instantly.
            </p>
          </div>
        </div>
      )}

      {/* Rejected banner if previous payment was rejected */}
      {rejectedPayment && !pendingPayment && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-xs text-red-300">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-red-200">Previous Payment Rejected</p>
            <p className="text-neutral-300">
              Reason: {rejectedPayment.admin_notes || 'Could not verify transaction with telecom records.'}. Please submit a corrected Transaction ID below.
            </p>
          </div>
        </div>
      )}

      {/* Payment Step Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2 text-pink-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            <span>Option A: bKash (Send Money)</span>
          </div>
          <p className="text-neutral-400">
            Open bKash App &gt; Send Money to:
          </p>
          <p className="text-lg font-mono font-bold text-neutral-100 bg-neutral-900 p-2 rounded border border-neutral-800 text-center">
            {DEFAULT_SITE_SETTINGS.bkash_number}
          </p>
          <p className="text-[11px] text-neutral-400">
            Amount: <strong>৳200</strong> · Reference: <strong>{profile.innova_id}</strong>
          </p>
        </div>

        <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2 text-orange-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>Option B: Nagad (Send Money)</span>
          </div>
          <p className="text-neutral-400">
            Open Nagad App &gt; Send Money to:
          </p>
          <p className="text-lg font-mono font-bold text-neutral-100 bg-neutral-900 p-2 rounded border border-neutral-800 text-center">
            {DEFAULT_SITE_SETTINGS.nagad_number}
          </p>
          <p className="text-[11px] text-neutral-400">
            Amount: <strong>৳200</strong> · Reference: <strong>{profile.innova_id}</strong>
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
          {error}
        </div>
      )}

      {submittedSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>Payment details submitted successfully! Awaiting Root Admin approval.</span>
        </div>
      )}

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase">
              Payment Method Used
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMethod('bKash')}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  method === 'bKash'
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500 font-bold'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                bKash
              </button>
              <button
                type="button"
                onClick={() => setMethod('Nagad')}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  method === 'Nagad'
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500 font-bold'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                Nagad
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase">
              Sender Mobile Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 017xxxxxxxx"
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-neutral-100 text-sm font-mono focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase">
            Transaction ID (TrxID)
          </label>
          <input
            type="text"
            required
            placeholder="e.g. BKL87654321"
            value={trxId}
            onChange={(e) => setTrxId(e.target.value)}
            className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-neutral-100 text-sm font-mono uppercase tracking-wider focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase">
            Payment Receipt Screenshot (Optional but recommended)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex-1 border border-dashed border-neutral-700 hover:border-amber-500/60 rounded-xl p-4 bg-neutral-950 text-center cursor-pointer transition-colors">
              <Upload className="w-5 h-5 mx-auto text-neutral-400 mb-1" />
              <span className="text-xs text-neutral-400 block">
                {screenshotPreview ? 'Change Screenshot Image' : 'Upload Receipt Screenshot (PNG, JPG)'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="hidden"
              />
            </label>
            {screenshotPreview && (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-neutral-700 shrink-0 bg-neutral-950">
                <img
                  src={screenshotPreview}
                  alt="Receipt Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Submitting Details...' : 'Submit Activation Payment for Verification'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
