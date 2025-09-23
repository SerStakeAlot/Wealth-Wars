using UnityEngine;
using WealthWars.DesignTokens;

/// <summary>
/// Ensures a DisplayTokenVersion HUD exists even if the user forgets to add it manually.
/// Creates a GameObject at runtime (in editor & builds) on first scene load.
/// </summary>
public static class DisplayTokenVersionBootstrap
{
    private const string HudObjectName = "TokenVersionHUD";

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    private static void EnsureHud()
    {
    // If already placed manually, do nothing.
#if UNITY_2023_1_OR_NEWER
    if (Object.FindAnyObjectByType<DisplayTokenVersion>() != null || Object.FindFirstObjectByType<DisplayTokenVersion>() != null)
        return;
#else
    if (Object.FindObjectOfType<DisplayTokenVersion>() != null)
        return;
#endif

        var existingGo = GameObject.Find(HudObjectName);
        if (existingGo != null && existingGo.GetComponent<DisplayTokenVersion>() != null)
            return;

        var go = existingGo ?? new GameObject(HudObjectName);
        var hud = go.GetComponent<DisplayTokenVersion>();
        if (hud == null)
            hud = go.AddComponent<DisplayTokenVersion>();

        // Try to auto-assign TokenRegistry (search loaded assets)
        if (hud != null)
        {
            var registries = Resources.FindObjectsOfTypeAll<TokenRegistry>();
            if (registries != null && registries.Length > 0)
            {
                hud.SetTokenRegistry(registries[0]);
            }
        }
        Object.DontDestroyOnLoad(go); // Persist across scene loads.
    }
}
