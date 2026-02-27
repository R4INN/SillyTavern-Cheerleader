# SillyTavern Cheerleader

A SillyTavern extension that generates fun, short commentary on your roleplay sessions. Think of it as a hype-bot that reacts to what's happening in your story!

## What's New in v3.0.0

- **Typewriter Animation** - Hype messages appear character-by-character with a blinking cursor
- **Confetti Celebration** - Colorful confetti particles burst across the screen on each hype
- **Mood Detection** - Automatically detects the mood of hype text (excited, dramatic, romantic, funny, sad, intense, mysterious) and displays a colored badge
- **Streak System** - Generate multiple hypes in a row to build combo streaks with escalating badges (Combo, Unstoppable, On Fire, Legendary)
- **Quick Reactions** - React to hype messages with emoji buttons that are tracked in history
- **Statistics Dashboard** - Track total hypes, longest streak, mood breakdowns, favorite reactions, hypes per day, and more
- **Slash Commands** - Use `/hype`, `/hype-history`, and `/hype-stats` right from the chat input
- **4 New CSS Themes** - Retro Terminal, Bubble Chat, Minimal Dark, and Gradient Wave (7 total built-in themes)
- **Touch/Mobile Support** - Floating panel now works with touch gestures on mobile devices
- **Enhanced Animations** - Polished transitions, pop-in effects, and smooth interactions throughout

## Features

### Core
- **Prompt Library** - Save and reuse prompt templates, quickly switch between different cheerleader personalities
- **Keyboard Shortcuts** - Press `Ctrl+Shift+H` to generate hype, `Esc` to dismiss
- **Slash Commands** - Type `/hype`, `/hype-history`, or `/hype-stats` in the chat input
- **Auto-Hype** - Optionally trigger commentary automatically after messages (configurable chance)
- **Cooldown System** - Set minimum messages between auto-hypes to avoid spam
- **Auto-Dismiss** - Automatically hide the output after a set number of seconds

### Visual Effects
- **Typewriter Animation** - Character-by-character text reveal with adjustable speed
- **Confetti Particles** - Canvas-based celebration with multiple shapes and colors
- **Mood Badges** - Color-coded mood indicators (7 moods detected)
- **Streak Badges** - Escalating combo indicators with special effects
- **Quick Reactions** - Emoji buttons with floating ripple animations

### Customization
- **7 Built-in Themes** - Default, Neon Glow, Compact, Retro Terminal, Bubble Chat, Minimal Dark, Gradient Wave
- **Custom CSS Presets** - Create your own themes with the built-in CSS editor
- **Flexible Positioning** - Display output before chat, after chat, or as a draggable/resizable floating panel
- **Toggle Everything** - Individually enable/disable typewriter, confetti, mood detection, and reactions

### Data & History
- **History Tracking** - Stores previous commentary per chat session with mood and reaction data
- **Statistics Dashboard** - Comprehensive stats with mood breakdowns and reaction counts
- **Store & Send** - Optionally include previous hype messages in context for continuity
- **Export/Import** - Backup and restore all settings, history, and statistics
- **Preset System** - Save and load different configurations

### Advanced
- **Prompt Structure Editor** - Full control over the API request with JSON templates
- **Macro Support** - Use `{{user}}`, `{{char}}`, and other SillyTavern macros in prompts
- **Conditional Fields** - Enable/disable template sections based on available data
- **Template Preview** - See exactly what will be sent to the API before generating

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
- **Typewriter Animation** - Toggle and adjust the speed (10-100ms per character)
- **Confetti Celebration** - Toggle colorful particle burst on hype
- **Mood Detection** - Toggle automatic mood analysis with colored badges
- **Quick Reactions** - Toggle emoji reaction buttons on the output bar

### Display Settings
- **Output Position** - Where to display the commentary:
  - After Chat (bottom)
  - Before Chat (top)
  - Floating (draggable & resizable panel, with touch support)
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
| `/hype-history` | View hype history |
| `/hype-stats` | Open statistics dashboard |

## CSS Themes

Built-in themes (7):
- **Default** - Clean, matches SillyTavern's theme
- **Neon Glow** - Cyberpunk-style with glowing cyan borders
- **Compact** - Minimal, space-saving design
- **Retro Terminal** - Green-on-black terminal aesthetic with scan-line feel
- **Bubble Chat** - Modern chat bubble with gradient background
- **Minimal Dark** - Ultra-clean dark design with left accent border
- **Gradient Wave** - Animated gradient background with rainbow name effect

You can also create and save custom CSS presets.

## Mood Detection

The extension analyzes hype text to detect 7 different moods:

| Mood | Emoji | Color | Detected Keywords |
|------|-------|-------|-------------------|
| Excited | 🔥 | Orange | amazing, incredible, awesome, wow... |
| Dramatic | ⚡ | Purple | shocking, twist, betrayal, dark... |
| Romantic | 💖 | Pink | love, heart, tender, passion... |
| Funny | 😂 | Yellow | hilarious, joke, ridiculous, silly... |
| Sad | 🥺 | Blue | cry, grief, sorrow, lonely... |
| Intense | ⚔️ | Red | fight, battle, power, fury... |
| Mysterious | 🔮 | Teal | mystery, enigma, ancient, prophecy... |

## Streak System

Generate multiple hypes within 5 minutes to build streaks:

| Streak | Badge | Effect |
|--------|-------|--------|
| 3+ | 💥 COMBO | Orange-red gradient |
| 5+ | ⚡ UNSTOPPABLE | Red-purple gradient |
| 7+ | 🔥 ON FIRE | Red-orange gradient with glow |
| 10+ | 👑 LEGENDARY | Gold-pink-cyan gradient with shimmer |

## Requirements

- SillyTavern with Connection Manager support
- A configured API connection (OpenAI, Claude, local LLM, etc.)

## Upgrading from v2.x

v3.0.0 is fully backward-compatible with v2.x settings. All your existing settings, presets, and history will be preserved. New v3 features (typewriter, confetti, mood, reactions) are enabled by default and can be toggled individually in the **Effects & Flair** settings section.

## License

MIT

## Author

Antigravity
