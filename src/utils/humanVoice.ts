// Human voice audio synthesizer and PCM-to-WAV converter for Hisab Kitap

export interface HumanVoicePersona {
  id: string;
  voiceName: 'Kore' | 'Zephyr' | 'Aoede' | 'Puck' | 'Fenrir' | 'Charon';
  name: string;
  gender: 'female' | 'male';
  langSpecialty: string;
  assameseTitle: string;
  hindiTitle?: string;
  description: string;
  badge: string;
  avatarIcon: string;
}

export const HUMAN_VOICE_PERSONAS: HumanVoicePersona[] = [
  // Assamese Female & Male Personas
  {
    id: 'pratibha-as-female',
    voiceName: 'Kore',
    name: 'Pratibha (প্রতিভা - অসমীয়া স্নিগ্ধ মহিলা কণ্ঠ)',
    gender: 'female',
    langSpecialty: 'as',
    assameseTitle: 'প্রতিভা (অনুপম স্নিগ্ধ মহিলা কণ্ঠ)',
    hindiTitle: 'प्रतिभा (असमिया महिला आवाज़)',
    description: 'Warm, natural, ultra-realistic Assamese female voice for tutorials',
    badge: 'অসমীয়া মহিলা কণ্ঠ (Recommended)',
    avatarIcon: '👩',
  },
  {
    id: 'jonali-as-female',
    voiceName: 'Zephyr',
    name: 'Jonali (জোনালী - নম্ৰ অসমীয়া মহিলা কণ্ঠ)',
    gender: 'female',
    langSpecialty: 'as',
    assameseTitle: 'জোনালী (নম্ৰ আৰু মাধুৰ্য্যপূৰ্ণ)',
    hindiTitle: 'जोनाली (असमिया शांत महिला आवाज़)',
    description: 'Calm, gentle & friendly Assamese female voice for ledger & billing guides',
    badge: 'নম্ৰ অসমীয়া কণ্ঠ',
    avatarIcon: '🌸',
  },
  {
    id: 'rupali-as-female',
    voiceName: 'Aoede',
    name: 'Rupali (ৰূপালী - উজ্জ্বল শিক্ষণীয় কণ্ঠ)',
    gender: 'female',
    langSpecialty: 'as',
    assameseTitle: 'ৰূপালী (শিক্ষণীয় মহিলা কণ্ঠ)',
    hindiTitle: 'रूपाली (असमिया उत्साही आवाज़)',
    description: 'Melodious, lively Assamese female educator voice',
    badge: 'শিক্ষণীয় কণ্ঠ',
    avatarIcon: '✨',
  },
  {
    id: 'hemanta-as-male',
    voiceName: 'Puck',
    name: 'Hemanta (হেমন্ত - অসমীয়া পেছাদাৰী কণ্ঠ)',
    gender: 'male',
    langSpecialty: 'as',
    assameseTitle: 'হেমন্ত (স্পষ্ট পুৰুষ কণ্ঠ)',
    hindiTitle: 'हेमंत (असमिया पुरुष आवाज़)',
    description: 'Clear, crisp, friendly Assamese male shopkeeper voice',
    badge: 'অসমীয়া পুৰুষ কণ্ঠ',
    avatarIcon: '👨',
  },

  // Hindi Female & Male Personas
  {
    id: 'ananya-hi-female',
    voiceName: 'Kore',
    name: 'Ananya (अनन्या - मधुर हिंदी महिला आवाज़)',
    gender: 'female',
    langSpecialty: 'hi',
    assameseTitle: 'অনন্যা (মধুৰ হিন্দী মহিলা কণ্ঠ)',
    hindiTitle: 'अनन्या (सर्वश्रेष्ठ हिंदी महिला आवाज़)',
    description: 'Sweet, articulate, professional Hindi female voice for retail billing guides',
    badge: 'हिंदी महिला आवाज़ (Recommended)',
    avatarIcon: '👩',
  },
  {
    id: 'pooja-hi-female',
    voiceName: 'Zephyr',
    name: 'Pooja (पूजा - शांत और स्पष्ट हिंदी महिला आवाज़)',
    gender: 'female',
    langSpecialty: 'hi',
    assameseTitle: 'পূজা (শান্ত হিন্দী মহিলা কণ্ঠ)',
    hindiTitle: 'पूजा (शांत व स्पष्ट महिला आवाज़)',
    description: 'Calm, friendly, step-by-step Hindi tutorial narrator voice',
    badge: 'शांत हिंदी आवाज़',
    avatarIcon: '🌸',
  },
  {
    id: 'priya-hi-female',
    voiceName: 'Aoede',
    name: 'Priya (प्रिया - उत्साही शिक्षिका आवाज़)',
    gender: 'female',
    langSpecialty: 'hi',
    assameseTitle: 'প্ৰিয়া (উজ্জ্বল হিন্দী কণ্ঠ)',
    hindiTitle: 'प्रिया (उत्साही शिक्षिका आवाज़)',
    description: 'Lively, expressive Hindi female guide for easy understanding',
    badge: 'शिक्षिका आवाज़',
    avatarIcon: '✨',
  },
  {
    id: 'aarav-hi-male',
    voiceName: 'Puck',
    name: 'Aarav (आरव - स्पष्ट और दोस्ताना हिंदी पुरुष)',
    gender: 'male',
    langSpecialty: 'hi',
    assameseTitle: 'আৰৱ (হিন্দী পুৰুষ কণ্ঠ)',
    hindiTitle: 'आरव (दोस्ताना हिंदी पुरुष आवाज़)',
    description: 'Energetic, crisp, natural Hindi male narrator for store walkthroughs',
    badge: 'हिंदी पुरुष आवाज़',
    avatarIcon: '👨',
  },
  {
    id: 'rajesh-hi-male',
    voiceName: 'Charon',
    name: 'Rajesh (राजेश - अनुभवी दुकानदार हिंदी आवाज़)',
    gender: 'male',
    langSpecialty: 'hi',
    assameseTitle: 'ৰাজেশ (পেছাদাৰী দোকানদাৰ)',
    hindiTitle: 'राजेश (व्यापारी व दुकानदार आवाज़)',
    description: 'Professional, trustworthy shopkeeper tone for billing tutorials',
    badge: 'व्यापारी आवाज़',
    avatarIcon: '🏪',
  },

  // General Multilingual Voices
  {
    id: 'kore-female',
    voiceName: 'Kore',
    name: 'Kore (Warm Female / সার্বজনীন মহিলা)',
    gender: 'female',
    langSpecialty: 'all',
    assameseTitle: 'কোৰ (উষ্ণ মহিলা কণ্ঠ)',
    hindiTitle: 'कोर (सार्वभौमिक महिला आवाज़)',
    description: 'Friendly, warm, and natural store companion',
    badge: 'Warm & Expressive',
    avatarIcon: '🎙️',
  },
  {
    id: 'zephyr-female',
    voiceName: 'Zephyr',
    name: 'Zephyr (Calm Female / শান্ত মহিলা)',
    gender: 'female',
    langSpecialty: 'all',
    assameseTitle: 'জেফিৰ (শান্ত মহিলা কণ্ঠ)',
    hindiTitle: 'ज़ेफिर (शांत महिला आवाज़)',
    description: 'Gentle, soothing, and easy to follow',
    badge: 'Calm & Gentle',
    avatarIcon: '🕊️',
  },
  {
    id: 'puck-male',
    voiceName: 'Puck',
    name: 'Puck (Cheerful Male)',
    gender: 'male',
    langSpecialty: 'all',
    assameseTitle: 'পাক (সজীৱ পুৰুষ কণ্ঠ)',
    hindiTitle: 'पक (उत्साही पुरुष आवाज़)',
    description: 'Energetic, helpful, and clear mentor',
    badge: 'Energetic & Crisp',
    avatarIcon: '⚡',
  },
  {
    id: 'charon-male',
    voiceName: 'Charon',
    name: 'Charon (Professional Male)',
    gender: 'male',
    langSpecialty: 'all',
    assameseTitle: 'কেৰন (পেছাদাৰী দোকানদাৰ কণ্ঠ)',
    hindiTitle: 'कैरन (पेशेवर पुरुष आवाज़)',
    description: 'Professional, articulate shopkeeper tone',
    badge: 'Professional',
    avatarIcon: '🏪',
  },
];

