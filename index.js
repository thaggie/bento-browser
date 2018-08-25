const {
  app,
  BrowserWindow,
  Menu,
  shell,
  session,
  globalShortcut
} = require("electron");
var https = require("https");
var http = require("http");
var path = require("path");
const { parse } = require("url");
const defaultMenu = require("electron-default-menu");

const fetch = require('isomorphic-fetch');
const sites = require("./sites.json");
const shortners = require("./shortners.json");

const menuItems = sites
  .filter(site => site.url)
  .map(site => ({ label: site.label, url: site.url }));

const getPrefsDir = () => {
  if (process.env.APPDATA) {
    // Windows
    return path.resolve(process.env.APPDATA, "Bento");
  } else if (process.platform == "darwin") {
    // Mac
    return path.resolve(process.env.HOME, "Library", "Preferences", "Bento");
  } else {
    // Linux
    return path.resolve(process.env.HOME, ".bento");
  }
};

const openUrl = (urlString, stack=[]) => {
  fetch(urlString, {method: 'HEAD', mode:'cors', redirect: 'manual'})
  .then(response => {
    if (response.status === 301) {
      const location = response.headers.get('Location');
      if (location !== urlString) {
        openUrl(location, [...stack, urlString]);
      } else {
        reallyOpenUrl(urlString, stack);  
      }
    } else {
      reallyOpenUrl(urlString, stack);
    }
  });
};

const reallyOpenUrl = (urlString, stack) => {

  if (stack.length > 0) {
    console.log(stack.join(' -> '), '->', urlString);
  }
  const url = parse(urlString);

  const matched = sites.filter(site => site.host === url.host);
  if (matched.length === 0) {
    console.log(urlString);
    shell.openExternal(urlString);
    return;
  }
  const site = matched[0];

  const ses = session.fromPartition("persist:" + site.partition);
  if (!site.stateful) {
    ses.clearCache(() => undefined);
    ses.clearStorageData();
  }

  var mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      session: ses
    }
  });

  mainWindow.on("app-command", (e, cmd) => {
    // Navigate the window back when the user hits their mouse back button
    if (cmd === "browser-backward" && win.webContents.canGoBack()) {
      win.webContents.goBack();
    }
  });

  ses.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    const url = parse(details.url);

    const found = site.hosts.filter(hostPart => url.host.endsWith(hostPart));

    if (found.length > 0 || site.host === url.host) {
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    } else {
      console.log(details.method, details.url);
      callback({ cancel: true, requestHeaders: details.requestHeaders });

      if (details.resourceType === "mainFrame" && details.method === "GET") {
        openUrl(details.url);
        mainWindow.webContents.goBack();
      }
    }
  });

  mainWindow.webContents.on("new-window", function(e, url) {
    e.preventDefault();
    openUrl(url);
  });

  mainWindow.maximize();
  mainWindow.loadURL(urlString);
};

const prefsDir = getPrefsDir();
app.setPath("userData", path.resolve(prefsDir, "data"), app.getName());
app.setPath("userCache", path.resolve(prefsDir, "cache"), app.getName());

app.on("ready", () => {
  sites.filter(site => site.shortcut).forEach(site => {
    globalShortcut.register(site.shortcut, () => {
      openUrl(site.url);
    });
  });

  // Get template for default menu
  const menu = defaultMenu(app, shell);

  // Add custom menu
  menu.splice(4, 0, {
    label: "Sites",
    submenu: menuItems.map(menuItem => {
      return {
        label: menuItem.label,
        click: () => {
          openUrl(menuItem.url);
        }
      };
    })
  });

  // Set top-level application menu, using modified template
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // app.quit()
});

const filter = {
  urls: ["*"]
};
