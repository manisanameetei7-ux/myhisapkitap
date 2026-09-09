import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  SkipForward,
  SkipBack,
  Sparkles,
  CheckCircle,
  QrCode,
  Receipt,
  ShoppingCart,
  Package,
  Users,
  Database,
  Languages,
  UserCheck,
  Radio,
  Loader2,
  ShieldCheck,
  BookOpen,
  Building,
  LayoutDashboard,
  Film,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { LANGUAGES } from '../data/translations';
import {
  fetchHumanSpeechAudio,
  HUMAN_VOICE_PERSONAS,
  HumanVoicePersona,
} from '../utils/humanVoice';

export interface TutorialScene {
  title: string;
  description: string;
  narration: {
    en: string;
    hi?: string;
    bn?: string;
    as?: string;
  };
  indicPhonetic?: {
    bn?: string;
    as?: string;
  };
  icon: any;
  screenType: 'pos' | 'products' | 'customer' | 'backup';
  highlights: string[];
  simulatedData?: any;
}

export interface TutorialGuide {
  id: string;
  title: string;
  category: string;
  durationSec: number;
  description: string;
  scenes: TutorialScene[];
}

export const TUTORIAL_DATA: TutorialGuide[] = [
  {
    id: 'complete-app-tutorial',
    title: 'Hisap Kitap - Complete App Video Tutorial',
    category: 'Full Application Guide',
    durationSec: 180,
    description: 'The complete end-to-end master video guide covering store setup, product inventory, POS fast billing, thermal receipts, customer credit (Udhar), dynamic UPI QR codes, and offline backups.',
    scenes: [
      {
        title: 'Chapter 1: Store Profile & Security PIN Setup',
        description: 'Set up your shop business name, contact phone, store address, UPI ID, and 4-digit security PIN lock.',
        narration: {
          en: 'Welcome to Hisap Kitap. Start by setting up your Store Profile with your business name, address, UPI payment ID, and a secure 4-digit PIN to lock your finances.',
          as: 'হিচাপ কিতাপলৈ আপোনাক স্বাগতম। প্ৰথমে আপোনাৰ দোকানৰ নাম, ঠিকনা, ইউপিআই পৰিশোধ আইডি আৰু বিত্তীয় সুৰক্ষাৰ বাবে ৪টা সংখ্যাৰ পিন ছেট কৰক।',
          hi: 'हिसाब किताब में आपका स्वागत है। सबसे पहले अपनी दुकान का नाम, पता, यूपीआई आईडी और वित्तीय सुरक्षा के लिए ४ अंकों का मास्टर पिन सेट करें।',
          bn: 'হিসাব কিতাবে আপনাকে স্বাগতম। প্রথমে আপনার দোকানের নাম, ঠিকানা, ইউপিআই আইডি এবং আর্থিক সুরক্ষার জন্য ৪ অঙ্কের পিন সেট করুন।',
        },
        indicPhonetic: {
          as: 'Hisap Kitapoloi apunak swagatam. Prothome apunar dokanor naam, thikana, UPI ID aru 4-digit PIN set korók.',
          bn: 'Hisap Kitabe apnake swagotom. Prothome aponar dokaner naam, thikana, UPI ID ebong 4-digit PIN set korun.',
        },
        icon: Building,
        screenType: 'backup',
        highlights: ['Store name & contact setup', 'Instant UPI QR payment integration', '4-digit master PIN protection'],
        simulatedData: {
          status: 'STORE PROFILE CONFIGURED',
          name: 'Guwahati Mega Mart',
          upi: 'storename@upi',
          pin: '**** (Active Lock)',
        },
      },
      {
        title: 'Chapter 2: Live Dashboard & Financial Matrix',
        description: 'Monitor daily sales, gross profit percentage, net cash in drawer, and orange low-stock alert badges.',
        narration: {
          en: 'Your live Dashboard displays real-time sales, gross profit margin, net cash in drawer, customer dues, and low stock warnings.',
          as: 'আপোনাৰ লাইভ ডেশ্বব’ৰ্ডত তৎকালীন বিক্ৰী, লাভৰ শতাংশ, নগদ ধন, বাকী ধন আৰু কম ষ্টকৰ সতৰ্কবাৰ্তা স্পষ্টকৈ দেখা পোৱা যায়।',
          hi: 'आपका लाइव डैशबोर्ड आज की कुल बिक्री, मुनाफे का प्रतिशत, गल्ले में नकद राशि, ग्राहकों की उधारी और कम स्टॉक की चेतावनी दिखाता है।',
          bn: 'আপনার লাইভ ড্যাশবোর্ডে আজকের মোট বিক্রি, লাভের শতাংশ, ক্যাশ ড্রয়ারের টাকা, গ্রাহকের বাকি এবং কম স্টকের সতর্কতা দেখতে পাবেন।',
        },
        indicPhonetic: {
          as: 'Apunar live dashboard-ot tatkshanik bikri, labhor shotangsho, nogod dhon aru kom stock-or sotorkobarta dekha jaay.',
          bn: 'Aponar live dashboard-e ajker mot bikri, labher percentage, nogod taka ebong kom stocker shotorkota dekhte paben.',
        },
        icon: LayoutDashboard,
        screenType: 'pos',
        highlights: ['Real-time Today Sales & Net Profit', 'Orange Low-Stock Reorder Badges', 'Instant Action Shortcuts'],
        simulatedData: {
          invoiceNo: 'DASHBOARD ACTIVE',
          net: 18450,
          status: 'Real-Time Sync',
        },
      },
      {
        title: 'Chapter 3: Adding Products & Managing Inventory',
        description: 'Add items across 8 categories, enter cost vs selling price for automatic margin calculation, and set stock thresholds.',
        narration: {
          en: 'Add products into eight organized categories. Set purchase cost and selling price, and Hisap Kitap calculates your profit margin automatically.',
          as: 'মুদি, ষ্টেচনেৰী আদি ৮টা শ্ৰেণীত সামগ্ৰী যোগ কৰক। ক্ৰয় আৰু বিক্ৰী মূল্য দিলেই লাভৰ শতাংশ স্বয়ংক্ৰিয়ভাৱে গণনা হয়।',
          hi: 'किराना, स्टेशनरी सहित ८ श्रेणियों में उत्पाद जोड़ें। खरीद और बिक्री मूल्य दर्ज करें, और हिसाब किताब अपने आप मुनाफा प्रतिशत निकाल देगा।',
          bn: 'মুদি, স্টেশনারি সহ ৮টি ক্যাটাগরিতে পণ্য যোগ করুন। কেনা ও বিক্রির দাম দিলেই লাভের মার্জিন নিজে থেকেই হিসাব হয়ে যাবে।',
        },
        indicPhonetic: {
          as: 'Mudi, stationery aadi aat-ta shrenit samogri jog korók. Kroy aru bikri mulya dilei labhor shotangsho gonona hoy.',
          bn: 'Mudi, stationery shoho aat-ti category-te ponno jog korun. Kena o bikrir daam dilei laabh hisab hoye jabe.',
        },
        icon: Package,
        screenType: 'products',
        highlights: ['8 Organized Retail Categories', 'Automated Profit Margin % Calculation', 'Low-Stock Reorder Threshold'],
        simulatedData: {
          name: 'Tata Tea Gold Leaf Pouch 500g',
          buyPrice: 240,
          sellPrice: 280,
          margin: '16.7% Profit',
          status: 'Catalog Verified',
        },
      },
      {
        title: 'Chapter 4: Quick POS Billing & Checkout',
        description: 'Scan barcodes or search items, adjust quantities, select customers, and settle split cash and credit payments.',
        narration: {
          en: 'In the Quick Entry POS screen, search or scan items to add them to cart. Enter paid cash amount, and any remaining balance is automatically logged to credit.',
          as: 'কুইক এণ্ট্ৰী পইণ্ট অব চেল স্ক্ৰীণত সামগ্ৰী স্কেন বা সন্ধান কৰি কাৰ্টত দিয়ক। পৰিশোধিত ধন দিয়ক আৰু বাকী থকা ধন স্বয়ংক্ৰিয়ভাৱে বাকী খাতাত জমা হ’ব।',
          hi: 'क्विक एंट्री पीओएस स्क्रीन पर बारकोड स्कैन करें या नाम खोजकर कार्ट में जोड़ें। प्राप्त नकद दर्ज करें, बाकी राशि सीधे उधारी खाते में दर्ज हो जाएगी।',
          bn: 'কুইক এন্ট্রি পিওএস স্ক্রিনে বারকোড স্ক্যান বা নাম খুঁজে কার্টে পণ্য নিন। নগদ টাকা দিন, বাকি টাকা নিজে থেকেই খাতার হিসাবে জমা হবে।',
        },
        indicPhonetic: {
          as: 'Quick entry POS screen-ot samogri scan ba sondhan kori cart-ot diyók. Porishodhito dhon diyók aru baki dhon baki khatat joma hobo.',
          bn: 'Quick entry POS screen-e ponno scan ba khuje cart-e nin. Nogod taka din, baki taka khatar hisabe joma hobe.',
        },
        icon: ShoppingCart,
        screenType: 'pos',
        highlights: ['Barcode Scanner support', 'Split Cash / UPI / Udhar settlement', 'Dynamic Inventory Stock reduction'],
        simulatedData: {
          items: [
            { name: 'Fortune Sunlite Sunflower Oil 1L', qty: 2, price: 145 },
            { name: 'Aashirvaad Shudh Chakki Atta 5kg', qty: 1, price: 260 },
          ],
          total: 550,
          discount: 20,
          net: 530,
          customer: 'Ramesh Sharma (Shop Regular)',
          paid: 300,
          due: 230,
        },
      },
      {
        title: 'Chapter 5: Generating Invoices & Thermal Printing',
        description: 'Download crisp vector PDF invoices, print to 80mm thermal receipt printers, or share directly on WhatsApp.',
        narration: {
          en: 'Instantly download vector PDF invoices, print 80 millimeter thermal receipts, or send digital bills directly to your customer on WhatsApp with payment links.',
          as: 'তৎকালীন ভেক্টৰ পিডিএফ ইনভইচ ডাউনল’ড কৰক, ৮০ মিলিমিটাৰ থাৰ্মেল প্ৰিণ্ট কৰক বা লিংকৰ সৈতে গ্ৰাহকলৈ হোৱাটছএপত ডিজিটেল বিল পঠিয়াওক।',
          hi: 'तुरंत वेक्टर पीडीएफ इनवॉइस डाउनलोड करें, ८० मिमी थर्मल रसीद प्रिंट करें या ग्राहक को ऑनलाइन पेमेंट लिंक के साथ सीधे व्हाट्सएप पर डिजिटल बिल भेजें।',
          bn: 'সাথে সাথে ভেক্টর পিডিএফ ইনভয়েস ডাউনলোড করুন, ৮০ মিমি থার্মাল প্রিন্ট করুন অথবা গ্রাহককে হোয়াটসঅ্যাপে ডিজিটাল বিল পাঠান।',
        },
        indicPhonetic: {
          as: 'Tatkshanik vector PDF invoice download korók, 80mm thermal print korók ba WhatsApp-ot digital bill pothiyawok.',
          bn: 'Sathe sathe vector PDF invoice download korun, 80mm thermal print korun ba WhatsApp-e digital bill pathan.',
        },
        icon: Receipt,
        screenType: 'pos',
        highlights: ['Crisp Vector PDF Downloads', '80mm / 58mm Thermal Printer Support', '1-Click WhatsApp digital bill sharing'],
        simulatedData: {
          invoiceNo: 'HK-2026-08492',
          status: 'PAID & RECORDED',
          net: 530,
        },
      },
      {
        title: 'Chapter 6: Customer Khata (Udhar) & Repayments',
        description: 'Keep a clean ledger of all customer debits, search by mobile number, and record cash/UPI repayments.',
        narration: {
          en: 'Track every customer credit account accurately. Search by mobile number, view complete purchase history, and log repayments with a single click.',
          as: 'প্ৰতিজন গ্ৰাহকৰ বাকী খাতা নিৰ্ভুলভাৱে পৰীক্ষা কৰক। মোবাইল নম্বৰৰে সন্ধান কৰক আৰু পৰিশোধ কৰা ধন এটা ক্লিকেই জমা কৰক।',
          hi: 'हर ग्राहक का उधारी खाता सटीकता से ट्रैक करें। मोबाइल नंबर से सर्च करें, पूरा खरीद इतिहास देखें और एक क्लिक में भुगतान दर्ज करें।',
          bn: 'প্রতিটি গ্রাহকের বাকি খাতা নিখুঁতভাবে পরিচালনা করুন। মোবাইল নম্বর দিয়ে খুঁজুন এবং এক ক্লিকেই জমা টাকা এন্ট্রি করুন।',
        },
        indicPhonetic: {
          as: 'Protijon grahokor baki khata nirbhulbhabe porikhon korók. Mobile number-e sondhan korók aru porishodh joma korók.',
          bn: 'Protiti grahoker baki khata nikhutbhabe track korun. Mobile number diye khujun ebong joma taka entry korun.',
        },
        icon: Users,
        screenType: 'customer',
        highlights: ['Search by Customer Mobile / Name', 'Full Timestamped Ledger History', 'Instant Udhar Repayment Logging'],
        simulatedData: {
          customer: 'Anjali Devi',
          phone: '+91 98765 43210',
          totalDue: 1450,
          whatsappMsg: 'Namaste Anjali ji, your pending store due is Rs. 1,450.',
        },
      },
      {
        title: 'Chapter 7: Dynamic UPI QR & Payment Reminders',
        description: 'Generate customer-specific UPI QR codes pre-filled with exact balance and send polite automated WhatsApp reminders.',
        narration: {
          en: 'Generate dynamic UPI QR codes with exact outstanding balance, and send automated polite WhatsApp reminders with direct UPI payment links.',
          as: 'মুঠ বাকী ধনৰ বাবে ডাইনামিক ইউপিআই কিউআৰ ক’ড উলিয়াওক আৰু পেমেণ্ট লিংকৰ সৈতে হোৱাটছএপত স্বয়ংক্ৰিয় বাকী ধনৰ সোঁৱৰণী পঠিয়াওক।',
          hi: 'बकाया राशि का डायनामिक यूपीआई क्यूआर कोड बनाएं और भुगतान लिंक के साथ व्हाट्सएप पर स्वचालित विनम्र तगादा भेजें।',
          bn: 'বকেয়া টাকার ডায়নামিক ইউপিআই কিউআর কোড তৈরি করুন এবং পেমেন্ট লিংক সহ হোয়াটসঅ্যাপে তাগাদা পাঠান।',
        },
        indicPhonetic: {
          as: 'Muth baki dhonor babe dynamic UPI QR code uliyawok aru WhatsApp-ot baki dhonor soworoni pothiyawok.',
          bn: 'Bokeya takar dynamic UPI QR code toiri korun ebong WhatsApp-e tagada pathan.',
        },
        icon: QrCode,
        screenType: 'customer',
        highlights: ['Compatible with GPay, PhonePe, Paytm, BHIM', 'Automated polite WhatsApp text message', 'Direct payment link attached'],
        simulatedData: {
          customer: 'Anjali Devi',
          upiId: 'manisanameetei7@okicici',
          totalDue: 1450,
          whatsappMsg: 'Namaste Anjali ji, your pending store due is Rs. 1,450. Click to pay via UPI: https://upi.link/..',
        },
      },
      {
        title: 'Chapter 8: Financial Reports & 100% Offline Backup',
        description: 'Generate detailed P&L PDF reports, export Excel CSV spreadsheets for tax, and download offline JSON database snapshots.',
        narration: {
          en: 'Export comprehensive Profit and Loss PDF reports, Excel CSV spreadsheets, and download 100% secure offline JSON backups of your entire store.',
          as: 'সম্পূৰ্ণ লাভ-লোকচানৰ পিডিএফ ৰিপ’ৰ্ট, এক্সেল চিএছভি ফাইল আৰু আপোনাৰ দোকানৰ তথ্যৰ ১০০% নিৰাপদ অফলাইন জেছন বেকআপ ডাউনল’ড কৰক।',
          hi: 'विस्तृत लाभ-हानि पीडीएफ रिपोर्ट, एक्सेल सीएसवी फाइल बनाएं और अपनी पूरी दुकान का १००% सुरक्षित ऑफलाइन जेसन बैकअप डाउनलोड करें।',
          bn: 'লাভ-ক্ষতির বিস্তারিত পিডিএফ রিপোর্ট, এক্সেল সিএসভি স্প্রেডশিট এবং ১০০% নিরাপদ অফলাইন জেএসওএন ব্যাকআপ ডাউনলোড করুন।',
        },
        indicPhonetic: {
          as: 'Sompurno labh-loksanor PDF report, Excel CSV file aru dokanor 100% nirapodh offline JSON backup download korók.',
          bn: 'Labh-khotir bistarito PDF report, Excel CSV file ebong dokaner 100% nirapod offline JSON backup download korun.',
        },
        icon: ShieldCheck,
        screenType: 'backup',
        highlights: ['Comprehensive P&L PDF Financial Statements', 'Excel / CSV Spreadsheet Export', '100% Offline JSON Backup & Privacy'],
        simulatedData: {
          status: 'BACKUP READY & ENCRYPTED',
          backupFile: 'hisapkitap_backup_2026.json',
          size: '48.2 KB',
        },
      },
    ],
  },
];

