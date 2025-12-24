// routes/orderkuota.js

const fetch = global.fetch // Akan didefinisikan di server.js
const { URLSearchParams } = require('url');
const crypto = require("crypto");
const QRCode = require('qrcode');
const { ImageUploadService } = require('node-upload-images');

// =========================================================
// Fungsi dan Kelas OrderKuota Anda (disalin dari prompt)
// =========================================================

const axios = require('axios');
const qs = require('qs');

/**
 * Cek e-wallet berdasarkan provider dan nomor
 * @param {string} provider - contoh: 'dana', 'ovo', 'gopay', 'shopeepay', 'linkaja'
 * @param {string} nomor - nomor e-wallet
 */
async function cekEwallet(provider, nomor) {
  const validProviders = ["dana", "ovo", "gopay", "shopeepay", "linkaja"];
  if (!validProviders.includes(provider)) {
    return {
      status: false,
      error: "Provider tidak valid",
      valid_providers: validProviders
    };
  }

  try {
    const timestamp = Date.now().toString();

    let data = qs.stringify({
      'app_reg_id': 'cdzXkBynRECkAODZEHwkeV:APA91bHRyLlgNSlpVrC4Yv3xBgRRaePSaCYruHnNwrEK8_pX3kzitxzi0CxIDFc2oztCwcw7-zPgwE-6v_-rJCJdTX8qE_ADiSnWHNeZ5O7_BIlgS_1N8tw',
      'phone_uuid': 'cdzXkBynRECkAODZEHwkeV',
      'phone_model': '23124RA7EO',
      'phoneNumber': nomor,
      'request_time': timestamp,
      'phone_android_version': '15',
      'app_version_code': '250918',
      'auth_username': 'sumarjono',
      'customerId': '',
      'id': provider,
      'auth_token': '2604338:tMbsgZKq2JYxOG8BvTQnfm1oup0XaNPI',
      'app_version_name': '25.09.18',
      'ui_mode': 'dark'
    });

    const config = {
      method: 'POST',
      url: `https://checker.orderkuota.com/api/checkname/produk/981e2121cf08cc5b0961abe71ccb0725211a3e8a54/22/2604338/${provider}?phone=${nomor}&cust_id=`,
      headers: {
        'User-Agent': 'okhttp/4.12.0',
        'Accept-Encoding': 'gzip',
        'Content-Type': 'application/x-www-form-urlencoded',
        'signature': '63c7cce025a219cf50ad08513d2a669e1c7bacf3233e42810aa42ced97eca2e6c6a926afd5afd93eb2fd90854e045d12921a2c84049f8096f4ec2b849097e940',
        'timestamp': timestamp
      },
      data
    };

    const response = await axios.request(config);
    return { status: true, result: response.data };
  } catch (err) {
    return { status: false, error: err.message };
  }
}

// CLASS OrderKuota (Disertakan di sini)
class OrderKuota {
    // ... (Semua properti statis dan metode yang Anda sediakan) ...
    static API_URL = 'https://app.orderkuota.com/api/v2';
    static API_URL_ORDER = 'https://app.orderkuota.com/api/v2/order';
    static HOST = 'app.orderkuota.com';
    static USER_AGENT = 'okhttp/4.12.0';
    static APP_VERSION_NAME = '25.09.18';
    static APP_VERSION_CODE = '250918';
    static APP_REG_ID = 'cdzXkBynRECkAODZEHwkeV:APA91bHRyLlgNSlpVrC4Yv3xBgRRaePSaCYruHnNwrEK8_pX3kzitxzi0CxIDFc2oztcwcw7-zPgwE-6v_-rJCJdTX8qE_ADiSnWHNeZ5O7_BIlgS_1N8tw';
    static PHONE_MODEL = '23124RA7EO';
    static PHONE_UUID = 'cdzXkBynRECkAODZEHwkeV';
    static PHONE_ANDROID_VERSION = '15';

    constructor(username = null, authToken = null) {
        this.username = username;
        this.authToken = authToken;
    }

