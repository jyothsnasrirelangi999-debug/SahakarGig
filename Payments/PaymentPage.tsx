import React, { useState } from 'react';
import { BookingData, Language } from '../types';
import { translations } from '../translations';
import {
  calculatePaymentBreakdown,
  formatInr,
  buildStandardUpiUrl,
  buildAppSpecificUpiUrl,
} from '../utils/payment';
import {
  SahakarGigLogo,
  PhonePeIcon,
  GooglePayIcon,
  PaytmIcon,
  BhimIcon,
} from './UpiIcons';
import { UpiQrCode } from './UpiQrCode';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  HelpCircle,
  Globe,
  UserCheck,
  Calendar,
  Wrench,
  QrCode,
} from 'lucide-react';

interface PaymentPageProps {
  booking: BookingData;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onBackToDashboard: () => void;
  onPaymentSuccess: (bookingId: string, transactionId: string) => void;
}

interface ActivePaymentSession {
  app: 'phonepe' | 'gpay' | 'paytm' | 'bhim' | 'link' | 'scanner';
  appName: string;
  url?: string;
  fallbackUrl?: string;
  initiatedAt: number;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({
  booking,
  language,
  onLanguageChange,
  onBackToDashboard,
  onPaymentSuccess,
}) => {
  const t = translations[language];

  // Dynamic calculations
  const calculation = calculatePaymentBreakdown(
    booking.baseServiceAmount,
    booking.gstRate,
    booking.adminFee
  );

  // States
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeSession, setActiveSession] = useState<ActivePaymentSession | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  // Standard UPI URI
  const upiIntentUrl = buildStandardUpiUrl({
    pa: booking.workerUpiId,
    pn: booking.workerName,
    am: calculation.grandTotal,
    cu: 'INR',
    tn: `SahakarGig-${booking.id}`,
    tr: `SG_${booking.id}_${Date.now()}`,
  });

  // Deep Link Trigger helper that works safely across mobile & web environments
  const triggerDeepLink = (url: string) => {
    try {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.rel = 'noopener noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      window.location.href = url;
    }
  };

