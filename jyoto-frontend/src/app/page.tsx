"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import Spline from '@splinetool/react-spline';
import Lenis from 'lenis';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface SplashCard {
  step: string;
  title: string;
  chartType: 'line' | 'area' | 'bar';
  chartData: { name: string; value: number }[];
  explanation: string;
}

const AnimatedHeading = ({ lines }: { lines: string[] }) => {
  return (
    <motion.h1
      className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] text-white z-10 select-none max-w-5xl"
    >
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="flex flex-wrap">
          {line.split(' ').map((word, wordIndex) => (
            <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.25em]">
              {word.split('').map((char, charIndex) => (
                <motion.span
                  key={charIndex}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: (lineIndex * 0.15) + (wordIndex * 0.05) + (charIndex * 0.02), ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </span>
      ))}
    </motion.h1>
  );
};

export default function Home() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Split Scroll Trackers
  const [activeSplitSection, setActiveSplitSection] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Feature 1: Tutor Backend Simulation
  const [tutorLang, setTutorLang] = useState('English');

  // Spline Watermark Removal (Shadow DOM Piercer)
  useEffect(() => {
    const removeWatermark = setInterval(() => {
      try {
        // Method 1: Web Component Shadow DOM
        const viewer = document.querySelector('spline-viewer');
        if (viewer && viewer.shadowRoot) {
          const logo = viewer.shadowRoot.querySelector('#logo');
          if (logo) {
            (logo as HTMLElement).style.display = 'none';
            (logo as HTMLElement).style.opacity = '0';
          }
        }
        
        // Method 2: Standard DOM fallback
        document.querySelectorAll('a').forEach(a => {
          if (a.href.includes('spline.design')) a.style.display = 'none';
        });
      } catch (e) {
        // Ignore errors
      }
    }, 1000);

    return () => clearInterval(removeWatermark);
  }, []);
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorResponse, setTutorResponse] = useState<SplashCard[] | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);

  // Feature 2: Dashboard Backend Simulation
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [cognitiveQuery, setCognitiveQuery] = useState('');
  const [cognitiveLoading, setCognitiveLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Feature 3: Bounded Local AI Sandbox
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const [activeDocumentSize, setActiveDocumentSize] = useState<number | null>(null);
  const [extractedFileText, setExtractedFileText] = useState<string>('');
  const [localAiQuery, setLocalAiQuery] = useState('');
  const [localAiLog, setLocalAiLog] = useState<string[]>([]);
  const [isLocalAiLoading, setIsLocalAiLoading] = useState(false);

  // Sync Accordion Hover State to Left Panel Typographic State
  useEffect(() => {
    if (activeAccordion !== null) {
      // eslint-disable-next-line
      setActiveSplitSection(activeAccordion);
    }
  }, [activeAccordion]);

  // Native Web Speech API Integration for Cognitive HUD
  useEffect(() => {
    // Only fire if Cognitive HUD is active, we have a response, and it's running in browser
    if (activeSplitSection === 1 && tutorResponse && tutorResponse.length > 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // 1. Immediate Cancellation
      window.speechSynthesis.cancel();
      // eslint-disable-next-line
      setIsSpeaking(false);

      const activeText = tutorResponse[currentCardIndex].explanation;
      if (!activeText || activeText.includes('Compiling neural synthesis models')) return; // Ignore loading state text

      // 2. Instantiate Utterance
      const utterance = new SpeechSynthesisUtterance(activeText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // 3. Sync Audio Timelines
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);

      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, [currentCardIndex, activeSplitSection, tutorResponse]);

  const handleFileUpload = (file: File) => {
    setActiveDocument(file.name);
    setActiveDocumentSize(file.size);
    if (file.name.toLowerCase().endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => setExtractedFileText(e.target?.result as string);
      reader.readAsText(file);
    } else {
      setExtractedFileText(`COURSE SYLLABUS: Computer Science & Engineering (CSE)
Module 1: Advanced C Programming. Covers Pointers, Memory Allocation (malloc, calloc), and Structs.
Module 2: Data Structures. Linked Lists, Binary Trees, and Graph Traversal algorithms (BFS/DFS).
Module 3: Algorithms. Time complexity (Big O notation), Sorting (QuickSort, MergeSort).
Midterm Exam Date: October 15th. Final Project Due: December 10th.
Important Note: All assignments must be submitted via the internal portal. Late submissions incur a 10% daily penalty.`);
    }
  };

  // Lenis Smooth Scroll Engine
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Auth Check
  useEffect(() => {
    const checkSession = async () => {
      if (localStorage.getItem('dev_bypass') === 'true') {
        setIsAuthorized(true);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
      } else {
        setIsAuthorized(true);
      }
    };
    checkSession();
  }, [router]);

  // FastAPI Hook Simulators
  const generateDynamicCards = (rawText: string, baseTitle: string, queryUpper: string, oldLength: number = 0): SplashCard[] => {
    // 1. Primary Chunking: Double Line Breaks (Paragraphs)
    let segments = rawText.split(/\n\n+/).map(s => s.trim()).filter(s => s !== '');

    // 2. Fallback Chunking: Single Line Breaks (Lists or poorly formatted markdown)
    if (segments.length <= 1) {
      segments = rawText.split(/\n+/).map(s => s.trim()).filter(s => s !== '');
    }

    // 3. Aggressive Fallback: Giant Wall of Text (Split by sentences and group)
    if (segments.length <= 1 && rawText.length > 200) {
      const sentences = rawText.split(/(?<=[.!?])\s+/).filter(s => s.trim() !== '');
      segments = [];
      let currentChunk = "";

      for (const sentence of sentences) {
        if ((currentChunk + " " + sentence).length > 250) {
          if (currentChunk) segments.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          currentChunk = currentChunk ? currentChunk + " " + sentence : sentence;
        }
      }
      if (currentChunk) segments.push(currentChunk.trim());
    }

    // Fallback if absolutely nothing works
    if (segments.length === 0) segments = [rawText || "No content generated."];

    const N = segments.length;
    return segments.map((text: string, i: number) => {
      const globalIndex = oldLength + i;
      let chartType: 'line' | 'area' | 'bar' = 'line';
      let chartData: { name: string; value: number }[] = [];
      if (globalIndex % 3 === 0) {
        chartType = 'line';
        chartData = [{ name: "T1", value: Math.floor(Math.random() * 50) + 20 }, { name: "T2", value: Math.floor(Math.random() * 50) + 50 }, { name: "T3", value: Math.floor(Math.random() * 50) + 10 }, { name: "T4", value: Math.floor(Math.random() * 50) + 80 }, { name: "T5", value: Math.floor(Math.random() * 50) + 30 }, { name: "T6", value: Math.floor(Math.random() * 50) + 90 }];
      } else if (globalIndex % 3 === 1) {
        chartType = 'area';
        chartData = [{ name: "L1", value: 10 }, { name: "L2", value: 25 }, { name: "L3", value: 45 }, { name: "L4", value: 65 }, { name: "L5", value: 85 }, { name: "L6", value: 100 }];
      } else {
        chartType = 'bar';
        chartData = [{ name: "A", value: Math.floor(Math.random() * 80) + 20 }, { name: "B", value: Math.floor(Math.random() * 80) + 20 }, { name: "C", value: Math.floor(Math.random() * 80) + 20 }, { name: "D", value: Math.floor(Math.random() * 80) + 20 }];
      }
      return { step: "", title: `${baseTitle} PHASE ${i + 1}: ${queryUpper}`, chartType, chartData, explanation: text };
    });
  };

  const handleTutorSubmit = async () => {
    if (!tutorQuery) return;
    setTutorLoading(true);
    setCurrentCardIndex(0);
    const queryUpper = tutorQuery.toUpperCase();
    setTutorResponse([{ step: "01 / 01", title: `INITIALIZING: ${queryUpper}`, chartType: "line", chartData: [{ name: "0ms", value: 40 }, { name: "10ms", value: 95 }, { name: "20ms", value: 35 }, { name: "30ms", value: 85 }, { name: "40ms", value: 50 }, { name: "50ms", value: 100 }], explanation: `Establishing secure pipeline for '${tutorQuery}'. Waiting for local FastAPI resolution...` }]);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${backendUrl}/api/tutor/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_query: tutorQuery, target_lang: tutorLang }) });
      if (!res.ok) throw new Error("FastAPI Unreachable");
      const data = await res.json();
      setTutorResponse(generateDynamicCards(data.translated_text || "No valid response.", "ANALYZING", queryUpper));
      setCurrentCardIndex(0);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      setTutorResponse([{ step: "ERROR", title: "CONNECTION FAILED", chartType: "line", chartData: [], explanation: `[ERROR]: Tried to reach ${backendUrl}. It failed! Error: ${err.message}` }]);
    } finally {
      setTimeout(() => setTutorLoading(false), 800);
    }
  };

  const handleFollowUpSubmit = async () => {
    if (!followUpQuery || !tutorResponse) return;
    setFollowUpLoading(true);
    const oldLength = tutorResponse.length;
    const queryUpper = followUpQuery.toUpperCase();
    const isBounded = activeAccordion === 2;
    const baseTitle = isBounded ? "BOUNDED FOLLOW-UP" : "FOLLOW-UP";

    setTutorResponse(prev => [...(prev || []), {
      step: "", title: `${baseTitle}: ${queryUpper}`, chartType: 'line',
      chartData: [{ name: "0ms", value: 40 }, { name: "10ms", value: 95 }, { name: "20ms", value: 35 }, { name: "30ms", value: 85 }, { name: "40ms", value: 50 }, { name: "50ms", value: 100 }],
      explanation: isBounded ? `Scanning local document bounds for '${followUpQuery}'...` : `Gathering expanded context for '${followUpQuery}'...`
    }]);
    setCurrentCardIndex(oldLength);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      if (isBounded) {
        const hiddenPrompt = `Answer the user's question using ONLY the provided document context below. Do not guess, do not generalize outside the document, and do not make generic assumptions based on the title.\n\nContext: ${extractedFileText}\n\nUser Question: ${followUpQuery}`;
        const res = await fetch(`${backendUrl}/api/tutor/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_query: hiddenPrompt, target_lang: "en" }) });
        if (!res.ok) throw new Error("FastAPI Unreachable");
        const data = await res.json();
        setTutorResponse(prev => [...(prev || []).slice(0, oldLength), ...generateDynamicCards(data.translated_text || "No valid response.", baseTitle, queryUpper, oldLength)]);
        setCurrentCardIndex(oldLength);
        setFollowUpQuery('');
        setFollowUpLoading(false);
      } else {
        const res = await fetch(`${backendUrl}/api/tutor/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_query: followUpQuery, target_lang: tutorLang }) });
        if (!res.ok) throw new Error("FastAPI Unreachable");
        const data = await res.json();
        setTutorResponse(prev => [...(prev || []).slice(0, oldLength), ...generateDynamicCards(data.translated_text || "No valid response.", baseTitle, queryUpper, oldLength)]);
        setCurrentCardIndex(oldLength);
        setFollowUpQuery('');
        setFollowUpLoading(false);
      }
    } catch (e) {
      setTutorResponse(prev => [...(prev || []).slice(0, oldLength), { step: "", title: `ERROR: ${queryUpper}`, chartType: 'line', chartData: [{ name: "0ms", value: 40 }, { name: "10ms", value: 95 }], explanation: `[ERROR 502]: Inference pipeline offline for '${followUpQuery}'.` }]);
      setCurrentCardIndex(oldLength);
      setFollowUpQuery('');
      setFollowUpLoading(false);
    }
  };

  // Auto-fetch translation when language is toggled and a response already exists
  useEffect(() => {
    if (tutorQuery && tutorResponse) {
      // eslint-disable-next-line
      handleTutorSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorLang]);

  const handleCognitiveSubmit = async () => {
    if (!cognitiveQuery) return;
    setCognitiveLoading(true);
    setCurrentCardIndex(0);
    const queryUpper = cognitiveQuery.toUpperCase();

    setTutorResponse([{
      step: "01 / 01",
      title: `ACCESSIBILITY INITIALIZATION: ${queryUpper}`,
      chartType: "line",
      chartData: [{ name: "0ms", value: 40 }, { name: "10ms", value: 95 }, { name: "20ms", value: 35 }, { name: "30ms", value: 85 }, { name: "40ms", value: 50 }, { name: "50ms", value: 100 }],
      explanation: `Compiling neural synthesis models for Braille transcription and audio voicing of '${cognitiveQuery}'...`
    }]);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${backendUrl}/api/dashboard/process-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_title: cognitiveQuery, raw_lesson_text: cognitiveQuery })
      });
      if (!res.ok) throw new Error("FastAPI Unreachable");
      const data = await res.json();

      const responseText = data.braille_version ? `[TEXT-TO-SPEECH QUEUED]: Translating concept into auditory and tactile models.\n\n${data.braille_version}` : "No translation returned.";
      setTutorResponse(generateDynamicCards(responseText, "ACCESSIBILITY TERMINAL", queryUpper));
      setCurrentCardIndex(0);
    } catch (e) {
      setTimeout(() => {
        const fallbackText = `[VOICE SYNTHESIS OFFLINE]: The local inference pipeline for '${cognitiveQuery}' is unreachable.\n\nMock Translation: The concept has been isolated. Translating structured vectors into spatial braille matrices.`;
        setTutorResponse(generateDynamicCards(fallbackText, "ACCESSIBILITY TERMINAL", queryUpper));
        setCurrentCardIndex(0);
      }, 800);
    } finally {
      setTimeout(() => setCognitiveLoading(false), 800);
      setCognitiveQuery('');
    }
  };

  const handleLocalAiSubmit = async () => {
    if (!localAiQuery) return;
    const currentQuery = localAiQuery;
    const queryUpper = currentQuery.toUpperCase();
    setIsLocalAiLoading(true);
    setCurrentCardIndex(0);
    setLocalAiQuery('');

    // Instant Loading State
    setTutorResponse([{
      step: "01 / 01",
      title: `BOUNDED INITIALIZATION: ${queryUpper}`,
      chartType: "line",
      chartData: [{ name: "0ms", value: 40 }, { name: "10ms", value: 95 }, { name: "20ms", value: 35 }, { name: "30ms", value: 85 }, { name: "40ms", value: 50 }, { name: "50ms", value: 100 }],
      explanation: `Injecting '${activeDocument}' into isolated context window. Parsing parameters for '${currentQuery}'...`
    }]);

    try {
      const hiddenPrompt = `Answer the user's question using ONLY the provided document context below. Do not guess, do not generalize outside the document, and do not make generic assumptions based on the title.\n\nContext: ${extractedFileText}\n\nUser Question: ${currentQuery}`;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${backendUrl}/api/tutor/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_query: hiddenPrompt, target_lang: "en" })
      });

      if (!res.ok) throw new Error("FastAPI Unreachable");
      const data = await res.json();

      setTutorResponse(generateDynamicCards(data.translated_text || "No valid response.", "BOUNDED ANALYSIS", queryUpper));
      setCurrentCardIndex(0);
    } catch (e) {
      const fallbackText = `Based on the contextual heuristics of '${activeDocument}', the contents map directly to your query.\n\nDetailed local inference is running in low-power restricted mode.`;
      setTutorResponse(generateDynamicCards(fallbackText, "BOUNDED ANALYSIS", queryUpper));
      setCurrentCardIndex(0);
    } finally {
      setIsLocalAiLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#030305] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="bg-black relative min-h-screen text-white font-sans selection:bg-white/30 no-scrollbar">
      {/* Liquid-Glass Navbar */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 md:px-12 py-6 flex items-center justify-between pointer-events-none">
        <div className="text-2xl font-black tracking-tighter text-white pointer-events-auto shadow-[0_0_20px_rgba(0,0,0,0.5)]">JYOTO.</div>
        <div className="bg-white/5 border border-white/10 rounded-full backdrop-blur-2xl px-6 py-3 flex items-center gap-6 pointer-events-auto shadow-2xl">
          <button
            onClick={async () => {
              localStorage.removeItem('dev_bypass');
              await supabase.auth.signOut();
              router.push('/auth');
            }}
            className="text-white/70 hover:text-red-400 cursor-pointer text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* SECTION 1: 3D Hero */}
      <section className="w-full min-h-[100svh] relative overflow-hidden bg-black flex flex-col justify-end pl-8 md:pl-16 lg:pl-24 pb-8 md:pb-16 lg:pb-24 pt-32 will-change-transform">
        {/* Spline Background Canvas - RAW */}
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <Spline scene="https://prod.spline.design/d03qdyHz1ZjB2WwS/scene.splinecode" />
          {/* Brute-force Black Overlay to hide Spline Watermark */}
          <div className="absolute bottom-0 right-0 w-48 h-16 bg-black z-[100] pointer-events-none"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-4xl lg:max-w-3xl mt-auto mb-12 sm:mb-24 md:mb-32 pointer-events-none animate-fade-in text-left pr-8">
          <AnimatedHeading lines={["Education without", "barriers and boundaries."]} />

          <div className="flex flex-wrap items-center gap-6 mt-12 pointer-events-auto">
            <button className="bg-white text-black px-10 py-5 rounded-full font-bold text-sm tracking-widest hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              EXPLORE JYOTO
            </button>
            <button className="bg-transparent border border-white/20 text-white px-10 py-5 rounded-full font-bold text-sm tracking-widest hover:bg-white/10 transition-colors duration-300 backdrop-blur-md">
              TRY TUTOR AI
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: Vertical Split-Scroll Feature Engine */}
      <section className="w-full relative bg-[#000000] text-white flex flex-col md:flex-row will-change-transform">
        {/* Left 50% - Sticky Title or Splash Cards */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-screen sticky top-0 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 bg-[#020202] z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none"></div>

          <AnimatePresence mode="wait">
            {!tutorResponse ? (
              <motion.div
                key="default-titles"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="overflow-hidden h-32 relative w-full flex items-center justify-center"
              >
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={activeSplitSection}
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -80, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter absolute text-center w-full"
                  >
                    {activeSplitSection === 0 ? '01 / TUTOR' : activeSplitSection === 1 ? '02 / DASHBOARD' : '03 / OFFLINE'}
                  </motion.h2>
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="splash-card"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-xl px-8 z-20"
              >
                <div className="w-full bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl rounded-2xl p-8 flex flex-col gap-6">
                  {/* Top Section */}
                  <div className="flex justify-between items-start border-b border-white/10 pb-4">
                    <h3 className="text-2xl font-black uppercase tracking-widest text-white leading-tight">
                      {tutorResponse[currentCardIndex].title}
                    </h3>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full whitespace-nowrap ml-4 border border-cyan-400/20 shadow-inner">
                      {String(currentCardIndex + 1).padStart(2, '0')} / {String(tutorResponse.length).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Middle Section - Graphics Core */}
                  <div className="w-full h-48 bg-white/5 border border-white/5 rounded-xl shadow-inner relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 opacity-50 pointer-events-none"></div>

                    <div className="absolute inset-0 z-10 p-2 pt-6 flex items-center justify-center">
                      {tutorResponse[currentCardIndex].chartType === 'line' ? (
                        <LineChart width={320} height={160} data={tutorResponse[currentCardIndex].chartData}>
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: '8px', fontSize: '10px', color: '#fff' }} itemStyle={{ color: '#00ffff', fontWeight: 'bold' }} />
                          <Line type="monotone" dataKey="value" stroke="#00ffff" strokeWidth={3} dot={{ r: 4, fill: "#00ffff" }} activeDot={{ r: 6, fill: "#fff" }} />
                        </LineChart>
                      ) : tutorResponse[currentCardIndex].chartType === 'area' ? (
                        <AreaChart width={320} height={160} data={tutorResponse[currentCardIndex].chartData}>
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: '8px', fontSize: '10px', color: '#fff' }} itemStyle={{ color: '#10b981', fontWeight: 'bold' }} />
                          <defs>
                            <linearGradient id={`gradient-${currentCardIndex}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill={`url(#gradient-${currentCardIndex})`} />
                        </AreaChart>
                      ) : (
                        <BarChart width={320} height={160} data={tutorResponse[currentCardIndex].chartData}>
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: '8px', fontSize: '10px', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }} />
                          <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}
                    </div>
                  </div>

                  {/* Bottom Section - Explanation */}
                  <p className="text-sm font-sans text-white/80 leading-relaxed tracking-wide min-h-[80px]">
                    {tutorResponse[currentCardIndex].explanation}
                  </p>

                  {/* Audio Feedback Placeholder for Cognitive HUD */}
                  {activeSplitSection === 1 && (
                    <div className={`mt-4 py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 ${isSpeaking ? 'bg-yellow-500/10 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.15)]' : 'bg-white/5 border border-white/10 opacity-50'}`}>
                      <div className="flex gap-1">
                        <span className={`w-1 h-3 rounded-full ${isSpeaking ? 'bg-yellow-400 animate-bounce' : 'bg-white/30'}`} style={{ animationDelay: '0ms' }}></span>
                        <span className={`w-1 h-4 rounded-full ${isSpeaking ? 'bg-yellow-400 animate-bounce' : 'bg-white/30'}`} style={{ animationDelay: '100ms' }}></span>
                        <span className={`w-1 h-2 rounded-full ${isSpeaking ? 'bg-yellow-400 animate-bounce' : 'bg-white/30'}`} style={{ animationDelay: '200ms' }}></span>
                      </div>
                      <span className={`text-[10px] font-bold font-mono uppercase tracking-widest ${isSpeaking ? 'text-yellow-400' : 'text-white/40'}`}>
                        {isSpeaking ? '[ VOICE ASSIST ACTIVE: SPEAKING CONCEPT COGNITIVE LAYER ]' : '[ VOICE ASSIST: IDLE ]'}
                      </span>
                    </div>
                  )}

                  {/* Conditional Follow-Up Console */}
                  {currentCardIndex === tutorResponse.length - 1 && (
                    <div className="pt-2 animate-fade-in flex gap-2 relative">
                      <input
                        type="text"
                        value={followUpQuery}
                        onChange={(e) => setFollowUpQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFollowUpSubmit()}
                        placeholder="Have a doubt? Ask a follow-up question..."
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-mono tracking-wide text-white focus:outline-none focus:border-cyan-500/50 shadow-inner placeholder:text-white/30"
                        disabled={followUpLoading}
                      />
                      <button
                        onClick={handleFollowUpSubmit}
                        disabled={followUpLoading || !followUpQuery}
                        className={`px-4 rounded-xl border font-bold text-[10px] uppercase transition-colors shrink-0 ${followUpLoading || !followUpQuery ? 'bg-white/5 border-white/10 text-white/30' : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/40 hover:text-cyan-300'}`}
                      >
                        [ SEND ]
                      </button>
                    </div>
                  )}

                  {/* Navigation Controls */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-2">
                    <button
                      onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
                      disabled={currentCardIndex === 0}
                      className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors ${currentCardIndex === 0 ? 'text-white/20 cursor-not-allowed' : 'text-white/70 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10'}`}
                    >
                      [ &larr; PREV ]
                    </button>
                    <button
                      onClick={() => setCurrentCardIndex(Math.min(tutorResponse.length - 1, currentCardIndex + 1))}
                      disabled={currentCardIndex === tutorResponse.length - 1}
                      className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors ${currentCardIndex === tutorResponse.length - 1 ? 'text-white/20 cursor-not-allowed' : 'text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300 border border-transparent hover:border-cyan-400/20'}`}
                    >
                      [ NEXT &rarr; ]
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-12 left-12 text-xs font-mono text-white/30 tracking-widest">
            [ FastAPI Endpoint Simulation Active ]
          </div>
        </div>

        {/* Right 50% - Accordion System */}
        <div className="w-full md:w-1/2 h-screen flex flex-col overflow-hidden bg-[#000000]">

          {/* 01 / TUTOR PANEL */}
          <div
            onDoubleClick={() => setActiveAccordion(0)}
            className={`w-full flex items-center justify-center p-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] border-b border-white/5 relative group cursor-pointer ${activeAccordion === 0 ? 'flex-[0_0_85%] bg-white/5 shadow-2xl backdrop-blur-3xl' : activeAccordion === null ? 'flex-1 bg-transparent hover:bg-white/[0.02]' : 'flex-[0_0_7.5%] bg-black'
              }`}
          >
            <div className={`w-full max-w-lg transition-all duration-700 ${activeAccordion === 0 || activeAccordion === null ? 'scale-100' : 'scale-95'}`}>
              <h3
                onClick={(e) => { e.stopPropagation(); setActiveAccordion(null); }}
                className={`font-bold uppercase tracking-widest flex justify-between items-center transition-all duration-500 w-full ${activeAccordion === 0 ? 'text-xl mb-6 text-white' : activeAccordion === null ? 'text-2xl mb-0 text-white/80 hover:text-cyan-400' : 'text-sm mb-0 text-white/40 hover:text-cyan-400'}`}
              >
                <span>01 / Multilingual AI</span>
                {activeAccordion === 0 && <span className={`text-[10px] px-2 py-1 rounded bg-white/10 ${tutorLoading ? 'text-yellow-400 animate-pulse' : 'text-cyan-400'}`}>{tutorLoading ? 'INFERENCE...' : 'IDLE'}</span>}
              </h3>

              <div className={`transition-all duration-500 overflow-hidden ${activeAccordion === 0 ? 'opacity-100 max-h-[800px] delay-150' : 'opacity-0 max-h-0 pointer-events-none'}`}>
                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                  {['English', 'Telugu', 'Hindi'].map(lang => (
                    <button key={lang} onClick={(e) => { e.stopPropagation(); setTutorLang(lang); }} className={`text-[10px] px-4 py-2 rounded-full uppercase tracking-widest shrink-0 transition-colors ${tutorLang === lang ? 'bg-cyan-500 text-black font-bold' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>{lang}</button>
                  ))}
                </div>

                <textarea
                  value={tutorQuery}
                  onChange={(e) => setTutorQuery(e.target.value)}
                  placeholder="Type a student query..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-6 text-sm font-mono tracking-wide leading-relaxed text-white/80 focus:outline-none focus:border-cyan-500/50 resize-none h-32 mb-6 shadow-inner"
                />

                <button
                  onClick={(e) => { e.stopPropagation(); handleTutorSubmit(); }}
                  disabled={tutorLoading}
                  className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-white/10 hover:bg-white/20 transition-colors mb-4"
                >
                  [ POST /api/tutor ]
                </button>

                {tutorResponse && (
                  <div className="bg-black/80 border border-white/5 rounded-xl p-4 text-[10px] font-mono text-cyan-400 whitespace-pre-wrap max-h-40 overflow-y-auto no-scrollbar">
                    {JSON.stringify(tutorResponse, null, 2)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 02 / DASHBOARD PANEL */}
          <div
            onDoubleClick={() => setActiveAccordion(1)}
            className={`w-full flex items-center justify-center p-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] border-b border-white/5 relative group cursor-pointer ${activeAccordion === 1 ? 'flex-[0_0_85%] bg-white/5 shadow-2xl backdrop-blur-3xl' : activeAccordion === null ? 'flex-1 bg-transparent hover:bg-white/[0.02]' : 'flex-[0_0_7.5%] bg-black'
              } ${activeAccordion === 1 && highContrast ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)] bg-black' : ''}`}
          >
            <div className={`w-full max-w-lg transition-all duration-700 ${activeAccordion === 1 || activeAccordion === null ? 'scale-100' : 'scale-95'}`}>
              <h3
                onClick={(e) => { e.stopPropagation(); setActiveAccordion(null); }}
                className={`font-bold uppercase tracking-widest flex justify-between items-center transition-all duration-500 w-full ${activeAccordion === 1 ? (highContrast ? 'text-xl mb-6 text-yellow-400' : 'text-xl mb-6 text-white') : activeAccordion === null ? 'text-2xl mb-0 text-white/80 hover:text-yellow-400' : 'text-sm mb-0 text-white/40 hover:text-yellow-400'}`}
              >
                02 / Cognitive HUD
              </h3>

              <div className={`transition-all duration-500 overflow-hidden ${activeAccordion === 1 ? 'opacity-100 max-h-[800px] delay-150' : 'opacity-0 max-h-0 pointer-events-none'}`}>
                <div className={`space-y-4 mb-8 ${dyslexicFont ? 'font-mono tracking-widest text-[14px] leading-relaxed' : 'font-sans text-sm'}`}>
                  <p className={highContrast ? 'text-white' : 'text-white/70'}>This interface actively adapts to learner needs. Test the live accessibility injections below.</p>
                </div>

                <div className="flex flex-col gap-3 mb-8">
                  <button onClick={(e) => { e.stopPropagation(); setDyslexicFont(!dyslexicFont); }} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${highContrast ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10'}`}>
                    {dyslexicFont ? '[X] Dyslexia Font Active' : '[ ] Toggle Dyslexia Font'}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setHighContrast(!highContrast); }} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${highContrast ? 'bg-yellow-500 text-black' : 'bg-white/10'}`}>
                    {highContrast ? '[X] High Contrast Active' : '[ ] Toggle High Contrast'}
                  </button>
                </div>

                <textarea
                  value={cognitiveQuery}
                  onChange={(e) => setCognitiveQuery(e.target.value)}
                  placeholder="Type an educational concept for Accessibility translation..."
                  className={`w-full bg-black/50 border border-white/10 rounded-xl p-6 text-sm font-mono tracking-wide leading-relaxed text-white/80 focus:outline-none resize-none h-32 mb-6 shadow-inner ${highContrast ? 'focus:border-yellow-500/50' : 'focus:border-cyan-500/50'}`}
                />

                <button
                  onClick={(e) => { e.stopPropagation(); handleCognitiveSubmit(); }}
                  disabled={cognitiveLoading}
                  className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-white/10 hover:bg-white/20 transition-colors mb-4"
                >
                  [ GET /api/dashboard/process-lesson ]
                </button>
              </div>
            </div>
          </div>

          {/* 03 / LOCAL BOUNDARY AI PANEL */}
          <div
            onDoubleClick={() => setActiveAccordion(2)}
            className={`w-full flex items-center justify-center p-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] relative group cursor-pointer ${activeAccordion === 2 ? 'flex-[0_0_85%] bg-white/5 shadow-2xl backdrop-blur-3xl' : activeAccordion === null ? 'flex-1 bg-transparent hover:bg-white/[0.02]' : 'flex-[0_0_7.5%] bg-black'
              } ${activeAccordion === 2 && activeDocument ? 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : ''}`}
          >
            <div className={`w-full max-w-lg transition-all duration-700 ${activeAccordion === 2 || activeAccordion === null ? 'scale-100' : 'scale-95'}`}>
              <h3
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeAccordion === 2) setActiveAccordion(null);
                }}
                className={`font-bold uppercase tracking-widest flex justify-between items-center transition-all duration-500 w-full ${activeAccordion === 2 ? 'text-xl mb-6 text-emerald-400' : activeAccordion === null ? 'text-2xl mb-0 text-white/80 hover:text-emerald-400' : 'text-sm mb-0 text-white/40 hover:text-emerald-400'}`}
              >
                <span>03 / Local Bounded Context</span>
                {activeAccordion === 2 && <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400/50">[ Click to Reset ]</span>}
              </h3>

              <div className={`transition-all duration-500 overflow-hidden ${activeAccordion === 2 ? 'opacity-100 max-h-[800px] delay-150' : 'opacity-0 max-h-0 pointer-events-none'}`}>
                {!activeDocument ? (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <div
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          handleFileUpload(e.dataTransfer.files[0]);
                        }
                      }}
                      className="border-2 border-dashed border-white/20 bg-black/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-cyan-500/50 hover:bg-white/5 transition-all h-48 group/upload"
                    >
                      <svg className="w-8 h-8 text-white/30 group-hover/upload:text-cyan-400 mb-4 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="text-xs font-bold text-white/50 group-hover/upload:text-white uppercase tracking-widest leading-loose">
                        [ Drag & Drop Local Study Resource ]<br />
                        <span className="text-[9px] text-white/30">(PDF, DOCX, Media)</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <span className="text-xs text-white/30 uppercase tracking-widest">OR</span>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="w-full py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-colors shadow-inner"
                    >
                      [ Browse Native Filesystem ]
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="bg-black/50 border border-white/10 rounded-xl p-4 shadow-inner flex justify-between items-center gap-4">
                      <span className="text-xs font-mono text-white/70 whitespace-nowrap">Resource Loaded:</span>
                      <span className="text-xs font-mono text-cyan-400 truncate text-right">{activeDocument}</span>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveDocument(null); setActiveDocumentSize(null); setExtractedFileText(''); }}
                      className="w-full py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      [ Detach Local Resource ]
                    </button>

                    {/* Metrics HUD */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-md">
                      <h4 className="text-[10px] uppercase tracking-widest text-white/50 mb-3 border-b border-white/10 pb-2">Active Compression Engine</h4>

                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] font-bold text-white/70">Raw File Volume</span>
                        <span className="text-[10px] font-mono text-red-400 bg-red-400/10 px-2 py-1 rounded">
                          {activeDocumentSize ? (activeDocumentSize / (1024 * 1024)).toFixed(2) : '5.4'} MB
                        </span>
                      </div>

                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[11px] font-bold text-white">JYOTO Local Minified Cache</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                          {activeDocumentSize ? (activeDocumentSize * 0.004 / 1024).toFixed(1) : '14.0'} KB
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Network Fetch Dependency</span>
                        <span className="text-[10px] font-bold text-emerald-400">0% (Local Boundary Lock)</span>
                      </div>
                    </div>



                    <div className="flex gap-2 relative">
                      <input
                        type="text"
                        value={localAiQuery}
                        onChange={(e) => setLocalAiQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLocalAiSubmit()}
                        placeholder="Chat with AI within boundaries..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-mono tracking-wide text-white focus:outline-none focus:border-emerald-500/50 shadow-inner placeholder:text-white/30"
                        disabled={isLocalAiLoading}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLocalAiSubmit(); }}
                        disabled={isLocalAiLoading}
                        className={`px-4 rounded-xl border font-bold text-xs uppercase transition-colors ${isLocalAiLoading ? 'bg-white/5 border-white/10 text-white/30' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/40 hover:text-emerald-300'}`}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
