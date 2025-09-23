using UnityEngine;
using WealthWars.DesignTokens;
using WealthWars.Net;
using WealthWars.Systems;

namespace WealthWars.Core {
    public class GameManager : MonoBehaviour {
        public static GameManager Instance { get; private set; }
        public TokenRegistry Tokens { get; private set; }
        public EconomySystem Economy { get; private set; }
        public SolanaClient Solana { get; private set; }

        private void Awake() {
            if (Instance != null) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Initialize();
        }

        private void Initialize() {
            Tokens = ScriptableObject.CreateInstance<TokenRegistry>();
            Economy = new EconomySystem();
            Solana = new SolanaClient();
            Debug.Log("[WealthWars] Core systems initialized");
        }
    }
}
