const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();
var uniqid = require('uniqid');


var serviceAccount = require("./ServiceAccountKey.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://testfire-73c4f.firebaseio.com"
});
const db = firebase.firestore();

app.use(cors({ origin: true }));

//create
app.post('/api/user', (req, res) => {
    (async () => {
        try {
            let id = uniqid()
          await db.collection('users').doc('/' + id + '/')
              .create({userName: req.body.userName,address: req.body.address,serviceName:req.body.serviceName, status:'pending', pincode:req.body.pincode});
            // .create({item: req.body.item});
          return res.status(200).send({message:'success'});
        } catch (error) {
          console.log(error);
          return res.status(500).send(error);
        }
      })();
  });

  //read all
  app.get('/api/service', (req, res) => {
    (async () => {
        try {
            let query = db.collection('services');
            let response = [];
            await query.get()
            .then(querySnapshot => {
            let docs = querySnapshot.docs;
            for (let doc of docs) {
                const selectedItem = {
                    id: doc.id,
                    serviceName: doc.data().name,
                    description: doc.data().description,
                    cost: doc.data().cost
                };
                response.push(selectedItem);
            }
            return 
            });
            return res.status(200).send(response);
        } catch (error) {
            // console.log(error);
            return res.status(500).send(error);
        }
        })();
    });

    app.get('/api/user', (req, res) => {
        (async () => {
            try {
                let query = db.collection('users');
                let response = [];
                let totalCount
                let pageSize = parseInt(req.query.pageSize)
                let pageIndex = parseInt(req.query.pageIndex)
                await query.get().then(querySnapshot => {
                let docs = querySnapshot.docs;
                for (let doc of docs) {
                    const selectedItem = {
                        id : doc.id,
                        userName : doc.data().userName,
                        serviceName: doc.data().serviceName,
                        address: doc.data().address,
                        status: doc.data().status
                    };
                    response.push(selectedItem);
                }
                return 
                });
                totalCount = response.length
                if((pageSize+pageIndex) <= response.length){
                response = response.slice(pageIndex,(pageSize+pageIndex))
                }
                return res.status(200).send({data: response, totalCount: totalCount, totalPages: Math.ceil(totalCount / req.query.pageSize)});
            } catch (error) {
                // console.log(error);
                return res.status(500).send(error);
            }
            })();
        });

    // update
    app.put('/api/user', (req, res) => {
        (async () => {
            try {
                const document = db.collection('users').doc(req.query.user_id);
                await document.update({
                    status: req.body.status
                });
                return res.status(200).send({message : 'user status updated'});
            } catch (error) {
                console.log(error);
                return res.status(500).send(error);
            }
            })();
        });

exports.app = functions.https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
