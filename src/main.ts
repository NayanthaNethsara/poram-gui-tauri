import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { getCurrentWindow } from "@tauri-apps/api/window";

declare global {
  interface Window {
    runPoram: () => void;
    downloadHTML: () => void;
    switchView: (view: string) => void;
    closeApp: () => void;
    toggleMaximize: () => void;
    minimizeApp: () => void;
    showDialog: (message: string) => void;
    hideDialog: () => void;
  }
}

const appWindow = getCurrentWindow();

window.closeApp = function () {
  appWindow.close();
};

window.toggleMaximize = async function () {
  appWindow.toggleMaximize();
};

window.minimizeApp = function () {
  appWindow.minimize();
};

function showDialog(message: string) {
  const dialog = document.getElementById("customDialog")!;
  const text = document.getElementById("dialogText")!;
  text.textContent = message;
  dialog.classList.remove("hidden");
}

window.hideDialog = function () {
  document.getElementById("customDialog")?.classList.add("hidden");
};

window.runPoram = async function () {
  const input = (document.getElementById("dslInput") as HTMLTextAreaElement)
    .value;

  const output = document.getElementById("output") as HTMLPreElement;
  const preview = document.getElementById("previewFrame") as HTMLIFrameElement;

  output.textContent = "Generating...";
  preview.srcdoc = "";

  try {
    const html = await invoke<string>("run_poram", { input });
    output.textContent = html;
    preview.srcdoc = html;
  } catch (err) {
    if (typeof err === "object" && err !== null && "message" in err) {
      showDialog((err as { message: string }).message);
    } else {
      showDialog(String(err ?? "Unknown error."));
    }
  }
};

window.downloadHTML = async function () {
  const html =
    (document.getElementById("output") as HTMLPreElement).textContent || "";

  if (!html.trim()) {
    alert("No HTML to save!");
    return;
  }

  const filePath = await save({
    defaultPath: "form.html",
    filters: [{ name: "HTML Files", extensions: ["html"] }],
  });

  if (filePath) {
    await writeTextFile(filePath, html);
    alert("HTML saved successfully.");
  }
};

window.switchView = function (view: string) {
  const previewBtn = document.getElementById("btnPreview")!;
  const codeBtn = document.getElementById("btnCode")!;
  const preview = document.getElementById("previewFrame") as HTMLIFrameElement;
  const output = document.getElementById("output") as HTMLPreElement;

  if (view === "preview") {
    preview.style.display = "block";
    output.style.display = "none";
    previewBtn.classList.add("active");
    codeBtn.classList.remove("active");
  } else {
    preview.style.display = "none";
    output.style.display = "block";
    codeBtn.classList.add("active");
    previewBtn.classList.remove("active");
  }
};
