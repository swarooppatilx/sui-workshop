import { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import {
  useSignAndExecuteTransaction,
  ConnectButton,
  useCurrentAccount,
  useSuiClient
} from '@mysten/dapp-kit';
import './App.css';

export default function App() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [packageId, setPackageId] = useState('');
  const [loading, setLoading] = useState(false);
  const [mintForm, setMintForm] = useState({ customerId: '', imageUrl: '' });
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});
  const [myNFTs, setMyNFTs] = useState([]);
  const [gasEstimate, setGasEstimate] = useState(null);

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
      setGasEstimate(null);
      loadMyNFTs();
    } catch (err) {
      console.error('Minting failed:', err);
      showNotification(`Minting failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const estimateGas = async () => {
    if (!validateForm()) {
      showNotification('Fill all fields before estimating gas', 'error');
      return;
    }

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::loyalty_card::mint_loyalty`,
        arguments: [
          tx.pure.address(mintForm.customerId),
          tx.pure.string(mintForm.imageUrl)
        ]
      });

      const simulation = await suiClient.devInspectTransactionBlock({
        sender: currentAccount.address,
        transactionBlock: tx
      });

      const gasUsed = simulation.effects.gasUsed;
      setGasEstimate(gasUsed);
      showNotification('Gas estimated successfully!', 'info');
    } catch (err) {
      console.error('Gas estimation failed:', err);
      showNotification('Failed to estimate gas', 'error');
    }
  };

  const loadMyNFTs = async () => {
    if (!currentAccount) {
      showNotification('Connect your wallet first', 'error');
      return;
    }

    if (!packageId.trim()) {
      showNotification('Enter a valid package ID before loading NFTs.', 'error');
      return;
    }

    try {
      const objects = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: { StructType: `${packageId}::loyalty_card::Loyalty` },
        options: { showContent: true }
      });

      const nfts = objects.data.map(obj => {
        const content = obj.data?.content?.fields;
        return {
          id: obj.data?.objectId,
          customerId: content?.customer_id,
          imageUrl: content?.image_url
        };
      });

      setMyNFTs(nfts);
      if (nfts.length === 0) {
        showNotification('No NFTs found.', 'info');
      }
    } catch (err) {
      console.error('Failed to load NFTs:', err);
      showNotification('Failed to load NFTs', 'error');
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
              {' '}
              <a
                href={`https://testnet.suivision.xyz/account/${currentAccount.address}?tab=Assets`}
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-link"
              >
                [Explorer]
              </a>
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

        <button onClick={handleMint} disabled={loading} className={loading ? 'loading' : ''}>
          {loading ? (
            <>
              <span className="spinner"></span> MINTING...
            </>
          ) : (
            'MINT NFT'
          )}
        </button>

        <button onClick={estimateGas} disabled={!currentAccount}>
          ESTIMATE GAS
        </button>

        {gasEstimate && (
          <div className="gas-estimate">
            <p>Gas Computation: {gasEstimate.computationCost}</p>
            <p>Storage Cost: {gasEstimate.storageCost}</p>
            <p>Storage Rebate: {gasEstimate.storageRebate}</p>
          </div>
        )}

        <button onClick={loadMyNFTs} disabled={!currentAccount}>
          LOAD MY NFTs
        </button>
      </div>

      {myNFTs.length > 0 && (
        <div className="nft-gallery">
          <h2>My NFTs</h2>
          <div className="nft-grid">
            {myNFTs.map(nft => (
              <div key={nft.id} className="nft-card">
                <img src={nft.imageUrl} alt={`NFT ${nft.id}`} />
                <p>ID: {nft.id.slice(0, 6)}...{nft.id.slice(-4)}</p>
                <p>Owner: {nft.customerId.slice(0, 6)}...{nft.customerId.slice(-4)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
