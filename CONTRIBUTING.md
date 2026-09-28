# Contributing to Cozy Pets 🐾

First off, thank you for considering contributing to Cozy Pets! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.

## How Can I Contribute?

There are many ways you can help improve Cozy Pets:

### 1. Add New Pets & Skins 🐼🦊🐶
Right now we have an adorable orange tabby, but we'd love to see more! You can add a new skin by:
- Duplicating the `.skin-orange-tabby` styles in `content/styles.css`.
- Creating a new color palette (using CSS variables).
- Adjusting the ears, tail, or body shape using CSS!

### 2. Add New Toys & Interactions 🧶
Got an idea for a new toy? You can add it to the `pet-engine.js` physics engine! Some fun ideas:
- A bouncing yarn ball
- A laser pointer that moves erratically
- A comfy bed for the pet to sleep in

### 3. Report Bugs & Request Features 🐛
If you find a bug (like the pet getting stuck) or have an idea for a new feature, please open an **Issue** on GitHub!

## Submitting a Pull Request (PR)

1. **Fork** the repository on GitHub.
2. **Clone** your forked repository to your local machine.
3. **Create a new branch** for your feature or bugfix (`git checkout -b feature/amazing-new-pet`).
4. **Make your changes** and test them locally by loading the unpacked extension in your browser.
5. **Commit your changes** (`git commit -m "Add an amazing new pet"`).
6. **Push to the branch** (`git push origin feature/amazing-new-pet`).
7. **Open a Pull Request** against the main repository.

## Development Setup
No `npm install` or heavy build tools required! Cozy Pets uses vanilla JavaScript and CSS to keep it blazing fast and lightweight.
- Edit files directly in `content/` or `popup/`.
- Go to `chrome://extensions` or `edge://extensions`.
- Click the **Reload** icon on the extension card to see your changes instantly!

Let's build the cutest browser companion together! ✨