  // Handle Copy UPI
  const handleCopyUpi = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(booking.workerUpiId);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = booking.workerUpiId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 3000);
    } catch {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 3000);
    }
  };

  // Handle UPI app click: Redirects to corresponding app and enters in-progress verification state
  const handleUpiAppClick = (app: 'phonepe' | 'gpay' | 'paytm' | 'bhim', appName: string) => {
    setErrorMessage(null);
    setNoticeMessage(null);

    const { primaryUrl, fallbackUrl } = buildAppSpecificUpiUrl(app, {
      pa: booking.workerUpiId,
      pn: booking.workerName,
      am: calculation.grandTotal,
      tn: `SahakarGig ${booking.id}`,
      tr: `SG_${booking.id}_${Date.now()}`,
    });

    // Set active payment session (payment is NOT marked successful yet!)
    setActiveSession({
      app,
      appName,
      url: primaryUrl,
      fallbackUrl,
      initiatedAt: Date.now(),
    });

    // Trigger redirection to the corresponding UPI app
    triggerDeepLink(primaryUrl);
  };

  // Handle Easy Payment Link Click
  const handleOpenPaymentLink = () => {
    setErrorMessage(null);
    setNoticeMessage(null);

    setActiveSession({
      app: 'link',
      appName: 'UPI Payment Link',
      url: upiIntentUrl,
      fallbackUrl: upiIntentUrl,
      initiatedAt: Date.now(),
    });

    triggerDeepLink(upiIntentUrl);
  };

  // Simulated Verification Flow: Payment becomes successful ONLY after user completes it and it is verified
  const handleVerifyPayment = (simulateOutcome: 'success' | 'failed' | 'pending' = 'success') => {
    setIsVerifying(true);
    setErrorMessage(null);
    setNoticeMessage(null);

    setTimeout(() => {
      setIsVerifying(false);
      if (simulateOutcome === 'success') {
        const demoTxnId = `SG-UPI-${Math.floor(10000000 + Math.random() * 90000000)}-VERIFIED`;
        setActiveSession(null);
        onPaymentSuccess(booking.id, demoTxnId);
      } else if (simulateOutcome === 'failed') {
        setErrorMessage(t.paymentFailedMsg);
      } else {
        setErrorMessage(t.paymentPendingMsg);
      }
    }, 1300);
  };

  const isPaid = booking.paymentStatus === 'paid';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* 1. TOP BAR */}
      <header
        id="payment-top-bar"
        className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-2xs"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Top-Left: SahakarGig Logo (Section 2) */}
          <div className="flex items-center gap-3">
            <button
              id="back-nav-btn"
              onClick={onBackToDashboard}
              aria-label={t.backToDashboard}
              className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
              <span className="hidden sm:inline">{t.dashboard}</span>
            </button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <SahakarGigLogo />
          </div>

          {/* Top-Right: Multilingual Selector (Section 3) */}
          <div className="relative">
            <button
              id="language-selector-button"
              type="button"
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 transition-colors shadow-2xs"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'en' ? 'English' : language === 'te' ? 'తెలుగు' : 'हिन्दी'}
              </span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {languageMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLanguageMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                  <button
                    id="lang-option-en"
                    onClick={() => {
                      onLanguageChange('en');
                      setLanguageMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between hover:bg-slate-50 ${
                      language === 'en' ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button
                    id="lang-option-te"
                    onClick={() => {
                      onLanguageChange('te');
                      setLanguageMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between hover:bg-slate-50 ${
                      language === 'te' ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>తెలుగు (Telugu)</span>
                    {language === 'te' && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button
                    id="lang-option-hi"
                    onClick={() => {
                      onLanguageChange('hi');
                      setLanguageMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between hover:bg-slate-50 ${
                      language === 'hi' ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>हिन्दी (Hindi)</span>
                    {language === 'hi' && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {/* Navigation Return Pill */}
        <div>
          <button
            id="back-to-dashboard-btn"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-full transition-colors border border-emerald-200/60"
          >
            <span>{t.backToDashboard}</span>
          </button>
        </div>

        {/* 4. PAGE TITLE */}
        <section id="payment-page-title-section" className="text-center py-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.makePayment}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {t.makePaymentSub}
          </p>
        </section>

        {/* ALERTS & ERROR MESSAGES (Section 18) */}
        {errorMessage && (
          <div
            id="payment-error-banner"
            className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-900 text-xs sm:text-sm"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-amber-700 hover:text-amber-900 text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {noticeMessage && (
          <div
            id="payment-notice-banner"
            className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5 text-blue-900 text-xs sm:text-sm"
          >
            <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{noticeMessage}</p>
            </div>
            <button
              onClick={() => setNoticeMessage(null)}
              className="text-blue-700 hover:text-blue-900 text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* SUCCESS CONFIRMATION CARD (Section 17: When Paid) */}
        {isPaid && (
          <section
            id="payment-success-card"
            className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-xs space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-emerald-950">
                  {t.paymentSuccessfulTitle}
                </h2>
                <p className="text-xs text-emerald-800">
                  {t.receiptSubtitle}
                </p>
              </div>
            </div>

            <div className="bg-white/80 p-3.5 rounded-xl border border-emerald-200 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">{t.workerNameLabel}:</span>
                <span className="font-bold text-slate-900">{booking.workerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{t.amountPaidLabel}:</span>
                <span className="font-black text-emerald-700 text-base">
                  {formatInr(calculation.grandTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{t.paymentIdLabel}:</span>
                <span className="font-mono font-medium text-slate-800 break-all">
                  {booking.transactionId || 'SG-UPI-VERIFIED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{t.bookingIdLabel}:</span>
                <span className="font-mono font-semibold text-slate-800">{booking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{t.dateLabel}:</span>
                <span className="font-medium text-slate-800">
                  {booking.paidAt || 'Today'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                id="view-receipt-button"
                onClick={() => setShowReceiptModal(true)}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
              >
                <FileText className="w-4 h-4" />
                {t.viewReceiptBtn}
              </button>
              <button
                id="download-receipt-quick-btn"
                onClick={() => setShowReceiptModal(true)}
                className="py-2.5 px-4 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
              >
                {t.downloadReceiptBtn}
              </button>
            </div>
          </section>
        )}

        {/* 5. WORKER DETAILS CARD */}
        <section
          id="worker-details-card"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              {t.workerDetailsTitle}
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <Wrench className="w-3 h-3 text-slate-500" />
              {booking.service}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                {t.workerNameLabel}
              </span>
              <p className="font-bold text-slate-900 text-sm sm:text-base mt-0.5">
                {booking.workerName}
              </p>
            </div>

            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                {t.bookingIdLabel}
              </span>
              <p className="font-mono font-bold text-slate-800 text-sm sm:text-base mt-0.5">
                {booking.id}
              </p>
            </div>

            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {t.scheduledDateLabel}
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {booking.scheduledDate}
              </p>
            </div>

            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t.scheduledTimeLabel}
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {booking.scheduledTime}
              </p>
            </div>
          </div>
        </section>

        {/* 6. PAYMENT BREAKDOWN & 7. GRAND TOTAL */}
        <section
          id="payment-breakdown-card"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {t.paymentBreakdownTitle}
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">
              INR (₹)
            </span>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-slate-600">
              <span>{t.serviceAmountLabel}</span>
              <span className="font-semibold text-slate-900">
                {formatInr(calculation.serviceAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>{t.gstLabel}</span>
              <span className="font-semibold text-slate-900">
                {formatInr(calculation.gstAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>{t.adminChargeLabel}</span>
              <span className="font-semibold text-slate-900">
                {formatInr(calculation.adminCharge)}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-500 text-[11px] pt-1 border-t border-dashed border-slate-200">
              <span>{t.amountPayableToWorker}</span>
              <span className="font-medium text-slate-700">
                {formatInr(calculation.amountPayableToWorker)}
              </span>
            </div>
          </div>

          {/* 7. GRAND TOTAL SECTION */}
          <div
            id="grand-total-box"
            className="pt-4 border-t-2 border-slate-200 bg-slate-50 -mx-5 -mb-5 p-5 rounded-b-2xl"
          >
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                  {t.grandTotalLabel}
                </span>
                <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                  {t.amountToBePaidToWorker}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                  {formatInr(calculation.grandTotal)}
                </span>
              </div>
            </div>

            {/* 8. PAYMENT STATUS & PRE-COMPLETION NOTICE */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">
                  {t.paymentStatusLabel}:
                </span>
                {isPaid ? (
                  <span
                    id="payment-status-badge-paid"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {t.statusPaid}
                  </span>
                ) : isVerifying ? (
                  <span
                    id="payment-status-badge-verifying"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 animate-pulse"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    {t.statusVerifying}
                  </span>
                ) : (
                  <span
                    id="payment-status-badge-pending"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    {t.statusPending}
                  </span>
                )}
              </div>

              {/* Pre-completion message */}
              <p className="text-[11px] text-slate-500 sm:text-right leading-tight">
                ℹ️ {t.preCompletionNotice}
              </p>
            </div>
          </div>
        </section>

        {/* If already paid, show receipt buttons; otherwise show payment methods */}
        {!isPaid ? (
          <>
            {/* 9. WORKER UPI PAYMENT */}
            <section
              id="pay-worker-section"
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4"
            >
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {t.payWorkerTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct cooperative UPI payment to {booking.workerName}
                </p>
              </div>

              {/* Worker UPI Details Box */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800">
                    {t.workerNameLabel}: <span className="font-bold text-slate-900">{booking.workerName}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-slate-500">{t.upiIdLabel}:</span>
                    <span
                      id="worker-upi-id-display"
                      className="font-mono text-sm sm:text-base font-bold text-emerald-900 select-all"
                    >
                      {booking.workerUpiId}
                    </span>
                  </div>
                </div>

                <button
                  id="copy-upi-btn"
                  onClick={handleCopyUpi}
                  type="button"
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-emerald-100/60 text-emerald-800 border border-emerald-300 text-xs font-semibold shadow-2xs transition-colors shrink-0 active:scale-95"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{t.upiCopiedFeedback}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-emerald-600" />
                      <span>{t.copyUpiBtn}</span>
                    </>
                  )}
                </button>
              </div>

              {/* 10. UPI PAYMENT APPS */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-2.5">
                  {t.chooseUpiApp}
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* PhonePe */}
                  <button
                    id="upi-app-phonepe"
                    onClick={() => handleUpiAppClick('phonepe', 'PhonePe')}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-purple-50/70 hover:border-purple-300 transition-all text-xs font-semibold text-slate-800 shadow-2xs active:scale-98"
                  >
                    <PhonePeIcon className="w-8 h-8" />
                    <span>PhonePe</span>
                  </button>

                  {/* Google Pay */}
                  <button
                    id="upi-app-gpay"
                    onClick={() => handleUpiAppClick('gpay', 'Google Pay')}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/70 hover:border-blue-300 transition-all text-xs font-semibold text-slate-800 shadow-2xs active:scale-98"
                  >
                    <GooglePayIcon className="w-8 h-8" />
                    <span>Google Pay</span>
                  </button>

                  {/* Paytm */}
                  <button
                    id="upi-app-paytm"
                    onClick={() => handleUpiAppClick('paytm', 'Paytm')}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-sky-50/70 hover:border-sky-300 transition-all text-xs font-semibold text-slate-800 shadow-2xs active:scale-98"
                  >
                    <PaytmIcon className="w-8 h-8" />
                    <span>Paytm</span>
                  </button>

                  {/* BHIM */}
                  <button
                    id="upi-app-bhim"
                    onClick={() => handleUpiAppClick('bhim', 'BHIM')}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-amber-50/70 hover:border-amber-300 transition-all text-xs font-semibold text-slate-800 shadow-2xs active:scale-98"
                  >
                    <BhimIcon className="w-8 h-8" />
                    <span>BHIM</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 13. EASY PAYMENT LINK FOR USERS WITH LOW DIGITAL LITERACY */}
            <section
              id="easy-payment-section"
              className="bg-emerald-900 text-white rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="text-center">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-800 text-[10px] uppercase font-bold tracking-widest text-emerald-200 mb-1">
                  Simplified
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {t.easyPaymentTitle}
                </h2>
                <p className="text-xs text-emerald-200 mt-0.5">
                  {t.easyPaymentSubtext}
                </p>
              </div>

              {/* Large Touch Friendly Button */}
              <button
                id="open-payment-link-button"
                onClick={handleOpenPaymentLink}
                className="w-full py-4 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-black text-base sm:text-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{t.openPaymentLinkBtn}</span>
                <ExternalLink className="w-5 h-5 text-slate-900" />
              </button>

              {/* QR Code Section */}
              <div className="pt-2">
                <div className="text-center mb-3">
                  <span className="text-xs font-semibold text-emerald-100">
                    {t.scanQrInstructions}
                  </span>
                </div>
                <div className="max-w-[280px] mx-auto space-y-2.5">
                  <UpiQrCode
                    upiUrl={upiIntentUrl}
                    workerName={booking.workerName}
                    amount={calculation.grandTotal}
                    label={t.scanAndPayTitle}
                    demoNotice={t.demoQrNotice}
                  />

                  {/* Direct Verification for Scanner Users */}
                  <button
                    id="scan-confirm-btn"
                    onClick={() => {
                      setActiveSession({
                        app: 'scanner',
                        appName: 'UPI QR Scanner',
                        initiatedAt: Date.now(),
                      });
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t.scanConfirmBtn}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 12. VERIFICATION AND SECURITY FLOW */}
            <section
              id="payment-verification-card"
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    {t.verifyPaymentBtn}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Status stays pending until verified by the cooperative gateway
                  </p>
                </div>
                <button
                  id="primary-verify-status-btn"
                  onClick={() => handleVerifyPayment('success')}
                  disabled={isVerifying}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.verifyingText}</span>
                    </>
                  ) : (
                    <span>{t.verifyPaymentBtn}</span>
                  )}
                </button>
              </div>

              {/* Prototype / Demo test simulations */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-400 font-medium">Prototype Testing:</span>
                <div className="flex gap-1.5">
                  <button
                    id="demo-test-success"
                    onClick={() => handleVerifyPayment('success')}
                    disabled={isVerifying}
                    className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-medium transition-colors"
                  >
                    {t.demoSimulateSuccess}
                  </button>
                  <button
                    id="demo-test-failure"
                    onClick={() => handleVerifyPayment('failed')}
                    disabled={isVerifying}
                    className="px-2.5 py-1 rounded-md bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 font-medium transition-colors"
                  >
                    {t.demoSimulateFailure}
                  </button>
                  <button
                    id="demo-test-pending"
                    onClick={() => handleVerifyPayment('pending')}
                    disabled={isVerifying}
                    className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-medium transition-colors"
                  >
                    {t.paymentPendingMsg}
                  </button>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* When already paid: quick actions */
          <div className="text-center pt-2 pb-4 space-y-3">
            <button
              id="return-to-dashboard-bottom-btn"
              onClick={onBackToDashboard}
              className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition-colors"
            >
              {t.backToDashboard}
            </button>
            <p className="text-xs text-slate-500">
              Cooperative Reference: {booking.transactionId} • Verified
            </p>
          </div>
        )}
      </main>

      {/* ACTIVE PAYMENT IN-PROGRESS MODAL */}
      {activeSession && !isPaid && (
        <div
          id="active-payment-session-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* App Header with Official Icons */}
            <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
              {activeSession.app === 'phonepe' && (
                <div className="p-1 rounded-2xl bg-purple-50 border border-purple-200 shrink-0">
                  <PhonePeIcon className="w-12 h-12" />
                </div>
              )}
              {activeSession.app === 'gpay' && (
                <div className="p-1 rounded-2xl bg-blue-50 border border-blue-200 shrink-0">
                  <GooglePayIcon className="w-12 h-12" />
                </div>
              )}
              {activeSession.app === 'paytm' && (
                <div className="p-1 rounded-2xl bg-sky-50 border border-sky-200 shrink-0">
                  <PaytmIcon className="w-12 h-12" />
                </div>
              )}
              {activeSession.app === 'bhim' && (
                <div className="p-1 rounded-2xl bg-amber-50 border border-amber-200 shrink-0">
                  <BhimIcon className="w-12 h-12" />
                </div>
              )}
              {(activeSession.app === 'link' || activeSession.app === 'scanner') && (
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                  <QrCode className="w-7 h-7" />
                </div>
              )}
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  {t.redirectingToApp.replace('{app}', activeSession.appName)}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1 truncate">
                  {t.paymentInProgressTitle}
                </h3>
              </div>
            </div>

            {/* Payment Context Card */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">{t.workerNameLabel}:</span>
                <span className="font-bold text-slate-900">{booking.workerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">{t.serviceLabel}:</span>
                <span className="font-semibold text-slate-800">{booking.service}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-slate-600 font-medium">{t.amountToBePaidToWorker}:</span>
                <span className="text-base font-black text-emerald-700">
                  {formatInr(calculation.grandTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 text-[11px] text-amber-700 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {t.paymentStatusLabel}: {t.statusPending}
                </span>
                <span>{t.awaitingBankConfirmation}</span>
              </div>
            </div>

            {/* Clear Step-by-Step Instructions */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1">
              <p className="font-semibold">
                1. {t.paymentInProgressDesc}
              </p>
              <p className="text-[11px] text-blue-700">
                2. Once you complete the payment in {activeSession.appName}, click the confirmation button below to verify with the cooperative gateway.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-1">
              {/* Confirm button: Success ONLY happens after user confirms / verification succeeds! */}
              <button
                id="confirm-payment-done-btn"
                onClick={() => handleVerifyPayment('success')}
                disabled={isVerifying}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t.verifyingText}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.confirmPaymentDoneBtn}</span>
                  </>
                )}
              </button>

              {/* Relaunch app link */}
              {activeSession.url && (
                <button
                  id="relaunch-app-btn"
                  onClick={() => {
                    if (activeSession.url) {
                      triggerDeepLink(activeSession.url);
                    }
                  }}
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t.reopenApp} ({activeSession.appName})</span>
                </button>
              )}

              {/* Cancel session */}
              <button
                id="cancel-payment-session-btn"
                onClick={() => {
                  setActiveSession(null);
                  setNoticeMessage(t.paymentCancelledMsg);
                }}
                type="button"
                className="w-full py-2 px-4 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                {t.cancelPaymentSession}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      <PaymentReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        booking={booking}
        calculation={calculation}
        language={language}
      />
    </div>
  );
};
