import {Uplink, UploadOptions, DownloadOptions} from "uplink-nodejs"

// Get file list:
// await this.project.listObjects(this.bucket, null)

export class StorjService {
    constructor({bucket}) {
        this.bucket = bucket
        this.project = void 0
    }
    async bootstrap({SATELLITE_URL, APIKEY, PASSPHRASE}) {
        const uplink = new Uplink()
        const access = await uplink.requestAccessWithPassphrase(SATELLITE_URL, APIKEY, PASSPHRASE)

        this.project = await access.openProject()
    }
    async getFileStat(fileName) {
        const stat = await this.project.statObject(this.bucket, fileName)
        return stat
    }
    async getFileSize(fileName) {
        const stat = await this.getFileStat(fileName)
        return stat.system.content_length
    }
    async uploadFile(name, data, size) {
        const uploadOpts = new UploadOptions(0) // arg - exprires
        const upload = await this.project.uploadObject(this.bucket, name, uploadOpts)
        await upload.write(data, size)
        await upload.commit()
        const info = await upload.info()

        return info
    }
    async removeFile(name) {
        const result = await this.project.deleteObject(this.bucket, name)

        return result
    }
    async downloadFile(name, bufferSize = 8000, offset = 0, length = -1) {
        const opts = new DownloadOptions(offset, length)
        const downloadObject = await this.project.downloadObject(this.bucket, name, opts)
        const info = await downloadObject.info()
        const size = info.system.content_length

        let downloadSize = size
        if(length === -1) {
            if(offset) downloadSize = size-offset
            else downloadSize = size
        } else {
            downloadSize = length
        }

        let totalRead = 0
        const downloadFn = async () => {
            if(totalRead >= downloadSize) return;

            const buffer = Buffer.alloc(bufferSize)
            const bytesread = await downloadObject.read(buffer, buffer.length)
            totalRead += bytesread.bytes_read

            return buffer.subarray(0, bytesread.bytes_read)
        }

        return {offset: offset, size: downloadSize, download: downloadFn}
    }
    async downloadBuffer(name) {
        const stream = await this.downloadFile(name)

        const chunks = []
        while(true) {
            const buffer = await stream.download()
            if(!buffer) break;

            chunks.push(buffer)
        }

        return Buffer.concat(chunks)
    }
}
