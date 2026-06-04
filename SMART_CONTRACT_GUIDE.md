# 📜 Hướng Dẫn Smart Contract - Voting.sol

## 🏗️ Cấu Trúc Contract

### State Variables (Biến Trạng Thái)

```solidity
// Mapping lưu ứng cử viên
mapping(uint => Candidate) public candidates;

// Mapping kiểm tra người đã bầu
mapping(address => bool) public voters;

// Tổng số ứng cử viên
uint public candidatesCount;

// Địa chỉ admin
address public admin;

// Trạng thái bỏ phiếu
bool public votingActive;
```

### Struct - Cấu Trúc Candidate

```solidity
struct Candidate {
    uint id;              // ID ứng cử viên
    string name;          // Tên ứng cử viên
    uint voteCount;       // Số phiếu bầu
}
```

### Events (Sự Kiện)

```solidity
// Khi thêm ứng cử viên
event CandidateAdded(uint indexed candidateId, string name);

// Khi bầu chọn
event VoteCasted(address indexed voter, uint indexed candidateId);

// Khi bắt đầu bỏ phiếu
event VotingStarted();

// Khi kết thúc bỏ phiếu
event VotingEnded();
```

## 🔐 Modifiers (Bộ Chỉnh Sửa)

### onlyAdmin
```solidity
modifier onlyAdmin() {
    require(msg.sender == admin, "Only admin can call this function");
    _;
}
```
- Kiểm tra xem caller có phải Admin không
- Chỉ Admin mới có thể gọi hàm này

### votingMustBeActive
```solidity
modifier votingMustBeActive() {
    require(votingActive, "Voting is not active");
    _;
}
```
- Kiểm tra xem voting có đang active không
- Chỉ có thể bầu khi voting active

## 📝 Các Hàm Chính

### 1. Constructor
```solidity
constructor() {
    admin = msg.sender;
    candidatesCount = 0;
    votingActive = false;
}
```
- Gọi khi deploy contract
- Thiết lập msg.sender (người deploy) làm admin

### 2. addCandidate(string memory _name)
```solidity
function addCandidate(string memory _name) public onlyAdmin
```

**Yêu cầu:**
- Chỉ Admin mới gọi được
- Voting phải không active

**Hành động:**
- Tăng candidatesCount lên 1
- Tạo Candidate struct mới
- Phát event CandidateAdded

**Ví dụ:**
```javascript
// Qua React
await votingContract.addCandidate("Nguyễn Văn A");

// Gas Cost: ~44,000 - 60,000 gas
```

### 3. startVoting()
```solidity
function startVoting() public onlyAdmin
```

**Yêu cầu:**
- Chỉ Admin gọi
- votingActive phải là false

**Hành động:**
- Đặt votingActive = true
- Phát event VotingStarted

**Ví dụ:**
```javascript
await votingContract.startVoting();
```

### 4. endVoting()
```solidity
function endVoting() public onlyAdmin
```

**Yêu cầu:**
- Chỉ Admin gọi
- votingActive phải là true

**Hành động:**
- Đặt votingActive = false
- Phát event VotingEnded

### 5. vote(uint _candidateId)
```solidity
function vote(uint _candidateId) public votingMustBeActive
```

**Yêu cầu:**
- votingActive phải là true
- Người gọi chưa bầu (voters[msg.sender] == false)
- candidateId phải hợp lệ

**Hành động:**
- Đặt voters[msg.sender] = true
- Tăng voteCount của candidate
- Phát event VoteCasted

**Ví dụ:**
```javascript
// Bầu cho candidate ID = 1
await votingContract.vote(1);

// Gas Cost: ~70,000 - 100,000 gas
```

### 6. getCandidate(uint _candidateId)
```solidity
function getCandidate(uint _candidateId) public view 
    returns (uint, string memory, uint)
```

**Trả về:**
- ID của candidate
- Tên candidate
- Số phiếu bầu

**Ví dụ:**
```javascript
const [id, name, voteCount] = await votingContract.getCandidate(1);
console.log(`${name}: ${voteCount} votes`);
```

### 7. getAllCandidates()
```solidity
function getAllCandidates() public view returns (Candidate[] memory)
```

**Trả về:**
- Array chứa tất cả candidates

**Ví dụ:**
```javascript
const candidates = await votingContract.getAllCandidates();
candidates.forEach(c => {
    console.log(`${c.name}: ${c.voteCount} votes`);
});
```

