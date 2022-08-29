/**
 * StorJ component for storing and retrieving files from a distributed
 * community storage network
 *
 * See https://storj-thirdparty.github.io/uplink-nodejs/#/library for docs
 */

import UplinkNodejs from 'uplink-nodejs';
import fileUpload from 'express-fileupload';
import express from 'express';
import fs from 'fs';
import {Readable} from 'stream';

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
                const range = req.headers.range;
                if (!range) {
                    res.status(400).send("Requires Range header");
                }

                // get video stats (about 61MB)
                const videoPath = "test.mp4";
                const videoSize = fs.statSync("test.mp4").size;

                // Parse Range
                const CHUNK_SIZE = 10 ** 6; // 1MB
                const start = Number(range.replace(/\D/g, ""));
                const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

                // Create headers
                const contentLength = end - start + 1;
                const headers = {
                    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": contentLength,
                    "Content-Type": "video/mp4",
                };

                // HTTP Status 206 for Partial Content
                res.writeHead(206, headers);

                // create video read stream for this particular chunk
                const videoStream = fs.createReadStream(videoPath, { start, end });

                // Stream the video chunk to the client
                videoStream.pipe(res);

                // let range = req.headers.range;
                // let opts = new UplinkNodejs.DownloadOptions(0,-1);
                // let download = await this.project.downloadObject(this.bucket,req.params.id,opts);
                // let info = await download.info();
                // let videoSize = info.system.content_length;
                //
                // const CHUNK_SIZE = 10 ** 6;
                // const start = Number(range.replace(/\D/g, ""));
                // const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
                // const contentLength = end - start + 1;
                // const headers = {
                //     "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                //     "Accept-Ranges": "bytes",
                //     "Content-Length": contentLength,
                //     "Content-Type": "video/mp4",
                // };
                // res.writeHead(206, headers);
                //
                // let buffer = new Buffer.alloc(info.system.content_length);
                // await download.read(buffer,buffer.length);
                // let stream = Readable.from(buffer);
                // stream.pipe(res);

            } catch(e) {
                console.error(e);
                res.status(500).send();
            }
            // try {
            //     const response = await axios({
            //         method: 'GET',
            //         url: fileUrl,
            //         responseType: 'stream',
            //     });
            //
            //     const w = response.data.pipe(fs.createWriteStream(localFilePath));
            //     w.on('finish', () => {
            //         console.log('Successfully downloaded file!');
            //     });
            // } catch (err) {
            //     throw new Error(err);
            // }
        });
        router.put("/put",async(req,res) => {
            try {
                let opts = new UplinkNodejs.UploadOptions(0);
                let ext = req.files.file.mimetype.split('/')[1]
                let id = this.connector.idForge.datedId()+"."+ext;
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