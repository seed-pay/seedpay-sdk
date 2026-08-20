export const ProcessedEvent = {
  type: 'event',
  name: 'Processed',
  inputs: [
    { name: 'id', type: 'bytes16', indexed: true },
    { name: 'token', type: 'address', indexed: true },
    { name: 'recipient', type: 'address', indexed: true },
    { name: 'affiliate', type: 'address' },
    { name: 'intentAmount', type: 'uint256' },
    { name: 'recipientAmount', type: 'uint256' },
    { name: 'protocolAmount', type: 'uint256' },
    { name: 'affiliateAmount', type: 'uint256' },
    { name: 'srcChainId', type: 'uint32' },
    { name: 'srcAddress', type: 'bytes' },
    { name: 'status', type: 'uint8' },
  ],
} as const
