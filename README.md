# Making Ten Card Game
> Simple interactive math game, built with Svelte (my first Svelte project)

[![Netlify Status](https://api.netlify.com/api/v1/badges/bfef85a2-7973-471e-b742-a5fd1e0b5881/deploy-status)](https://app.netlify.com/sites/make-ten-card-game/deploys)

# Go to the App!
You can access the game [here](https://make-ten-card-game.netlify.app/)!

![Logo](./public/images/Equals_10_Logo_Medium.png)

## Installation
Nothing to install; published as a SPA at: [make-ten-card-game.netlify.app/](https://make-ten-card-game.netlify.app/)

## Usage Example
![Demo](./demo.gif)

The goal of the game is pretty simple (this is geared towards elementary students). You want to combine cards from the top of the stacks to "make ten", over and over, until there are no cards left. Once an entire stack has been cleared, you can also move top cards into the empty spaces.

Update: You can now require different sums other than just `10`

## Development
This is your fairly standard Svelte 3 + TypeScript project.

 - `npm install` to install dependencies
 - `npm run build` to create production HTML folder
 - `npm run dev` to serve with watcher (re-builds and serves on file changes)

## Change Notes
Version | Date | Notes
--- | --- | ---
`1.2.0` | July  14th, 2023 | Fix up setting restoration feature
`1.1.0` | July 12th, 2021 | Add support for other sums than 10
`1.0.0` | October 2nd, 2020 | Initial release 🚀