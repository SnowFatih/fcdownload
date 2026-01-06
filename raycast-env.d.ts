/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Dossier de telechargement - Ou sauvegarder les fichiers telecharges */
  "downloadPath": string,
  /** Chemin yt-dlp - Chemin vers l'executable yt-dlp */
  "ytdlpPath": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `download` command */
  export type Download = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `download` command */
  export type Download = {}
}

