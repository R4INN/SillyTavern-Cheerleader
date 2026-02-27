# SillyTavern Cheerleader

A SillyTavern extension that generates fun, short commentary on your roleplay sessions. Think of it as a hype-bot that reacts to what's happening in your story!

## What's New in v3.0.0

Major feature update bringing visual effects, engagement systems, quality-of-life improvements, and more themes:

- **Typewriter Animation** - Character-by-character text reveal with blinking cursor
- **Confetti Celebration** - Canvas-based confetti burst on hype generation
- **Mood Detection** - Automatic mood analysis with colored badges
- **Streak System** - Track consecutive hypes with tiered badges (Combo, Unstoppable, On Fire, Legendary)
- **Quick Reactions** - 8 emoji reaction buttons below hype messages
- **Sound Notifications** - Web Audio API sounds (Chime, Pop, Fanfare)
- **Toast Notifications** - Lightweight corner toast output mode
- **Markdown Rendering** - Bold, italic, strikethrough, and inline code in output
- **Statistics Dashboard** - Track total hypes, streaks, mood breakdown, and reactions
- **Slash Commands** - `/hype`, `/hype-history`, `/hype-stats`
- **History Search & Favorites** - Search messages, star favorites, export history
- **Auto-Retry** - Automatic retry on generation failure
- **Copy & Regenerate** - Action buttons on the output bar
- **Touch Support** - Mobile-friendly floating panel
- **11 CSS Themes** - 8 new themes added

## Features

### Core
- **Keyboard Shortcuts** - Press `Ctrl+Shift+H` to generate hype, `Esc` to dismiss
- **Auto-Hype** - Optionally trigger commentary automatically after messages (configurable chance)
- **Cooldown System** - Set minimum messages between auto-hypes
- **Auto-Dismiss** - Automatically hide the output after a set number of seconds
- **Flexible Positioning** - Display output before chat, after chat, as a floating panel, or as a toast notification
- **History Tracking** - Stores previous commentary per chat session with search, favorites, and export
- **Store & Send** - Include previous hype messages in context for continuity
- **Export/Import** - Backup and restore all settings, history, and statistics
- **Preset System** - Save and load different configurations
- **Advanced Prompt Structure** - Full control over the API request with JSON templates
- **Macro Support** - Use `{{user}}`, `{{char}}`, and other SillyTavern macros in prompts

### Visual Effects
- **Typewriter Animation** - Configurable speed (10-100ms per character)
- **Confetti** - 80-particle canvas animation with circles, squares, and triangles
- **Mood Detection** - 7 moods with colored badges and emoji indicators
- **Entrance Animations** - Smooth slide-in effects

### Engagement
- **Streak System** - 4 badge tiers based on hype frequency
- **Quick Reactions** - 8 emoji buttons (🔥 ❤️ 😂 😭 🤯 👏 💀 ✨)
- **Sound Notifications** - 3 sound types via Web Audio API
- **Statistics Dashboard** - Comprehensive metrics with mood breakdown

### Customization
- **11 Built-in CSS Themes** - Default, Neon Glow, Compact, Retro Terminal, Bubble Chat, Minimal Dark, Gradient Wave, Pastel Dream, Sunset Warm, Dark Elegance, Retro Arcade
- **Custom CSS Editor** - Create your own themes
- **Markdown Rendering** - Rich text in output

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
- **Main Prompt** - System prompt that defines the cheerleader's behavior
- **Prefill** - Text to prefill the assistant response (helps guide output style)
- **Max Context/Response Tokens** - Control context and output length

### Connection Profile
Select which API connection to use for generating commentary.

### Auto-Hype Settings
- **Auto-Hype Chance** - Percentage chance to auto-trigger after each message (0 = disabled)
- **Cooldown** - Minimum messages between auto-hypes

### Effects & Flair
- **Typewriter Animation** - Character-by-character reveal with speed control
- **Confetti Celebration** - Colorful particle burst on generation
- **Mood Detection** - Automatic mood badges (Hyped, Dramatic, Romantic, Comedy, Emotional, Intense, Mysterious)
- **Quick Reactions** - Emoji reaction buttons
- **Sound Notification** - Chime, Pop, or Fanfare sounds
- **Markdown Rendering** - Rich text support in output
- **Auto-Retry** - Retry once on failure

### Display Settings
- **Output Position** - After Chat, Before Chat, Floating, or Toast
- **Auto-Dismiss** - Seconds before output auto-hides (0 = disabled)
- **Keyboard Shortcut** - Enable/disable `Ctrl+Shift+H`

### Store & Send
Include previous hype messages in context so the cheerleader maintains continuity.

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

## Slash Commands

| Command | Action |
|---------|--------|
| `/hype` | Generate a hype message |
| `/hype-history` | Open hype history popup |
| `/hype-stats` | Open statistics dashboard |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+H` | Generate hype |
| `Esc` | Dismiss output |

## Mood Detection

| Mood | Emoji | Triggers |
|------|-------|----------|
| Hyped | 🔥 | amazing, awesome, epic, legendary... |
| Dramatic | ⚡ | shocking, twist, betrayal, dark... |
| Romantic | 💖 | love, kiss, passion, embrace... |
| Comedy | 😂 | funny, hilarious, joke, silly... |
| Emotional | 🥺 | sad, cry, grief, farewell... |
| Intense | ⚔️ | fight, battle, rage, destroy... |
| Mysterious | 🔮 | mystery, hidden, enigma, magic... |

## Streak System

| Threshold | Badge | Style |
|-----------|-------|-------|
| 3+ hypes | 💥 COMBO | Orange-red gradient |
| 5+ hypes | ⚡ UNSTOPPABLE | Red-purple gradient |
| 7+ hypes | 🔥 ON FIRE | Red-orange with glow |
| 10+ hypes | 👑 LEGENDARY | Gold-pink-cyan shimmer |

## CSS Themes

Built-in themes:
- **Default** - Clean, matches SillyTavern's theme
- **Neon Glow** - Cyberpunk-style with glowing borders
- **Compact** - Minimal, space-saving design
- **Retro Terminal** - Green-on-black CRT terminal look
- **Bubble Chat** - Chat bubble style with avatar positioning
- **Minimal Dark** - Sleek dark with accent border
- **Gradient Wave** - Animated rainbow gradient background
- **Pastel Dream** - Soft pastel gradients
- **Sunset Warm** - Warm orange/red gradients
- **Dark Elegance** - Sophisticated dark purple tones
- **Retro Arcade** - Neon magenta/cyan arcade style

You can also create and save custom CSS presets.

## Upgrading from v2.x

All v2.x settings are automatically migrated. New v3.0 features will use their default values.

## Requirements

- SillyTavern with Connection Manager support
- A configured API connection (OpenAI, Claude, local LLM, etc.)

## License

MIT

## Author

Antigravity