    async loginRequest(username, password) {
        const payload = new URLSearchParams({
            username,
            password,
            request_time: Date.now(),
            app_reg_id: OrderKuota.APP_REG_ID,
            phone_android_version: OrderKuota.PHONE_ANDROID_VERSION,
            app_version_code: OrderKuota.APP_VERSION_CODE,
            phone_uuid: OrderKuota.PHONE_UUID
        });
        return await this.request('POST', `${OrderKuota.API_URL}/login`, payload);
    }

    async getAuthToken(username, otp) {
        const payload = new URLSearchParams({
            username,
            password: otp,
            request_time: Date.now(),
            app_reg_id: OrderKuota.APP_REG_ID,
            phone_android_version: OrderKuota.PHONE_ANDROID_VERSION,
            app_version_code: OrderKuota.APP_VERSION_CODE,
            phone_uuid: OrderKuota.PHONE_UUID
        });
        return await this.request('POST', `${OrderKuota.API_URL}/login`, payload);
    }

    // Mutasi QRIS
    async getTransactionQris(type = '', userId = null) {
        if (!userId && this.authToken) {
            userId = this.authToken.split(':')[0];
        }

        const payload = new URLSearchParams({  
            request_time: Date.now(),  
            app_reg_id: OrderKuota.APP_REG_ID,  
            phone_android_version: OrderKuota.PHONE_ANDROID_VERSION,  
            app_version_code: OrderKuota.APP_VERSION_CODE,  
            phone_uuid: OrderKuota.PHONE_UUID,  
            auth_username: this.username,  
            auth_token: this.authToken,  
            'requests[qris_history][jumlah]': '',  
            'requests[qris_history][jenis]': type,  
            'requests[qris_history][page]': '1',  
            'requests[qris_history][dari_tanggal]': '',  
            'requests[qris_history][ke_tanggal]': '',  
            'requests[qris_history][keterangan]': '',  
            'requests[0]': 'account',  
            app_version_name: OrderKuota.APP_VERSION_NAME,  
            ui_mode: 'light',  
            phone_model: OrderKuota.PHONE_MODEL  
        });  
          
        const endpoint = userId ?   
            `${OrderKuota.API_URL}/qris/mutasi/${userId}` :   
            `${OrderKuota.API_URL}/get`;  
            
        return await this.request('POST', endpoint, payload);
    }

    // Generate QRIS
    async generateQr(amount = '') {
        const payload = new URLSearchParams({
            request_time: Date.now(),
            app_reg_id: OrderKuota.APP_REG_ID,
            phone_android_version: OrderKuota.PHONE_ANDROID_VERSION,
            app_version_code: OrderKuota.APP_VERSION_CODE,
            phone_uuid: OrderKuota.PHONE_UUID,
            auth_username: this.username,
            auth_token: this.authToken,
            'requests[qris_merchant_terms][jumlah]': amount,
            'requests[0]': 'qris_merchant_terms',
            app_version_name: OrderKuota.APP_VERSION_NAME,
            phone_model: OrderKuota.PHONE_MODEL
        });

        const response = await this.request('POST', `${OrderKuota.API_URL}/get`, payload);  

        try {  
            if (response.success && response.qris_merchant_terms && response.qris_merchant_terms.results) {  
                return response.qris_merchant_terms.results;  
            }  
            return response;  
        } catch (err) {  
            return { error: err.message, raw: response };  
        }
    }

    // Withdrawal QRIS
    async withdrawalQris(amount = '') {
        const payload = new URLSearchParams({
            request_time: Date.now(),
            app_reg_id: OrderKuota.APP_REG_ID,
            phone_android_version: OrderKuota.PHONE_ANDROID_VERSION,
            app_version_code: OrderKuota.APP_VERSION_CODE,
            phone_uuid: OrderKuota.PHONE_UUID,
            auth_username: this.username,
            auth_token: this.authToken,
            'requests[qris_withdraw][amount]': amount,
            'requests[0]': 'account',
            app_version_name: OrderKuota.APP_VERSION_NAME,
            ui_mode: 'light',
            phone_model: OrderKuota.PHONE_MODEL
        });

        return await this.request('POST', `${OrderKuota.API_URL}/get`, payload);
    }

    buildHeaders() {
        return {
            'Host': OrderKuota.HOST,
            'User-Agent': OrderKuota.USER_AGENT,
            'Content-Type': 'application/x-www-form-urlencoded',
            'accept-encoding': 'gzip'
        };
    }

