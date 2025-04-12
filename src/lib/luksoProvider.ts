import { createClientUPProvider } from '@lukso/up-provider';

const provider = createClientUPProvider({
 // rpcUrl: 'https://rpc.l14.lukso.network', // Replace with your LUKSO RPC URL
  //chainId: 22, // Replace with your chain ID
    // Replace with your LUKSO chain ID
  url: 'https://rpc.l14.lukso.network', // Replace with your LUKSO RPC URL
  mode: 'iframe',
});

export default provider;