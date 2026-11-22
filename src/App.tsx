/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { IPhoneFrame } from './components/IPhoneFrame';
import { BottomNav } from './components/BottomNav';
import { ToastBanner, ToastMessage } from './components/ToastBanner';
import { AuthScreen } from './components/screens/AuthScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { GarageScreen } from './components/screens/GarageScreen';
import { TransactionsScreen } from './components/screens/TransactionsScreen';
import { NearbyScreen } from './components/screens/NearbyScreen';
import { ScanQrScreen } from './components/screens/ScanQrScreen';
import { TransportServicesScreen } from './components/screens/TransportServicesScreen';
import { ChallanPaymentFlow } from './components/screens/ChallanPaymentFlow';
import { VirtualDocumentsScreen } from './components/screens/VirtualDocumentsScreen';
import { CitizenSentinelScreen } from './components/screens/CitizenSentinelScreen';
import { PmRahatScreen } from './components/screens/PmRahatScreen';
import { InformationalServicesScreen } from './components/screens/InformationalServicesScreen';
import { HamburgerDrawer } from './components/screens/HamburgerDrawer';
import {
  HelpScreen,
  ProfileScreen,
  SettingsScreen,
} from './components/screens/DrawerSubScreens';
import {
  NotificationsScreen,
  SosScreen,
  VehicleSearchResultScreen,
} from './components/screens/UtilityScreens';
import {
  ACCOUNT_MALAVIKA,
  ACCOUNT_REHAN,
  DIRECTORY_ACCOUNTS,
  EXTRA_LOOKUP_VEHICLE,
  getDrivingLicenceForAccount,
  INITIAL_CHALLANS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SENTINEL_REPORTS,
  INITIAL_TRANSACTIONS,
  INITIAL_VEHICLES,
  MALAVIKA_VEHICLES,
  SAVED_ACCOUNTS,
} from './data/mockData';
import {
  AuthScreenStep,
  ChallanRecord,
  LanguageCode,
  MainTab,
  NotificationItem,
  OnboardingFlowId,
  SavedAccount,
  ScreenRoute,
  SearchCategory,
  SentinelReport,
  TransactionRecord,
  TransportTab,
  VehicleRecord,
} from './types';
import {
  completeChallanPayment,
  consumeSearchQuota,
  countUnreadNotifications,
  createSentinelReport,
  findVehicleByQuery,
  markAllNotificationsRead,
  upsertSavedAccount,
} from './utils/appLogic';
import { hapticSuccess } from './utils/haptics';

function isAutostart(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('autostart') === '1';
}

