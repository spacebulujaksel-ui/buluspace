import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  Clock,
  Check,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Tag,
  User,
  Phone,
  Mail,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useData } from "../hooks/useData";
import { api } from "../lib/api";
import { combinationError } from "../lib/combination";
import { STATUS_MAP } from "../lib/booking";
import { Therapist, WaxService, SavedBooking } from "../types";

const MALE_SURCHARGE_PER_TREATMENT = 7000;

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTherapistId?: string;
  initialPromoCode?: string;
  initialServiceIds?: string[];
  initialCustomNote?: string;
  onBookingSuccess: (booking: SavedBooking) => void;
}

type AvailabilityData = {
  booked: {
    therapist_id: number;
    start_time: string;
    end_time: string;
    is_auto_assign?: boolean;
  }[];
  rooms: Record<string, number>;
  blocked: {
    room_number: number;
    start_time: string;
    end_time: string;
  }[];
  on_leave_ids: number[];
};

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialTherapistId = "any",
  initialPromoCode = "",
  initialServiceIds = [],
  initialCustomNote = "",
  onBookingSuccess,
}) => {
  const { therapists: THERAPISTS, services: SERVICES } = useData();
  const [submitting, setSubmitting] = useState(false);
  const [selectedServices, setSelectedServices] =
    useState<string[]>(initialServiceIds);
  const [therapistId, setTherapistId] = useState<string>(initialTherapistId);
  const [customTherapistRequest, setCustomTherapistRequest] =
    useState<string>(initialCustomNote);
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [customerGender, setCustomerGender] = useState<"" | "Pria" | "Wanita">(
    "",
  );
  const [date, setDate] = useState<string>("");
  const [timeSlot, setTimeSlot] = useState<string>("13:30");
  const [location, setLocation] = useState<string>(
    "Jakarta Barat — Jl. Raya Kb. Jeruk No.8, Kb. Jeruk, Jakarta Barat 11530",
  );
  const [promoCode, setPromoCode] = useState<string>(initialPromoCode);
  const [promoApplied, setPromoApplied] = useState<boolean>(!!initialPromoCode);
  const [discountPercent, setDiscountPercent] = useState<number>(
    initialPromoCode ? 30 : 0,
  );
  const [specialNotes, setSpecialNotes] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<
    {
      therapist_id: number;
      start_time: string;
      end_time: string;
      is_auto_assign?: boolean;
    }[]
  >([]);
  const [rooms, setRooms] = useState<Record<string, number>>({});
  const [blocked, setBlocked] = useState<
    { room_number: number; start_time: string; end_time: string }[]
  >([]);
  const [onLeaveIds, setOnLeaveIds] = useState<number[]>([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Sync props when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubmitting(false);
      setErrorMessage("");
      if (initialTherapistId) setTherapistId(initialTherapistId);
      if (initialPromoCode) {
        setPromoCode(initialPromoCode);
        setPromoApplied(true);
        setDiscountPercent(30);
      }
      if (initialServiceIds && initialServiceIds.length > 0) {
        setSelectedServices(initialServiceIds);
      }
      if (initialCustomNote) {
        setCustomTherapistRequest(initialCustomNote);
      }

      // Default date to tomorrow or today
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [
    isOpen,
    initialTherapistId,
    initialPromoCode,
    initialServiceIds,
    initialCustomNote,
  ]);

  useEffect(() => {
    if (!isDatePickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(e.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDatePickerOpen]);

  const submitLockRef = useRef(false);

  const refreshAvail = async (): Promise<void> => {
    const branch = location.startsWith("Jakarta Selatan")
      ? "Jakarta Selatan"
      : "Jakarta Barat";
    try {
      const r = await api.get<AvailabilityData>(
        `/availability?date=${date}&location=${encodeURIComponent(branch)}`,
      );
      setBookedSlots(r.booked);
      setRooms(r.rooms ?? {});
      setBlocked(r.blocked ?? []);
      setOnLeaveIds(r.on_leave_ids ?? []);
    } catch {
      setBookedSlots([]);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    refreshAvail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, date, location]);

  const selectedServiceObjs = SERVICES.filter((s) =>
    selectedServices.includes(s.id),
  );
  const hasIntimate = selectedServiceObjs.some(
    (s) => s.category === "intimate",
  );
  const totalMinutes = (() => {
    if (selectedServiceObjs.some((s) => s.name === "Feel Smooth")) {
      const rest = selectedServiceObjs.filter((s) => s.name !== "Feel Smooth");
      return 60 + rest.reduce((acc, s) => acc + s.durationMinutes, 0);
    }
    if (selectedServiceObjs.some((s) => s.name === "Brazilian")) {
      const added = selectedServiceObjs.filter((s) => s.name !== "Brazilian");
      return added.length >= 2
        ? 30 + added.reduce((acc, s) => acc + s.durationMinutes, 0)
        : 30;
    }
    return selectedServiceObjs.reduce((acc, s) => acc + s.durationMinutes, 0);
  })();

  const asMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const selectedBranchName = location.startsWith("Jakarta Selatan")
    ? "Jakarta Selatan"
    : "Jakarta Barat";
  const branchTherapists = THERAPISTS.filter(
    (t) => t.branch === selectedBranchName,
  );

  const selectedSlotMin = timeSlot ? asMinutes(timeSlot.slice(0, 5)) : 0;
  const selectedWindowEnd = selectedSlotMin + totalMinutes;
  const therapistBusy = (tid: number): boolean => {
    if (totalMinutes <= 0) return true;
    return bookedSlots.some(
      (b) =>
        !b.is_auto_assign &&
        b.therapist_id === tid &&
        selectedSlotMin < asMinutes(b.end_time) &&
        selectedWindowEnd > asMinutes(b.start_time),
    );
  };

  useEffect(() => {
    if (
      therapistId !== "any" &&
      (therapistBusy(Number(therapistId)) ||
        onLeaveIds.includes(Number(therapistId)))
    ) {
      setTherapistId("any");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [therapistId, timeSlot, totalMinutes, bookedSlots, onLeaveIds]);

  const closeMinute = 19 * 60;
  const staticCutoff = selectedServiceObjs.reduce<string | null>(
    (earliest, s) => {
      if (!s.lastOrderTime) return earliest;
      return earliest === null || s.lastOrderTime < earliest
        ? s.lastOrderTime
        : earliest;
    },
    null,
  );
  const cutoffMin = staticCutoff
    ? Math.min(closeMinute - totalMinutes, asMinutes(staticCutoff))
    : closeMinute - totalMinutes;

  useEffect(() => {
    if (cutoffMin === null) return;
    const current = timeSlot ? asMinutes(timeSlot.slice(0, 5)) : 0;
    if (current > cutoffMin) setTimeSlot("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cutoffMin]);

  if (!isOpen) return null;

  const timeSlots = (() => {
    const slots: string[] = [];
    for (let min = 10 * 60; min <= 19 * 60; min += 15) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      slots.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} WIB`,
      );
    }
    return slots;
  })();

  const quickCriteriaTags = [
    "First-Timer (Mohon ekstra sabar)",
    "Kulit Super Sensitif",
    "Silent Session (Tanpa obrolan)",
    "Terapis Wanita yang Teliti",
    "Ingin Konsultasi Dulu",
    "Tarikan Cepat & Cekatan",
  ];

  const handleToggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter((s) => s !== id));
      return;
    }
    const service = SERVICES.find((s) => s.id === id);
    if (service?.category === "intimate" && customerGender === "Pria") {
      setCustomerGender("Wanita");
    }
    const candidate = SERVICES.filter(
      (s) => selectedServices.includes(s.id) || s.id === id,
    );
    const err = combinationError(
      candidate.map((s) => ({
        name: s.name,
        category: s.category,
        duration: s.durationMinutes,
      })),
    );
    if (err) {
      setErrorMessage(err);
      return;
    }
    setSelectedServices([...selectedServices, id]);
  };

  const selectGender = (g: "Pria" | "Wanita") => {
    setCustomerGender(g);
    if (g === "Pria") {
      const intimateIds = SERVICES.filter((s) => s.category === "intimate").map(
        (s) => s.id,
      );
      const remaining = selectedServices.filter(
        (id) => !intimateIds.includes(id),
      );
      if (remaining.length !== selectedServices.length) {
        setSelectedServices(remaining);
        setErrorMessage("Layanan intimate dihapus karena hanya untuk wanita.");
      }
    }
  };

  const handleApplyPromo = () => {
    const cleaned = promoCode.trim().toUpperCase();
    if (cleaned === "FIRSTBULU30" || cleaned === "FIRST30") {
      setPromoApplied(true);
      setDiscountPercent(30);
      setErrorMessage("");
    } else if (cleaned === "SILKYGLOW" || cleaned === "VIPBULU") {
      setPromoApplied(true);
      setDiscountPercent(20);
      setErrorMessage("");
    } else if (cleaned === "WEEKENDCARE") {
      setPromoApplied(true);
      setDiscountPercent(15);
      setErrorMessage("");
    } else if (cleaned) {
      // General 10% promo for custom codes
      setPromoApplied(true);
      setDiscountPercent(10);
      setErrorMessage("");
    }
  };

  const handleQuickTagClick = (tag: string) => {
    if (customTherapistRequest.includes(tag)) {
      setCustomTherapistRequest(
        customTherapistRequest.replace(tag, "").replace(/,\s*,/g, ",").trim(),
      );
    } else {
      setCustomTherapistRequest(
        customTherapistRequest ? `${customTherapistRequest}, ${tag}` : tag,
      );
    }
  };

  // Pricing calculations
  const subtotal = selectedServiceObjs.reduce((acc, s) => acc + s.price, 0);
  const maleSurcharge =
    customerGender === "Pria"
      ? MALE_SURCHARGE_PER_TREATMENT * selectedServices.length
      : 0;
  const finalPrice = Math.max(0, subtotal + maleSurcharge);

  const selectedTherapistObj = THERAPISTS.find((t) => t.id === therapistId);
  const therapistDisplayName = selectedTherapistObj
    ? `${selectedTherapistObj.name} (${selectedTherapistObj.role})`
    : "Rekomendasi Terbaik Bulu Space (Auto-Assign)";

  const slotBusy = (slotMin: number): boolean => {
    if (totalMinutes <= 0) return true;
    const now = new Date();
    if (
      date === toDateStr(now) &&
      slotMin <= now.getHours() * 60 + now.getMinutes() + 30
    ) {
      return true;
    }
    const slotEnd = slotMin + totalMinutes;
    const overlaps = (b: {
      therapist_id: number;
      start_time: string;
      end_time: string;
    }) => slotMin < asMinutes(b.end_time) && slotEnd > asMinutes(b.start_time);
    const branchName = location.startsWith("Jakarta Selatan")
      ? "Jakarta Selatan"
      : "Jakarta Barat";
    const capacity = rooms[branchName] ?? 0;
    if (capacity <= 0) return true;
    const blockedRooms = new Set(
      blocked
        .filter(
          (b) =>
            slotMin < asMinutes(b.end_time) &&
            slotEnd > asMinutes(b.start_time),
        )
        .map((b) => b.room_number),
    );
    const available = capacity - blockedRooms.size;
    if (available <= 0) return true;
    const overlapping = bookedSlots.filter((b) => overlaps(b)).length;
    if (overlapping >= available) return true;
    if (therapistId !== "any") {
      const tid = Number(therapistId);
      if (
        bookedSlots.some(
          (b) => !b.is_auto_assign && b.therapist_id === tid && overlaps(b),
        )
      )
        return true;
    }
    return false;
  };

  const slotState = (slotMin: number): "available" | "full" | "past" => {
    const now = new Date();
    if (
      date === toDateStr(now) &&
      slotMin <= now.getHours() * 60 + now.getMinutes() + 30
    ) {
      return "past";
    }
    if (cutoffMin !== null && slotMin > cutoffMin) {
      return "past";
    }
    return slotBusy(slotMin) ? "full" : "available";
  };

  const slotNowFull = (
    data: AvailabilityData,
    slotMin: number,
    slotEnd: number,
  ): boolean => {
    if (totalMinutes <= 0) return true;
    const branchName = location.startsWith("Jakarta Selatan")
      ? "Jakarta Selatan"
      : "Jakarta Barat";
    const capacity = data.rooms[branchName] ?? 0;
    if (capacity <= 0) return true;
    const blockedRooms = new Set(
      data.blocked
        .filter(
          (b) =>
            slotMin < asMinutes(b.end_time) &&
            slotEnd > asMinutes(b.start_time),
        )
        .map((b) => b.room_number),
    );
    const available = capacity - blockedRooms.size;
    if (available <= 0) return true;
    const overlapping = data.booked.filter(
      (b) =>
        slotMin < asMinutes(b.end_time) && slotEnd > asMinutes(b.start_time),
    ).length;
    return overlapping >= available;
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "Pilih tanggal";
    const d = new Date(`${dateStr}T00:00:00`);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  };

  const toDateStr = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const isPastDate = (dateStr: string) => {
    const todayStr = toDateStr(new Date());
    return dateStr < todayStr;
  };

  const calendarDays: (string | null)[] = [];
  {
    const firstOfMonth = new Date(
      viewMonth.getFullYear(),
      viewMonth.getMonth(),
      1,
    );
    const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday start
    const daysInMonth = new Date(
      viewMonth.getFullYear(),
      viewMonth.getMonth() + 1,
      0,
    ).getDate();
    for (let i = 0; i < startOffset; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      calendarDays.push(
        toDateStr(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d)),
      );
    }
  }

  const changeMonth = (delta: number) => {
    setViewMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
    );
  };

  const monthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(viewMonth);

  const handleFormSubmit = async () => {
    if (submitLockRef.current) return;

    if (!clientName.trim()) {
      setErrorMessage("Mohon cantumkan nama lengkap Anda.");
      return;
    }
    if (!customerGender) {
      setErrorMessage("Silakan pilih jenis kelamin (Pria/Wanita).");
      return;
    }
    if (!clientPhone.trim()) {
      setErrorMessage(
        "Mohon cantumkan nomor WhatsApp Anda untuk konfirmasi jadwal.",
      );
      return;
    }
    if (!clientEmail.trim()) {
      setErrorMessage(
        "Mohon cantumkan email Anda untuk menerima notifikasi booking.",
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())) {
      setErrorMessage("Format email tidak valid.");
      return;
    }
    if (selectedServices.length === 0) {
      setErrorMessage("Pilih minimal 1 jenis treatment waxing.");
      return;
    }
    if (!timeSlot) {
      setErrorMessage("Silakan pilih jam sesi treatment.");
      return;
    }

    setErrorMessage("");

    // Normalize location to short branch label
    const locationLabel = location.includes("Jakarta Selatan")
      ? "Jakarta Selatan"
      : "Jakarta Barat";

    const startTime = timeSlot.replace(" WIB", "").slice(0, 5);

    submitLockRef.current = true;
    setSubmitting(true);
    try {
      const startMin = asMinutes(startTime);
      const branchLabel = location.startsWith("Jakarta Selatan")
        ? "Jakarta Selatan"
        : "Jakarta Barat";
      const fresh = await api.get<AvailabilityData>(
        `/availability?date=${date}&location=${encodeURIComponent(branchLabel)}`,
      );

      if (slotNowFull(fresh, startMin, startMin + totalMinutes)) {
        setTimeSlot("");
        setErrorMessage(
          "Slot yang Anda pilih baru saja terisi. Silakan pilih jam lain.",
        );
        return;
      }

      const res = await api.post<{ booking: any }>("/bookings", {
        customer_name: clientName.trim(),
        customer_phone: clientPhone.trim(),
        customer_email: clientEmail.trim(),
        customer_gender: customerGender,
        therapist_id: therapistId === "any" ? null : Number(therapistId),
        appointment_date: date,
        start_time: startTime,
        service_ids: selectedServices.map((id) => parseInt(id, 10)),
        location: locationLabel,
        notes:
          [customTherapistRequest.trim(), specialNotes.trim()]
            .filter(Boolean)
            .join(" · ") || null,
      });

      const newBooking: SavedBooking = {
        id:
          res.booking?.booking_code ??
          `BS-${Math.floor(100000 + Math.random() * 900000)}`,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim(),
        customerGender: customerGender as "Pria" | "Wanita",
        selectedServices,
        therapistId: String(
          res.booking?.therapist_id ??
            (therapistId === "any" ? "" : therapistId),
        ),
        customTherapistRequest: customTherapistRequest.trim(),
        location: res.booking?.location ?? locationLabel,
        date: res.booking?.appointment_date ?? date,
        timeSlot: res.booking
          ? `${res.booking.start_time.slice(0, 5)} WIB`
          : timeSlot,
        promoCode: promoApplied ? promoCode : "",
        specialNotes: specialNotes.trim(),
        createdAt: new Date().toISOString(),
        totalPrice: Number(res.booking?.total_price ?? subtotal),
        discountAmount: 0,
        finalPrice: Number(res.booking?.total_price ?? finalPrice),
        therapistName:
          res.booking?.therapist?.name ??
          selectedTherapistObj?.nickname ??
          "Rekomendasi Bulu Space",
        serviceNames: selectedServiceObjs.map((s) => s.name),
        status: res.booking?.status
          ? (STATUS_MAP[res.booking.status as keyof typeof STATUS_MAP] ??
            "Menunggu WhatsApp")
          : "Menunggu WhatsApp",
      };

      onBookingSuccess(newBooking);
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : "Gagal membuat booking. Coba lagi.",
      );
    } finally {
      setSubmitting(false);
      submitLockRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/asset/img/Bulu Space_Logo Icon-03.png"
              alt="BuluSpace"
              loading="lazy"
              className="w-8 h-auto"
            />
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white font-['Poppins']">
                Reservasi & Request Terapis
              </h3>
              <p className="text-xs text-slate-400">
                Studio Waxing dengan Standar Kebersihan Tinggi dan Private
                Treatment Rooms.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup form booking"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-7 flex-1 text-slate-800">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Layanan Waxing */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2 font-['Poppins']">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center">
                  1
                </span>
                <span>Pilih Treatment Waxing</span>
              </label>
              <span className="text-xs text-slate-500">
                {selectedServices.length} layanan dipilih
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1 border border-slate-200 rounded-2xl p-2.5 bg-slate-50">
              {SERVICES.map((srv) => {
                const checked = selectedServices.includes(srv.id);
                return (
                  <div
                    key={srv.id}
                    onClick={() => handleToggleService(srv.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                      checked
                        ? "bg-pink-50 border-pink-300 ring-1 ring-pink-300"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">
                        {srv.name}
                      </p>
                      {srv.category === "intimate" && (
                        <p className="text-[10px] text-neutral-400">
                          * Pria tidak bisa memilih treatment ini
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold font-mono text-slate-900">
                        {formatRupiah(srv.price)}
                      </p>
                      <div
                        className={`w-4 h-4 mt-1 ml-auto rounded flex items-center justify-center border ${
                          checked
                            ? "bg-pink-400 border-pink-400 text-slate-950"
                            : "border-slate-300"
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: FITUR REQUEST TERAPIS */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-50/70 via-slate-50 to-white border border-pink-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2 font-['Poppins']">
                <span className="w-5 h-5 rounded-full bg-pink-400 text-slate-950 text-[11px] font-bold flex items-center justify-center">
                  2
                </span>
                <span>Fitur Request Terapis Bulu Space</span>
              </label>
              <span className="text-[11px] font-medium text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                Bebas Pilih & Tanpa Biaya Tambahan
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Pilih terapis favorit Anda atau biarkan tim kami menugaskan
              terapis terbaik.
            </p>

            {/* Therapist Cards Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option: Any / Best Recommendation */}
              <div
                onClick={() => setTherapistId("any")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  therapistId === "any"
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    therapistId === "any"
                      ? "bg-slate-800 text-pink-300"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold">
                    Rekomendasi Sistem Bulu Space
                  </p>
                  <p
                    className={`text-[11px] ${therapistId === "any" ? "text-slate-300" : "text-slate-500"}`}
                  >
                    Terapis senior terbaik yang paling siap di jam Anda
                  </p>
                </div>
              </div>

              {/* Specific Therapists (per cabang yang dipilih) */}
              {branchTherapists.length === 0 ? (
                <p className="sm:col-span-2 text-[11px] text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                  Belum ada terapis aktif di {selectedBranchName} saat ini.
                </p>
              ) : (
                branchTherapists.map((t) => {
                  const isSelected = therapistId === t.id;
                  const busy = therapistBusy(Number(t.id));
                  const onLeave = onLeaveIds.includes(Number(t.id));
                  const disabled = busy || onLeave;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        if (disabled) return;
                        setTherapistId(t.id);
                      }}
                      className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                        disabled
                          ? "opacity-40 cursor-not-allowed bg-neutral-50 border-slate-200"
                          : isSelected
                            ? "bg-pink-100/80 border-pink-400 text-slate-900 shadow-xs ring-1 ring-pink-400 cursor-pointer"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-800 cursor-pointer"
                      }`}
                      title={
                        onLeave
                          ? `${t.nickname} sedang cuti pada tanggal ini`
                          : busy
                            ? `${t.nickname} sedang sibuk di jam tersebut`
                            : t.name
                      }
                    >
                      <div className="w-10 h-10 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600 text-xs font-bold shrink-0">
                        {t.name[0]}
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        <p className="text-xs font-bold truncate">
                          {t.nickname}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {t.role}
                        </p>
                        <p
                          className="text-[10px] text-pink-500 truncate"
                          aria-label="Rating bintang 5"
                        >
                          ★★★★★
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Custom Request Criteria Tags & Notes */}
            <div className="mt-4 pt-4 border-t border-pink-200/60">
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Kriteria Khusus untuk Sesi Waxing Anda (Opsional):
              </label>

              {/* Quick Tag Pills */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {quickCriteriaTags.map((tag, idx) => {
                  const isTagged = customTherapistRequest.includes(tag);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickTagClick(tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        isTagged
                          ? "bg-pink-200 text-pink-900 border-pink-400 font-semibold"
                          : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              <textarea
                value={customTherapistRequest}
                onChange={(e) => setCustomTherapistRequest(e.target.value)}
                placeholder="Contoh: Saya baru pertama kali waxing jadi tolong terapis yang ekstra sabar dan lembut, atau ingin suasana hening tanpa banyak mengobrol..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                rows={2}
              />
            </div>
          </div>

          {/* Section 3: Jadwal, Lokasi & Jam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Tanggal Treatment
              </label>
              <div ref={datePickerRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen((o) => !o)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white text-left flex items-center justify-between gap-2"
                >
                  <span>{formatDateLabel(date)}</span>
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {isDatePickerOpen && (
                  <div className="absolute left-0 top-full mt-1.5 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-3 w-64 xs:w-72">
                    {/* Month nav */}
                    <div className="flex items-center justify-between mb-2">
                      <button
                        type="button"
                        onClick={() => changeMonth(-1)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                        aria-label="Bulan sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-semibold text-slate-800 capitalize">
                        {monthLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeMonth(1)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                        aria-label="Bulan berikutnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Weekday headers (Monday first) */}
                    <div className="grid grid-cols-7 text-center text-[10px] font-medium text-slate-400 mb-1">
                      {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(
                        (d) => (
                          <span key={d} className="py-1">
                            {d}
                          </span>
                        ),
                      )}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-0.5">
                      {calendarDays.map((dayStr, idx) => {
                        if (!dayStr) return <span key={`empty-${idx}`} />;
                        const isSelected = dayStr === date;
                        const isPast = isPastDate(dayStr);
                        const isToday = dayStr === toDateStr(new Date());
                        return (
                          <button
                            key={dayStr}
                            type="button"
                            disabled={isPast}
                            onClick={() => {
                              setDate(dayStr);
                              setIsDatePickerOpen(false);
                            }}
                            className={`h-8 w-full rounded-lg text-[11px] flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-neutral-900 text-white font-semibold"
                                : isPast
                                  ? "text-slate-300 cursor-not-allowed"
                                  : "text-slate-700 hover:bg-pink-50"
                            } ${!isSelected && isToday ? "ring-1 ring-pink-300 text-pink-600 font-medium" : ""}`}
                          >
                            {Number(dayStr.slice(8))}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>Jam Sesi Kedatangan</span>
                <span className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{" "}
                    Tersedia
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />{" "}
                    Penuh
                  </span>
                </span>
              </label>
              {cutoffMin > 10 * 60 && (
                <p className="text-[11px] text-rose-600 mb-1.5 font-medium">
                  Jam operasional s/d 19:00 — untuk durasi ini, jam mulai
                  maksimal {`${String(Math.floor(cutoffMin / 60)).padStart(2, "0")}:${String(cutoffMin % 60).padStart(2, "0")}`} WIB.
                </p>
              )}
              <div className="max-h-44 overflow-y-auto pr-1 grid grid-cols-4 xs:grid-cols-5 gap-1.5 border border-slate-200 rounded-2xl p-2.5 bg-slate-50">
                {timeSlots.map((slot) => {
                  const min = asMinutes(slot.slice(0, 5));
                  const state = slotState(min);
                  const isSelected = timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      disabled={state !== "available"}
                      className={`px-1.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                        isSelected && state === "available"
                          ? "bg-slate-900 text-white"
                          : state === "past"
                            ? "bg-neutral-100 text-neutral-300 cursor-not-allowed"
                            : state === "full"
                              ? "bg-rose-50 text-rose-400 border border-rose-200 cursor-not-allowed"
                              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Lokasi Studio
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
              >
                <option value="Jakarta Barat — Jl. Raya Kb. Jeruk No.8, Kb. Jeruk, Jakarta Barat 11530">
                  Jakarta Barat
                </option>
                <option value="Jakarta Selatan — Jl. H. Syahrin No.3c 6, Gandaria Utara, Kebayoran Baru, Jakarta Selatan 12140">
                  Jakarta Selatan
                </option>
              </select>
            </div>
          </div>

          {/* Section 4: Data Pelanggan & Kode Promo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Jenis Kelamin <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["Wanita", "Pria"] as const).map((g) => {
                  const disabled = g === "Pria" && hasIntimate;
                  return (
                    <button
                      key={g}
                      type="button"
                      disabled={disabled}
                      onClick={() => selectGender(g)}
                      className={`px-3 py-2.5 text-xs font-semibold rounded-xl border transition-colors ${
                        disabled
                          ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                          : customerGender === g
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
              {hasIntimate && (
                <p className="text-[10px] text-neutral-400 mt-1">
                  * Pria tidak bisa memilih treatment ini
                </p>
              )}
              {customerGender === "Pria" && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Khusus pria: tambahan Rp7.000 per perawatan.
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Misal: Dian Sastrowardoyo"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Nomor WhatsApp <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Misal: 081234567890"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Email untuk Notifikasi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Misal: dian@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Konfirmasi booking, instruksi pembayaran & notifikasi dikirim ke
                email ini.
              </p>
            </div>

            {/* Temporarily hidden - promo code input field */}
            {/* <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Kode Voucher Promo
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoApplied(false);
                  }}
                  placeholder="Contoh: FIRSTBULU30"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-700"
                >
                  Terapkan
                </button>
              </div>
              {promoApplied && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  ✓ Voucher aktif! Potongan {discountPercent}% diterapkan.
                </p>
              )}
            </div> */}
          </div>

          {/* Price Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({selectedServices.length} Treatment):</span>
              <span className="font-mono">{formatRupiah(subtotal)}</span>
            </div>
            {maleSurcharge > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Khusus Pria (×{selectedServices.length} perawatan):</span>
                <span className="font-mono">
                  +{formatRupiah(maleSurcharge)}
                </span>
              </div>
            )}
            {/* Temporarily hidden - discount display */}
            {/* {promoApplied && (
              <div className="flex justify-between text-pink-600 font-semibold">
                <span>Diskon Promo ({discountPercent}%):</span>
                <span className="font-mono">
                  -{formatRupiah(discountAmount)}
                </span>
              </div>
            )} */}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
              <span>Total Estimasi:</span>
              <span className="text-base text-slate-900 font-mono">
                {formatRupiah(finalPrice)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              *Pembayaran dilakukan di kasir studio saat kedatangan (Cashless:
              QRIS, Debit, CC).
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col gap-3 shrink-0">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={() => handleFormSubmit()}
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 disabled:opacity-60"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>{submitting ? "Mengirim..." : "Simpan & Konfirmasi"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
