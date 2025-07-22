import { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import {
  useSignAndExecuteTransaction,
  ConnectButton,
  useCurrentAccount
} from '@mysten/dapp-kit';
import './App.css';

export default function App() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [packageId, setPackageId] = useState('');
  const [loading, setLoading] = useState(false);
  const [mintForm, setMintForm] = useState({
    customerId: '',
    imageUrl: ''
  });

  const handleInputChange = (e) => {
    setMintForm({ ...mintForm, [e.target.name]: e.target.value });
  };

  const handleMint = async () => {
    if (!currentAccount) {
      alert('Connect your wallet first.');
      return;
    }

    if (!packageId.trim() || !mintForm.customerId.trim() || !mintForm.imageUrl.trim()) {
      alert('Please fill all fields before minting.');
      return;
    }

    try {
      setLoading(true);
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::loyalty_card::mint_loyalty`,
        arguments: [
          tx.pure.address(mintForm.customerId),
          tx.pure.string(mintForm.imageUrl)
        ]
      });

      await signAndExecute({ transaction: tx });
      alert('NFT Minted Successfully!');
      setMintForm({ customerId: '', imageUrl: '' });
    } catch (err) {
      console.error('Minting failed:', err);
      alert(`Minting failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>SUI NFT Minter</h1>

      <div className="card">
        <ConnectButton />

        {currentAccount && (
          <p className="wallet-address">Connected Wallet: <strong>{currentAccount.address}</strong></p>
        )}

        <div className="input-group">
          <label>Move Package ID</label>
          <input
            type="text"
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
            placeholder="Enter Move Package ID"
            disabled={!currentAccount}
          />
        </div>

        <div className="input-group">
          <label>Recipient Wallet Address</label>
          <input
            type="text"
            name="customerId"
            value={mintForm.customerId}
            onChange={handleInputChange}
            placeholder="Enter Wallet Address"
            disabled={!currentAccount}
          />
        </div>

        <div className="input-group">
          <label>Image URL for NFT</label>
          <input
            type="text"
            name="imageUrl"
            value={mintForm.imageUrl}
            onChange={handleInputChange}
            placeholder="Enter Image URL"
            disabled={!currentAccount}
          />
          {mintForm.imageUrl && (
            <div className="image-preview">
              <img src={mintForm.imageUrl} alt="NFT Preview" />
            </div>
          )}
        </div>

        <button
          onClick={handleMint}
          disabled={
            loading ||
            !currentAccount ||
            !packageId.trim() ||
            !mintForm.customerId.trim() ||
            !mintForm.imageUrl.trim()
          }
        >
          {loading ? 'Minting...' : 'Mint NFT'}
        </button>
      </div>
    </div>
  );
}
