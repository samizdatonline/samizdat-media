import express from 'express';
import Componentry from '@metric-im/componentry';

export default class ChannelService extends Componentry.Module {
  constructor(connector) {
    super(connector,import.meta.url);
    this.mediaCollection = this.connector.db.collection('media');
  }
  routes() {
    let router = express.Router();
    router.get("/channel/:id?", async (req, res) => {
      try {
      } catch (e) {
        console.error(`error`, e);
        res.status(500).json({status: 'error', message: `${e.message}`});
      }
    });
    router.put("/media/:id/status/:status", async (req, res) => {
      try {
      } catch (e) {
        console.error(`error`, e);
        res.status(500).json({status: 'error', message: `${e.message}`});
      }
    });
    router.put("/channel/:id?", async (req, res) => {
      try {
      } catch (e) {
        console.error(`error`, e);
        res.status(500).json({status: 'error', message: `${e.message}`});
      }
    });
    return router;
  }
}
