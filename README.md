# Crispy Vault
This project intends to become a generalized desktop application for managing assets related to audio composition and production. Assets will be stored on a network-accessible location since many contracts prevent the use of cloud storage.

## Current Status
This project is not complete, and is currently abandoned, and I've used it primarily to learn some rust and experiment with Tauri as an alternative to Electron. This was fun and difficult. I'm not sure that rust and I will ever be friends, but we can coexist.

# Setting Up & Tech Stack
This project runs on https://tauri.app/, which is a rust-based desktop web application framwork (like Electron). It aims to be lightweight and performant.

To work with this project, ensure you're set up for rust and web development by following the prereq guide for Tauri here: https://tauri.app/start/prerequisites/

This project expects you to be using Tauri v2 (an early version), Node 22 and pnpm as the package manager.

## pnpm setup
You can set up pnpm once you have node 22 installed by running `corepack enable` and `corepack use pnpm`. Once you have 
it set up, run `pnpm install` to install deps. The project has pnpm 10 pinned and expects you to use that.

## Running the Project
Run `pnpm tauri dev` to compile the rust deps and run the project.

# FAQ

### Where are the files stored?
The files are stored under `com.surgingforward.crispy-vault` inside your user's app data directory.

As an example, on EndeavorOS (arch linux), the files are stored under `/home/<USER>/.local/share/com.surgingforward.crispy-vault/`. On Windows they're most likely in the `$APPDATA` dir.

### Where is the database stored?
Same place as the files, it's sqlite. Feel free to hack away, the data is yours!

### What features currently exist?
- Create assets with name + description
- Upload, edit and delete files on assets (it's really copying to the share dir)
- WIP Omnisearch - try typing `tag:test`. It doesn't actually search, but it does pull from the db.
- WIP drag-and-drop treeview. Modify `index.html` to point at `/src/sandbox/main.tsx` instead and you can play with that.

### Did you do something dumb and rewrite this project in golang at one point?
`<_<` `>_>`

... https://github.com/DSurguy/crispy-vault-golang

I may have struggled to correctly interpret a rust sqlite error that indicated my query was wrong, and rage-rewrote the entire app in a day. I then had the EXACT SAME ERROR IN GOLANG. Light bulb went on at that point.

See https://github.com/DSurguy/crispy-vault/commit/019751a4ac2569bbcddae57a68a6387461fbb7a5

Turns out wails is pretty cool as a tauri alternative in golang.