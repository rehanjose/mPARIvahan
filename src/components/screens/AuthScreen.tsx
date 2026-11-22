import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  ScanFace,
  KeyRound,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { BrandLogo } from '../BrandLogo';
import { DIRECTORY_ACCOUNTS, INDIAN_STATES } from '../../data/mockData';
import { AuthScreenStep, SavedAccount } from '../../types';
import {
  isValidIndianMobile,
  isValidMpin,
  maskPhoneNumber,
  requiresDeviceOtp,
  validateSignupMpin,
} from '../../utils/appLogic';
import { hapticSuccess, hapticTap, hapticWarning } from '../../utils/haptics';

interface AuthScreenProps {
  initialStep: AuthScreenStep;
  savedAccounts: SavedAccount[];
  registeredDirectory: SavedAccount[];
  onLoginSuccess: (account: SavedAccount, saveToDevice: boolean) => void;
  onAccountCreated: (account: SavedAccount) => void;
  onShowToast: (text: string, tone?: 'success' | 'info' | 'warning') => void;
}

export function AuthScreen({
  initialStep,
  savedAccounts,
  registeredDirectory,
  onLoginSuccess,
  onAccountCreated,
  onShowToast,
}: AuthScreenProps) {
  const [step, setStep] = useState<AuthScreenStep>(initialStep);

  // Sync step when scenario switcher resets flow
  useEffect(() => {
    setStep(initialStep);
    setSuccessModal(null);
    setFormError('');
    setMpinInput('');
    setOtpInput('');
  }, [initialStep]);

  // Selected saved account (Flow 5)
  const [selectedSavedAccount, setSelectedSavedAccount] = useState<SavedAccount | null>(
    savedAccounts[savedAccounts.length - 1] ?? null
  );

  // Manual Sign In fields (Flows 1, 2, 3, 4)
  const [mobileInput, setMobileInput] = useState('');
  const [mpinInput, setMpinInput] = useState('');
  const [showMpin, setShowMpin] = useState(false);

  // Track a mobile number that JUST completed signup OTP so Flow 1 & Flow 4 sign-in goes straight to Home
  const [justVerifiedSignupMobile, setJustVerifiedSignupMobile] = useState<string | null>(null);

  // Sign Up fields (Flows 1 & 4)
  const [signupState, setSignupState] = useState('Kerala');
  const [signupName, setSignupName] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupMpin, setSignupMpin] = useState('');
  const [signupConfirmMpin, setSignupConfirmMpin] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [pendingAccount, setPendingAccount] = useState<SavedAccount | null>(null);

  // OTP state (Flows 1, 2, 3, 4)
  const [otpInput, setOtpInput] = useState('');
  const [otpTimer, setOtpTimer] = useState(29);

  // Success Overlay Modal (Screens 06, 11, 15 in Figma)
  const [successModal, setSuccessModal] = useState<{
    kind: 'signup-otp' | 'signin-otp' | 'saved-mpin';
    account: SavedAccount;
  } | null>(null);

  // Forgot MPIN
  const [resetMobile, setResetMobile] = useState('8075286102');

  const [formError, setFormError] = useState('');

  // Live OTP countdown timer (29 sec -> 0)
  useEffect(() => {
    if (step !== 'otp-signup' && step !== 'otp-signin') return;
    if (successModal) return;
    if (otpTimer <= 0) return;
    const id = window.setInterval(() => {
      setOtpTimer((t) => Math.max(0, t - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [step, otpTimer, successModal]);

  const resolveAccountForMobile = (digits: string): SavedAccount => {
    const clean = digits.replace(/\D/g, '').slice(-10);
    const inSaved = savedAccounts.find((a) => a.mobileDigits === clean);
    if (inSaved) return inSaved;
    const inDir = [...registeredDirectory, ...DIRECTORY_ACCOUNTS].find(
      (a) => a.mobileDigits === clean
    );
    if (inDir) return inDir;

    // Synthesize a clean account if user enters a custom mobile number
    return {
      id: `acc-${clean}`,
      name: clean === '8075286102' ? 'Rehan Jose' : 'Citizen User',
      phone: `+91 ${clean}`,
      mobileDigits: clean,
      email: `citizen.${clean.slice(-4)}@parivahan.gov.in`,
      state: 'Kerala',
      initials: clean === '8075286102' ? 'RJ' : 'CU',
      dlNumber: 'KL42 20220005784',
      rto: 'Ernakulam (KL-42)',
      dob: '09-Dec-2003',
      bloodGroup: 'O+',
      address: 'Ernakulam, Kerala - 682024',
      mpin: mpinInput || '123456',
      verified: true,
    };
  };

  // Screen 01 -> Sign In to Continue
  const handleWelcomeSignIn = () => {
    hapticTap();
    setFormError('');
    setMpinInput('');
    if (savedAccounts.length > 0) {
      setStep('saved-accounts');
    } else {
      setMobileInput('');
      setStep('signin-manual');
    }
  };

  // Screen 01 -> Create an Account
  const handleWelcomeSignUp = () => {
    hapticTap();
    setFormError('');
    setSignupName('');
    setSignupMobile('');
    setSignupMpin('');
    setSignupConfirmMpin('');
    setSignupEmail('');
    setStep('signup');
  };

  // Fill Rehan demo details on Sign Up (Screen 03 in Figma)
  const handleFillRehanDemo = () => {
    setSignupState('Kerala');
    setSignupName('Rehan Jose');
    setSignupMobile('8075286102');
    setSignupMpin('123456');
    setSignupConfirmMpin('123456');
    setSignupEmail('rehan.jose@example.com');
    setFormError('');
  };

  // Submit Sign Up -> Screen 05 (Sign up mobile OTP)
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim()) {
      hapticWarning();
      setFormError('Enter your Full Name as per RC or DL.');
      return;
    }
    if (!isValidIndianMobile(signupMobile)) {
      hapticWarning();
      setFormError('Enter a valid 10-digit Mobile No.');
      return;
    }
    const mpinErr = validateSignupMpin(signupMpin, signupConfirmMpin);
    if (mpinErr) {
      hapticWarning();
      setFormError(mpinErr);
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      hapticWarning();
      setFormError('Enter a valid Email Id.');
      return;
    }
    hapticTap();

    const cleanDigits = signupMobile.replace(/\D/g, '').slice(-10);
    const trimmedName = signupName.trim();
    const parts = trimmedName.split(/\s+/);
    const initials = (
      (parts[0]?.[0] ?? 'U') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '')
    ).toUpperCase();

    const matchedKnown = DIRECTORY_ACCOUNTS.find((a) => a.mobileDigits === cleanDigits);
    const newAccount: SavedAccount = matchedKnown
      ? {
          ...matchedKnown,
          name: trimmedName,
          email: signupEmail.trim(),
          state: signupState,
          mpin: signupMpin,
        }
      : {
          id: `acc-${Date.now()}`,
          name: trimmedName,
          phone: `+91 ${cleanDigits}`,
          mobileDigits: cleanDigits,
          email: signupEmail.trim(),
          state: signupState,
          initials,
          dlNumber: 'KL42 20220005784',
          rto: `${signupState === 'Kerala' ? 'Ernakulam (KL-42)' : signupState}`,
          dob: '09-Dec-2003',
          bloodGroup: 'O+',
          address: `${signupState}, India`,
          mpin: signupMpin,
          verified: true,
        };

    setPendingAccount(newAccount);
    setOtpInput('');
    setOtpTimer(29);
    setFormError('');
    setStep('otp-signup');
  };

  // Manual Sign In Submit (Screen 09)
  const handleManualSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidIndianMobile(mobileInput)) {
      hapticWarning();
      setFormError('Please enter a valid 10-digit Mobile No.');
      return;
    }
    if (!isValidMpin(mpinInput)) {
      hapticWarning();
      setFormError('Please enter your 6-digit security MPIN.');
      return;
    }
    setFormError('');
    const digits = mobileInput.replace(/\D/g, '').slice(-10);
    const resolved = resolveAccountForMobile(digits);

    // If user just completed Signup OTP for this number (Flow 1 & Flow 4), log straight into Homepage!
    if (justVerifiedSignupMobile === digits) {
      hapticSuccess();
      setJustVerifiedSignupMobile(null);
      onLoginSuccess(resolved, true);
      return;
    }

    // If account is NOT saved on this device (Flow 2 & Flow 3), require OTP verification first
    if (requiresDeviceOtp(digits, savedAccounts)) {
      hapticTap();
      setPendingAccount(resolved);
      setOtpInput('');
      setOtpTimer(29);
      setStep('otp-signin');
      return;
    }

    // Already saved on device -> Show Screen 15 Success Modal
    hapticSuccess();
    setSuccessModal({ kind: 'saved-mpin', account: resolved });
  };

  // Saved Account MPIN Submit (Screen 14 -> Screen 15, Flow 5)
  const handleSavedMpinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSavedAccount) return;
    if (!isValidMpin(mpinInput)) {
      hapticWarning();
      setFormError('Enter your 6-digit security MPIN (any 6 digits).');
      return;
    }
    setFormError('');
    hapticSuccess();
    setSuccessModal({ kind: 'saved-mpin', account: selectedSavedAccount });
  };

  // Saved Account Face ID (Screen 14 -> Screen 15, Flow 5)
  const handleSavedFaceId = () => {
    if (!selectedSavedAccount) return;
    setFormError('');
    hapticSuccess();
    setSuccessModal({ kind: 'saved-mpin', account: selectedSavedAccount });
  };

  // Verify OTP (Screens 05 -> 06 or 05 -> 11)
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.replace(/\D/g, '').length !== 6) {
      hapticWarning();
      setFormError('Enter a 6-digit OTP (any 6 digits) to verify.');
      return;
    }
    if (!pendingAccount) return;
    setFormError('');
    hapticSuccess();

    if (step === 'otp-signup') {
      onAccountCreated(pendingAccount);
      setJustVerifiedSignupMobile(pendingAccount.mobileDigits);
      setSuccessModal({ kind: 'signup-otp', account: pendingAccount });
    } else {
      setSuccessModal({ kind: 'signin-otp', account: pendingAccount });
    }
  };

  // Continue button inside Success Modal (Screens 06, 11, 15)
  const handleSuccessModalContinue = () => {
    if (!successModal) return;
    hapticTap();
    const { kind, account } = successModal;
    setSuccessModal(null);

    if (kind === 'signup-otp') {
      // Flow 1: 0 saved accounts -> goes straight to 09 Sign In (pre-filled with newly created mobile)
      // Flow 4: existing saved account(s) -> shows Saved Accounts screen so user can tap "Sign in to different account" (or directly sign in)
      setMobileInput(account.mobileDigits);
      setMpinInput('');
      if (savedAccounts.length > 0) {
        setStep('saved-accounts');
      } else {
        setStep('signin-manual');
      }
      return;
    }

    // Screen 11 (Sign in OTP Success) or Screen 15 (Saved MPIN Success) -> Homepage!
    onLoginSuccess(account, true);
  };

  const renderAuthHeader = (showBack: boolean, onBack?: () => void) => (
    <div className="px-5 pt-2 pb-3 flex items-center justify-between shrink-0">
      {showBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F2F4F7] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      ) : (
        <div className="w-9" />
      )}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <BrandLogo size="sm" showText={false} />
          <span className="text-[16px] font-extrabold tracking-tight text-[#111827]">
            NextGen mParivahan
          </span>
        </div>
        <span className="text-[10.5px] text-[#667085] mt-0.5">
          One stop transport solution for citizen
        </span>
      </div>
      <div className="w-9" />
    </div>
  );

  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
      {/* ================= 01 · WELCOME ================= */}
      {step === 'welcome' && (
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-8">
          {renderAuthHeader(false)}

          <div className="px-6 flex-1 flex flex-col items-center text-center justify-center">
            {/* Clean Figma-style Mobility Illustration */}
            <div className="w-[216px] h-[168px] rounded-[28px] bg-[#EBF5FF] flex items-center justify-center relative overflow-hidden mb-7">
              <svg viewBox="0 0 220 170" className="w-full h-full" aria-hidden="true">
                <circle cx="110" cy="88" r="64" fill="#DBEAFE" />
                {/* Smartphone body */}
                <rect x="74" y="24" width="68" height="114" rx="14" fill="#FFFFFF" stroke="#0095F6" strokeWidth="3" />
                <rect x="96" y="31" width="24" height="4" rx="2" fill="#CBD5E1" />
                {/* Mini Virtual Card inside phone */}
                <rect x="84" y="45" width="48" height="28" rx="6" fill="#EBF5FF" stroke="#93C5FD" strokeWidth="1.5" />
                <rect x="90" y="52" width="14" height="14" rx="3" fill="#0095F6" />
                <rect x="108" y="53" width="18" height="3.5" rx="1.5" fill="#1E293B" />
                <rect x="108" y="60" width="13" height="3" rx="1.5" fill="#64748B" />
                {/* Green Verified Shield */}
                <circle cx="144" cy="48" r="15" fill="#16A34A" />
                <path d="M138 48L142 52L150 44" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                {/* Car silhouette overlapping bottom */}
                <path d="M44 124L56 101C58.5 96 63.5 93 69 93H114C119.5 93 124.5 96 127 101L139 124H44Z" fill="#0095F6" />
                <rect x="34" y="119" width="114" height="24" rx="9" fill="#0284C7" />
                <path d="M60 116L68 100H114L122 116H60Z" fill="#EBF5FF" />
                <circle cx="58" cy="143" r="10" fill="#111827" stroke="#FFFFFF" strokeWidth="3" />
                <circle cx="124" cy="143" r="10" fill="#111827" stroke="#FFFFFF" strokeWidth="3" />
              </svg>
            </div>

            <h1 className="text-[26px] font-extrabold tracking-tight text-[#111827] leading-tight">
              Welcome to
              <br />
              mParivahan
            </h1>
            <p className="mt-3 text-[13px] text-[#667085] leading-relaxed max-w-[300px]">
              Access your vehicle documents, track services, and manage your profile in one place. Sign in to continue or create an account to get started.
            </p>

            <div className="mt-8 w-full space-y-3">
              <button
                type="button"
                onClick={handleWelcomeSignIn}
                className="w-full h-12 rounded-2xl bg-[#0095F6] hover:bg-[#0082D6] text-white font-bold text-[14.5px] shadow-[0_6px_16px_rgba(0,149,246,0.28)] transition-colors cursor-pointer"
              >
                Sign In to Continue
              </button>

              <button
                type="button"
                onClick={handleWelcomeSignUp}
                className="w-full h-12 rounded-2xl bg-white border border-[#0095F6] hover:bg-[#EBF5FF] text-[#0095F6] font-bold text-[14px] transition-colors cursor-pointer"
              >
                New here? Create an Account
              </button>
            </div>
          </div>

          <p className="pt-4 text-center font-mono-code text-[11px] text-[#94A3B8]">
            App Version 5.0.63
          </p>
        </div>
      )}

      {/* ================= 12 / 13 · SAVED ACCOUNTS ON THIS DEVICE ================= */}
      {step === 'saved-accounts' && (
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-8">
          {renderAuthHeader(true, () => setStep('welcome'))}

          <div className="px-5 pt-2 flex-1 flex flex-col">
            <h1 className="text-[24px] font-extrabold tracking-tight text-[#111827] leading-tight">
              Sign in to
              <br />
              Your Account !
            </h1>
            <p className="mt-4 mb-2.5 text-[12.5px] font-semibold text-[#667085]">
              Saved Accounts on this device
            </p>

            <div className="space-y-2.5">
              {savedAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    setSelectedSavedAccount(acc);
                    setMpinInput('');
                    setFormError('');
                    setStep('signin-saved-mpin');
                  }}
                  className="w-full text-left rounded-2xl border border-[#E2E8F0] hover:border-[#0095F6] bg-white p-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] flex items-center gap-3 transition-all cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-full bg-[#EBF5FF] text-[#0095F6] font-extrabold text-[14px] flex items-center justify-center shrink-0">
                    {acc.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[14.5px] font-bold text-[#111827] truncate">
                        {acc.name}
                      </p>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="font-mono-code text-[12px] text-[#667085]">
                        {maskPhoneNumber(acc.phone)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#16A34A] text-[10px] font-bold">
                        Verified ✓
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] shrink-0" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                hapticTap();
                setFormError('');
                setMpinInput('');
                setStep('signin-manual');
              }}
              className="mt-5 w-full h-12 rounded-2xl bg-[#0095F6] hover:bg-[#0082D6] text-white font-bold text-[14px] shadow-[0_6px_16px_rgba(0,149,246,0.24)] transition-colors cursor-pointer"
            >
              Sign in to different account
            </button>

            <p className="mt-5 text-center text-[13px] text-[#667085]">
              Don&apos;t have an account ?{' '}
              <button
                type="button"
                onClick={handleWelcomeSignUp}
                className="font-bold text-[#0095F6] hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>

            <p className="mt-auto pt-6 text-center font-mono-code text-[11px] text-[#94A3B8]">
              App Version 5.0.63
            </p>
          </div>
        </div>
      )}

      {/* ================= 09 · SIGN IN (MANUAL MOBILE + MPIN) ================= */}
      {step === 'signin-manual' && (
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-8">
          {renderAuthHeader(true, () =>
            setStep(savedAccounts.length > 0 ? 'saved-accounts' : 'welcome')
          )}

          <form onSubmit={handleManualSignInSubmit} className="px-5 pt-2 flex-1 flex flex-col">
            <h1 className="text-[24px] font-extrabold tracking-tight text-[#111827] leading-tight">
              Sign in to
              <br />
              Your Account !
            </h1>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="signin-mobile"
                    className="text-[12.5px] font-semibold text-[#111827]"
                  >
                    Mobile No.
                  </label>
                  {!mobileInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileInput('8075286102');
                        setFormError('');
                      }}
                      className="text-[11.5px] font-semibold text-[#0095F6] hover:underline cursor-pointer"
                    >
                      Use Rehan (8075286102)
                    </button>
                  )}
                </div>
                <input
                  id="signin-mobile"
                  type="tel"
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  value={mobileInput}
                  onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-12 px-4 rounded-xl bg-[#F2F4F7] font-mono-code text-[14.5px] text-[#111827] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                />
              </div>

              <div>
                <label
                  htmlFor="signin-mpin"
                  className="block text-[12.5px] font-semibold text-[#111827] mb-1.5"
                >
                  6 digit security MPIN
                </label>
                <div className="relative">
                  <input
                    id="signin-mpin"
                    type={showMpin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit MPIN"
                    value={mpinInput}
                    onChange={(e) => setMpinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-12 px-4 pr-11 rounded-xl bg-[#F2F4F7] font-mono-code text-[15px] tracking-[0.2em] text-[#111827] placeholder:tracking-normal placeholder:text-[13.5px] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMpin((v) => !v)}
                    aria-label={showMpin ? 'Hide MPIN' : 'Show MPIN'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] cursor-pointer"
                  >
                    {showMpin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[12px]">
              <button
                type="button"
                onClick={() => {
                  if (savedAccounts.length > 0) {
                    setStep('saved-accounts');
                  } else {
                    setMobileInput('');
                    setMpinInput('');
                  }
                }}
                className="font-semibold text-[#0095F6] hover:underline cursor-pointer"
              >
                Use another account
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetMobile(mobileInput || '8075286102');
                  setStep('forgot-mpin');
                }}
                className="font-semibold text-[#667085] hover:text-[#111827] cursor-pointer"
              >
                Forgot security MPIN
              </button>
            </div>

            {formError && (
              <p className="mt-3 text-[12.5px] font-medium text-[#E31E24]">{formError}</p>
            )}

            <button
              type="submit"
              className="mt-6 w-full h-12 rounded-2xl bg-[#0095F6] hover:bg-[#0082D6] text-white font-bold text-[14.5px] shadow-[0_6px_16px_rgba(0,149,246,0.28)] transition-colors cursor-pointer"
            >
              Sign in with MPIN
            </button>

            <p className="mt-5 text-center text-[13px] text-[#667085]">
              Don&apos;t have an account ?{' '}
              <button
                type="button"
                onClick={handleWelcomeSignUp}
                className="font-bold text-[#0095F6] hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>

            <p className="mt-auto pt-6 text-center font-mono-code text-[11px] text-[#94A3B8]">
              App Version 5.0.63
            </p>
          </form>
        </div>
      )}

      {/* ================= 14 · SAVED ACCOUNT MPIN + FACE ID (FLOW 5) ================= */}
      {step === 'signin-saved-mpin' && selectedSavedAccount && (
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-8">
          {renderAuthHeader(true, () => setStep('saved-accounts'))}

          <form onSubmit={handleSavedMpinSubmit} className="px-5 pt-2 flex-1 flex flex-col">
            <h1 className="text-[24px] font-extrabold tracking-tight text-[#111827] leading-tight">
              Sign in to
              <br />
              Your Account !
            </h1>

            {/* Saved Account Banner */}
            <div className="mt-4 rounded-2xl bg-[#EBF5FF] border border-[#BFDBFE] px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0095F6] text-white font-extrabold text-[13.5px] flex items-center justify-center shrink-0">
                {selectedSavedAccount.initials}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-extrabold text-[#111827] truncate">
                  Welcome {selectedSavedAccount.name}
                </p>
                <p className="font-mono-code text-[11.5px] text-[#0369A1]">
                  Saved account {maskPhoneNumber(selectedSavedAccount.phone)}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="saved-mobile"
                  className="block text-[12px] font-semibold text-[#667085] mb-1"
                >
                  Mobile No.
                </label>
                <input
                  id="saved-mobile"
                  type="text"
                  readOnly
                  value={selectedSavedAccount.mobileDigits}
                  className="w-full h-11 px-4 rounded-xl bg-[#F2F4F7] font-mono-code text-[14.5px] font-semibold text-[#475569] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="saved-mpin"
                  className="block text-[12.5px] font-semibold text-[#111827] mb-1.5"
                >
                  6 digit security MPIN
                </label>
                <div className="relative">
                  <input
                    id="saved-mpin"
                    type={showMpin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit MPIN"
                    value={mpinInput}
                    onChange={(e) => setMpinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-12 px-4 pr-11 rounded-xl bg-[#F2F4F7] font-mono-code text-[15px] tracking-[0.2em] text-[#111827] placeholder:tracking-normal placeholder:text-[13.5px] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMpin((v) => !v)}
                    aria-label={showMpin ? 'Hide MPIN' : 'Show MPIN'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] cursor-pointer"
                  >
                    {showMpin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[12px]">
              <button
                type="button"
                onClick={() => setStep('saved-accounts')}
                className="font-semibold text-[#0095F6] hover:underline cursor-pointer"
              >
                Use another account
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetMobile(selectedSavedAccount.mobileDigits);
                  setStep('forgot-mpin');
                }}
                className="font-semibold text-[#667085] hover:text-[#111827] cursor-pointer"
              >
                Forgot security MPIN
              </button>
            </div>

            {formError && (
              <p className="mt-3 text-[12.5px] font-medium text-[#E31E24]">{formError}</p>
            )}

            <div className="mt-5 space-y-2.5">
              <button
                type="submit"
                className="w-full h-12 rounded-2xl bg-[#0095F6] hover:bg-[#0082D6] text-white font-bold text-[14.5px] shadow-[0_6px_16px_rgba(0,149,246,0.28)] transition-colors cursor-pointer"
              >
                Sign in with MPIN
              </button>

              <button
                type="button"
                onClick={handleSavedFaceId}
                className="w-full h-12 rounded-2xl bg-white border border-[#0095F6] hover:bg-[#EBF5FF] text-[#0095F6] font-bold text-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ScanFace className="w-5 h-5" />
                <span>Login with Face ID</span>
              </button>
            </div>

            <p className="mt-5 text-center text-[13px] text-[#667085]">
              Don&apos;t have an account ?{' '}
              <button
                type="button"
                onClick={handleWelcomeSignUp}
                className="font-bold text-[#0095F6] hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>

            <p className="mt-auto pt-5 text-center font-mono-code text-[11px] text-[#94A3B8]">
              App Version 5.0.63
            </p>
          </form>
        </div>
      )}

      {/* ================= 02 / 03 · SIGN UP (FLOWS 1 & 4) ================= */}
      {step === 'signup' && (
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-8">
          {renderAuthHeader(true, () => setStep('welcome'))}

          <form onSubmit={handleSignUpSubmit} className="px-5 pt-1 flex-1 flex flex-col">
            <div className="flex items-end justify-between gap-2">
              <h1 className="text-[22px] font-extrabold tracking-tight text-[#111827] leading-tight">
                Creating account
                <br />
                is fast and easy!
              </h1>
              <button
                type="button"
                onClick={handleFillRehanDemo}
                className="px-2.5 py-1 rounded-full bg-[#EBF5FF] hover:bg-[#DBEAFE] text-[#0095F6] text-[11px] font-bold whitespace-nowrap cursor-pointer"
              >
                Fill Rehan Demo
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="su-state" className="block text-[11.5px] font-semibold text-[#667085] mb-1">
                  Select State
                </label>
                <select
                  id="su-state"
                  value={signupState}
                  onChange={(e) => setSignupState(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F2F4F7] text-[14px] font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="su-name" className="block text-[11.5px] font-semibold text-[#667085] mb-1">
                  Full Name (As per RC or DL)
                </label>
                <input
                  id="su-name"
                  type="text"
                  placeholder="Full Name (As per RC or DL)"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F2F4F7] text-[14px] text-[#111827] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                />
              </div>

              <div>
                <label htmlFor="su-mobile" className="block text-[11.5px] font-semibold text-[#667085] mb-1">
                  Mobile No.
                </label>
                <input
                  id="su-mobile"
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit Mobile No."
                  value={signupMobile}
                  onChange={(e) => setSignupMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F2F4F7] font-mono-code text-[14px] text-[#111827] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="su-mpin" className="block text-[11.5px] font-semibold text-[#667085] mb-1">
                    Set 6 digits security MPIN
                  </label>
                  <input
                    id="su-mpin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="••••••"
                    value={signupMpin}
                    onChange={(e) => setSignupMpin(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F2F4F7] font-mono-code text-[14px] tracking-widest text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                  />
                </div>
                <div>
                  <label htmlFor="su-confirm-mpin" className="block text-[11.5px] font-semibold text-[#667085] mb-1">
                    Confirm MPIN
                  </label>
                  <input
                    id="su-confirm-mpin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="••••••"
                    value={signupConfirmMpin}
                    onChange={(e) => setSignupConfirmMpin(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F2F4F7] font-mono-code text-[14px] tracking-widest text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="su-email" className="block text-[11.5px] font-semibold text-[#667085] mb-1">
                  Email Id
                </label>
                <input
                  id="su-email"
                  type="email"
                  placeholder="rehan.jose@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F2F4F7] text-[14px] text-[#111827] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                />
              </div>
            </div>

            {formError && (
              <p className="mt-2.5 text-[12px] font-medium text-[#E31E24]">{formError}</p>
            )}

            <button
              type="submit"
              className="mt-5 w-full h-12 rounded-2xl bg-[#0095F6] hover:bg-[#0082D6] text-white font-bold text-[14.5px] shadow-[0_6px_16px_rgba(0,149,246,0.28)] transition-colors cursor-pointer"
            >
              Submit
            </button>

            <p className="mt-4 text-center text-[13px] text-[#667085]">
              Already have an account ?{' '}
              <button
                type="button"
                onClick={handleWelcomeSignIn}
                className="font-bold text-[#0095F6] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </form>
        </div>
      )}

      {/* ================= 05 · VERIFY MOBILE NO. (OTP FOR SIGN UP & FIRST-TIME SIGN IN) ================= */}
      {(step === 'otp-signup' || step === 'otp-signin') && pendingAccount && (
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-8">
          {renderAuthHeader(true, () =>
            setStep(step === 'otp-signup' ? 'signup' : 'signin-manual')
          )}

          <form onSubmit={handleVerifyOtp} className="px-5 pt-3 flex-1 flex flex-col">
            <h1 className="text-[24px] font-extrabold tracking-tight text-[#111827] leading-tight">
              Verify
              <br />
              Mobile No.
            </h1>

            <p className="mt-3 text-[13.5px] text-[#667085] leading-relaxed">
              NextGen mParivahan has sent you an OTP to your Mobile No.{' '}
              <span className="font-mono-code font-bold text-[#111827]">
                {maskPhoneNumber(pendingAccount.phone)}
              </span>
            </p>

            <div className="mt-6">
              <label htmlFor="otp-code" className="block text-[12.5px] font-semibold text-[#111827] mb-1.5">
                Enter OTP
              </label>
              <input
                id="otp-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                className="w-full h-12 px-4 rounded-xl bg-[#F2F4F7] font-mono-code text-[18px] tracking-[0.35em] text-center font-bold text-[#111827] placeholder:tracking-normal placeholder:text-[13.5px] placeholder:font-normal placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
              />
              <div className="mt-2.5 flex items-center justify-between text-[12px]">
                <span className="font-mono-code font-semibold text-[#667085]">
                  Time Remaining : {otpTimer} sec
                </span>
                <button
                  type="button"
                  disabled={otpTimer > 0}
                  onClick={() => {
                    setOtpTimer(29);
                    onShowToast('Fresh OTP resent to your mobile number', 'info');
                  }}
                  className={`font-bold ${
                    otpTimer === 0
                      ? 'text-[#0095F6] hover:underline cursor-pointer'
                      : 'text-[#CBD5E1] cursor-not-allowed'
                  }`}
                >
                  Resend OTP
                </button>
              </div>
            </div>

            {formError && (
              <p className="mt-3 text-[12.5px] font-medium text-[#E31E24]">{formError}</p>
            )}

            <button
              type="submit"
              className="mt-6 w-full h-12 rounded-2xl bg-[#0095F6] hover:bg-[#0082D6] text-white font-bold text-[14.5px] shadow-[0_6px_16px_rgba(0,149,246,0.28)] transition-colors cursor-pointer"
            >
              Verify
            </button>

            <p className="mt-4 text-center text-[12px] text-[#667085] leading-relaxed">
              Wait for some time for the OTP to arrive. Do not refresh or close
            </p>
          </form>
        </div>
      )}

      {/* ================= FORGOT SECURITY MPIN ================= */}
      {step === 'forgot-mpin' && (
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-8">
          {renderAuthHeader(true, () =>
            setStep(savedAccounts.length > 0 ? 'saved-accounts' : 'signin-manual')
          )}
          <div className="px-5 pt-3 flex-1 flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF5FF] text-[#0095F6] flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-[22px] font-extrabold text-[#111827]">
              Reset Security MPIN
            </h1>
            <p className="mt-1.5 text-[13px] text-[#667085]">
              Enter your registered mobile number to receive a reset OTP.
            </p>
            <div className="mt-5">
              <label htmlFor="reset-mob" className="block text-[12px] font-semibold text-[#111827] mb-1.5">
                Mobile No.
              </label>
              <input
                id="reset-mob"
                type="tel"
                maxLength={10}
                value={resetMobile}
                onChange={(e) => setResetMobile(e.target.value.replace(/\D/g, ''))}
                className="w-full h-12 px-4 rounded-xl bg-[#F2F4F7] font-mono-code text-[14.5px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                hapticSuccess();
                onShowToast('MPIN reset OTP sent. Enter any 6-digit MPIN to continue.', 'success');
                setMobileInput(resetMobile);
                setMpinInput('');
                setStep('signin-manual');
              }}
              className="mt-6 w-full h-12 rounded-2xl bg-[#0095F6] hover:bg-[#0082D6] text-white font-bold text-[14.5px] cursor-pointer"
            >
              Send Verification OTP
            </button>
          </div>
        </div>
      )}

      {/* ================= SUCCESSFUL MODAL OVERLAY (FIGMA SCREENS 06, 11, 15) ================= */}
      {successModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-[1px]" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Verification Successful"
            className="relative z-10 w-full max-w-[330px] rounded-[24px] bg-white p-6 text-center shadow-2xl"
          >
            <div className="mx-auto w-14 h-14 rounded-full bg-[#ECFDF5] text-[#16A34A] flex items-center justify-center ring-8 ring-[#ECFDF5]/60">
              <CheckCircle2 className="w-8 h-8" strokeWidth={2.4} />
            </div>

            <h2 className="mt-4 text-[20px] font-extrabold text-[#111827]">Successful</h2>

            <p className="mt-2 text-[13px] text-[#667085] leading-relaxed">
              {successModal.kind === 'signup-otp' &&
                'Mobile number verified successfully. Your account has been created. Please sign in to continue.'}
              {successModal.kind === 'signin-otp' &&
                'Mobile number verified successfully. You can now access your account.'}
              {successModal.kind === 'saved-mpin' &&
                `You have signed in successfully. Welcome back, ${successModal.account.name}.`}
            </p>

            <button
              type="button"
              onClick={handleSuccessModalContinue}
              className="mt-5 w-full h-11 rounded-xl bg-[#0095F6] hover:bg-[#0082D6] text-white font-bold text-[14px] transition-colors cursor-pointer"
            >
              {successModal.kind === 'signup-otp'
                ? 'Continue to Sign In'
                : 'Continue to Homepage'}
            </button>

            <div className="mt-3 flex items-center justify-center gap-1 text-[11px] text-[#16A34A] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified via NIC / MoRTH</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
