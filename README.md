# 🌸 Gemielle - AI Assistant Widget

[![Typing SVG](https://readme-typing-svg.demolab.com/?font=Fira+Code&size=28&pause=1000&color=C084FC&center=true&vCenter=true&width=700&lines=Breathe+Life+Into+Your+AI+Companion;Gemini+%E2%80%A2+ChatGPT+%E2%80%A2+Claude)](https://git.io/typing-svg)

**Gemielle** is a Chrome Extension that displays a lively, switchable "AI assistant" character in the corner of your screen while you use **Google Gemini**, **ChatGPT**, and **Claude**. The assistant automatically changes its expression and state in real time, matching your behavior and the AI's — and you can pick which character shows up from a built-in toggle.

---

## 🙏 Credits

This project builds on the work of two people:

- **[Rainan1010](https://github.com/Rainan1010)** — creator of the original [Gemielle](https://github.com/Rainan1010/Gemielle) extension for Gemini, which this project is forked from.
- **[Tqan-Nguyen](https://github.com/Tqan-Nguyen)** — creator of [Remielle-Widget](https://github.com/Tqan-Nguyen/Remielle-Widget), whose ChatGPT and Claude detection logic was adapted into this project's multi-site support.

### What this fork adds on top of both

- 🎭 **Multi-character support** — swap the widget's entire GIF set via a dropdown popup, no code editing required.
- 🖼️ **Custom characters** — original assets replaced/extended with additional character sets living side-by-side.
- 🔀 **Unified multi-site extension** — Gemini, ChatGPT, and Claude support merged into **one** extension with **one** shared character toggle, instead of three separate installs.
- 📏 **Consistent sizing across all GIFs** — every character/state image fills the widget uniformly regardless of its original resolution or aspect ratio.

---

## ✨ Key Features

- 🎭 **5 flexible expression states:** Accurately tracks each step of the interaction between the user and the AI.
- 🖱️ **Free drag & drop:** Easily "grab" and move the widget to any corner of the screen.
- 🔍 **Scroll to resize:** Scroll your mouse wheel over the widget to zoom it in or out — your size choice is remembered.
- 🌸 **Click for a sakura burst:** Click the widget for a playful zoom pop and falling cherry blossom petals.
- 🔀 **Switchable characters:** Pick your favorite character from the toolbar popup — updates instantly, no page reload needed.
- ⚡ **Accurate & smooth detection:**
  - Detects when the user types a prompt or clears the input field.
  - Accurately distinguishes between the AI thinking/reasoning/searching and the AI actually generating text.
  - Responds instantly when the AI finishes its answer.

---

## 🎭 Assistant States

*(Shown here with the default Remielle character — any character you add follows this exact same 5-state set.)*

| State | GIF Icon | Description |
| :--- | :---: | :--- |
| **WAITING** | ![Waiting](assets/remielle/waiting_user_input.gif) | The assistant is waiting for the user to enter a prompt. |
| **USER_TYPING** | ![User Typing](assets/remielle/user_typing.gif) | You are typing text into the chat's input field. |
| **AI_THINKING** | ![AI Thinking](assets/remielle/ai_thingking.gif) | The AI is thinking, reasoning, processing the request, or searching the web. |
| **AI_TYPING** | ![AI Typing](assets/remielle/ai_typing.gif) | The AI has started generating and outputting the answer text. |
| **AI_COMPLETE** | ![AI Complete](assets/remielle/ai_complete_answer.gif) | The AI has finished the answer. |

---

## 🚀 Installation Guide (For non-coders)

### 📌 Step 1: Download the extension
1. Click the green **Code** button (at the top of this GitHub page) ➔ select **Download ZIP**.
2. Unzip the `.zip` file you downloaded — you'll get a folder containing the extension.

### 📌 Step 2: Add it to Chrome
1. Open Google Chrome, type the following address into the address bar, then press **Enter**:
```text
   chrome://extensions/
```
2. Turn on **Developer mode** in the top-right corner of the screen.
3. Click **Load unpacked** in the top-left corner.
4. Select the unzipped folder from Step 1.
5. Pin the extension: click the puzzle-piece icon in Chrome's toolbar → find this extension → click the pin icon, so its icon stays visible.

### 📌 Step 3: Pick your character
Click the pinned toolbar icon and choose your favorite character from the dropdown — it applies instantly, no reload needed.

### 📌 Step 4: Enjoy!
Open any of the following to see your assistant appear in the bottom-right corner:
- [Google Gemini](https://gemini.google.com/)
- [ChatGPT](https://chatgpt.com/)
- [Claude](https://claude.ai/)

🎉

---

## ⚠️ Disclaimer

- This project is an independently developed, personal open-source extension and is **not affiliated with, endorsed by, or sponsored by Google LLC (Gemini), OpenAI (ChatGPT), or Anthropic (Claude)**.
- The extension runs entirely on the client side; it only interacts with each site's DOM interface and **does not collect, store, or transmit any of the user's personal data or conversation content**.
