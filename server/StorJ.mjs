/**
 * StorJ component for storing and retrieving files from a distributed
 * community storage network
 *
 * See https://storj-thirdparty.github.io/uplink-nodejs/#/library for docs
 */

import UplinkNodejs from 'uplink-nodejs';
import fileUpload from 'express-fileupload';
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
        router.use(fileUpload({limit:200*1024*1024}));
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
                let info = await download.info();
                let stat = await this.project.statObject(this.bucket,req.params.id);
                res.json({info:info,stat:stat});
            } catch(e) {
                console.error(e);
                res.status(500).send();
            }
        });
        router.put("/put",async(req,res) => {
            try {
                let opts = new UplinkNodejs.UploadOptions(0);
                let id = this.connector.idForge.datedId();
                let upload = await this.project.uploadObject(this.bucket,id,opts);
                let result = await upload.write(req.files.file.data,req.files.file.size);
                await upload.commit();
                let info = await upload.info();
                res.json({info:info});
            } catch(e) {
                console.error(e);
                res.status(500).send();
            }
        });
        return router;
    }
}