# 🚀 Chạy Blockchain Voting DApp với Backend

## 📋 Yêu cầu

- **Node.js** v14+
- **npm** hoặc **yarn**
- **Ganache** (đã cài hoặc chạy qua npm)
- **MetaMask** (cài trên browser)

---

## 🔧 Cài đặt

### 1️⃣ Cài đặt Dependencies

```bash
npm install
```

Điều này sẽ cài:
- Express server (backend để lưu data.json)
- React (frontend)
- ethers.js (Ethereum library)
- cors (cho phép frontend gọi backend)
- concurrently (chạy server và React đồng thời)

---

## 🎯 Chạy Project

### **Option 1: Chạy tất cả cùng lúc** (Recommended)

```bash
npm run dev
```

Lệnh này sẽ:
1. ✅ Khởi động backend server (port 5000)
2. ✅ Khởi động React app (port 3000)

**Output sẽ hiển thị:**
```
🚀 Backend server running on http://localhost:5000
📁 Data file: C:\Users\Admin\Desktop\blockchain\data.json
...
Compiled successfully!
You can now view voting-dapp in the browser.
  Local:            http://localhost:3000
```

---

### **Option 2: Chạy riêng lẻ**

**Terminal 1 - Backend server:**
```bash
npm run server
```

**Terminal 2 - React app:**
```bash
npm start
```

---

### **Option 3: Chạy với Ganache**

**Terminal 1 - Ganache blockchain:**
```bash
ganache --port 7545
```

**Terminal 2 - Backend server:**
```bash
npm run server
```

**Terminal 3 - React app:**
```bash
npm start
```

---

## 📝 Workflow

Khi bạn thực hiện bất kỳ transaction nào (vote, add candidate, etc.):

```
1️⃣ Frontend gửi request tới Backend
   ↓
2️⃣ Backend lưu vào data.json (status: pending)
   ↓
3️⃣ Frontend gửi transaction lên blockchain qua MetaMask
   ↓
4️⃣ Transaction được confirm trên Ganache
   ↓
5️⃣ Frontend gửi blockchain info tới Backend
   ↓
6️⃣ Backend cập nhật data.json (status: confirmed, tx_hash, block, gas, etc.)
```

---

## 📁 File cơ bản

```
blockchain/
├── server.js                    # 🔴 Backend Express server
├── data.json                    # 💾 Lưu trữ transactions
├── package.json                 # Dependencies + scripts
├── src/
│   ├── App.js                   # Frontend React (sửa để gọi backend)
│   └── App.css                  # Styling
└── truffle-config.js            # Truffle config
```

---

## 🔑 API Endpoints

Backend cung cấp các API:

### 1. **Lưu transaction trước blockchain**
```
POST /api/save-transaction
Body: {
  txType: "vote" | "addCandidate" | "startVoting" | "endVoting",
  userAddress: "0x...",
  details: {...}
}
```

### 2. **Cập nhật blockchain info**
```
POST /api/update-transaction
Body: {
  pendingTxHash: "pending_123456",
  txHash: "0x...",
  blockNumber: 12345,
  gasUsed: "123456",
  encodedData: "0x..."
}
```

### 3. **Lấy tất cả transactions**
```
GET /api/transactions
```

### 4. **Xóa tất cả dữ liệu**
```
POST /api/clear-data
```

---

## 📊 Cấu trúc data.json

Mỗi transaction được lưu với format sau:

```json
{
  "transactions": [
    {
      "txHash": "0x462e91ec...",           // Transaction hash (hex)
      "txType": "vote",                   // Loại: vote, addCandidate, startVoting, endVoting
      "userAddress": "0x1c7A0c334fc...",  // Địa chỉ ví của người gửi
      "timestamp": "2026-05-18T04:36:04.484Z",  // Thời gian ISO 8601
      "blockNumber": 3,                   // Số block trên blockchain
      "gasUsed": "97247",                 // Gas đã tiêu tốn (wei)
      "encodedData": "0x462e91ec...",     // Dữ liệu mã hóa trên blockchain
      "details": {                        // Chi tiết transaction
        "candidateName": "Ngô Tuấn Minh"
      }
    }
  ],
  "statistics": {
    "totalVotes": 3,                      // Tổng số votes (tính tự động)
    "totalCandidates": 2,                 // Tổng số ứng cử viên (tính tự động)
    "uniqueVoters": ["0x1c7A0c...", "0xF78362B..."]  // Danh sách địa chỉ đã vote (tính tự động)
  },
  "lastUpdated": "2026-05-18T05:04:05.976Z"
}
```

**Lưu ý quan trọng:**
- ✅ **Statistics được tính tự động** từ transactions
- ✅ **Không lưu pending transactions** trong file cuối cùng (chỉ confirmed)
- ✅ **Mỗi field đều có format chính xác** (string, number, date)
- ✅ **encodedData** là dữ liệu mã hóa từ blockchain (hex)

---

## 🐛 Troubleshooting

### ❌ Backend không kết nối được
```
Error: ECONNREFUSED - Backend server không chạy
```
**Giải pháp:** Chạy `npm run server` ở terminal khác

### ❌ MetaMask popup không hiện
```
Chỉnh sửa: Kiểm tra Network là Ganache (127.0.0.1:7545)
```

### ❌ data.json không được tạo
```
Backend sẽ tự tạo nếu chưa có
Check: C:\Users\Admin\Desktop\blockchain\data.json
```

### ❌ CORS Error
```
Error: Cross-Origin Request Blocked
```
**Giải pháp:** Đã add cors package, restart server

---

## ✅ Checklist Before Running

- [ ] Ganache đang chạy (port 7545)?
- [ ] Node.js cài đặt đúng?
- [ ] `npm install` đã chạy?
- [ ] MetaMask cài trên browser?
- [ ] Backend port 5000 trống?
- [ ] React port 3000 trống?

---

## 📞 Liên hệ

Nếu có lỗi, kiểm tra:
1. Console browser (F12)
2. Terminal output
3. data.json content

Happy voting! 🗳️

