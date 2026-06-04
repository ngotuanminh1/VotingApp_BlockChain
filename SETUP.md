# 🔧 HƯỚNG DẪN CHI TIẾT THIẾT LẬP VOTING DAPP

## BƯỚC 1: Cài Đặt Node.js

1. Tải Node.js từ https://nodejs.org/ (phiên bản LTS)
2. Cài đặt Node.js
3. Xác nhận cài đặt:
```bash
node --version
npm --version
```

## BƯỚC 2: Cài Đặt Truffle và Ganache

```bash
npm install -g truffle
npm install -g ganache
```

Xác nhận:
```bash
truffle version
ganache --version
```

## BƯỚC 3: Khởi Tạo Dự Án

### Nếu chưa có dự án:
```bash
cd c:\Users\Admin\Desktop
mkdir blockchain
cd blockchain
truffle init
```

### Nếu đã có dự án:
Chỉ cần sao chép tất cả các file từ hướng dẫn này.

## BƯỚC 4: Cấu Hình Truffle

Mở `truffle-config.js` và tìm section `networks`:

```javascript
networks: {
  development: {
    host: "127.0.0.1",
    port: 7545,
    network_id: "*",
  }
}
```

## BƯỚC 5: Tạo Thư Mục và File

### Cấu Trúc Thư Mục:
```
blockchain/
├── contracts/
│   └── Voting.sol
├── migrations/
│   ├── 1_initial_migration.js
│   └── 2_deploy_voting.js
├── src/
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   ├── VotingABI.json
│   └── index.css
├── public/
│   └── index.html
├── test/
│   └── voting.test.js
├── package.json
├── truffle-config.js
└── README.md
```

## BƯỚC 6: Cài Đặt Dependencies

```bash
cd blockchain
npm install
```

Các gói sẽ cài đặt:
- react
- react-dom
- ethers
- truffle
- ganache

## BƯỚC 7: Khởi Chạy Ganache

**Tùy Chọn 1: Ganache CLI (phiên bản mới, Node v22 compatible)**
```bash
ganache --port 7545
```

Kết quả sẽ hiển thị:
```
Ganache CLI v7.x.x (ganache-core: 7.x.x)

Available Accounts
==================
(0) 0x627306090abaB3A6e1400e9345bC60c78a8BEf57 (100 ETH)
(1) 0xf17f52151EbEF6C7334FAD080c5704D77216b732 (100 ETH)
...

Private Keys
==================
(0) 0x...
(1) 0x...
...
```

**Tùy Chọn 2: Ganache GUI**
- Tải từ https://www.trufflesuite.com/ganache
- Cài đặt và mở Ganache
- Chọn "Ethereum" → "Quick Start"
- Đảm bảo port là 7545

## BƯỚC 8: Compile Smart Contract

Mở terminal mới (giữ Ganache chạy):

```bash
cd c:\Users\Admin\Desktop\blockchain
truffle compile
```

Kết quả:
```
Compiling your contracts...
===========================
> Compiling .\contracts\Voting.sol
> Artifacts written to C:\Users\Admin\Desktop\blockchain\build\contracts

Compilation successful!
```

## BƯỚC 9: Deploy Smart Contract

```bash
truffle migrate --network development
```

Kết quả sẽ tương tự:
```
Starting migrations...
======================
> Network name: 'development'
> Network id: 5777
> Block gas limit: 6721975 (0x6677e7)

1_initial_migration.js
======================
   Deploying 'Migrations'
   ----------------------
   > transaction hash:    0x...
   > Blocks: 0        Seconds: 0
   > contract address:    0xA5F4...
   > block number:        1
   > block gas used:       277462
   > gas price:           2 gwei
   > value sent:          0 ETH
   > total cost:          0.000554924 ETH

   > Saving successful migration to network...
   > Saving artifacts
   > Total cost:          0.000554924 ETH

2_deploy_voting.js
==================
   Deploying 'Voting'
   ------------------
   > transaction hash:    0x...
   > Blocks: 0        Seconds: 0
   > contract address:    0x5FbDB2315678afccb333f8a9c36e6b4ae20d8042  ← **LƯU ỰNG CÔNG CHÍ NÀY**
   > block number:        2
   > block gas used:       1114788
   > gas price:           2 gwei
   > value sent:          0 ETH
   > total cost:          0.002229576 ETH

   > Saving successful migration to network...
   > Saving artifacts
   > Total cost:          0.002229576 ETH

Migrations complete! Execution time: 0.922s
```

## BƯỚC 10: Cập Nhật Địa Chỉ Contract

1. Sao chép địa chỉ contract từ `2_deploy_voting.js` (0x5FbDB2315678...)
2. Mở file `src/App.js`
3. Tìm dòng:
```javascript
const VOTING_CONTRACT_ADDRESS = '0x5FbDB2315678afccb333f8a9c36e6b4ae20d8042';
```
4. Thay thế bằng địa chỉ của bạn

