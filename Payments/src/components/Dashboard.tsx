import React from 'react';
import { BookingData, Language } from '../types';
import { translations } from '../translations';
import { SahakarGigLogo } from './UpiIcons';
import { formatInr } from '../utils/payment';
import {
  CreditCard,
  Wrench,
  Calendar,
  Clock,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  Sparkles,
  Globe,
  Check,
} from 'lucide-react';

interface DashboardProps {
  bookings: BookingData[];
  selectedBookingId: string;
  onSelectBooking: (id: string) => void;
  onOpenPayments: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  bookings,
  selectedBookingId,
  onSelectBooking,
  onOpenPayments,
  language,
  onLanguageChange,
}) => {
  const t = translations[language];
  const [langOpen, setLangOpen] = React.useState(false);

  const activeBooking =
    bookings.find((b) => b.id === selectedBookingId) || bookings[0];

  const categories = [
    { name: 'Plumber', nameTe: 'ప్లంబర్', nameHi: 'प्लंबर', icon: '🚰' },
    { name: 'Electrician', nameTe: 'ఎలక్ట్రీషియన్', nameHi: 'इलेक्ट्रीशियन', icon: '⚡' },
    { name: 'Carpenter', nameTe: 'కార్పెంటర్', nameHi: 'बढ़ई', icon: '🪚' },
    { name: 'Painter', nameTe: 'పెయింటర్', nameHi: 'पेंटर', icon: '🎨' },
    { name: 'Cleaner', nameTe: 'క్లీనర్', nameHi: 'सफाईकर्मी', icon: '🧹' },
    { name: 'Caregiver', nameTe: 'కేర్‌గివర్', nameHi: 'देखभालकर्ता', icon: '🤝' },
    { name: 'Driver', nameTe: 'డ్రైవర్', nameHi: 'ड्राइवर', icon: '🚗' },
    { name: 'Gardener', nameTe: 'గార్డెనర్', nameHi: 'माली', icon: '🌱' },
    { name: 'Technician', nameTe: 'టెక్నీషియన్', nameHi: 'तकनीशियन', icon: '🔧' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SahakarGigLogo />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Dashboard -> Payments Primary Nav Button */}
            <button
              id="dashboard-nav-payments-btn"
              onClick={onOpenPayments}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span>{t.payments}</span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                id="dash-language-button"
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
              >
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === 'en' ? 'English' : language === 'te' ? 'తెలుగు' : 'हिन्दी'}
                </span>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>

              {langOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                    <button
                      onClick={() => {
                        onLanguageChange('en');
                        setLangOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50"
                    >
                      <span>English</span>
                      {language === 'en' && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => {
                        onLanguageChange('te');
                        setLangOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50"
                    >
                      <span>తెలుగు</span>
                      {language === 'te' && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => {
                        onLanguageChange('hi');
                        setLangOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50"
                    >
                      <span>हिन्दी</span>
                      {language === 'hi' && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Cooperative Notice Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-700/60 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              {t.brandName} Cooperative
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold text-white">
              {language === 'te'
                ? 'మీ ఇంటి మరియు కమ్యూనిటీ సేవల కోసం నమ్మకమైన వేదిక'
                : language === 'hi'
                ? 'आपके घरेलू और सामुदायिक सेवाओं का विश्वसनीय मंच'
                : 'Cooperative Gig Platform for Community & Home Services'}
            </h1>
            <p className="text-xs text-emerald-200">
              {language === 'te'
                ? 'న్యాయమైన వేతనాలు, నమ్మకమైన నిపుణులు, పారదర్శక చెల్లింపులు.'
                : language === 'hi'
                ? 'उचित मूल्य, विश्वसनीय पेशेवर और पारदर्शी भुगतान।'
                : 'Fair rates for gig workers, transparent escrow payments for households.'}
            </p>
          </div>

          <button
            id="dash-banner-payments-action"
            onClick={onOpenPayments}
            className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>
              {language === 'te'
                ? 'చెల్లింపుల విభాగం →'
                : language === 'hi'
                ? 'भुगतान अनुभाग →'
                : 'Go to Payments →'}
            </span>
          </button>
        </div>

        {/* Active Booking Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              {language === 'te' ? 'క్రియాశీల బుకింగ్‌లు' : language === 'hi' ? 'सक्रिय बुकिंग' : 'Active Booking'}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Booking #{activeBooking.id}
            </span>
          </div>

          {/* Booking Card */}
          <div
            id={`booking-card-${activeBooking.id}`}
            className="bg-white rounded-2xl p-5 border-2 border-emerald-100 shadow-2xs hover:border-emerald-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl shrink-0">
                  {activeBooking.workerName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                      {activeBooking.workerName}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      <Wrench className="w-3 h-3 text-slate-500" />
                      {activeBooking.service}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    UPI: {activeBooking.workerUpiId}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {activeBooking.paymentStatus === 'paid' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {t.statusPaid}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    {t.statusPending}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 text-xs">
              <div>
                <span className="text-slate-400 block">{t.scheduledDateLabel}</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {activeBooking.scheduledDate}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">{t.scheduledTimeLabel}</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {activeBooking.scheduledTime}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-400 block">{t.grandTotalLabel}</span>
                <span className="font-black text-emerald-700 text-sm mt-0.5 block">
                  {formatInr(activeBooking.baseServiceAmount + Math.round(activeBooking.baseServiceAmount * activeBooking.gstRate) + activeBooking.adminFee)}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.preCompletionNotice}</span>
              </div>

              <div className="flex gap-2">
                <button
                  id="open-payment-page-btn"
                  onClick={() => {
                    onSelectBooking(activeBooking.id);
                    onOpenPayments();
                  }}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-1.5 ${
                    activeBooking.paymentStatus === 'paid'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {activeBooking.paymentStatus === 'paid'
                      ? t.viewReceiptBtn
                      : `${t.makePayment} (₹${(activeBooking.baseServiceAmount + Math.round(activeBooking.baseServiceAmount * activeBooking.gstRate) + activeBooking.adminFee).toLocaleString('en-IN')})`}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Cooperative Service Categories */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            {language === 'te'
              ? 'సహకార వర్గాలు'
              : language === 'hi'
              ? 'सहकारी सेवा श्रेणियां'
              : 'Cooperative Service Categories'}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-3">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-center flex flex-col items-center justify-center cursor-pointer"
              >
                <span className="text-2xl mb-1">{cat.icon}</span>
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {language === 'te' ? cat.nameTe : language === 'hi' ? cat.nameHi : cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Demo Switcher: To test multiple bookings dynamically */}
        <section className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">
              Demo Booking Selector (Dynamic Worker Data)
            </span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
              Prototype Mode
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {bookings.map((b) => (
              <button
                key={b.id}
                onClick={() => onSelectBooking(b.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  b.id === selectedBookingId
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {b.workerName} ({b.service}) • {b.id}
                <span className={`ml-1.5 text-[10px] font-bold ${b.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  [{b.paymentStatus.toUpperCase()}]
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
