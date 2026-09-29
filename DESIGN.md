# Meridian Supply — Sistema de diseño

> Streetwear técnico de "almacén": prendas funcionales, señalética industrial, neutros cálidos con detalles naranja señalético. Público 18–28, mercado México (MXN).

## Partes del sistema

- **Fondo claro**: Bone `#F2F0EA` (oklch 95.4% 0.008 85) — cálido, nada de gris de plantilla.
- **Fondo dark**: Ink `#0E1420` (oklch 15.5% 0.026 262) — negro azulado profundo.
- **Texto**: Ink en luz / Bone en dark.
- **Acción (CTA)**: Vermilion — en luz `#C13B1C` (AA sobre blanco), en dark `#E24A2A` (texto ink encima). Solo se usa para acción y precio.
- **Secundarios**: Mist `#E6E9EE` (superficies/elevación) y Steel `#7A8494` (texto secundario, bordes).
- **Semánticos**: success/warning/error (tonos estándar del template) para estados de checkout y admin.

## Tipografía

- **Geist Sans** (`--font-geist-sans`): toda la interfaz; product-first, sin serif.
- **Geist Mono** (`--font-geist-mono`): microlabels de "etiqueta de almacén" y precios en cards (`.uppercase.mono`), no en títulos.
- Jerarquía simple: títulos sin peso decorativo (font-weight normal, como diseño técnico), tamaños escalados por el template.

## Layout

- Grid de producto denso, alineado a la izquierda; esquinas `--radius: 6px`, bordes 1px, sin sombras grises genéricas.
- El precio es el único acento vermilion por card + microlabel mono encima (novedad/agotado).
- Tipos de lista del shop: pills de talla/color como chips de selección (VariantFilters), no dropdowns genéricos.

## Principios

1. **Señalética primero**: el naranja solo para acción y precio; el resto es neutro cálido para que las fotos de producto manden.
2. **Densidad de almacén**: más producto por pantalla, menos aire de showroom; secciones cortas en home.
3. **Accesibilidad no negociable**: AA en todo texto (el vermilion de luz está ajustado para eso), focus visible con ring vermilion, `prefers-reduced-motion` desactiva animaciones (ver `globals.css`).

## Implementación

- Solo se definen tokens en `src/app/(app)/globals.css` (`:root` y `[data-theme='dark']`), consumidos por `@theme inline` de Tailwind v4.
- `src/cssVariables.js` mantiene la misma paleta en RGB (se usa para el tema de Stripe Elements y el admin de Payload) — "mantener en sync con globals.css".
- `pile de neutrales` del template (neutral-50…950) se mantiene como gris acero estándar para inputs/divisores; la identidad la dan background/foreground/primary/accent.