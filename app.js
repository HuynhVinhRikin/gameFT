let express         = require('express');
let app             = express();
let bodyPaser       = require('body-parser');
const http = require('http');
const server = http.createServer(app);


app.set('view engine', 'ejs');
app.set('views', './views/');
app.use(express.static('./public'));

app.use(bodyPaser.json());
app.use(bodyPaser.urlencoded({ extended: true }));

// demo GAME
let arrayUser = [];
app.get('/game', (req, res) => {
    res.render('game')
});

app.get('/login', (req, res) => {
});

app.listen(3001, () => console.log(`server start at port 3000`));

let arrayConnected = [];
const io = require('socket.io')(server);

io
.use( (socket, next) => {
    const { id: socketID } = socket;
    console.log({ tokem : socket.handshake.query.token})
    if (socket.handshake.query && socket.handshake.query.token ) {
        if( socket.handshake.query.token !='undefined'){
            if(socket.handshake.query.token && !arrayConnected[socket.handshake.query.token]){
                arrayConnected[socket.handshake.query.token]= {};
                arrayConnected[socket.handshake.query.token].sockets= [socketID];
            }
    
            if(socket.handshake.query.token && arrayConnected[socket.handshake.query.token]){
                arrayConnected[socket.handshake.query.token].sockets= [...arrayConnected[socket.handshake.query.token].sockets, socketID];
            }
            next()
        }
    }
})
.on('connection', socket => {
    const { id: socketID } = socket;
    arrayConnected.push(socketID);
    console.log('connect', socketID)
    socket.on('CSS_JOIN_GAME', data => { 
        arrayUser.push(data.name)
        let  keysDataOrigin  =  Object.keys(arrayConnected);
        for(let i =0; i < keysDataOrigin.length; i++){
            
            let  listSocket =  arrayConnected[keysDataOrigin[i]].sockets;
            console.log({listSocket, i : keysDataOrigin[i]})
            if(listSocket){
                let listIDSendt = '';
                listSocket.forEach((socketID, index) =>{
                    if(!listIDSendt.includes(socketID)){
                        io.to(socketID).emit('SSC_NEW_USER', { user : data.name, arrayUser: arrayUser, socketID })
                        listIDSendt += ` , ${socketID} `;
                    }
                })
            }
        }
        // socket.emit('SSC_NEW_USER', { user : data.name, arrayUser: arrayUser, socketID })
    });
    socket.on('CSS_USER_MOVING', data => { 
            let  keysDataOrigin  =  Object.keys(arrayConnected);
            for(let i =0; i < keysDataOrigin.length; i++){
                
                let  listSocket =  arrayConnected[keysDataOrigin[i]].sockets;
                console.log({listSocket, i : keysDataOrigin[i]})
                if(listSocket){
                    let listIDSendt = '';
                    listSocket.forEach((socketID, index) =>{
                        if(!listIDSendt.includes(socketID)){
                            io.to(socketID).emit('SSC_USER_MOVING',  data );
                            listIDSendt += ` , ${socketID} `;
                        }
                    })
                }
            }
        // arrayConnected.forEach(_socketID=>{
        //     io.to(_socketID).emit('SSC_USER_MOVING',  data )
        // })
    });

    socket.on('CSS_SEND_MESSAGE', data => { 

        let  keysDataOrigin  =  Object.keys(arrayConnected);
        for(let i =0; i < keysDataOrigin.length; i++){
            
            let  listSocket =  arrayConnected[keysDataOrigin[i]].sockets;
            console.log({listSocket, i : keysDataOrigin[i]})
            if(listSocket){
                let listIDSendt = '';
                listSocket.forEach((socketID, index) =>{
                    if(!listIDSendt.includes(socketID)){
                        io.to(socketID).emit('SSC_SEND_MESSAGE',  data )
                        listIDSendt += ` , ${socketID} `;
                    }
                })
            }
        }
        // arrayConnected.forEach(_socketID=>{
        //     io.to(_socketID).emit('SSC_SEND_MESSAGE',  data )
        // })
    });
    
    socket.on('disconnect', () => { 
        console.log('DIsssconnect', socketID)
        arrayConnected.pop(socketID);
  });
});
server.listen(3000);

// let dataOrigin = {`
//     name: 'Carot',
//     description: 'ABCDEF',
//     calo: '120',
//     other: {
//         cholesterol: '100',
//         water: '200',
//         sodium: '200',
//     },
//     other2: {
//         cholesterol: '100',
//         water: '200',
//         sodium: '200',c
//         cls : '20',
//         cls2 : {
//             num1 : '30',
//             num2 : '40'
//         }
//     },
//     cls : '20'
// }

// // array key must convert value
// let keyConvertMustNumber = ['calo', 'cholesterol', 'sodium', 'water', 'cls', 'num1'];

// // get key in object dataOrigin
// let  keysDataOrigin  =  Object.keys(dataOrigin);

// function checkChildKey(data, key){

//     if(typeof data[key] === 'object'){
//         let otherKeys =  Object.keys(data[key]);
//         otherKeys.forEach( otherKey =>{
//             if(data[key]){
//                 checkChildKey(data[key], otherKey)
//             }
//         });
//     }

//     if(typeof data[key] != 'object' && keyConvertMustNumber.includes(key)){
//         data[key]= Number(data[key] || 0);
//     }
// }

// keysDataOrigin.forEach(key=>{
//     if(dataOrigin[key]){
//         // đệ quy tìm đến cấp con cuối cùng sau đó check nếu là thuộc keyConvertMustNumber thì ép sang number
//         checkChildKey(dataOrigin, key)
//     }
  
// })
// console.log(dataOrigin)

