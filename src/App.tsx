import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  MapPin,
  Calendar,
  Clock,
  Share2,
  Copy,
  Check,
  Heart,
  Send,
  Edit3,
  User,
  ExternalLink,
  BookOpen,
  MessageSquare,
  Sparkles,
  Compass,
  Building2,
  CheckCircle2,
  PhoneCall,
  X,
  CreditCard,
  Gift,
  Flame,
  Music
} from 'lucide-react';

interface IslamicTrack {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: string;
  url: string;
}

const ISLAMIC_TRACKS: IslamicTrack[] = [
  {
    id: 'sholawat-vokal',
    title: 'Lantunan Sholawat Nabi (Vokal Syahdu)',
    subtitle: 'Allāhumma Sholli \'Alā Sayyidinā Muhammad Wa \'Alā Āli Sayyidinā Muhammad',
    category: 'Sholawat Pilihan',
    icon: '🌸',
    url: '/audio/sholawat1.mp3'
  },
  {
    id: 'sholawat-instrumen',
    title: 'Melodi Syahdu Nuansa Baitullah (Instrumen)',
    subtitle: 'Alunan Petikan Senar & Seruling Penyejuk Hati',
    category: 'Instrumen Syahdu',
    icon: '🌙',
    url: '/audio/sholawat2.mp3'
  }
];

interface Wish {
  id: string;
  name: string;
  relationship?: string;
  text: string;
  createdAt: string;
}

interface RSVPRecord {
  name: string;
  attendance: 'hadir' | 'ragu' | 'tidak_hadir';
  guestsCount: number;
  phone?: string;
  message?: string;
  submittedAt: string;
}

