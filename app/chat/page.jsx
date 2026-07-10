'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Fraunces, Inter } from 'next/font/google';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-fraunces' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter' });

const INK = '#0B2B24';
const BRASS = '#C08829';
const BRASS_SOFT = '#DDB169';
const CREAM = '#FBF9F4';
const EMERALD = '#1F6B4F';

// Komponen kustom buat render link markdown jadi tombol brass,
// biar link "Daftar Sekarang" / "Download Mobile JKN" dari AI kelihatan jelas & bisa diklik.
function MarkdownLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 mt-1 mb-1 bg-gradient-to-b from-[#DDB169] to-[#C08829] hover:from-[#e6bd7c] hover:to-[#ca9235] text-[#0B2B24] font-[var(--font-fraunces)] font-bold px-4 py-2 rounded-full text-sm no-underline shadow-[0_6px_16px_rgba(192,136,41,0.3)] transition"
    >
      {children} →
    </a>
  );
}

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
    <div className={`${fraunces.variable} ${inter.variable} font-[var(--font-inter)] flex h-[100dvh] bg-[${CREAM}] text-[#0B2B24] overflow-hidden relative`} style={{ backgroundColor: CREAM }}>
      {}
      <aside className="w-80 bg-[#0B2B24] p-6 flex flex-col justify-between hidden md:flex shadow-xl text-white z-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-md overflow-hidden flex-shrink-0">
              <Image src="/logo-rs.jpeg" alt="Logo RSUD Pasirian" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <h2 className="font-[var(--font-fraunces)] font-semibold text-sm leading-tight text-white tracking-tight">RSUD Pasirian</h2>
              <p className="text-[11px] text-[#DDB169] font-semibold tracking-[0.14em] uppercase">Virtual Assistant</p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#DDB169]/80">Layanan Informasi</p>
            <div className="flex flex-col gap-2.5 pt-1">
              {topics.map((topic) => (
                <button
                  key={topic.label}
                  type="button"
                  onClick={() => handleTopicClick(topic.text, topic.loading)}
                  className="text-left text-[13px] bg-white/[0.04] hover:bg-white/[0.08] hover:border-[#DDB169]/40 p-3.5 rounded-xl border border-white/10 transition text-white/85 font-medium"
                >
                  <span className="mr-1.5">{topic.icon}</span>{topic.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white/[0.04] p-3 rounded-xl flex items-center gap-2 border border-white/10">
          <span className="w-2 h-2 bg-[#DDB169] rounded-full animate-pulse"></span>
          <span className="text-[12.5px] font-medium text-white/75">Sistem AI Aktif</span>
        </div>
      </aside>

      {}
      <main className="flex-1 flex flex-col bg-[#FBF9F4] overflow-hidden w-full relative min-h-0">
        <header className="px-4 py-3 md:px-6 md:py-4 bg-white/95 backdrop-blur-md border-b border-[#C08829]/15 flex items-center justify-between shadow-[0_1px_0_rgba(11,43,36,0.04)] z-10 gap-2 flex-shrink-0">
          <h1 className="font-[var(--font-fraunces)] font-semibold text-sm md:text-base tracking-tight text-[#0B2B24] truncate">
            Pasirian Smart Assistant
          </h1>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-gradient-to-b from-[#DDB169] to-[#C08829] hover:from-[#e6bd7c] hover:to-[#ca9235] text-[#0B2B24] text-xs md:text-sm font-[var(--font-fraunces)] font-bold px-3.5 py-1.5 md:px-4 md:py-2 rounded-full transition shadow-[0_8px_20px_rgba(192,136,41,0.3)] shrink-0"
          >
            ← <span className="hidden sm:inline">Kembali ke </span>Beranda
          </Link>
        </header>

        <div className="flex-1 min-h-0 p-3 md:p-6 overflow-y-auto bg-[#FBF9F4] bg-[radial-gradient(#0B2B24_0.5px,transparent_0.5px)] [background-size:18px_18px] [background-opacity:0.05]">
          <div className="space-y-4 max-w-full lg:max-w-6xl mx-auto w-full px-2 md:px-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-0.5 shadow-md overflow-hidden flex-shrink-0 border border-[#0B2B24]/[0.08]">
                    <Image src="/logo-rs.jpeg" alt="Logo RSUD Pasirian" width={36} height={36} className="object-contain" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-[0_10px_28px_rgba(11,43,36,0.08)] max-w-[85%] md:max-w-[80%] border ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-b from-[#DDB169] to-[#C08829] text-[#0B2B24] border-[#C08829]/40 rounded-tr-none'
                      : 'bg-white text-[#0B2B24] border-[#0B2B24]/[0.06] rounded-tl-none'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="text-sm md:text-base leading-relaxed space-y-2 text-[#0B2B24] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:pl-1">
                      <ReactMarkdown
                        remarkPlugins={[remarkBreaks]}
                        components={{ a: MarkdownLink }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-line break-words font-medium">{msg.content}</span>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-0.5 shadow-md overflow-hidden flex-shrink-0 border border-[#0B2B24]/[0.08]">
                  <Image src="/logo-rs.jpeg" alt="Logo RSUD Pasirian" width={36} height={36} className="object-contain" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none text-sm text-[#0B2B24]/55 italic flex items-center gap-2 shadow-[0_10px_28px_rgba(11,43,36,0.08)] border border-[#0B2B24]/[0.06]">
                  {loadingText}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 md:hidden px-3 pt-2 bg-[#FBF9F4] overflow-x-auto">
          <div className="flex gap-2 pb-2 w-max">
            {topics.map((topic) => (
              <button
                key={topic.label}
                type="button"
                onClick={() => handleTopicClick(topic.text, topic.loading)}
                className="flex-shrink-0 flex items-center gap-1.5 bg-white border border-[#0B2B24]/[0.1] text-[#0B2B24] text-sm font-medium px-3.5 py-2.5 rounded-full shadow-sm"
              >
                <span>{topic.icon}</span> <span>{topic.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="flex-shrink-0 p-3 md:p-4 bg-white border-t border-[#C08829]/15 flex gap-2 md:gap-3 items-end shadow-[0_-4px_20px_rgba(11,43,36,0.05)] z-10">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            placeholder={isLoading ? 'Mohon tunggu...' : 'Tulis pertanyaanmu di sini...'}
            className="flex-1 bg-[#FBF9F4] border border-[#0B2B24]/[0.12] rounded-xl px-4 py-3 text-sm text-[#0B2B24] focus:outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/15 transition resize-none max-h-[120px]"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-b from-[#DDB169] to-[#C08829] hover:from-[#e6bd7c] hover:to-[#ca9235] disabled:opacity-60 text-[#0B2B24] font-[var(--font-fraunces)] font-bold px-4 md:px-6 py-3 rounded-xl text-sm transition shadow-[0_8px_20px_rgba(192,136,41,0.3)] shrink-0"
          >
            {isLoading ? '...' : 'Kirim'}
          </button>
        </form>
      </main>
    </div>
  );
}
