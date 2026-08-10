import React, { useState, useEffect } from 'react';
import {
  BookOpen, Search, LogOut, GraduationCap, TrendingUp,
  Coins, Moon, Scale, Globe, ShieldAlert, Languages,
  Compass, Brain, PenTool, BookOpenCheck, ExternalLink,
  RefreshCw, FileText, CheckCircle2, HelpCircle, Activity,
  FileDown, ChevronDown, Sparkles, Trash2, User, Lock, Settings
} from 'lucide-react';
import { supabase } from './supabaseClient';

interface Book {
  'الشعبة': string;
  'الفصل': string;
  'اسم الكتاب': string;
  'رابط التحميل': string;
}

interface NoEmailStudent {
  id: string;
  fullName: string;
  timestamp: string;
}

// --- Constants & Config ---
const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/export?format=csv";

const DEPARTMENTS = [
  "الفلسفة التطبيقية",
  "القانون (عام)",
  "القانون (خاص)",
  "الدراسات العربية",
  "الدراسات الإسلامية",
  "الدراسات الإنجليزية",
  "الدراسات الفرنسية",
  "الإقتصاد",
  "التدبير"
];

const SEMESTERS = ["S1", "S2", "S3", "S4", "S5", "S6"];

// Mapping of Departments to elegant icons and descriptive subtitles
const DEPT_META: Record<string, { icon: React.ReactNode; subtitle: string; gradient: string }> = {
  "الفلسفة التطبيقية": {
    icon: <Brain className="w-6 h-6 text-amber-600" />,
    subtitle: "فلسفة عملية وتحليل معاصر",
    gradient: "from-amber-500/10 to-orange-500/10"
  },
  "القانون (عام)": {
    icon: <Globe className="w-6 h-6 text-emerald-600" />,
    subtitle: "القانون الإداري والنشاط الدولي",
    gradient: "from-emerald-500/10 to-teal-500/10"
  },
  "القانون (خاص)": {
    icon: <Scale className="w-6 h-6 text-blue-600" />,
    subtitle: "المعاملات المدنية، العقارية والتجارية",
    gradient: "from-blue-500/10 to-indigo-500/10"
  },
  "الدراسات العربية": {
    icon: <PenTool className="w-6 h-6 text-red-600" />,
    subtitle: "لسانيات وبلاغة وأدب مغربي وأندلسي",
    gradient: "from-red-500/10 to-pink-500/10"
  },
  "الدراسات الإسلامية": {
    icon: <BookOpenCheck className="w-6 h-6 text-emerald-700" />,
    subtitle: "فقه النوازل، القرآن الكريم والحديث الشريف",
    gradient: "from-emerald-600/10 to-green-600/10"
  },
  "الدراسات الإنجليزية": {
    icon: <Languages className="w-6 h-6 text-violet-600" />,
    subtitle: "English Literature & Applied Linguistics",
    gradient: "from-violet-500/10 to-purple-500/10"
  },
  "الدراسات الفرنسية": {
    icon: <GraduationCap className="w-6 h-6 text-cyan-600" />,
    subtitle: "Littérature, Syntaxe et Études Francophones",
    gradient: "from-cyan-500/10 to-sky-500/10"
  },
  "الإقتصاد": {
    icon: <TrendingUp className="w-6 h-6 text-amber-700" />,
    subtitle: "التحليل المالي والاقتصاد الكلي والجزئي",
    gradient: "from-amber-600/10 to-yellow-600/10"
  },
  "التدبير": {
    icon: <Coins className="w-6 h-6 text-yellow-600" />,
    subtitle: "علوم التدبير وتسيير المقاولات والمشاريع",
    gradient: "from-yellow-500/10 to-amber-500/10"
  }
};

// Elegant cover themes for simulated books
const COVER_GRADIENTS = [
  "linear-gradient(135deg, #0f3d30 0%, #1a5c47 100%)", // Emerald
  "linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)", // Deep Violet
  "linear-gradient(135deg, #881337 0%, #be123c 100%)", // Burgundy
  "linear-gradient(135deg, #78350f 0%, #b45309 100%)", // Rich Amber/Wood
  "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", // Classic Indigo
  "linear-gradient(135deg, #115e59 0%, #14b8a6 100%)", // Teal
  "linear-gradient(135deg, #022c22 0%, #064e3b 100%)"  // Forest Green
];

// Fallback high-quality syllabi and key subject references for Errachidia (loaded instantly and updated with sheets fetch)
const FALLBACK_BOOKS: Book[] = [
  // الفلسفة التطبيقية
  { "الشعبة": "الفلسفة التطبيقية", "الفصل": "S1", "اسم الكتاب": "مدخل إلى الفلسفة التطبيقية", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "الفلسفة التطبيقية", "الفصل": "S1", "اسم الكتاب": "مناهج البحث الفلسفي", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "الفلسفة التطبيقية", "الفصل": "S2", "اسم الكتاب": "تاريخ الفلسفة الحديثة", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "الفلسفة التطبيقية", "الفصل": "S3", "اسم الكتاب": "فلسفة الأخلاق والقيم", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "الفلسفة التطبيقية", "الفصل": "S4", "اسم الكتاب": "المنطق والابستمولوجيا", "رابط التحميل": "" },
  { "الشعبة": "الفلسفة التطبيقية", "الفصل": "شامل", "اسم الكتاب": "معجم المصطلحات الفلسفية الشامل", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },

  // القانون (عام)
  { "الشعبة": "القانون (عام)", "الفصل": "S1", "اسم الكتاب": "المدخل للعلوم القانونية", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "القانون (عام)", "الفصل": "S1", "اسم الكتاب": "المدخل للقانون الدستوري", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "القانون (عام)", "الفصل": "S2", "اسم الكتاب": "القانون الإداري والتنظيم الإداري", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "القانون (عام)", "الفصل": "S3", "اسم الكتاب": "قانون الميزانية والمالية العامة", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "القانون (عام)", "الفصل": "S4", "اسم الكتاب": "القانون الدولي العام والأجهزة الأممية", "رابط التحميل": "" },
  { "الشعبة": "القانون (عام)", "الفصل": "S5", "اسم الكتاب": "المنازعات الإدارية وقانون الصفقات", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "القانون (عام)", "الفصل": "شامل", "اسم الكتاب": "دليل المصطلحات الدستورية المعاصرة", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },

  // الدراسات العربية
  { "الشعبة": "الدراسات العربية", "الفصل": "S1", "اسم الكتاب": "النحو والصرف وبنية الكلمة", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "الدراسات العربية", "الفصل": "S1", "اسم الكتاب": "تاريخ الأدب الجاهلي وقضاياه", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "الدراسات العربية", "الفصل": "S2", "اسم الكتاب": "البلاغة العربية: علم المعاني والبيان", "رابط التحميل": "" },
  { "الشعبة": "الدراسات العربية", "الفصل": "S3", "اسم الكتاب": "أدب العصر العباسي: تجديد وتأصيل", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "الدراسات العربية", "الفصل": "شامل", "اسم الكتاب": "ديوان لغة الضاد ومراجع اللسانيات التطبيقية", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },

  // الدراسات الإسلامية
  { "الشعبة": "الدراسات الإسلامية", "الفصل": "S1", "اسم الكتاب": "مدخل لدراسة القرآن الكريم وعلومه", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "الدراسات الإسلامية", "الفصل": "S1", "اسم الكتاب": "مدخل لدراسة الحديث النبوي الشريف", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "الدراسات الإسلامية", "الفصل": "S2", "اسم الكتاب": "فقه العبادات (المذهب المالكي)", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "الدراسات الإسلامية", "الفصل": "S3", "اسم الكتاب": "أصول الفقه ومصادر التشريع الأساسية", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "الدراسات الإسلامية", "الفصل": "شامل", "اسم الكتاب": "موسوعة فقه النوازل في المذهب المالكي", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },

  // الإقتصاد
  { "الشعبة": "الإقتصاد", "الفصل": "S1", "اسم الكتاب": "Introduction à l'Économie", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "الإقتصاد", "الفصل": "S1", "اسم الكتاب": "Comptabilité Générale I", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "الإقتصاد", "الفصل": "S2", "اسم الكتاب": "Macroéconomie I", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "الإقتصاد", "الفصل": "S3", "اسم الكتاب": "Statistiques Descriptives & Probabilités", "رابط التحميل": "" },
  { "الشعبة": "الإقتصاد", "الفصل": "شامل", "اسم الكتاب": "Précis d'Économétrie et Analyse Financière", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },

  // التدبير
  { "الشعبة": "التدبير", "الفصل": "S1", "اسم الكتاب": "Introduction au Management", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "التدبير", "الفصل": "S1", "اسم الكتاب": "Comptabilité Générale d'Entreprise", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "التدبير", "الفصل": "S2", "اسم الكتاب": "Management des Organisations", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" },
  { "الشعبة": "التدبير", "الفصل": "S3", "اسم الكتاب": "Gestion des Ressources Humaines", "رابط التحميل": "" },
  { "الشعبة": "التدبير", "الفصل": "شامل", "اسم الكتاب": "دليل التدبير وتسيير المقاولات", "رابط التحميل": "https://docs.google.com/spreadsheets/d/1oBDLx7XpHFh9JHz-kUxak4PMaAVEBC9Os22TFg7CAIo/edit" }
];

// --- Simple RFC 4180 CSV Parser ---
function parseCSV(text: string): Book[] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      row.push(currentVal.trim());
      if (row.length > 1 || row[0] !== '') {
        lines.push(row);
      }
      row = [];
      currentVal = '';
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
    } else {
      currentVal += char;
    }
  }
  if (row.length > 0 || currentVal !== '') {
    row.push(currentVal.trim());
    lines.push(row);
  }

  if (lines.length < 2) return [];

  const headers = lines[0].map(h => h.trim());

  // Intelligent key mapping for flexibility
  return lines.slice(1).map(rowValues => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = rowValues[index] || '';
    });

    const getVal = (keys: string[]) => {
      for (const k of keys) {
        if (obj[k] !== undefined) return obj[k];
        for (const rowKey of Object.keys(obj)) {
          if (rowKey.toLowerCase().trim() === k.toLowerCase()) {
            return obj[rowKey];
          }
        }
      }
      return '';
    };

    return {
      'الشعبة': getVal(['الشعبة', 'department', 'dept', 'القسم', 'branch']),
      'الفصل': getVal(['الفصل', 'semester', 'sem', 'الترم', 'class']),
      'اسم الكتاب': getVal(['اسم الكتاب', 'اسم المادة', 'book name', 'title', 'book', 'الكتاب', 'المادة']),
      'رابط التحميل': getVal(['رابط التحميل', 'رابط التحميل والتحضير', 'download url', 'link', 'download link', 'الرابط'])
    };
  });
}

