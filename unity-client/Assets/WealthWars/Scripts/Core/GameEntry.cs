using UnityEngine;

namespace WealthWars.Core {
    public class GameEntry : MonoBehaviour {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void Bootstrap() {
            // Unity 2023+ deprecates FindObjectOfType<T>(); prefer FindFirstObjectByType / FindAnyObjectByType.
            GameManager existing = null;
#if UNITY_2023_1_OR_NEWER
            // Try fastest acceptable first (any instance), fallback to first explicit if needed
            existing = Object.FindAnyObjectByType<GameManager>();
            if (existing == null)
                existing = Object.FindFirstObjectByType<GameManager>();
#else
            existing = Object.FindObjectOfType<GameManager>();
#endif
            if (existing == null) {
                var go = new GameObject("GameManager");
                go.AddComponent<GameManager>();
                Debug.Log("[WealthWars] GameManager created");
            }
        }
    }
}
