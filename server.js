const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// Initialize data.json if it doesn't exist
const initializeDataFile = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      transactions: [],
      statistics: {
        totalVotes: 0,
        totalCandidates: 0,
        uniqueVoters: [],
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log('✅ data.json created successfully');
  }
};

// Read current data from data.json
const readData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const rawData = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error('Error reading data.json:', error);
  }
  return {
    transactions: [],
    statistics: {
      totalVotes: 0,
      totalCandidates: 0,
      uniqueVoters: [],
    },
  };
};

// Write data to data.json
const writeData = (data) => {
  try {
    // Recalculate statistics from transactions
    const votes = data.transactions.filter(tx => tx.txType === 'vote');
    const candidates = data.transactions.filter(tx => tx.txType === 'addCandidate');
    const uniqueVoters = [...new Set(votes.map(tx => tx.userAddress))];

    // Update statistics
    data.statistics = {
      totalVotes: votes.length,
      totalCandidates: candidates.length,
      uniqueVoters: uniqueVoters,
    };

    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`✅ data.json updated: ${data.transactions.length} transactions, ${data.statistics.totalVotes} votes`);
    return true;
  } catch (error) {
    console.error('Error writing to data.json:', error);
    return false;
  }
};

// API: Save transaction before blockchain
app.post('/api/save-transaction', (req, res) => {
  try {
    const { txType, userAddress, details } = req.body;

    if (!txType || !userAddress) {
      return res.status(400).json({ error: 'Missing txType or userAddress' });
    }

    const data = readData();

    // Create pending transaction record (before blockchain)
    const pendingTransaction = {
      txHash: 'pending_' + Date.now(),
      txType,
      userAddress,
      timestamp: new Date().toISOString(),
      blockNumber: null,
      gasUsed: null,
      encodedData: null,
      details,
    };

    data.transactions.push(pendingTransaction);
    writeData(data);

    res.json({
      success: true,
      message: 'Transaction saved to data.json',
      transaction: pendingTransaction,
    });
  } catch (error) {
    console.error('Error saving transaction:', error);
    res.status(500).json({ error: 'Failed to save transaction' });
  }
});

// API: Update transaction with blockchain info
app.post('/api/update-transaction', (req, res) => {
  try {
    const { pendingTxHash, txHash, blockNumber, gasUsed, encodedData } = req.body;

    if (!pendingTxHash || !txHash) {
      return res.status(400).json({ error: 'Missing txHash' });
    }

    const data = readData();

    // Find and update the pending transaction
    const txIndex = data.transactions.findIndex(tx => tx.txHash === pendingTxHash);

    if (txIndex === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update with blockchain info - keep only confirmed transaction format
    data.transactions[txIndex] = {
      txHash,
      txType: data.transactions[txIndex].txType,
      userAddress: data.transactions[txIndex].userAddress,
      timestamp: data.transactions[txIndex].timestamp,
      blockNumber: parseInt(blockNumber),
      gasUsed: gasUsed.toString(),
      encodedData: encodedData || null,
      details: data.transactions[txIndex].details,
    };

    writeData(data);

    res.json({
      success: true,
      message: 'Transaction updated in data.json',
      transaction: data.transactions[txIndex],
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// API: Get all transactions
app.get('/api/transactions', (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (error) {
    console.error('Error reading transactions:', error);
    res.status(500).json({ error: 'Failed to read transactions' });
  }
});

// API: Clear all data
app.post('/api/clear-data', (req, res) => {
  try {
    const initialData = {
      transactions: [],
      statistics: {
        totalVotes: 0,
        totalCandidates: 0,
        uniqueVoters: [],
      },
      clearedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    writeData(initialData);
    res.json({ success: true, message: 'All data cleared' });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

// Initialize data file on startup
initializeDataFile();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Data file: ${DATA_FILE}`);
});
