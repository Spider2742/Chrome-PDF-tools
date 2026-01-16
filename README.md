# 📄 Chrome-PDF-Tools

![Version](https://img.shields.io/badge/version-1.1-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg)

**Chrome-PDF-Tools** is a lightweight extension for Chromium-based browsers (Brave, Chrome, Edge) that gives you full control over the native PDF viewer. It adds a non-intrusive floating menu to toggle the toolbar, switch color modes, and enter fullscreen—perfect for distraction-free reading.

## ✨ Features

* **👁️ Toggle UI:** Instantly hide the PDF sidebar and header to maximize screen space.
* **🌙 Dark Mode:** High-contrast smart inversion (pitch black background, white text) that keeps images and diagrams looking normal.
* **☕ Sepia Mode:** A warm, yellowish tint for comfortable reading and reduced eye strain.
* **⛶ Fullscreen Mode:** A dedicated button to enter F11 fullscreen mode directly.
* **👻 Auto-Hide:** Controls automatically vanish when you enter fullscreen for a completely clean view.
* **↔️ Custom Positioning:** Click the extension icon to slide the buttons left or right to fit your screen perfectly.
* **💾 Auto-Save:** The extension remembers your preferred button position even after you close the browser.

---

## 🚀 Installation Guide

You can install this extension using either the **Source Code (ZIP)** method or the **CRX Package** method.

### Method 1: ZIP Install (Recommended)
*This method is the most reliable as modern browsers often block direct .crx files for security.*

1.  Download the **Source Code (zip)** from the **[Releases](../../releases)** page.
2.  Extract the ZIP file to a folder on your computer.

#### 🦁 Brave / Chrome
1.  Go to `brave://extensions` or `chrome://extensions`.
2.  Toggle **Developer mode** to **ON** (top right corner).
3.  Click **Load unpacked** (top left).
4.  Select the folder where you extracted the files.

#### 🌊 Microsoft Edge
1.  Go to `edge://extensions`.
2.  Toggle **Developer mode** to **ON** (sidebar or bottom left).
3.  Click **Load unpacked**.
4.  Select the folder where you extracted the files.

---

### Method 2: CRX Install
*Use this if you prefer a single-file installer. Note: Chrome/Brave may sometimes block this method.*

1.  Download the **.crx** file from the **[Releases](../../releases)** page.
2.  Open your browser's extension management page:
    * **Chrome/Brave:** `chrome://extensions`
    * **Edge:** `edge://extensions`
3.  **Important:** Ensure **Developer mode** is toggled **ON**.
4.  Open your computer's file explorer and find the downloaded `.crx` file.
5.  **Drag and drop** the `.crx` file directly onto the browser window (anywhere on the extensions page).
6.  Click **Add Extension** when the prompt appears.

---

## ⚠️ Important: Local File Access
If you want to use this tool on PDF files stored on your computer (e.g., `file:///C:/Users/Docs/something.pdf`), you **must** manually grant permission.

1.  Go to your browser's extension page (`brave://extensions`).
2.  Find **Chrome-PDF-Tools** in the list.
3.  Click the **Details** button.
4.  Scroll down and toggle **ON** the switch labeled **"Allow access to file URLs"**.

*(Without this step, the extension will only work on PDFs opened from websites, not your local drive.)*

---

## 🛠️ Usage
1.  Open any PDF file in your browser.
2.  Look for the floating icons in the top-right corner.
3.  **Click the Eye** to toggle the toolbar (the page will refresh).
4.  **Click the Moon** to toggle High-Contrast Dark Mode.
5.  **Click the Coffee Cup** to toggle Sepia Mode.
6.  **Click the Corners** to toggle fullscreen.
7.  **Click the Extension Icon** (puzzle piece) in your browser toolbar to adjust the horizontal position of the buttons.

---

## 🤝 Contributing
Feel free to open issues or pull requests if you have suggestions for improvements!

**License:** MIT