## BƯỚC 11: Cài Đặt MetaMask

### Cài Đặt Extension:
1. Mở Chrome/Edge/Brave
2. Tìm "MetaMask" trên Web Store
3. Click "Add to Chrome"
4. Tạo tài khoản MetaMask mới (hoặc import existing)

### Thêm Ganache Network:
1. Click biểu tượng MetaMask
2. Click dropdown "Ethereum Mainnet"
3. Click "Add Network"
4. Nhập thông tin:
   - **Network name**: Ganache
   - **New RPC URL**: http://127.0.0.1:7545
   - **Chain ID**: 1337
   - **Currency symbol**: ETH
5. Click "Save"

### Import Tài Khoản từ Ganache:
1. Mở Ganache
2. Click vào biểu tượng khóa của tài khoản đầu tiên
3. Copy Private Key
4. Mở MetaMask → Click "Import Account"
5. Paste Private Key → Click "Import"

Giờ bạn sẽ có ETH trong tài khoản MetaMask!

## BƯỚC 12: Chạy Frontend React

Mở terminal mới (giữ Ganache chạy):

```bash
cd c:\Users\Admin\Desktop\blockchain
npm run server
npm start
```

React sẽ tự động mở ứng dụng ở `http://localhost:3000`

## BƯỚC 13: Sử Dụng Ứng Dụng

### Kết Nối MetaMask:
1. Click nút "Connect MetaMask Wallet"
2. MetaMask sẽ bật lên
3. Chọn tài khoản (admin) → Click "Connect"

### Thêm Ứng Cử Viên (Admin Only):
1. Nhập tên ứng cử viên
2. Click "Add Candidate"
3. MetaMask sẽ yêu cầu xác nhận → Click "Confirm"

### Bắt Đầu Bỏ Phiếu:
1. Click nút "Start Voting"
2. Xác nhận giao dịch

### Bỏ Phiếu:
1. Chuyển sang tài khoản voter (accounts[1], [2], ...)
2. Click "Connect MetaMask" để kết nối tài khoản mới
3. Nhấn nút "Vote" cho ứng cử viên ưa thích
4. Xác nhận giao dịch

### Xem Kết Quả:
- Số phiếu sẽ cập nhật thực tế sau mỗi phiếu bầu

## 🔍 KIỂM TRA GIAO DỊCH

### Qua Ganache:
1. Mở Ganache GUI hoặc CLI
2. Tab "Transactions" sẽ hiển thị tất cả giao dịch

### Qua Code:
Mở console browser (F12 → Console):
```javascript
// Kiểm tra contract address
console.log(votingContract.address);

// Lấy tất cả ứng cử viên
votingContract.getAllCandidates().then(console.log);
```

## ⚠️ CÁC LỖI THƯỜNG GẶP VÀ CÁCH FIX

### Lỗi 1: "Cannot find module 'truffle'"
```bash
npm install -g truffle
```

### Lỗi 2: "ECONNREFUSED - Connection refused"
- **Nguyên nhân**: Ganache không chạy
- **Giải pháp**: Khởi động Ganache trước

### Lỗi 3: "Only admin can call this function"
- **Nguyên nhân**: Không phải admin
- **Giải pháp**: Import private key của tài khoản admin

### Lỗi 4: "Contract address is invalid"
- **Nguyên nhân**: Địa chỉ contract không đúng
- **Giải pháp**: Deploy lại: `truffle migrate --reset --network development`

### Lỗi 5: "You have already voted"
- **Nguyên nhân**: Ví đã bầu chọn
- **Giải pháp**: Dùng ví khác hoặc reset voting

## 📊 TEST SMART CONTRACT

```bash
truffle test
```

Kết quả sẽ hiển thị:
```
  Voting
    ✓ should initialize with correct admin
    ✓ should add a candidate
    ✓ should not allow non-admin to add candidates
    ✓ should start voting
    ✓ should cast vote for a candidate
    ✓ should not allow double voting
    ✓ should return all candidates
    ✓ should check if voter has voted
    ✓ should end voting
    ✓ should not allow voting when voting is inactive

  10 passing (234ms)
```

## 🎉 HOÀN TẤT!

Bây giờ bạn đã có một Voting DApp hoàn chỉnh! 

**Các tính năng chính:**
✅ Admin có thể thêm ứng cử viên
✅ Admin có thể bắt đầu/kết thúc bỏ phiếu
✅ Cử tri có thể bầu chọn
✅ Mỗi ví chỉ bầu một lần
✅ Hiển thị kết quả thực tế
✅ Giao diện đẹp mắt
✅ Kết nối MetaMask

---

**Cần Giúp Đỡ?** Xem README.md hoặc troubleshooting ở trên!
