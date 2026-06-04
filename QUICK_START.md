# 🚀 QUICK START - Bắt Đầu Nhanh Trong 5 Phút

## Điều Kiện Tiên Quyết
- ✅ Node.js đã cài đặt
- ✅ MetaMask extension đã cài đặt

## 5 Bước Cơ Bản

### 1️⃣ Cài Đặt Ganache (Blockchain Cục Bộ)
```bash
# Cài đặt global (phiên bản mới, tương thích Node v22)
npm install -g ganache

# Khởi chạy Ganache trên port 7545
ganache --port 7545
```

**Kết quả:** Bạn sẽ thấy 10 tài khoản test với 1000 ETH mỗi tài khoản

### 2️⃣ Cài Đặt Project Dependencies
```bash
cd c:\Users\Admin\Desktop\blockchain

npm install
```

### 3️⃣ Deploy Smart Contract
```bash
# Compile contract
truffle compile

# Deploy lên Ganache
truffle migrate --network development
```

**Ghi nhớ:** Sao chép địa chỉ contract từ output (ví dụ: 0xa165126C05eCB7EFEB45EF94821DB41910633ed0)

### 4️⃣ Cập Nhật Contract Address

Mở file `src/App.js` dòng ~13:
```javascript
const VOTING_CONTRACT_ADDRESS = '0xa165126C05eCB7EFEB45EF94821DB41910633ed0';
// ↑ Thay bằng địa chỉ của bạn từ output của migrate
```

### 5️⃣ Chạy Frontend React
```bash
npm start
```

Ứng dụng mở tại **http://localhost:3000**

---

## 🎮 Test Nhanh

### Step 1: Connect MetaMask
1. Click nút "Connect MetaMask Wallet"
2. MetaMask pop-up → Select tài khoản → Click "Connect"

### Step 2: Add Candidates (Admin)
```
Nhập: "Candidate A" → Click "Add Candidate"
Nhập: "Candidate B" → Click "Add Candidate"
Nhập: "Candidate C" → Click "Add Candidate"
```

### Step 3: Start Voting
1. Click nút "Start Voting" (Admin Panel)
2. MetaMask confirm → Click "Confirm"

### Step 4: Vote (Multiple Accounts)
```
1. Với account hiện tại: Click "Vote" cho Candidate A
2. Đổi sang account khác (MetaMask):
   - Click MetaMask → Select account khác
   - Refresh page → Connect lại
   - Click "Vote" cho Candidate B
3. Lặp lại với account thứ 3
```

### Step 5: End Voting
1. Click nút "End Voting"
2. Xem kết quả

---

## 📋 Danh Sách File Chính

```
blockchain/
├── contracts/Voting.sol          # Smart Contract ⭐
├── src/App.js                    # React Main Component ⭐
├── src/App.css                   # Styling
├── migrations/2_deploy_voting.js # Deploy Script
├── package.json                  # Dependencies
├── truffle-config.js             # Truffle Config
├── README.md                     # Full Documentation
├── SETUP.md                      # Detailed Setup
├── SMART_CONTRACT_GUIDE.md       # Contract Reference
└── QUICK_START.md               # This file!
```

---

## 🔧 Cấu Hình MetaMask (Một Lần)

1. **Thêm Network:**
   - MetaMask Settings → Networks → Add Network
   - Name: `Ganache`
   - RPC URL: `http://127.0.0.1:7545`
   - Chain ID: `1337`
   - Save

2. **Import Tài Khoản Admin:**
   - Ganache CLI: Sao chép Private Key của account đầu tiên
   - MetaMask: Import Account → Paste Private Key

---

## 💡 Tip: Đổi Account Test

```javascript
// Trong MetaMask:
1. Click icon người dùng
2. Select account khác
3. Ứng dụng sẽ tự cập nhật
```

---

## ⚠️ Troubleshooting Nhanh

| Lỗi | Giải Pháp |
|-----|----------|
| "Cannot connect" | Ganache chạy chưa? Start: `ganache-cli` |
| "Only admin can" | Dùng account #0 (admin account) |
| "Already voted" | Dùng account khác |
| "Invalid address" | Cập nhật contract address trong src/App.js |
| "Port 3000 in use" | `npm start --port 3001` |

---

## 📞 Cần Giúp?

- ❓ **Setup detailed:** Xem [SETUP.md](SETUP.md)
- 📚 **Contract details:** Xem [SMART_CONTRACT_GUIDE.md](SMART_CONTRACT_GUIDE.md)
- 📖 **Full docs:** Xem [README.md](README.md)

---

## 🎯 Checklist Trước Khi Nộp Bài

- [ ] Ganache chạy trên port 7545 (dùng `ganache --port 7545`, không phải `ganache-cli`)
- [ ] npm packages cài đặt
- [ ] Truffle compile thành công
- [ ] Truffle migrate thành công
- [ ] Contract address cập nhật trong App.js
- [ ] MetaMask kết nối được
- [ ] Có thể add candidates (admin)
- [ ] Có thể start voting
- [ ] Có thể vote (khác account)
- [ ] Có thể end voting
- [ ] Kết quả hiển thị đúng

---

## 🎉 Bây giờ bạn đã sẵn sàng!

**Hãy thử chạy:**
```bash
# Terminal 1: Ganache (v7+ tương thích Node v22)
ganache --port 7545

# Terminal 2: Compile & Deploy
cd blockchain && truffle compile && truffle migrate --reset --network development

# Terminal 3: React
npm start
```

**Enjoy your Voting DApp! 🗳️**
