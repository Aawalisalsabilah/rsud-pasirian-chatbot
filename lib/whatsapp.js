// =====================================================================
//  NOTIFIKASI WHATSAPP (B10)
// =====================================================================
//  Mode dipilih otomatis:
//   - WA_FONNTE_TOKEN ada di .env  -> kirim sungguhan lewat Fonnte (https://fonnte.com)
//   - tidak ada                    -> SIMULASI: pesan tidak dikirim, tapi tetap dicatat
//                                    di tabel tiket_notifikasi_wa (boleh menurut PDF B10:
//                                    "jika API resmi belum tersedia, pengujian menggunakan
//                                    simulasi terdokumentasi")
//
//  Semua hasil (terkirim / gagal / simulasi) dicatat ke database, dan riwayat tiket
//  ikut bertambah otomatis lewat trigger.
// =====================================================================
import { supabase } from './supabase-server';

export function buatPesanSelesai({ nama, nomorTiket, ringkasan, linkRating }) {
  return [
    `Halo${nama ? ` ${nama}` : ''},`,
    '',
    `Tiket ${nomorTiket} Anda di RSUD Pasirian Lumajang telah selesai ditindaklanjuti.`,
    '',
    ringkasan,
    '',
    `Mohon bantu kami dengan memberi penilaian (1 menit): ${linkRating}`,
    '',
    'Terima kasih.',
    'RSUD Pasirian Lumajang',
  ].join('\n');
}

async function kirimLewatFonnte(noWa, pesan) {
  const body = new URLSearchParams({ target: noWa, message: pesan, countryCode: '62' });
  const res = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: { Authorization: process.env.WA_FONNTE_TOKEN },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.status === false) {
    throw new Error(json.reason || json.detail || `Fonnte HTTP ${res.status}`);
  }
}

/**
 * Kirim notifikasi tiket selesai. Tidak pernah melempar error:
 * kegagalan WA tidak boleh membatalkan penyelesaian tiket.
 * @returns {'terkirim'|'gagal'|'simulasi'}
 */
export async function kirimNotifikasiSelesai({ tiketId, noWa, nama, nomorTiket, ringkasan, linkRating }) {
  const pesan = buatPesanSelesai({ nama, nomorTiket, ringkasan, linkRating });
  let status = 'simulasi';
  let galat = null;

  if (process.env.WA_FONNTE_TOKEN) {
    try {
      await kirimLewatFonnte(noWa, pesan);
      status = 'terkirim';
    } catch (e) {
      status = 'gagal';
      galat = String(e.message || e).slice(0, 500);
      console.error('[WA GAGAL]', nomorTiket, galat);
    }
  } else {
    console.log(`[WA SIMULASI] ke ${noWa}:\n${pesan}`);
  }

  const { error } = await supabase
    .from('tiket_notifikasi_wa')
    .insert({ tiket_id: tiketId, status, pesan, error: galat });
  if (error) console.error('[WA LOG ERROR]', error.message);

  return status;
}
