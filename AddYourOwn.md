# 🎨 Adding Your Own Character

Want to add a new character to Gemielle? You don't need to touch any of the extension's actual code — just follow these two steps.

---

## Step 1 — Add the folder

Inside `assets/`, create a new folder named after your character. This name is what identifies the character internally, so keep it simple:

- ✅ Use lowercase letters, numbers, hyphens (`-`), or underscores (`_`)
- ❌ No spaces, no parentheses, no special symbols

```
assets/
  your-character-name/
```

Then drop your 5 GIFs inside it, using **these exact filenames, every time** — only the folder name changes per character, the files inside never do:

```
assets/
  your-character-name/
    waiting_user_input.gif
    user_typing.gif
    ai_thinking.gif
    ai_typing.gif
    ai_complete_answer.gif
```

| Filename | When it's shown |
| :--- | :--- |
| `waiting_user_input.gif` | Idle — waiting for you to type a prompt |
| `user_typing.gif` | You're typing into the chat box |
| `ai_thinking.gif` | AI is thinking / reasoning / searching |
| `ai_typing.gif` | AI is actively generating its answer |
| `ai_complete_answer.gif` | AI has finished responding |

**Tips for the GIFs themselves:**
- The widget displays these at a small size (resizable roughly 60–220px), so there's no need for large source files — resize to ~300px wide before exporting to keep file sizes small.
- All 5 don't need to be pixel-identical in size, but keeping them close in aspect ratio looks best — the widget automatically crops/fills any mismatch.

---

## Step 2 — Register it in `config.js`

Open `config.js` and add one line to the `CHARACTERS` list:

```js
const CHARACTERS = [
  { id: 'remielle', name: 'Remielle' },
  { id: 'your-character-name', name: 'Whatever You Want Shown in the Dropdown' }
];
```

- `id` **must exactly match** your folder name from Step 1 (case-sensitive).
- `name` is just the label shown in the popup dropdown — this one can be anything, including spaces, emoji, parentheses, etc.

---

That's it — reload the extension in `chrome://extensions` (refresh icon on the extension card), and your new character will appear in the toolbar dropdown.
Or you can just replace a Gif within the folders that are already available, as long as you keep the 5 naming conventions, they will function.
