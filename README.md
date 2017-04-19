# Bento Browser

This is an experimental new browser based on [Electron](electron.atom.io), the idea behind it is that each site is compartmentalized into it's own partition to reduce tracking, as well as sites having a set of hosts that they allow http requests to go to through again to reduce tracking and to speed up sites.

This was inspired by Laura Kalbag's blog post [Digital Assistants, Facebook Quizzes, And Fake News! You Won’t Believe What Happens Next](https://laurakalbag.com/you-wont-believe-what-happens-next/) and the [Qubes OS](https://www.qubes-os.org)

For now it's just working with a hard coded set of sites (in sites.json), sites not listed will launch in the OS browser.

## Usage

There's no packaged version so you have to download and build it from the terminal:

```
git clone git@github.com:thaggie/bento-browser.git
cd bento-browser
npm install
npm run package
```

## Future Work
* UI chrome so there's back buttons etc.
* User configuration rather than sites.json
* Add a homepage to jump off to the sites rather than opening Facebook
