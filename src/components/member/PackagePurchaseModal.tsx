import React, { useState } from 'react';
import { Package, PaymentMethod, Profile } from '../../types';
import { memberService } from '../../services/member/memberService';
import { storageService } from '../../services/storage/storageService';
import { DEFAULT_SITE_SETTINGS } from '../../config/site';
import { X, Crown, CheckCircle2, AlertCircle, ArrowRight, Upload, Clock } from 'lucide-react';

interface PackagePurchaseModalProps {
  pkg: Package;
  profile: Profile;
  onClose: () => void;
  onSuccess: () => void;
}

export const PackagePurchaseModal: React.FC<PackagePurchaseModalProps> = ({
  pkg,
  profile,
  onClose,
  onSuccess,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('bKash');
  const [senderNumber, setSenderNumber] = useState(profile.mobile);
  const [trxId, setTrxId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Screenshot must be under 5MB');
        return;
      }
      setUploadingImage(true);
      setError(null);
      try {
        const url = await storageService.uploadPaymentScreenshot(profile.innova_id, file);
        setScreenshotUrl(url);
      } catch (err: any) {
        setError(err?.message || 'Failed to upload screenshot');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTrx = trxId.trim();
    if (!cleanTrx || cleanTrx.length < 6) {
      setError('Please provide a valid Transaction ID from your bKash or Nagad SMS receipt');
      return;
    }
    const cleanSender = senderNumber.trim();
    if (!cleanSender || !/^01[3-9]\d{8}$/.test(cleanSender)) {
      setError('Please provide the 11-digit mobile number used to send the payment');
      return;
    }

    setLoading(true);
    try {
      memberService.requestPackagePurchase({
        innova_id: profile.innova_id,
        package_id: pkg.id,
        payment_method: method,
        sender_number: cleanSender,
        transaction_id: cleanTrx,
        screenshot_url: screenshotUrl || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Package activation request failed');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                Tier Upgrade Portal
              </span>
              <h3 className="text-lg font-bold text-neutral-100 font-serif">
                Activate {pkg.name} Package
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Details Card */}
        <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
            <span className="text-neutral-400">Package Tier:</span>
            <span className="font-serif font-bold text-base text-amber-400">{pkg.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Tier Price:</span>
            <span className="font-mono font-bold text-lg text-white">৳{pkg.price}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Validity & Tasks:</span>
            <span className="font-mono text-neutral-200">
              {pkg.duration_days} days · {pkg.tasks_per_day} tasks/day
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Configured Daily Yield:</span>
            <span className="font-mono text-emerald-400 font-bold">৳{pkg.daily_reward} / day</span>
          </div>
        </div>

        {/* Payment Account Details */}
        <div className="space-y-2">
          <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider">
            Official Payment Numbers (Send Money)
          </label>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-center space-y-1">
              <span className="text-[11px] font-bold text-pink-400 block">bKash Personal</span>
              <span className="font-mono font-bold text-neutral-100 text-sm block">
                {DEFAULT_SITE_SETTINGS.bkash_number}
              </span>
              <span className="text-[10px] text-neutral-500">Send ৳{pkg.price}</span>
            </div>
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-center space-y-1">
              <span className="text-[11px] font-bold text-orange-400 block">Nagad Personal</span>
              <span className="font-mono font-bold text-neutral-100 text-sm block">
                {DEFAULT_SITE_SETTINGS.nagad_number}
              </span>
              <span className="text-[10px] text-neutral-500">Send ৳{pkg.price}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-neutral-100">Order Submitted!</h4>
            <p className="text-xs text-neutral-400">
              Your {pkg.name} package activation request is now pending Root Admin approval. Once verified, it will appear as Active in your dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase">
                Payment Channel Used
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('bKash')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    method === 'bKash'
                      ? 'bg-pink-500/20 text-pink-300 border-pink-500 font-bold'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                  }`}
                >
                  bKash
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('Nagad')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    method === 'Nagad'
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500 font-bold'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                  }`}
                >
                  Nagad
                </button>
              </div>
            </div>

            {/* Sender Number */}
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
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-neutral-100 text-xs font-mono focus:outline-none"
              />
            </div>

            {/* Transaction ID */}
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
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-neutral-100 text-xs font-mono uppercase focus:outline-none"
              />
            </div>

            {/* Screenshot Upload (Optional) */}
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase">
                Payment Screenshot (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 border border-dashed border-neutral-700 hover:border-amber-500/60 rounded-xl p-3 bg-neutral-950 text-center cursor-pointer transition-colors text-xs text-neutral-400">
                  <Upload className="w-4 h-4 mx-auto mb-1 text-neutral-400" />
                  <span>{screenshotUrl ? 'Change Screenshot' : 'Upload Receipt Screenshot'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="hidden"
                  />
                </label>
                {screenshotUrl && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-700 shrink-0">
                    <img src={screenshotUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {loading ? 'Submitting Order...' : `Submit Payment for ${pkg.name} (৳${pkg.price})`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
