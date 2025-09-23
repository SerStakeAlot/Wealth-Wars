using UnityEngine;
using WealthWars.DesignTokens; // Namespace where TokenRegistry lives

/// <summary>
/// Simple on-screen HUD that displays the design token version.
/// Attach this to an empty GameObject (e.g., HUD) and assign the TokenRegistry asset in the Inspector.
/// </summary>
public class DisplayTokenVersion : MonoBehaviour
{
    [Header("References")] 
    [Tooltip("Drag the TokenRegistry asset from Assets/WealthWars/Generated here.")]
    [SerializeField] private TokenRegistry tokenRegistry;

    [Header("Display Settings")] 
    [SerializeField] private string prefix = "Tokens v"; 
    [SerializeField] private Vector2 position = new Vector2(8, 8);
    [SerializeField] private int fontSize = 14;
    [SerializeField] private Color textColor = Color.white;
    [SerializeField] private Color shadowColor = new Color(0,0,0,0.65f);
    [SerializeField] private Vector2 shadowOffset = new Vector2(1,1);

    private GUIStyle _style;
    private GUIStyle _shadowStyle;

    private void Awake()
    {
        // Attempt auto-discovery if not assigned (editor convenience)
        if (tokenRegistry == null)
        {
            // Look in Resources (if later moved) or via AssetDatabase in editor; for now simple FindObjectOfType is fine.
            var found = Resources.FindObjectsOfTypeAll<TokenRegistry>();
            if (found != null && found.Length > 0)
            {
                tokenRegistry = found[0];
            }
        }
        _style = new GUIStyle(GUI.skin.label)
        {
            fontSize = fontSize,
            normal = { textColor = textColor }
        };

        _shadowStyle = new GUIStyle(_style)
        {
            normal = { textColor = shadowColor }
        };
    }

    private void OnGUI()
    {
        string value = tokenRegistry == null ? "[No TokenRegistry Assigned]" : prefix + tokenRegistry.Version;
        Rect r = new Rect(position.x, position.y, 420, fontSize + 12);
        // Shadow
        GUI.Label(new Rect(r.x + shadowOffset.x, r.y + shadowOffset.y, r.width, r.height), value, _shadowStyle);
        GUI.Label(r, value, _style);
    }

    /// <summary>
    /// Allows external bootstrap code to inject the TokenRegistry at runtime without using editor-only APIs.
    /// </summary>
    public void SetTokenRegistry(TokenRegistry reg)
    {
        if (reg != null && tokenRegistry == null)
        {
            tokenRegistry = reg;
        }
    }
}
