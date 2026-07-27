# Optional Hero hand asset

Place the official transparent render here:

```text
public/hero/hand-phone.webp
```

## Requirements

- Transparent background (WebP preferred; AVIF also fine if Next config allows)
- Recommended export: ~1040×1280 px (2x of ~520×640 display)
- Subject: stylized 3D hand presenting a smartphone, emerging from lower center
- Keep lighting soft (violet/aqua ambient), no harsh neon outlines
- No fake UI metrics burned into the phone screen (screen can be blank/neutral)

When the file exists, `heroHandAssetExists()` enables the optional layer automatically.
Until then, the CSS phone mockup + floating cards render as the polished fallback.