    async request(method, url, body = null) {
        try {
            const res = await fetch(url, {
                method,
                headers: this.buildHeaders(),
                body: body ? body.toString() : null,
            });

            const contentType = res.headers.get("content-type");  
            if (contentType && contentType.includes("application/json")) {  
                return await res.json();  
            } else {  
                return await res.text();  
            }  
        } catch (err) {  
            return { error: err.message };  
        }
    }
}

// Fungsi Konversi dan Pendukung (Disertakan di sini)

function convertCRC16(str) {
    let crc = 0xFFFF;
    for (let c = 0; c < str.length; c++) {
        crc ^= str.charCodeAt(c) << 8;
        for (let i = 0; i < 8; i++) {
            crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        }
    }
    return ("000" + (crc & 0xFFFF).toString(16).toUpperCase()).slice(-4);
}

function generateTransactionId() {
    return `SKYZOPEDIA-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

function generateExpirationTime() {
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 30);
    // Format ke string ISO yang lebih mudah dibaca/di-handle
    return expirationTime.toISOString(); 
}

async function elxyzFile(buffer) {
    const service = new ImageUploadService('pixhost.to');
    const { directLink } = await service.uploadFromBinary(buffer, 'skyzo.png');
    return directLink;
}

async function createQRIS(amount, codeqr) {
    let qrisData = codeqr;
    // Logika pengubahan QRIS statis menjadi QRIS dinamis (menambahkan amount)
    qrisData = qrisData.slice(0, -4);
    const step1 = qrisData.replace("010211", "010212"); // Mengubah 'static' ke 'dynamic'
    const step2 = step1.split("5802ID");
    const amountStr = amount.toString();
    const uang = "54" + ("0" + amountStr.length).slice(-2) + amountStr; // Tag 54 (Amount)
    const finalData = step2[0] + uang + "5802ID" + step2[1];
    const result = finalData + convertCRC16(finalData); // Tambah CRC16

    const buffer = await QRCode.toBuffer(result);
    const uploadedFile = await elxyzFile(buffer);
    
    return {
        idtransaksi: generateTransactionId(),
        jumlah: amount,
        expired: generateExpirationTime(),
        imageqris: { url: uploadedFile }
    };
}


// ROUTE EXPORT (Disalin dan dimodifikasi untuk Error Handling)
module.exports = [
    {
        name: "Get OTP (tahap 1)",
        desc: "Mendapatkan kode OTP dari Orderkuota untuk login.",
        category: "Authorized",
        path: "/orderkuota/getotp?apikey=&username=&password=",
        async run(req, res) {
            const { apikey, username, password } = req.query;
            if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
            if (!username) return res.json({ status: false, error: 'Missing username parameter' });
            if (!password) return res.json({ status: false, error: 'Missing password parameter' });
            try {
                const ok = new OrderKuota();
                const login = await ok.loginRequest(username, password);
                if (login.success) {
                    res.json({ status: true, result: login.results });
                } else {
                    res.status(400).json({ status: false, error: login.message || 'Login failed', raw: login });
                }
            } catch (err) {
                res.status(500).json({ status: false, error: err.message, detail: "Pastikan semua dependensi terinstal (node-fetch, qrcode, dll)." });
            }
        }
    },
    {
        name: "Get Token (tahap 2)",
        desc: "Menukar OTP dengan Auth Token untuk otentikasi API selanjutnya.",
        category: "Authorized",
        path: "/orderkuota/gettoken?apikey=&username=&otp=",
        async run(req, res) {
            const { apikey, username, otp } = req.query;
            if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
            if (!username) return res.json({ status: false, error: 'Missing username parameter' });
            if (!otp) return res.json({ status: false, error: 'Missing otp parameter' });
            try {
                const ok = new OrderKuota();
                const login = await ok.getAuthToken(username, otp);
                if (login.success && login.results.auth_token) {
                    res.json({ status: true, result: login.results, note: 'Gunakan auth_token ini untuk permintaan selanjutnya.' });
                } else {
                    res.status(400).json({ status: false, error: login.message || 'OTP verification failed', raw: login });
                }
            } catch (err) {
                res.status(500).json({ status: false, error: err.message });
            }
        }
    },
    {
        name: "Cek Mutasi QRIS",
        desc: "Melihat riwayat mutasi transaksi QRIS akun Orderkuota.",
        category: "QRIS",
        path: "/orderkuota/mutasiqr?apikey=&username=&token=",
        async run(req, res) {
            const { apikey, username, token } = req.query;
            if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
            if (!username) return res.json({ status: false, error: 'Missing username parameter' });
            if (!token) return res.json({ status: false, error: 'Missing token parameter' });
            try {
                const ok = new OrderKuota(username, token);
                const login = await ok.getTransactionQris();
                if (login.success && login.qris_history) {
                    res.json({ status: true, result: login.qris_history.results });
                } else {
                    res.status(400).json({ status: false, error: login.message || 'Failed to fetch QRIS mutation', raw: login });
                }
            } catch (err) {
                res.status(500).json({ status: false, error: err.message });
            }
        }
    },
    {
        name: "Create QRIS",
        desc: "Membuat QRIS Dinamis untuk pembayaran sejumlah tertentu.",
        category: "QRIS",
        path: "/orderkuota/createpayment?apikey=&username=&token=&amount=",
        async run(req, res) {
            const { apikey, username, token, amount } = req.query;
            if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
            if (!username) return res.json({ status: false, error: 'Missing username parameter' });
            if (!token) return res.json({ status: false, error: 'Missing token parameter' });
            // Pastikan amount adalah angka positif
            const numAmount = Number(amount);
            if (!amount || isNaN(numAmount) || numAmount <= 0) return res.json({ status: false, error: 'Missing or invalid amount parameter (must be positive number)' });

            try {  
                const ok = new OrderKuota(username, token);  
                const qrcodeResp = await ok.generateQr(numAmount);  
        
                if (!qrcodeResp || !qrcodeResp.qris_data) {  
                  return res.status(400).json({ status: false, error: "QRIS generation failed (Check if OrderKuota account has QRIS activated/ready)", raw: qrcodeResp });  
                }  
        
                // Gunakan fungsi createQRIS yang sudah dimodifikasi untuk QRIS Dinamis
                const result = await createQRIS(numAmount, qrcodeResp.qris_data);          
        
                res.status(200).json({  
                  status: true,  
                  result: result  
                });  
              } catch (error) {  
                res.status(500).json({ status: false, error: error.message });  
              }  
        }
    
    },
    {
        name: "Withdraw QRIS",
        desc: "Melakukan penarikan saldo QRIS Orderkuota ke rekening.",
        category: "QRIS",
        path: "/orderkuota/wdqr?apikey=&username=&token=&amount=",
        async run(req, res) {
            const { apikey, username, token, amount } = req.query;
            if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
            if (!username) return res.json({ status: false, error: 'Missing username parameter' });
            if (!token) return res.json({ status: false, error: 'Missing token parameter' });
            // Pastikan amount adalah angka positif
            const numAmount = Number(amount);
            if (!amount || isNaN(numAmount) || numAmount <= 0) return res.json({ status: false, error: 'Missing or invalid amount parameter (must be positive number)' });

            try {  
                const ok = new OrderKuota(username, token);  
                const wd = await ok.withdrawalQris(numAmount);  
                
                if (wd.success) {
                    res.json({ status: true, result: wd, message: "Permintaan Withdrawal berhasil diajukan." });
                } else {
                     res.status(400).json({ status: false, error: wd.message || 'Withdrawal failed', raw: wd });
                }

              } catch (error) {  
                res.status(500).json({ status: false, error: error.message });  
              }  
        }
    }, 
      {
    name: "Cek Ewallet",
    desc: "Cek nama pengguna akun Ewallet",
    category: "Orderkuota",
    path: "/orderkuota/cekewallet?apikey=&provider=&nomor=",
    async run(req, res) {
      let { apikey, provider, nomor } = req.query;
      if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (!provider) return res.json({ status: false, error: 'Missing provider' });
      if (!nomor) return res.json({ status: false, error: 'Missing nomor' });

      try {
        provider = provider.toLowerCase();
        const result = await cekEwallet(provider, nomor);
        res.json(result);
      } catch (error) {
        res.status(500).json({ status: false, error: error.message });
      }
    }
  }
];