interface TutorialVideoPlayerProps {
  initialTutorialIndex?: number;
  lang: LanguageCode;
  onClose: () => void;
  onOpenPdfManual?: () => void;
}

export const TutorialVideoPlayer: React.FC<TutorialVideoPlayerProps> = ({
  initialTutorialIndex = 0,
  lang,
  onClose,
  onOpenPdfManual,
}) => {
  const [selectedTutorialIdx, setSelectedTutorialIdx] = useState(initialTutorialIndex);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [videoLang, setVideoLang] = useState<LanguageCode>(lang);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string>(
    lang === 'as' ? 'pratibha-as-female' : lang === 'hi' ? 'ananya-hi-female' : 'kore-female'
  );
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [isRealHumanVoiceActive, setIsRealHumanVoiceActive] = useState<boolean>(true);
  const [activeVoiceTitle, setActiveVoiceTitle] = useState<string>('✨ Ultra-Realistic Human Voice');
  const [audioBlocked, setAudioBlocked] = useState<boolean>(false);

  const activeTutorial = TUTORIAL_DATA[selectedTutorialIdx] || TUTORIAL_DATA[0];
  const activeScene = activeTutorial.scenes[currentSceneIdx] || activeTutorial.scenes[0];
  const totalScenes = activeTutorial.scenes.length;

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stop any active audio
  const stopAllAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Helper to get narration text for current language
  const getSceneText = (scene: TutorialScene, l: LanguageCode) => {
    if (l === 'bn') return scene.narration.bn || scene.narration.en;
    if (l === 'as') return scene.narration.as || scene.narration.en;
    if (l === 'hi') return scene.narration.hi || scene.narration.en;
    return scene.narration.en;
  };

  // Helper to fallback to humanized browser speech if offline
  const speakBrowserFallback = (text: string, language: LanguageCode) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();
    const personaObj = HUMAN_VOICE_PERSONAS.find((p) => p.id === selectedPersona);
    const isFemalePersona = personaObj ? personaObj.gender === 'female' : true;

    // Find best matching voice, preferring female voices if female persona is selected
    const matchingVoices = voices.filter((v) => {
      const nameLower = v.name.toLowerCase();
      const langLower = v.lang.toLowerCase();
      const isTargetLang =
        (language === 'bn' && (langLower.startsWith('bn') || nameLower.includes('bengali'))) ||
        (language === 'as' && (langLower.startsWith('bn') || langLower.startsWith('hi') || nameLower.includes('bengali') || nameLower.includes('hindi'))) ||
        (language === 'hi' && (langLower.startsWith('hi') || nameLower.includes('hindi'))) ||
        langLower.startsWith('en');

      if (!isTargetLang) return false;
      if (isFemalePersona) {
        return (
          nameLower.includes('female') ||
          nameLower.includes('kalpana') ||
          nameLower.includes('lekha') ||
          nameLower.includes('zira') ||
          nameLower.includes('hema') ||
          nameLower.includes('puja') ||
          (!nameLower.includes('male') && !nameLower.includes('hemant') && !nameLower.includes('david') && !nameLower.includes('george'))
        );
      }
      return true;
    });

    const targetVoice = matchingVoices[0] || voices.find((v) => v.lang.toLowerCase().startsWith('en')) || voices[0] || null;

    let utteranceText = text;
    let langTag = targetVoice ? targetVoice.lang : 'en-IN';

    // If target Indic voice is not installed in the browser, fallback to English narration of the scene to guarantee sound
    if ((language === 'bn' || language === 'as' || language === 'hi') && !matchingVoices.length) {
      utteranceText = activeScene.narration.en;
      langTag = 'en-US';
    } else if (language === 'bn' || language === 'as') {
      utteranceText = language === 'as' ? (activeScene.indicPhonetic?.as || text) : (activeScene.indicPhonetic?.bn || text);
    }

    const utterance = new SpeechSynthesisUtterance(utteranceText);
    utterance.rate = playbackSpeed;
    utterance.pitch = isFemalePersona ? 1.22 : 1.05; // Expressive feminine melodic pitch
    utterance.lang = langTag;
    if (targetVoice) utterance.voice = targetVoice;

    window.speechSynthesis.speak(utterance);
    setActiveVoiceTitle(`✨ ${personaObj?.name || 'Studio Voice'} (Natural Audio)`);
    setIsRealHumanVoiceActive(false);
  };

  // Play realistic human voice for active scene
  const playHumanVoiceForScene = async (sceneIndex: number) => {
    if (!voiceEnabled) return;
    const targetScene = activeTutorial.scenes[sceneIndex];
    if (!targetScene) return;

    stopAllAudio();
    setIsAudioLoading(true);

    const sceneText = getSceneText(targetScene, videoLang);

    try {
      // 1. Request ultra-realistic human audio from Gemini Studio TTS
      const wavBlobUrl = await fetchHumanSpeechAudio(
        sceneText,
        videoLang,
        selectedPersona
      );

      if (!audioElementRef.current) {
        audioElementRef.current = new Audio();
      }

      const audio = audioElementRef.current;
      audio.src = wavBlobUrl;
      audio.playbackRate = playbackSpeed;
      audio.volume = 1.0;
      audio.muted = false;

      const personaObj = HUMAN_VOICE_PERSONAS.find((p) => p.id === selectedPersona);
      setActiveVoiceTitle(`✨ ${personaObj?.name || 'Real Human Voice'} (Studio HD)`);
      setIsRealHumanVoiceActive(true);

      if (isPlaying) {
        try {
          await audio.play();
          setAudioBlocked(false);
        } catch (playErr) {
          console.warn('Autoplay blocked by browser:', playErr);
          setAudioBlocked(true);
        }
      }

      setIsAudioLoading(false);

      // 2. Prefetch next scene audio in background for instantaneous transitions
      if (sceneIndex + 1 < totalScenes) {
        const nextScene = activeTutorial.scenes[sceneIndex + 1];
        const nextText = getSceneText(nextScene, videoLang);
        fetchHumanSpeechAudio(nextText, videoLang, selectedPersona).catch(() => {});
      }
    } catch (err) {
      console.warn('Backend human voice unavailable, switching to humanized device speech:', err);
      setIsAudioLoading(false);
      if (isPlaying) {
        try {
          speakBrowserFallback(sceneText, videoLang);
          setAudioBlocked(false);
        } catch {
          setAudioBlocked(true);
        }
      }
    }
  };

  // Trigger audio whenever active scene, language, persona or playback changes
  useEffect(() => {
    if (!isPlaying) {
      stopAllAudio();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    playHumanVoiceForScene(currentSceneIdx);

    const sceneDurationMs = ((activeTutorial.durationSec / totalScenes) * 1000) / playbackSpeed;
    const intervalTick = 100;
    const stepIncrement = (intervalTick / sceneDurationMs) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentSceneIdx < totalScenes - 1) {
            setCurrentSceneIdx((s) => s + 1);
            return 0;
          } else {
            setIsPlaying(false);
            return 100;
          }
        }
        return prev + stepIncrement;
      });
    }, intervalTick);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [
    isPlaying,
    currentSceneIdx,
    selectedTutorialIdx,
    playbackSpeed,
    videoLang,
    selectedPersona,
    voiceEnabled,
  ]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const handleTogglePlay = () => {
    if (progress >= 100 && currentSceneIdx >= totalScenes - 1) {
      setCurrentSceneIdx(0);
      setProgress(0);
      setIsPlaying(true);
    } else {
      const nextPlay = !isPlaying;
      setIsPlaying(nextPlay);
      if (!nextPlay) {
        stopAllAudio();
      }
    }
  };

  const handleRestart = () => {
    setCurrentSceneIdx(0);
    setProgress(0);
    setIsPlaying(true);
    playHumanVoiceForScene(0);
  };

  const handleNextScene = () => {
    if (currentSceneIdx < totalScenes - 1) {
      setCurrentSceneIdx((s) => s + 1);
      setProgress(0);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIdx > 0) {
      setCurrentSceneIdx((s) => s - 1);
      setProgress(0);
    }
  };

  const handleSelectTutorial = (idx: number) => {
    setSelectedTutorialIdx(idx);
    setCurrentSceneIdx(0);
    setProgress(0);
    setIsPlaying(true);
    stopAllAudio();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050608]/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        className={`bg-[#101419] border border-[#26313B] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isFullscreen ? 'w-full h-full max-w-none' : 'w-full max-w-4xl max-h-[92vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-[#161C23] border-b border-[#26313B] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#FF6F91]/20 text-[#FF6F91] flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 ml-0.5 fill-current" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6F91] flex items-center gap-1">
                  <Film className="w-3 h-3" />
                  Complete Master Tutorial
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#17D5B3]/20 text-[#17D5B3] text-[10px] font-extrabold border border-[#17D5B3]/40">
                  <Sparkles className="w-2.5 h-2.5" />
                  Human Voice Studio
                </span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#F4F8FB] truncate">
                {activeTutorial.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center bg-[#101419] p-0.5 rounded-lg border border-[#26313B]">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setVideoLang(l.code);
                    if (l.code === 'as') {
                      setSelectedPersona('pratibha-as-female');
                    } else if (l.code === 'hi') {
                      setSelectedPersona('ananya-hi-female');
                    } else if (l.code === 'bn') {
                      setSelectedPersona('kore-female');
                    } else {
                      setSelectedPersona('kore-female');
                    }
                    stopAllAudio();
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    videoLang === l.code
                      ? 'bg-[#17D5B3] text-[#050608] shadow-sm'
                      : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
                  }`}
                >
                  {l.nativeLabel}
                </button>
              ))}
            </div>

            {onOpenPdfManual && (
              <button
                onClick={() => {
                  stopAllAudio();
                  onOpenPdfManual();
                }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#54B6FF]/15 border border-[#54B6FF]/40 text-[#54B6FF] hover:bg-[#54B6FF]/25 text-xs font-bold transition-all shadow-sm"
                title="View & Download PDF Tutorial Manual"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>PDF Manual</span>
              </button>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-[#101419] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB] transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                stopAllAudio();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-[#101419] hover:bg-red-500/20 text-[#A8B5C2] hover:text-red-400 text-sm font-bold transition-colors"
              title="Close Player"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Video Presentation Stage */}
        <div className="relative bg-[#050608] flex-1 min-h-[320px] sm:min-h-[380px] p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
          {/* Animated Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#17D5B3]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#FF6F91]/10 rounded-full blur-3xl pointer-events-none" />

          {audioBlocked && (
            <div
              onClick={() => {
                setAudioBlocked(false);
                if (audioElementRef.current) {
                  audioElementRef.current.volume = 1.0;
                  audioElementRef.current.play().catch(() => playHumanVoiceForScene(currentSceneIdx));
                } else {
                  playHumanVoiceForScene(currentSceneIdx);
                }
              }}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-[#FF6F91] text-[#050608] px-4 py-2 rounded-xl shadow-2xl font-black text-xs flex items-center gap-2 animate-bounce cursor-pointer border border-white/40"
            >
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span>🔊 Click Here to Enable Sound & Voice Narration</span>
            </div>
          )}

          {/* Video Scene Content Display */}
          <div className="relative z-10 space-y-4">
            {/* Scene Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#26313B]/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#17D5B3]/20 text-[#17D5B3] text-xs font-extrabold border border-[#17D5B3]/30">
                  Scene {currentSceneIdx + 1} of {totalScenes}
                </span>
                <h4 className="text-base sm:text-lg font-black text-[#F4F8FB]">
                  {activeScene.title}
                </h4>
              </div>

              {/* Human Voice Persona Selector */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-[#161C23] px-2.5 py-1 rounded-lg border border-[#26313B]">
                  <UserCheck className="w-3.5 h-3.5 text-[#17D5B3]" />
                  <span className="text-[10px] text-[#A8B5C2] font-semibold hidden sm:inline">
                    Speaker:
                  </span>
                  <select
                    value={selectedPersona}
                    onChange={(e) => {
                      setSelectedPersona(e.target.value);
                      stopAllAudio();
                    }}
                    aria-label="Human Voice Persona"
                    className="bg-transparent text-xs font-bold text-[#F4F8FB] focus:outline-none cursor-pointer"
                  >
                    {HUMAN_VOICE_PERSONAS.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#161C23] text-white">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Simulated Live UI Interaction Screen */}
            <div className="bg-[#101419]/90 border border-[#26313B] rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
              {activeScene.screenType === 'pos' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-[#161C23] p-2.5 rounded-lg border border-[#26313B]">
                    <span className="text-xs font-bold text-[#17D5B3] flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5" /> Fast POS Terminal
                    </span>
                    <span className="text-[11px] font-mono text-[#F4F8FB] bg-[#101419] px-2 py-0.5 rounded border border-[#26313B]">
                      Invoice: {activeScene.simulatedData?.invoiceNo || 'HK-POS-08492'}
                    </span>
                  </div>

                  {activeScene.simulatedData?.items && (
                    <div className="space-y-1.5">
                      {activeScene.simulatedData.items.map((it: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded bg-[#161C23] text-xs text-[#F4F8FB]"
                        >
                          <span>{it.name} (x{it.qty})</span>
                          <span className="font-mono font-bold text-[#17D5B3]">₹{it.price * it.qty}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t border-[#26313B] text-xs font-bold text-[#F4F8FB]">
                        <span>Total Payable</span>
                        <span className="text-base text-[#17D5B3]">₹{activeScene.simulatedData.net}</span>
                      </div>
                    </div>
                  )}

                  {activeScene.simulatedData?.customer && (
                    <div className="p-3 bg-[#161C23] rounded-lg border border-[#26313B] text-xs space-y-1.5">
                      <div className="flex justify-between font-bold text-[#F4F8FB]">
                        <span>Customer Account:</span>
                        <span className="text-[#FF6F91]">{activeScene.simulatedData.customer}</span>
                      </div>
                      <div className="flex justify-between text-[#A8B5C2]">
                        <span>Paid Amount: ₹{activeScene.simulatedData.paid}</span>
                        <span className="text-red-400 font-bold">Pending Udhar: ₹{activeScene.simulatedData.due}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeScene.screenType === 'products' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-[#161C23] p-2.5 rounded-lg border border-[#26313B]">
                    <span className="text-xs font-bold text-[#FF6F91] flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" /> Product & Stock Manager
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                      {activeScene.simulatedData?.status || 'Active Catalog'}
                    </span>
                  </div>

                  {activeScene.simulatedData?.name && (
                    <div className="p-3 bg-[#161C23] rounded-lg border border-[#26313B] space-y-2 text-xs">
                      <div className="font-bold text-[#F4F8FB] text-sm">
                        {activeScene.simulatedData.name}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-[#101419] p-2 rounded border border-[#26313B]">
                          <span className="text-[10px] text-[#A8B5C2]">Buy Price</span>
                          <p className="font-bold text-[#F4F8FB]">₹{activeScene.simulatedData.buyPrice}</p>
                        </div>
                        <div className="bg-[#101419] p-2 rounded border border-[#26313B]">
                          <span className="text-[10px] text-[#A8B5C2]">Sell Price</span>
                          <p className="font-bold text-[#17D5B3]">₹{activeScene.simulatedData.sellPrice}</p>
                        </div>
                        <div className="bg-[#101419] p-2 rounded border border-[#26313B]">
                          <span className="text-[10px] text-[#A8B5C2]">Margin</span>
                          <p className="font-bold text-[#FF6F91]">{activeScene.simulatedData.margin}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeScene.screenType === 'customer' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-[#161C23] p-2.5 rounded-lg border border-[#26313B]">
                    <span className="text-xs font-bold text-[#17D5B3] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Customer Credit Ledger (Khata)
                    </span>
                    <span className="text-[11px] font-mono text-[#F4F8FB]">
                      UPI: {activeScene.simulatedData?.upiId}
                    </span>
                  </div>

                  {activeScene.simulatedData?.customer && (
                    <div className="p-3 bg-[#161C23] rounded-lg border border-[#26313B] space-y-2 text-xs">
                      <div className="flex justify-between font-bold text-[#F4F8FB]">
                        <span>{activeScene.simulatedData.customer}</span>
                        <span className="text-red-400 font-extrabold text-sm">Due: ₹{activeScene.simulatedData.totalDue}</span>
                      </div>
                      <div className="p-2 rounded bg-[#101419] border border-dashed border-[#26313B] text-[11px] text-[#A8B5C2] italic">
                        "{activeScene.simulatedData.whatsappMsg}"
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeScene.screenType === 'backup' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-[#161C23] p-2.5 rounded-lg border border-[#26313B]">
                    <span className="text-xs font-bold text-[#17D5B3] flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" /> Local Cloud & Backup Engine
                    </span>
                    <span className="text-[10px] font-bold text-[#17D5B3] bg-[#17D5B3]/20 px-2 py-0.5 rounded">
                      {activeScene.simulatedData?.status || 'HEALTHY'}
                    </span>
                  </div>

                  <div className="p-3 bg-[#161C23] rounded-lg border border-[#26313B] space-y-2 text-xs">
                    <p className="text-[#F4F8FB]">
                      Supported Languages: <span className="font-bold text-[#17D5B3]">English, অসমীয়া, বাংলা, हिन्दी</span>
                    </p>
                    <div className="flex items-center justify-between bg-[#101419] p-2 rounded border border-[#26313B] text-[11px] font-mono text-[#A8B5C2]">
                      <span>File: hisapkitap_backup.json</span>
                      <span className="text-[#17D5B3] font-bold">100% Offline Safe</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bullet highlights for current step */}
              <div className="mt-3 pt-2.5 border-t border-[#26313B]/60 flex flex-wrap gap-2">
                {activeScene.highlights.map((hl, hIdx) => (
                  <span
                    key={hIdx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#161C23] border border-[#26313B] text-[11px] font-semibold text-[#A8B5C2]"
                  >
                    <CheckCircle className="w-3 h-3 text-[#17D5B3]" />
                    {hl}
                  </span>
                ))}
              </div>
            </div>

            {/* Audio Voiceover Subtitles / Studio Player Bar */}
            <div className="bg-[#101419]/95 border border-[#17D5B3]/30 rounded-xl p-3 flex items-start gap-3 shadow-lg">
              {/* Animated Equalizer Waveform */}
              <div className="p-2 rounded-lg bg-[#17D5B3]/10 text-[#17D5B3] shrink-0 mt-0.5 flex items-center justify-center">
                {isAudioLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#17D5B3]" />
                ) : voiceEnabled && isPlaying ? (
                  <div className="flex items-end gap-0.5 h-5 w-5 justify-center">
                    <span className="w-1 bg-[#17D5B3] rounded-full animate-bounce [animation-delay:0.1s] h-3" />
                    <span className="w-1 bg-[#17D5B3] rounded-full animate-bounce [animation-delay:0.2s] h-5" />
                    <span className="w-1 bg-[#17D5B3] rounded-full animate-bounce [animation-delay:0.3s] h-4" />
                    <span className="w-1 bg-[#17D5B3] rounded-full animate-bounce [animation-delay:0.15s] h-2" />
                  </div>
                ) : (
                  <VolumeX className="w-5 h-5 text-red-400" />
                )}
              </div>

              <div className="text-xs leading-relaxed text-[#F4F8FB] w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#17D5B3] flex items-center gap-1">
                      <Radio className="w-3 h-3 animate-pulse" />
                      Human Voiceover ({LANGUAGES.find((l) => l.code === videoLang)?.nativeLabel}):
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#161C23] border border-[#26313B] text-[10px] font-medium text-[#A8B5C2]">
                      {activeVoiceTitle}
                    </span>
                  </div>

                  {isAudioLoading && (
                    <span className="text-[10px] text-[#17D5B3] font-mono animate-pulse">
                      Generating studio human audio...
                    </span>
                  )}
                </div>

                <p className="font-semibold text-sm sm:text-base text-[#F4F8FB] leading-relaxed">
                  "{getSceneText(activeScene, videoLang)}"
                </p>
              </div>
            </div>
          </div>

          {/* Video Playback Controls Bar */}
          <div className="relative z-10 mt-4 pt-3 border-t border-[#26313B] space-y-2">
            {/* Timeline Progress Bar */}
            <div className="flex items-center gap-2">
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickPos = (e.clientX - rect.left) / rect.width;
                  setProgress(Math.max(0, Math.min(100, clickPos * 100)));
                }}
                className="relative flex-1 h-2 bg-[#161C23] rounded-full overflow-hidden cursor-pointer group"
              >
                <div
                  className="h-full bg-gradient-to-r from-[#17D5B3] via-[#54B6FF] to-[#FF6F91] transition-all duration-150 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-[#A8B5C2] shrink-0">
                {Math.round((progress / 100) * (activeTutorial.durationSec / totalScenes))}s /{' '}
                {Math.round(activeTutorial.durationSec / totalScenes)}s
              </span>
            </div>

            {/* Media Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePlay}
                  className="px-4 py-2 rounded-xl bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Tutorial</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleRestart}
                  className="p-2 rounded-xl bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB] transition-colors"
                  title="Replay from start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevScene}
                    disabled={currentSceneIdx === 0}
                    className="p-2 rounded-xl bg-[#161C23] hover:bg-[#26313B] disabled:opacity-40 text-[#A8B5C2] hover:text-[#F4F8FB] transition-colors"
                    title="Previous Scene"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleNextScene}
                    disabled={currentSceneIdx === totalScenes - 1}
                    className="p-2 rounded-xl bg-[#161C23] hover:bg-[#26313B] disabled:opacity-40 text-[#A8B5C2] hover:text-[#F4F8FB] transition-colors"
                    title="Next Scene"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Voice Narration Toggle */}
                <button
                  onClick={() => {
                    const next = !voiceEnabled;
                    setVoiceEnabled(next);
                    if (!next) stopAllAudio();
                    else playHumanVoiceForScene(currentSceneIdx);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    voiceEnabled
                      ? 'bg-[#17D5B3]/20 border-[#17D5B3]/50 text-[#17D5B3]'
                      : 'bg-[#161C23] border-[#26313B] text-[#A8B5C2]'
                  }`}
                  title="Toggle Audio Voice Narration"
                >
                  {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{voiceEnabled ? 'Human Voice ON' : 'Muted'}</span>
                </button>

                {/* Speed selector */}
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  aria-label="Playback speed selector"
                  className="bg-[#161C23] border border-[#26313B] text-[#F4F8FB] text-xs font-bold rounded-lg px-2 py-1.5 focus:outline-none"
                >
                  <option value="0.75">0.75x</option>
                  <option value="1">1.0x (Normal)</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter Navigation Timeline Strip */}
        <div className="p-3 sm:p-4 bg-[#161C23] border-t border-[#26313B] overflow-x-auto">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#A8B5C2] flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-[#FF6F91]" />
              Video Chapters ({activeTutorial.scenes.length} Steps)
            </span>
            <span className="text-[10px] font-mono text-[#17D5B3]">
              Playing: Chapter {currentSceneIdx + 1} of {totalScenes}
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-max">
            {activeTutorial.scenes.map((scene, idx) => {
              const SceneIcon = scene.icon;
              const isCurrent = currentSceneIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentSceneIdx(idx);
                    setProgress(0);
                    setIsPlaying(true);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all max-w-[210px] flex items-start gap-2 ${
                    isCurrent
                      ? 'bg-[#101419] border-[#FF6F91] shadow-md ring-1 ring-[#FF6F91]'
                      : 'bg-[#101419]/60 border-[#26313B] hover:border-[#A8B5C2]/40 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${isCurrent ? 'bg-[#FF6F91]/20 text-[#FF6F91]' : 'bg-[#161C23] text-[#A8B5C2]'}`}>
                    <SceneIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-[#A8B5C2] mb-0.5 flex items-center gap-1">
                      <span className={isCurrent ? 'text-[#FF6F91] font-black' : ''}>
                        Ch. {idx + 1}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#F4F8FB] truncate">
                      {scene.title.replace(/^Chapter \d+:\s*/, '')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
