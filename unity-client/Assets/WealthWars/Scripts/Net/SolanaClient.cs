using UnityEngine;

namespace WealthWars.Net {
    // Placeholder for future Solana RPC + WebSocket interactions
    public class SolanaClient {
        public bool Connected { get; private set; }
        public void Connect() {
            Connected = true; // TODO: real connection logic
            Debug.Log("[WealthWars] SolanaClient Connect() stub");
        }
    }
}
