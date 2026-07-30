# 🌸 Gemielle - Gemini AI Assistant Widget

**Gemielle** is a Chrome Extension that displays a lively "AI assistant" in the corner of your screen while you use Google Gemini Web (`gemini.google.com`). The assistant automatically changes its expression and state in real time, matching your behavior and the AI's.

---

## ✨ Key Features

- 🎭 **5 flexible expression states:** Accurately tracks each step of the interaction between the user and Gemini.
- 🖱️ **Free drag & drop:** Easily "grab" and move Gemielle to any corner of the screen.
- ⚡ **Accurate & smooth detection:**
  - Detects when the user types a prompt or clears the input field.
  - Accurately distinguishes between the AI thinking/searching the web (Grounding) and the AI actually generating text.
  - Responds instantly when the AI finishes its answer.

---

## 🎭 Assistant States

| State | GIF Icon | Description |
| :--- | :---: | :--- |
| **WAITING** | ![Waiting](assets/waiting_user_input.gif) | The assistant is waiting for the user to enter a prompt. |
| **USER_TYPING** | ![User Typing](assets/user_typing.gif) | You are typing text into Gemini's input field. |
| **AI_THINKING** | ![AI Thinking](assets/ai_thingking.gif) | The AI is thinking, processing the request, or searching the web. |
| **AI_TYPING** | ![AI Typing](assets/ai_typing.gif) | The AI has started generating and outputting the answer text. |
| **AI_COMPLETE** | ![AI Complete](assets/ai_complete_answer.gif) | The AI has finished the answer. |

---

## 🚀 Detailed Installation Guide (For non-coders)

### 📌 Step 1: Download the extension
1. Click the green **Code** button (at the top of this GitHub page) ➔ select **Download ZIP**.
2. Unzip the `.zip` file you downloaded — you'll get a folder containing the extension (e.g., `Gemielle`).

### 📌 Step 2: Store the install folder
*(Note: Store the folder in Chrome's actual extension data location, so it doesn't accidentally get deleted and stop the extension from working)*

- **For Windows:**
  1. Press **Windows + R** on your keyboard to open the **Run** dialog.
  2. Type or paste the following path, then press **Enter**:
```text
     %LOCALAPPDATA%\Google\Chrome\User Data\Default\Extensions
```
  3. A folder window will open. **Copy the `Gemielle` folder** into it.

- **For macOS:**
  1. Open **Finder**, press **Command + Shift + G** (or select the *Go* menu ➔ *Go to Folder...*).
  2. Type the following path, then press **Return (Enter)**:
```text
     ~/Library/Application Support/Google/Chrome/Default/Extensions
```
  3. A folder window will open. **Copy the `Gemielle` folder** into it.

### 📌 Step 3: Add it to Chrome
1. Open Google Chrome, type the following address into the address bar, then press **Enter**:
```text
   chrome://extensions/
```
2. Turn on **Developer mode** in the top-right corner of the screen.
3. Click **Load unpacked** in the top-left corner.
4. Navigate to the `Gemielle` folder you saved in Step 2 and click **Select / Open**.
5. Open [Google Gemini](https://gemini.google.com/) to start experiencing the Gemielle assistant in the corner of your screen! 🎉

---

## ⚠️ Disclaimer

- **Gemielle** is an independently developed, personal open-source project and is **not affiliated with, endorsed by, or sponsored by Google LLC / Google Gemini**.
- The extension runs entirely on the client side; it only interacts with the browser's DOM interface and **does not collect, store, or transmit any of the user's personal data**.