// Indic Tutorial voice preset samples for the Studio
export interface IndicStudioPreset {
  id: string;
  titleNative: string;
  titleEn: string;
  category: string;
  lang: 'as' | 'hi' | 'bn';
  recommendedVoiceId: string;
  nativeText: string;
  englishTranslation: string;
}

export type AssameseStudioPreset = IndicStudioPreset;

export const ASSAMESE_STUDIO_PRESETS: IndicStudioPreset[] = [
  {
    id: 'pos-billing-as',
    titleNative: '১. পিঅ’এছ দ্ৰুত বিলিং আৰু ৰচিদ প্ৰিণ্ট',
    titleEn: '1. Fast POS Billing & Thermal Receipts',
    category: 'Billing & POS',
    lang: 'as',
    recommendedVoiceId: 'pratibha-as-female',
    nativeText:
      'হিচাপ কিতাপ পইণ্ট অব চেল বিলিঙলৈ আপোনাক স্বাগতম। কুইক এণ্ট্ৰী টেব খোলক, সামগ্ৰী নিৰ্বাচন কৰক বা বাৰক’ড স্কেন কৰক। সম্পূৰ্ণ বিক্ৰী বোতামত টিপি লগে লগে জিএছটি ইনভইচ লাভ কৰক আৰু হোৱাটছএপত ৰচিদ পঠিয়াওক।',
    englishTranslation:
      'Welcome to Hisab Kitap Point of Sale billing. Open the Quick Entry tab, select products or scan barcodes. Click Complete Sale to print instant GST invoices and send WhatsApp receipts.',
  },
  {
    id: 'customer-khata-as',
    titleNative: '২. গ্ৰাহকৰ বাকী খাতা আৰু হোৱাটছএপ লিংক',
    titleEn: '2. Customer Khata & WhatsApp Payment Links',
    category: 'Credit & Khata',
    lang: 'as',
    recommendedVoiceId: 'jonali-as-female',
    nativeText:
      'প্ৰতিজন গ্ৰাহকৰ বাকী খাতা অতি নিৰ্ভুলভাৱে পৰিচালনা কৰক। গ্ৰাহকৰ নাম বিচাৰি বাকী ধন চাওক, কিউআৰ ক’ড দেখুৱাই ধন সংগ্ৰহ কৰক আৰু মাত্ৰ এটা ক্লিকেৰে হোৱাটছএপত পৰিশোধৰ লিংক পঠিয়াওক।',
    englishTranslation:
      'Manage every customer credit ledger with 100% accuracy. Search customer names to check dues, collect via UPI QR, and send WhatsApp payment reminders in one click.',
  },
  {
    id: 'inventory-alerts-as',
    titleNative: '৩. দোকানৰ সামগ্ৰী আৰু ষ্টক সতৰ্কবাৰ্তা',
    titleEn: '3. Product Inventory & Low Stock Alerts',
    category: 'Inventory',
    lang: 'as',
    recommendedVoiceId: 'rupali-as-female',
    nativeText:
      'দোকানৰ সামগ্ৰী শেষ হোৱাৰ পূৰ্বেই ডেশ্বব’ৰ্ডত সতৰ্কবাৰ্তা লাভ কৰক। ক্ৰয় মূল্য আৰু বিক্ৰী মূল্য নিৰ্ধাৰণ কৰি লাভৰ শতাংশ স্বয়ংক্ৰিয়ভাৱে হিচাপ কৰক আৰু ব্যৱসায় বৃদ্ধি কৰক।',
    englishTranslation:
      'Get instant warnings on your dashboard before essential store items run out. Configure buy and sell prices to auto-calculate margins and grow your retail business.',
  },
  {
    id: 'backup-restore-as',
    titleNative: '৪. অফলাইন বেকআপ আৰু ভাষা পৰিৱৰ্তন',
    titleEn: '4. Offline Cloud Backup & Regional Languages',
    category: 'Data & Security',
    lang: 'as',
    recommendedVoiceId: 'pratibha-as-female',
    nativeText:
      'হিচাপ কিতাপ সম্পূৰ্ণ অসমীয়া, বাংলা, হিন্দী আৰু ইংৰাজীত উপলব্ধ। যিকোনো সময়তে আপোনাৰ দোকানৰ সম্পূৰ্ণ তথ্য সুৰক্ষিতভাৱে বেকআপ লওক আৰু পিন লক ব্যৱহাৰ কৰি সুৰক্ষিত ৰাখক।',
    englishTranslation:
      'Hisab Kitap offers regional language support in Assamese, Bengali, Hindi, and English. Download offline JSON backups anytime and lock the ledger with 4-digit PIN security.',
  },
  {
    id: 'store-welcome-as',
    titleNative: '৫. দোকানৰ দৈনিক শুভ উদ্বোধন বাৰ্তা',
    titleEn: '5. Daily Store Greeting & Welcome Announcement',
    category: 'Store Greetings',
    lang: 'as',
    recommendedVoiceId: 'pratibha-as-female',
    nativeText:
      'নমস্কাৰ! আমাৰ দোকানলৈ আপোনাক আন্তৰিক স্বাগতম। আজিৰ সকলো লেনদেন আৰু হিচাপ-নিকাচ সুন্দৰভাৱে লিপিবদ্ধ কৰক। আপোনাৰ দিনটো শুভ আৰু ব্যৱসায় লাভজনক হওক!',
    englishTranslation:
      'Namaskar! Welcome to our store. Accurately record all daily sales and khata entries. Wishing you a profitable and successful business day!',
  },
  {
    id: 'payment-reminder-as',
    titleNative: '৬. গ্ৰাহকৰ বাকী ধন পৰিশোধৰ অনুৰোধ',
    titleEn: '6. Polite Due Payment Voice Reminder',
    category: 'Store Greetings',
    lang: 'as',
    recommendedVoiceId: 'jonali-as-female',
    nativeText:
      'নমস্কাৰ গ্ৰাহক ডাঙৰীয়া, আপোনাৰ দোকানৰ বাকী ধনৰ হিচাপ আপডেট কৰা হৈছে। অনুগ্ৰহ কৰি তলত দিয়া ইউপিআই লিংক বা কিউআৰ ক’ডৰ জৰিয়তে পৰিশোধ কৰক। ধন্যবাদ!',
    englishTranslation:
      'Namaskar respected customer, your store credit ledger has been updated. Kindly settle the pending due via the UPI link or QR code below. Thank you!',
  },
];

