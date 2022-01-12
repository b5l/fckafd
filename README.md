# #FCKAFD

## What is this?

This project can automatically screenshot posts of multiple facebook pages and check them for deletion afterwards.

## Features

- [x] Screenshot posts
- [x] Check deletion status afterwards
- [ ] Scrape more posts than newest 4-5
- [ ] Webinterface listing all deleted posts
- [ ] Webinterface allowing for configuration (currently a lot of stuff is hardcoded :()
- [ ] Notification whenever post got deleted

## Setup

```bash
linux@linux:~/Code$ # Clone repository
linux@linux:~/Code$ git clone https://github.com/b5l/fckafd
linux@linux:~/Code$ cd fckafd

linux@linux:~/Code/fckafd$ # Install dependencies
linux@linux:~/Code/fckafd$ npm i

linux@linux:~/Code/fckafd$ # Our scraper needs a valid Facebook login. Sorry about that.
linux@linux:~/Code/fckafd$ cp credentials.json.tpl credentials.json
linux@linux:~/Code/fckafd$ vim credentials.json

linux@linux:~/Code/fckafd$ # Add a Facebook page to regularly check (pageId is the part right after https://facebook.com/ in the URL)
linux@linux:~/Code/fckafd$ npx typeorm query 'insert into facebook_page (pageId) values ("pageId")'

linux@linux:~/Code/fckafd$ # Run server
linux@linux:~/Code/fckafd$ npm run start
```

Now whenever a screenshot is taken, you will find it in `./posts/active/`. After deletion, it will be moved to `./posts/deleted`.
