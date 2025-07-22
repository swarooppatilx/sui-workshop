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
      alert('CONNECT YOUR WALLET FIRST.');
      return;
    }

    if (!packageId.trim() || !mintForm.customerId.trim() || !mintForm.imageUrl.trim()) {
      alert('ALL FIELDS ARE REQUIRED.');
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
      alert('NFT MINTED SUCCESSFULLY!');
      setMintForm({ customerId: '', imageUrl: '' });
    } catch (err) {
      console.error('Minting failed:', err);
      alert(`MINTING FAILED: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>SUI NFT MINTER</h1>

      <div className="card">
        <div>
          <ConnectButton />
          {currentAccount && (
            <p className="wallet-address">
              CONNECTED WALLET: <strong>{currentAccount.address}</strong>
            </p>
          )}
        </div>

        <div className="input-group">
          <label>MOVE PACKAGE ID</label>
          <input
            type="text"
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
            placeholder="ENTER MOVE PACKAGE ID"
            disabled={!currentAccount}
          />
        </div>

        <div className="input-group">
          <label>RECIPIENT WALLET ADDRESS</label>
          <input
            type="text"
            name="customerId"
            value={mintForm.customerId}
            onChange={handleInputChange}
            placeholder="ENTER WALLET ADDRESS"
            disabled={!currentAccount}
          />
        </div>

        <div className="input-group">
          <label>IMAGE URL FOR NFT</label>
          <input
            type="text"
            name="imageUrl"
            value={mintForm.imageUrl}
            onChange={handleInputChange}
            placeholder="ENTER IMAGE URL"
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
          {loading ? 'MINTING...' : 'MINT NFT'}
        </button>
      </div>
    </div>
  );
}
