# Localization Guide for FinBro

This project uses a centralized localization system to support multiple languages (currently Indonesian and English).

## Directory Structure

- **Translations File**: `src/lib/translations.ts`
- **Context**: `src/context/AppContext.tsx` (manages language settings)
- **Hooks**: `useApp()` hook provides access to `settings.language` and `translations`.

## How to Add a New Language

1.  **Open `src/lib/translations.ts`**
2.  **Add a new key** to the `translations` object (e.g., `es` for Spanish, `jp` for Japanese).
3.  **Copy the structure** from `en` or `id` and translate all values.

```typescript
export const translations = {
  id: { ... },
  en: { ... },
  // Add new language here
  es: {
    sidebar: {
      dashboard: 'Tablero',
      // ...
    },
    // ...
  }
};
```

4.  **Update `Settings` Interface** in `src/context/AppContext.tsx`:

```typescript
export interface Settings {
  currency: 'IDR' | 'USD';
  language: 'id' | 'en' | 'es'; // Add 'es' here
  // ...
}
```

5.  **Update Settings Page** in `src/pages/Settings.tsx` to include the new language option in the dropdown.

## How to Use Translations in Components

1.  **Import Hooks**:
    ```typescript
    import { useApp } from '../context/AppContext';
    import { translations } from '../lib/translations';
    ```

2.  **Access Translations**:
    ```typescript
    const { settings } = useApp();
    const t = translations[settings.language];
    ```

3.  **Use in JSX**:
    ```tsx
    <h1>{t.dashboard.title}</h1>
    ```

## Formatting Dates and Numbers

Always use `Intl` API with dynamic locale:

**Currency:**
```typescript
// Uses AppContext's formatCurrency which handles locale automatically
const { formatCurrency } = useApp();
formatCurrency(10000);
```

**Dates:**
```typescript
new Date().toLocaleDateString(settings.language === 'id' ? 'id-ID' : 'en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
```

**Numbers:**
```typescript
new Intl.NumberFormat(settings.language === 'id' ? 'id-ID' : 'en-US').format(number);
```

## Best Practices

- **Never hardcode text**. Always use the translation object.
- **Check both languages** when adding new UI elements to ensure layout compatibility (some languages are longer than others).
- **Group translations** by feature/page (e.g., `dashboard`, `transactions`, `settings`) in the `translations.ts` file.
