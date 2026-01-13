// SillyTavern Cheerleader Extension v2.0.0 - Completely Revamped
// Author: Antigravity
// Features: Multiple personas, keyboard shortcuts, loading states, cooldown indicators,
//           export/import, auto-dismiss, optimized performance

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // CONSTANTS & CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════

    const EXTENSION_NAME = "SillyTavern-Cheerleader";
    const DEBUG = false;
    const STORAGE_KEY = 'cheerleader_history';

    const DEFAULTS = Object.freeze({
        MAIN_PROMPT: "You are a hype-bot. Your job is to make a short, fun comment on the current story. Keep it brief (1-2 sentences).",
        PREFILL: "Wow, that's intense!",
        CHAR_NAME: "Cheerleader",
        MAX_RESPONSE: 200,
        MAX_CONTEXT: 4096,
        AUTO_HYPE_CHANCE: 0,
        COOLDOWN: 0,
        AVATAR: "",
        STORE_SEND_COUNT: 4,
        AUTO_DISMISS: 0,
        OUTPUT_POSITION: "after_chat",
        KEYBOARD_SHORTCUT: true,
        PROMPT_TEMPLATE: `[
  {
    "role": "system",
    "content": "{{main_prompt}}"
  },
  {
    "role": "system", 
    "content": "{{user_persona}}",
    "enabled": "{{if_user_persona}}"
  },
  {
    "role": "system",
    "content": "{{char_info}}",
    "enabled": "{{if_char_info}}"
  },
  {
    "marker": "{{chat_history}}"
  },
  {
    "role": "system",
    "content": "{{previous_hype}}",
    "enabled": "{{if_previous_hype}}"
  },
  {
    "role": "assistant",
    "content": "{{prefill}}",
    "enabled": "{{if_prefill}}"
  }
]`
    });

    // Built-in CSS presets
    const BUILTIN_CSS = {
        "Default": `
            #cheerleader-output-bar {
                margin: 10px;
                padding: 15px;
                background-color: var(--SmartThemeBlurTintColor);
                border: 1px solid var(--SmartThemeBorderColor);
                border-radius: 10px;
            }
            #cheerleader-avatar {
                height: 40px;
                width: 40px;
                object-fit: contain;
                margin-right: 10px;
                border-radius: 4px;
                background: transparent;
            }
            #cheerleader-avatar-emoji {
                margin-right: 8px;
                font-size: 1.5em;
            }
        `,
        "Neon Glow": `
            #cheerleader-output-bar {
                margin: 10px;
                padding: 15px;
                background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,40,0.9) 100%);
                border: 2px solid #00ffff;
                border-radius: 15px;
                box-shadow: 0 0 20px rgba(0,255,255,0.3), inset 0 0 30px rgba(0,255,255,0.1);
            }
            #cheerleader-avatar {
                height: 50px;
                width: 50px;
                object-fit: contain;
                margin-right: 12px;
                border-radius: 50%;
                border: 2px solid #00ffff;
                box-shadow: 0 0 10px rgba(0,255,255,0.5);
                background: transparent;
            }
            #cheerleader-avatar-emoji {
                margin-right: 10px;
                font-size: 2em;
                filter: drop-shadow(0 0 5px #00ffff);
            }
            #cheerleader-name {
                color: #00ffff !important;
                text-shadow: 0 0 10px #00ffff;
            }
            #cheerleader-output-content {
                color: #fff;
            }
        `,
        "Compact": `
            #cheerleader-output-bar {
                margin: 5px 10px;
                padding: 8px 12px;
                background-color: var(--SmartThemeBlurTintColor);
                border: 1px solid var(--SmartThemeBorderColor);
                border-radius: 6px;
            }
            #cheerleader-avatar {
                height: 24px;
                width: 24px;
                object-fit: contain;
                margin-right: 8px;
                border-radius: 3px;
                background: transparent;
            }
            #cheerleader-avatar-emoji {
                margin-right: 6px;
                font-size: 1em;
            }
            #cheerleader-name {
                font-size: 0.9em;
            }
            #cheerleader-output-content {
                font-size: 0.95em;
            }
        `,
        "Bubble": `
            #cheerleader-output-bar {
                margin: 10px 20px 20px 20px;
                padding: 12px 18px;
                background: var(--SmartThemeBlurTintColor);
                border: none;
                border-radius: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                position: relative;
                overflow: visible !important;
            }
            #cheerleader-output-bar::after {
                content: '';
                position: absolute;
                bottom: -10px;
                left: 25px;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 12px 10px 0 10px;
                border-color: var(--SmartThemeBlurTintColor) transparent transparent transparent;
                filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
            }
            #cheerleader-avatar {
                height: 36px;
                width: 36px;
                object-fit: contain;
                margin-right: 10px;
                border-radius: 50%;
                background: transparent;
            }
            #cheerleader-avatar-emoji {
                margin-right: 8px;
                font-size: 1.3em;
            }
            .cheerleader-header {
                color: var(--SmartThemeQuoteColor);
            }
        `
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    const State = {
        cache: null,
        isGenerating: false,
        messagesSinceLastHype: 999,
        saveTimer: null,
        autoDismissTimer: null,
        elements: {}, // Cached jQuery elements
        buttonObserver: null,
        activePersonaIndex: 0
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    const log = DEBUG ? console.log.bind(console, '[Cheerleader]') : () => {};
    const warn = console.warn.bind(console, '[Cheerleader]');
    const error = console.error.bind(console, '[Cheerleader]');

    function debounce(fn, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    function getContext() {
        return SillyTavern.getContext();
    }

    function estimateTokens(text) {
        return Math.ceil((text || "").length / 4);
    }

    function stripXmlTags(text) {
        if (!text) return text;
        return text
            .replace(/<(\w+)(?:\s+[^>]*)?>[\s\S]*?<\/\1>/gi, '')
            .replace(/<[^>]+\/>/gi, '')
            .replace(/<\/?[\w]+[^>]*>/gi, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SETTINGS MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    function getDefaultSettings() {
        return {
            // Main settings (flat structure)
            charName: DEFAULTS.CHAR_NAME,
            profileId: "",
            profileName: "Current",
            mainPrompt: DEFAULTS.MAIN_PROMPT,
            prefill: DEFAULTS.PREFILL,
            maxResponseTokens: DEFAULTS.MAX_RESPONSE,
            maxContextTokens: DEFAULTS.MAX_CONTEXT,
            avatarUrl: DEFAULTS.AVATAR,
            promptTemplate: DEFAULTS.PROMPT_TEMPLATE,

            // Behavior settings
            autoHypeChance: DEFAULTS.AUTO_HYPE_CHANCE,
            cooldownMessages: DEFAULTS.COOLDOWN,
            storeAndSendEnabled: false,
            storeAndSendCount: DEFAULTS.STORE_SEND_COUNT,
            autoDismissSeconds: DEFAULTS.AUTO_DISMISS,
            outputPosition: DEFAULTS.OUTPUT_POSITION,
            keyboardShortcutEnabled: DEFAULTS.KEYBOARD_SHORTCUT,

            // CSS settings
            useCustomCSS: false,
            selectedCSSPreset: "Default",
            cssPresets: {},

            // Prompt Library
            promptLibrary: {
                "Default Hype Bot": {
                    mainPrompt: DEFAULTS.MAIN_PROMPT,
                    prefill: DEFAULTS.PREFILL,
                    description: "The default cheerleader prompt"
                },
                "Sarcastic Commentator": {
                    mainPrompt: "You are a sarcastic commentator. Make a short, witty, slightly snarky comment on the current story. Keep it brief (1-2 sentences). Be funny but not mean.",
                    prefill: "Oh, how interesting...",
                    description: "A sarcastic take on the roleplay"
                },
                "Dramatic Narrator": {
                    mainPrompt: "You are a dramatic narrator. Make a short, theatrical comment on the current story as if narrating an epic tale. Keep it brief (1-2 sentences). Be dramatic and cinematic.",
                    prefill: "And so it came to pass...",
                    description: "Epic dramatic narration style"
                }
            },

            // Presets
            presets: {
                "Default": {
                    charName: DEFAULTS.CHAR_NAME,
                    mainPrompt: DEFAULTS.MAIN_PROMPT,
                    prefill: DEFAULTS.PREFILL,
                    maxResponseTokens: DEFAULTS.MAX_RESPONSE,
                    maxContextTokens: DEFAULTS.MAX_CONTEXT,
                    autoHypeChance: DEFAULTS.AUTO_HYPE_CHANCE,
                    cooldownMessages: DEFAULTS.COOLDOWN,
                    avatarUrl: DEFAULTS.AVATAR,
                    storeAndSendEnabled: false,
                    storeAndSendCount: DEFAULTS.STORE_SEND_COUNT,
                    profileId: "",
                    profileName: "Current",
                    promptTemplate: DEFAULTS.PROMPT_TEMPLATE
                }
            },
            activePreset: "Default"
        };
    }

    function getSettings() {
        if (State.cache) return State.cache;

        const { extensionSettings } = getContext();

        if (!extensionSettings[EXTENSION_NAME]) {
            extensionSettings[EXTENSION_NAME] = getDefaultSettings();
        }

        const settings = extensionSettings[EXTENSION_NAME];

        // Migrate from old personas format to flat structure
        if (settings.personas && settings.personas.length > 0) {
            const persona = settings.personas[settings.activePersonaIndex || 0] || settings.personas[0];
            settings.charName = persona.name || settings.charName || DEFAULTS.CHAR_NAME;
            settings.profileId = persona.profileId || settings.profileId || "";
            settings.profileName = persona.profileName || settings.profileName || "Current";
            settings.mainPrompt = persona.mainPrompt || settings.mainPrompt || DEFAULTS.MAIN_PROMPT;
            settings.prefill = persona.prefill || settings.prefill || DEFAULTS.PREFILL;
            settings.maxResponseTokens = persona.maxResponseTokens || settings.maxResponseTokens || DEFAULTS.MAX_RESPONSE;
            settings.maxContextTokens = persona.maxContextTokens || settings.maxContextTokens || DEFAULTS.MAX_CONTEXT;
            settings.avatarUrl = persona.avatarUrl || settings.avatarUrl || DEFAULTS.AVATAR;
            settings.promptTemplate = persona.promptTemplate || settings.promptTemplate || DEFAULTS.PROMPT_TEMPLATE;
            // Remove old personas data
            delete settings.personas;
            delete settings.activePersonaIndex;
        }

        // Ensure new settings exist
        if (settings.autoDismissSeconds === undefined) settings.autoDismissSeconds = DEFAULTS.AUTO_DISMISS;
        if (settings.outputPosition === undefined) settings.outputPosition = DEFAULTS.OUTPUT_POSITION;
        if (settings.keyboardShortcutEnabled === undefined) settings.keyboardShortcutEnabled = DEFAULTS.KEYBOARD_SHORTCUT;
        if (!settings.promptLibrary) {
            settings.promptLibrary = getDefaultSettings().promptLibrary;
        }
        if (!settings.promptTemplate) {
            settings.promptTemplate = DEFAULTS.PROMPT_TEMPLATE;
        }
        if (!settings.charName) {
            settings.charName = DEFAULTS.CHAR_NAME;
        }

        State.cache = settings;
        return settings;
    }

    // Alias for backwards compatibility - now just returns settings directly
    function getActivePersona() {
        return getSettings();
    }

    function saveSettings() {
        clearTimeout(State.saveTimer);
        State.saveTimer = setTimeout(() => {
            const { saveSettingsDebounced } = getContext();
            if (saveSettingsDebounced) {
                saveSettingsDebounced();
                log('Settings saved');
            }
        }, 300);
    }

    function invalidateCache() {
        State.cache = null;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HISTORY MANAGEMENT (localStorage - separate from settings for performance)
    // ═══════════════════════════════════════════════════════════════════════════

    function getChatId() {
        const ctx = getContext();
        if (ctx.chat_metadata?.chat_id) return ctx.chat_metadata.chat_id;
        const charName = ctx.characters?.[ctx.characterId]?.name || 'unknown';
        return `${charName}_${ctx.chatId || ctx.chat?.length || 0}`;
    }

    function getHistoryStorage() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            error('Failed to read history:', e);
            return {};
        }
    }

    function saveHistoryStorage(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            error('Failed to save history:', e);
        }
    }

    function getChatHistory() {
        const chatId = getChatId();
        const storage = getHistoryStorage();
        return storage[chatId] || [];
    }

    function addToChatHistory(message) {
        if (!message || message.trim().length <= 2) return;

        const chatId = getChatId();
        const storage = getHistoryStorage();
        if (!storage[chatId]) storage[chatId] = [];
        storage[chatId].push({
            text: message,
            timestamp: Date.now(),
            persona: getSettings().charName
        });

        // Limit history per chat to prevent bloat
        if (storage[chatId].length > 100) {
            storage[chatId] = storage[chatId].slice(-100);
        }

        saveHistoryStorage(storage);
        updateHistoryCount();
    }

    function clearChatHistory() {
        const chatId = getChatId();
        const storage = getHistoryStorage();
        delete storage[chatId];
        saveHistoryStorage(storage);
        updateHistoryCount();
    }

    function updateHistoryCount() {
        const history = getChatHistory();
        $('#cheerleader-history-count').text(`History: ${history.length} messages (this chat)`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CSS MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    function getCSS(name) {
        if (BUILTIN_CSS[name]) return BUILTIN_CSS[name];
        const settings = getSettings();
        return settings.cssPresets?.[name] || BUILTIN_CSS["Default"];
    }

    function isBuiltinCSS(name) {
        return name in BUILTIN_CSS;
    }

    function applyCSSPreset() {
        const settings = getSettings();
        $('#cheerleader-custom-style').remove();

        // Always apply the selected CSS preset
        const presetName = settings.selectedCSSPreset || 'Default';
        $('<style id="cheerleader-custom-style">').text(getCSS(presetName)).appendTo('head');
    }

    function updateCSSDropdown() {
        const settings = getSettings();
        const $select = $('#cheerleader-css-preset-select').empty();

        Object.keys(BUILTIN_CSS).forEach(name => {
            $select.append($('<option>', { value: name, text: `${name} (built-in)` }));
        });

        if (settings.cssPresets) {
            Object.keys(settings.cssPresets).forEach(name => {
                $select.append($('<option>', { value: name, text: name }));
            });
        }

        const currentPreset = settings.selectedCSSPreset || 'Default';
        $select.val(currentPreset);

        // Show editor with current preset
        $('#cheerleader-css-editor-section').show();
        $('#cheerleader-css-editor').val(getCSS(currentPreset));
        const builtin = isBuiltinCSS(currentPreset);
        $('#cheerleader-css-editor').prop('readonly', builtin);
        $('#cheerleader-css-readonly-badge').toggle(builtin);
        $('#cheerleader-css-save').toggle(!builtin);
        $('#cheerleader-css-delete').prop('disabled', builtin);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EXPORT/IMPORT FUNCTIONALITY
    // ═══════════════════════════════════════════════════════════════════════════

    function exportSettings() {
        const settings = getSettings();
        const history = getHistoryStorage();

        const exportData = {
            version: "2.0.0",
            timestamp: Date.now(),
            settings: JSON.parse(JSON.stringify(settings)),
            history: history
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cheerleader-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        toastr.success('Settings exported!');
    }

    function importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (!data.settings) {
                    throw new Error('Invalid backup file format');
                }

                // Import settings
                const { extensionSettings } = getContext();
                extensionSettings[EXTENSION_NAME] = data.settings;
                invalidateCache();

                // Import history if present
                if (data.history) {
                    saveHistoryStorage(data.history);
                }

                saveSettings();
                updateUI();
                initProfileDropdown();

                toastr.success('Settings imported!');
            } catch (err) {
                error('Import failed:', err);
                toastr.error('Failed to import: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // OUTPUT DISPLAY
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Makes an element draggable and resizable
     * @param {jQuery} $element - The element to make draggable/resizable
     * @param {jQuery} $dragHandle - The element to use as drag handle
     */
    function makeFloatingInteractive($element, $dragHandle) {
        let isDragging = false;
        let isResizing = false;
        let startX, startY, startLeft, startTop, startWidth, startHeight;

        // Add resize handle
        const $resizeHandle = $('<div class="cheerleader-resize-handle"></div>');
        $element.append($resizeHandle);

        // Load saved position/size
        const saved = getSettings().floatingPosition || {};
        if (saved.left !== undefined) {
            $element.css({
                left: saved.left + 'px',
                top: saved.top + 'px',
                right: 'auto',
                bottom: 'auto',
                width: saved.width ? saved.width + 'px' : '400px',
                height: saved.height ? saved.height + 'px' : 'auto'
            });
        }

        // Drag functionality
        $dragHandle.css('cursor', 'move');
        $dragHandle.on('mousedown', (e) => {
            if ($(e.target).is('#close-cheerleader-bar')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = $element[0].getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            e.preventDefault();
        });

        // Resize functionality
        $resizeHandle.on('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = $element.outerWidth();
            startHeight = $element.outerHeight();
            e.preventDefault();
            e.stopPropagation();
        });

        $(document).on('mousemove.cheerleaderFloat', (e) => {
            if (isDragging) {
                const newLeft = startLeft + (e.clientX - startX);
                const newTop = startTop + (e.clientY - startY);
                $element.css({
                    left: Math.max(0, newLeft) + 'px',
                    top: Math.max(0, newTop) + 'px',
                    right: 'auto',
                    bottom: 'auto'
                });
            } else if (isResizing) {
                const newWidth = Math.max(200, startWidth + (e.clientX - startX));
                const newHeight = Math.max(80, startHeight + (e.clientY - startY));
                $element.css({
                    width: newWidth + 'px',
                    height: newHeight + 'px'
                });
            }
        });

        $(document).on('mouseup.cheerleaderFloat', () => {
            if (isDragging || isResizing) {
                // Save position
                const rect = $element[0].getBoundingClientRect();
                const s = getSettings();
                s.floatingPosition = {
                    left: rect.left,
                    top: rect.top,
                    width: $element.outerWidth(),
                    height: $element.outerHeight()
                };
                saveSettings();
            }
            isDragging = false;
            isResizing = false;
        });
    }

    function showHypeOutput(text) {
        const settings = getSettings();
        const persona = getActivePersona();
        let avatarUrl = persona.avatarUrl || '';
        const charName = persona.charName || 'Cheerleader';

        // Handle Windows paths
        if (avatarUrl?.match(/^[A-Za-z]:\\/)) {
            avatarUrl = 'file:///' + avatarUrl.replace(/\\/g, '/');
        }

        let avatarHtml;

        if (avatarUrl) {
            avatarHtml = `<img id="cheerleader-avatar" src="${avatarUrl}" onerror="this.style.display='none'">`;
        } else {
            avatarHtml = `<span id="cheerleader-avatar-emoji">🎉</span>`;
        }

        let $bar = $('#cheerleader-output-bar');

        if ($bar.length === 0) {
            $bar = $('<div id="cheerleader-output-bar">').css('display', 'none').html(`
                <div class="cheerleader-header">
                    <span id="cheerleader-header">${avatarHtml}<span id="cheerleader-name">${charName}</span></span>
                    <span id="close-cheerleader-bar" title="Close (Esc)">✕</span>
                </div>
                <div id="cheerleader-output-content"></div>
            `);

            // Position based on settings
            const position = settings.outputPosition || 'after_chat';
            switch (position) {
                case 'before_chat':
                    $('#chat').length ? $('#chat').before($bar) : $('body').append($bar);
                    break;
                case 'floating':
                    $bar.addClass('cheerleader-floating');
                    $bar.css({
                        position: 'fixed',
                        bottom: '100px',
                        right: '20px',
                        zIndex: '9999',
                        width: '400px',
                        minWidth: '200px',
                        minHeight: '80px',
                        overflow: 'auto'
                    });
                    $('body').append($bar);
                    makeFloatingInteractive($bar, $bar.find('.cheerleader-header'));
                    break;
                case 'after_chat':
                default:
                    $('#chat').length ? $('#chat').after($bar) : $('body').append($bar);
            }

            $bar.on('click', '#close-cheerleader-bar', () => $bar.slideUp());
        } else {
            $('#cheerleader-header').html(`${avatarHtml}<span id="cheerleader-name">${charName}</span>`);
        }

        $('#cheerleader-output-content').text(text);
        $bar.slideDown(200);

        addToChatHistory(text);
        State.messagesSinceLastHype = 0;

        // Auto-dismiss if enabled
        clearTimeout(State.autoDismissTimer);
        if (settings.autoDismissSeconds > 0) {
            State.autoDismissTimer = setTimeout(() => {
                $bar.slideUp(200);
            }, settings.autoDismissSeconds * 1000);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HYPE GENERATION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Replaces SillyTavern macros in text ({{user}}, {{char}}, etc.)
     * @param {string} text - Text containing macros
     * @returns {string} Text with macros replaced
     */
    function replaceMacros(text) {
        if (!text) return text;
        const ctx = getContext();
        if (ctx.substituteParams) {
            return ctx.substituteParams(text);
        }
        // Fallback: basic replacement if substituteParams not available
        const userName = ctx.name1 || 'User';
        const charName = ctx.name2 || 'Character';
        return text
            .replace(/\{\{user\}\}/gi, userName)
            .replace(/\{\{char\}\}/gi, charName);
    }

    /**
     * Gets the user's persona description from SillyTavern settings
     * @returns {string|null} The persona description or null
     */
    function getUserPersona() {
        const ctx = getContext();
        const powerUser = ctx.powerUserSettings;
        if (powerUser?.persona_description) {
            return powerUser.persona_description;
        }
        return null;
    }

    /**
     * Gathers all available data for template placeholders
     * @returns {Object} Data object with all placeholder values
     */
    function gatherTemplateData() {
        const ctx = getContext();
        const settings = getSettings();
        const persona = getActivePersona();
        
        const userName = ctx.name1 || 'User';
        const charName = ctx.name2 || 'Character';
        
        // Main prompt
        const mainPrompt = replaceMacros(persona.mainPrompt || DEFAULTS.MAIN_PROMPT);
        
        // User persona
        const userPersonaRaw = getUserPersona();
        const userPersona = userPersonaRaw ? `[User Persona - ${userName}]\n${replaceMacros(userPersonaRaw)}` : '';
        
        // Character info
        let charInfo = '';
        const charId = ctx.characterId;
        if (charId !== undefined && ctx.characters?.[charId]) {
            const char = ctx.characters[charId];
            charInfo = `[Character - ${charName}]\n`;
            charInfo += `Name: ${char.name}\n`;
            if (char.description) {
                charInfo += `Description: ${replaceMacros(char.description)}\n`;
            }
            if (char.personality) {
                charInfo += `Personality: ${replaceMacros(char.personality)}\n`;
            }
            if (char.scenario) {
                charInfo += `Scenario: ${replaceMacros(char.scenario)}\n`;
            }
        }
        
        // Chat history (will be handled specially)
        const chatHistory = [];
        if (ctx.chat?.length) {
            for (const msg of ctx.chat) {
                if (msg.is_system) continue;
                let content = stripXmlTags(msg.mes || "").replace(/<br\s*\/?>/gi, '\n');
                if (!content.trim()) continue;
                const speaker = msg.is_user ? userName : charName;
                chatHistory.push({ 
                    role: msg.is_user ? "user" : "assistant", 
                    content: content,
                    name: speaker
                });
            }
        }
        
        // Previous hype
        let previousHype = '';
        const hypeHistory = getChatHistory();
        if (settings.storeAndSendEnabled && hypeHistory.length > 0) {
            const count = parseInt(settings.storeAndSendCount) || 4;
            const recentHype = hypeHistory.slice(-count).map(entry => {
                const msg = typeof entry === 'string' ? entry : entry.text;
                return `[Your previous commentary]: ${msg}`;
            });
            previousHype = recentHype.join('\n');
        }
        
        // Prefill
        const prefill = persona.prefill ? replaceMacros(persona.prefill) : '';
        
        return {
            main_prompt: mainPrompt,
            user_persona: userPersona,
            char_info: charInfo,
            chat_history: chatHistory, // Array, handled specially
            previous_hype: previousHype,
            prefill: prefill,
            user: userName,
            char: charName,
            // Conditionals
            if_user_persona: !!userPersonaRaw,
            if_char_info: !!charInfo,
            if_previous_hype: !!previousHype,
            if_prefill: !!prefill
        };
    }

    /**
     * Builds the messages array from a template
     * @param {string} templateJson - JSON template string
     * @param {Object} data - Data from gatherTemplateData()
     * @param {number} maxContextTokens - Max tokens for context
     * @returns {Object} { messages: Array, prefillText: string }
     */
    function buildMessagesFromTemplate(templateJson, data, maxContextTokens) {
        let template;
        try {
            template = JSON.parse(templateJson);
        } catch (e) {
            error('Invalid template JSON:', e);
            throw new Error('Invalid prompt template JSON. Please check your template syntax.');
        }
        
        if (!Array.isArray(template)) {
            throw new Error('Prompt template must be a JSON array.');
        }
        
        const messages = [];
        let prefillText = '';
        let chatHistoryInserted = false;
        
        for (const item of template) {
            // Check if this is a chat history marker
            if (item.marker === '{{chat_history}}') {
                // Calculate available tokens
                const currentTokens = messages.reduce((acc, m) => acc + estimateTokens(m.content), 0);
                const available = Math.max(0, maxContextTokens - currentTokens - 300);
                
                // Add chat history messages (trimmed to fit)
                let tokens = 0;
                const validHistory = [];
                for (let i = data.chat_history.length - 1; i >= 0; i--) {
                    const t = estimateTokens(data.chat_history[i].content);
                    if (tokens + t > available) break;
                    tokens += t;
                    validHistory.unshift(data.chat_history[i]);
                }
                messages.push(...validHistory);
                chatHistoryInserted = true;
                continue;
            }
            
            // Check enabled condition
            if (item.enabled !== undefined) {
                const conditionKey = item.enabled.replace(/\{\{|\}\}/g, '');
                if (data[conditionKey] === false || data[conditionKey] === '' || data[conditionKey] === null) {
                    continue;
                }
            }
            
            // Replace placeholders in content
            let content = item.content || '';
            for (const [key, value] of Object.entries(data)) {
                if (typeof value === 'string') {
                    content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
                }
            }
            
            // Skip empty content
            if (!content.trim()) continue;
            
            // Track prefill for later stripping
            if (item.role === 'assistant' && content === data.prefill && data.prefill) {
                prefillText = content;
            }
            
            messages.push({
                role: item.role || 'system',
                content: content
            });
        }
        
        // Fallback: if chat history wasn't inserted via marker, add it at the end
        if (!chatHistoryInserted && data.chat_history.length > 0) {
            const currentTokens = messages.reduce((acc, m) => acc + estimateTokens(m.content), 0);
            const available = Math.max(0, maxContextTokens - currentTokens - 300);
            
            let tokens = 0;
            const validHistory = [];
            for (let i = data.chat_history.length - 1; i >= 0; i--) {
                const t = estimateTokens(data.chat_history[i].content);
                if (tokens + t > available) break;
                tokens += t;
                validHistory.unshift(data.chat_history[i]);
            }
            
            // Insert before the last message if it's an assistant (prefill)
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
                messages.splice(messages.length - 1, 0, ...validHistory);
            } else {
                messages.push(...validHistory);
            }
        }
        
        return { messages, prefillText };
    }

    async function generateHype() {
        if (State.isGenerating) {
            toastr.warning('Already generating...');
            return;
        }

        const ctx = getContext();
        const settings = getSettings();
        const persona = getActivePersona();

        // Set loading state
        State.isGenerating = true;
        updateButtonState(true);
        toastr.info("Generating Hype...");

        try {
            if (!persona.profileId) {
                throw new Error("No Connection Profile selected. Open Settings → Cheerleader.");
            }

            // Gather template data
            const data = gatherTemplateData();
            const maxCtx = parseInt(persona.maxContextTokens) || DEFAULTS.MAX_CONTEXT;
            
            // Build messages from template
            const template = persona.promptTemplate || DEFAULTS.PROMPT_TEMPLATE;
            const { messages, prefillText } = buildMessagesFromTemplate(template, data, maxCtx);

            // Send request
            const svc = ctx.ConnectionManagerRequestService;
            if (!svc?.sendRequest) throw new Error("Connection Service not available.");

            const maxResp = parseInt(persona.maxResponseTokens) || DEFAULTS.MAX_RESPONSE;
            const response = await svc.sendRequest(persona.profileId, messages, maxResp);

            if (!response) throw new Error("No response from API.");

            let text = "";
            if (typeof response === 'string') text = response;
            else if (response.content) text = response.content;
            else if (response.choices?.[0]) {
                text = response.choices[0].message?.content || response.choices[0].text || "";
            }

            if (!text) throw new Error("Empty response content.");

            // Strip prefill from response
            if (prefillText && text.startsWith(prefillText)) {
                text = text.substring(prefillText.length).trim();
            }

            showHypeOutput(text);
            toastr.success("Hype generated!");

        } catch (e) {
            error("Generation failed:", e);
            toastr.error(`Error: ${e.message}`);
        } finally {
            State.isGenerating = false;
            updateButtonState(false);
        }
    }

    function updateButtonState(loading) {
        const $btn = $('#cheerleader-hype-btn');
        if (loading) {
            $btn.addClass('cheerleader-loading').css('pointerEvents', 'none').html('⏳');
        } else {
            $btn.removeClass('cheerleader-loading').css('pointerEvents', 'auto').html('🎉');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UI COMPONENTS
    // ═══════════════════════════════════════════════════════════════════════════

    function updateUI() {
        const s = getSettings();
        const persona = getActivePersona();

        // Persona fields
        $('#cheerleader-char-name').val(persona.charName || DEFAULTS.CHAR_NAME);
        $('#cheerleader-main-prompt').val(persona.mainPrompt || DEFAULTS.MAIN_PROMPT);
        $('#cheerleader-prefill').val(persona.prefill || DEFAULTS.PREFILL);
        $('#cheerleader-max-response').val(persona.maxResponseTokens || DEFAULTS.MAX_RESPONSE);
        $('#cheerleader-max-context').val(persona.maxContextTokens || DEFAULTS.MAX_CONTEXT);

        // Global settings
        $('#cheerleader-auto-hype').val(s.autoHypeChance || 0);
        $('#cheerleader-auto-hype-value').text(s.autoHypeChance || 0);
        $('#cheerleader-cooldown').val(s.cooldownMessages || 0);
        $('#cheerleader-avatar').val(persona.avatarUrl || '');

        const $preview = $('#cheerleader-avatar-preview');
        const $clearBtn = $('#cheerleader-avatar-clear');
        if (persona.avatarUrl) {
            $preview.attr('src', persona.avatarUrl).show();
            $clearBtn.show();
        } else {
            $preview.hide();
            $clearBtn.hide();
        }

        $('#cheerleader-store-send-enabled').prop('checked', s.storeAndSendEnabled);
        $('#cheerleader-store-send-count').val(s.storeAndSendCount || 4);

        // New settings
        $('#cheerleader-auto-dismiss').val(s.autoDismissSeconds || 0);
        $('#cheerleader-output-position').val(s.outputPosition || 'after_chat');
        $('#cheerleader-keyboard-shortcut').prop('checked', s.keyboardShortcutEnabled !== false);

        updateHistoryCount();
        updateCooldownIndicator();

        // CSS
        updateCSSDropdown();
        applyCSSPreset();

        // Presets & Library
        updatePresetDropdown();
        updatePromptLibraryDropdown();
        
        // Prompt template
        $('#cheerleader-prompt-template').val(s.promptTemplate || DEFAULTS.PROMPT_TEMPLATE);
    }

    function updatePresetDropdown() {
        const s = getSettings();
        const $select = $('#cheerleader-preset-select').empty();

        if (s.presets) {
            Object.keys(s.presets).forEach(name => {
                $select.append($('<option>', { value: name, text: name }));
            });
        }

        $select.val(s.activePreset || "Default");
        $('#cheerleader-delete-preset').prop('disabled', s.activePreset === "Default");
    }

    function updatePromptLibraryDropdown() {
        const s = getSettings();
        const $select = $('#cheerleader-prompt-library-select').empty();

        if (s.promptLibrary) {
            Object.keys(s.promptLibrary).sort().forEach(name => {
                $select.append($('<option>', { value: name, text: name }));
            });
        }
    }

    function showPromptEditorPopup(editName = null) {
        const s = getSettings();
        const isEdit = editName !== null;
        const existingPrompt = isEdit ? s.promptLibrary?.[editName] : null;

        const html = `
            <div id="cheerleader-prompt-editor-overlay"></div>
            <div id="cheerleader-prompt-editor-popup">
                <div class="cheerleader-editor-header">
                    <h3>${isEdit ? 'Edit' : 'New'} Prompt Template</h3>
                    <span id="close-prompt-editor">✕</span>
                </div>
                <div class="cheerleader-editor-section">
                    <label>Template Name</label>
                    <input id="prompt-editor-name" class="text_pole" type="text" value="${isEdit ? editName : ''}" placeholder="My Custom Prompt" ${isEdit ? 'readonly style="opacity:0.7"' : ''}>
                </div>
                <div class="cheerleader-editor-section">
                    <label>Description (optional)</label>
                    <input id="prompt-editor-description" class="text_pole" type="text" value="${existingPrompt?.description || ''}" placeholder="Brief description of this prompt style">
                </div>
                <div class="cheerleader-editor-section">
                    <label>Main Prompt</label>
                    <textarea id="prompt-editor-main" class="text_pole" rows="6" placeholder="You are a hype-bot...">${existingPrompt?.mainPrompt || ''}</textarea>
                </div>
                <div class="cheerleader-editor-section">
                    <label>Prefill (optional)</label>
                    <textarea id="prompt-editor-prefill" class="text_pole" rows="2" placeholder="Starting text for AI response">${existingPrompt?.prefill || ''}</textarea>
                </div>
                <div class="cheerleader-editor-actions">
                    <button id="prompt-editor-cancel" class="menu_button">Cancel</button>
                    <button id="prompt-editor-save" class="menu_button menu_button_icon"><i class="fa-solid fa-save"></i> Save</button>
                </div>
            </div>
        `;

        $('body').append(html);

        // Focus the name field for new prompts
        if (!isEdit) {
            $('#prompt-editor-name').focus();
        }

        // Bind events
        const closePopup = () => {
            $('#cheerleader-prompt-editor-popup, #cheerleader-prompt-editor-overlay').remove();
        };

        $('#close-prompt-editor, #prompt-editor-cancel, #cheerleader-prompt-editor-overlay').on('click', closePopup);

        $('#prompt-editor-save').on('click', () => {
            const name = $('#prompt-editor-name').val().trim();
            const mainPrompt = $('#prompt-editor-main').val().trim();
            const prefill = $('#prompt-editor-prefill').val().trim();
            const description = $('#prompt-editor-description').val().trim();

            if (!name) {
                toastr.error('Please enter a template name');
                return;
            }

            if (!mainPrompt) {
                toastr.error('Please enter a main prompt');
                return;
            }

            // Check for duplicate name (only for new prompts)
            if (!isEdit && s.promptLibrary?.[name]) {
                toastr.error('A prompt with this name already exists');
                return;
            }

            s.promptLibrary = s.promptLibrary || {};
            s.promptLibrary[name] = {
                mainPrompt: mainPrompt,
                prefill: prefill,
                description: description
            };

            saveSettings();
            updatePromptLibraryDropdown();
            $('#cheerleader-prompt-library-select').val(name);

            toastr.success(isEdit ? 'Prompt updated!' : 'Prompt saved to library!');
            closePopup();
        });

        // Handle Enter key in name field
        $('#prompt-editor-name').on('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                $('#prompt-editor-main').focus();
            }
        });
    }

    function loadPromptFromLibrary(name) {
        const s = getSettings();
        const prompt = s.promptLibrary?.[name];
        if (!prompt) return;

        s.mainPrompt = prompt.mainPrompt;
        if (prompt.prefill) {
            s.prefill = prompt.prefill;
        }

        saveSettings();
        updateUI();
        toastr.success(`Loaded prompt: ${name}`);
    }

    function deletePromptFromLibrary(name) {
        if (!confirm(`Delete prompt template: ${name}?`)) return;

        const s = getSettings();
        delete s.promptLibrary?.[name];
        saveSettings();
        updatePromptLibraryDropdown();
        toastr.success('Prompt deleted');
    }

    function saveCurrentPromptToLibrary() {
        const s = getSettings();
        const name = prompt('Save prompt as:', s.charName + ' Prompt');
        if (!name) return;

        if (s.promptLibrary?.[name]) {
            if (!confirm(`Overwrite existing prompt "${name}"?`)) return;
        }

        s.promptLibrary = s.promptLibrary || {};
        s.promptLibrary[name] = {
            mainPrompt: s.mainPrompt || DEFAULTS.MAIN_PROMPT,
            prefill: s.prefill || '',
            description: `Saved from ${s.charName}`
        };

        saveSettings();
        updatePromptLibraryDropdown();
        $('#cheerleader-prompt-library-select').val(name);
        toastr.success(`Saved prompt: ${name}`);
    }

    function updateCooldownIndicator() {
        const s = getSettings();
        const cooldown = parseInt(s.cooldownMessages) || 0;
        const remaining = Math.max(0, cooldown - State.messagesSinceLastHype);

        const $indicator = $('#cheerleader-cooldown-indicator');
        if (cooldown > 0 && remaining > 0) {
            $indicator.show().text(`Cooldown: ${remaining} messages remaining`);
        } else {
            $indicator.hide();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PRESET MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    function loadPreset(name) {
        const settings = getSettings();
        const preset = settings.presets?.[name];
        if (!preset) return;

        // Load all preset values directly into settings
        Object.assign(settings, {
            mainPrompt: preset.mainPrompt || DEFAULTS.MAIN_PROMPT,
            prefill: preset.prefill || DEFAULTS.PREFILL,
            charName: preset.charName || DEFAULTS.CHAR_NAME,
            maxResponseTokens: preset.maxResponseTokens || DEFAULTS.MAX_RESPONSE,
            maxContextTokens: preset.maxContextTokens || DEFAULTS.MAX_CONTEXT,
            avatarUrl: preset.avatarUrl || '',
            profileId: preset.profileId || "",
            profileName: preset.profileName || "Current",
            promptTemplate: preset.promptTemplate || DEFAULTS.PROMPT_TEMPLATE,
            autoHypeChance: preset.autoHypeChance || 0,
            cooldownMessages: preset.cooldownMessages || 0,
            storeAndSendEnabled: preset.storeAndSendEnabled || false,
            storeAndSendCount: preset.storeAndSendCount || DEFAULTS.STORE_SEND_COUNT,
            activePreset: name
        });

        invalidateCache();
        saveSettings();
        updateUI();
        initProfileDropdown();
        toastr.info(`Loaded preset: ${name}`);
    }

    function saveCurrentToPreset() {
        const name = prompt("Save Preset Name:", getSettings().activePreset || "Default");
        if (!name) return;

        const settings = getSettings();

        settings.presets = settings.presets || {};
        settings.presets[name] = {
            mainPrompt: settings.mainPrompt || DEFAULTS.MAIN_PROMPT,
            prefill: settings.prefill || DEFAULTS.PREFILL,
            charName: settings.charName || DEFAULTS.CHAR_NAME,
            maxResponseTokens: settings.maxResponseTokens || DEFAULTS.MAX_RESPONSE,
            maxContextTokens: settings.maxContextTokens || DEFAULTS.MAX_CONTEXT,
            autoHypeChance: settings.autoHypeChance || 0,
            cooldownMessages: settings.cooldownMessages || 0,
            avatarUrl: settings.avatarUrl || '',
            storeAndSendEnabled: settings.storeAndSendEnabled || false,
            storeAndSendCount: settings.storeAndSendCount || DEFAULTS.STORE_SEND_COUNT,
            profileId: settings.profileId || "",
            profileName: settings.profileName || "Current",
            promptTemplate: settings.promptTemplate || DEFAULTS.PROMPT_TEMPLATE
        };
        settings.activePreset = name;

        saveSettings();
        updateUI();
        toastr.success(`Saved preset: ${name}`);
    }

    function deleteCurrentPreset() {
        const settings = getSettings();
        const name = settings.activePreset;
        if (name === "Default" || !name) return;
        if (!confirm(`Delete preset: ${name}?`)) return;

        delete settings.presets?.[name];
        settings.activePreset = "Default";
        saveSettings();
        loadPreset("Default");
    }

    function resetToFactory() {
        if (!confirm("Reset all Cheerleader settings to defaults? This will also clear history.")) return;

        const { extensionSettings } = getContext();
        extensionSettings[EXTENSION_NAME] = getDefaultSettings();
        invalidateCache();
        saveSettings();

        // Clear history
        localStorage.removeItem(STORAGE_KEY);

        updateUI();
        initProfileDropdown();
        toastr.success("Settings reset to defaults!");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // AVATAR HANDLING
    // ═══════════════════════════════════════════════════════════════════════════

    function resizeImage(file, maxSize = 128) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;

                    if (width > maxSize || height > maxSize) {
                        if (width > height) {
                            height = (height / width) * maxSize;
                            width = maxSize;
                        } else {
                            width = (width / height) * maxSize;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    // Clear canvas for transparency support
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    // Use PNG to preserve transparency
                    resolve(canvas.toDataURL('image/png'));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async function handleAvatarUpload(file) {
        if (!file) return;

        toastr.info('Processing avatar...');

        try {
            const timestamp = Date.now();
            const ext = file.name.split('.').pop() || 'png';
            const filename = `avatar_${timestamp}.${ext}`;

            const formData = new FormData();
            formData.append('avatar', file, filename);

            const response = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-File-Folder': 'user/extensions/SillyTavern-Cheerleader/avatars'
                }
            });

            if (response.ok) {
                const result = await response.json();
                const avatarPath = result.path || `/user/extensions/SillyTavern-Cheerleader/avatars/${filename}`;

                getSettings().avatarUrl = avatarPath;
                $('#cheerleader-avatar').val(avatarPath);
                $('#cheerleader-avatar-preview').attr('src', avatarPath).show();
                saveSettings();
                toastr.success('Avatar uploaded');
                return;
            }
        } catch (e) {
            log('File API not available, using resized image');
        }

        try {
            const resizedDataUrl = await resizeImage(file, 128);
            getSettings().avatarUrl = resizedDataUrl;
            $('#cheerleader-avatar').val('[Embedded Thumbnail]');
            $('#cheerleader-avatar-preview').attr('src', resizedDataUrl).show();
            saveSettings();
            toastr.success('Avatar set (thumbnail)');
        } catch (e) {
            error('Avatar processing failed:', e);
            toastr.error('Failed to process avatar');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PROFILE DROPDOWN
    // ═══════════════════════════════════════════════════════════════════════════

    function initProfileDropdown() {
        const ctx = getContext();
        const svc = ctx.ConnectionManagerRequestService;

        if (svc?.handleDropdown) {
            const settings = getSettings();
            svc.handleDropdown('#cheerleader-profile', settings.profileId, (profile) => {
                settings.profileId = profile?.id || '';
                settings.profileName = profile?.name || 'Current';
                saveSettings();
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // KEYBOARD SHORTCUTS
    // ═══════════════════════════════════════════════════════════════════════════

    function setupKeyboardShortcuts() {
        $(document).on('keydown.cheerleader', (e) => {
            const settings = getSettings();
            if (!settings.keyboardShortcutEnabled) return;

            // Ctrl+Shift+H to generate hype
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                generateHype();
            }

            // Escape to close output bar
            if (e.key === 'Escape') {
                $('#cheerleader-output-bar').slideUp(200);
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENT BINDINGS
    // ═══════════════════════════════════════════════════════════════════════════

    function bindEvents() {
        const $doc = $(document);
        const debouncedSave = debounce(saveSettings, 500);

        // Settings text inputs
        $doc.on('input', '#cheerleader-char-name', function () {
            getSettings().charName = this.value;
            debouncedSave();
        });

        $doc.on('input', '#cheerleader-main-prompt', function () {
            getSettings().mainPrompt = this.value;
            debouncedSave();
        });

        $doc.on('input', '#cheerleader-prefill', function () {
            getSettings().prefill = this.value;
            debouncedSave();
        });

        $doc.on('input', '#cheerleader-max-context', function () {
            getSettings().maxContextTokens = parseInt(this.value) || DEFAULTS.MAX_CONTEXT;
            debouncedSave();
        });

        $doc.on('input', '#cheerleader-max-response', function () {
            getSettings().maxResponseTokens = parseInt(this.value) || DEFAULTS.MAX_RESPONSE;
            debouncedSave();
        });

        // Global settings
        $doc.on('input', '#cheerleader-auto-hype', function () {
            const val = parseInt(this.value) || 0;
            getSettings().autoHypeChance = val;
            $('#cheerleader-auto-hype-value').text(val);
            debouncedSave();
        });

        $doc.on('input', '#cheerleader-cooldown', function () {
            getSettings().cooldownMessages = parseInt(this.value) || 0;
            debouncedSave();
            updateCooldownIndicator();
        });

        $doc.on('input', '#cheerleader-auto-dismiss', function () {
            getSettings().autoDismissSeconds = parseInt(this.value) || 0;
            debouncedSave();
        });

        $doc.on('change', '#cheerleader-output-position', function () {
            getSettings().outputPosition = this.value;
            saveSettings();
            // Remove existing bar to re-create in new position
            $('#cheerleader-output-bar').remove();
        });

        $doc.on('change', '#cheerleader-keyboard-shortcut', function () {
            getSettings().keyboardShortcutEnabled = this.checked;
            saveSettings();
        });

        // Avatar
        $doc.on('input', '#cheerleader-avatar', function () {
            const url = this.value;
            getSettings().avatarUrl = url;
            const $preview = $('#cheerleader-avatar-preview');
            url ? $preview.attr('src', url).show() : $preview.hide();
            debouncedSave();
        });

        $doc.on('click', '#cheerleader-avatar-browse', () => $('#cheerleader-avatar-file').click());

        $doc.on('click', '#cheerleader-avatar-clear', () => {
            getSettings().avatarUrl = '';
            $('#cheerleader-avatar').val('');
            $('#cheerleader-avatar-preview').hide();
            saveSettings();
        });

        $doc.on('change', '#cheerleader-avatar-file', function () {
            handleAvatarUpload(this.files[0]);
            this.value = '';
        });

        // Presets
        $doc.on('change', '#cheerleader-preset-select', function () { loadPreset(this.value); });
        $doc.on('click', '#cheerleader-save-preset', saveCurrentToPreset);
        $doc.on('click', '#cheerleader-delete-preset', deleteCurrentPreset);
        $doc.on('click', '#cheerleader-factory-reset', resetToFactory);

        // Prompt Library
        $doc.on('click', '#cheerleader-prompt-load', () => {
            const name = $('#cheerleader-prompt-library-select').val();
            if (name) loadPromptFromLibrary(name);
        });
        $doc.on('click', '#cheerleader-prompt-delete', () => {
            const name = $('#cheerleader-prompt-library-select').val();
            if (name) deletePromptFromLibrary(name);
        });
        $doc.on('click', '#cheerleader-prompt-new', () => showPromptEditorPopup());
        $doc.on('click', '#cheerleader-save-to-library', saveCurrentPromptToLibrary);

        // Export/Import
        $doc.on('click', '#cheerleader-export', exportSettings);
        $doc.on('click', '#cheerleader-import-btn', () => $('#cheerleader-import-file').click());
        $doc.on('change', '#cheerleader-import-file', function () {
            if (this.files[0]) {
                importSettings(this.files[0]);
                this.value = '';
            }
        });

        // Store & Send
        $doc.on('change', '#cheerleader-store-send-enabled', function () {
            getSettings().storeAndSendEnabled = this.checked;
            saveSettings();
        });

        $doc.on('input', '#cheerleader-store-send-count', function () {
            getSettings().storeAndSendCount = Math.max(1, parseInt(this.value) || 4);
            debouncedSave();
        });

        $doc.on('click', '#cheerleader-clear-history', () => {
            if (confirm('Clear hype history for this chat?')) {
                clearChatHistory();
                toastr.success('History cleared');
            }
        });

        $doc.on('click', '#cheerleader-view-history', showHistoryPopup);

        // CSS Presets
        $doc.on('change', '#cheerleader-css-preset-select', function () {
            const name = this.value;
            const s = getSettings();
            s.selectedCSSPreset = name;
            saveSettings();
            applyCSSPreset();

            // Remove existing output bar so it uses new styles
            $('#cheerleader-output-bar').remove();

            $('#cheerleader-css-editor-section').show();
            $('#cheerleader-css-editor').val(getCSS(name));

            const builtin = isBuiltinCSS(name);
            $('#cheerleader-css-editor').prop('readonly', builtin);
            $('#cheerleader-css-readonly-badge').toggle(builtin);
            $('#cheerleader-css-save').toggle(!builtin);
            $('#cheerleader-css-delete').prop('disabled', builtin);
        });

        $doc.on('click', '#cheerleader-css-new', () => {
            const name = prompt('New CSS Preset Name:')?.trim();
            if (!name) return;
            if (isBuiltinCSS(name) || getSettings().cssPresets?.[name]) {
                toastr.error('Preset already exists');
                return;
            }

            const s = getSettings();
            s.cssPresets = s.cssPresets || {};
            s.cssPresets[name] = BUILTIN_CSS["Default"];
            s.selectedCSSPreset = name;
            saveSettings();

            updateCSSDropdown();
            $('#cheerleader-css-preset-select').val(name).trigger('change');
            toastr.success(`Created: ${name}`);
        });

        $doc.on('click', '#cheerleader-css-delete', () => {
            const name = $('#cheerleader-css-preset-select').val();
            if (isBuiltinCSS(name)) {
                toastr.error('Cannot delete built-in presets');
                return;
            }
            if (!confirm(`Delete CSS preset: ${name}?`)) return;

            const s = getSettings();
            delete s.cssPresets?.[name];
            s.selectedCSSPreset = 'Default';
            saveSettings();

            updateCSSDropdown();
            applyCSSPreset();
            $('#cheerleader-css-preset-select').trigger('change');
            toastr.success('Deleted');
        });

        $doc.on('click', '#cheerleader-css-save', () => {
            const name = $('#cheerleader-css-preset-select').val();
            if (isBuiltinCSS(name)) {
                toastr.error('Cannot edit built-in presets');
                return;
            }

            const s = getSettings();
            s.cssPresets = s.cssPresets || {};
            s.cssPresets[name] = $('#cheerleader-css-editor').val();
            saveSettings();
            applyCSSPreset();
            toastr.success('CSS saved');
        });

        // Prompt Template Editor
        $doc.on('click', '#cheerleader-template-save', () => {
            const template = $('#cheerleader-prompt-template').val();
            try {
                JSON.parse(template);
                getSettings().promptTemplate = template;
                saveSettings();
                toastr.success('Template saved!');
            } catch (e) {
                toastr.error('Invalid JSON: ' + e.message);
            }
        });

        $doc.on('click', '#cheerleader-template-reset', () => {
            if (!confirm('Reset template to default?')) return;
            getSettings().promptTemplate = DEFAULTS.PROMPT_TEMPLATE;
            $('#cheerleader-prompt-template').val(DEFAULTS.PROMPT_TEMPLATE);
            saveSettings();
            toastr.success('Template reset to default');
        });

        $doc.on('click', '#cheerleader-template-validate', () => {
            const template = $('#cheerleader-prompt-template').val();
            try {
                const parsed = JSON.parse(template);
                if (!Array.isArray(parsed)) {
                    toastr.error('Template must be a JSON array');
                    return;
                }
                toastr.success('Valid JSON! Template has ' + parsed.length + ' entries.');
            } catch (e) {
                toastr.error('Invalid JSON: ' + e.message);
            }
        });

        $doc.on('click', '#cheerleader-template-preview', () => {
            const template = $('#cheerleader-prompt-template').val();
            try {
                const data = gatherTemplateData();
                const maxCtx = parseInt(getSettings().maxContextTokens) || DEFAULTS.MAX_CONTEXT;
                const { messages } = buildMessagesFromTemplate(template, data, maxCtx);
                
                let html = messages.map(msg => {
                    const roleClass = msg.role || 'system';
                    const content = (msg.content || '').substring(0, 500) + (msg.content?.length > 500 ? '...' : '');
                    return `<div class="cheerleader-preview-message ${roleClass}">
                        <div class="cheerleader-preview-role">${msg.role}${msg.name ? ' (' + msg.name + ')' : ''}</div>
                        <div class="cheerleader-preview-content">${$('<div>').text(content).html()}</div>
                    </div>`;
                }).join('');
                
                $('body').append(`
                    <div id="cheerleader-prompt-editor-overlay"></div>
                    <div id="cheerleader-template-preview-popup">
                        <div class="cheerleader-editor-header">
                            <h3>Preview: ${messages.length} Messages</h3>
                            <span id="close-template-preview">✕</span>
                        </div>
                        <div>${html}</div>
                    </div>
                `);
                
                $('#close-template-preview, #cheerleader-prompt-editor-overlay').on('click', () => {
                    $('#cheerleader-template-preview-popup, #cheerleader-prompt-editor-overlay').remove();
                });
            } catch (e) {
                toastr.error('Preview failed: ' + e.message);
            }
        });

        // Hype button
        $doc.on('click', '#cheerleader-hype-btn', (e) => {
            e.preventDefault();
            generateHype();
        });
    }

    function showHistoryPopup() {
        const history = getChatHistory();
        if (!history.length) {
            toastr.info('No hype messages yet.');
            return;
        }

        const html = history.map((entry, i) => {
            const msg = typeof entry === 'string' ? entry : entry.text;
            const persona = entry.persona || 'Cheerleader';
            const time = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '';
            return `<div class="cheerleader-history-item">
                <div class="cheerleader-history-meta"><b>${i + 1}.</b> <span class="cheerleader-history-persona">${persona}</span> ${time ? `<span class="cheerleader-history-time">${time}</span>` : ''}</div>
                <div class="cheerleader-history-text">${msg}</div>
            </div>`;
        }).join('');

        $('body').append(`
            <div id="cheerleader-history-overlay"></div>
            <div id="cheerleader-history-popup">
                <div class="cheerleader-popup-header">
                    <h3>🎉 Hype History (${history.length})</h3>
                    <span id="close-history-popup">✕</span>
                </div>
                <div class="cheerleader-history-list">${html}</div>
            </div>
        `);

        $(document).one('click', '#close-history-popup, #cheerleader-history-overlay', () => {
            $('#cheerleader-history-popup, #cheerleader-history-overlay').remove();
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HYPE BUTTON (Optimized - No global MutationObserver)
    // ═══════════════════════════════════════════════════════════════════════════

    function addHypeButton() {
        if ($('#cheerleader-hype-btn').length) return;

        const $btn = $('<div id="cheerleader-hype-btn" class="drawer-icon interactable" title="Generate Hype! (Ctrl+Shift+H)">🎉</div>')
            .css({
                cursor: 'pointer', fontSize: '20px', width: '34px', height: '34px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 5px',
                transition: 'transform 0.2s, opacity 0.2s'
            });

        if ($('#send_textarea').length) {
            $btn.insertBefore('#send_textarea');
        } else if ($('#chat_input_controls').length) {
            $('#chat_input_controls').append($btn);
        }
    }

    function setupButtonObserver() {
        // Only observe the specific container, not the entire body
        const targetNode = document.getElementById('chat_input_controls')
            || document.getElementById('form_sheld')
            || document.querySelector('.chat-input-container');

        if (!targetNode) {
            // Fallback: check periodically but less frequently
            setTimeout(() => {
                addHypeButton();
                setupButtonObserver();
            }, 2000);
            return;
        }

        // Disconnect any existing observer
        if (State.buttonObserver) {
            State.buttonObserver.disconnect();
        }

        State.buttonObserver = new MutationObserver((mutations) => {
            // Only check if our button was removed
            if (!document.getElementById('cheerleader-hype-btn')) {
                addHypeButton();
            }
        });

        State.buttonObserver.observe(targetNode, {
            childList: true,
            subtree: false // Only direct children, not deep subtree
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // AUTO-HYPE
    // ═══════════════════════════════════════════════════════════════════════════

    function setupAutoHype() {
        const ctx = getContext();
        if (!ctx.eventSource) return;

        ctx.eventSource.on('character_message_rendered', () => {
            const s = getSettings();
            const chance = parseInt(s.autoHypeChance) || 0;
            const cooldown = parseInt(s.cooldownMessages) || 0;

            const currentCtx = getContext();
            const userMsgs = (currentCtx.chat || []).filter(m => m.is_user);
            if (userMsgs.length < 1) return;

            State.messagesSinceLastHype++;
            updateCooldownIndicator();

            if (cooldown > 0 && State.messagesSinceLastHype <= cooldown) return;

            if (chance > 0 && Math.random() * 100 < chance) {
                setTimeout(generateHype, 500);
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UI TEMPLATE
    // ═══════════════════════════════════════════════════════════════════════════

    const settingsHtml = `
    <div id="cheerleader-settings" class="extension_settings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>🎉 Cheerleader Hype Bot</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <div class="cheerleader-panel">
                    <!-- Preset Selection -->
                    <div class="cheerleader-section">
                        <label>Preset</label>
                        <div class="cheerleader-row">
                            <select id="cheerleader-preset-select" class="text_pole"></select>
                            <button id="cheerleader-save-preset" class="menu_button" title="Save Current Settings as Preset"><i class="fa-solid fa-save"></i></button>
                            <button id="cheerleader-delete-preset" class="menu_button" title="Delete Preset"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>

                    <!-- Connection Profile -->
                    <div class="cheerleader-section">
                        <label>Connection Profile <span class="cheerleader-tooltip" title="API connection to use for generating hype messages">?</span></label>
                        <select id="cheerleader-profile" class="text_pole"></select>
                    </div>

                    <!-- Persona & Prompt Drawer -->
                    <div class="cheerleader-drawer">
                        <div class="inline-drawer">
                            <div class="inline-drawer-toggle inline-drawer-header">
                                <b>Persona & Prompt</b>
                                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                            </div>
                            <div class="inline-drawer-content">
                                <div class="cheerleader-section">
                                    <label>Character Name</label>
                                    <div class="cheerleader-row">
                                        <img id="cheerleader-avatar-preview" class="cheerleader-avatar-preview">
                                        <input id="cheerleader-char-name" class="text_pole" type="text" placeholder="Cheerleader" style="flex:1">
                                        <button id="cheerleader-avatar-browse" class="menu_button" title="Set Avatar"><i class="fa-solid fa-image"></i></button>
                                        <button id="cheerleader-avatar-clear" class="menu_button" title="Clear Avatar" style="display:none"><i class="fa-solid fa-times"></i></button>
                                    </div>
                                    <input type="file" id="cheerleader-avatar-file" accept="image/*" style="display:none">
                                    <input id="cheerleader-avatar" type="hidden">
                                </div>

                                <div class="cheerleader-section">
                                    <label>Prompt Template <span class="cheerleader-tooltip" title="Load a saved prompt or create your own">?</span></label>
                                    <div class="cheerleader-row">
                                        <select id="cheerleader-prompt-library-select" class="text_pole" style="flex:1"></select>
                                        <button id="cheerleader-prompt-load" class="menu_button" title="Load Selected Prompt"><i class="fa-solid fa-download"></i></button>
                                        <button id="cheerleader-prompt-delete" class="menu_button" title="Delete Selected"><i class="fa-solid fa-trash"></i></button>
                                    </div>
                                </div>

                                <div class="cheerleader-section">
                                    <label>Main Prompt <span class="cheerleader-tooltip" title="System instructions for the hype bot">?</span></label>
                                    <textarea id="cheerleader-main-prompt" class="text_pole" rows="4" placeholder="You are a hype-bot..."></textarea>
                                </div>

                                <div class="cheerleader-section">
                                    <label>Prefill <span class="cheerleader-tooltip" title="Starting text for the AI response (will be stripped from output)">?</span></label>
                                    <textarea id="cheerleader-prefill" class="text_pole" rows="2" placeholder="Wow, that's intense!"></textarea>
                                </div>

                                <div class="cheerleader-row" style="gap:8px">
                                    <button id="cheerleader-save-to-library" class="menu_button" style="flex:1" title="Save current prompt to library"><i class="fa-solid fa-bookmark"></i> Save to Library</button>
                                    <button id="cheerleader-prompt-new" class="menu_button" style="flex:1" title="Create new from scratch"><i class="fa-solid fa-plus"></i> New Prompt</button>
                                </div>

                                <div class="cheerleader-row" style="margin-top:12px">
                                    <div class="cheerleader-section" style="flex:1">
                                        <label>Max Context</label>
                                        <input id="cheerleader-max-context" class="text_pole" type="number" value="4096">
                                    </div>
                                    <div class="cheerleader-section" style="flex:1">
                                        <label>Max Response</label>
                                        <input id="cheerleader-max-response" class="text_pole" type="number" value="200">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Prompt Structure Editor Drawer -->
                    <div class="cheerleader-drawer">
                        <div class="inline-drawer">
                            <div class="inline-drawer-toggle inline-drawer-header">
                                <b>Prompt Structure (Advanced)</b>
                                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                            </div>
                            <div class="inline-drawer-content">
                                <div class="cheerleader-section">
                                    <div class="cheerleader-info-box">
                                        <b>Full control over the API request structure.</b><br>
                                        Edit the JSON template below to customize exactly how messages are sent to the API.
                                    </div>
                                </div>
                                <div class="cheerleader-section">
                                    <label>Available Placeholders:</label>
                                    <div class="cheerleader-placeholder-list">
                                        <code>{{main_prompt}}</code> - Your main system prompt<br>
                                        <code>{{user_persona}}</code> - User's persona description<br>
                                        <code>{{char_info}}</code> - Character info (name, description, personality, scenario)<br>
                                        <code>{{chat_history}}</code> - Chat messages (use as marker)<br>
                                        <code>{{previous_hype}}</code> - Previous hype messages<br>
                                        <code>{{prefill}}</code> - Assistant prefill text<br>
                                        <code>{{user}}</code> / <code>{{char}}</code> - User/Character names
                                    </div>
                                </div>
                                <div class="cheerleader-section">
                                    <label>Conditional Fields:</label>
                                    <div class="cheerleader-placeholder-list">
                                        Use <code>"enabled": "{{if_user_persona}}"</code> etc. to conditionally include messages.<br>
                                        Available: <code>if_user_persona</code>, <code>if_char_info</code>, <code>if_previous_hype</code>, <code>if_prefill</code>
                                    </div>
                                </div>
                                <div class="cheerleader-section">
                                    <label>Prompt Template (JSON)</label>
                                    <textarea id="cheerleader-prompt-template" class="text_pole cheerleader-code" rows="16" spellcheck="false"></textarea>
                                </div>
                                <div class="cheerleader-row" style="gap:10px">
                                    <button id="cheerleader-template-save" class="menu_button" style="flex:1"><i class="fa-solid fa-save"></i> Save Template</button>
                                    <button id="cheerleader-template-reset" class="menu_button" style="flex:1"><i class="fa-solid fa-undo"></i> Reset to Default</button>
                                </div>
                                <div class="cheerleader-row" style="gap:10px; margin-top:10px">
                                    <button id="cheerleader-template-preview" class="menu_button" style="flex:1"><i class="fa-solid fa-eye"></i> Preview Output</button>
                                    <button id="cheerleader-template-validate" class="menu_button" style="flex:1"><i class="fa-solid fa-check"></i> Validate JSON</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Auto-Hype Settings Drawer -->
                    <div class="cheerleader-drawer">
                        <div class="inline-drawer">
                            <div class="inline-drawer-toggle inline-drawer-header">
                                <b>Auto-Hype Settings</b>
                                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                            </div>
                            <div class="inline-drawer-content">
                                <div class="cheerleader-section">
                                    <label>Auto-Hype Chance: <span id="cheerleader-auto-hype-value">0</span>% <span class="cheerleader-tooltip" title="Chance to automatically generate hype after each AI message">?</span></label>
                                    <input id="cheerleader-auto-hype" type="range" min="0" max="100" value="0">
                                </div>

                                <div class="cheerleader-section">
                                    <label>Cooldown (messages) <span class="cheerleader-tooltip" title="Minimum messages between auto-hypes">?</span></label>
                                    <input id="cheerleader-cooldown" class="text_pole" type="number" min="0" placeholder="0 = none">
                                    <div id="cheerleader-cooldown-indicator" class="cheerleader-cooldown-indicator" style="display:none"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Display Settings Drawer -->
                    <div class="cheerleader-drawer">
                        <div class="inline-drawer">
                            <div class="inline-drawer-toggle inline-drawer-header">
                                <b>Display Settings</b>
                                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                            </div>
                            <div class="inline-drawer-content">
                                <div class="cheerleader-section">
                                    <label>Output Position</label>
                                    <select id="cheerleader-output-position" class="text_pole">
                                        <option value="after_chat">After Chat (Bottom)</option>
                                        <option value="before_chat">Before Chat (Top)</option>
                                        <option value="floating">Floating (Bottom Right)</option>
                                    </select>
                                </div>

                                <div class="cheerleader-section">
                                    <label>Auto-Dismiss (seconds) <span class="cheerleader-tooltip" title="Automatically hide output after N seconds (0 = never)">?</span></label>
                                    <input id="cheerleader-auto-dismiss" class="text_pole" type="number" min="0" placeholder="0 = never">
                                </div>

                                <div class="cheerleader-section">
                                    <label class="checkbox_label">
                                        <input type="checkbox" id="cheerleader-keyboard-shortcut">
                                        Enable Keyboard Shortcut (Ctrl+Shift+H)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Store & Send Section -->
                    <div class="cheerleader-drawer">
                        <div class="inline-drawer">
                            <div class="inline-drawer-toggle inline-drawer-header">
                                <b>Store & Send Messages</b>
                                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                            </div>
                            <div class="inline-drawer-content">
                                <div class="cheerleader-section">
                                    <label class="checkbox_label">
                                        <input type="checkbox" id="cheerleader-store-send-enabled">
                                        Include previous hype in context
                                    </label>
                                    <div class="cheerleader-section">
                                        <label>Messages to include</label>
                                        <input id="cheerleader-store-send-count" class="text_pole" type="number" min="1" value="4">
                                    </div>
                                    <div class="cheerleader-row" style="justify-content:space-between">
                                        <span id="cheerleader-history-count">History: 0 messages</span>
                                        <div class="cheerleader-row">
                                            <button id="cheerleader-view-history" class="menu_button" title="View History"><i class="fa-solid fa-eye"></i></button>
                                            <button id="cheerleader-clear-history" class="menu_button" title="Clear History"><i class="fa-solid fa-trash"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Custom CSS Section -->
                    <div class="cheerleader-drawer">
                        <div class="inline-drawer">
                            <div class="inline-drawer-toggle inline-drawer-header">
                                <b>Theme</b>
                                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                            </div>
                            <div class="inline-drawer-content">
                                <div class="cheerleader-section">
                                    <label>CSS Preset</label>
                                    <div class="cheerleader-row">
                                        <select id="cheerleader-css-preset-select" class="text_pole"></select>
                                        <button id="cheerleader-css-new" class="menu_button" title="New CSS Preset"><i class="fa-solid fa-plus"></i></button>
                                        <button id="cheerleader-css-delete" class="menu_button" title="Delete CSS Preset"><i class="fa-solid fa-trash"></i></button>
                                    </div>
                                </div>
                                <div id="cheerleader-css-editor-section" style="display:none">
                                    <label>CSS Editor <span id="cheerleader-css-readonly-badge" class="readonly-badge">(read-only)</span></label>
                                    <textarea id="cheerleader-css-editor" class="text_pole cheerleader-code" rows="8"></textarea>
                                    <button id="cheerleader-css-save" class="menu_button cheerleader-full-width">Save CSS</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Backup & Reset -->
                    <div class="cheerleader-drawer">
                        <div class="inline-drawer">
                            <div class="inline-drawer-toggle inline-drawer-header">
                                <b>Backup & Reset</b>
                                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                            </div>
                            <div class="inline-drawer-content">
                                <div class="cheerleader-row" style="gap:10px">
                                    <button id="cheerleader-export" class="menu_button" style="flex:1"><i class="fa-solid fa-download"></i> Export</button>
                                    <button id="cheerleader-import-btn" class="menu_button" style="flex:1"><i class="fa-solid fa-upload"></i> Import</button>
                                </div>
                                <input type="file" id="cheerleader-import-file" accept=".json" style="display:none">
                                <button id="cheerleader-factory-reset" class="menu_button cheerleader-full-width cheerleader-danger">🔄 Reset All Settings</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <style>
        .cheerleader-panel { padding: 10px; display: flex; flex-direction: column; gap: 10px; }
        .cheerleader-section { display: flex; flex-direction: column; gap: 5px; }
        .cheerleader-row { display: flex; gap: 5px; align-items: center; }
        .cheerleader-drawer { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--SmartThemeBorderColor); }
        .cheerleader-full-width { width: 100%; margin-top: 10px; }
        .cheerleader-code { font-family: monospace; font-size: 12px; }
        .cheerleader-avatar-preview { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; display: none; border: 1px solid var(--SmartThemeBorderColor); }
        .readonly-badge { color: orange; font-size: 0.8em; }
        #cheerleader-auto-hype { width: 100%; }
        .cheerleader-header { font-weight: bold; color: gold; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        #cheerleader-header { display: flex; align-items: center; }
        #close-cheerleader-bar { cursor: pointer; opacity: 0.7; transition: opacity 0.2s; }
        #close-cheerleader-bar:hover { opacity: 1; }
        #cheerleader-output-content { font-style: italic; }

        /* Floating output bar styles */
        .cheerleader-floating { box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
        .cheerleader-floating .cheerleader-header { cursor: move; user-select: none; }
        .cheerleader-floating #cheerleader-output-content { flex: 1; overflow: auto; }
        .cheerleader-resize-handle {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 16px;
            height: 16px;
            cursor: se-resize;
            background: linear-gradient(135deg, transparent 50%, var(--SmartThemeBorderColor) 50%);
            border-radius: 0 0 10px 0;
            opacity: 0.6;
            transition: opacity 0.2s;
        }
        .cheerleader-resize-handle:hover { opacity: 1; }

        .cheerleader-tooltip { cursor: help; color: var(--SmartThemeQuoteColor); margin-left: 4px; font-size: 0.85em; }
        .cheerleader-cooldown-indicator { font-size: 0.85em; color: var(--SmartThemeQuoteColor); padding: 4px 8px; background: var(--SmartThemeBlurTintColor); border-radius: 4px; margin-top: 5px; }
        .cheerleader-danger { background: rgba(200, 50, 50, 0.3) !important; }
        .cheerleader-danger:hover { background: rgba(200, 50, 50, 0.5) !important; }
        #cheerleader-hype-btn.cheerleader-loading { opacity: 0.5; animation: cheerleader-pulse 1s infinite; }
        @keyframes cheerleader-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

        /* History popup styles */
        #cheerleader-history-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9998; }
        #cheerleader-history-popup {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: var(--SmartThemeBodyColor); border: 2px solid var(--SmartThemeBorderColor);
            border-radius: 10px; padding: 20px; max-width: 500px; max-height: 70vh; z-index: 9999;
        }
        .cheerleader-popup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .cheerleader-popup-header h3 { margin: 0; color: gold; }
        #close-history-popup { cursor: pointer; font-size: 1.5em; opacity: 0.7; transition: opacity 0.2s; }
        #close-history-popup:hover { opacity: 1; }
        .cheerleader-history-list { max-height: 50vh; overflow-y: auto; }
        .cheerleader-history-item { padding: 10px; margin-bottom: 8px; background: var(--SmartThemeBlurTintColor); border-radius: 6px; }
        .cheerleader-history-meta { font-size: 0.85em; color: var(--SmartThemeQuoteColor); margin-bottom: 4px; display: flex; gap: 8px; align-items: center; }
        .cheerleader-history-persona { color: gold; font-weight: bold; }
        .cheerleader-history-time { font-size: 0.8em; opacity: 0.7; }
        .cheerleader-history-text { font-style: italic; }

        /* Prompt Editor Popup */
        #cheerleader-prompt-editor-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9998; }
        #cheerleader-prompt-editor-popup {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: var(--SmartThemeBlurTintColor); border: 2px solid var(--SmartThemeBorderColor);
            border-radius: 10px; padding: 24px; width: 90%; max-width: 550px; max-height: 80vh; z-index: 9999;
            overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .cheerleader-editor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--SmartThemeBorderColor); }
        .cheerleader-editor-header h3 { margin: 0; color: var(--SmartThemeQuoteColor); font-size: 1.2em; }
        #close-prompt-editor { cursor: pointer; font-size: 1.3em; opacity: 0.6; transition: opacity 0.2s, transform 0.2s; padding: 4px; }
        #close-prompt-editor:hover { opacity: 1; transform: scale(1.1); }
        .cheerleader-editor-section { margin-bottom: 18px; }
        .cheerleader-editor-section label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9em; color: var(--SmartThemeBodyColor); text-shadow: none; }
        .cheerleader-editor-section input, .cheerleader-editor-section textarea {
            width: 100%; box-sizing: border-box;
            background: var(--SmartThemeBlurTintColor); border: 1px solid var(--SmartThemeBorderColor);
            border-radius: 6px; padding: 10px 12px; color: var(--SmartThemeBodyColor);
            font-size: 0.95em; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cheerleader-editor-section input:focus, .cheerleader-editor-section textarea:focus {
            outline: none; border-color: var(--SmartThemeQuoteColor); box-shadow: 0 0 0 2px rgba(255,215,0,0.15);
        }
        .cheerleader-editor-section input::placeholder, .cheerleader-editor-section textarea::placeholder {
            color: var(--SmartThemeBodyColor); opacity: 0.5;
        }
        .cheerleader-editor-section textarea { resize: vertical; min-height: 60px; line-height: 1.5; }
        .cheerleader-editor-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--SmartThemeBorderColor); }

        /* Prompt Structure Editor styles */
        .cheerleader-info-box {
            padding: 10px;
            background: rgba(100, 100, 255, 0.1);
            border: 1px solid rgba(100, 100, 255, 0.3);
            border-radius: 6px;
            font-size: 0.9em;
        }
        .cheerleader-placeholder-list {
            padding: 8px 12px;
            background: var(--SmartThemeBlurTintColor);
            border-radius: 4px;
            font-size: 0.85em;
            line-height: 1.6;
        }
        .cheerleader-placeholder-list code {
            background: rgba(0,0,0,0.3);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
            color: #ffa500;
        }
        #cheerleader-prompt-template {
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            tab-size: 2;
        }
        #cheerleader-template-preview-popup {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: var(--SmartThemeBodyColor); border: 2px solid var(--SmartThemeBorderColor);
            border-radius: 10px; padding: 20px; width: 90%; max-width: 700px; max-height: 80vh; z-index: 9999;
            overflow-y: auto;
        }
        .cheerleader-preview-message {
            margin: 8px 0;
            padding: 10px;
            border-radius: 6px;
            border-left: 4px solid;
        }
        .cheerleader-preview-message.system { background: rgba(100,100,255,0.1); border-color: #6666ff; }
        .cheerleader-preview-message.user { background: rgba(100,255,100,0.1); border-color: #66ff66; }
        .cheerleader-preview-message.assistant { background: rgba(255,100,100,0.1); border-color: #ff6666; }
        .cheerleader-preview-role { font-weight: bold; text-transform: uppercase; font-size: 0.8em; margin-bottom: 4px; }
        .cheerleader-preview-content { white-space: pre-wrap; word-break: break-word; font-size: 0.9em; max-height: 200px; overflow-y: auto; }
    </style>
    `;

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    function init() {
        if (!$('#extensions_settings').length) {
            error('#extensions_settings not found');
            return;
        }

        $('#extensions_settings').append(settingsHtml);

        bindEvents();
        updateUI();
        setupKeyboardShortcuts();

        // Delay profile dropdown init slightly to ensure ST is ready
        setTimeout(initProfileDropdown, 500);

        addHypeButton();
        setupButtonObserver();
        setupAutoHype();

        log('Initialized v2.0.0');
    }

    // Wait for jQuery
    if (typeof jQuery !== 'undefined') {
        jQuery(init);
    } else {
        error('jQuery not found');
    }
})();
