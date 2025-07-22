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
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!currentAccount) newErrors.wallet = 'Wallet not connected';
    if (!packageId.trim()) newErrors.packageId = 'Package ID required';
    if (!mintForm.customerId.trim()) newErrors.customerId = 'Recipient address required';
    if (!mintForm.imageUrl.trim()) newErrors.imageUrl = 'Image URL required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    setMintForm({ ...mintForm, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleMint = async () => {
    if (!validateForm()) return;

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
      showNotification('NFT minted successfully!');
      setMintForm({ customerId: '', imageUrl: '' });
      setPackageId('');
    } catch (err) {
      console.error('Minting failed:', err);
      showNotification(`Minting failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>SUI NFT MINTER</h1>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button className="close-notification" onClick={() => setNotification(null)}>
            ×
          </button>
        </div>
      )}

      <div className="card">
        <div className="wallet-section">
          <div className="connect-btn-wrapper">
            <ConnectButton className="custom-connect-button" />
          </div>
          {currentAccount && (
            <p className="wallet-address">
              CONNECTED: <span>{currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}</span>
            </p>
          )}
          {errors.wallet && <span className="error-message">{errors.wallet}</span>}
        </div>

        <div className="input-group">
          <label>PACKAGE ID</label>
          <input
            type="text"
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
            placeholder="0x..."
            disabled={!currentAccount}
            className={errors.packageId ? 'error' : ''}
          />
          {errors.packageId && <span className="error-message">{errors.packageId}</span>}
        </div>

        <div className="input-group">
          <label>RECIPIENT ADDRESS</label>
          <input
            type="text"
            name="customerId"
            value={mintForm.customerId}
            onChange={handleInputChange}
            placeholder="0x..."
            disabled={!currentAccount}
            className={errors.customerId ? 'error' : ''}
          />
          {errors.customerId && <span className="error-message">{errors.customerId}</span>}
        </div>

        <div className="input-group">
          <label>NFT IMAGE URL</label>
          <input
            type="text"
            name="imageUrl"
            value={mintForm.imageUrl}
            onChange={handleInputChange}
            placeholder="https://..."
            disabled={!currentAccount}
            className={errors.imageUrl ? 'error' : ''}
          />
          {errors.imageUrl && <span className="error-message">{errors.imageUrl}</span>}
          {mintForm.imageUrl && (
            <div className="image-preview">
              <img src={mintForm.imageUrl} alt="NFT Preview" />
              <div className="image-overlay">PREVIEW</div>
            </div>
          )}
        </div>

        <button
          onClick={handleMint}
          disabled={loading}
          className={loading ? 'loading' : ''}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              MINTING...
            </>
          ) : (
            'MINT NFT'
          )}
        </button>
      </div>
    </div>
  );
}