# SillyTavern Cheerleader

A SillyTavern extension that generates fun, short commentary on your roleplay sessions. Think of it as a hype-bot that reacts to what's happening in your story!

## Features

### Core
- **Prompt Library** - Save, load, and manage prompt templates independently from presets
- **Keyboard Shortcuts** - Press `Ctrl+Shift+H` to generate hype, `Esc` to dismiss
- **Auto-Hype** - Optionally trigger commentary automatically after messages (configurable chance)
- **Cooldown System** - Set minimum messages between auto-hypes to avoid spam
- **Auto-Dismiss** - Automatically hide the output after a set number of seconds
- **Store & Send** - Optionally include previous hype messages in context for continuity
- **Export/Import** - Backup and restore all settings and history
- **Preset System** - Save and load different configurations
- **Advanced Prompt Structure** - Full control over the API request with JSON templates
- **Macro Support** - Use `{{user}}`, `{{char}}`, and other SillyTavern macros in prompts

### Effects & Animation
- **Mood Detection** - Automatically detects chat mood (happy, sad, romantic, scary, etc.) and shows contextual emoji reactions
- **Typewriter Effect** - Optional animated text display that types out hype messages character by character
- **Entrance Animations** - Choose from Slide, Fade, Bounce, or Pop animations for the output bar
- **Sound Notifications** - Optional audio feedback (Chime, Pop, or Fanfare) via Web Audio API

### Themes
- **6 Built-in CSS Themes** - Default, Neon Glow, Compact, Bubble, Retro Terminal, Pastel Dream
- **Custom CSS Editor** - Create and save your own themes
- **Flexible Positioning** - Display output before chat, after chat, or as a draggable/resizable floating panel

### Engagement
- **Streak Tracking** - Daily streak counter with milestone badges (fire, star, diamond, crown)
- **Quick Reactions** - React to hype messages with emoji buttons (heart, laugh, fire, clap, 100)
- **Statistics Dashboard** - View total hypes, current/best streak, top personas, messages per chat, and more
- **History Tracking** - Search, browse, and manage previous commentary per chat session with per-item delete

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
5. Click the party emoji button in the chat input area or press `Ctrl+Shift+H` to generate hype!

## Settings

### Persona & Prompt
- **Character Name** - Display name for the cheerleader (with optional avatar)
- **Prompt Library** - Save and load prompts independently from presets
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
- **Auto-Dismiss** - Seconds before output auto-hides (0 = disabled)
- **Keyboard Shortcut** - Enable/disable `Ctrl+Shift+H` shortcut

### Effects & Animation
- **Entrance Animation** - Slide, Fade, Bounce, or Pop
- **Typewriter Effect** - Animate text appearing character by character (adjustable speed)
- **Mood Detection** - Show contextual emoji based on chat sentiment
- **Sound Notification** - Chime, Pop, or Fanfare sounds when hype generates

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

## CSS Themes

Built-in themes:
- **Default** - Clean, matches SillyTavern's theme
- **Neon Glow** - Cyberpunk-style with glowing borders
- **Compact** - Minimal, space-saving design
- **Bubble** - Speech bubble style with rounded corners
- **Retro Terminal** - Green-on-black terminal aesthetic
- **Pastel Dream** - Soft gradients with pastel colors

You can also create and save custom CSS presets.

## Mood Detection

The extension analyzes recent chat messages to detect the current mood:

| Mood | Emoji | Triggered By |
|------|-------|-------------|
| Excited | 🔥 | amazing, awesome, epic, wild... |
| Happy | 😄 | happy, joy, smile, wonderful... |
| Romantic | 💕 | love, kiss, heart, passion... |
| Sad | 😢 | sad, cry, tears, grief... |
| Angry | 😤 | angry, rage, fury, fight... |
| Scary | 😱 | fear, horror, dark, monster... |
| Mysterious | 🔮 | mystery, secret, hidden, puzzle... |
| Funny | 🤣 | funny, hilarious, joke, silly... |
| Dramatic | 🎭 | dramatic, shock, betrayal, twist... |
| Action | ⚡ | run, chase, escape, strike... |

## Streak System

Use the cheerleader daily to build your streak!
- 🔥 Standard streak badge
- ⭐ 7+ day streak
- 💎 14+ day streak
- 👑 30+ day streak

## Requirements

- SillyTavern with Connection Manager support
- A configured API connection (OpenAI, Claude, local LLM, etc.)

## License

MIT

## Author

Antigravity
