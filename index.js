const {app, BrowserWindow, Menu, shell, session} = require('electron')
const {parse} = require ('url');
const defaultMenu = require('electron-default-menu');

const menuItems = [
  {label: 'BBC News', url: 'https://www.bbc.com/news'},
  {label: 'Facebook', url: 'https://www.facebook.com'},
  {label: 'The Guardian', url: 'https://www.theguardian.com'},
  {label: 'The Onion', url: 'http://www.theonion.com'},
  {label: 'Twitter', url: 'https://www.twitter.com'},
  {label: 'The Verge', url: 'http://www.theverge.com'},

];

const sites = [{
  partition: 'onion',
  host: 'www.theonion.com',
  hosts: [
    '.theonion.com',
    '.onionstatic.com',
    '.onionstudios.com',
    'ssl.p.jwpcdn.com'
  ]
}, {
  partition: 'bbc',
  host: 'www.bbc.com',
  hosts: [
    '.bbc.com',
    '.bbci.co.uk',
    '.bbc.co.uk',
  ]
}, {
  partition: 'facebook',
  host: 'www.facebook.com',
  hosts: [
    '.facebook.com',
    '.fbcdn.net',
  ]
}, {
  partition: 'guardian',
  host: 'www.theguardian.com',
  hosts: [
    '.theguardian.com',
    '.guim.co.uk',
  ]
}, {
  partition: 'twitter',
  host: 'www.twitter.com',
  hosts: [
    'twitter.com',
    '.twimg.com'
  ]
}, {
  partition: 'verge',
  host: 'www.theverge.com',
  hosts: [
    '.theverge.com',
    '.vox-cdn.com',
  ]
}];

const openUrl = (urlString) => {
  const url = parse(urlString);
  const matched = sites.filter(site => site.host === url.host);
  if (matched.length === 0) {
    console.log(urlString);
    shell.openExternal(urlString);
    return;
  }
  const site = matched[0];

  const ses = session.fromPartition('persist:' + site.partition);

  var mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      session: ses,
    },
  });

  mainWindow.on('app-command', (e, cmd) => {
    // Navigate the window back when the user hits their mouse back button
    if (cmd === 'browser-backward' && win.webContents.canGoBack()) {
      win.webContents.goBack()
    }
  })

  ses.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    const url = parse(details.url);

    const found = site.hosts.filter(hostPart => url.host.endsWith(hostPart));

    if (found.length > 0) {
      callback({cancel: false, requestHeaders: details.requestHeaders})
    } else {
      console.log(details.method, details.url);
      callback({cancel: true, requestHeaders: details.requestHeaders})
    }
  });

  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    openUrl(url);
  });

  mainWindow.maximize();
  mainWindow.loadURL(urlString);
};

app.on('ready', () => {

  // Get template for default menu
  const menu = defaultMenu(app, shell);


  // Add custom menu
  menu.splice(4, 0, {
    label: 'Sites',
    submenu: menuItems.map(menuItem => {
      return {
        label: menuItem.label,
        click: () => {
          openUrl(menuItem.url);
        }
      };
    }),
  });

  // Set top-level application menu, using modified template
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

  openUrl('https://www.facebook.com');

});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit()
})


const filter = {
  urls: ['*']
}
