const { ethers } = require("ethers");
require('dotenv').config(); 

// --- DATA KONFIGURASI ---
const RPC_ENDPOINT_URL = process.env.RPC_ENDPOINT_URL;
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
const CONTRACT_ADDRESS = "0xfb447e002aFea41D2044656E3323F448CeDB9831";

// --- KODE FIX UNTUK BYPASS ABI: Human-Readable ABI ---
// Kita hanya mendefinisikan fungsi yang dibutuhkan (batchMintTicket) dalam format string.
const BATCH_MINT_ABI = [
    "function batchMintTicket(address[] recipients, string tokenURI)"
];


async function mintTicketsAutomatically(recipients, tokenURI) {
    if (!OWNER_PRIVATE_KEY || !RPC_ENDPOINT_URL) {
        console.error("❌ ERROR: Kunci di file .env belum terisi.");
        return;
    }

    try {
        const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT_URL);
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice; 
        
        const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);

        // INSTANSIASI KONTRAK MENGGUNAKAN HUMAN-READABLE ABI
        const busTicketContract = new ethers.Contract(CONTRACT_ADDRESS, BATCH_MINT_ABI, wallet);

        console.log(`\n--- MEMULAI BATCH MINTING ---`);
        console.log(`Pengirim (Owner): ${wallet.address}`);
        console.log(`Jumlah Tiket: ${recipients.length}`);

        const tx = await busTicketContract.batchMintTicket(
            recipients,
            tokenURI,
            { 
                gasPrice: gasPrice // Harga gas yang disarankan
            }
        );

        console.log(`Transaksi dikirim. Hash: ${tx.hash}`);
        await tx.wait();

        console.log(`\n✅ BATCH MINTING SUKSES!`);
        console.log(`Tiket dicetak di Blockchain. Cek Hash: ${tx.hash}`);
        
    } catch (error) {
        console.error("\n❌ BATCH MINTING GAGAL.");
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.error("Detail Error: Saldo Sepolia ETH Owner tidak cukup. Mohon minta lagi dari Faucet.");
        } else {
             // Jika error masih terjadi, itu adalah masalah RPC atau Kunci Privat.
            console.error("Detail Error (Kemungkinan Masalah Koneksi/Kunci):", error.message);
        }
    }
}

module.exports = { mintTicketsAutomatically };