export const HINDI_STUDIO_PRESETS: IndicStudioPreset[] = [
  {
    id: 'pos-billing-hi',
    titleNative: '१. पीओएस त्वरित बिलिंग और जीएसटी रसीद',
    titleEn: '1. Fast POS Billing & GST Invoices',
    category: 'Billing & POS',
    lang: 'hi',
    recommendedVoiceId: 'ananya-hi-female',
    nativeText:
      'हिसाब किताब पॉइंट ऑफ़ सेल बिलिंग में आपका स्वागत है। क्विक एंट्री टैब खोलें, उत्पाद चुनें या बारकोड स्कैन करें। सेल पूरी करें बटन पर क्लिक करके तुरंत जीएसटी टैक्स इनवॉइस बनाएं और व्हाट्सएप पर रसीद भेजें।',
    englishTranslation:
      'Welcome to Hisab Kitap Point of Sale billing. Open the Quick Entry tab, select products or scan barcodes. Click Complete Sale to print instant GST invoices and send WhatsApp receipts.',
  },
  {
    id: 'customer-khata-hi',
    titleNative: '२. ग्राहक उधार खाता और व्हाट्सएप तगादा',
    titleEn: '2. Customer Udhar Khata & WhatsApp Payment Links',
    category: 'Credit & Khata',
    lang: 'hi',
    recommendedVoiceId: 'pooja-hi-female',
    nativeText:
      'हर ग्राहक का उधार खाता १००% शुद्धता से प्रबंधित करें। ग्राहक का नाम खोजें, बकाया राशि देखें, यूपीआई क्यूआर कोड दिखाकर तुरंत भुगतान प्राप्त करें और एक क्लिक में व्हाट्सएप रिमाइंडर भेजें।',
    englishTranslation:
      'Manage every customer credit ledger with 100% accuracy. Search customer names to check dues, collect via UPI QR, and send WhatsApp payment reminders in one click.',
  },
  {
    id: 'inventory-alerts-hi',
    titleNative: '३. दुकान का स्टॉक और कम इन्वेंट्री अलर्ट',
    titleEn: '3. Product Inventory & Low Stock Alerts',
    category: 'Inventory',
    lang: 'hi',
    recommendedVoiceId: 'priya-hi-female',
    nativeText:
      'दुकान का सामान खत्म होने से पहले ही अपने डैशबोर्ड पर तुरंत चेतावनी प्राप्त करें। खरीद मूल्य और बिक्री मूल्य दर्ज करके अपना लाभ प्रतिशत स्वचालित रूप से जांचें और मुनाफा बढ़ाएं।',
    englishTranslation:
      'Get instant warnings on your dashboard before essential store items run out. Configure buy and sell prices to auto-calculate margins and grow your retail business.',
  },
  {
    id: 'backup-restore-hi',
    titleNative: '४. सुरक्षित ऑफलाइन बैकअप और डेटा रीस्टोर',
    titleEn: '4. Offline Backup & Data Security',
    category: 'Data & Security',
    lang: 'hi',
    recommendedVoiceId: 'ananya-hi-female',
    nativeText:
      'हिसाब किताब पूरी तरह सुरक्षित और ऑफलाइन काम करता है। कभी भी अपने पूरे स्टोर का बैकअप जेसन (JSON) फाइल में डाउनलोड करें और नए फोन या कंप्यूटर में तुरंत रीस्टोर करें।',
    englishTranslation:
      'Hisab Kitap works 100% offline and secure. Download full shop backups as JSON anytime and restore instantly on any new device.',
  },
  {
    id: 'store-welcome-hi',
    titleNative: '५. दैनिक दुकान स्वागत उद्घोषणा',
    titleEn: '5. Daily Store Greeting & Welcome Announcement',
    category: 'Store Greetings',
    lang: 'hi',
    recommendedVoiceId: 'ananya-hi-female',
    nativeText:
      'नमस्ते! हमारी दुकान में आपका हार्दिक स्वागत है। आज के सभी लेनदेन और खाते का हिसाब सुगमता से दर्ज करें। आपका दिन शुभ और व्यापार लाभकारी हो!',
    englishTranslation:
      'Namaste! Welcome to our store. Accurately record all daily sales and khata entries. Wishing you a profitable and successful business day!',
  },
  {
    id: 'payment-reminder-hi',
    titleNative: '६. बकाया भुगतान का विनम्र तगादा',
    titleEn: '6. Polite Due Payment Reminder',
    category: 'Store Greetings',
    lang: 'hi',
    recommendedVoiceId: 'pooja-hi-female',
    nativeText:
      'नमस्ते आदरणीय ग्राहक जी, आपकी दुकान की बकाया राशि का हिसाब अपडेट कर दिया गया है। कृपया नीचे दिए गए यूपीआई लिंक या क्यूआर कोड से भुगतान करें। धन्यवाद!',
    englishTranslation:
      'Namaste respected customer, your store credit ledger has been updated. Kindly settle the pending due via the UPI link or QR code below. Thank you!',
  },
];

