# SillyTavern Cheerleader

A SillyTavern extension that generates fun, short commentary on your roleplay sessions. Think of it as a hype-bot that reacts to what's happening in your story!

## Features

### Core
- **Prompt Library** - Save and reuse prompt templates, quickly switch between different cheerleader personalities
- **Keyboard Shortcuts** - Press `Ctrl+Shift+H` to generate hype, `Esc` to dismiss
- **Slash Command** - Type `/hype` in the chat input (aliases: `/cheerleader`, `/cheer`)
- **Auto-Hype** - Optionally trigger commentary automatically after messages (configurable chance)
- **Cooldown System** - Set minimum messages between auto-hypes to avoid spam
- **Auto-Dismiss** - Automatically hide the output after a set number of seconds

### Effects & Fun
- **Typing Animation** - Hype text appears with a typewriter effect (configurable speed)
- **Confetti Burst** - Celebrate each hype with a colorful confetti animation
- **Mood Detection** - Analyzes hype text and adds matching emoji (8 mood categories: excited, funny, romantic, dramatic, sad, angry, mysterious, wholesome)
- **Quick Reactions** - Tap emoji reaction buttons under each hype message (8 reactions)
- **Streak Counter** - Track consecutive hypes with escalating badges (COMBO, UNSTOPPABLE, ON FIRE, LEGENDARY)
- **Statistics Dashboard** - Track total hypes, words generated, avg words/hype, longest streak, top reactions, and more

### Display
- **7 CSS Themes** - Default, Neon Glow, Compact, Pastel Dream, Dark Hacker, Sunset Warm, Retro Arcade
- **Custom Themes** - Create and save your own CSS presets
- **Flexible Positioning** - Display output before chat, after chat, or as a draggable/resizable floating panel
- **History Tracking** - Stores previous commentary per chat session

### Advanced
- **Store & Send** - Include previous hype messages in context for continuity
- **Export/Import** - Backup and restore all settings and history
- **Preset System** - Save and load different configurations
- **Advanced Prompt Structure** - Full control over the API request with JSON templates
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
4. Customize the persona name, prompt, and other settings as desired
5. Click the 🎉 button in the chat input area, press `Ctrl+Shift+H`, or type `/hype` to generate!

## Settings

### Persona & Prompt
- **Character Name** - Display name for the cheerleader (with optional avatar)
- **Prompt Template** - Load saved prompts from your library
- **Main Prompt** - System prompt that defines the cheerleader's behavior
- **Prefill** - Text to prefill the assistant response (helps guide output style)
- **Save to Library / New Prompt** - Save current prompt or create new templates
- **Max Context/Response Tokens** - Control context and output length

### Connection Profile
Select which API connection to use for generating commentary.

### Auto-Hype Settings
- **Auto-Hype Chance** - Percentage chance to auto-trigger after each message (0 = disabled)
- **Cooldown** - Minimum messages between auto-hypes

### Effects & Fun
- **Typing Animation** - Toggle typewriter effect on/off, adjust speed (ms per character)
- **Confetti Burst** - Toggle the confetti celebration animation
- **Quick Reactions** - Toggle emoji reaction buttons under hype messages
- **Mood Detection** - Toggle automatic mood emoji detection

### Statistics
View your hype stats at a glance:
- Total hypes generated
- Total words generated
- Average words per hype
- Longest streak
- Current streak
- Chats with hype
- Top reactions

### Display Settings
- **Output Position** - Where to display the commentary:
  - After Chat (bottom)
  - Before Chat (top)
  - Floating (draggable & resizable panel)
- **Auto-Dismiss** - Seconds before output auto-hides (0 = disabled)
- **Keyboard Shortcut** - Enable/disable `Ctrl+Shift+H` shortcut

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

## Keyboard Shortcuts & Commands

| Input | Action |
|-------|--------|
| `Ctrl+Shift+H` | Generate hype |
| `Esc` | Dismiss output |
| `/hype` | Generate hype (slash command) |
| `/cheerleader` | Generate hype (alias) |
| `/cheer` | Generate hype (alias) |

## CSS Themes

Built-in themes:
- **Default** - Clean, matches SillyTavern's theme
- **Neon Glow** - Cyberpunk-style with glowing cyan borders
- **Compact** - Minimal, space-saving design
- **Pastel Dream** - Soft pastel gradients with gentle styling
- **Dark Hacker** - Green-on-black terminal aesthetic
- **Sunset Warm** - Warm orange/red gradient tones
- **Retro Arcade** - Neon magenta/cyan with pixel-art energy

You can also create and save custom CSS presets.

## Streak System

Generate hypes within 5 minutes of each other to build a streak:
- **3x** - COMBO badge
- **5x** - UNSTOPPABLE badge
- **7x** - ON FIRE badge (with glow effect)
- **10x** - LEGENDARY badge (with rainbow animation)

Your longest streak is permanently tracked in statistics.

## Requirements

- SillyTavern with Connection Manager support
- A configured API connection (OpenAI, Claude, local LLM, etc.)

## License

MIT

## Author

Antigravity