### 8. hasVoted(address _voter)
```solidity
function hasVoted(address _voter) public view returns (bool)
```

**Trả về:**
- true nếu _voter đã bầu
- false nếu chưa bầu

**Ví dụ:**
```javascript
const isVoted = await votingContract.hasVoted(userAddress);
if (isVoted) {
    console.log("Bạn đã bầu rồi");
}
```

## 🔄 Quy Trình Sử Dụng

### Quy Trình Bình Thường:

```
1. Admin Deploy Contract
   └─ votingActive = false

2. Admin Add Candidates (voting inactive)
   ├─ addCandidate("Candidate A")
   ├─ addCandidate("Candidate B")
   └─ addCandidate("Candidate C")

3. Admin Start Voting
   └─ votingActive = true

4. Voters Cast Votes (voting active)
   ├─ voter1.vote(1)
   ├─ voter2.vote(2)
   ├─ voter3.vote(1)
   └─ ... more votes ...

5. Admin End Voting
   └─ votingActive = false

6. View Results
   └─ getAllCandidates() để xem kết quả
```

## 📊 Ví Dụ Tương Tác Đầy Đủ

### Bước 1: Setup (trong React)
```javascript
import { ethers } from 'ethers';
import VotingABI from './VotingABI.json';

const contractAddress = '0x5FbDB2315678...';
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const votingContract = new ethers.Contract(
    contractAddress,
    VotingABI,
    signer
);
```

### Bước 2: Admin thêm ứng cử viên
```javascript
// Đảm bảo voting inactive
if (!await votingContract.votingActive()) {
    // Thêm ứng cử viên
    const tx = await votingContract.addCandidate("Alice");
    await tx.wait(); // Chờ transaction confirm
    console.log("✓ Candidate added");
}
```

### Bước 3: Bắt đầu bỏ phiếu
```javascript
const tx = await votingContract.startVoting();
await tx.wait();
console.log("✓ Voting started");
```

### Bước 4: Voter bầu chọn
```javascript
// Kiểm tra xem đã bầu chưa
const hasVoted = await votingContract.hasVoted(userAddress);
if (!hasVoted) {
    const tx = await votingContract.vote(1);
    await tx.wait();
    console.log("✓ Vote cast for candidate 1");
} else {
    console.log("✗ You have already voted");
}
```

### Bước 5: Xem kết quả
```javascript
const allCandidates = await votingContract.getAllCandidates();

allCandidates.forEach(candidate => {
    console.log(`${candidate.name}: ${candidate.voteCount} votes`);
});

// Output:
// Alice: 3 votes
// Bob: 2 votes
// Carol: 1 vote
```

## ⚡ Gas Estimates

```
Operation              | Gas Cost
-----------------------|----------
Deploy Contract        | ~400,000
Add Candidate          | ~45,000
Start Voting           | ~30,000
End Voting             | ~30,000
Cast Vote              | ~75,000
View Functions (free)  | 0
```

**Tổng Chi Phí Ví Dụ:**
```
1 Admin thêm 3 ứng cử viên: 3 × 45,000 = 135,000 gas
Start voting: 30,000 gas
10 Voters bầu chọn: 10 × 75,000 = 750,000 gas
End voting: 30,000 gas
────────────────────────────────────
Tổng: ~945,000 gas (≈ 0.019 ETH @2 gwei)
```

## 🔒 Bảo Mật

### Kiểm Tra được Thiết Lập:
✅ Chỉ Admin mới add candidates
✅ Chỉ Admin mới start/end voting
✅ Mỗi ví chỉ bầu một lần
✅ Chỉ được bầu khi voting active
✅ Kiểm tra candidateId hợp lệ

### Điểm Cần Lưu Ý:
- Không có cơ chế khôi phục vote
- Không có deadline tự động
- Không có whitelist voter (mở cho tất cả)

## 🧪 Testing

Chạy test:
```bash
truffle test
```

File test: `test/voting.test.js`

Test cases bao gồm:
- ✅ Constructor tests
- ✅ Add candidate tests
- ✅ Admin-only functions
- ✅ Voting lifecycle
- ✅ Vote casting
- ✅ Double vote prevention
- ✅ And more...

## 📚 Tài Liệu Solidity

- [Solidity Docs](https://docs.soliditylang.org/)
- [Ethereum Yellow Paper](https://ethereum.org/en/whitepaper/)
- [Truffle Docs](https://trufflesuite.com/docs/)

---

**Created for: Voting DApp Assignment** 🗳️
