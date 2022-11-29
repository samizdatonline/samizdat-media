import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import CommonMixin from '@metric-im/common-mixin';
import Profile from './profile.mjs';
import Componentry from '@metric-im/componentry';
import StorJ from './server/StorJ.mjs';
import path from "path";
import {fileURLToPath} from "url";
const root = path.dirname(fileURLToPath(import.meta.url));
import axios from 'axios';

let main = async function() {
    let app = express();
    app.__dirname = root;
    app.use(morgan('dev'));
    app.use(cors({
        origin: function(origin, callback){
            return callback(null, true);
        },
        credentials:true
    }));
    app.use(express.urlencoded({extended: true}));
    app.use(express.json({limit: '50mb'}));
    app.get('/health', (req, res) => { res.status(200).send() });
    app.get('/favicon.ico',express.static('/site/assets/favicon-32x32.png'));
    app.use(cookieParser());
    // utility for constructing random alpha root names. Cap at 256 so it's not abused.
    app.use('/',express.static(root+"/site"));
    // add component server
    let componentry = new Componentry(app,await Profile());
    await componentry.init(CommonMixin,StorJ,ApplicationModule);

    app.get('/v/:video',async (req,res)=>{
        let body = {_origin:{host:req.hostname,ip:req.headers['x-forwarded-for'],ua:req.get('User-Agent')}}

        // body.word = req.params.word;
        // try {
        //     await axios.put(`${metricHost}/ping/silent/word`,body,header);
        //     res.status(203).send();
        // } catch(e) {
        //     console.error(e.message);
        //     res.status(500).json('something went wrong');
        // }
    })

    let server = http.createServer(app);
    server.listen(process.env.PORT || 3900);
    server.on('error', console.error);
    server.on('listening',()=>console.log("Listening on port "+server.address().port));
}();

class ApplicationModule extends Componentry.Module {
    constructor(connector) {
        super(connector,import.meta.url);
    }
}

process.on('SIGINT', function() {
    console.log("Shutting down");
    process.exit();
});