// --- Combined University Logo Component ---
const CombinedUniversityLogo = () => (
  <div className="bg-white rounded-2xl shadow-sm p-3 flex items-center justify-center w-full max-w-xl mx-auto mb-6 border border-gray-100">
    <img
      src="/college-logo.png"
      alt="شعار جامعة مولاي إسماعيل والكلية متعددة التخصصات"
      className="h-16 sm:h-20 w-auto object-contain"
    />
  </div>
);

// --- BEAUTIFULLY DECORATED STUDENT VISITOR CARD ---
interface StudentCardProps {
  fullNameFr: string;
  fullNameAr: string;
  cin: string;
  massar: string;
  dept: string;
  semester: string;
}

const StudentVisitorCard = ({ fullNameFr, fullNameAr, cin, massar, dept, semester }: StudentCardProps) => {

  const handlePrint = () => {
    const cardElement = document.getElementById('student-card');
    if (cardElement) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>بطاقة الطالب</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                }
                body {
                  display: flex;
                  justify-content: center;
                  padding-top: 40px;
                }
              </style>
            </head>
            <body>
              ${cardElement.outerHTML}
            </body>
          </html>
        `);
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000);
      }
    }
  };

  return (
    <div className="bg-[#fcfaf2] border-2 border-amber-400 rounded-2xl p-4 shadow-lg text-right relative overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* عنوان البطاقة */}
      <div className="text-center font-['Amiri'] text-xs font-bold text-amber-700 border-b border-amber-300 pb-2 mb-3 flex items-center justify-end">
        <span className="flex items-center gap-1.5 font-bold">
          <span>🪪 بطاقة الهوية الجامعية الذكية للطالب</span>
        </span>
      </div>

      {/* البطاقة الفيزيائية */}
      <div id="student-card" className="relative w-full aspect-[1.586/1] rounded-xl overflow-hidden bg-gradient-to-br from-[#0c3024] via-[#061f17] to-[#020e0a] p-3 text-white flex flex-col justify-between shadow-2xl border border-emerald-500/30">

        {/* الخلفية الزخرفية */}
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay flex items-center justify-center">
          <svg className="w-full h-full text-amber-300" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 L61 35 L95 25 L70 50 L95 75 L61 65 L50 100 L39 65 L5 75 L30 50 L5 25 L39 35 Z" />
          </svg>
        </div>

        {/* رأس البطاقة */}
        <div className="relative z-10 flex justify-between items-start border-b border-white/20 pb-2">
          {/* معلومات الجامعة (يسار) */}
          <div className="text-left flex flex-col justify-center mt-1">
            <div className="text-[8px] font-sans font-extrabold tracking-wider text-amber-300">FPE ERRACHIDIA</div>
            <div className="text-[6.5px] font-sans text-gray-300 mt-0.5">Université Moulay Ismaïl</div>
          </div>

          {/* التعديل الجديد: علم الأمازيغ وشعار L-O (يمين) */}
          <div className="flex flex-col items-center justify-center gap-1.5">
            {/* دائرة العلم */}
            <div className="w-9 h-9 rounded-full overflow-hidden flex flex-col relative border-[1.5px] border-amber-400/80 shadow-md bg-white">
              <div className="w-full h-1/3 bg-[#0089CC]"></div> {/* اللون الأزرق */}
              <div className="w-full h-1/3 bg-[#009A44]"></div> {/* اللون الأخضر */}
              <div className="w-full h-1/3 bg-[#FFC300]"></div> {/* اللون الأصفر */}
              {/* حرف الزاي ⵣ */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-[#E3001B] font-bold text-lg leading-none"
                  style={{ textShadow: '0.5px 0.5px 0 rgba(255,255,255,0.9), -0.5px -0.5px 0 rgba(255,255,255,0.9), 0.5px -0.5px 0 rgba(255,255,255,0.9), -0.5px 0.5px 0 rgba(255,255,255,0.9)' }}
                >
                  ⵣ
                </span>
              </div>
            </div>
            {/* شعار L-O */}
            <div className="text-center">
              <span className="text-[10px] font-bold text-amber-400 block tracking-widest font-serif leading-none drop-shadow-md">ℒ-𝒪</span>
            </div>
          </div>
        </div>

        {/* معلومات الطالب */}
        <div className="relative z-10 mt-2 text-right">
          <div className="text-sm font-bold text-white">{fullNameAr}</div>
          <div className="text-[10px] text-gray-300">{fullNameFr}</div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-[8px]">
            <div><span className="text-emerald-400">رقم المسار:</span> {massar}</div>
            <div><span className="text-emerald-400">CIN:</span> {cin}</div>
            <div><span className="text-emerald-400">الشعبة:</span> {dept}</div>
            <div><span className="text-emerald-400">الفصل:</span> {semester}</div>
          </div>
        </div>
      </div>

      {/* زر الطباعة */}
      <button
        onClick={handlePrint}
        className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg font-bold text-sm transition-all shadow-md"
      >
        طباعة البطاقة 🖨️
      </button>
    </div>
  );
};

export default function App() {
  // --- States ---
  const [loggedIn, setLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('umi_logged_in') === 'true';
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('umi_is_admin') === 'true';
  });
  const [emailPrefix, setEmailPrefix] = useState<string>(() => {
    return localStorage.getItem('umi_email_prefix') || '';
  });
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
// دالة إرسال رابط إعادة تعيين كلمة السر بالبريد الأكاديمي
const handleResetPassword = async () => {
    if (!emailPrefix) {
      alert("Please enter your email first");
      return;
    }

    const fullEmail = `${emailPrefix.trim()}@edu.umi.ac.ma`;

    const { data, error } = await supabase.auth.resetPasswordForEmail(fullEmail, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Password reset link sent successfully to your email!");
    }
  };
  // Fallback student details
  const [studentFullNameFr, setStudentFullNameFr] = useState<string>(() => {
    return localStorage.getItem('umi_logged_student_name_fr') || '';
  });
  const [studentFullName, setStudentFullName] = useState<string>(() => {
    return localStorage.getItem('umi_logged_student_name') || '';
  });
  const [studentCIN, setStudentCIN] = useState<string>(() => {
    return localStorage.getItem('umi_logged_student_cin') || '';
  });
  const [studentMassar, setStudentMassar] = useState<string>(() => {
    return localStorage.getItem('umi_logged_student_massar') || '';
  });
  const [studentDept, setStudentDept] = useState<string>(() => {
    return localStorage.getItem('umi_logged_student_dept') || 'الفلسفة التطبيقية';
  });
  const [studentSemester, setStudentSemester] = useState<string>(() => {
    return localStorage.getItem('umi_logged_student_semester') || 'S1';
  });

  // Saved students without email
  const [noEmailStudents, setNoEmailStudents] = useState<NoEmailStudent[]>(() => {
    try {
      const stored = localStorage.getItem('umi_no_email_students');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [books, setBooks] = useState<Book[]>(FALLBACK_BOOKS);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [sheetsError, setSheetsError] = useState<string | null>(null);

  const [selectedDept, setSelectedDept] = useState<string>("الفلسفة التطبيقية");
  const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({
    "S1": true,
    "S2": false,
    "S3": false,
    "S4": false,
    "S5": false,
    "S6": false
  });
  const [noorQuery, setNoorQuery] = useState<string>('');
  const [noEmailSearch, setNoEmailSearch] = useState<string>('');

  const isFallbackEmail = emailPrefix.trim().toLowerCase() === "fpe.errachidia" ||
    emailPrefix.trim().toLowerCase() === "fpe.errachidia@edu.umi.ac.ma";

  // --- Fetch Sheets Data ---
  const fetchSheetsData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(GOOGLE_SHEETS_CSV_URL);
      if (!res.ok) throw new Error("لم نتمكن من الوصول لملف جوجل شيت المباشر.");
      const text = await res.text();
      const parsed = parseCSV(text);
      if (parsed && parsed.length > 0) {
        // Filter out empty rows or invalid entries
        const cleanBooks = parsed.filter(b => b['الشعبة'] && b['اسم الكتاب']);
        setBooks(cleanBooks);
        setSheetsError(null);
      } else {
        throw new Error("تنسيق جدول البيانات غير متطابق.");
      }
    } catch (err: any) {
      console.warn("Using fallback syllabus because sheets fetch failed or blocked:", err.message);
      setSheetsError("يتعذر تحديث البيانات مباشرة بسبب إعدادات الخصوصية، تم تشغيل الحفظ المحلي.");
      // Fallback stays active
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSheetsData();
  }, []);

  // If logging in with the fallback account
  if (isFallbackEmail) {
    // Register student details
    const newStudent: NoEmailStudent = {
      id: Date.now().toString(),
      fullName: cFullName,
      cin: cCIN,
      massar: cMassar,
      timestamp: new Date().toLocaleString('ar-MA', { timeZone: 'Africa/Casablanca' })
    };
}
  // --- Auth Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cFullNameFr = studentFullNameFr.trim();
    const cFullName = studentFullName.trim() || cFullNameFr;
    const cCIN = studentCIN.trim().toUpperCase();
    const cMassar = studentMassar.trim().toUpperCase();
    const cDept = studentDept;
    const cSemester = studentSemester;

    if (!cFullNameFr) {
      setLoginError("❌ يرجى إدخال الاسم الكامل باللغة الفرنسية أولاً!");
      return;
    }
    if (!emailPrefix.trim()) {
      setLoginError("❌ يرجى إدخال البريد الأكاديمي أولاً!");
      return;
    }
    // Standardize prefix and ensure it ends with or is appended with the university domain
    let fullEmail = emailPrefix.trim().toLowerCase();
    if (!fullEmail.endsWith('@edu.umi.ac.ma')) {
      fullEmail += '@edu.umi.ac.ma';
    }

    if (password === "admin2024") {
      setLoggedIn(true);
      setIsAdmin(true);
      localStorage.setItem('umi_logged_in', 'true');
      localStorage.setItem('umi_is_admin', 'true');
      localStorage.setItem('umi_email_prefix', emailPrefix);
      localStorage.setItem('umi_logged_student_name_fr', cFullNameFr);
      localStorage.setItem('umi_logged_student_name', cFullName);
      localStorage.setItem('umi_logged_student_dept', cDept);
      localStorage.setItem('umi_logged_student_semester', cSemester);
    } else if (password === "fpe2024") {
      // Save active student details for the student card
      localStorage.setItem('umi_logged_student_name_fr', cFullNameFr);
      localStorage.setItem('umi_logged_student_name', cFullName);
      localStorage.setItem('umi_logged_student_cin', cCIN);
      localStorage.setItem('umi_logged_student_massar', cMassar);
      localStorage.setItem('umi_logged_student_dept', cDept);
      localStorage.setItem('umi_logged_student_semester', cSemester);

      // If logging in with the fallback account
      if (isFallbackEmail) {
        // Register student details
        const newStudent: NoEmailStudent = {
          id: Date.now().toString(),
          fullName: cFullName,
          timestamp: new Date().toLocaleString('ar-MA', { timeZone: 'Africa/Casablanca' })
        };

        // Save to noEmailStudents list
        const updatedList = [newStudent, ...noEmailStudents.filter(s => s.fullName !== cFullName)];
        localStorage.setItem('umi_no_email_students', JSON.stringify(updatedList));
      }

      setLoggedIn(true);
      setIsAdmin(false);
      localStorage.setItem('umi_logged_in', 'true');
      localStorage.setItem('umi_is_admin', 'false');
      localStorage.setItem('umi_email_prefix', emailPrefix);
    } else {
      setLoginError("❌ كلمة المرور غير صحيحة! يرجى مراجعة كلمة مرور شعبة الرشيدية.");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setIsAdmin(false);
    setPassword('');
    setStudentFullName('');
    setStudentFullNameFr('');
    setStudentCIN('');
    setStudentMassar('');
    setStudentDept('الفلسفة التطبيقية');
    setStudentSemester('S1');
    localStorage.removeItem('umi_logged_in');
    localStorage.removeItem('umi_is_admin');
    localStorage.removeItem('umi_email_prefix');
    localStorage.removeItem('umi_logged_student_name_fr');
    localStorage.removeItem('umi_logged_student_name');
    localStorage.removeItem('umi_logged_student_dept');
    localStorage.removeItem('umi_logged_student_semester');
  };

  const handleDeleteNoEmailStudent = (id: string) => {
    const updated = noEmailStudents.filter(s => s.id !== id);
    setNoEmailStudents(updated);
    localStorage.setItem('umi_no_email_students', JSON.stringify(updated));
  };

  const handleClearAllNoEmailStudents = () => {
    if (window.confirm("هل أنت متأكد من مسح جميع سجلات الطلبة بدون إيمايل؟")) {
      setNoEmailStudents([]);
      localStorage.setItem('umi_no_email_students', JSON.stringify([]));
    }
  };

  // --- Toggle Semesters ---
  const toggleSemester = (sem: string) => {
    setExpandedSemesters(prev => ({
      ...prev,
      [sem]: !prev[sem]
    }));
  };

  // --- Filter Books ---
  const filteredBooks = books.filter(b => {
    // Normalise spaces and trim
    const rowDept = (b['الشعبة'] || '').trim();
    return rowDept === selectedDept;
  });

  // Get unique book colors/designs based on index
  const getBookGradient = (index: number) => {
    return COVER_GRADIENTS[index % COVER_GRADIENTS.length];
  };

  // Derive readable name from email prefix (e.g. "l.oukhouaou" -> "L. Oukhouaou") or fallback name
  const getReadableStudentName = () => {
    if (studentFullName && isFallbackEmail) {
      return studentFullName;
    }
    if (!emailPrefix) return "طالب الرشيدية";
    const clean = emailPrefix.replace('@edu.umi.ac.ma', '').split('.');
    return clean.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen vintage-pattern text-gray-800 pb-12 transition-all duration-300">

      {/* 1. AUTH GATE SCREEN */}
      {!loggedIn ? (
        <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8">
          {/* Majestic Arched Gate Frame Card */}
          <div className="w-full max-w-lg bg-[#faf6ea] border-[6px] double border-[#bba14f] rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden">
            {/* Elegant Moroccan Ornamental Background Corner Patterns */}
            <div className="absolute top-0 right-0 w-16 h-16 opacity-10 text-[#aa7c11] pointer-events-none">
              <svg viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 L100,0 C100,50 50,100 0,100 Z" />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-16 h-16 opacity-10 text-[#aa7c11] pointer-events-none rotate-180">
              <svg viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 L100,0 C100,50 50,100 0,100 Z" />
              </svg>
            </div>

            {/* Logo and Monogram Header */}
            <div className="flex flex-col items-center text-center mb-6 space-y-4">
              <CombinedUniversityLogo />

              {/* بداية الشعار الأمازيغي الجديد لواجهة تسجيل الدخول */}
              <div className="flex flex-col items-center justify-center gap-2 my-4">

                {/* دائرة علم الأمازيغ */}
                <div className="w-16 h-16 rounded-full overflow-hidden flex flex-col relative border-2 border-amber-400 shadow-md bg-white shrink-0">
                  <div className="w-full h-1/3 bg-[#0089CC]"></div> {/* اللون الأزرق */}
                  <div className="w-full h-1/3 bg-[#009A44]"></div> {/* اللون الأخضر */}
                  <div className="w-full h-1/3 bg-[#FFC300]"></div> {/* اللون الأصفر */}

                  {/* حرف الزاي الأمازيغي (ⵣ) في المنتصف */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-[#E3001B] font-bold text-4xl leading-none mt-0.5"
                      style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.9), -1px -1px 0 rgba(255,255,255,0.9), 1px -1px 0 rgba(255,255,255,0.9), -1px 1px 0 rgba(255,255,255,0.9)' }}
                    >
                      ⵣ
                    </span>
                  </div>
                </div>

                {/* نص L-O تحت الدائرة مباشرة */}
                <span className="text-sm font-bold text-amber-600 tracking-widest font-serif leading-none drop-shadow-sm">
                  ℒ-𝒪
                </span>

              </div>
              {/* نهاية الشعار الأمازيغي الجديد */}

              <h1 className="text-xl md:text-2xl font-bold text-[#0f3d30] font-['Amiri'] drop-shadow-sm">🎓 بوابة الدخول الأكاديمية الموحدة</h1>
              <p className="text-xs text-[#aa7c11] font-semibold tracking-wide uppercase mt-0.5">
                Unified Portal - Students of Errachidia
              </p>
              <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#bba14f] to-transparent my-2"></div>
              <p className="text-xs text-[#6b4c1a] bg-[#f2ebd4] px-3 py-1.5 rounded-full border border-amber-200/50">
                الكلية متعددة التخصصات بالرشيدية — جامعة مولاي إسماعيل
              </p>
            </div>

            {/* Contact and Coordination Box - Moved to the Top with Facebook and WhatsApp */}
            <div className="mb-6 bg-gradient-to-br from-amber-50 to-[#fdfaf2] border-2 border-[#bba14f]/30 rounded-xl p-4 text-center shadow-sm relative overflow-hidden">
              <p className="text-xs font-bold text-[#0f3d30] mb-3">لطلب إضافة مواد جديدة، ملخصات أو كتب إضافية، تواصل مباشرة:</p>

              <div className="flex flex-wrap gap-2.5 justify-center items-center">
                {/* Facebook Link */}
                <a
                  href="https://www.facebook.com/share/1gfsSaGocB/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#1877F2] hover:bg-[#166fe5] hover:scale-105 text-white font-bold transition-all duration-300 shadow-md text-sm md:text-base"
                >
                  {/* هذا الكود سيعمل فوراً ولن يسبب أخطاء مكتبات */}
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>LAHCEN OUKHOUAOU</span>
                </a>

                {/* WhatsApp Link */}
                <a
                  href="https://wa.me/212623373467"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-all duration-300 shadow-sm hover:scale-105"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.182 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.637-1.03-5.114-2.905-6.989-1.874-1.875-4.355-2.907-6.992-2.908-5.438 0-9.87 4.424-9.873 9.87-.001 1.813.483 3.585 1.398 5.155l-1.021 3.73 3.822-1.002zm10.702-7.292c-.29-.145-1.71-.843-1.974-.939-.264-.096-.456-.145-.648.145-.191.29-.741.939-.909 1.129-.168.19-.336.213-.626.069-.29-.145-1.223-.45-2.33-1.437-.86-.768-1.441-1.716-1.61-2.005-.168-.29-.018-.445.127-.589.13-.13.29-.338.435-.507.145-.168.19-.29.288-.482.097-.19.048-.36-.024-.507-.072-.145-.648-1.56-.888-2.137-.233-.56-.471-.482-.648-.491-.166-.008-.356-.01-.545-.01s-.497.071-.757.353c-.26.282-.992.97-1.01 2.335-.018 1.365.992 2.68 1.13 2.87.137.19 1.95 2.977 4.724 4.17 1.838.79 2.585.836 3.504.698.56-.084 1.71-.698 1.95-1.373.24-.675.24-1.253.168-1.373-.072-.12-.264-.191-.555-.336z" />
                  </svg>
                  <span>الواتساب للتواصل</span>
                </a>
              </div>
            </div>

            {/* Login Error Alert */}
            {loginError && (
              <div className="bg-red-50 border-r-4 border-red-500 text-red-800 p-3 rounded-lg text-sm mb-4 font-semibold text-right flex items-center gap-2 animate-bounce">
                <span className="flex-1">{loginError}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* VISITOR IDENTITY CARD REGISTRATION - BEFORE EMAIL PREFIX */}
              <div className="bg-[#f5ebd1] border-2 border-dashed border-[#bba14f]/50 rounded-xl p-4 md:p-5 space-y-4 text-right shadow-inner relative overflow-hidden">
                {/* Decorative visual accent */}
                <div className="absolute -top-3 -left-3 text-[#bba14f]/15 pointer-events-none">
                  <GraduationCap className="w-16 h-16" />
                </div>

                <div className="text-xs font-bold text-[#0f3d30] border-b border-amber-300 pb-2 flex items-center justify-between">
                  <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">معلومات الهوية والبطاقة</span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  </span>
                </div>

                {/* 1. Full name in French */}
                <div>
                  <label className="block text-xs font-bold text-[#0f3d30] mb-1 flex items-center justify-end gap-1">
                    <span>الاسم الكامل باللغة الفرنسية (Nom Complet en Français) <span className="text-red-600 font-extrabold">*</span></span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-amber-700">
                      <User className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      required
                      value={studentFullNameFr}
                      onChange={(e) => setStudentFullNameFr(e.target.value)}
                      placeholder=""
                      className="w-full pr-9 pl-3 py-2 text-xs border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 bg-white text-left font-mono font-bold uppercase"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* 2. Full name in Arabic (Optional but lovely) */}
                <div>
                  <label className="block text-xs font-bold text-[#0f3d30] mb-1">
                    الاسم الكامل باللغة العربية:
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-amber-700">
                      <User className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      value={studentFullName}
                      onChange={(e) => setStudentFullName(e.target.value)}
                      placeholder=""
                      className="w-full pr-9 pl-3 py-2 text-xs border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 bg-white text-right font-bold"
                    />
                  </div>
                </div>
                
                {/* 4. Dept & Semester in a responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0f3d30] mb-1">
                      شعبتك / مسلكك الدراسي <span className="text-red-600 font-extrabold">*</span>
                    </label>
                    <select
                      value={studentDept}
                      onChange={(e) => setStudentDept(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 bg-white text-right font-semibold text-[#0f3d30]"
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#0f3d30] mb-1">
                      الفصل الحالي (Semestre) <span className="text-red-600 font-extrabold">*</span>
                    </label>
                    <select
                      value={studentSemester}
                      onChange={(e) => setStudentSemester(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 bg-white text-center font-mono font-bold text-[#0f3d30]"
                    >
                      {SEMESTERS.map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-bold text-[#0f3d30] mb-1.5 text-right flex items-center justify-between">
                  <span>البريد الإلكتروني الأكاديمي الجامعي:</span>
                  <span className="text-[10px] text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">UMI Mail</span>
                </label>
                <div className="flex rounded-lg shadow-sm border border-amber-300 focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-500 overflow-hidden bg-white">
                  <input
                    type="text"
                    required
                    value={emailPrefix}
                    onChange={(e) => setEmailPrefix(e.target.value)}
                    placeholder=""
                    className="flex-1 px-3 py-2 text-sm text-left outline-none text-gray-700"
                    dir="ltr"
                  />
                  <span className="bg-[#f2ebd4] px-3 py-2 text-xs md:text-sm text-[#0f3d30] font-bold border-r border-amber-200 flex items-center justify-center select-none" dir="ltr">
                    @edu.umi.ac.ma
                  </span>
                </div>
                <p className="text-[10px] text-right text-gray-500 mt-1">
                  * يرجى إدخال اسم المستخدم الأكاديمي المسجل لدى الكلية فقط.
                </p>
              </div>

              {/* DYNAMIC EXTRA FIELDS REMOVED TO PREVENT DUPLICATION */}

              <div>
                <label className="block text-xs md:text-sm font-bold text-[#0f3d30] mb-1.5 text-right flex items-center justify-between">
                  <span>كلمة المرور الخاصة بالمكتبة:</span>
                  <span className="text-[10px] text-[#aa7c11] font-semibold">🔑 رمز المرور السنوي</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-amber-600">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    className="w-full pr-10 pl-3 py-2 text-sm border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-500 outline-none bg-white text-right"
                  />
                </div>
              </div>

            <button
  type="submit"
  id="login-btn"
  className="w-full bg-gradient-to-r from-[#0f3d30] to-[#1e5d4a] hover:from-[#1e5d4a] hover:to-[#226e57] text-white font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-b-4 border-emerald-900 active:scale-[0.98] mt-6 text-sm md:text-base flex items-center justify-center gap-2 cursor-pointer"
>
  <span>🔑 ولـوج مـؤمّـن للمكتبة</span>
</button>

{/* زر نسيت كلمة السر؟ */}
<div className="text-left mt-2">
  <button
    type="button"
    onClick={handleResetPassword}
    className="text-emerald-700 hover:text-emerald-900 text-xs font-bold underline cursor-pointer bg-transparent border-none"
  >
    نسيت كلمة السر؟
  </button>
</div>

</form>
            {/* Quick Helper Credentials Guide */}
            <div className="mt-6 bg-[#f3edd9] rounded-xl p-4 border border-amber-300/40 text-xs text-right space-y-3.5 text-[#5c4015]">
              <div className="font-bold text-[#0f3d30] flex items-center gap-1.5 border-b border-amber-300/60 pb-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>إرشادات الولوج الأكاديمي السريع للطلبة:</span>
              </div>
              <p>📍 <strong>بريد الدخول:</strong> أي بريد ينتهي بـ <span className="font-mono bg-white/70 px-1 py-0.5 rounded">@edu.umi.ac.ma</span></p>
              <p>🔑 <strong>رمز مرور الطلبة العام:</strong> <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-[#0f3d30] font-bold">fpe2024</code></p>

              <div className="border-t border-amber-300/30 pt-2.5 mt-2.5 space-y-2">
                <p className="font-bold text-[#0f3d30] flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>لا تملك بريداً أكاديمياً خاصاً بك؟</span>
                </p>
                <p className="text-[11px] text-gray-700 leading-relaxed">
                  إذا لم يتوفر لديك حساب جامعي شخصي بعد، يمكنك تسجيل الدخول بالبريد الإلكتروني الموحد المخصص لمساعدة الطلبة أدناه مع رمز المرور أعلاه للولوج مباشرة للمكتبة:
                </p>
                <div className="flex items-center justify-between bg-white/80 px-2.5 py-2 rounded-lg border border-amber-200" dir="ltr">
                  <button
                    type="button"
                    onClick={() => setEmailPrefix("fpe.errachidia")}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[9px] px-2 py-1 rounded transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
                  >
                    💡 تعبئة الحساب
                  </button>
                  <span className="font-bold font-mono text-xs text-[#0f3d30] select-all truncate ml-2">
                    FPE.errachidia@edu.umi.ac.ma
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Subdued footer under login card */}
          <div className="mt-6 text-center text-xs text-gray-500 max-w-sm">
            <p>جميع الحقوق محفوظة © المكتبة الذكية للرشيدية 2026</p>
          </div>
        </div>
      ) : (

        // 2. MAIN APP DASHBOARD
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">

          {/* TOP DECORATIVE HEADER BAR WITH BASMALA & PRAYER */}
          <div className="border-b-2 border-amber-400/40 pb-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">

            {/* Brand Logo / Monogram */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="w-14 h-14 rounded-full overflow-hidden flex flex-col relative border-2 border-amber-400 shadow-md bg-white shrink-0">
                  <div className="w-full h-1/3 bg-[#0089CC]"></div>
                  <div className="w-full h-1/3 bg-[#009A44]"></div>
                  <div className="w-full h-1/3 bg-[#FFC300]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-[#E3001B] font-bold text-3xl leading-none mt-0.5"
                      style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.9), -1px -1px 0 rgba(255,255,255,0.9), 1px -1px 0 rgba(255,255,255,0.9), -1px 1px 0 rgba(255,255,255,0.9)' }}
                    >
                      ⵣ
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-600 block tracking-widest font-serif leading-none drop-shadow-md">ℒ-𝒪</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-[#0f3d30] text-lg">مكتبة الطلبة الذكية</div>
                <div className="text-[10px] text-[#aa7c11] tracking-wider uppercase font-semibold">Errachidia Student Library</div>
              </div>
            </div>

            {/* Islamic Traditional Blessing / Calligraphy Text (Amiri Font) */}
            <div className="text-center md:text-right font-['Amiri'] bg-[#fbf9f2] border-x border-[#bba14f] px-6 py-2 rounded-lg shadow-sm">
              <div className="text-[#0f3d30] font-bold text-sm md:text-base leading-relaxed">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ، الحَمْدُ للَّهِ الذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتِ.
              </div>
              <div className="text-[#aa7c11] text-xs md:text-sm mt-0.5">
                اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ تَسْلِيمًا.
              </div>
            </div>

            {/* Logout Button and Dynamic Session Badge */}
            <div className="flex items-center gap-3">
              <div className="text-left hidden sm:block">
                <span className="inline-flex items-center gap-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full soft-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>متصل بالبوابة</span>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-all duration-300 cursor-pointer shadow-sm hover:scale-105"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            </div>
          </div>

          {/* TWO-COLUMN LAYOUT: Side Desk & Books Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* COLUMN A: SIDEBAR DESK PANEL (1/4 Width) */}
            <div className="lg:col-span-1 space-y-6">
              {/* BEAUTIFUL VISITOR STUDENT CARD */}
              {!isAdmin && (
                <StudentVisitorCard
                  fullNameFr={studentFullNameFr || "ETUDIANT VISITEUR"}
                  fullNameAr={studentFullName || "طالب زائر"}
                  cin={studentCIN || "U000000"}
                  massar={studentMassar || "K000000000"}
                  dept={studentDept}
                  semester={studentSemester}
                />
              )}


              {/* NOOR LIBRARY SEARCH COMPONENT */}
              <div className="bg-[#fcfaf2] border border-amber-400/40 rounded-xl shadow-md p-4">
                <div className="flex items-center gap-2 text-[#0f3d30] font-bold text-sm mb-3">
                  <Search className="w-4 h-4 text-amber-600" />
                  <span>🔍 بحث خارجي (مكتبة نور)</span>
                </div>
                <p className="text-[11px] text-gray-600 mb-3 text-right">
                  هل تبحث عن مراجع خارجية؟ اكتب اسم الكتاب وابحث عنه مباشرة في أكبر مستودع عربي للكتب:
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={noorQuery}
                    onChange={(e) => setNoorQuery(e.target.value)}
                    placeholder="اكتب عنوان الكتاب هنا..."
                    className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                  />
                  <a
                    href={noorQuery.trim() ? `https://www.noor-book.com/books/search?query=${encodeURIComponent(noorQuery)}` : `https://www.noor-book.com/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-3 rounded-lg shadow transition-all duration-300 hover:scale-[1.02]"
                  >
                    <span>ابحث في مكتبة نور ↗️</span>
                  </a>
                </div>
              </div>

              {/* ADMINISTRATOR HUB PANEL (Visible if logged in as Admin) */}
              {isAdmin && (
                <div className="bg-emerald-50 border-2 border-emerald-600/40 rounded-xl shadow-md p-4 overflow-hidden relative">
                  {/* Subtle zellige icon indicator */}
                  <div className="absolute -top-3 -left-3 text-emerald-800/10 pointer-events-none">
                    <Settings className="w-16 h-16 rotate-12" />
                  </div>

                  <div className="flex items-center gap-2 text-[#0f3d30] font-bold text-sm mb-3">
                    <Settings className="w-4 h-4 text-emerald-600" />
                    <span>إدارة المكتبة (خاص بالمدير)</span>
                  </div>

                  <div className="bg-emerald-100 border border-emerald-300 rounded-lg p-2.5 mb-3 text-[11px] text-emerald-800 font-semibold space-y-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>المكتبة متصلة الآن بجداول Google Sheets.</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <a
                      href="https://ouo.io/epv4NA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 px-3 rounded-lg shadow transition-all duration-300"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>📝 فتح جدول البيانات للتعديل</span>
                    </a>

                    <button
                      onClick={fetchSheetsData}
                      disabled={refreshing}
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-white hover:bg-emerald-50 border border-emerald-600 text-emerald-700 text-xs font-bold py-2 px-3 rounded-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                      <span>{refreshing ? 'جاري التحديث...' : '🔄 تحديث المزامنة الفورية'}</span>
                    </button>
                  </div>
                </div>
              )}



            </div>

            {/* COLUMN B: MAIN CABINET / LIBRARY DISPLAY AREA (3/4 Width) */}
            <div className="lg:col-span-3 space-y-6">

              {/* MAJESTIC WELCOME ANNOUNCEMENT BANNER */}
              <div className="bg-gradient-to-br from-[#124c3a] via-[#0f3d30] to-[#0a2c22] border-[3px] border-[#bba14f] rounded-xl shadow-xl p-6 text-white relative overflow-hidden">

                {/* Content */}
                <div className="relative text-center space-y-5">
                  {/* Center the University Logo Prominently at the absolute top of the banner, on top of the Zellige background drawing */}
                  <div className="flex justify-center mb-1">
                    <CombinedUniversityLogo />
                  </div>

                  <div className="text-right space-y-4 pt-4 border-t border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                      <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-[#0f3d30] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                        ✨ الإصدار الأكاديمي الرقمي المطور
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-extrabold font-['Amiri'] text-amber-300 leading-tight flex flex-col md:flex-row justify-between items-center w-full gap-3">
                      <span>مرحبا بطلبة الرشيدية</span>
                      <span className="font-['Times_New_Roman',_Times,_serif] font-bold tracking-wide text-lg md:text-2xl text-amber-100/95" dir="ltr">Azul imhdar n imteɣren</span>
                    </h2>

                    <p className="text-xs md:text-base text-gray-100 leading-relaxed max-w-3xl">
                      بوابة معرفية مفتوحة مجاناً للجميع، تضم أرشيفاً واسعاً من المواد الأكاديمية والملخصات والمراجع والمصادر الإثرائية.
                      تم تصميم وتنظيم هذا المحتوى بدقة وعناية تامة لدعم طلاب الكلية متعددة التخصصات بالرشيدية (FPE Errachidia) في مسارهم العلمي والبحثي المتميز.
                    </p>

                    <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4 text-xs font-semibold text-amber-200">
                      <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-amber-500/20">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span>تحديث فوري شبه لحظي للبيانات</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-amber-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>سيرفرات تحميل آمنة وسريعة</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STUDENTS WITHOUT EMAIL LOG - SPECIAL SECTION FOR TECHNICAL COORDINATOR */}
              {isAdmin && (
                <div className="bg-[#fcfaf2] border-4 double border-amber-400 rounded-xl shadow-lg p-5 space-y-4 text-right animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-300/60 pb-2">
                    <div className="flex items-center gap-2 text-[#0f3d30]">
                      <GraduationCap className="w-5 h-5 text-amber-600 shrink-0" />
                      <h3 className="text-base md:text-lg font-bold font-['Amiri']">
                        👨‍🎓 سجل الطلبة بدون إيمايل (المسجلون بالحساب الموحد)
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mr-auto" dir="ltr">
                      <span className="bg-amber-100 text-[#0f3d30] text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-300">
                        {noEmailStudents.length} مسجلين
                      </span>
                      {noEmailStudents.length > 0 && (
                        <button
                          onClick={handleClearAllNoEmailStudents}
                          className="bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-md border border-red-200 transition-colors cursor-pointer"
                        >
                          🗑️ مسح السجل بالكامل
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    يعرض هذا القسم حصرياً للمنسق التقني قائمة الطلبة الذين لا يملكون بريداً أكاديمياً شخصياً وقاموا بالولوج باستخدام الحساب الموحد المشترك بعد إدخال هوياتهم الشخصية للتحقق والمتابعة الإدارية.
                  </p>

                  {/* Search Bar */}
                  {noEmailStudents.length > 0 && (
                    <div className="relative">
                      <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none">
                        <Search className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        value={noEmailSearch}
                        onChange={(e) => setNoEmailSearch(e.target.value)}
                        placeholder="البحث بالاسم الكامل، رقم البطاقة الوطنية (CIN)، أو رقم مسار..."
                        className="w-full pr-9 pl-3 py-2 text-xs border border-amber-300 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                      />
                    </div>
                  )}

                  {noEmailStudents.length === 0 ? (
                    <div className="text-center py-8 bg-amber-50/50 border border-dashed border-amber-300 rounded-xl text-gray-500 space-y-2">
                      <div className="text-3xl">🍃</div>
                      <p className="text-xs font-bold text-[#0f3d30]">لم يتم تسجيل أي طالب بدون إيمايل بعد.</p>
                      <p className="text-[11px] text-gray-400">أي طالب يدخل عبر الحساب المشترك مع تدوين معلوماته سيظهر هنا فوراً.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-amber-200 bg-white shadow-sm">
                      <table className="w-full text-right text-xs md:text-sm border-collapse" dir="rtl">
                        <thead>
                          <tr className="bg-[#0f3d30] text-white font-['Amiri']">
                            <th className="px-4 py-2.5 font-bold border-b border-amber-300 text-right">الاسم الكامل</th>
                            <th className="px-4 py-2.5 font-bold border-b border-amber-300 text-center">رقم البطاقة الوطنية (CIN)</th>
                            <th className="px-4 py-2.5 font-bold border-b border-amber-300 text-center">رقم مسار (Massar)</th>
                            <th className="px-4 py-2.5 font-bold border-b border-amber-300 text-center">تاريخ الدخول</th>
                            <th className="px-4 py-2.5 font-bold border-b border-amber-300 text-center w-12">إجراء</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-100">
                          {noEmailStudents
                            .filter(student => {
                            {noEmailStudents.length === 0 ? (
  <div className="text-center py-8 bg-amber-50/50 border border-dashed border-amber-300 rounded-xl text-gray-500 space-y-2">
    <div className="text-3xl">🍃</div>
    <p className="text-xs font-bold text-[#0f3d30]">لم يتم تسجيل أي طالب بدون إيمايل بعد.</p>
    <p className="text-[11px] text-gray-400">أي طالب يدخل عبر الحساب المشترك مع تدوين معلوماته سيظهر هنا فوراً.</p>
  </div>
) : (
  <div className="overflow-x-auto rounded-xl border border-amber-200 bg-white shadow-sm">
    <table className="w-full text-right text-xs md:text-sm border-collapse" dir="rtl">
      <thead>
        <tr className="bg-[#0f3d30] text-white font-['Amiri']">
          <th className="px-4 py-2.5 font-bold border-b border-amber-300 text-right">الاسم الكامل</th>
          <th className="px-4 py-2.5 font-bold border-b border-amber-300 text-center">تاريخ الدخول</th>
          <th className="px-4 py-2.5 font-bold border-b border-amber-300 text-center w-12">إجراء</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-amber-100">
        {noEmailStudents
          .filter(student => {
            const q = noEmailSearch.toLowerCase().trim();
            if (!q) return true;
            return student.fullName.toLowerCase().includes(q);
          })
          .map((student) => (
            <tr key={student.id} className="hover:bg-amber-50/40 transition-colors">
              <td className="px-4 py-3 font-bold text-[#0f3d30] text-right">{student.fullName}</td>
              <td className="px-4 py-3 text-center text-[11px] text-gray-500 font-mono" dir="ltr">{student.timestamp}</td>
              <td className="px-4 py-3 text-center">
                {/* هنا أزرار التحكم/الحذف إن وجدت */}
              </td>
            </tr>
            ))}
        </tbody>
      </table>
    </div>
  )}
                              
              {/* CUSTOM GEOMETRIC DEPARTMENT TABS / CARDS (Instead of select-box) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0f3d30] flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-amber-600" />
                    <span>تصفح وتنقّل حسب الشعب العلمية والأدبية:</span>
                  </h3>
                  <span className="text-xs text-gray-500 hidden sm:block">انقر لتحديد الشعبة</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DEPARTMENTS.map((dept) => {
                    const isSelected = selectedDept === dept;
                    const meta = DEPT_META[dept] || {
                      icon: <GraduationCap className="w-6 h-6" />,
                      subtitle: "موارد ومحاضرات الكلية",
                      gradient: "from-amber-500/10 to-amber-600/10"
                    };

                    return (
                      <button
                        key={dept}
                        onClick={() => setSelectedDept(dept)}
                        className={`text-right p-3 rounded-xl border transition-all duration-300 group cursor-pointer ${isSelected
                          ? 'bg-[#0f3d30] border-[#bba14f] text-white shadow-lg shadow-emerald-900/10 scale-[1.03]'
                          : 'bg-[#fcfaf2] hover:bg-[#f6f1df] border-amber-300/60 text-gray-700 hover:scale-[1.01]'
                          }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border ${isSelected
                            ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)] scale-110'
                            : 'bg-white border-amber-300/40 text-amber-800 shadow-sm group-hover:border-amber-400 group-hover:scale-105 group-hover:shadow-md'
                            }`}>
                            {meta.icon}
                          </div>
                          {isSelected && (
                            <span className="relative flex h-2 w-2 mt-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-xs md:text-sm leading-tight group-hover:text-amber-500 transition-colors">
                          {dept}
                        </div>
                        <div className={`text-[10px] truncate mt-1 ${isSelected ? 'text-emerald-200/80' : 'text-gray-400'
                          }`}>
                          {meta.subtitle}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status and Notifications banner on dynamic loading state */}
              {loading && (
                <div className="bg-[#f7f3e2] border-2 border-dashed border-amber-400 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    <BookOpen className="w-6 h-6 text-amber-600 absolute inset-0 m-auto" />
                  </div>
                  <div className="font-bold text-[#0f3d30] text-sm mt-2">جاري استيراد وتحديث خزانة الكتب الرقمية مباشرة...</div>
                  <p className="text-xs text-gray-500 max-w-md">نقوم الآن بالاتصال بخوادم Google Sheets الخاصة بالرشيدية لتلقي آخر الكتب والمناهج المضافة حديثاً.</p>
                </div>
              )}

              {sheetsError && !loading && (
                <div className="bg-amber-50 border-r-4 border-amber-500 text-amber-900 p-3 rounded-xl text-xs text-right leading-relaxed flex items-center justify-between">
                  <span>ℹ️ تم تنشيط النسخة المحلية الآمنة من الذاكرة لضمان العمل السريع للموقع بدون تأخير.</span>
                  {isAdmin && (
                    <button
                      onClick={fetchSheetsData}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-2 py-1 rounded"
                    >
                      إعادة المحاولة
                    </button>
                  )}
                </div>
              )}

              {/* SEMESTERS ACCORDION & DIGITAL BOOKSHELVES */}
              {!loading && (
                <div className="space-y-4">
                  <div className="border-b border-amber-400/30 pb-2 flex justify-between items-center">
                    <h3 className="text-base md:text-lg font-bold text-[#0f3d30]">
                      📚 الفصول الدراسية والمناهج المعتمدة لشعبة: <span className="text-amber-600 font-extrabold">{selectedDept}</span>
                    </h3>
                    <span className="text-xs text-gray-500">مجموع المقررات: {filteredBooks.length}</span>
                  </div>

                  {SEMESTERS.map((sem) => {
                    const isOpen = expandedSemesters[sem];
                    // Filter books for this specific semester
                    const semBooks = filteredBooks.filter(b => b['الفصل'] === sem);

                    return (
                      <div
                        key={sem}
                        className="bg-[#fcfaf2] border border-amber-300/50 rounded-xl shadow-sm overflow-hidden transition-all duration-300"
                      >
                        {/* Accordion Trigger (Semester Header) */}
                        <button
                          onClick={() => toggleSemester(sem)}
                          className={`w-full flex justify-between items-center p-4 text-right font-bold text-[#0f3d30] transition-colors cursor-pointer ${isOpen ? 'bg-[#f4ebd4]' : 'hover:bg-[#f6f1df]'
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#0f3d30] text-amber-300 flex items-center justify-center font-mono font-bold text-sm shadow-inner">
                              {sem}
                            </div>
                            <div>
                              <span className="text-sm md:text-base">الفصل الدراسي {sem === 'S1' ? 'الأول (S1)' : sem === 'S2' ? 'الثاني (S2)' : sem === 'S3' ? 'الثالث (S3)' : sem === 'S4' ? 'الرابع (S4)' : sem === 'S5' ? 'الخامس (S5)' : 'السادس (S6)'}</span>
                              <span className="text-[10px] text-amber-800 mr-2 bg-amber-100 px-1.5 py-0.5 rounded-full font-normal">
                                {semBooks.length} مواد متوفرة
                              </span>
                            </div>
                          </div>

                          <ChevronDown className={`w-5 h-5 text-amber-700 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Accordion Content (Simulated Wood Shelf Grid) */}
                        {isOpen && (
                          <div className="p-5 bg-gradient-to-b from-[#fbfaf6] to-[#f4ecd8] border-t border-amber-300/30">

                            {semBooks.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                {semBooks.map((book, bIdx) => {
                                  const hasLink = book['رابط التحميل'] && book['رابط التحميل'].trim() !== "";
                                  const coverBg = getBookGradient(bIdx);

                                  return (
                                    <div
                                      key={bIdx}
                                      className="flex flex-col items-center bg-white rounded-xl p-3 border border-amber-200/70 shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 group"
                                    >
                                      {/* Beautiful Simulated 3D Book Cover */}
                                      <div
                                        className="w-28 h-36 rounded-md shadow-md relative overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1 flex flex-col justify-between p-2 text-white border-r-4 border-black/20"
                                        style={{ background: coverBg }}
                                      >
                                        {/* Golden Arabic Geometric Ornament Overlay on Book Cover */}
                                        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:10px_10px]"></div>

                                        {/* Spine Shadow / Depth effect */}
                                        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/40 via-black/10 to-transparent"></div>

                                        {/* Top Card Label */}
                                        <div className="flex justify-between items-center text-[8px] tracking-widest font-bold text-amber-300">
                                          <span>FPE</span>
                                          <span>{sem}</span>
                                        </div>

                                        {/* Centered book title inside simulated calligraphed frame */}
                                        <div className="my-auto text-center px-1">
                                          <p className="font-['Amiri'] font-bold text-xs md:text-sm leading-tight line-clamp-3 drop-shadow-md">
                                            {book['اسم الكتاب']}
                                          </p>
                                        </div>

                                        {/* Dangling Bookmark Ribbon or bottom branding */}
                                        <div className="flex justify-between items-end">
                                          <span className="text-[7px] text-gray-300">UMI-R</span>
                                          {/* Decorative little golden ribbon tag */}
                                          <div className="w-2.5 h-6 bg-amber-400 absolute bottom-0 left-4 rounded-t-sm shadow-sm"></div>
                                        </div>
                                      </div>

                                      {/* Under-Cover Book Details */}
                                      <div className="w-full mt-3 text-center space-y-2">
                                        <h5 className="font-bold text-xs text-[#0f3d30] line-clamp-2 min-h-[2rem]">
                                          {book['اسم الكتاب']}
                                        </h5>

                                        <div className="pt-1">
                                          {hasLink ? (
                                            <a
                                              href={book['رابط التحميل']}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="w-full inline-flex items-center justify-center gap-1 bg-amber-600 hover:bg-[#0f3d30] text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-all duration-300 hover:scale-[1.03]"
                                            >
                                              <FileDown className="w-3.5 h-3.5" />
                                              <span>تحميل / عرض</span>
                                            </a>
                                          ) : (
                                            <span className="inline-block text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                                              ⏳ سيتم إضافته قريباً
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-gray-500 text-xs">
                                🍃 لا توجد مقررات مضافة في هذا الفصل حالياً لشعبة {selectedDept}.
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* STUNNING EXTRA REFERENCE AND RESOURCE LIBRARY PANEL ("شامل") */}
              {!loading && (
                <div className="bg-[#fdfcf7] border-2 double border-[#bba14f] rounded-xl shadow-lg p-6 space-y-4">
                  <div className="flex items-center gap-2 text-[#0f3d30] border-b border-amber-300/60 pb-3">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-bold font-['Amiri']">
                      ✨ مكتبة المراجع والمصادر الإثرائية الكبرى ✨
                    </h3>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed text-right">
                    هنا تجد المراجع الكبرى والأطروحات والدراسات المكملة للشعبة المختارة، والتي تغطي المعارف الموسوعية خارج إطار الحصص الرسمية:
                  </p>

                  {/* Filter comprehensive resources */}
                  {(() => {
                    const extraBooks = filteredBooks.filter(b => b['الفصل'] === "شامل");

                    if (extraBooks.length > 0) {
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {extraBooks.map((eb, idx) => {
                            const link = eb['رابط التحميل'];
                            const hasLink = link && link.trim() !== "";

                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-xl bg-[#faf6ea] border border-amber-200 hover:bg-[#f5eecb] transition-all duration-300"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-[#0f3d30] text-amber-300 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
                                    📁
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-xs md:text-sm text-[#0f3d30]">
                                      {eb['اسم الكتاب']}
                                    </div>
                                    <span className="text-[10px] text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-full">
                                      مرجع عام شامل
                                    </span>
                                  </div>
                                </div>

                                {hasLink ? (
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 bg-[#0f3d30] hover:bg-amber-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-all duration-300"
                                  >
                                    <span>تحميل</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    قريباً
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    } else {
                      return (
                        <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 text-center text-xs text-gray-500">
                          🍃 لا توجد مراجع إضافية مضافة بعد في شعبة {selectedDept}.
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
                              
          {/* BEAUTIFUL PROFESSIONAL FOOTER WITH EXPANDED METRICS AND AMAZIGH SYMBOL */}
          <div className="mt-12 border-t-2 border-amber-400/30 pt-8 text-center space-y-4">
            <div className="text-xs md:text-sm text-gray-600 font-medium flex flex-col gap-1.5 justify-center items-center">
              <span>للمزيد من المساعدة والشرح أو أي تساؤل تواصل معي مباشرة.</span>
              <span>ولا تتردد في الضغط على الاسم:</span>
            </div>

            <div>
              <a
                href="https://www.facebook.com/profile.php?id=100093495249631"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#1877f2] hover:bg-[#166fe5] hover:scale-105 text-white font-bold transition-all duration-300 shadow-md text-sm md:text-base"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>LAHCEN OUKHOUAOU</span>
              </a>
            </div>

            {/* Stylized Multicolored Amazigh symbol 'Yaz' (ⵣ) as requested */}
            <div className="flex flex-col items-center justify-center pt-4">
              <div className="text-4xl font-extrabold tracking-widest leading-none bg-gradient-to-r from-blue-600 via-green-500 to-yellow-500 bg-clip-text text-transparent select-none pb-2 animate-pulse">
                ⵣ
              </div>
              <p className="text-[10px] uppercase text-gray-500 tracking-widest">
                ANEMZI MIDELT - ERRACHIDIA - MOROCOO
              </p>
            </div>

           <div className="text-[10px] text-gray-400">
              جميع المقررات والملخصات تخضع لملكية أساتذة وطلبة الكلية متعددة التخصصات بالرشيدية.
            </div>
          </div >

        </div >
      )
      }

    </div >
  );
}
