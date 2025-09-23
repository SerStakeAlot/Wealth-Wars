using UnityEngine;

namespace WealthWars.DesignTokens {
    // Basic ScriptableObject to hold imported token data (colors, motion, etc.)
    public class TokenRegistry : ScriptableObject {
        public string Version;
        public Color[] Palette;
    }
}
