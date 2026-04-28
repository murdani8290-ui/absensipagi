// ============================================================
// GANTI SELURUH BLOK "FONNTE CONFIG" DI HTML SIPAGI
// Dari baris: const FONNTE_TOKEN = ...
// Sampai akhir fungsi: cekKoneksiFonnte() { ... }
// ============================================================

const FONNTE_TOKEN = 'JpheArK4npgMrgZN8d5v'; // tetap ada, dipakai sebagai referensi

// URL Edge Function Supabase kamu — SESUAIKAN project ref-nya
// Format: https://<PROJECT_REF>.supabase.co/functions/v1/fonnte-proxy
// PROJECT_REF = bagian awal dari SUPABASE_URL kamu: pgrcbuwaciukbpfxupjz
const FONNTE_PROXY_URL = 'https://pgrcbuwaciukbpfxupjz.supabase.co/functions/v1/fonnte-proxy';

// Kirim WA via Edge Function (server-side, tidak kena CORS)
async function kirimWA(target, pesan) {
  try {
    const res = await fetch(FONNTE_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        target: target,
        message: pesan,
        countryCode: '62'
      })
    });

    if (!res.ok) {
      console.error('❌ Proxy error, HTTP status:', res.status);
      return false;
    }

    const result = await res.json();
    if (result.ok && result.data) {
      console.log('✅ WA terkirim ke', target, result.data);
      return true;
    } else {
      console.error('❌ Fonnte error:', result);
      return false;
    }
  } catch (err) {
    console.error('❌ kirimWA error:', err);
    return false;
  }
}

// Cek koneksi Fonnte via Edge Function
async function cekKoneksiFonnte() {
  const statusEl = document.getElementById('statusFonnte');
  const btn = document.getElementById('btnCekFonnte');

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner animate-spin mr-1"></i>Mengecek...';
  statusEl.textContent = 'Menghubungi server Fonnte...';

  try {
    const res = await fetch(FONNTE_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'validate' })
    });

    if (!res.ok) {
      statusEl.innerHTML = `<span class="text-red-600">❌ Edge Function merespons dengan error HTTP ${res.status}. Pastikan sudah di-deploy.</span>`;
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-wifi mr-1"></i>Tes Koneksi';
      return;
    }

    const result = await res.json();
    const data = result.data || {};

    if (data.status === true || data.status === 'true') {
      statusEl.innerHTML = `<span class="text-green-600 font-semibold">✅ Terhubung!</span> Device: <b>${sanitizeHTML(data.name || 'WhatsApp')}</b> | No: ${sanitizeHTML(data.device || '-')}`;
    } else if (data.status === false || data.reason) {
      statusEl.innerHTML = `<span class="text-red-600">❌ Token tidak valid atau device offline.</span> ${data.reason ? '(' + sanitizeHTML(data.reason) + ')' : ''}`;
    } else {
      statusEl.innerHTML = `<span class="text-amber-600">⚠️ Edge Function terhubung, namun respons Fonnte tidak terduga. Token kemungkinan valid — coba kirim WA langsung.</span>`;
    }
  } catch (err) {
    statusEl.innerHTML = `
      <span class="text-red-600 font-semibold">❌ Tidak dapat menghubungi Edge Function.</span><br>
      <span class="text-xs text-gray-500">Error: ${sanitizeHTML(err.message)}</span><br>
      <span class="text-xs text-gray-600 mt-1 block">
        Pastikan Edge Function sudah di-deploy dan tidak ada typo pada FONNTE_PROXY_URL.
      </span>`;
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-wifi mr-1"></i>Tes Koneksi';
}

function formatHP(hp) {
  if (!hp) return null;
  let h = hp.toString().replace(/\D/g, '');
  if (!h) return null;
  if (h.startsWith('0')) h = '62' + h.slice(1);
  else if (h.startsWith('8')) h = '62' + h;
  if (!h.startsWith('62')) return null;
  if (h.length < 10 || h.length > 15) return null;
  return h;
}
