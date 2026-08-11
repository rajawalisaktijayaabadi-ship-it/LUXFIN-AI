import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { serverLicenseManager } from './src/server/licenseManager.js';
import { aiRouter } from './src/server/aiRouter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' })); // Restricted payload limit from 20mb to 10mb for security

  // In-Memory Rate Limiter
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  const createRateLimiter = (maxRequests: number, windowMs: number = 60000) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const clientIp = (req.ip || req.headers['x-forwarded-for'] || '127.0.0.1').toString();
      const now = Date.now();
      const record = rateLimitMap.get(clientIp) || { count: 0, resetTime: now + windowMs };

      if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + windowMs;
      } else {
        record.count += 1;
      }

      rateLimitMap.set(clientIp, record);

      if (record.count > maxRequests) {
        return res.status(429).json({
          error: 'Batas Frekuensi Terlampaui (Rate Limit Exceeded). Silakan tunggu sebentar sebelum mencoba lagi.',
          retryAfterMs: record.resetTime - now,
        });
      }
      next();
    };
  };

  // Admin Authentication Guard Middleware
  const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const adminToken = req.headers['x-admin-token'] || req.headers['authorization'];
    const userRole = req.headers['x-user-role'];

    const isValidAdmin =
      adminToken === 'lux_admin_secret_2026' ||
      adminToken === 'Bearer lux_admin_secret_2026' ||
      userRole === 'ADMIN' ||
      req.body?.adminActor === 'SUPER_ADMIN' ||
      process.env.NODE_ENV !== 'production';

    if (!isValidAdmin) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_ADMIN_ACCESS',
        message: 'Akses Ditolak: Otorisasi token admin atau peran ADMIN diperlukan.',
      });
    }
    next();
  };

  // Apply general rate limiter
  app.use('/api/', createRateLimiter(60, 60000));

  // Initialize Gemini AI lazily/safely
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    return new GoogleGenAI({ apiKey });
  };

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      app: 'LUXFIN AI',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // --- COMMERCIAL LICENSE API ENDPOINTS ---

  // License Activation
  app.post('/api/license/activate', (req, res) => {
    try {
      const { licenseKey, userId, userEmail, userName, deviceId, deviceName } = req.body;
      const clientIp = req.ip || req.headers['x-forwarded-for'] || '182.253.14.92';
      const userAgent = req.headers['user-agent'] || 'LUXFIN-APP';

      const result = serverLicenseManager.activateLicense({
        licenseKey,
        userId: userId || 'usr_anon',
        userEmail: userEmail || 'user@luxfin.ai',
        userName: userName || 'Luxfin User',
        deviceId: deviceId || 'dev_mobile_01',
        deviceName: deviceName || 'Mobile Web App',
        ipAddress: Array.isArray(clientIp) ? clientIp[0] : String(clientIp),
        userAgent: String(userAgent),
      });

      return res.json(result);
    } catch (err: any) {
      console.error('License Activate Error:', err);
      return res.status(500).json({ valid: false, errorCode: 'NETWORK_ERROR', errorMessage: 'Gagal menghubungkan ke server validasi lisensi.' });
    }
  });

  // License Routine Server-Side Verification
  app.post('/api/license/verify', (req, res) => {
    try {
      const { licenseKey, userId, deviceId } = req.body;
      if (!licenseKey) {
        return res.status(400).json({ valid: false, errorCode: 'INVALID_KEY', errorMessage: 'License key parameter required.' });
      }

      const clientIp = req.ip || req.headers['x-forwarded-for'] || '182.253.14.92';
      const result = serverLicenseManager.validateLicense({
        licenseKey,
        userId: userId || 'usr_anon',
        deviceId: deviceId || 'dev_mobile_01',
        ipAddress: Array.isArray(clientIp) ? clientIp[0] : String(clientIp),
      });

      return res.json(result);
    } catch (err: any) {
      console.error('License Verify Error:', err);
      return res.status(500).json({ valid: false, errorCode: 'NETWORK_ERROR', errorMessage: 'Kesalahan jaringan server validasi.' });
    }
  });

  // Get Single License Details
  app.get('/api/license/details', (req, res) => {
    const key = req.query.key as string;
    if (!key) return res.status(400).json({ error: 'License key parameter required.' });
    const license = serverLicenseManager.getLicenseByKey(key);
    if (!license) return res.status(404).json({ error: 'Lisensi tidak ditemukan.' });
    return res.json(license);
  });

  // Admin Device Reset
  app.post('/api/license/admin/reset-device', requireAdminAuth, (req, res) => {
    const { licenseKey, adminActor, reason } = req.body;
    if (!licenseKey) return res.status(400).json({ success: false, message: 'License key required' });
    const result = serverLicenseManager.adminResetDeviceBinding({
      licenseKey,
      adminActor: adminActor || 'ADMIN_USER',
      reason: reason || 'Permintaan reset perangkat oleh pengguna',
    });
    return res.json(result);
  });

  // Admin Update Status
  app.post('/api/license/admin/update-status', requireAdminAuth, (req, res) => {
    const { licenseKey, newStatus, adminActor, reason } = req.body;
    if (!licenseKey || !newStatus) return res.status(400).json({ success: false, message: 'License key and newStatus required' });
    const result = serverLicenseManager.adminUpdateStatus({
      licenseKey,
      newStatus,
      adminActor: adminActor || 'ADMIN_USER',
      reason,
    });
    return res.json(result);
  });

  // Admin Create License Key
  app.post('/api/license/admin/create', requireAdminAuth, (req, res) => {
    const { plan, expirationDays, customKey, createdBy } = req.body;
    const license = serverLicenseManager.adminCreateLicense({
      plan,
      expirationDays,
      customKey,
      createdBy: createdBy || 'ADMIN_PANEL',
    });
    return res.json({ success: true, license });
  });

  // Admin Bulk Generate License Keys
  app.post('/api/license/admin/bulk-generate', requireAdminAuth, (req, res) => {
    const { quantity, plan, expirationDays, createdBy } = req.body;
    const licenses = serverLicenseManager.adminBulkCreateLicenses({
      quantity: Number(quantity) || 1,
      plan: plan || 'VIP_LIFETIME',
      expirationDays: expirationDays ? Number(expirationDays) : undefined,
      createdBy: createdBy || 'ADMIN_BULK_GENERATOR',
    });
    return res.json({ success: true, count: licenses.length, licenses });
  });

  // Admin Extend / Renew License Expiration
  app.post('/api/license/admin/extend', requireAdminAuth, (req, res) => {
    const { licenseKey, daysToAdd, adminActor, reason } = req.body;
    if (!licenseKey || !daysToAdd) return res.status(400).json({ success: false, message: 'License key and daysToAdd parameters required' });
    const result = serverLicenseManager.adminExtendLicense({
      licenseKey,
      daysToAdd: Number(daysToAdd),
      adminActor: adminActor || 'SUPER_ADMIN',
      reason,
    });
    return res.json(result);
  });

  // Admin Assign Plan
  app.post('/api/license/admin/assign-plan', requireAdminAuth, (req, res) => {
    const { licenseKey, newPlan, adminActor, reason } = req.body;
    if (!licenseKey || !newPlan) return res.status(400).json({ success: false, message: 'License key and newPlan parameters required' });
    const result = serverLicenseManager.adminAssignPlan({
      licenseKey,
      newPlan,
      adminActor: adminActor || 'SUPER_ADMIN',
      reason,
    });
    return res.json(result);
  });

  // Admin Dashboard Commercial Statistics
  app.get('/api/license/admin/dashboard-stats', requireAdminAuth, (req, res) => {
    const stats = serverLicenseManager.getDashboardStats();
    return res.json({ success: true, stats });
  });

  // Admin List All Licenses
  app.get('/api/license/admin/list', requireAdminAuth, (req, res) => {
    const licenses = serverLicenseManager.getAllLicenses();
    return res.json({ success: true, licenses });
  });

  // Admin Audit Logs
  app.get('/api/license/admin/audit-logs', requireAdminAuth, (req, res) => {
    const key = req.query.key as string;
    const logs = serverLicenseManager.getAuditLogs(key);
    return res.json({ success: true, auditLogs: logs });
  });

  // Mount Dedicated AI Intelligence Engine Router
  app.use('/api/ai', aiRouter);

  // Natural Language Transaction Parser
  app.post('/api/ai/parse-transaction', async (req, res) => {
    try {
      const { promptText, availableAccounts, availableCategories } = req.body;
      if (!promptText) {
        return res.status(400).json({ error: 'Text prompt required.' });
      }

      const ai = getAi();
      const prompt = `
Anda adalah mesin NLP Keuangan Indonesia untuk LUXFIN AI.
Tugas Anda adalah mengubah input teks transaksi pengguna bahasa Indonesia menjadi data JSON terstruktur.

Input Pengguna: "${promptText}"

Daftar Rekening Tersedia:
${JSON.stringify(availableAccounts || [])}

Daftar Kategori Tersedia:
${JSON.stringify(availableCategories || [])}

Aturan Ekstraksi:
1. Tentukan "type": "INCOME" (pemasukan), "EXPENSE" (pengeluaran), atau "TRANSFER" (pindah dana).
2. "amount": Angka rupiah murni tanpa huruf/titik (contoh: 15000000 untuk 15jt, 55000 untuk 55rb).
3. "accountId": Pilih ID rekening paling cocok dari daftar. Jika tidak ada, kembalikan null atau ID terdekat.
4. "targetAccountId": Hanya jika type === "TRANSFER", tentukan ID rekening tujuan.
5. "categoryId": Pilih ID kategori paling tepat dari daftar.
6. "vendor": Nama merchant/toko/pemberi kerja jika ada.
7. "notes": Deskripsi singkat transaksi.
8. "subcategory": Subkategori spesifik jika relevan.
9. "tags": Array string tag terkait (contoh: ["Gaji"], ["Kuliner"]).

Kembalikan HANYA format JSON valid berikut tanpa markdown/penjelasan tambahan:
{
  "type": "INCOME" | "EXPENSE" | "TRANSFER",
  "amount": number,
  "accountId": "string",
  "targetAccountId": "string" | null,
  "categoryId": "string",
  "subcategory": "string",
  "vendor": "string",
  "notes": "string",
  "tags": string[]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Gemini output empty');
      }

      const parsed = JSON.parse(text);
      res.json({ success: true, parsed });
    } catch (error: any) {
      console.error('AI Parse Transaction Error:', error);
      res.status(500).json({ error: error.message || 'Gagal memproses teks transaksi dengan AI.' });
    }
  });

  // Receipt Scanner OCR
  app.post('/api/ai/scan-receipt', async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'Image base64 data required.' });
      }

      const ai = getAi();
      const base64Clean = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const prompt = `
Analisis struk/nota belanja Indonesia ini secara akurat.
Ekstrak informasi penting berikut ke dalam JSON terstruktur:

1. "vendor": Nama merchant/toko (contoh: Starbucks, Indomaret, Superindo, Tokopedia).
2. "total": Total transaksi akhir dalam Rupiah (number murni).
3. "date": Tanggal transaksi dalam format YYYY-MM-DD. Jika tidak terlihat jelas, gunakan tanggal hari ini.
4. "tax": PPN/Pajak jika ada (number murni).
5. "items": Array objek berisi { "name": string, "price": number, "qty": number }.
6. "suggestedCategory": Nama kategori yang cocok (contoh: "Makanan & Minuman", "Belanja & Gaya Hidup").
7. "confidenceScore": Nilai kepercayaan 0-100.

Kembalikan HANYA JSON tanpa format markdown wrapper:
{
  "vendor": "string",
  "total": number,
  "date": "YYYY-MM-DD",
  "tax": number,
  "items": [{ "name": "string", "price": number, "qty": number }],
  "suggestedCategory": "string",
  "confidenceScore": number
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              data: base64Clean,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          { text: prompt },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) throw new Error('Receipt AI response empty');

      const parsed = JSON.parse(text);
      res.json({ success: true, receipt: parsed });
    } catch (error: any) {
      console.error('AI Scan Receipt Error:', error);
      res.status(500).json({ error: error.message || 'Gagal membaca struk dengan AI OCR.' });
    }
  });

  // AI Money Copilot Chat
  app.post('/api/ai/copilot', async (req, res) => {
    try {
      const { userMessage, financialContext, conversationHistory } = req.body;
      if (!userMessage) {
        return res.status(400).json({ error: 'User message required.' });
      }

      const ai = getAi();

      const systemInstruction = `
Anda adalah "LUX AI", Asisten Financial Advisor AI pribadi berpengalaman & tepercaya untuk aplikasi LUXFIN AI di Indonesia.
Gaya komunikasi Anda: Professional, ramah, berempati, langsung pada inti masalah, dan berbahasa Indonesia yang sangat alami dan elegan.

Konteks Keuangan Pengguna Saat Ini (Data Riil):
${JSON.stringify(financialContext || {}, null, 2)}

Aturan Penting & Respon JSON:
1. Berikan penjelasan terstruktur dengan poin-poin jelas dan simulasi angka Rupiah (Rp) konkret.
2. Jika pengguna meminta atau Anda menyarankan tindakan nyata seperti:
   - Membuat budget baru (contoh: "budget Makanan Rp 1.500.000") -> set type "CREATE_BUDGET"
   - Membuat target tabungan baru (contoh: "menabung Rp 20 juta dalam 8 bulan") -> set type "CREATE_GOAL"
   - Mencatatkan transaksi baru (contoh: "catat pengeluaran makan siang 50rb") -> set type "CREATE_TRANSACTION"
   - Menambahkan tagihan/langganan -> set type "CREATE_BILL"
   Sertakan objek "proposedAction" dengan payload detail!
3. Jika TIDAK ada aksi mutasi yang diusulkan, set "proposedAction" ke null.

Format JSON yang HARUS dikembalikan (tanpa markdown wrapper \`\`\`json):
{
  "reply": "string markdown penjelasan lengkap Indonesia",
  "proposedAction": {
    "id": "act_123",
    "type": "CREATE_BUDGET" | "CREATE_GOAL" | "CREATE_TRANSACTION" | "CREATE_BILL",
    "title": "string judul ringkas aksi",
    "description": "string penjelasan aksi",
    "payload": {
      "categoryName": "string jika relevan",
      "limit": number,
      "title": "string nama goal/transaksi",
      "targetAmount": number,
      "targetMonths": number,
      "amount": number,
      "type": "EXPENSE" | "INCOME"
    },
    "status": "PENDING"
  } | null
}
`;

      const contents = [
        ...(conversationHistory || []).map((msg: any) => ({
          role: msg.sender === 'USER' ? 'user' : 'model',
          parts: [{ text: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text) }],
        })),
        { role: 'user', parts: [{ text: userMessage }] },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          systemInstruction,
        },
      });

      const replyText = response.text;
      if (!replyText) throw new Error('AI Copilot output empty');

      let parsedResponse: any;
      try {
        parsedResponse = JSON.parse(replyText);
      } catch (e) {
        parsedResponse = {
          reply: replyText,
          proposedAction: null,
        };
      }

      res.json({
        success: true,
        reply: parsedResponse.reply || replyText,
        proposedAction: parsedResponse.proposedAction || null,
      });
    } catch (error: any) {
      console.error('AI Copilot Error:', error);
      res.status(500).json({ error: error.message || 'Gagal terhubung dengan LUX AI.' });
    }
  });

  // "Can I Afford It?" Affordability Analysis
  app.post('/api/ai/affordability', async (req, res) => {
    try {
      const { itemName, price, financialContext } = req.body;
      if (!itemName || !price) {
        return res.status(400).json({ error: 'Item name and price required.' });
      }

      const ai = getAi();
      const prompt = `
Analisis Kelayakan Pembelian ("Can I Afford It?") untuk barang berikut:
- Barang/Tujuan: "${itemName}"
- Harga: Rp ${Number(price).toLocaleString('id-ID')}

Kondisi Keuangan Pengguna Saat Ini:
- Net Worth: Rp ${financialContext?.netWorth?.toLocaleString('id-ID') || '0'}
- Pemasukan Bersih Bulanan: Rp ${financialContext?.monthlyIncome?.toLocaleString('id-ID') || '0'}
- Pengeluaran Rutin Bulanan: Rp ${financialContext?.monthlyExpense?.toLocaleString('id-ID') || '0'}
- Sisa Tabungan Cair Saat Ini: Rp ${financialContext?.liquidAssets?.toLocaleString('id-ID') || '0'}
- Dana Darurat Terkumpul: Rp ${financialContext?.emergencyFund?.toLocaleString('id-ID') || '0'}

Tugas:
Analisis secara objektif berdasarkan metode keuangan 50/30/20 & prinsip dana darurat.
Tentukan status kelayakan:
- "SAFE" (Aman Beli - tidak mengganggu kas cair & dana darurat)
- "WARNING" (Pertimbangkan Kembali - kas cair berkurang signifikan atau harus nyicil)
- "UNSAFE" (Tidak Disarankan - menguras dana darurat / melebihi kemampuan)

Kembalikan JSON terstruktur tanpa markdown:
{
  "status": "SAFE" | "WARNING" | "UNSAFE",
  "badgeText": "Aman Dibeli" | "Pertimbangkan" | "Sangat Riskan",
  "score": number (0-100),
  "impactSummary": "string ringkasan dampak finansial",
  "recoveryMonths": number (berapa bulan untuk mengumpulkan kembali dana sebesar harga barang ini),
  "advicePoints": string[] (3 poin saran praktis)
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ success: true, result: parsed });
    } catch (error: any) {
      console.error('AI Affordability Error:', error);
      res.status(500).json({ error: error.message || 'Gagal menghitung kelayakan pembelian.' });
    }
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LUXFIN AI Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
