// SillyTavern Cheerleader Extension v3.0.0 - Major Feature Update
// Author: Antigravity
// v3 Features: Typewriter animation, confetti effects, mood detection, streak system,
//              quick reactions, statistics, slash commands, 7 CSS themes, touch support

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // CONSTANTS & CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════

    const EXTENSION_NAME = "SillyTavern-Cheerleader";
    const DEBUG = false;
    const STORAGE_KEY = 'cheerleader_history';
    const STATS_KEY = 'cheerleader_stats';

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
        TYPEWRITER_ENABLED: true,
        TYPEWRITER_SPEED: 30,
        CONFETTI_ENABLED: true,
        MOOD_ENABLED: true,
        REACTIONS_ENABLED: true,
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

    const MOODS = Object.freeze({
        excited: {
            keywords: ['amazing', 'incredible', 'awesome', 'fantastic', 'wonderful', 'brilliant', 'wow', 'omg', 'yes', 'perfect', 'love', 'best', 'great', 'epic', 'legendary'],
            emoji: '🔥',
            color: '#ff6b35',
            glow: 'rgba(255,107,53,0.3)',
            label: 'Hyped'
        },
        dramatic: {
            keywords: ['shocking', 'twist', 'betrayal', 'reveal', 'secret', 'dark', 'dangerous', 'death', 'tragic', 'doom', 'fate', 'destiny', 'ominous', 'shadow', 'fallen'],
            emoji: '⚡',
            color: '#9b59b6',
            glow: 'rgba(155,89,182,0.3)',
            label: 'Dramatic'
        },
        romantic: {
            keywords: ['love', 'heart', 'kiss', 'tender', 'sweet', 'gentle', 'passion', 'embrace', 'blush', 'affection', 'warmth', 'beautiful', 'intimate', 'adore', 'cherish'],
            emoji: '💖',
            color: '#e91e8c',
            glow: 'rgba(233,30,140,0.3)',
            label: 'Romantic'
        },
        funny: {
            keywords: ['haha', 'lol', 'funny', 'hilarious', 'joke', 'laugh', 'ridiculous', 'silly', 'comedy', 'absurd', 'prank', 'goofy', 'chaotic', 'wild', 'clown'],
            emoji: '😂',
            color: '#f1c40f',
            glow: 'rgba(241,196,15,0.3)',
            label: 'Comedy'
        },
        sad: {
            keywords: ['sad', 'cry', 'tears', 'grief', 'loss', 'pain', 'sorrow', 'melancholy', 'lonely', 'miss', 'goodbye', 'farewell', 'broken', 'regret', 'mourn'],
            emoji: '🥺',
            color: '#3498db',
            glow: 'rgba(52,152,219,0.3)',
            label: 'Emotional'
        },
        intense: {
            keywords: ['fight', 'battle', 'war', 'attack', 'power', 'strength', 'rage', 'fury', 'clash', 'explosion', 'destroy', 'unleash', 'strike', 'conquer', 'defeat'],
            emoji: '⚔️',
            color: '#e74c3c',
            glow: 'rgba(231,76,60,0.3)',
            label: 'Intense'
        },
        mysterious: {
            keywords: ['mystery', 'strange', 'unknown', 'hidden', 'puzzle', 'clue', 'enigma', 'whisper', 'ancient', 'prophecy', 'curse', 'magic', 'supernatural', 'eerie', 'cryptic'],
            emoji: '🔮',
            color: '#1abc9c',
            glow: 'rgba(26,188,156,0.3)',
            label: 'Mysterious'
        }
    });

    const REACTION_EMOJIS = ['🔥', '❤️', '😂', '😭', '🤯', '👏', '💀', '✨'];

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
        "Retro Terminal": `
            #cheerleader-output-bar {
                margin: 10px;
                padding: 15px;
                background: #0a0a0a;
                border: 1px solid #33ff33;
                border-radius: 2px;
                font-family: 'Courier New', monospace;
                box-shadow: 0 0 10px rgba(51,255,51,0.2), inset 0 0 60px rgba(51,255,51,0.03);
            }
            #cheerleader-avatar {
                height: 40px;
                width: 40px;
                object-fit: contain;
                margin-right: 10px;
                border-radius: 0;
                border: 1px solid #33ff33;
                filter: sepia(1) saturate(5) hue-rotate(70deg) brightness(1.2);
                background: transparent;
            }
            #cheerleader-avatar-emoji {
                margin-right: 8px;
                font-size: 1.5em;
                filter: drop-shadow(0 0 3px #33ff33);
            }
            #cheerleader-name {
                color: #33ff33 !important;
                text-shadow: 0 0 5px #33ff33;
                font-family: 'Courier New', monospace;
            }
            #cheerleader-name::before {
                content: '> ';
                opacity: 0.7;
            }
            #cheerleader-output-content {
                color: #33ff33;
                font-family: 'Courier New', monospace;
                text-shadow: 0 0 3px rgba(51,255,51,0.5);
            }
            #close-cheerleader-bar {
                color: #33ff33 !important;
            }
            .cheerleader-header {
                color: #33ff33 !important;
            }
        `,
        "Bubble Chat": `
            #cheerleader-output-bar {
                margin: 10px 10px 10px 60px;
                padding: 12px 18px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 20px 20px 20px 4px;
                box-shadow: 0 4px 15px rgba(102,126,234,0.3);
                position: relative;
            }
            #cheerleader-avatar {
                height: 44px;
                width: 44px;
                object-fit: cover;
                margin-right: 0;
                border-radius: 50%;
                border: 3px solid #764ba2;
                position: absolute;
                left: -54px;
                top: 50%;
                transform: translateY(-50%);
                background: transparent;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
            #cheerleader-avatar-emoji {
                position: absolute;
                left: -44px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 2em;
                margin: 0;
            }
            #cheerleader-name {
                color: rgba(255,255,255,0.9) !important;
                font-size: 0.85em;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            #cheerleader-output-content {
                color: #fff;
                font-style: normal;
                font-weight: 400;
            }
            #close-cheerleader-bar {
                color: rgba(255,255,255,0.7) !important;
            }
            #close-cheerleader-bar:hover {
                color: #fff !important;
            }
            .cheerleader-header {
                color: rgba(255,255,255,0.9) !important;
            }
        `,
        "Minimal Dark": `
            #cheerleader-output-bar {
                margin: 8px 10px;
                padding: 14px 18px;
                background: rgba(0,0,0,0.6);
                border: none;
                border-left: 3px solid #888;
                border-radius: 0 8px 8px 0;
                backdrop-filter: blur(10px);
            }
            #cheerleader-avatar {
                height: 32px;
                width: 32px;
                object-fit: contain;
                margin-right: 10px;
                border-radius: 50%;
                opacity: 0.9;
                background: transparent;
            }
            #cheerleader-avatar-emoji {
                margin-right: 8px;
                font-size: 1.3em;
                opacity: 0.9;
            }
            #cheerleader-name {
                color: #aaa !important;
                font-size: 0.85em;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            #cheerleader-output-content {
                color: #ddd;
                font-style: normal;
                font-size: 0.95em;
                line-height: 1.6;
            }
            #close-cheerleader-bar {
                color: #666 !important;
            }
            .cheerleader-header {
                color: #aaa !important;
                margin-bottom: 4px;
            }
        `,
        "Gradient Wave": `
            #cheerleader-output-bar {
                margin: 10px;
                padding: 16px 20px;
                background: linear-gradient(270deg, rgba(255,0,128,0.15), rgba(0,200,255,0.15), rgba(128,0,255,0.15), rgba(255,200,0,0.15));
                background-size: 400% 100%;
                animation: cheerleader-gradient-shift 8s ease infinite;
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 12px;
                backdrop-filter: blur(5px);
            }
            @keyframes cheerleader-gradient-shift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            #cheerleader-avatar {
                height: 44px;
                width: 44px;
                object-fit: contain;
                margin-right: 12px;
                border-radius: 12px;
                border: 2px solid rgba(255,255,255,0.2);
                background: transparent;
            }
            #cheerleader-avatar-emoji {
                margin-right: 10px;
                font-size: 1.8em;
            }
            #cheerleader-name {
                background: linear-gradient(90deg, #ff0080, #00c8ff, #8000ff);
                background-size: 200% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                animation: cheerleader-gradient-shift 3s ease infinite;
            }
            #cheerleader-output-content {
                font-style: normal;
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
        typewriterTimer: null,
        elements: {},
        buttonObserver: null,
        activePersonaIndex: 0,
        streak: 0,
        lastHypeTime: 0,
        confettiCanvas: null,
        confettiCtx: null,
        confettiParticles: [],
        confettiAnimFrame: null
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
            .replace(/<(think|script|style|hidden)(?:\s+[^>]*)?>[\s\S]*?<\/\1>/gi, '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MOOD DETECTION
    // ═══════════════════════════════════════════════════════════════════════════

    function detectMood(text) {
        if (!text) return null;
        const lower = text.toLowerCase();
        let bestMood = null;
        let bestScore = 0;

        for (const [mood, data] of Object.entries(MOODS)) {
            let score = 0;
            for (const keyword of data.keywords) {
                if (lower.includes(keyword)) score++;
            }
            if (score > bestScore) {
                bestScore = score;
                bestMood = mood;
            }
        }

        return bestScore >= 1 ? bestMood : null;
    }

    function getMoodData(mood) {
        return MOODS[mood] || null;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TYPEWRITER EFFECT
    // ═══════════════════════════════════════════════════════════════════════════

    function typewriterEffect($element, text, speed, callback) {
        clearInterval(State.typewriterTimer);
        $element.empty();

        const $textSpan = $('<span class="cheerleader-typewriter-text"></span>');
        const $cursor = $('<span class="cheerleader-typewriter-cursor">|</span>');
        $element.append($textSpan).append($cursor);

        let i = 0;
        State.typewriterTimer = setInterval(() => {
            if (i < text.length) {
                $textSpan.text($textSpan.text() + text.charAt(i));
                i++;
            } else {
                clearInterval(State.typewriterTimer);
                State.typewriterTimer = null;
                $cursor.addClass('cheerleader-cursor-fade');
                setTimeout(() => $cursor.remove(), 2000);
                if (callback) callback();
            }
        }, speed);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CONFETTI EFFECT
    // ═══════════════════════════════════════════════════════════════════════════

    function triggerConfetti() {
        if (!State.confettiCanvas) {
            const canvas = document.createElement('canvas');
            canvas.id = 'cheerleader-confetti';
            canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999';
            document.body.appendChild(canvas);
            State.confettiCanvas = canvas;
            State.confettiCtx = canvas.getContext('2d');
        }

        const canvas = State.confettiCanvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.display = 'block';

        const colors = ['#ff0080', '#00c8ff', '#ffd700', '#ff6b35', '#33ff33', '#9b59b6', '#e91e8c', '#1abc9c'];
        const shapes = ['circle', 'square', 'triangle'];

        State.confettiParticles = [];
        for (let i = 0; i < 80; i++) {
            State.confettiParticles.push({
                x: Math.random() * canvas.width,
                y: -20 - Math.random() * 100,
                size: 4 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                speedX: (Math.random() - 0.5) * 4,
                speedY: 2 + Math.random() * 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                opacity: 1,
                wobble: Math.random() * 10
            });
        }

        cancelAnimationFrame(State.confettiAnimFrame);
        animateConfetti();
    }

    function animateConfetti() {
        const ctx = State.confettiCtx;
        const canvas = State.confettiCanvas;
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let alive = false;
        for (const p of State.confettiParticles) {
            if (p.opacity <= 0) continue;
            alive = true;

            p.x += p.speedX + Math.sin(p.wobble) * 0.5;
            p.y += p.speedY;
            p.rotation += p.rotationSpeed;
            p.wobble += 0.05;

            if (p.y > canvas.height * 0.7) {
                p.opacity -= 0.02;
            }

            ctx.save();
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;

            if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.shape === 'square') {
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            } else {
                ctx.beginPath();
                ctx.moveTo(0, -p.size / 2);
                ctx.lineTo(p.size / 2, p.size / 2);
                ctx.lineTo(-p.size / 2, p.size / 2);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        }

        if (alive) {
            State.confettiAnimFrame = requestAnimationFrame(animateConfetti);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.display = 'none';
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STREAK SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════

    function updateStreak() {
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (now - State.lastHypeTime < fiveMinutes) {
            State.streak++;
        } else {
            State.streak = 1;
        }
        State.lastHypeTime = now;
        return State.streak;
    }

    function getStreakLabel(streak) {
        if (streak >= 10) return { text: 'LEGENDARY', emoji: '👑', class: 'legendary' };
        if (streak >= 7) return { text: 'ON FIRE', emoji: '🔥', class: 'on-fire' };
        if (streak >= 5) return { text: 'UNSTOPPABLE', emoji: '⚡', class: 'unstoppable' };
        if (streak >= 3) return { text: 'COMBO', emoji: '💥', class: 'combo' };
        return null;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STATISTICS
    // ═══════════════════════════════════════════════════════════════════════════

    function getStats() {
        try {
            const data = localStorage.getItem(STATS_KEY);
            return data ? JSON.parse(data) : {
                totalHypes: 0,
                totalSessions: 0,
                moodCounts: {},
                reactionCounts: {},
                longestStreak: 0,
                firstHypeDate: null,
                lastHypeDate: null,
                avgResponseLength: 0,
                totalResponseLength: 0
            };
        } catch (e) {
            return { totalHypes: 0, totalSessions: 0, moodCounts: {}, reactionCounts: {}, longestStreak: 0, firstHypeDate: null, lastHypeDate: null, avgResponseLength: 0, totalResponseLength: 0 };
        }
    }

    function saveStats(stats) {
        try {
            localStorage.setItem(STATS_KEY, JSON.stringify(stats));
        } catch (e) {
            error('Failed to save stats:', e);
        }
    }

    function recordHypeStat(text, mood) {
        const stats = getStats();
        stats.totalHypes++;
        if (!stats.firstHypeDate) stats.firstHypeDate = Date.now();
        stats.lastHypeDate = Date.now();

        if (mood) {
            stats.moodCounts[mood] = (stats.moodCounts[mood] || 0) + 1;
        }

        stats.totalResponseLength += (text || '').length;
        stats.avgResponseLength = Math.round(stats.totalResponseLength / stats.totalHypes);

        if (State.streak > stats.longestStreak) {
            stats.longestStreak = State.streak;
        }

        saveStats(stats);
    }

    function recordReactionStat(emoji) {
        const stats = getStats();
        stats.reactionCounts[emoji] = (stats.reactionCounts[emoji] || 0) + 1;
        saveStats(stats);
    }

    function showStatistics() {
        const stats = getStats();
        const allHistory = getHistoryStorage();
        const totalChats = Object.keys(allHistory).length;
        const totalMessages = Object.values(allHistory).reduce((sum, h) => sum + h.length, 0);

        const topMood = Object.entries(stats.moodCounts || {}).sort((a, b) => b[1] - a[1])[0];
        const topReaction = Object.entries(stats.reactionCounts || {}).sort((a, b) => b[1] - a[1])[0];

        const firstDate = stats.firstHypeDate ? new Date(stats.firstHypeDate).toLocaleDateString() : 'N/A';
        const daysSince = stats.firstHypeDate ? Math.ceil((Date.now() - stats.firstHypeDate) / 86400000) : 0;
        const hypesPerDay = daysSince > 0 ? (stats.totalHypes / daysSince).toFixed(1) : '0';

        const moodBars = Object.entries(stats.moodCounts || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([mood, count]) => {
                const data = getMoodData(mood);
                const pct = stats.totalHypes > 0 ? Math.round((count / stats.totalHypes) * 100) : 0;
                return `<div class="cheerleader-stat-bar-row">
                    <span class="cheerleader-stat-bar-label">${data ? data.emoji : ''} ${mood}</span>
                    <div class="cheerleader-stat-bar-track"><div class="cheerleader-stat-bar-fill" style="width:${pct}%;background:${data ? data.color : '#888'}"></div></div>
                    <span class="cheerleader-stat-bar-value">${count} (${pct}%)</span>
                </div>`;
            }).join('') || '<div style="opacity:0.5">No mood data yet</div>';

        const reactionList = Object.entries(stats.reactionCounts || {})
            .sort((a, b) => b[1] - a[1])
            .map(([emoji, count]) => `<span class="cheerleader-stat-reaction">${emoji} ${count}</span>`)
            .join('') || '<span style="opacity:0.5">No reactions yet</span>';

        $('body').append(`
            <div id="cheerleader-stats-overlay" class="cheerleader-overlay"></div>
            <div id="cheerleader-stats-popup" class="cheerleader-popup">
                <div class="cheerleader-popup-header">
                    <h3>📊 Cheerleader Statistics</h3>
                    <span id="close-stats-popup" class="cheerleader-popup-close">✕</span>
                </div>
                <div class="cheerleader-stats-grid">
                    <div class="cheerleader-stat-card">
                        <div class="cheerleader-stat-number">${stats.totalHypes}</div>
                        <div class="cheerleader-stat-label">Total Hypes</div>
                    </div>
                    <div class="cheerleader-stat-card">
                        <div class="cheerleader-stat-number">${stats.longestStreak}</div>
                        <div class="cheerleader-stat-label">Longest Streak</div>
                    </div>
                    <div class="cheerleader-stat-card">
                        <div class="cheerleader-stat-number">${totalChats}</div>
                        <div class="cheerleader-stat-label">Chats with Hype</div>
                    </div>
                    <div class="cheerleader-stat-card">
                        <div class="cheerleader-stat-number">${hypesPerDay}</div>
                        <div class="cheerleader-stat-label">Hypes/Day</div>
                    </div>
                </div>
                <div class="cheerleader-stats-section">
                    <h4>Mood Breakdown</h4>
                    ${moodBars}
                </div>
                <div class="cheerleader-stats-section">
                    <h4>Top Reactions</h4>
                    <div class="cheerleader-stat-reactions-row">${reactionList}</div>
                </div>
                <div class="cheerleader-stats-section cheerleader-stats-meta">
                    <div>📅 First hype: ${firstDate}</div>
                    <div>📝 Avg response: ${stats.avgResponseLength} chars</div>
                    <div>💬 Total messages stored: ${totalMessages}</div>
                    ${topMood ? `<div>🏆 Top mood: ${getMoodData(topMood[0])?.emoji || ''} ${topMood[0]} (${topMood[1]}x)</div>` : ''}
                    ${topReaction ? `<div>⭐ Fav reaction: ${topReaction[0]} (${topReaction[1]}x)</div>` : ''}
                </div>
            </div>
        `);

        $('#close-stats-popup, #cheerleader-stats-overlay').on('click', () => {
            $('#cheerleader-stats-popup, #cheerleader-stats-overlay').remove();
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SETTINGS MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    function getDefaultSettings() {
        return {
            charName: DEFAULTS.CHAR_NAME,
            profileId: "",
            profileName: "Current",
            mainPrompt: DEFAULTS.MAIN_PROMPT,
            prefill: DEFAULTS.PREFILL,
            maxResponseTokens: DEFAULTS.MAX_RESPONSE,
            maxContextTokens: DEFAULTS.MAX_CONTEXT,
            avatarUrl: DEFAULTS.AVATAR,
            promptTemplate: DEFAULTS.PROMPT_TEMPLATE,

            autoHypeChance: DEFAULTS.AUTO_HYPE_CHANCE,
            cooldownMessages: DEFAULTS.COOLDOWN,
            storeAndSendEnabled: false,
            storeAndSendCount: DEFAULTS.STORE_SEND_COUNT,
            autoDismissSeconds: DEFAULTS.AUTO_DISMISS,
            outputPosition: DEFAULTS.OUTPUT_POSITION,
            keyboardShortcutEnabled: DEFAULTS.KEYBOARD_SHORTCUT,

            typewriterEnabled: DEFAULTS.TYPEWRITER_ENABLED,
            typewriterSpeed: DEFAULTS.TYPEWRITER_SPEED,
            confettiEnabled: DEFAULTS.CONFETTI_ENABLED,
            moodEnabled: DEFAULTS.MOOD_ENABLED,
            reactionsEnabled: DEFAULTS.REACTIONS_ENABLED,

            useCustomCSS: false,
            selectedCSSPreset: "Default",
            cssPresets: {},

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

        // Migrate from old personas format
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
            delete settings.personas;
            delete settings.activePersonaIndex;
        }

        // Ensure all settings exist (handles upgrades from v2)
        if (settings.autoDismissSeconds === undefined) settings.autoDismissSeconds = DEFAULTS.AUTO_DISMISS;
        if (settings.outputPosition === undefined) settings.outputPosition = DEFAULTS.OUTPUT_POSITION;
        if (settings.keyboardShortcutEnabled === undefined) settings.keyboardShortcutEnabled = DEFAULTS.KEYBOARD_SHORTCUT;
        if (!settings.promptTemplate) settings.promptTemplate = DEFAULTS.PROMPT_TEMPLATE;
        if (!settings.charName) settings.charName = DEFAULTS.CHAR_NAME;
        if (settings.typewriterEnabled === undefined) settings.typewriterEnabled = DEFAULTS.TYPEWRITER_ENABLED;
        if (settings.typewriterSpeed === undefined) settings.typewriterSpeed = DEFAULTS.TYPEWRITER_SPEED;
        if (settings.confettiEnabled === undefined) settings.confettiEnabled = DEFAULTS.CONFETTI_ENABLED;
        if (settings.moodEnabled === undefined) settings.moodEnabled = DEFAULTS.MOOD_ENABLED;
        if (settings.reactionsEnabled === undefined) settings.reactionsEnabled = DEFAULTS.REACTIONS_ENABLED;

        State.cache = settings;
        return settings;
    }

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
    // HISTORY MANAGEMENT
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

    function addToChatHistory(message, mood) {
        if (!message || message.trim().length <= 2) return;

        const chatId = getChatId();
        const storage = getHistoryStorage();
        if (!storage[chatId]) storage[chatId] = [];
        storage[chatId].push({
            text: message,
            timestamp: Date.now(),
            persona: getSettings().charName,
            mood: mood || null,
            reactions: []
        });

        if (storage[chatId].length > 100) {
            storage[chatId] = storage[chatId].slice(-100);
        }

        saveHistoryStorage(storage);
        updateHistoryCount();
    }

    function addReactionToLastEntry(emoji) {
        const chatId = getChatId();
        const storage = getHistoryStorage();
        const history = storage[chatId];
        if (!history || !history.length) return;

        const last = history[history.length - 1];
        if (!last.reactions) last.reactions = [];

        const idx = last.reactions.indexOf(emoji);
        if (idx >= 0) {
            last.reactions.splice(idx, 1);
        } else {
            last.reactions.push(emoji);
        }

        saveHistoryStorage(storage);
        recordReactionStat(emoji);
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

        $('#cheerleader-css-editor-section').show();
        $('#cheerleader-css-editor').val(getCSS(currentPreset));
        const builtin = isBuiltinCSS(currentPreset);
        $('#cheerleader-css-editor').prop('readonly', builtin);
        $('#cheerleader-css-readonly-badge').toggle(builtin);
        $('#cheerleader-css-save').toggle(!builtin);
        $('#cheerleader-css-delete').prop('disabled', builtin);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EXPORT/IMPORT
    // ═══════════════════════════════════════════════════════════════════════════

    function exportSettings() {
        const settings = getSettings();
        const history = getHistoryStorage();
        const stats = getStats();

        const exportData = {
            version: "3.0.0",
            timestamp: Date.now(),
            settings: JSON.parse(JSON.stringify(settings)),
            history: history,
            stats: stats
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

                const { extensionSettings } = getContext();
                extensionSettings[EXTENSION_NAME] = data.settings;
                invalidateCache();

                if (data.history) {
                    saveHistoryStorage(data.history);
                }

                if (data.stats) {
                    saveStats(data.stats);
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

    function makeFloatingInteractive($element, $dragHandle) {
        let isDragging = false;
        let isResizing = false;
        let startX, startY, startLeft, startTop, startWidth, startHeight;

        const $resizeHandle = $('<div class="cheerleader-resize-handle"></div>');
        $element.append($resizeHandle);

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

        function getEventCoords(e) {
            if (e.touches && e.touches.length) {
                return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
            return { x: e.clientX, y: e.clientY };
        }

        function onDragStart(e) {
            if ($(e.target).is('#close-cheerleader-bar') || $(e.target).closest('.cheerleader-reactions').length) return;
            isDragging = true;
            const coords = getEventCoords(e.originalEvent || e);
            startX = coords.x;
            startY = coords.y;
            const rect = $element[0].getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            e.preventDefault();
        }

        function onResizeStart(e) {
            isResizing = true;
            const coords = getEventCoords(e.originalEvent || e);
            startX = coords.x;
            startY = coords.y;
            startWidth = $element.outerWidth();
            startHeight = $element.outerHeight();
            e.preventDefault();
            e.stopPropagation();
        }

        $dragHandle.css('cursor', 'move');
        $dragHandle.on('mousedown touchstart', onDragStart);
        $resizeHandle.on('mousedown touchstart', onResizeStart);

        $(document).on('mousemove.cheerleaderFloat touchmove.cheerleaderFloat', (e) => {
            const coords = getEventCoords(e.originalEvent || e);
            if (isDragging) {
                const newLeft = startLeft + (coords.x - startX);
                const newTop = startTop + (coords.y - startY);
                $element.css({
                    left: Math.max(0, newLeft) + 'px',
                    top: Math.max(0, newTop) + 'px',
                    right: 'auto',
                    bottom: 'auto'
                });
            } else if (isResizing) {
                const newWidth = Math.max(200, startWidth + (coords.x - startX));
                const newHeight = Math.max(80, startHeight + (coords.y - startY));
                $element.css({
                    width: newWidth + 'px',
                    height: newHeight + 'px'
                });
            }
        });

        $(document).on('mouseup.cheerleaderFloat touchend.cheerleaderFloat', () => {
            if (isDragging || isResizing) {
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

    function showHypeOutput(text, mood) {
        const settings = getSettings();
        const persona = getActivePersona();
        let avatarUrl = persona.avatarUrl || '';
        const charName = persona.charName || 'Cheerleader';

        if (avatarUrl?.match(/^[A-Za-z]:\\/)) {
            avatarUrl = 'file:///' + avatarUrl.replace(/\\/g, '/');
        }

        let avatarHtml;
        if (avatarUrl) {
            avatarHtml = `<img id="cheerleader-avatar" src="${avatarUrl}" onerror="this.style.display='none'">`;
        } else {
            avatarHtml = `<span id="cheerleader-avatar-emoji">🎉</span>`;
        }

        const moodData = mood ? getMoodData(mood) : null;
        const moodBadgeHtml = moodData ? `<span class="cheerleader-mood-badge" style="background:${moodData.color};box-shadow:0 0 8px ${moodData.glow}">${moodData.emoji} ${moodData.label}</span>` : '';

        const streak = State.streak;
        const streakInfo = getStreakLabel(streak);
        const streakHtml = streakInfo ? `<span class="cheerleader-streak-badge cheerleader-streak-${streakInfo.class}">${streakInfo.emoji} ${streakInfo.text} x${streak}</span>` : '';

        const reactionsHtml = settings.reactionsEnabled ? `<div class="cheerleader-reactions">${REACTION_EMOJIS.map(e => `<button class="cheerleader-reaction-btn" data-emoji="${e}" title="React with ${e}">${e}</button>`).join('')}</div>` : '';

        let $bar = $('#cheerleader-output-bar');

        if ($bar.length === 0) {
            $bar = $('<div id="cheerleader-output-bar">').css('display', 'none').html(`
                <div class="cheerleader-header">
                    <span id="cheerleader-header">${avatarHtml}<span id="cheerleader-name">${charName}</span>${moodBadgeHtml}${streakHtml}</span>
                    <span id="close-cheerleader-bar" title="Close (Esc)">✕</span>
                </div>
                <div id="cheerleader-output-content"></div>
                ${reactionsHtml}
            `);

            if (moodData) {
                $bar.css('border-color', moodData.color);
            }

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

            $bar.on('click', '#close-cheerleader-bar', () => {
                clearInterval(State.typewriterTimer);
                $bar.slideUp();
            });

            $bar.on('click', '.cheerleader-reaction-btn', function () {
                const emoji = $(this).data('emoji');
                $(this).toggleClass('cheerleader-reaction-active');
                addReactionToLastEntry(emoji);

                const $ripple = $('<span class="cheerleader-reaction-ripple">').text(emoji);
                $(this).append($ripple);
                setTimeout(() => $ripple.remove(), 600);
            });
        } else {
            $('#cheerleader-header').html(`${avatarHtml}<span id="cheerleader-name">${charName}</span>${moodBadgeHtml}${streakHtml}`);
            if (reactionsHtml) {
                $bar.find('.cheerleader-reactions').remove();
                $bar.append(reactionsHtml);
            }
            if (moodData) {
                $bar.css('border-color', moodData.color);
            } else {
                $bar.css('border-color', '');
            }
        }

        const $content = $('#cheerleader-output-content');

        if (settings.typewriterEnabled) {
            $content.empty();
            $bar.slideDown(200, () => {
                typewriterEffect($content, text, settings.typewriterSpeed || 30);
            });
        } else {
            $content.text(text);
            $bar.slideDown(200);
        }

        addToChatHistory(text, mood);
        State.messagesSinceLastHype = 0;

        clearTimeout(State.autoDismissTimer);
        if (settings.autoDismissSeconds > 0) {
            const dismissDelay = settings.typewriterEnabled
                ? (text.length * (settings.typewriterSpeed || 30)) + (settings.autoDismissSeconds * 1000)
                : settings.autoDismissSeconds * 1000;
            State.autoDismissTimer = setTimeout(() => {
                $bar.slideUp(200);
            }, dismissDelay);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HYPE GENERATION
    // ═══════════════════════════════════════════════════════════════════════════

    function replaceMacros(text) {
        if (!text) return text;
        const ctx = getContext();
        if (ctx.substituteParams) {
            return ctx.substituteParams(text);
        }
        const userName = ctx.name1 || 'User';
        const charName = ctx.name2 || 'Character';
        return text
            .replace(/\{\{user\}\}/gi, userName)
            .replace(/\{\{char\}\}/gi, charName);
    }

    function getUserPersona() {
        const ctx = getContext();
        const powerUser = ctx.powerUserSettings;
        if (powerUser?.persona_description) {
            return powerUser.persona_description;
        }
        return null;
    }

    function gatherTemplateData() {
        const ctx = getContext();
        const settings = getSettings();
        const persona = getActivePersona();

        const userName = ctx.name1 || 'User';
        const charName = ctx.name2 || 'Character';

        const mainPrompt = replaceMacros(persona.mainPrompt || DEFAULTS.MAIN_PROMPT);

        const userPersonaRaw = getUserPersona();
        const userPersona = userPersonaRaw ? `[User Persona - ${userName}]\n${replaceMacros(userPersonaRaw)}` : '';

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

        const chatHistory = [];
        if (ctx.chat?.length) {
            const startIdx = Math.max(0, ctx.chat.length - 50);
            const recentChat = ctx.chat.slice(startIdx);

            for (const msg of recentChat) {
                if (msg.is_system) continue;
                let content = stripXmlTags(msg.mes || "");
                if (!content.trim()) continue;
                const speaker = msg.is_user ? userName : charName;
                chatHistory.push({
                    role: msg.is_user ? "user" : "assistant",
                    content: content,
                    name: speaker
                });
            }
        }

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

        const prefill = persona.prefill ? replaceMacros(persona.prefill) : '';

        return {
            main_prompt: mainPrompt,
            user_persona: userPersona,
            char_info: charInfo,
            chat_history: chatHistory,
            previous_hype: previousHype,
            prefill: prefill,
            user: userName,
            char: charName,
            if_user_persona: !!userPersonaRaw,
            if_char_info: !!charInfo,
            if_previous_hype: !!previousHype,
            if_prefill: !!prefill
        };
    }

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
            if (item.marker === '{{chat_history}}') {
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
                messages.push(...validHistory);
                chatHistoryInserted = true;
                continue;
            }

            if (item.enabled !== undefined) {
                const conditionKey = item.enabled.replace(/\{\{|\}\}/g, '');
                if (data[conditionKey] === false || data[conditionKey] === '' || data[conditionKey] === null) {
                    continue;
                }
            }

            let content = item.content || '';
            for (const [key, value] of Object.entries(data)) {
                if (typeof value === 'string') {
                    content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
                }
            }

            if (!content.trim()) continue;

            if (item.role === 'assistant' && content === data.prefill && data.prefill) {
                prefillText = content;
            }

            messages.push({
                role: item.role || 'system',
                content: content
            });
        }

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

        State.isGenerating = true;
        updateButtonState(true);
        toastr.info("Generating Hype...");

        try {
            if (!persona.profileId) {
                throw new Error("No Connection Profile selected. Open Settings → Cheerleader.");
            }

            const data = gatherTemplateData();
            const maxCtx = parseInt(persona.maxContextTokens) || DEFAULTS.MAX_CONTEXT;

            const template = persona.promptTemplate || DEFAULTS.PROMPT_TEMPLATE;
            const { messages, prefillText } = buildMessagesFromTemplate(template, data, maxCtx);

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

            if (prefillText && text.startsWith(prefillText)) {
                text = text.substring(prefillText.length).trim();
            }

            const streak = updateStreak();
            const mood = settings.moodEnabled ? detectMood(text) : null;

            if (settings.confettiEnabled) {
                triggerConfetti();
            }

            recordHypeStat(text, mood);
            showHypeOutput(text, mood);
            toastr.success(`Hype generated!${streak >= 3 ? ` 🔥 Streak: ${streak}` : ''}`);

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

        $('#cheerleader-char-name').val(persona.charName || DEFAULTS.CHAR_NAME);
        $('#cheerleader-main-prompt').val(persona.mainPrompt || DEFAULTS.MAIN_PROMPT);
        $('#cheerleader-prefill').val(persona.prefill || DEFAULTS.PREFILL);
        $('#cheerleader-max-response').val(persona.maxResponseTokens || DEFAULTS.MAX_RESPONSE);
        $('#cheerleader-max-context').val(persona.maxContextTokens || DEFAULTS.MAX_CONTEXT);

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

        $('#cheerleader-auto-dismiss').val(s.autoDismissSeconds || 0);
        $('#cheerleader-output-position').val(s.outputPosition || 'after_chat');
        $('#cheerleader-keyboard-shortcut').prop('checked', s.keyboardShortcutEnabled !== false);

        $('#cheerleader-typewriter-enabled').prop('checked', s.typewriterEnabled !== false);
        $('#cheerleader-typewriter-speed').val(s.typewriterSpeed || 30);
        $('#cheerleader-typewriter-speed-value').text(s.typewriterSpeed || 30);
        $('#cheerleader-confetti-enabled').prop('checked', s.confettiEnabled !== false);
        $('#cheerleader-mood-enabled').prop('checked', s.moodEnabled !== false);
        $('#cheerleader-reactions-enabled').prop('checked', s.reactionsEnabled !== false);

        updateHistoryCount();
        updateCooldownIndicator();

        updateCSSDropdown();
        applyCSSPreset();

        updatePresetDropdown();

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
        if (!confirm("Reset all Cheerleader settings to defaults? This will also clear history and statistics.")) return;

        const { extensionSettings } = getContext();
        extensionSettings[EXTENSION_NAME] = getDefaultSettings();
        invalidateCache();
        saveSettings();

        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STATS_KEY);

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
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
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

            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                generateHype();
            }

            if (e.key === 'Escape') {
                clearInterval(State.typewriterTimer);
                $('#cheerleader-output-bar').slideUp(200);
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SLASH COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    function registerSlashCommands() {
        const ctx = getContext();
        if (!ctx.registerSlashCommand && !ctx.SlashCommandParser) return;

        try {
            if (ctx.SlashCommandParser?.addCommandObject) {
                const SlashCommand = ctx.SlashCommand;
                const ARGUMENT_TYPE = ctx.ARGUMENT_TYPE;

                if (SlashCommand) {
                    ctx.SlashCommandParser.addCommandObject(SlashCommand.fromProps({
                        name: 'hype',
                        callback: async () => {
                            await generateHype();
                            return '';
                        },
                        helpString: 'Generate a Cheerleader hype message.',
                    }));

                    ctx.SlashCommandParser.addCommandObject(SlashCommand.fromProps({
                        name: 'hype-history',
                        callback: () => {
                            showHistoryPopup();
                            return '';
                        },
                        helpString: 'Show Cheerleader hype history for this chat.',
                    }));

                    ctx.SlashCommandParser.addCommandObject(SlashCommand.fromProps({
                        name: 'hype-stats',
                        callback: () => {
                            showStatistics();
                            return '';
                        },
                        helpString: 'Show Cheerleader statistics dashboard.',
                    }));

                    log('Slash commands registered (new API)');
                    return;
                }
            }

            if (ctx.registerSlashCommand) {
                ctx.registerSlashCommand('hype', async () => {
                    await generateHype();
                    return '';
                }, [], 'Generate a Cheerleader hype message.');

                ctx.registerSlashCommand('hype-history', () => {
                    showHistoryPopup();
                    return '';
                }, [], 'Show Cheerleader hype history.');

                ctx.registerSlashCommand('hype-stats', () => {
                    showStatistics();
                    return '';
                }, [], 'Show Cheerleader statistics.');

                log('Slash commands registered (legacy API)');
            }
        } catch (e) {
            warn('Could not register slash commands:', e.message);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENT BINDINGS
    // ═══════════════════════════════════════════════════════════════════════════

    function bindEvents() {
        const $doc = $(document);
        const debouncedSave = debounce(saveSettings, 500);

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
            $('#cheerleader-output-bar').remove();
        });

        $doc.on('change', '#cheerleader-keyboard-shortcut', function () {
            getSettings().keyboardShortcutEnabled = this.checked;
            saveSettings();
        });

        // v3 feature toggles
        $doc.on('change', '#cheerleader-typewriter-enabled', function () {
            getSettings().typewriterEnabled = this.checked;
            saveSettings();
        });

        $doc.on('input', '#cheerleader-typewriter-speed', function () {
            const val = parseInt(this.value) || 30;
            getSettings().typewriterSpeed = val;
            $('#cheerleader-typewriter-speed-value').text(val);
            debouncedSave();
        });

        $doc.on('change', '#cheerleader-confetti-enabled', function () {
            getSettings().confettiEnabled = this.checked;
            saveSettings();
        });

        $doc.on('change', '#cheerleader-mood-enabled', function () {
            getSettings().moodEnabled = this.checked;
            saveSettings();
        });

        $doc.on('change', '#cheerleader-reactions-enabled', function () {
            getSettings().reactionsEnabled = this.checked;
            saveSettings();
            $('#cheerleader-output-bar').remove();
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
        $doc.on('click', '#cheerleader-view-stats', showStatistics);

        // CSS Presets
        $doc.on('change', '#cheerleader-css-preset-select', function () {
            const name = this.value;
            const s = getSettings();
            s.selectedCSSPreset = name;
            saveSettings();
            applyCSSPreset();

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
                    <div id="cheerleader-prompt-editor-overlay" class="cheerleader-overlay"></div>
                    <div id="cheerleader-template-preview-popup" class="cheerleader-popup">
                        <div class="cheerleader-popup-header">
                            <h3>Preview: ${messages.length} Messages</h3>
                            <span id="close-template-preview" class="cheerleader-popup-close">✕</span>
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
            const moodData = entry.mood ? getMoodData(entry.mood) : null;
            const moodBadge = moodData ? `<span class="cheerleader-mood-badge-sm" style="background:${moodData.color}">${moodData.emoji}</span>` : '';
            const reactions = (entry.reactions || []).map(r => `<span class="cheerleader-history-reaction">${r}</span>`).join('');
            return `<div class="cheerleader-history-item">
                <div class="cheerleader-history-meta"><b>${i + 1}.</b> <span class="cheerleader-history-persona">${persona}</span> ${moodBadge} ${time ? `<span class="cheerleader-history-time">${time}</span>` : ''}</div>
                <div class="cheerleader-history-text">${msg}</div>
                ${reactions ? `<div class="cheerleader-history-reactions">${reactions}</div>` : ''}
            </div>`;
        }).join('');

        $('body').append(`
            <div id="cheerleader-history-overlay" class="cheerleader-overlay"></div>
            <div id="cheerleader-history-popup" class="cheerleader-popup">
                <div class="cheerleader-popup-header">
                    <h3>🎉 Hype History (${history.length})</h3>
                    <span id="close-history-popup" class="cheerleader-popup-close">✕</span>
                </div>
                <div class="cheerleader-history-list">${html}</div>
            </div>
        `);

        $(document).one('click', '#close-history-popup, #cheerleader-history-overlay', () => {
            $('#cheerleader-history-popup, #cheerleader-history-overlay').remove();
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HYPE BUTTON
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
        const targetNode = document.getElementById('chat_input_controls')
            || document.getElementById('form_sheld')
            || document.querySelector('.chat-input-container');

        if (!targetNode) {
            setTimeout(() => {
                addHypeButton();
                setupButtonObserver();
            }, 2000);
            return;
        }

        if (State.buttonObserver) {
            State.buttonObserver.disconnect();
        }

        State.buttonObserver = new MutationObserver(() => {
            if (!document.getElementById('cheerleader-hype-btn')) {
                addHypeButton();
            }
        });

        State.buttonObserver.observe(targetNode, {
            childList: true,
            subtree: false
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
                                    <label>Main Prompt <span class="cheerleader-tooltip" title="System instructions for the hype bot">?</span></label>
                                    <textarea id="cheerleader-main-prompt" class="text_pole" rows="4" placeholder="You are a hype-bot..."></textarea>
                                </div>

                                <div class="cheerleader-section">
                                    <label>Prefill <span class="cheerleader-tooltip" title="Starting text for the AI response (will be stripped from output)">?</span></label>
                                    <textarea id="cheerleader-prefill" class="text_pole" rows="2" placeholder="Wow, that's intense!"></textarea>
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

                    <!-- Effects & Flair Drawer (NEW in v3) -->
                    <div class="cheerleader-drawer">
                        <div class="inline-drawer">
                            <div class="inline-drawer-toggle inline-drawer-header">
                                <b>✨ Effects & Flair</b>
                                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                            </div>
                            <div class="inline-drawer-content">
                                <div class="cheerleader-section">
                                    <label class="checkbox_label">
                                        <input type="checkbox" id="cheerleader-typewriter-enabled">
                                        Typewriter Animation
                                        <span class="cheerleader-tooltip" title="Display hype text character-by-character with a typing cursor">?</span>
                                    </label>
                                    <div class="cheerleader-section cheerleader-indent">
                                        <label>Typing Speed: <span id="cheerleader-typewriter-speed-value">30</span>ms <span class="cheerleader-tooltip" title="Milliseconds between each character (lower = faster)">?</span></label>
                                        <input id="cheerleader-typewriter-speed" type="range" min="10" max="100" value="30" step="5">
                                    </div>
                                </div>

                                <div class="cheerleader-section">
                                    <label class="checkbox_label">
                                        <input type="checkbox" id="cheerleader-confetti-enabled">
                                        Confetti Celebration
                                        <span class="cheerleader-tooltip" title="Burst of colorful confetti particles when hype is generated">?</span>
                                    </label>
                                </div>

                                <div class="cheerleader-section">
                                    <label class="checkbox_label">
                                        <input type="checkbox" id="cheerleader-mood-enabled">
                                        Mood Detection
                                        <span class="cheerleader-tooltip" title="Analyze hype text for mood and display a colored badge (excited, dramatic, romantic, etc.)">?</span>
                                    </label>
                                </div>

                                <div class="cheerleader-section">
                                    <label class="checkbox_label">
                                        <input type="checkbox" id="cheerleader-reactions-enabled">
                                        Quick Reactions
                                        <span class="cheerleader-tooltip" title="Show emoji reaction buttons below hype messages">?</span>
                                    </label>
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
                                            <button id="cheerleader-view-stats" class="menu_button" title="View Statistics"><i class="fa-solid fa-chart-bar"></i></button>
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
        .cheerleader-indent { margin-left: 24px; margin-top: 4px; }
        .readonly-badge { color: orange; font-size: 0.8em; }
        #cheerleader-auto-hype { width: 100%; }
        #cheerleader-typewriter-speed { width: 100%; }
        .cheerleader-header { font-weight: bold; color: gold; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        #cheerleader-header { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        #close-cheerleader-bar { cursor: pointer; opacity: 0.7; transition: opacity 0.2s; }
        #close-cheerleader-bar:hover { opacity: 1; }
        #cheerleader-output-content { font-style: italic; }

        /* Floating output bar */
        .cheerleader-floating { box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
        .cheerleader-floating .cheerleader-header { cursor: move; user-select: none; }
        .cheerleader-floating #cheerleader-output-content { flex: 1; overflow: auto; }
        .cheerleader-resize-handle {
            position: absolute; bottom: 0; right: 0;
            width: 16px; height: 16px; cursor: se-resize;
            background: linear-gradient(135deg, transparent 50%, var(--SmartThemeBorderColor) 50%);
            border-radius: 0 0 10px 0; opacity: 0.6; transition: opacity 0.2s;
        }
        .cheerleader-resize-handle:hover { opacity: 1; }

        .cheerleader-tooltip { cursor: help; color: var(--SmartThemeQuoteColor); margin-left: 4px; font-size: 0.85em; }
        .cheerleader-cooldown-indicator { font-size: 0.85em; color: var(--SmartThemeQuoteColor); padding: 4px 8px; background: var(--SmartThemeBlurTintColor); border-radius: 4px; margin-top: 5px; }
        .cheerleader-danger { background: rgba(200, 50, 50, 0.3) !important; }
        .cheerleader-danger:hover { background: rgba(200, 50, 50, 0.5) !important; }
        #cheerleader-hype-btn.cheerleader-loading { opacity: 0.5; animation: cheerleader-pulse 1s infinite; }
        @keyframes cheerleader-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

        /* Typewriter */
        .cheerleader-typewriter-cursor {
            font-weight: bold; animation: cheerleader-blink 0.7s step-end infinite;
            margin-left: 1px; color: inherit;
        }
        .cheerleader-cursor-fade { animation: cheerleader-cursor-fadeout 1s forwards; }
        @keyframes cheerleader-blink { 50% { opacity: 0; } }
        @keyframes cheerleader-cursor-fadeout { to { opacity: 0; } }

        /* Mood Badge */
        .cheerleader-mood-badge {
            display: inline-flex; align-items: center; gap: 3px;
            padding: 2px 8px; border-radius: 12px; font-size: 0.75em;
            color: #fff; font-weight: 600; letter-spacing: 0.3px;
            animation: cheerleader-badge-pop 0.3s ease-out;
        }
        .cheerleader-mood-badge-sm {
            display: inline-flex; padding: 1px 4px; border-radius: 8px;
            font-size: 0.7em; color: #fff;
        }
        @keyframes cheerleader-badge-pop { from { transform: scale(0); } to { transform: scale(1); } }

        /* Streak Badge */
        .cheerleader-streak-badge {
            display: inline-flex; align-items: center; gap: 3px;
            padding: 2px 8px; border-radius: 12px; font-size: 0.7em;
            font-weight: 700; letter-spacing: 0.5px;
            animation: cheerleader-badge-pop 0.3s ease-out;
        }
        .cheerleader-streak-combo { background: linear-gradient(135deg, #f39c12, #e74c3c); color: #fff; }
        .cheerleader-streak-unstoppable { background: linear-gradient(135deg, #e74c3c, #9b59b6); color: #fff; }
        .cheerleader-streak-on-fire { background: linear-gradient(135deg, #ff0000, #ff6600); color: #fff; text-shadow: 0 0 5px rgba(255,100,0,0.5); }
        .cheerleader-streak-legendary { background: linear-gradient(135deg, #ffd700, #ff0080, #00c8ff); color: #fff; text-shadow: 0 0 8px rgba(255,215,0,0.5); animation: cheerleader-legendary-glow 2s ease infinite; }
        @keyframes cheerleader-legendary-glow { 0%, 100% { box-shadow: 0 0 5px rgba(255,215,0,0.3); } 50% { box-shadow: 0 0 15px rgba(255,215,0,0.6); } }

        /* Quick Reactions */
        .cheerleader-reactions {
            display: flex; gap: 4px; margin-top: 8px; padding-top: 6px;
            border-top: 1px solid rgba(255,255,255,0.1); flex-wrap: wrap;
        }
        .cheerleader-reaction-btn {
            background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px; padding: 2px 8px; cursor: pointer; font-size: 0.9em;
            transition: all 0.2s; position: relative; overflow: hidden;
        }
        .cheerleader-reaction-btn:hover { background: rgba(255,255,255,0.15); transform: scale(1.15); }
        .cheerleader-reaction-btn:active { transform: scale(0.95); }
        .cheerleader-reaction-active { background: rgba(255,215,0,0.2) !important; border-color: rgba(255,215,0,0.4) !important; box-shadow: 0 0 6px rgba(255,215,0,0.2); }
        .cheerleader-reaction-ripple {
            position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
            font-size: 1.2em; animation: cheerleader-reaction-float 0.6s ease-out forwards;
            pointer-events: none;
        }
        @keyframes cheerleader-reaction-float { to { top: -30px; opacity: 0; } }

        /* Popups */
        .cheerleader-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9998; animation: cheerleader-fadeIn 0.2s; }
        .cheerleader-popup {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: var(--SmartThemeBodyColor); border: 2px solid var(--SmartThemeBorderColor);
            border-radius: 10px; padding: 20px; max-width: 600px; max-height: 80vh; z-index: 9999;
            overflow-y: auto; animation: cheerleader-popIn 0.3s ease-out;
            width: 90%;
        }
        .cheerleader-popup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .cheerleader-popup-header h3 { margin: 0; color: gold; }
        .cheerleader-popup-close { cursor: pointer; font-size: 1.5em; opacity: 0.7; transition: opacity 0.2s; }
        .cheerleader-popup-close:hover { opacity: 1; }

        /* History */
        .cheerleader-history-list { max-height: 50vh; overflow-y: auto; }
        .cheerleader-history-item { padding: 10px; margin-bottom: 8px; background: var(--SmartThemeBlurTintColor); border-radius: 6px; }
        .cheerleader-history-meta { font-size: 0.85em; color: var(--SmartThemeQuoteColor); margin-bottom: 4px; display: flex; gap: 8px; align-items: center; }
        .cheerleader-history-persona { color: gold; font-weight: bold; }
        .cheerleader-history-time { font-size: 0.8em; opacity: 0.7; }
        .cheerleader-history-text { font-style: italic; }
        .cheerleader-history-reactions { margin-top: 4px; display: flex; gap: 4px; }
        .cheerleader-history-reaction { font-size: 0.85em; padding: 1px 4px; background: rgba(255,255,255,0.08); border-radius: 8px; }

        /* Statistics */
        .cheerleader-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
        .cheerleader-stat-card {
            background: var(--SmartThemeBlurTintColor); border-radius: 8px; padding: 14px;
            text-align: center; border: 1px solid var(--SmartThemeBorderColor);
            transition: transform 0.2s;
        }
        .cheerleader-stat-card:hover { transform: translateY(-2px); }
        .cheerleader-stat-number { font-size: 1.8em; font-weight: 700; color: gold; line-height: 1.2; }
        .cheerleader-stat-label { font-size: 0.8em; color: var(--SmartThemeQuoteColor); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        .cheerleader-stats-section { margin-bottom: 14px; }
        .cheerleader-stats-section h4 { margin: 0 0 8px; color: var(--SmartThemeQuoteColor); font-size: 0.9em; text-transform: uppercase; letter-spacing: 0.5px; }
        .cheerleader-stat-bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .cheerleader-stat-bar-label { width: 80px; font-size: 0.85em; text-transform: capitalize; }
        .cheerleader-stat-bar-track { flex: 1; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
        .cheerleader-stat-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
        .cheerleader-stat-bar-value { font-size: 0.8em; color: var(--SmartThemeQuoteColor); min-width: 60px; text-align: right; }
        .cheerleader-stat-reactions-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .cheerleader-stat-reaction { padding: 3px 10px; background: var(--SmartThemeBlurTintColor); border-radius: 12px; font-size: 0.9em; }
        .cheerleader-stats-meta { font-size: 0.85em; color: var(--SmartThemeQuoteColor); display: flex; flex-direction: column; gap: 4px; }

        /* Prompt Structure Editor */
        .cheerleader-info-box {
            padding: 10px; background: rgba(100, 100, 255, 0.1);
            border: 1px solid rgba(100, 100, 255, 0.3); border-radius: 6px; font-size: 0.9em;
        }
        .cheerleader-placeholder-list {
            padding: 8px 12px; background: var(--SmartThemeBlurTintColor);
            border-radius: 4px; font-size: 0.85em; line-height: 1.6;
        }
        .cheerleader-placeholder-list code {
            background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px;
            font-family: monospace; color: #ffa500;
        }
        #cheerleader-prompt-template {
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 12px; line-height: 1.4; tab-size: 2;
        }

        /* Template Preview */
        #cheerleader-template-preview-popup { max-width: 700px; }
        .cheerleader-preview-message { margin: 8px 0; padding: 10px; border-radius: 6px; border-left: 4px solid; }
        .cheerleader-preview-message.system { background: rgba(100,100,255,0.1); border-color: #6666ff; }
        .cheerleader-preview-message.user { background: rgba(100,255,100,0.1); border-color: #66ff66; }
        .cheerleader-preview-message.assistant { background: rgba(255,100,100,0.1); border-color: #ff6666; }
        .cheerleader-preview-role { font-weight: bold; text-transform: uppercase; font-size: 0.8em; margin-bottom: 4px; }
        .cheerleader-preview-content { white-space: pre-wrap; word-break: break-word; font-size: 0.9em; max-height: 200px; overflow-y: auto; }

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

        setTimeout(initProfileDropdown, 500);

        addHypeButton();
        setupButtonObserver();
        setupAutoHype();

        setTimeout(registerSlashCommands, 1000);

        log('Initialized v3.0.0');
    }

    if (typeof jQuery !== 'undefined') {
        jQuery(init);
    } else {
        error('jQuery not found');
    }
})();