// In-memory cache of generated WAV blob URLs to avoid redundant network requests
const blobUrlCache = new Map<string, string>();

/**
 * Converts raw 24kHz 16-bit Mono Little-Endian PCM data (base64) into a playable WAV Blob URL
 */
export function pcmBase64ToWavBlobUrl(base64Data: string, sampleRate = 24000): string {
  try {
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    // 0x00: "RIFF"
    view.setUint32(0, 0x52494646, false);
    // 0x04: file size - 8
    view.setUint32(4, 36 + bytes.length, true);
    // 0x08: "WAVE"
    view.setUint32(8, 0x57415645, false);
    // 0x0C: "fmt "
    view.setUint32(12, 0x666d7420, false);
    // 0x10: sub-chunk size (16 for PCM)
    view.setUint32(16, 16, true);
    // 0x14: audio format (1 = PCM)
    view.setUint16(20, 1, true);
    // 0x16: num channels (1 = mono)
    view.setUint16(22, 1, true);
    // 0x18: sample rate
    view.setUint32(24, sampleRate, true);
    // 0x1C: byte rate (SampleRate * NumChannels * BitsPerSample/8)
    view.setUint32(28, sampleRate * 2, true);
    // 0x20: block align (NumChannels * BitsPerSample/8)
    view.setUint16(32, 2, true);
    // 0x22: bits per sample (16)
    view.setUint16(34, 16, true);
    // 0x24: "data"
    view.setUint32(36, 0x64617461, false);
    // 0x28: data size
    view.setUint32(40, bytes.length, true);

    const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Error converting PCM to WAV:', err);
    throw err;
  }
}

