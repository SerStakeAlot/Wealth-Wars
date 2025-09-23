// This entire file is editor-only. At build time (player), this code is excluded.
#if UNITY_EDITOR
using System.IO;
using UnityEngine;
using UnityEditor;

namespace WealthWars.DesignTokens {
    public static class DesignTokenImporter {
        private const string DefaultRelativePath = "../apps/web/public/config/design-tokens.json";

    // Provide the menu in two places for convenience (top-level and under Tools)
    [MenuItem("WealthWars/Import Design Tokens")] // Top-level custom root
    [MenuItem("Tools/WealthWars/Import Design Tokens")] // Standard Tools menu location
    public static void Import() {
            var projectRoot = Application.dataPath + "/..";
            var tokenPath = Path.GetFullPath(Path.Combine(projectRoot, DefaultRelativePath));
            if (!File.Exists(tokenPath)) {
                Debug.LogError($"[WealthWars] design-tokens.json not found at {tokenPath}");
                return;
            }
            var json = File.ReadAllText(tokenPath);
            // Very light parse: look for version only (extend later)
            var version = "unknown";
            var versionIndex = json.IndexOf("\"version\"");
            if (versionIndex >= 0) {
                var colon = json.IndexOf(':', versionIndex);
                var quoteStart = json.IndexOf('"', colon + 1) + 1;
                var quoteEnd = json.IndexOf('"', quoteStart);
                version = json.Substring(quoteStart, quoteEnd - quoteStart);
            }
            var registry = ScriptableObject.CreateInstance<TokenRegistry>();
            registry.Version = version;
            var outDir = "Assets/WealthWars/Generated";
            Directory.CreateDirectory(outDir);
            var assetPath = outDir + "/TokenRegistry.asset";
            AssetDatabase.CreateAsset(registry, assetPath);
            AssetDatabase.SaveAssets();
            Debug.Log($"[WealthWars] Imported design tokens (version {version}) -> {assetPath}");
        }
    }
}
#endif
