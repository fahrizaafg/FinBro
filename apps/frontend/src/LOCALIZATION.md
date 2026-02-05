# Localization Guide

This project supports multi-language support (Internationalization/i18n) currently covering **Indonesian (ID)** and **English (EN)**.

## System Overview

- **Source of Truth**: `src/lib/translations.ts` contains all translation strings.
- **State Management**: `AppContext.tsx` holds the current language state (`settings.language`).
- **Usage**: Components consume translations via the `translations` object indexed by the current language.

## Supported Languages

- `id`: Indonesian (Default)
- `en`: English

## How to Add a New Language

1.  Open `src/lib/translations.ts`.
2.  Add a new key to the `translations` object (e.g., `jp` for Japanese).
3.  Copy the structure from `id` or `en` and translate all values.
4.  Update `src/context/AppContext.tsx` to allow the new language code in the `Settings` type if necessary (currently typed as `string`, so it's flexible).
5.  Add the new language option in `src/pages/Settings.tsx` dropdown.

## How to Add New Translations

1.  Identify the component or feature needing translation.
2.  Add a new key to the appropriate section in `src/lib/translations.ts` (e.g., under `dashboard`, `budget`, etc.).
3.  Ensure you add the key for **ALL** supported languages (`id`, `en`).
4.  Use the key in your component:
    ```tsx
    const { settings } = useApp();
    const t = translations[settings.language];
    
    return <div>{t.section.newKey}</div>;
    ```

## Best Practices

-   **No Hardcoding**: Never write text directly in JSX. Always use `translations.ts`.
-   **Placeholders**: For dynamic text, use placeholders like `{name}` and replace them in the component.
    *   *Translation*: `welcome: 'Hello, {name}!'`
    *   *Usage*: `t.common.welcome.replace('{name}', userName)`
-   **Date Formatting**: Use `date-fns` with the appropriate locale.
    ```tsx
    import { format } from 'date-fns';
    import { id, enUS } from 'date-fns/locale';
    
    const locale = settings.language === 'id' ? id : enUS;
    format(new Date(), 'dd MMMM yyyy', { locale });
    ```

## Recent Changes (Localization Audit)

-   Refactored `Layout`, `Dashboard`, `Budget`, `Transactions`, `Debts`, `Categories`, `Settings`, `UndoRedoControls`, and `Toast` to remove hardcoded strings.
-   Added missing translation keys for alerts, confirmations, empty states, and specific terms (e.g., "Overbudget", "Hapus").
-   Fixed "Toast" notification position to prevent overlap with Undo/Redo controls.
-   Standardized date formatting across the app.
