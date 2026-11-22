import React, { useState } from 'react';
import {
  Plus,
  Car,
  Bike,
  IdCard,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowRight,
} from 'lucide-react';
import { ChallanRecord, DrivingLicenceRecord, VehicleRecord } from '../../types';
import { getPendingChallanSummary, normalizeLookupQuery } from '../../utils/appLogic';
import { hapticTap, hapticWarning } from '../../utils/haptics';

interface GarageScreenProps {
  vehicles: VehicleRecord[];
  dl: DrivingLicenceRecord;
  challans: ChallanRecord[];
  onViewVirtualRc: (regNo: string) => void;
  onViewVirtualDl: () => void;
  onPayVehicleChallan: (challanId: string) => void;
  onAddVehicle: (vehicle: VehicleRecord) => void;
}

export function GarageScreen({
  vehicles,
  dl,
  challans,
  onViewVirtualRc,
  onViewVirtualDl,
  onPayVehicleChallan,
  onAddVehicle,
}: GarageScreenProps) {
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [regInput, setRegInput] = useState('');
  const [chassisInput, setChassisInput] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [error, setError] = useState('');

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = normalizeLookupQuery(regInput);
    if (cleaned.replace(/\s/g, '').length < 6) {
      hapticWarning();
      setError('Enter a valid registration number (e.g. KL 07 CX 4410).');
      return;
    }
    if (chassisInput.trim().length < 5) {
      hapticWarning();
      setError('Enter last 5 characters of Chassis Number for Vahan verification.');
      return;
    }

    const newVehicle: VehicleRecord = {
      regNo: cleaned,
      model: modelInput.trim() || 'Honda City ZX CVT',
      fuelType: 'Petrol',
      ownerName: dl.holderName,
      maskedOwnerName: 'R***N J**E',
      chassisMasked: `MAK•••••${chassisInput.trim().slice(-4).toUpperCase()}`,
      engineMasked: 'L15Z•••••9042',
      rto: 'RTO Ernakulam (KL-07)',
      status: 'Active',
      insuranceValidTill: '15 Oct 2027',
      insuranceStatus: 'valid',
      pucLabel: 'Valid till Aug 2027',
      pucStatus: 'valid',
      fitnessValidTill: '10 Nov 2040',
      rcValidTill: '10 Nov 2040',
      savedInGarage: true,
    };

    onAddVehicle(newVehicle);
    setRegInput('');
    setChassisInput('');
    setModelInput('');
    setError('');
    setAddSheetOpen(false);
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-6 relative">
      {/* Header */}
      <header className="px-4 pt-2 pb-3 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10 border-b border-[#F2F4F7]">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-[#111827]">
            My Garage
          </h1>
          <p className="text-[12px] text-[#667085]">
            {vehicles.length} Vehicles • 1 Driving Licence
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            hapticTap();
            setAddSheetOpen(true);
          }}
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full bg-[#0095F6] hover:bg-[#0082D6] text-white text-[12.5px] font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Add Vehicle</span>
        </button>
      </header>

      <div className="px-4 pt-3.5 space-y-4">
        {/* Saved Vehicles */}
        <section aria-label="Saved Vehicles" className="space-y-3">
          {vehicles.map((vehicle) => {
            const pending = getPendingChallanSummary(challans, vehicle.regNo);
            const isBike = vehicle.model.toLowerCase().includes('royal enfield');
            const Icon = isBike ? Bike : Car;

            return (
              <div
                key={vehicle.regNo}
                className="rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_2px_12px_rgba(15,23,42,0.04)] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#EBF5FF] text-[#0095F6] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-mono-code text-[15px] font-bold text-[#111827]">
                        {vehicle.regNo}
                      </p>
                      <p className="text-[12.5px] text-[#667085]">{vehicle.model}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#16A34A] text-[11px] font-bold shrink-0">
                    Active ✓
                  </span>
                </div>

                {/* Compliance Badges */}
                <div className="mt-3.5 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-[#ECFDF5] px-2.5 py-2">
                    <p className="text-[10px] font-semibold text-[#166534]">Insurance</p>
                    <p className="text-[11.5px] font-bold text-[#16A34A] mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      Valid
                    </p>
                  </div>

                  <div
                    className={`rounded-xl px-2.5 py-2 ${
                      vehicle.pucStatus === 'expiring'
                        ? 'bg-[#FFFBEB]'
                        : 'bg-[#ECFDF5]'
                    }`}
                  >
                    <p
                      className={`text-[10px] font-semibold ${
                        vehicle.pucStatus === 'expiring'
                          ? 'text-[#92400E]'
                          : 'text-[#166534]'
                      }`}
                    >
                      PUC
                    </p>
                    <p
                      className={`text-[11.5px] font-bold mt-0.5 flex items-center gap-1 ${
                        vehicle.pucStatus === 'expiring'
                          ? 'text-[#D97706]'
                          : 'text-[#16A34A]'
                      }`}
                    >
                      {vehicle.pucStatus === 'expiring' ? (
                        <>
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          5d left
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          Valid
                        </>
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#ECFDF5] px-2.5 py-2">
                    <p className="text-[10px] font-semibold text-[#166534]">Fitness</p>
                    <p className="text-[11.5px] font-bold text-[#16A34A] mt-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 shrink-0" />
                      {vehicle.fitnessValidTill.slice(-4)}
                    </p>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="mt-3.5 pt-3 border-t border-[#F2F4F7] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onViewVirtualRc(vehicle.regNo)}
                    className="inline-flex items-center gap-1 text-[13px] font-bold text-[#0095F6] hover:underline cursor-pointer"
                  >
                    <span>View Virtual RC</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {pending.count > 0 && pending.firstPending ? (
                    <button
                      type="button"
                      onClick={() => onPayVehicleChallan(pending.firstPending!.id)}
                      className="px-3 py-1.5 rounded-full bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#E31E24] text-[11.5px] font-bold transition-colors cursor-pointer"
                    >
                      {pending.count} Challan ₹{pending.totalAmount}
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-full bg-[#F2F4F7] text-[#667085] text-[11.5px] font-semibold">
                      0 Challans
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* My Driving Licence Section */}
        <section aria-label="My Driving Licence">
          <h2 className="text-[15px] font-bold text-[#111827] mb-2.5">
            My Driving Licence
          </h2>
          <div className="rounded-2xl bg-[#F8FBFF] border border-[#0095F6]/40 p-4 shadow-[0_2px_10px_rgba(0,149,246,0.06)]">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#0095F6] text-white flex items-center justify-center shrink-0">
                  <IdCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-mono-code text-[14.5px] font-bold text-[#111827]">
                    {dl.dlNo}
                  </p>
                  <p className="text-[12.5px] text-[#667085]">
                    Valid till Dec 2043 • {dl.vehicleClasses}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#16A34A] text-[11px] font-bold shrink-0">
                Verified ✓
              </span>
            </div>

            <div className="mt-3.5 pt-3 border-t border-[#DBEAFE] flex items-center justify-between">
              <span className="text-[12px] text-[#667085]">RTO {dl.rto}</span>
              <button
                type="button"
                onClick={onViewVirtualDl}
                className="inline-flex items-center gap-1 text-[13px] font-bold text-[#0095F6] hover:underline cursor-pointer"
              >
                <span>View Virtual DL</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Add Vehicle Bottom Sheet */}
      {addSheetOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setAddSheetOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add Vehicle to My Garage"
            className="relative z-10 w-full max-w-[402px] bg-white rounded-t-[28px] p-5 pb-9 shadow-2xl"
          >
            <div className="w-10 h-1 rounded-full bg-[#CBD5E1] mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                  VAHAN 4.0 SYNC
                </p>
                <h2 className="text-[19px] font-bold text-[#111827]">
                  Add Vehicle to Garage
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAddSheetOpen(false)}
                aria-label="Close add vehicle sheet"
                className="w-9 h-9 rounded-full bg-[#F2F4F7] flex items-center justify-center text-[#111827] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-3.5">
              <div>
                <label htmlFor="add-reg" className="block text-[12px] font-semibold text-[#111827] mb-1">
                  Vehicle Registration Number
                </label>
                <input
                  id="add-reg"
                  type="text"
                  placeholder="KL 07 CX 4410"
                  value={regInput}
                  onChange={(e) => setRegInput(e.target.value.toUpperCase())}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F2F4F7] font-mono-code text-[14px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                />
              </div>

              <div>
                <label htmlFor="add-chassis" className="block text-[12px] font-semibold text-[#111827] mb-1">
                  Chassis Number (Last 5 Digits)
                </label>
                <input
                  id="add-chassis"
                  type="text"
                  maxLength={5}
                  placeholder="66201"
                  value={chassisInput}
                  onChange={(e) => setChassisInput(e.target.value.toUpperCase())}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F2F4F7] font-mono-code text-[14px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                />
              </div>

              <div>
                <label htmlFor="add-model" className="block text-[12px] font-semibold text-[#111827] mb-1">
                  Vehicle Nickname / Model (Optional)
                </label>
                <input
                  id="add-model"
                  type="text"
                  placeholder="e.g. Hyundai Creta SX"
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F2F4F7] text-[14px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                />
              </div>

              {error && <p className="text-[12px] font-medium text-[#E31E24]">{error}</p>}

              <button
                type="submit"
                className="w-full h-12 rounded-2xl bg-[#0095F6] hover:bg-[#0082D6] text-white font-semibold text-[14.5px] transition-colors cursor-pointer"
              >
                Verify & Add to My Garage
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
