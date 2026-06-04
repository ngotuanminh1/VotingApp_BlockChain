import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import VotingABI from './VotingABI.json';

const VOTING_CONTRACT_ADDRESS = '0xF575D703D2D5dE94EBC5e44f771Cf68180a22c36';
const LOCAL_STORAGE_KEY = 'votingData';

function App() {
  // Basic states
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [votingContract, setVotingContract] = useState(null);
  const [votingActive, setVotingActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Position & Candidate states
  const [positions, setPositions] = useState([]);
  const [selectedPositionId, setSelectedPositionId] = useState(null);
  const [candidatesByPosition, setCandidatesByPosition] = useState({});
  const [userVotesByPosition, setUserVotesByPosition] = useState({});
  
  // Admin form states
  const [newPositionName, setNewPositionName] = useState('');
  const [newCandidateName, setNewCandidateName] = useState('');
  const [selectedPositionForCandidate, setSelectedPositionForCandidate] = useState(null);

  // Results state
  const [showResults, setShowResults] = useState(false);

  // Transaction & stats states
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [votingStats, setVotingStats] = useState({
    totalVotes: 0,
    totalCandidates: 0,
    uniqueVoters: new Set(),
  });

  // Load transaction history on mount
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setTransactionHistory(data.transactions || []);
        setVotingStats({
          totalVotes: data.statistics?.totalVotes || 0,
          totalCandidates: data.statistics?.totalCandidates || 0,
          uniqueVoters: new Set(data.statistics?.uniqueVoters || []),
        });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save transaction to backend
  const saveTransactionBeforeBlockchain = async (txType, userAddress, details) => {
    try {
      const response = await fetch('http://localhost:5000/api/save-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txType, userAddress, details }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Transaction saved to data.json:', result.transaction);
        return result.transaction.txHash;
      }
    } catch (error) {
      console.error('Error saving transaction to backend:', error);
      setMessage('⚠️ Cảnh báo: Không lưu được vào data.json');
      return null;
    }
  };

  // Update transaction with blockchain info
  const updateTransactionWithBlockchainInfo = async (pendingTxHash, txHash, blockNumber, gasUsed, encodedData) => {
    try {
      const response = await fetch('http://localhost:5000/api/update-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingTxHash, txHash, blockNumber, gasUsed, encodedData }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Transaction updated in data.json');
      }
    } catch (error) {
      console.error('Error updating transaction in backend:', error);
    }
  };

  // Save to localStorage
  const saveToLocalStorage = (newTransaction = null) => {
    const dataToSave = {
      transactions: newTransaction ? [...transactionHistory, newTransaction] : transactionHistory,
      statistics: {
        totalVotes: votingStats.totalVotes,
        totalCandidates: votingStats.totalCandidates,
        uniqueVoters: Array.from(votingStats.uniqueVoters),
      },
      lastUpdated: new Date().toISOString(),
    };

    if (newTransaction) {
      setTransactionHistory([...transactionHistory, newTransaction]);
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  };

  // Create transaction record
  const createTransactionRecord = async (txHash, txType, userAddress, details, tx = null) => {
    let blockNumber = null;
    let gasUsed = null;
    let encodedData = null;

    if (tx) {
      try {
        const receipt = await provider.getTransactionReceipt(txHash);
        if (receipt) {
          blockNumber = receipt.blockNumber;
          gasUsed = receipt.gasUsed.toString();
        }
        const fullTx = await provider.getTransaction(txHash);
        if (fullTx) {
          encodedData = fullTx.data;
        }
      } catch (error) {
        console.error('Error fetching transaction details:', error);
      }
    }

    return {
      txHash,
      txType,
      userAddress,
      timestamp: new Date().toISOString(),
      blockNumber,
      gasUsed,
      encodedData,
      details,
    };
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Vui lòng cài đặt MetaMask!');
        return;
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x539') {
        alert('❌ Lỗi: MetaMask không kết nối Ganache!');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);
      setProvider(provider);
      setSigner(signer);

      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VotingABI, signer);
      setVotingContract(contract);

      const adminAddress = await contract.admin();
      setIsAdmin(adminAddress.toLowerCase() === address.toLowerCase());

      await loadVotingData(contract, address);
      setMessage('✅ Kết nối thành công');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setMessage('❌ Lỗi kết nối: ' + error.message);
    }
  };

  // Load voting data
  const loadVotingData = async (contract, userAddress) => {
    try {
      setLoading(true);

      // Load positions
      const positionsCount = await contract.getPositionsCount();
      const positionsData = [];
      const candidatesData = {};
      const userVotes = {};

      for (let i = 1; i <= positionsCount; i++) {
        const [id, name, candidateCount] = await contract.getPosition(i);
        positionsData.push({ id: parseInt(id), name, candidateCount: parseInt(candidateCount) });

        // Load candidates for this position
        const positionCandidates = await contract.getCandidatesByPosition(i);
        candidatesData[i] = positionCandidates.map(c => ({
          id: parseInt(c.id),
          positionId: parseInt(c.positionId),
          name: c.name,
          voteCount: parseInt(c.voteCount),
        }));

        // Check if user voted for this position
        const hasVoted = await contract.hasVotedForPosition(userAddress, i);
        userVotes[i] = hasVoted;
      }

      setPositions(positionsData);
      setCandidatesByPosition(candidatesData);
      setUserVotesByPosition(userVotes);

      const isActive = await contract.votingActive();
      setVotingActive(isActive);

      if (positionsData.length > 0) {
        setSelectedPositionId(positionsData[0].id);
      }

      setMessage('✅ Dữ liệu đã tải');
    } catch (error) {
      console.error('Error loading voting data:', error);
      setMessage('❌ Lỗi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (votingContract && account) {
      loadVotingData(votingContract, account);
    }
  }, [votingContract, account]);

  // Add position (Admin)
  const handleAddPosition = async (e) => {
    e.preventDefault();
    if (!votingContract || !isAdmin) {
      setMessage('❌ Chỉ quản trị viên mới có thể thêm chức vụ');
      return;
    }

    if (!newPositionName.trim()) {
      setMessage('⚠️ Vui lòng nhập tên chức vụ');
      return;
    }

    try {
      setLoading(true);
      setMessage('💾 Lưu vào data.json...');
      
      const pendingTxHash = await saveTransactionBeforeBlockchain('addPosition', account, {
        positionName: newPositionName
      });

      setMessage('⏳ Gửi transaction...');
      const tx = await votingContract.addPosition(newPositionName);
      const receipt = await tx.wait();

      setMessage('🔄 Cập nhật blockchain info...');
      const fullTx = await provider.getTransaction(receipt.hash);
      await updateTransactionWithBlockchainInfo(
        pendingTxHash,
        receipt.hash,
        receipt.blockNumber,
        receipt.gasUsed.toString(),
        fullTx?.data || null
      );

      const txRecord = await createTransactionRecord(
        receipt.hash,
        'addPosition',
        account,
        { positionName: newPositionName },
        tx
      );

      saveToLocalStorage(txRecord);
      setNewPositionName('');
      setMessage('✅ Chức vụ đã được thêm');
      await loadVotingData(votingContract, account);
    } catch (error) {
      console.error('Error adding position:', error);
      setMessage('❌ Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add candidate to position (Admin)
  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!votingContract || !isAdmin) {
      setMessage('❌ Chỉ quản trị viên mới có thể thêm ứng cử viên');
      return;
    }

    if (!selectedPositionForCandidate) {
      setMessage('⚠️ Vui lòng chọn chức vụ');
      return;
    }

    if (!newCandidateName.trim()) {
      setMessage('⚠️ Vui lòng nhập tên ứng cử viên');
      return;
    }

    try {
      setLoading(true);
      setMessage('💾 Lưu vào data.json...');

      const pendingTxHash = await saveTransactionBeforeBlockchain('addCandidate', account, {
        positionId: selectedPositionForCandidate.toString(),
        candidateName: newCandidateName
      });

      setMessage('⏳ Gửi transaction...');
      const tx = await votingContract.addCandidate(selectedPositionForCandidate, newCandidateName);
      const receipt = await tx.wait();

      setMessage('🔄 Cập nhật blockchain info...');
      const fullTx = await provider.getTransaction(receipt.hash);
      await updateTransactionWithBlockchainInfo(
        pendingTxHash,
        receipt.hash,
        receipt.blockNumber,
        receipt.gasUsed.toString(),
        fullTx?.data || null
      );

      const txRecord = await createTransactionRecord(
        receipt.hash,
        'addCandidate',
        account,
        { positionId: selectedPositionForCandidate.toString(), candidateName: newCandidateName },
        tx
      );

      saveToLocalStorage(txRecord);
      setNewCandidateName('');
      setMessage('✅ Ứng cử viên đã được thêm');
      await loadVotingData(votingContract, account);
    } catch (error) {
      console.error('Error adding candidate:', error);
      setMessage('❌ Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Vote
  const handleVote = async (candidateId) => {
    if (!votingContract) {
      setMessage('❌ Vui lòng kết nối ví');
      return;
    }

    if (!votingActive) {
      setMessage('❌ Bầu cử không hoạt động');
      return;
    }

    if (userVotesByPosition[selectedPositionId]) {
      setMessage('❌ Bạn đã bầu cử cho chức vụ này');
      return;
    }

    try {
      setLoading(true);
      setMessage('💾 Lưu vào data.json...');

      const pendingTxHash = await saveTransactionBeforeBlockchain('vote', account, {
        positionId: selectedPositionId.toString(),
        candidateId: candidateId.toString()
      });

      setMessage('⏳ Gửi transaction...');
      const tx = await votingContract.vote(selectedPositionId, candidateId);
      const receipt = await tx.wait();

      setMessage('🔄 Cập nhật blockchain info...');
      const fullTx = await provider.getTransaction(receipt.hash);
      await updateTransactionWithBlockchainInfo(
        pendingTxHash,
        receipt.hash,
        receipt.blockNumber,
        receipt.gasUsed.toString(),
        fullTx?.data || null
      );

      const txRecord = await createTransactionRecord(
        receipt.hash,
        'vote',
        account,
        { positionId: selectedPositionId.toString(), candidateId: candidateId.toString() },
        tx
      );

      saveToLocalStorage(txRecord);

      setUserVotesByPosition({ ...userVotesByPosition, [selectedPositionId]: true });
      setVotingStats({
        ...votingStats,
        totalVotes: votingStats.totalVotes + 1,
      });

      setMessage('✅ Bầu cử thành công!');
      await loadVotingData(votingContract, account);
    } catch (error) {
      console.error('Error voting:', error);
      setMessage('❌ Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Start voting
  const handleStartVoting = async () => {
    if (!votingContract || !isAdmin) {
      setMessage('❌ Chỉ quản trị viên mới có thể bắt đầu');
      return;
    }

    try {
      setLoading(true);
      setMessage('💾 Lưu vào data.json...');

      const pendingTxHash = await saveTransactionBeforeBlockchain('startVoting', account, {
        action: 'start_voting'
      });

      setMessage('⏳ Gửi transaction...');
      const tx = await votingContract.startVoting();
      const receipt = await tx.wait();

      setMessage('🔄 Cập nhật blockchain info...');
      const fullTx = await provider.getTransaction(receipt.hash);
      await updateTransactionWithBlockchainInfo(
        pendingTxHash,
        receipt.hash,
        receipt.blockNumber,
        receipt.gasUsed.toString(),
        fullTx?.data || null
      );

      const txRecord = await createTransactionRecord(receipt.hash, 'startVoting', account, { action: 'start_voting' }, tx);
      saveToLocalStorage(txRecord);

      setMessage('✅ Bầu cử đã bắt đầu');
      await loadVotingData(votingContract, account);
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // End voting
  const handleEndVoting = async () => {
    if (!votingContract || !isAdmin) {
      setMessage('❌ Chỉ quản trị viên mới có thể kết thúc');
      return;
    }

    try {
      setLoading(true);
      setMessage('💾 Lưu vào data.json...');

      const pendingTxHash = await saveTransactionBeforeBlockchain('endVoting', account, {
        action: 'end_voting'
      });

      setMessage('⏳ Gửi transaction...');
      const tx = await votingContract.endVoting();
      const receipt = await tx.wait();

      setMessage('🔄 Cập nhật blockchain info...');
      const fullTx = await provider.getTransaction(receipt.hash);
      await updateTransactionWithBlockchainInfo(
        pendingTxHash,
        receipt.hash,
        receipt.blockNumber,
        receipt.gasUsed.toString(),
        fullTx?.data || null
      );

      const txRecord = await createTransactionRecord(receipt.hash, 'endVoting', account, { action: 'end_voting' }, tx);
      saveToLocalStorage(txRecord);

      setMessage('✅ Bầu cử đã kết thúc');
      await loadVotingData(votingContract, account);
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Export/Import JSON
  const handleExportJSON = () => {
    const dataToExport = {
      transactions: transactionHistory,
      statistics: {
        totalVotes: votingStats.totalVotes,
        totalCandidates: votingStats.totalCandidates,
        uniqueVoters: Array.from(votingStats.uniqueVoters),
      },
      exportedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voting-data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    if (window.confirm('Xóa tất cả lịch sử?')) {
      setTransactionHistory([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setMessage('✅ Đã xóa lịch sử');
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🗳️ Hệ thống bầu cử chức vụ</h1>
        <div className="header-info">
          {account ? (
            <div className="account-info">
              <span>Đã kết nối: {account.substring(0, 6)}...{account.substring(38)}</span>
              {isAdmin && <span className="admin-badge">Quản trị viên</span>}
            </div>
          ) : (
            <button onClick={connectWallet} className="connect-btn">
              Kết nối MetaMask
            </button>
          )}
        </div>
      </header>

      {message && (
        <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {account ? (
        <div className="container">
          {/* Admin Panel */}
          {isAdmin && (
            <div className="admin-panel">
              <h2>🔐 Bảng quản trị</h2>
              
              {/* Add Position */}
              <div className="admin-section">
                <h3>Thêm chức vụ</h3>
                <form onSubmit={handleAddPosition}>
                  <input
                    type="text"
                    value={newPositionName}
                    onChange={(e) => setNewPositionName(e.target.value)}
                    placeholder="Nhập tên chức vụ (vd: Bí Thư)"
                    disabled={loading || votingActive}
                  />
                  <button type="submit" disabled={loading || votingActive}>
                    ➕ Thêm chức vụ
                  </button>
                </form>
              </div>

              {/* Add Candidate */}
              <div className="admin-section">
                <h3>Thêm ứng cử viên</h3>
                <form onSubmit={handleAddCandidate}>
                  <select
                    value={selectedPositionForCandidate || ''}
                    onChange={(e) => setSelectedPositionForCandidate(parseInt(e.target.value) || null)}
                    disabled={loading || votingActive}
                  >
                    <option value="">-- Chọn chức vụ --</option>
                    {positions.map(pos => (
                      <option key={pos.id} value={pos.id}>{pos.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                    placeholder="Tên ứng cử viên"
                    disabled={loading || votingActive || !selectedPositionForCandidate}
                  />
                  <button type="submit" disabled={loading || votingActive || !selectedPositionForCandidate}>
                    👤 Thêm ứng cử viên
                  </button>
                </form>
              </div>

              {/* Voting Controls */}
              <div className="admin-section">
                <h3>Điều khiển bầu cử</h3>
                <div className="voting-controls">
                  {!votingActive ? (
                    <button onClick={handleStartVoting} disabled={loading} className="btn-start">
                      ▶️ Bắt đầu bầu cử
                    </button>
                  ) : (
                    <button onClick={handleEndVoting} disabled={loading} className="btn-end">
                      ⏹️ Kết thúc bầu cử
                    </button>
                  )}
                </div>
                <p className="status">
                  {votingActive ? '✅ ĐANG HOẠT ĐỘNG' : '❌ KHÔNG HOẠT ĐỘNG'}
                </p>
              </div>

              {/* Admin Tools */}
              <div className="admin-section">
                <h3>⚙️ Công cụ</h3>
                <div className="tools-buttons">
                  <button onClick={handleExportJSON} className="btn-tool btn-export">
                    📥 Xuất JSON
                  </button>
                  <button onClick={handleClearHistory} className="btn-tool btn-danger">
                    🗑️ Xóa lịch sử
                  </button>
                  <button 
                    onClick={() => setShowTransactionHistory(!showTransactionHistory)}
                    className="btn-tool"
                  >
                    {showTransactionHistory ? '▼ Ẩn' : '▶ Xem'} Lịch sử ({transactionHistory.length})
                  </button>
                </div>
              </div>

              {/* Transaction History */}
              {showTransactionHistory && (
                <div className="transaction-history">
                  <h3>📝 Lịch sử giao dịch</h3>
                  {transactionHistory.length === 0 ? (
                    <p>Chưa có giao dịch</p>
                  ) : (
                    <div className="table-wrapper">
                      <table className="transactions-table">
                        <thead>
                          <tr>
                            <th>Loại</th>
                            <th>Hash</th>
                            <th>Người gửi</th>
                            <th>Thời gian</th>
                            <th>Block</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactionHistory.map((tx, idx) => (
                            <tr key={idx}>
                              <td><span className={`badge badge-${tx.txType}`}>{tx.txType}</span></td>
                              <td><code>{tx.txHash.substring(0, 10)}...</code></td>
                              <td><code>{tx.userAddress.substring(0, 6)}...{tx.userAddress.substring(38)}</code></td>
                              <td>{new Date(tx.timestamp).toLocaleString('vi-VN')}</td>
                              <td>{tx.blockNumber || 'Pending'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Voting Section */}
          <div className="voting-section">
            <h2>🗳️ Các chức vụ</h2>

            {positions.length === 0 ? (
              <p className="no-positions">Chưa có chức vụ nào</p>
            ) : (
              <>
                {/* Position Tabs */}
                <div className="position-tabs">
                  {positions.map(position => (
                    <button
                      key={position.id}
                      className={`position-tab ${selectedPositionId === position.id ? 'active' : ''}`}
                      onClick={() => setSelectedPositionId(position.id)}
                      disabled={!votingActive}
                    >
                      {position.name}
                      {userVotesByPosition[position.id] && <span className="voted-badge">✓</span>}
                    </button>
                  ))}
                </div>

                {/* Candidates for Selected Position */}
                {selectedPositionId && (
                  <div className="candidates-section">
                    <h3>{positions.find(p => p.id === selectedPositionId)?.name}</h3>
                    
                    {!votingActive && (
                      <p className="voting-inactive">⚠️ Bầu cử chưa bắt đầu</p>
                    )}

                    {votingActive && userVotesByPosition[selectedPositionId] && (
                      <p className="already-voted">✅ Bạn đã bầu cử cho chức vụ này</p>
                    )}

                    {votingActive && !userVotesByPosition[selectedPositionId] && (
                      <div className="candidates-grid">
                        {(candidatesByPosition[selectedPositionId] || []).map(candidate => (
                          <div key={candidate.id} className="candidate-card">
                            <div className="candidate-name">{candidate.name}</div>
                            <button
                              onClick={() => handleVote(candidate.id)}
                              disabled={loading || userVotesByPosition[selectedPositionId]}
                              className="vote-btn"
                            >
                              {userVotesByPosition[selectedPositionId] ? '✓ Đã bầu' : 'Bầu cử'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {!votingActive && !isAdmin && (
                      <div className="candidates-grid">
                        {(candidatesByPosition[selectedPositionId] || []).map(candidate => (
                          <div key={candidate.id} className="candidate-card">
                            <div className="candidate-name">{candidate.name}</div>
                            <div className="vote-count">{candidate.voteCount} phiếu</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!votingActive && isAdmin && (
                      <div className="candidates-grid">
                        {(candidatesByPosition[selectedPositionId] || []).map(candidate => (
                          <div key={candidate.id} className="candidate-card">
                            <div className="candidate-name">{candidate.name}</div>
                            <div className="vote-count">{candidate.voteCount} phiếu</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Stats for Admin during voting */}
          {isAdmin && votingActive && positions.length > 0 && (
            <div className="voting-stats">
              <h3>📊 Thống kê (Admin)</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <span>Tổng phiếu:</span>
                  <span className="stat-value">{votingStats.totalVotes}</span>
                </div>
                <div className="stat-card">
                  <span>Chức vụ:</span>
                  <span className="stat-value">{positions.length}</span>
                </div>
                <div className="stat-card">
                  <span>Cử tri duy nhất:</span>
                  <span className="stat-value">{votingStats.uniqueVoters.size}</span>
                </div>
              </div>
            </div>
          )}

          {/* Stats - For Admin Only - Hiển thị khi bầu cử kết thúc */}
          {isAdmin && !votingActive && positions.length > 0 && (
            <div className="voting-stats">
              <h3>📊 Thống kê</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <span>Tổng phiếu:</span>
                  <span className="stat-value">{votingStats.totalVotes}</span>
                </div>
                <div className="stat-card">
                  <span>Chức vụ:</span>
                  <span className="stat-value">{positions.length}</span>
                </div>
                <div className="stat-card">
                  <span>Cử tri duy nhất:</span>
                  <span className="stat-value">{votingStats.uniqueVoters.size}</span>
                </div>
              </div>
            </div>
          )}

          {/* Results Section - For All Users - Hiển thị khi bầu cử kết thúc */}
          {!votingActive && positions.length > 0 && votingStats.totalVotes > 0 && (
            <div className="results-section">
              <div className="results-header">
                <h2>📈 Kết quả bầu cử</h2>
                {isAdmin && (
                  <button 
                    onClick={() => setShowResults(!showResults)}
                    className="btn-toggle-results"
                  >
                    {showResults ? '▼ Ẩn kết quả' : '▶ Xem kết quả'}
                  </button>
                )}
              </div>

              {(isAdmin ? showResults : true) && (
                <div className="results-content">
                  {positions.map(position => {
                    const positionCandidates = candidatesByPosition[position.id] || [];
                    const maxVotes = positionCandidates.length > 0 
                      ? Math.max(...positionCandidates.map(c => c.voteCount))
                      : 0;

                    return (
                      <div key={position.id} className="position-result">
                        <h3 className="position-name">{position.name}</h3>
                        
                        {positionCandidates.length === 0 ? (
                          <p className="no-candidates">Chức vụ này không có ứng cử viên</p>
                        ) : (
                          <div className="results-ranking">
                            {positionCandidates
                              .sort((a, b) => b.voteCount - a.voteCount)
                              .map((candidate, rank) => {
                                const isWinner = candidate.voteCount === maxVotes && maxVotes > 0;
                                const percentage = votingStats.totalVotes > 0 
                                  ? ((candidate.voteCount / votingStats.totalVotes) * 100).toFixed(1)
                                  : 0;

                                return (
                                  <div 
                                    key={candidate.id} 
                                    className={`result-item ${isWinner ? 'winner' : ''}`}
                                  >
                                    <div className="result-rank">#{rank + 1}</div>
                                    <div className="result-info">
                                      <div className="result-name">
                                        {isWinner && '🏆 '}
                                        {candidate.name}
                                      </div>
                                      <div className="result-votes">
                                        {candidate.voteCount} phiếu ({percentage}%)
                                      </div>
                                    </div>
                                    <div className="result-bar">
                                      <div 
                                        className={`progress-bar ${isWinner ? 'winner-bar' : ''}`}
                                        style={{
                                          width: maxVotes > 0 
                                            ? `${(candidate.voteCount / maxVotes) * 100}%`
                                            : '0%'
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="connect-prompt">
          <h2>Chào mừng</h2>
          <p>Kết nối MetaMask để bầu cử</p>
          <button onClick={connectWallet} className="connect-btn-large">
            Kết nối MetaMask
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
