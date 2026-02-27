# SillyTavern Cheerleader

A SillyTavern extension that generates fun, short commentary on your roleplay sessions. Think of it as a hype-bot that reacts to what's happening in your story!

## Features

### Core
- **Prompt Library** - Save and reuse prompt templates, quickly switch between different cheerleader personalities
- **Keyboard Shortcuts** - Press `Ctrl+Shift+H` to generate hype, `Esc` to dismiss
- **Slash Command** - Type `/hype` in the chat to generate commentary
- **Auto-Hype** - Optionally trigger commentary automatically after messages (configurable chance)
- **Cooldown System** - Set minimum messages between auto-hypes to avoid spam
- **Auto-Dismiss** - Automatically hide the output after a set number of seconds
- **Preset System** - Save and load different configurations
- **Advanced Prompt Structure** - Full control over the API request with JSON templates
- **Macro Support** - Use `{{user}}`, `{{char}}`, and other SillyTavern macros in prompts
- **Auto-Retry** - Automatically retry failed generations for better reliability

### Display & Effects
- **Typewriter Effect** - Text appears character by character for a dynamic feel
- **Confetti Celebration** - Fun particle animation when hype is generated
- **Sound Notification** - Optional two-tone chime alert (Web Audio API, no files needed)
- **Markdown Rendering** - Support for bold, italic, strikethrough, and inline code in output
- **Toast Notifications** - Lightweight notification-style display as an alternative to the output bar
- **Flexible Positioning** - Display output before chat, after chat, as a draggable floating panel, or as a toast

### Themes
- **6 Built-in CSS Themes**:
  - **Default** - Clean, matches SillyTavern's theme
  - **Neon Glow** - Cyberpunk-style with glowing borders
  - **Compact** - Minimal, space-saving design
  - **Retro Terminal** - Green-on-black CRT terminal aesthetic with scanlines
  - **Pastel Bubble** - Soft pastel gradients with rounded bubble design
  - **Dark Elegance** - Sophisticated dark theme with purple accents
- **Custom CSS** - Create and save your own CSS presets

### History & Data
- **History Search** - Search through previous hype messages
- **Favorites** - Star your favorite hype messages for quick access
- **History Export** - Export hype history as JSON
- **Statistics Dashboard** - Track total hypes, streaks, average length, and more
- **Store & Send** - Include previous hype messages in context for continuity
- **Export/Import** - Backup and restore all settings and history

### Output Bar Actions
- **Copy** - Copy hype text to clipboard with one click
- **Regenerate** - Quickly generate a new hype message
- **Dismiss** - Close the output bar (or press Esc)

## Installation

### Via SillyTavern Extension Installer
1. Open SillyTavern
2. Go to Extensions > Install Extension
3. Enter the repository URL: `https://github.com/R4INN/SillyTavern-Cheerleader`

### Manual Installation
1. Clone or download this repository
2. Place the folder in your SillyTavern `data/<user>/extensions/` directory
3. Restart SillyTavern

## Setup

1. Open SillyTavern and go to **Extensions** in the top bar
2. Find **Cheerleader Hype Bot** and expand its settings
3. **Select a Connection Profile** - This is required for the extension to work
4. Customize the persona name, prompt, and other settings as desired
5. Click the party emoji button in the chat input area, press `Ctrl+Shift+H`, or type `/hype` to generate!

## Settings

### Persona & Prompt
- **Character Name** - Display name for the cheerleader (with optional avatar)
- **Main Prompt** - System prompt that defines the cheerleader's behavior
- **Prefill** - Text to prefill the assistant response (helps guide output style)
- **Max Context/Response Tokens** - Control context and output length

### Connection Profile
Select which API connection to use for generating commentary.

### Auto-Hype Settings
- **Auto-Hype Chance** - Percentage chance to auto-trigger after each message (0 = disabled)
- **Cooldown** - Minimum messages between auto-hypes

### Display Settings
- **Output Position** - Where to display the commentary:
  - After Chat (bottom)
  - Before Chat (top)
  - Floating (draggable & resizable panel)
  - Toast Notification (lightweight corner popup)
- **Auto-Dismiss** - Seconds before output auto-hides (0 = disabled)
- **Keyboard Shortcut** - Enable/disable `Ctrl+Shift+H` shortcut

### Effects & Animations
- **Typewriter Effect** - Enable/disable character-by-character text reveal with adjustable speed
- **Confetti Celebration** - Colorful particle burst when hype appears
- **Sound Notification** - Pleasant two-tone chime on generation
- **Markdown Rendering** - Render bold, italic, and other markdown in output
- **Auto-Retry** - Automatically retry once on generation failure

### Statistics
Track your hype usage with a built-in dashboard showing:
- Total hype messages generated
- Best and current generation streaks
- Average message length
- Last generation timestamp

### Store & Send
When enabled, includes your previous hype messages in the context so the cheerleader can maintain continuity and avoid repeating itself.

### Prompt Structure (Advanced)
Full control over the API request structure using a JSON template. Available placeholders:
- `{{main_prompt}}` - Your main system prompt
- `{{user_persona}}` - User's persona description
- `{{char_info}}` - Character info (name, description, personality, scenario)
- `{{chat_history}}` - Chat messages (use as marker)
- `{{previous_hype}}` - Previous hype messages
- `{{prefill}}` - Assistant prefill text
- `{{user}}` / `{{char}}` - User/Character names

Conditional fields: `{{if_user_persona}}`, `{{if_char_info}}`, `{{if_previous_hype}}`, `{{if_prefill}}`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+H` | Generate hype |
| `Esc` | Dismiss output |

## Slash Commands

| Command | Action |
|---------|--------|
| `/hype` | Generate a hype message |

## Requirements

- SillyTavern with Connection Manager support
- A configured API connection (OpenAI, Claude, local LLM, etc.)

## License

MIT

## Author

Antigravity
