import {
  Action,
  ActionPanel,
  Form,
  showToast,
  Toast,
  getPreferenceValues,
  openExtensionPreferences,
  Clipboard,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { exec } from "child_process";
import { homedir } from "os";
import path from "path";

interface Preferences {
  downloadPath: string;
  ytdlpPath: string;
}

type Format = "mp4" | "mp3";

interface ClipboardItem {
  content: string;
  timestamp: Date;
}

function isYouTubeUrl(text: string): boolean {
  return text.includes("youtube.com/watch") || text.includes("youtu.be/");
}

export default function Command() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<Format>("mp3");
  const [isLoading, setIsLoading] = useState(false);
  const [clipboardHistory, setClipboardHistory] = useState<ClipboardItem[]>([]);

  const preferences = getPreferenceValues<Preferences>();

  const downloadPath =
    preferences.downloadPath || path.join(homedir(), "Downloads");
  const ytdlpPath = preferences.ytdlpPath || "/opt/homebrew/bin/yt-dlp";

  // Charger le clipboard actuel au lancement
  useEffect(() => {
    async function loadClipboard() {
      try {
        const text = await Clipboard.readText();
        if (text && isYouTubeUrl(text)) {
          setUrl(text);
        }
      } catch {
        // Ignorer les erreurs de clipboard
      }
    }
    loadClipboard();
  }, []);

  async function handleSubmit() {
    if (!url.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "URL requise",
        message: "Entre une URL YouTube valide",
      });
      return;
    }

    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      await showToast({
        style: Toast.Style.Failure,
        title: "URL invalide",
        message: "L'URL doit provenir de YouTube",
      });
      return;
    }

    setIsLoading(true);

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Téléchargement en cours...",
      message: format === "mp3" ? "Extraction audio" : "Téléchargement vidéo",
    });

    const command =
      format === "mp3"
        ? `"${ytdlpPath}" -x --audio-format mp3 -o "${downloadPath}/%(title)s.%(ext)s" "${url}"`
        : `"${ytdlpPath}" -f "bv*[vcodec^=avc1]+ba[acodec^=mp4a]/b[ext=mp4]" -o "${downloadPath}/%(title)s.%(ext)s" "${url}"`;

    exec(
      command,
      {
        env: {
          ...process.env,
          PATH: `${process.env.PATH}:/opt/homebrew/bin:/usr/local/bin`,
        },
      },
      (error, stdout, stderr) => {
        setIsLoading(false);

        if (error) {
          toast.style = Toast.Style.Failure;
          toast.title = "Échec du téléchargement";
          toast.message = stderr || error.message;
          return;
        }

        toast.style = Toast.Style.Success;
        toast.title = "Téléchargement terminé !";
        toast.message = `Fichier sauvegardé dans ${downloadPath}`;

        setUrl("");
      }
    );
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Télécharger" onSubmit={handleSubmit} />
          <Action
            title="Coller depuis Clipboard"
            icon={{ source: "clipboard-16" }}
            shortcut={{ modifiers: ["cmd"], key: "v" }}
            onAction={async () => {
              const text = await Clipboard.readText();
              if (text) setUrl(text);
            }}
          />
          <Action
            title="Ouvrir les Preferences"
            onAction={openExtensionPreferences}
            shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
          />
          <Action.OpenInBrowser
            title="Ouvrir le Dossier"
            url={`file://${downloadPath}`}
            shortcut={{ modifiers: ["cmd"], key: "o" }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="url"
        title="URL YouTube"
        placeholder="https://www.youtube.com/watch?v=..."
        value={url}
        onChange={setUrl}
      />
      <Form.Dropdown
        id="format"
        title="Format"
        value={format}
        onChange={(v) => setFormat(v as Format)}
      >
        <Form.Dropdown.Item value="mp4" title="MP4 (Vidéo)" icon="🎬" />
        <Form.Dropdown.Item value="mp3" title="MP3 (Audio)" icon="🎵" />
      </Form.Dropdown>
      <Form.Description
        title="Info"
        text={`Les fichiers seront sauvegardés dans: ${downloadPath}`}
      />
    </Form>
  );
}
