# SUI NFT Minter

This is a simple NFT Minter built on the SUI Testnet. It was developed as part of a hands-on workshop conducted by the IOIT ACM Student Chapter to help participants learn about SUI blockchain, NFT minting, and integrating wallets with a React frontend.

## Features

- Connect SUI wallet using Mysten Labs DappKit
- Mint NFTs with custom image URLs and recipient wallet addresses
- Estimate gas fees before minting
- View and explore your minted NFTs on Suivision Explorer
- Minimal UI with a neo-brutalist design

## Getting Started

### Prerequisites

- Node.js and npm installed
- Access to a SUI testnet wallet

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/swarooppatilx/sui-workshop.git
   cd sui-nft-minter
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the app at:

   ```
   http://localhost:5173
   ```

## Usage

1. Connect your wallet
2. Enter the package ID of your deployed contract
3. Fill in the recipient address and image URL
4. Estimate gas (optional)
5. Mint the NFT
6. View your NFTs under the "My NFTs" tab, with direct links to Suivision Explorer

## Deployment

To build for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```