/**
 * Fetches realistic human voice audio from backend Gemini TTS endpoint
 */
export async function fetchHumanSpeechAudio(
  text: string,
  lang: string,
  personaOrVoiceName: string = 'Kore'
): Promise<string> {
  // Map persona id to prebuilt Gemini voice name if persona id passed
  const foundPersona = HUMAN_VOICE_PERSONAS.find((p) => p.id === personaOrVoiceName);
  const geminiVoice = foundPersona ? foundPersona.voiceName : personaOrVoiceName;

  const cacheKey = `${lang}_${geminiVoice}_${text.trim()}`;
  if (blobUrlCache.has(cacheKey)) {
    return blobUrlCache.get(cacheKey)!;
  }

  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      lang,
      voice: geminiVoice,
    }),
  });

  if (!response.ok) {
    throw new Error(`TTS server responded with status: ${response.status}`);
  }

  const data = await response.json();
  if (data.fallback || !data.audio) {
    throw new Error(data.error || 'Server indicated local speech fallback');
  }

  const wavBlobUrl = pcmBase64ToWavBlobUrl(data.audio, 24000);
  blobUrlCache.set(cacheKey, wavBlobUrl);
  return wavBlobUrl;
}

/**
 * Download synthesized audio file
 */
export function downloadWavAudio(blobUrl: string, filename: string = 'hisapkitap_assamese_tutorial.wav') {
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
