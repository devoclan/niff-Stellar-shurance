// Mock for @creit.tech/stellar-wallets-kit
export const Networks = { TESTNET: 'Test SDF Network ; September 2015', PUBLIC: 'Public Global Stellar Network ; September 2015' };
export const KitEventType = { CONNECT: 'connect', DISCONNECT: 'disconnect' };
export const FREIGHTER_ID = 'freighter';
export const XBULL_ID = 'xbull';

export class StellarWalletsKit {
  constructor() {}
  openModal = jest.fn();
  closeModal = jest.fn();
  disconnect = jest.fn();
  getAddress = jest.fn().mockResolvedValue({ address: '' });
  signTransaction = jest.fn().mockResolvedValue({ signedTxXdr: '' });
  on = jest.fn();
  off = jest.fn();
}

export class FreighterModule {}
export class xBullModule {}
