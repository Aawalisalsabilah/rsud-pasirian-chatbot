'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Selamat datang di Layanan Asisten Virtual RSUD Pasirian Lumajang. Dengan senang hati saya akan membantu Anda. Silakan sampaikan pertanyaan seputar jadwal dokter, standar pelayanan, atau prosedur pendaftaran yang ingin Anda ketahui.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Sedang menyusun jawaban...');
  const textareaRef = useRef(null);

  const topics = [
    { icon: '🩺', label: 'Jadwal Pelayanan Poli Klinik', shortLabel: 'Jadwal Poli Klinik', text: 'Poli apa saja yang tersedia di RSUD Pasirian? Tampilkan daftar poliklinik.', loading: 'Mencari jadwal poli klinik...' },
    { icon: '📋', label: 'Standar Pelayanan Publik', shortLabel: 'Standar Pelayanan Publik', text: 'Apa saja Standar Pelayanan Publik di RSUD Pasirian?', loading: 'Menyusun standar pelayanan publik...' },
    { icon: '📝', label: 'Panduan Pendaftaran JKN Mobile', shortLabel: 'Pendaftaran JKN Mobile', text: 'Bagaimana panduan pendaftaran melalui JKN Mobile?', loading: 'Mencari panduan pendaftaran...' },
  ];

  // FUNGSI UTAMA PENGIRIMAN PESAN
  const sendMessage = async (messageContent, label = 'Sedang menyusun jawaban...') => {
    if (!messageContent.trim() || isLoading) return;

    setLoadingText(label);
    const userMessage = { role: 'user', content: messageContent };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Mohon maaf, sistem sedang mengalami gangguan sesaat. Silakan coba kirim kembali pertanyaan Anda.' }]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Mohon maaf, koneksi ke server gagal. Silakan periksa kembali koneksi Anda.' }]);
    } finally {
      setIsLoading(false);
      setLoadingText('Sedang menyusun jawaban...');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleTopicClick = (text, label) => {
    sendMessage(text, label);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [isLoading]);

  return (
    <div className="flex h-[100dvh] bg-[#f4f7f6] text-slate-800 font-sans overflow-hidden relative">
      {/* SISI KIRI */}
      <aside className="w-80 bg-[#005c48] p-6 flex flex-col justify-between hidden md:flex shadow-xl text-white z-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#004737] pb-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-md overflow-hidden flex-shrink-0">
              <Image src="/logo-rs.jpeg" alt="Logo RSUD Pasirian" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight text-white">RSUD PASIRIAN</h2>
              <p className="text-[11px] text-amber-400 font-semibold tracking-wider uppercase">Virtual Assistant</p>
            </div>
          </div>
          <div className="space-y-3">
            <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">🔍 Layanan Informasi</p></div>
            <div className="flex flex-col gap-2 pt-1">
              {topics.map((topic) => (
                <button
                  key={topic.label}
                  type="button"
                  onClick={() => handleTopicClick(topic.text, topic.loading)}
                  className="text-left text-xs bg-[#004737] hover:bg-[#00382b] p-3 rounded-lg border border-emerald-800/50 transition text-emerald-50 font-medium shadow-sm"
                >
                  {topic.icon} {topic.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-[#004737] p-3 rounded-xl flex items-center gap-2 border border-emerald-800/40">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="text-xs font-medium text-emerald-100">Sistem AI Aktif</span>
        </div>
      </aside>

      {/* SISI KANAN */}
      <main className="flex-1 flex flex-col bg-[#f4f7f6] overflow-hidden w-full relative min-h-0">
        <header className="px-4 py-3 md:px-6 md:py-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10 gap-2 flex-shrink-0">
          <h1 className="font-bold text-sm md:text-base tracking-wide text-[#005c48] truncate">PASIRIAN SMART ASSISTANT</h1>
          <Link href="/" className="bg-amber-500 hover:bg-amber-600 text-white text-xs md:text-sm font-semibold px-3 py-1.5 md:px-4 md:py-2 rounded-full transition shadow-sm shrink-0">
            ← <span className="hidden sm:inline">Kembali ke </span>Beranda
          </Link>
        </header>

        <div className="flex-1 min-h-0 p-3 md:p-6 overflow-y-auto bg-[#f4f7f6] bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="space-y-4 max-w-full lg:max-w-6xl mx-auto w-full px-2 md:px-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-0.5 shadow-md overflow-hidden flex-shrink-0 border border-slate-200">
                    <Image src="/logo-rs.jpeg" alt="Logo RSUD Pasirian" width={36} height={36} className="object-contain" />
                  </div>
                )}
                <div className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-md max-w-[85%] md:max-w-[80%] border ${msg.role === 'user' ? 'bg-amber-500 text-white border-amber-600 rounded-tr-none' : 'bg-white text-slate-800 border-slate-200/80 rounded-tl-none'}`}>
                  {msg.role === 'assistant' ? (
                    <div className="text-sm md:text-base leading-relaxed space-y-2 text-slate-800 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:pl-1">
                      <ReactMarkdown remarkPlugins={[remarkBreaks]}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-line break-words">{msg.content}</span>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-0.5 shadow-md overflow-hidden flex-shrink-0 border border-slate-200">
                  <Image src="/logo-rs.jpeg" alt="Logo RSUD Pasirian" width={36} height={36} className="object-contain" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none text-sm text-slate-500 italic flex items-center gap-2 shadow-md border border-slate-200/80">
                  {loadingText}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 md:hidden px-3 pt-2 bg-[#f4f7f6] overflow-x-auto">
          <div className="flex gap-2 pb-2 w-max">
            {topics.map((topic) => (
              <button key={topic.label} type="button" onClick={() => handleTopicClick(topic.text, topic.loading)} className="flex-shrink-0 flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium px-3.5 py-2.5 rounded-full shadow-sm">
                <span>{topic.icon}</span> <span>{topic.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="flex-shrink-0 p-3 md:p-4 bg-white border-t border-slate-200 flex gap-2 md:gap-3 items-end shadow-lg z-10">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            placeholder={isLoading ? "Mohon tunggu..." : "Tulis pertanyaanmu di sini..."}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005c48] transition resize-none max-h-[120px]"
          />
          <button type="submit" disabled={isLoading} className="bg-[#005c48] hover:bg-[#004737] text-white font-bold px-4 md:px-6 py-3 rounded-xl text-sm transition shadow-md shrink-0">
            {isLoading ? '...' : 'KIRIM'}
          </button>
        </form>
      </main>
    </div>
  );
}