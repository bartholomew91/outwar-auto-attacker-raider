# mDCAAR
An auto attacker and raid joiner for Outwar.com

## About
The current programs out there are Windows only, so I figured I'd put one out there that's free (if you run it locally), opensource, and accessible from a web browser.

## Requirements
[Node.js](http://nodejs.org)
## Install
Make sure you have [Node.js](http://nodejs.org) installed. You can either download and extract the github zip file, or clone through the git command line

```
git clone git@github.com:bartholomew91/outwar-auto-attacker-raider.git

cd outwar-auto-attacker-raider

cd client

npm install
```

## Running
You'll need to run to seperate servers for the program to work. So run each of these lines from a different terminal. Make sure you're in the root of the codes directory.

### Server
`cd server && npm run server:start`

### Client
When this is run, it should open in your browser, if it does not you can access the application by going to [http://localhost:3000](http://localhost:3000)

`cd client && yarn start`


## ToDo
* Auto Quester
* Username/Password login
* Skiller
* DC Auto Attacker
* Auto Raider
* Auto Level 11
* Refactor

