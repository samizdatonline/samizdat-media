/**
 * StorJ component for storing and retrieving files from a distributed
 * community storage network
 *
 * See https://storj-thirdparty.github.io/uplink-nodejs/#/library for docs
 */

import UplinkNodejs from 'uplink-nodejs';
import express from 'express';

export default class StorJ {
    constructor(connector) {
        this.connector = connector;
        this.bucket = "video";
    }
    static async mint(connector) {
        let sj = new StorJ(connector);
        let libUplink = new UplinkNodejs.Uplink();
        let access = await libUplink.requestAccessWithPassphrase(
            connector.profile.STORJ.SATELLITE_URL, connector.profile.STORJ.APIKEY, connector.profile.STORJ.PASSPHRASE
        );
        sj.project = await access.openProject();
        return sj;
    }
    routes() {
        let router = express.Router();
        router.get("/list",async (req,res)=>{
            try {
                let list = await this.project.listObjects(this.bucket,null);
                let result = Object.values(list).map(val=>val.key);
                res.json(result);
            } catch(e) {
                console.error(e);
                res.status(500).send();
            }
        });
        router.get("/get/:id",async (req,res)=>{
            try {
                let opts = new UplinkNodejs.DownloadOptions(-1);
                let download = await this.project.downloadObject(this.bucket,req.params.id,opts);
                let buffer = new Buffer.alloc(10000);
                let bytes = await download.read(buffer,buffer.length);
                res.send(bytes);
            } catch(e) {
                console.error(e);
                res.status(500).send();
            }
        });
        router.put("/put",async(req,res) => {
            try {
                res.json(req.body);
            } catch(e) {
                console.error(e);
                res.status(500).send();
            }
        });
        return router;
    }
}