export default function App() {
  const autostart = isAutostart();

  // Start on 01 · Welcome (or straight to Home when ?autostart=1)
  const [route, setRoute] = useState<ScreenRoute>(autostart ? 'home' : 'auth');
  const [authInitialStep, setAuthInitialStep] = useState<AuthScreenStep>('welcome');
  const [activeFlow, setActiveFlow] = useState<OnboardingFlowId>(
    autostart ? 'after-onboarding' : 'flow-5-both-saved'
  );
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('home');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Device Saved Accounts + Registered Directory (supports all 5 Figma flows)
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(SAVED_ACCOUNTS);
  const [registeredDirectory, setRegisteredDirectory] =
    useState<SavedAccount[]>(DIRECTORY_ACCOUNTS);
  const [currentAccount, setCurrentAccount] = useState<SavedAccount>(ACCOUNT_REHAN);
  const [selectedState, setSelectedState] = useState<string>('Kerala');
  const [language, setLanguage] = useState<LanguageCode>('English');

  // Core Domain State
  const [rehanVehicles, setRehanVehicles] = useState<VehicleRecord[]>(INITIAL_VEHICLES);
  const [malavikaVehicles, setMalavikaVehicles] = useState<VehicleRecord[]>(MALAVIKA_VEHICLES);
  const [challans, setChallans] = useState<ChallanRecord[]>(INITIAL_CHALLANS);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [sentinelReports, setSentinelReports] = useState<SentinelReport[]>(
    INITIAL_SENTINEL_REPORTS
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );
  const [searchQuota, setSearchQuota] = useState<number>(4);

  // Contextual Route Parameters
  const [transportInitialTab, setTransportInitialTab] = useState<TransportTab>('vehicle');
  const [transportInitialServiceId, setTransportInitialServiceId] = useState<string | null>(
    null
  );
  const [activeChallanId, setActiveChallanId] = useState<string>('#KL429905');
  const [virtualDocsMode, setVirtualDocsMode] = useState<'dl' | 'rc'>('dl');
  const [virtualDocsFlipped, setVirtualDocsFlipped] = useState<boolean>(false);
  const [nearbyInitialFilter, setNearbyInitialFilter] = useState<
    'All' | 'RTO Office' | 'PUC Center' | 'Hospitals (PM Rahat)' | 'Fuel & EV'
  >('All');
  const [lookupVehicle, setLookupVehicle] = useState<VehicleRecord>(INITIAL_VEHICLES[0]);

  // Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback(
    (text: string, tone: 'success' | 'info' | 'warning' = 'info') => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
      setToast({ id: Date.now(), text, tone });
      toastTimer.current = window.setTimeout(() => {
        setToast(null);
      }, 2500);
    },
    []
  );

  // Active account's vehicles & Driving Licence
  const activeVehicles =
    currentAccount.id === ACCOUNT_MALAVIKA.id ? malavikaVehicles : rehanVehicles;
  const activeDl = useMemo(
    () => getDrivingLicenceForAccount(currentAccount),
    [currentAccount]
  );

  // Launch any of the 5 Figma Onboarding Scenarios (or After Onboarding Home)
  const handleSelectFlow = (flow: OnboardingFlowId) => {
    setActiveFlow(flow);
    setDrawerOpen(false);

    switch (flow) {
      case 'flow-1-signup':
        setSavedAccounts([]);
        setAuthInitialStep('welcome');
        setRoute('auth');
        showToast('Flow 1: Tap "New here? Create an Account" to sign up', 'info');
        break;
      case 'flow-2-signin':
        setSavedAccounts([]);
        setAuthInitialStep('welcome');
        setRoute('auth');
        showToast('Flow 2: Tap "Sign In to Continue" for MPIN + Device OTP', 'info');
        break;
      case 'flow-3-switch':
        setSavedAccounts([ACCOUNT_MALAVIKA]);
        setCurrentAccount(ACCOUNT_MALAVIKA);
        setActiveMainTab('home');
        setRoute('home');
        showToast('Flow 3: Logged in as Malavika — open Menu → Log Out to switch', 'info');
        break;
      case 'flow-4-second-account':
        setSavedAccounts([ACCOUNT_MALAVIKA]);
        setCurrentAccount(ACCOUNT_MALAVIKA);
        setActiveMainTab('home');
        setRoute('home');
        showToast('Flow 4: Logged in as Malavika — Log Out → Create 2nd Account', 'info');
        break;
      case 'flow-5-both-saved':
        setSavedAccounts([ACCOUNT_MALAVIKA, ACCOUNT_REHAN]);
        setAuthInitialStep('saved-accounts');
        setRoute('auth');
        showToast('Flow 5: Both accounts saved — tap an account for instant MPIN / Face ID', 'info');
        break;
      case 'after-onboarding':
        setSavedAccounts([ACCOUNT_MALAVIKA, ACCOUNT_REHAN]);
        setCurrentAccount(ACCOUNT_REHAN);
        setActiveMainTab('home');
        setRoute('home');
        break;
    }
  };

  // Navigation Helpers
  const handleSelectMainTab = (tab: MainTab) => {
    setActiveMainTab(tab);
    if (tab === 'nearby') {
      setNearbyInitialFilter('All');
    }
    setRoute(tab);
  };

  const openTransportServices = (
    tab: TransportTab = 'vehicle',
    serviceId: string | null = null
  ) => {
    setTransportInitialTab(tab);
    setTransportInitialServiceId(serviceId);
    setActiveMainTab('home');
    setRoute('transport-services');
  };

  const openChallanPayment = (challanId: string) => {
    setActiveChallanId(challanId);
    setRoute('challan-payment');
  };

  const openVirtualDocs = (mode: 'dl' | 'rc' = 'dl', flipped = false) => {
    setVirtualDocsMode(mode);
    setVirtualDocsFlipped(flipped);
    setRoute('virtual-docs');
  };

  // Search & Lookup
  const handleSmartSearch = (query: string, category: SearchCategory) => {
    if (category === 'Challan') {
      openTransportServices('challan');
      showToast(`Checking challans for ${query.toUpperCase()}`, 'info');
      return;
    }
    if (category === 'DL') {
      openVirtualDocs('dl', false);
      showToast(`Showing Driving Licence record ${activeDl.dlNo}`, 'info');
      return;
    }
    const found = findVehicleByQuery(
      query,
      [...rehanVehicles, ...malavikaVehicles],
      EXTRA_LOOKUP_VEHICLE
    );
    if (!found) {
      showToast('Enter a valid plate like KL 42 AB 5784 or KL 13 Q 8921', 'warning');
      return;
    }
    setSearchQuota((q) => consumeSearchQuota(q));
    setLookupVehicle(found);
    setRoute('vehicle-search');
  };

  const handleQuickLookup = (regNo: string) => {
    const found = findVehicleByQuery(
      regNo,
      [...rehanVehicles, ...malavikaVehicles],
      EXTRA_LOOKUP_VEHICLE
    );
    if (found) {
      setSearchQuota((q) => consumeSearchQuota(q));
      setLookupVehicle(found);
      setRoute('vehicle-search');
    }
  };

  // Domain Mutations
  const handleChallanPaymentSuccess = (challanId: string, method: string) => {
    const updated = completeChallanPayment(challans, transactions, challanId, method);
    setChallans(updated.challans);
    setTransactions(updated.transactions);
    hapticSuccess();
    showToast(`Challan ${challanId} paid! Signed receipt ready.`, 'success');
  };

  const handleAddVehicle = (newVeh: VehicleRecord) => {
    const setter =
      currentAccount.id === ACCOUNT_MALAVIKA.id ? setMalavikaVehicles : setRehanVehicles;
    setter((prev) => {
      if (prev.some((v) => v.regNo === newVeh.regNo)) return prev;
      return [...prev, { ...newVeh, savedInGarage: true }];
    });
    hapticSuccess();
    showToast(`${newVeh.regNo} added to My Garage`, 'success');
  };

  const handleVerifyTransaction = (txId: string) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === txId
          ? {
              ...tx,
              status: 'Paid',
              statusTone: 'green',
              actionLabel: 'Download Receipt',
              actionType: 'receipt',
            }
          : tx
      )
    );
    hapticSuccess();
    showToast('Payment verified with Parivahan Treasury ✓', 'success');
  };

  const handleSubmitSentinel = (input: {
    violationType: string;
    vehicleNo: string;
    location: string;
    state: string;
    mediaName: string;
  }) => {
    const { report, reports } = createSentinelReport(sentinelReports, input);
    setSentinelReports(reports);
    hapticSuccess();
    return report;
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    if (item.challanId) {
      openChallanPayment(item.challanId);
      return;
    }
    if (item.actionRoute) {
      if (item.actionRoute === 'nearby') {
        setNearbyInitialFilter('PUC Center');
        setActiveMainTab('nearby');
      }
      setRoute(item.actionRoute);
    }
  };

  const activeChallan =
    challans.find((c) => c.id === activeChallanId) ?? challans[0];

  const unreadCount = countUnreadNotifications(notifications);

  const hideBottomNav =
    route === 'auth' || route === 'scan-qr' || route === 'challan-payment';

  return (
    <IPhoneFrame
      darkStatusBar={route === 'scan-qr'}
      activeFlow={activeFlow}
      onSelectFlow={handleSelectFlow}
    >
      <ToastBanner toast={toast} />

      {/* Active Screen Switch */}
      {route === 'auth' && (
        <AuthScreen
          initialStep={authInitialStep}
          savedAccounts={savedAccounts}
          registeredDirectory={registeredDirectory}
          onLoginSuccess={(acc, saveToDevice) => {
            if (saveToDevice) {
              setSavedAccounts((prev) => upsertSavedAccount(prev, acc));
            }
            setCurrentAccount(acc);
            setSelectedState(acc.state);
            setActiveMainTab('home');
            setActiveFlow('after-onboarding');
            setRoute('home');
            showToast(`Welcome back, ${acc.name}`, 'success');
          }}
          onAccountCreated={(newAcc) => {
            setRegisteredDirectory((prev) => upsertSavedAccount(prev, newAcc));
          }}
          onShowToast={showToast}
        />
      )}

      {route === 'home' && (
        <HomeScreen
          account={currentAccount}
          vehicles={activeVehicles}
          searchQuota={searchQuota}
          unreadNotifications={unreadCount}
          challans={challans}
          savedVehiclesCount={activeVehicles.length}
          onOpenDrawer={() => setDrawerOpen(true)}
          onOpenSos={() => setRoute('sos')}
          onOpenNotifications={() => setRoute('notifications')}
          onSubmitSearch={handleSmartSearch}
          onQuickLookup={handleQuickLookup}
          onOpenChallanAlert={openChallanPayment}
          onNavigate={(target) => {
            if (target === 'transport-services') {
              openTransportServices('vehicle', null);
            } else if (target === 'virtual-docs') {
              openVirtualDocs('dl', false);
            } else {
              setRoute(target);
            }
          }}
        />
      )}

      {route === 'garage' && (
        <GarageScreen
          vehicles={activeVehicles}
          dl={activeDl}
          challans={challans}
          onViewVirtualRc={() => openVirtualDocs('rc', false)}
          onViewVirtualDl={() => openVirtualDocs('dl', false)}
          onPayVehicleChallan={openChallanPayment}
          onAddVehicle={handleAddVehicle}
        />
      )}

      {route === 'transactions' && (
        <TransactionsScreen
          transactions={transactions}
          onVerifyTransaction={handleVerifyTransaction}
          onShowToast={showToast}
        />
      )}

      {route === 'nearby' && (
        <NearbyScreen
          initialFilter={nearbyInitialFilter}
          onShowToast={showToast}
        />
      )}

      {route === 'scan-qr' && (
        <ScanQrScreen
          onClose={() => setRoute(activeMainTab)}
          onOpenMyQrCode={() => openVirtualDocs('dl', true)}
          onScanSimulated={(regNo) => {
            handleQuickLookup(regNo);
          }}
          onShowToast={showToast}
        />
      )}

      {route === 'transport-services' && (
        <TransportServicesScreen
          initialTab={transportInitialTab}
          initialServiceId={transportInitialServiceId}
          selectedState={selectedState}
          onChangeState={setSelectedState}
          vehicles={activeVehicles}
          challans={challans}
          onBack={() => {
            setActiveMainTab('home');
            setRoute('home');
          }}
          onOpenTransactions={() => handleSelectMainTab('transactions')}
          onPayChallan={openChallanPayment}
          onSubmitApplication={(tx) => {
            setTransactions((prev) => [tx, ...prev]);
            hapticSuccess();
          }}
          onShowToast={showToast}
        />
      )}

      {route === 'challan-payment' && activeChallan && (
        <ChallanPaymentFlow
          challan={activeChallan}
          onBack={() => openTransportServices('challan')}
          onPaymentSuccess={handleChallanPaymentSuccess}
          onViewTransactions={() => handleSelectMainTab('transactions')}
          onBackToHome={() => handleSelectMainTab('home')}
          onShowToast={showToast}
        />
      )}

      {route === 'virtual-docs' && (
        <VirtualDocumentsScreen
          initialMode={virtualDocsMode}
          initialFlipped={virtualDocsFlipped}
          dl={activeDl}
          vehicles={activeVehicles}
          onBack={() => {
            setActiveMainTab('home');
            setRoute('home');
          }}
          onOpenChallanTab={() => openTransportServices('challan')}
          onShowToast={showToast}
        />
      )}

      {route === 'citizen-sentinel' && (
        <CitizenSentinelScreen
          selectedState={selectedState}
          onChangeState={setSelectedState}
          reports={sentinelReports}
          onSubmitReport={handleSubmitSentinel}
          onBack={() => handleSelectMainTab('home')}
          onShowToast={showToast}
        />
      )}

      {route === 'pm-rahat' && (
        <PmRahatScreen
          onBack={() => handleSelectMainTab('home')}
          onOpenHospitalsNearby={() => {
            setNearbyInitialFilter('Hospitals (PM Rahat)');
            setActiveMainTab('nearby');
            setRoute('nearby');
          }}
          onShowToast={showToast}
        />
      )}

      {route === 'info-services' && (
        <InformationalServicesScreen
          onBack={() => handleSelectMainTab('home')}
          onApplyInTransport={(tab, serviceId) =>
            openTransportServices(tab, serviceId ?? null)
          }
        />
      )}

      {route === 'profile' && (
        <ProfileScreen
          account={currentAccount}
          vehiclesCount={activeVehicles.length}
          onBack={() => handleSelectMainTab('home')}
          onOpenVirtualDocs={() => openVirtualDocs('dl', false)}
          onShowToast={showToast}
        />
      )}

      {route === 'settings' && (
        <SettingsScreen
          onBack={() => handleSelectMainTab('home')}
          onManageAccounts={() => {
            setAuthInitialStep(savedAccounts.length > 0 ? 'saved-accounts' : 'welcome');
            setRoute('auth');
          }}
          onDeleteAccount={() => {
            setSavedAccounts((prev) =>
              prev.filter((a) => a.id !== currentAccount.id)
            );
            setAuthInitialStep('welcome');
            setRoute('auth');
            showToast('Local cache cleared & signed out', 'warning');
          }}
          onShowToast={showToast}
        />
      )}

      {route === 'help' && (
        <HelpScreen
          onBack={() => handleSelectMainTab('home')}
          onShowToast={showToast}
        />
      )}

      {route === 'notifications' && (
        <NotificationsScreen
          notifications={notifications}
          onMarkAllRead={() => {
            setNotifications((prev) => markAllNotificationsRead(prev));
            showToast('All notifications marked as read', 'success');
          }}
          onSelectNotification={handleNotificationClick}
          onBack={() => handleSelectMainTab('home')}
        />
      )}

      {route === 'sos' && (
        <SosScreen
          onBack={() => handleSelectMainTab('home')}
          onOpenHospitals={() => {
            setNearbyInitialFilter('Hospitals (PM Rahat)');
            setActiveMainTab('nearby');
            setRoute('nearby');
          }}
          onShowToast={showToast}
        />
      )}

      {route === 'vehicle-search' && (
        <VehicleSearchResultScreen
          vehicle={lookupVehicle}
          isSavedInGarage={activeVehicles.some((v) => v.regNo === lookupVehicle.regNo)}
          onAddToGarage={handleAddVehicle}
          onCheckChallans={() => openTransportServices('challan')}
          onBack={() => handleSelectMainTab('home')}
        />
      )}

      {/* Persistent Bottom Navigation Bar */}
      {!hideBottomNav && (
        <BottomNav
          currentRoute={route}
          activeMainTab={activeMainTab}
          onSelectTab={handleSelectMainTab}
          onOpenScanQr={() => setRoute('scan-qr')}
        />
      )}

      {/* Hamburger Drawer Slide-Over */}
      <HamburgerDrawer
        open={drawerOpen}
        account={currentAccount}
        language={language}
        onChangeLanguage={setLanguage}
        onClose={() => setDrawerOpen(false)}
        onNavigate={(target) => setRoute(target)}
        onSwitchAccount={() => {
          setAuthInitialStep(savedAccounts.length > 0 ? 'saved-accounts' : 'welcome');
          setRoute('auth');
        }}
        onLogout={() => {
          // Matches Figma Flows 3, 4, 5: Log Out returns to 01 · Welcome
          setAuthInitialStep('welcome');
          setRoute('auth');
          showToast('Logged out securely', 'info');
        }}
        onShowToast={showToast}
      />
    </IPhoneFrame>
  );
}
