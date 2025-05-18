This is my fullstack rendition of Shop Red Live.
(NOTE: I put the README here but note that not everything is fully implemented yet! The backend is up, frontend in progress)

First off, swap into client and install the following using the following commands assuming you don't have them: 

```
cd client
npm install react
npm install axios
npm install react-router-dom
```

Next, with another terminal, assuming you start off at the top directory go to the server and install the following using the following commands:
```
cd server
npm install express
npm install mongoose
npm install nodemon
npm install cors
```

Just in case, if you want, do the following command in both of the terminals (in the client and server directories respectfully), it will help in case and odd dependencies were missed: 
```
npm install
```

running this app requires mongoDB and mongosh. the installations are in this link: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/ , https://www.mongodb.com/docs/mongodb-shell/install/

after you do that, initiate in another terminal the mongoDB initialization command and the following right after: 

```
brew services start mongodb-community@8.0
mongosh
show dbs
use shopredlive
```

Now we start booting up the code. First, we must initialize the database. Using the server terminal, you will be making your own admin account. follow the rules in this next commands brackets to make it and initialize the rest of the data:

```
node init.js mongodb://127.0.0.1:27017/shopredlive {username} {firstname} {lastname} {password} {email}
```

Now we can start.
In the server terminal again, type the following:

```
nodemon server.js
```

If this doesn't work boot up another terminal in the outer directory and type the following: 

```
npm install -g nodemon
nodemon server/server.js
```

By this point the server should be connected to port 8000. Finally, type the following in the client terminal and enjoy:

```
npm start
```