export default function App() {
  // --- Guest Name State & Management ---
  const [guestName, setGuestName] = useState<string>('Tamu Undangan Yang Berbahagia');
  const [guestTitle, setGuestTitle] = useState<string>('Bapak/Ibu/Saudara/i');
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState<boolean>(false);
  const [inputCustomName, setInputCustomName] = useState<string>('');
  const [inputCustomTitle, setInputCustomTitle] = useState<string>('Bapak/Ibu/Saudara/i');

  // --- Invitation Open State ---
  const [isOpened, setIsOpened] = useState<boolean>(false);

  // --- Audio State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<boolean>(false);
  const [isTalbiyahModalOpen, setIsTalbiyahModalOpen] = useState<boolean>(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Toast Notification ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- RSVP State ---
  const [rsvpName, setRsvpName] = useState<string>('');
  const [rsvpStatus, setRsvpStatus] = useState<'hadir' | 'ragu' | 'tidak_hadir'>('hadir');
  const [rsvpCount, setRsvpCount] = useState<number>(1);
  const [rsvpPhone, setRsvpPhone] = useState<string>('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState<boolean>(false);

  // --- Wishes / Buku Tamu State ---
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [newWishName, setNewWishName] = useState<string>('');
  const [newWishRelation, setNewWishRelation] = useState<string>('Alumni / Santri');
  const [newWishText, setNewWishText] = useState<string>('');
  const [isSubmittingWish, setIsSubmittingWish] = useState<boolean>(false);

  // --- Countdown State ---
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- Active Tab for Gift / Rekening ---
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  // 1. Initial Load: Parse URL query parameters & local storage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to') || params.get('nama') || params.get('name') || params.get('guest');
    const titleParam = params.get('title') || params.get('gelar');

    if (toParam) {
      const decoded = decodeURIComponent(toParam).trim();
      setGuestName(decoded);
      setInputCustomName(decoded);
      setRsvpName(decoded);
      setNewWishName(decoded);
    } else {
      setInputCustomName('Tamu Undangan Yang Berbahagia');
    }

    if (titleParam) {
      const decodedTitle = decodeURIComponent(titleParam).trim();
      setGuestTitle(decodedTitle);
      setInputCustomTitle(decodedTitle);
    }

    // Load initial wishes from localStorage or defaults
    const savedWishes = localStorage.getItem('walima_wishes_v2');
    if (savedWishes) {
      try {
        setWishes(JSON.parse(savedWishes));
      } catch (e) {
        setWishes(getDefaultWishes());
      }
    } else {
      setWishes(getDefaultWishes());
    }
  }, []);

  // 2. Countdown Timer targeting Sunday, 11 October at 13:30 WIB
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      let targetYear = now.getFullYear();
      // Target: 11 October 13:30:00 WIB (UTC+7)
      // In UTC, 13:30 WIB is 06:30 UTC
      let targetDate = new Date(`October 11, ${targetYear} 13:30:00 GMT+0700`);

      if (now.getTime() > targetDate.getTime()) {
        targetDate = new Date(`October 11, ${targetYear + 1} 13:30:00 GMT+0700`);
      }

      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const getDefaultWishes = (): Wish[] => [
    {
      id: '1',
      name: 'KH. Abdullah Syukri',
      relationship: 'Keluarga & Sahabat Pondok',
      text: 'Bismillahi majreeha wa mursaaha. Selamat menunaikan ibadah umroh kepada Guru Mulia KH. Badruzzaman & Nyai Rokibah. Semoga dikaruniai kesehatan prima, ibadah yang khusyuk, dan umroh yang mabrurah. Mohon doakan kami di Raudhah dan Multazam.',
      createdAt: 'Kemarin, 19:40'
    },
    {
      id: '2',
      name: 'Ustadz Muhammad Fathurrahman',
      relationship: 'Dewan Asatidz Ponpes Raudhotul Hidayah',
      text: 'Alhamdulillah, berkah melimpah untuk Abah Kiai dan Nyai. Semoga seluruh rangkaian manasik lancar tanpa aral melintang, senantiasa dalam lindungan serta ridho Allah SWT.',
      createdAt: 'Hari ini, 09:15'
    },
    {
      id: '3',
      name: 'H. Suwandi & Keluarga (Indramayu)',
      relationship: 'Alumni Santri',
      text: 'Insya Allah kami sekeluarga akan hadir pada walimatussafar ba\'da Dzuhur di Ponpes Kaplongan Lor. Selamat jalan menuju Baitullah Abah & Nyai, semoga mabrur.',
      createdAt: 'Hari ini, 11:30'
    }
  ];

  // --- Show Toast Helper ---
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // --- Open Invitation Action ---
  const handleOpenInvitation = () => {
    setIsOpened(true);

    // Trigger golden confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#facc15', '#ca8a04', '#10b981', '#ffffff']
      });
    } catch (e) {
      // ignore
    }

    // Play Islamic audio
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log('Autoplay policy caught, awaiting user tap', err);
          setIsPlaying(false);
        });
    }
  };

  // --- Toggle Audio ---
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          triggerToast('Klik tombol putar untuk mendengarkan lantunan sholawat');
        });
    }
  };

  // --- Change Islamic Audio Track ---
  const handleChangeTrack = (index: number) => {
    setCurrentTrackIndex(index);
    if (audioRef.current) {
      audioRef.current.src = ISLAMIC_TRACKS[index].url;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          triggerToast(`Memutar: ${ISLAMIC_TRACKS[index].title}`);
        })
        .catch((err) => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
          triggerToast(`Sentuh tombol putar untuk mendengarkan`);
        });
    }
  };

  // --- Apply Custom Guest Name & Title ---
  const handleApplyCustomName = () => {
    const finalName = inputCustomName.trim() || 'Tamu Undangan';
    const finalTitle = inputCustomTitle.trim() || 'Bapak/Ibu/Saudara/i';
    setGuestName(finalName);
    setGuestTitle(finalTitle);
    setRsvpName(finalName);
    setNewWishName(finalName);

    // Update URL query string without reloading page
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('to', finalName);
    newUrl.searchParams.set('title', finalTitle);
    window.history.replaceState({}, '', newUrl.toString());

    setIsEditNameModalOpen(false);
    triggerToast(`Nama tamu diubah menjadi "${finalName}"`);
  };

  // --- Generate Shareable URL & Copy to Clipboard ---
  const handleCopyCustomLink = () => {
    const targetName = inputCustomName.trim() || guestName;
    const targetTitle = inputCustomTitle.trim() || guestTitle;
    const baseUrl = window.location.origin + window.location.pathname;
    const shareableUrl = `${baseUrl}?to=${encodeURIComponent(targetName)}&title=${encodeURIComponent(targetTitle)}`;

    navigator.clipboard.writeText(shareableUrl)
      .then(() => {
        triggerToast('Tautan undangan khusus berhasil disalin!');
      })
      .catch(() => {
        // Fallback
        const el = document.createElement('textarea');
        el.value = shareableUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        triggerToast('Tautan undangan khusus berhasil disalin!');
      });
  };

  // --- Share Directly to WhatsApp ---
  const handleShareToWhatsApp = () => {
    const targetName = inputCustomName.trim() || guestName;
    const targetTitle = inputCustomTitle.trim() || guestTitle;
    const baseUrl = window.location.origin + window.location.pathname;
    const shareableUrl = `${baseUrl}?to=${encodeURIComponent(targetName)}&title=${encodeURIComponent(targetTitle)}`;

    const message = `*Assalamu'alaikum Warahmatullahi Wabarakatuh*\n\nKepada Yth. *${targetTitle} ${targetName}*,\n\nDengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk berkenan hadir dalam acara:\n\n✨ *Walimatussafar Umroh KH. Badruzzaman & Nyai Rokibah*\n🗓 *Minggu, 11 Oktober*\n🕐 *Pukul 13:30 WIB (Ba'da Dzuhur) - Selesai*\n📍 *Pondok Pesantren Raudhotul Hidayah, Desa Kaplongan Lor, Kec. Karang Ampel, Kab. Indramayu*\n\nInformasi lengkap dan konfirmasi kehadiran dapat dilihat melalui tautan undangan digital resmi berikut:\n👉 ${shareableUrl}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami atas kehadiran serta doa restunya.\n\n*Wassalamu'alaikum Warahmatullahi Wabarakatuh*\n_Keluarga Besar KH. Badruzzaman & Nyai Rokibah_`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // --- Copy Exact Address ---
  const handleCopyAddress = () => {
    const exactAddress = "Pondok Pesantren Raudhotul Hidayah, Desa Kaplongan Lor, Kecamatan Karang Ampel, Kabupaten Indramayu, Jawa Barat";
    navigator.clipboard.writeText(exactAddress)
      .then(() => triggerToast('Alamat Ponpes Raudhotul Hidayah berhasil disalin!'))
      .catch(() => {
        const el = document.createElement('textarea');
        el.value = exactAddress;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        triggerToast('Alamat berhasil disalin!');
      });
  };

  // --- Save to Google Calendar ---
  const handleSaveToCalendar = () => {
    const title = encodeURIComponent("Walimatussafar Umroh KH. Badruzzaman & Nyai Rokibah");
    const details = encodeURIComponent("Acara Syukuran & Doa Bersama Walimatussafar Umroh KH. Badruzzaman & Nyai Rokibah di Pondok Pesantren Raudhotul Hidayah Kaplongan Lor, Karang Ampel, Indramayu.");
    const location = encodeURIComponent("Pondok Pesantren Raudhotul Hidayah, Desa Kaplongan Lor, Kecamatan Karang Ampel, Kabupaten Indramayu");
    // Date: 11 October at 13:30 WIB (06:30 UTC) to 17:00 WIB (10:00 UTC)
    const currentYear = new Date().getFullYear();
    const dates = `${currentYear}1011T063000Z/${currentYear}1011T100000Z`;
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
    window.open(calUrl, '_blank');
  };

  // --- Submit RSVP Form ---
  const handleSubmitRSVP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) {
      triggerToast('Mohon masukkan nama Anda');
      return;
    }

    const newRecord: RSVPRecord = {
      name: rsvpName,
      attendance: rsvpStatus,
      guestsCount: rsvpCount,
      phone: rsvpPhone,
      submittedAt: new Date().toISOString()
    };

    // Save in LocalStorage
    try {
      const existing = localStorage.getItem('walima_rsvps');
      const list = existing ? JSON.parse(existing) : [];
      list.push(newRecord);
      localStorage.setItem('walima_rsvps', JSON.stringify(list));
    } catch (err) {
      // ignore
    }

    setRsvpSubmitted(true);
    triggerToast(`Konfirmasi kehadiran berhasil dikirim! Jazakumullah khairan katsiran.`);
  };

  // --- Submit Wish Form ---
  const handleSubmitWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishName.trim() || !newWishText.trim()) {
      triggerToast('Mohon lengkapi nama dan doa restu Anda');
      return;
    }

    setIsSubmittingWish(true);
    const newEntry: Wish = {
      id: Date.now().toString(),
      name: newWishName.trim(),
      relationship: newWishRelation,
      text: newWishText.trim(),
      createdAt: 'Baru saja'
    };

    const updated = [newEntry, ...wishes];
    setWishes(updated);
    try {
      localStorage.setItem('walima_wishes_v2', JSON.stringify(updated));
    } catch (err) {
      // ignore
    }

    setNewWishText('');
    setIsSubmittingWish(false);
    triggerToast('Doa & ucapan Anda berhasil dikirim ke buku tamu!');
  };

  // --- Copy Bank Account Number ---
  const handleCopyBankNumber = (accNo: string, bankName: string) => {
    navigator.clipboard.writeText(accNo)
      .then(() => {
        setCopiedBank(bankName);
        triggerToast(`Nomor rekening ${bankName} (${accNo}) a.n. Muhammad Muslihul Anam berhasil disalin!`);
        setTimeout(() => setCopiedBank(null), 3000);
      })
      .catch(() => {
        triggerToast(`Nomor rekening ${accNo} berhasil disalin!`);
      });
  };

  return (
    <div className="min-h-screen bg-emerald-950 font-sans text-slate-800 relative selection:bg-amber-400 selection:text-emerald-950">

      {/* --- HIDDEN AUDIO TAG: MUSIK ISLAMI --- */}
      <audio
        ref={audioRef}
        src={ISLAMIC_TRACKS[currentTrackIndex].url}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          console.warn('Audio stream error, switching to next Islamic track.');
          const nextIdx = (currentTrackIndex + 1) % ISLAMIC_TRACKS.length;
          setCurrentTrackIndex(nextIdx);
          if (audioRef.current) {
            audioRef.current.src = ISLAMIC_TRACKS[nextIdx].url;
            audioRef.current.load();
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }}
      />

      {/* --- FLOATING CONTROLS: SHOLAWATAN & TALBIYAH --- */}
      {isOpened && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          {/* Sholawat / Islamic Music Selector Button */}
          <button
            onClick={() => setIsMusicModalOpen(true)}
            title="Pilih Lagu Sholawatan"
            className="h-10 px-3 rounded-full bg-emerald-900/90 text-amber-300 border border-amber-400/40 shadow-xl flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all backdrop-blur-md text-xs font-semibold"
          >
            <Music className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Sholawatan</span>
          </button>

          {/* Quick Talbiyah Lyrics Button */}
          <button
            onClick={() => setIsTalbiyahModalOpen(true)}
            title="Lafadz Talbiyah"
            className="w-10 h-10 rounded-full bg-emerald-900/90 text-amber-300 border border-amber-400/40 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all backdrop-blur-md"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Audio Play/Pause Button with Equalizer effect */}
          <button
            onClick={togglePlayAudio}
            title={isPlaying ? "Jeda Sholawatan" : "Putar Sholawatan"}
            className="h-10 px-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-emerald-950 font-bold shadow-2xl border border-amber-300/60 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <>
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span className="text-xs font-semibold hidden sm:inline">Sholawat</span>
                {/* Visualizer bars */}
                <span className="flex items-end gap-0.5 h-3.5">
                  <span className="w-1 bg-emerald-950 rounded-full animate-pulse h-2.5"></span>
                  <span className="w-1 bg-emerald-950 rounded-full animate-pulse h-3.5 delay-75"></span>
                  <span className="w-1 bg-emerald-950 rounded-full animate-pulse h-1.5 delay-150"></span>
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="text-xs font-semibold hidden sm:inline">Nyalakan</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* --- FLOATING TOAST NOTIFICATION --- */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-emerald-900/95 text-amber-200 px-5 py-3 rounded-2xl shadow-2xl border border-amber-400/40 text-xs sm:text-sm font-medium flex items-center gap-3 backdrop-blur-md animate-gentle-pulse">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. COVER / HERO OVERLAY (AMPLOP MIHRAB ISLAMI MEWAH)           */}
      {/* ============================================================== */}
      <div
        className={`fixed inset-0 max-w-lg mx-auto z-40 bg-islamic-pattern text-white flex flex-col justify-between items-center p-6 sm:p-8 text-center transition-all duration-700 ease-in-out shadow-2xl border-x border-amber-500/20 ${
          isOpened ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Ornate Top Dome Arch */}
        <div className="pt-4 flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-b from-amber-400/20 to-emerald-900/60 border-2 border-amber-400/60 flex items-center justify-center shadow-lg shadow-amber-400/10">
              {/* Islamic Kaaba & Crescent SVG */}
              <div className="text-amber-300 text-3xl animate-lantern">
                🕋
              </div>
            </div>
            <div className="absolute -top-1.5 -right-1 text-amber-300 animate-spin" style={{ animationDuration: '16s' }}>
              ✦
            </div>
            <div className="absolute -bottom-1 -left-1 text-amber-400 text-xs">
              ✦
            </div>
          </div>

          <p className="font-arabic text-2xl sm:text-3xl text-amber-300 tracking-wide font-bold">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <span className="inline-block mt-2 px-3 py-1 bg-amber-400/15 border border-amber-400/40 rounded-full text-[11px] font-semibold text-amber-300 tracking-widest uppercase">
            Walimatussafar Umroh
          </span>
        </div>

        {/* Center: Main Calon Jamaah & Recipient Guest Card */}
        <div className="my-auto w-full space-y-4 py-4">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/90 font-medium">
            Undangan Istimewa Doa Bersama
          </p>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold font-kufi text-amber-300 drop-shadow-md">
              KH. Badruzzaman
            </h1>
            <p className="font-arabic text-xl text-amber-200/80 font-normal">&</p>
            <h1 className="text-2xl sm:text-3xl font-bold font-kufi text-amber-300 drop-shadow-md">
              Nyai Rokibah
            </h1>
          </div>

          <p className="text-[12px] text-emerald-200/80 max-w-xs mx-auto">
            Pengasuh Pondok Pesantren Raudhotul Hidayah Kaplongan Lor, Karang Ampel, Indramayu
          </p>

          <div className="pt-2 pb-1">
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
          </div>

          {/* GUEST CARD WITH EDIT BUTTON */}
          <div className="bg-emerald-950/80 border border-amber-400/40 rounded-3xl p-5 shadow-2xl relative backdrop-blur-md max-w-sm mx-auto">
            <div className="flex items-center justify-between text-left mb-1.5">
              <span className="text-[11px] text-emerald-300/90 font-light flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Kepada Yth. {guestTitle}:
              </span>
              <button
                onClick={() => {
                  setInputCustomName(guestName);
                  setInputCustomTitle(guestTitle);
                  setIsEditNameModalOpen(true);
                }}
                className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1 rounded-full border border-amber-400/40 transition active:scale-95"
              >
                <Edit3 className="w-3 h-3" />
                <span>Ubah Nama</span>
              </button>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-amber-300 font-sans tracking-wide capitalize py-1">
              {guestName}
            </h3>

            <p className="text-[10px] text-emerald-200/70 border-t border-amber-400/20 pt-2 mt-1">
              Mohon maaf apabila ada kesalahan penulisan nama atau gelar
            </p>
          </div>
        </div>

        {/* Bottom CTA: Open Invitation Button */}
        <div className="w-full pb-4 max-w-sm mx-auto space-y-3">
          <button
            onClick={handleOpenInvitation}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-emerald-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2.5 group"
          >
            <Sparkles className="w-4 h-4 text-emerald-950 group-hover:rotate-12 transition-transform" />
            <span>Buka Undangan</span>
            <span className="font-arabic text-base ml-1">بِسْمِ اللَّهِ</span>
          </button>

          <p className="text-[10px] text-emerald-300/60">
            Sentuh tombol di atas untuk membuka undangan & memutar lantunan Talbiyah
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN SCROLLABLE INVITATION PAGE                              */}
      {/* ============================================================== */}
      <div className="max-w-lg mx-auto min-h-screen bg-moroccan-light shadow-2xl relative overflow-hidden flex flex-col border-x border-amber-400/30">

        {/* HERO SECTION / HEADER */}
        <header className="relative bg-islamic-pattern pt-10 pb-16 px-6 text-center text-white rounded-b-[3rem] shadow-2xl border-b-2 border-amber-500/40 overflow-hidden">
          {/* Subtle gold aura */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4">
            <div className="inline-block p-2 rounded-full border border-amber-400/40 bg-emerald-900/60 shadow-md">
              <span className="text-2xl animate-lantern inline-block">🕌</span>
            </div>

            <p className="font-arabic text-3xl sm:text-4xl text-amber-300 font-bold tracking-wide">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>

            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400/50 rounded-full text-xs font-semibold text-amber-300 tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Walimatussafar Umroh</span>
            </div>

            <div className="space-y-1 pt-1">
              <h2 className="text-2xl sm:text-3xl font-bold font-kufi text-slate-100">
                KH. Badruzzaman
              </h2>
              <p className="text-amber-300 font-arabic text-lg">&</p>
              <h2 className="text-2xl sm:text-3xl font-bold font-kufi text-slate-100">
                Nyai Rokibah
              </h2>
            </div>

            <p className="text-xs text-emerald-200/90 font-medium">
              Pondok Pesantren Raudhotul Hidayah Kaplongan Lor, Karang Ampel, Indramayu
            </p>

            {/* Ayat Quran QS Al-Baqarah 196 */}
            <div className="pt-3 max-w-sm mx-auto">
              <div className="bg-emerald-900/70 border border-amber-400/30 rounded-2xl p-4 shadow-inner">
                <p className="font-arabic text-xl text-amber-200 leading-loose" dir="rtl">
                  وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ
                </p>
                <p className="text-[11px] text-emerald-100 mt-2 italic leading-relaxed">
                  "Dan sempurnakanlah ibadah haji dan umroh karena Allah."
                </p>
                <span className="inline-block mt-1 text-[10px] text-amber-300 font-semibold">
                  (QS. Al-Baqarah: 196)
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* SALAM & INTRODUCTORY CARD */}
        <section className="px-5 -mt-8 relative z-20">
          <div className="bg-white/95 rounded-3xl p-6 shadow-xl border border-amber-300/60 text-center space-y-4 backdrop-blur-md">
            <p className="font-arabic text-xl sm:text-2xl text-emerald-950 font-bold">
              السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ
            </p>

            <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-sans">
              Segala puji dan syukur kita panjatkan kehadirat Allah SWT atas limpahan rahmat, taufiq, serta hidayah-Nya. Shalawat serta salam semoga senantiasa tercurah kepada junjungan kita Nabi Agung Muhammad SAW.
            </p>

            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-emerald-900 leading-relaxed">
              Dengan memohon ridho dan barakah Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam rangka acara <strong>Walimatussafar Umroh (Syukuran & Doa Bersama)</strong> atas rencana keberangkatan ibadah Umroh ke Tanah Suci Makkah Al-Mukarramah & Madinah Al-Munawwarah.
            </div>

            <div className="pt-1 border-t border-amber-200/60 flex items-center justify-between text-left">
              <div>
                <span className="text-[10px] text-slate-500 block">Undangan Teruntuk:</span>
                <span className="text-xs font-bold text-emerald-900 capitalize">
                  {guestTitle} {guestName}
                </span>
              </div>
              <button
                onClick={() => {
                  setInputCustomName(guestName);
                  setInputCustomTitle(guestTitle);
                  setIsEditNameModalOpen(true);
                }}
                className="text-[11px] text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-full font-medium transition flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>Ganti Nama</span>
              </button>
            </div>
          </div>
        </section>

        {/* SHOLAWATAN BANNER & AUDIO PLAYER CARD */}
        <section className="px-5 mt-6">
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-emerald-900 text-white rounded-3xl p-5 shadow-xl border border-amber-400/40 relative overflow-hidden space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{ISLAMIC_TRACKS[currentTrackIndex].icon}</span>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                    Lagu Latar Sholawatan:
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {ISLAMIC_TRACKS[currentTrackIndex].title}
                  </h4>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMusicModalOpen(true)}
                  className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-amber-300 border border-amber-400/40 rounded-full text-[11px] font-semibold flex items-center gap-1 transition"
                  title="Pilih Sholawat Lain"
                >
                  <Music className="w-3 h-3 text-amber-400" />
                  <span>Pilih</span>
                </button>
                <button
                  onClick={togglePlayAudio}
                  className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 rounded-full text-xs font-bold flex items-center gap-1.5 hover:brightness-105 transition shadow-md active:scale-95"
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isPlaying ? 'Jeda' : 'Putar'}</span>
                </button>
              </div>
            </div>

            {/* Quick Track Switcher Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {ISLAMIC_TRACKS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => handleChangeTrack(idx)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition flex items-center gap-1 shrink-0 ${
                    currentTrackIndex === idx
                      ? 'bg-amber-400 text-emerald-950 font-bold shadow'
                      : 'bg-emerald-950/80 text-emerald-200 border border-amber-400/20 hover:bg-emerald-900'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.category}</span>
                </button>
              ))}
            </div>

            {/* Sholawat Calligraphy & Lafadz */}
            <div className="bg-emerald-950/80 rounded-2xl p-4 border border-amber-400/20 text-center space-y-2">
              <p className="font-arabic text-lg sm:text-xl text-amber-200 leading-loose" dir="rtl">
                اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ
              </p>
              <p className="text-[11px] text-emerald-200 italic">
                "Allāhumma sholli 'alā Sayyidinā Muhammad wa 'alā āli Sayyidinā Muhammad"
              </p>
              <p className="text-[10px] text-slate-300 border-t border-emerald-800/80 pt-1.5">
                Semoga berkah sholawat senantiasa melimpah dan mengiringi keselamatan safar KH. Badruzzaman & Nyai Rokibah menuju Baitullah.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                onClick={() => setIsTalbiyahModalOpen(true)}
                className="text-[11px] text-amber-300 underline underline-offset-2 flex items-center gap-1 hover:text-amber-200"
              >
                <BookOpen className="w-3 h-3" />
                <span>Lihat Teks Talbiyah Lengkap</span>
              </button>
              {isPlaying ? (
                <span className="text-[10px] text-amber-400 animate-pulse flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Sholawatan Berputar
                </span>
              ) : (
                <span className="text-[10px] text-emerald-300/70">
                  Audio dijeda
                </span>
              )}
            </div>
          </div>
        </section>

        {/* COUNTDOWN TIMER SECTION */}
        <section className="px-5 mt-6">
          <div className="bg-emerald-950 text-white rounded-3xl p-6 text-center shadow-xl border border-amber-400/40 relative">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-400" />
              <p className="text-xs uppercase tracking-widest text-amber-300 font-bold">
                Menuju Hari Acara Walimatussafar
              </p>
            </div>
            <p className="text-[11px] text-emerald-200 mb-4">
              Minggu, 11 Oktober • Pukul 13:30 WIB
            </p>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 border border-amber-400/30 rounded-2xl p-2.5 shadow-inner">
                <span className="block text-2xl sm:text-3xl font-bold font-mono text-amber-300">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">Hari</span>
              </div>
              <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 border border-amber-400/30 rounded-2xl p-2.5 shadow-inner">
                <span className="block text-2xl sm:text-3xl font-mono font-bold text-amber-300">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">Jam</span>
              </div>
              <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 border border-amber-400/30 rounded-2xl p-2.5 shadow-inner">
                <span className="block text-2xl sm:text-3xl font-mono font-bold text-amber-300">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">Menit</span>
              </div>
              <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 border border-amber-400/30 rounded-2xl p-2.5 shadow-inner">
                <span className="block text-2xl sm:text-3xl font-mono font-bold text-amber-300">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">Detik</span>
              </div>
            </div>

            <button
              onClick={handleSaveToCalendar}
              className="mt-5 w-full py-2.5 px-4 bg-emerald-900/80 hover:bg-emerald-900 text-amber-300 text-xs font-semibold rounded-xl border border-amber-400/30 flex items-center justify-center gap-2 transition"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Ingatkan di Google Calendar</span>
            </button>
          </div>
        </section>

        {/* WAKTU & LOKASI ACARA (UPDATED TO 13:30 & PONPES RAUDHOTUL HIDAYAH) */}
        <section className="px-5 mt-8 space-y-4">
          <div className="text-center">
            <span className="text-xs uppercase font-bold text-amber-700 tracking-widest block">
              Detail Pelaksanaan
            </span>
            <h3 className="text-xl font-bold text-emerald-950 font-kufi">Waktu & Tempat Acara</h3>
            <div className="w-14 h-0.5 bg-amber-500 mx-auto mt-1 rounded-full"></div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl space-y-6 border border-amber-300/50">
            {/* Waktu Pelaksanaan: 13:30 WIB */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0 border border-amber-400/30">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider block">
                  Hari & Tanggal
                </span>
                <p className="text-base font-bold text-slate-800">
                  Minggu, 11 Oktober
                </p>
                {/* WAKTU DIUBAH DARI 08:30 KE 13:30 */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold mt-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pukul 13.30 WIB (Ba'da Dzuhur) s/d Selesai</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200/80"></div>

            {/* Lokasi Pelaksanaan: Pondok Pesantren Raudhotul Hidayah */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800/10 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-700/20">
                <Building2 className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider block">
                  Tempat / Lokasi Acara
                </span>
                <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  Pondok Pesantren Raudhotul Hidayah
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Desa Kaplongan Lor, Kecamatan Karang Ampel, Kabupaten Indramayu, Jawa Barat
                </p>
              </div>
            </div>

            {/* Action Buttons: Copy Address & Google Maps */}
            <div className="pt-2 grid grid-cols-2 gap-3">
              <button
                onClick={handleCopyAddress}
                className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Copy className="w-3.5 h-3.5 text-amber-600" />
                <span>Salin Alamat</span>
              </button>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Pondok+Pesantren+Raudhotul+Hidayah+Kaplongan+Lor+Karangampel+Indramayu"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-2xl bg-emerald-900 hover:bg-emerald-950 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Buka di Peta</span>
              </a>
            </div>
          </div>
        </section>

        {/* SUSUNAN ACARA / RUNDOWN */}
        <section className="px-5 mt-8">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-amber-300/40 space-y-4">
            <div className="text-center">
              <span className="text-[11px] uppercase font-bold text-amber-700 tracking-wider">
                Agenda Kegiatan
              </span>
              <h3 className="text-lg font-bold text-emerald-950 font-kufi">Susunan Acara Walimah</h3>
              <div className="w-10 h-0.5 bg-amber-500 mx-auto mt-1 rounded-full"></div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                <span className="px-2 py-1 rounded-lg bg-emerald-900 text-amber-300 font-bold shrink-0 text-[10px]">
                  13:30 WIB
                </span>
                <div>
                  <h5 className="font-bold text-slate-800">Pembukaan & Hadroh Sholawat</h5>
                  <p className="text-slate-500 text-[11px] mt-0.5">Penyambutan tamu undangan & lantunan puji-pujian santri</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200">
                <span className="px-2 py-1 rounded-lg bg-emerald-900 text-amber-300 font-bold shrink-0 text-[10px]">
                  14:00 WIB
                </span>
                <div>
                  <h5 className="font-bold text-slate-800">Pembacaan Ayat Suci & Tahlil Bersama</h5>
                  <p className="text-slate-500 text-[11px] mt-0.5">Tawassul & doa keselamatan safar para jamaah umroh</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200">
                <span className="px-2 py-1 rounded-lg bg-emerald-900 text-amber-300 font-bold shrink-0 text-[10px]">
                  14:30 WIB
                </span>
                <div>
                  <h5 className="font-bold text-slate-800">Mau'idzah Hasanah & Sambutan</h5>
                  <p className="text-slate-500 text-[11px] mt-0.5">Nasihat hikmah umroh & permohonan doa restu dari shahibul bait</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200">
                <span className="px-2 py-1 rounded-lg bg-emerald-900 text-amber-300 font-bold shrink-0 text-[10px]">
                  15:15 WIB
                </span>
                <div>
                  <h5 className="font-bold text-slate-800">Mushofahah & Ramah Tamah</h5>
                  <p className="text-slate-500 text-[11px] mt-0.5">Saling bermaafan, pemberian doa restu, serta jamuan hidangan</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DOA SAFAR & TITIP DOA TANAH SUCI */}
        <section className="px-5 mt-8">
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-emerald-900 text-white rounded-3xl p-6 shadow-xl border border-amber-400/40 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-400/15 border border-amber-400/40 mx-auto flex items-center justify-center text-amber-300 text-xl">
              🤲
            </div>

            <h3 className="text-lg font-bold font-kufi text-amber-300">
              Doa Pelepasan Keberangkatan (Doa Safar)
            </h3>

            <div className="bg-emerald-950/90 rounded-2xl p-4 border border-amber-400/20 space-y-3">
              <p className="font-arabic text-lg sm:text-xl text-amber-200 leading-loose" dir="rtl">
                زَوَّدَكَ اللَّهُ التَّقْوَى وَغَفَرَ ذَنْبَكَ وَيَسَّرَ لَكَ الْخَيْرَ حَيْثُمَا كُنْتَ
              </p>
              <p className="text-[11px] text-emerald-200 italic">
                "Zawwadakallāhut-taqwā, wa ghafara dzanbaka, wa yassara lakal-khaira haitsumā kunta."
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed border-t border-emerald-800 pt-2">
                "Semoga Allah membekalimu dengan ketakwaan, mengampuni dosamu, dan memudahkan kebaikan bagimu di mana pun engkau berada."
              </p>
            </div>

            <div className="pt-2">
              <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-3.5 text-xs text-amber-200 leading-relaxed">
                <span className="font-bold block text-amber-300 mb-1">Doa Menjadi Umroh Mabrurah:</span>
                اللَّهُمَّ اجْعَلْهَا عُمْرَةً مَبْرُورَةً، وَذَنْبًا مَغْفُورًا، وَسَعْيًا مَشْكُورًا
                <span className="block text-[10px] text-emerald-200 mt-1 italic">
                  "Ya Allah jadikanlah umroh ini mabrur, dosa yang diampuni, dan usaha yang disyukuri."
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CUSTOM INVITATION GENERATOR / TOOL BAGIKAN KE TEMAN */}
        <section className="px-5 mt-8">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-amber-500/10 rounded-3xl p-5 border-2 border-dashed border-amber-400/50 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h4 className="text-sm font-bold text-emerald-950">
                Ingin Mengirimkan Undangan Atas Nama Orang Lain?
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Anda dapat mengubah nama tamu kapan saja untuk membuat tautan undangan khusus bagi sahabat, keluarga, atau relasi Anda.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setInputCustomName('');
                  setInputCustomTitle('Bapak/Ibu/Saudara/i');
                  setIsEditNameModalOpen(true);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition shadow-md"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Buat Nama Undangan Baru</span>
              </button>
            </div>
          </div>
        </section>

        {/* RSVP FORM */}
        <section className="px-5 mt-8">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-amber-300/40 space-y-4">
            <div className="text-center">
              <span className="text-[11px] uppercase font-bold text-amber-700 tracking-wider">
                Konfirmasi Kehadiran
              </span>
              <h3 className="text-lg font-bold text-emerald-950 font-kufi">Formulir RSVP</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bantu shahibul bait mempersiapkan tempat dan hidangan dengan mengonfirmasi kehadiran Anda.
              </p>
            </div>

            {rsvpSubmitted ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Konfirmasi Anda Telah Diterima</h4>
                <p className="text-xs text-emerald-700">
                  Terima kasih banyak atas konfirmasinya. Semoga langkah Bapak/Ibu senantiasa diberkahi.
                </p>
                <button
                  onClick={() => setRsvpSubmitted(false)}
                  className="text-xs text-emerald-800 underline mt-2 font-semibold"
                >
                  Ubah Konfirmasi Kehadiran
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRSVP} className="space-y-4 pt-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap / Instansi
                  </label>
                  <input
                    type="text"
                    required
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="Contoh: H. Syamsuddin & Keluarga"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status Kehadiran
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRsvpStatus('hadir')}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold text-center transition ${
                        rsvpStatus === 'hadir'
                          ? 'bg-emerald-850 text-white border-emerald-900 bg-emerald-900'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      ✓ Insya Allah Hadir
                    </button>
                    <button
                      type="button"
                      onClick={() => setRsvpStatus('ragu')}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold text-center transition ${
                        rsvpStatus === 'ragu'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      ? Masih Ragu
                    </button>
                    <button
                      type="button"
                      onClick={() => setRsvpStatus('tidak_hadir')}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold text-center transition ${
                        rsvpStatus === 'tidak_hadir'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      ✕ Berhalangan
                    </button>
                  </div>
                </div>

                {rsvpStatus === 'hadir' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Jumlah Orang yang Hadir
                    </label>
                    <select
                      value={rsvpCount}
                      onChange={(e) => setRsvpCount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                    >
                      <option value={1}>1 Orang</option>
                      <option value={2}>2 Orang</option>
                      <option value={3}>3 Orang</option>
                      <option value={4}>4 Orang</option>
                      <option value={5}>5 Orang atau Rombongan</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. WhatsApp (Opsional)
                  </label>
                  <input
                    type="tel"
                    value={rsvpPhone}
                    onChange={(e) => setRsvpPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-slate-50/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-emerald-950 font-bold text-xs shadow-md hover:brightness-105 active:scale-95 transition"
                >
                  Kirim Konfirmasi Kehadiran
                </button>
              </form>
            )}
          </div>
        </section>

        {/* BUKU TAMU & DOA RESTU */}
        <section className="px-5 mt-8">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-amber-300/40 space-y-4">
            <div className="text-center">
              <span className="text-[11px] uppercase font-bold text-amber-700 tracking-wider">
                Untaian Doa & Harapan
              </span>
              <h3 className="text-lg font-bold text-emerald-950 font-kufi">Buku Tamu & Doa Mabrur</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kirimkan untaian doa keselamatan untuk KH. Badruzzaman & Nyai Rokibah.
              </p>
            </div>

            <form onSubmit={handleSubmitWish} className="space-y-3 pt-2 text-xs">
              <div>
                <input
                  type="text"
                  required
                  value={newWishName}
                  onChange={(e) => setNewWishName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={newWishRelation}
                  onChange={(e) => setNewWishRelation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white text-slate-700"
                >
                  <option value="Alumni / Santri">Alumni / Santri Ponpes</option>
                  <option value="Keluarga Besar">Keluarga Besar</option>
                  <option value="Sahabat / Kerabat">Sahabat / Kerabat</option>
                  <option value="Masyarakat Kaplongan Lor">Warga / Tetangga</option>
                  <option value="Umum">Tamu Undangan Umum</option>
                </select>
              </div>

              <div>
                <textarea
                  rows={3}
                  required
                  value={newWishText}
                  onChange={(e) => setNewWishText(e.target.value)}
                  placeholder="Tuliskan ucapan selamat dan doa keberkahan umroh..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingWish}
                className="w-full py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>Kirim Doa Restu</span>
              </button>
            </form>

            {/* List of Wishes */}
            <div className="space-y-3 pt-3 max-h-80 overflow-y-auto pr-1">
              {wishes.map((w) => (
                <div
                  key={w.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-amber-200/50 shadow-sm text-left space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-900 text-amber-300 text-[10px] font-bold flex items-center justify-center">
                        {w.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-emerald-950 leading-tight">
                          {w.name}
                        </h5>
                        {w.relationship && (
                          <span className="text-[9px] text-amber-700 font-medium">
                            {w.relationship}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">{w.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pl-7">
                    {w.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TANDA KASIH & SHODAQOH / KADO DIGITAL (OPSIONAL) */}
        <section className="px-5 mt-8">
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-emerald-900 text-white rounded-3xl p-6 shadow-xl border border-amber-400/30 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 mx-auto flex items-center justify-center text-amber-300">
              <Gift className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold font-kufi text-amber-300">
              Tanda Kasih & Doa Hadiah
            </h3>

            <p className="text-xs text-emerald-100/90 leading-relaxed max-w-xs mx-auto">
              Bagi Bapak/Ibu/Saudara/i yang berhalangan hadir namun berkehendak memberikan tanda kasih atau titip doa & shodaqoh jariyah untuk santri/pesantren, dapat melalui rekening berikut:
            </p>

            <button
              onClick={() => setShowGiftModal(!showGiftModal)}
              className="py-2.5 px-5 rounded-full bg-amber-400 text-emerald-950 font-bold text-xs shadow-md hover:bg-amber-300 transition"
            >
              {showGiftModal ? 'Tutup Informasi Rekening' : 'Lihat Nomor Rekening / Amplop Digital'}
            </button>

            {showGiftModal && (
              <div className="pt-3 space-y-3 animate-gentle-pulse">
                {/* Bank Mandiri - Satu-Satunya Rekening */}
                <div className="bg-gradient-to-br from-[#0c2340] via-[#102d54] to-[#081a30] rounded-2xl p-4 sm:p-5 border-2 border-amber-400/50 text-left space-y-3 shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-900 font-extrabold text-xs flex items-center justify-center shadow">
                        M
                      </div>
                      <div>
                        <span className="text-sm font-bold text-amber-300 block">Bank Mandiri</span>
                        <span className="text-[10px] text-emerald-200">Rekening Resmi Walimatussafar</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-medium">
                      Terverifikasi
                    </span>
                  </div>

                  <div className="bg-black/35 rounded-xl p-3.5 border border-amber-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-emerald-300/80 block uppercase tracking-wider font-semibold">
                        Nomor Rekening
                      </span>
                      <p className="font-mono text-lg sm:text-xl font-bold text-amber-300 tracking-wider select-all">
                        1340025983510
                      </p>
                      <span className="text-[11px] text-slate-200 block mt-0.5">
                        Atas Nama: <strong className="text-amber-200 font-bold">Muhammad Muslihul Anam</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyBankNumber("1340025983510", "Bank Mandiri")}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shadow-md self-start sm:self-center shrink-0"
                    >
                      {copiedBank === "Bank Mandiri" ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-950" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-emerald-950" />
                          <span>Salin No. Rekening</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] text-emerald-200/70 text-center italic">
                    Konfirmasi transfer dan doa titipan dapat disampaikan melalui formulir buku tamu atau WhatsApp panitia.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CLOSING / FOOTER */}
        <footer className="px-5 mt-10 pb-16 text-center space-y-6">
          <div className="bg-islamic-pattern text-white rounded-3xl p-6 shadow-2xl border border-amber-400/40 space-y-4">
            <p className="text-xs text-emerald-200 leading-relaxed">
              Ungkapan terima kasih yang tulus kami haturkan atas segala doa, perhatian, dan kesediaan Bapak/Ibu/Saudara/i untuk meluangkan waktu hadir dalam majelis doa bersama ini.
            </p>

            <p className="font-arabic text-lg text-amber-300 font-bold">
              وَالسَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ
            </p>

            <div className="border-t border-amber-400/20 pt-4">
              <p className="text-[11px] text-emerald-300">Hormat Kami yang Mengundang,</p>
              <h4 className="text-base font-bold text-amber-300 mt-0.5 font-kufi">
                Keluarga Besar KH. Badruzzaman & Nyai Rokibah
              </h4>
              <p className="text-[11px] text-emerald-200/80 mt-1">
                Pondok Pesantren Raudhotul Hidayah Kaplongan Lor
              </p>
            </div>
          </div>

          {/* Quick Share to WhatsApp */}
          <button
            onClick={handleShareToWhatsApp}
            className="w-full py-3.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xl flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Bagikan Undangan Ini via WhatsApp</span>
          </button>

          <p className="text-[10px] text-slate-400">
            Undangan Digital Walimatussafar Umroh • Ponpes Raudhotul Hidayah Kaplongan Lor Karang Ampel
          </p>
        </footer>
      </div>

      {/* ============================================================== */}
      {/* 3. MODAL: UBAH NAMA TAMU & BUAT UNDANGAN KHUSUS                 */}
      {/* ============================================================== */}
      {isEditNameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-amber-300/80 space-y-4 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsEditNameModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-2">
                <Edit3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-emerald-950 font-kufi">
                Ubah Nama Undangan
              </h3>
              <p className="text-xs text-slate-500">
                Ketik nama tamu untuk menyesuaikan tampilan undangan atau membuat tautan yang bisa dibagikan langsung.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Panggilan / Gelar
                </label>
                <select
                  value={inputCustomTitle}
                  onChange={(e) => setInputCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                >
                  <option value="Bapak/Ibu/Saudara/i">Bapak/Ibu/Saudara/i</option>
                  <option value="Keluarga Besar">Keluarga Besar</option>
                  <option value="Ustadz / Ustadzah">Ustadz / Ustadzah</option>
                  <option value="Kiai / Nyai">Kiai / Nyai</option>
                  <option value="Gus / Ning">Gus / Ning</option>
                  <option value="Sahabat Santri">Sahabat Santri</option>
                  <option value="Alumni">Alumni</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Tamu / Penerima
                </label>
                <input
                  type="text"
                  value={inputCustomName}
                  onChange={(e) => setInputCustomName(e.target.value)}
                  placeholder="Contoh: H. M. Syahrul Ramadhan"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Live Preview Card */}
              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-center">
                <span className="text-[10px] text-slate-400 block">Tampilan di kartu undangan:</span>
                <p className="text-xs font-bold text-emerald-950 mt-0.5">
                  Kepada Yth. {inputCustomTitle}:
                </p>
                <p className="text-sm font-extrabold text-amber-700 capitalize mt-0.5">
                  {inputCustomName.trim() || 'Tamu Undangan'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleApplyCustomName}
                className="w-full py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Terapkan Nama Ini di Halaman</span>
              </button>

              <button
                onClick={handleCopyCustomLink}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border border-slate-300"
              >
                <Copy className="w-3.5 h-3.5 text-amber-600" />
                <span>Salin Tautan Khusus Untuk Nama Ini</span>
              </button>

              <button
                onClick={handleShareToWhatsApp}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Kirim via WhatsApp ke Nama Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODAL: LAFADZ TALBIYAH & MAKNANYA                           */}
      {/* ============================================================== */}
      {isTalbiyahModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-amber-300/80 space-y-4 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsTalbiyahModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-2xl">🕋</span>
              <h3 className="text-base font-bold text-emerald-950 font-kufi">
                Lafadz & Makna Talbiyah
              </h3>
              <p className="text-xs text-slate-500">
                Panggilan suci menyambut seruan Allah ke Baitullah
              </p>
            </div>

            <div className="bg-emerald-950 text-white rounded-2xl p-4 text-center space-y-3 border border-amber-400/30">
              <p className="font-arabic text-xl text-amber-200 leading-loose" dir="rtl">
                لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ
              </p>
              <div className="border-t border-emerald-800 pt-2 text-[11px] text-emerald-100 italic">
                "Labbaik Allāhumma labbaīk, labbaīka lā syarīka laka labbaīk, innal-hamda wan-ni‘mata laka wal-mulk, lā syarīka lak."
              </div>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/60">
              <span className="font-bold text-emerald-950 block mb-1">Artinya:</span>
              "Aku penuhi panggilan-Mu ya Allah, aku penuhi panggilan-Mu. Aku penuhi panggilan-Mu, tiada sekutu bagi-Mu, aku penuhi panggilan-Mu. Sesungguhnya segala puji, kenikmatan, dan kekuasaan hanyalah milik-Mu, tiada sekutu bagi-Mu."
            </div>

            <button
              onClick={() => {
                setIsTalbiyahModalOpen(false);
                if (!isPlaying) togglePlayAudio();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-900 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-950 transition"
            >
              <Volume2 className="w-4 h-4" />
              <span>Dengarkan Suara Talbiyah</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODAL: PILIH MUSIK ISLAMI                                   */}
      {/* ============================================================== */}
      {isMusicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-amber-300/80 space-y-4 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsMusicModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-1">
                <Music className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-emerald-950 font-kufi">
                Pilih Lantunan Sholawatan
              </h3>
              <p className="text-xs text-slate-500">
                Pilih lantunan sholawat merdu untuk mengiringi undangan walimatussafar ini
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {ISLAMIC_TRACKS.map((track, idx) => {
                const isSelected = currentTrackIndex === idx;
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      handleChangeTrack(idx);
                      setIsMusicModalOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-50/90 border-amber-500 shadow-sm ring-1 ring-amber-400'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                        isSelected ? 'bg-amber-400 text-slate-900 shadow' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {track.icon}
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-amber-700 font-bold block uppercase tracking-wider">
                          {track.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {track.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {track.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-900 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-amber-400 hover:text-slate-900 transition">
                          <Play className="w-3 h-3 ml-0.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
              <button
                onClick={() => {
                  togglePlayAudio();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Jeda Sholawat Saat Ini' : 'Putar Sholawat'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
