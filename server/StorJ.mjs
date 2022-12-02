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
import axios from 'axios';
import { Readable } from 'stream';

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
        // let access = await libUplink.parseAccess(process.env.ACCESS);
        sj.project = await access.openProject();
        return sj;
    }
    routes() {
        let router = express.Router();
        router.use(fileUpload({ limit: 200 * 1024 * 1024 }));
        router.get("/list", async (req, res) => {
            try {
                let list = await this.project.listObjects(this.bucket, null);
                let result = Object.values(list).map(val => {
                    return `<li><a href='/get/${val.key}'>${val.key}</a></li>`
                });
                res.send(`<html><body><ul>${result}</ul></body></html>`);
            } catch (e) {
                console.error(e);
                res.status(500).send();
            }
        });
        /**
         * This is test code that streams an mp4 from the server disk
         */
        router.get("/fileget/:id", async (req, res) => {
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
            } catch (e) {
                console.error(e);
                res.status(500).send();
            }
        });
        /**
         * This is intended to stream a file from the storj network to the browser as
         * it is being downloaded. But it doesn't work.
         */
        router.get("/get/:id", async (req, res) => {
            try {
                let range = req.headers.range;

                let start = 0;
                let end = -1;
                let opts = new UplinkNodejs.DownloadOptions(start, end);
                console.log(range)
                if (range) {
                    let [start, end] = range.replace(/bytes=/, "").split("-");
                    start = parseInt(start, 10);
                    end = end ? parseInt(end, 10) : -1
                    opts.offset = start;
                    opts.length = end - start;
                }
                if (start == 0 && end == -1) {
                    range = null;
                }

                let download = await this.project.downloadObject(this.bucket, req.params.id, opts);
                let info = await download.info();
                let objectSize = info.system.content_length;
                const BUFFER_SIZE = 8000;


                if (range) {
                    const headers = {
                        "Content-Range": `bytes ${start}-${end}/${objectSize}`,
                        "Accept-Ranges": "bytes",
                        "Content-Length": opts.length,
                        "Content-Type": "video/mp4",
                    };
                    console.log(headers);
                    res.writeHead(206, headers);
                } else {
                    const headers = {
                        "Content-Length": objectSize,
                        "Content-Type": "video/mp4",
                    };
                    console.log(headers);
                    res.writeHead(200, headers);
                }

                let loop = true;
                let totalRead = 0;
                while (loop) {
                    // Reading data from storj V3 network
                    let buffer = Buffer.alloc(BUFFER_SIZE);
                    await download.read(buffer, buffer.length
                    ).then(async (bytesread) => {
                        await res.write(buffer.subarray(0, bytesread.bytes_read))
                        totalRead += bytesread.bytes_read;
                        if (totalRead >= objectSize) {
                            loop = false;
                        }
                    }).catch((err) => {
                        console.log("Failed to read data from storj V3 network ");
                        console.log(err);
                        loop = false;
                    });
                }
                console.log("totalRead " + totalRead);

            } catch (e) {
                console.error(e);
                res.status(500).send();
            }
        });

        router.put("/put", async (req, res) => {
            try {
                let opts = new UplinkNodejs.UploadOptions(0);
                let ext = req.files.file.mimetype.split('/')[1]
                let id = this.connector.idForge.datedId();
                let fileId = id + "." + ext;
                let upload = await this.project.uploadObject(this.bucket, fileId, opts);
                let result = await upload.write(req.files.file.data, req.files.file.size);
                await upload.commit();
                let info = await upload.info();
                await axios.put(this.connector.profile.server+'/media/'+id,{
                    description:req.body.description,
                    type:ext,
                    length:info.system.content_length
                });
                res.json({ info: info });
            } catch (e) {
                console.error(e);
                res.status(500).send();
            }
        });
        return router;
    }
}