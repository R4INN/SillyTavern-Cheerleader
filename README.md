# SillyTavern Cheerleader

A SillyTavern extension that generates fun, short commentary on your roleplay sessions. Think of it as a hype-bot that reacts to what's happening in your story!

## Features

- **Multiple Personas** - Create different cheerleader personalities with unique prompts, names, and avatars
- **Keyboard Shortcuts** - Press `Ctrl+Shift+H` to generate hype, `Esc` to dismiss
- **Auto-Hype** - Optionally trigger commentary automatically after messages (configurable chance)
- **Cooldown System** - Set minimum messages between auto-hypes to avoid spam
- **Auto-Dismiss** - Automatically hide the output after a set number of seconds
- **Customizable Themes** - Choose from built-in CSS presets (Default, Neon Glow, Compact, Bubble) or create your own
- **Flexible Positioning** - Display output before chat, after chat, or as a floating panel
- **History Tracking** - Stores previous commentary per chat session
- **Store & Send** - Optionally include previous hype messages in context for continuity
- **Export/Import** - Backup and restore all settings and history
- **Preset System** - Save and load different configurations
- **Macro Support** - Use `{{user}}`, `{{char}}`, and other SillyTavern macros in prompts

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
4. Customize the system prompt, prefill, and other settings as desired
5. Click the party emoji button in the chat input area or press `Ctrl+Shift+H` to generate hype!

## Settings

### Persona Settings
- **Name** - Display name for the cheerleader
- **Connection Profile** - Which API connection to use for generation
- **Main Prompt** - System prompt that defines the cheerleader's behavior
- **Prefill** - Text to prefill the assistant response (helps guide output style)
- **Max Response Tokens** - Maximum length of generated commentary
- **Max Context Tokens** - How much chat history to include
- **Avatar** - Custom avatar image (URL or upload)

### Global Settings
- **Auto-Hype Chance** - Percentage chance to auto-trigger after each message (0 = disabled)
- **Cooldown** - Minimum messages between auto-hypes
- **Auto-Dismiss** - Seconds before output auto-hides (0 = disabled)
- **Output Position** - Where to display the commentary (after chat, before chat, or floating)
- **Keyboard Shortcut** - Enable/disable `Ctrl+Shift+H` shortcut

### Store & Send
When enabled, includes your previous hype messages in the context so the cheerleader can maintain continuity and avoid repeating itself.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+H` | Generate hype |
| `Esc` | Dismiss output |

## CSS Themes

Built-in themes:
- **Default** - Clean, matches SillyTavern's theme
- **Neon Glow** - Cyberpunk-style with glowing borders
- **Compact** - Minimal, space-saving design
- **Bubble** - Speech bubble style with tail

You can also create and save custom CSS presets.

## Requirements

- SillyTavern with Connection Manager support
- A configured API connection (OpenAI, Claude, local LLM, etc.)

## License

MIT

## Author

Antigravity
