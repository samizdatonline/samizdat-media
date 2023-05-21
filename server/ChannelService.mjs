import express from 'express';
import Componentry from '@metric-im/componentry';
import axios from "axios";
import {} from '../helpers/validators.mjs';

export default class ChannelService extends Componentry.Module {
  constructor(connector) {
    super(connector,import.meta.url);
  }
  routes() {
    let router = express.Router();
    router.get("/channel/:id?", async (req, res) => {
      try {
        res.json({});
      } catch (e) {
        console.error(`error`, e);
        res.status(500).json({status: 'error', message: `${e.message}`});
      }
    });
    router.put("/channel/:id?", async (req, res) => {
      try {
        res.json({});
        // await axios.put(this.connector.profile.server+'/media/'+req.params.id);
      } catch (e) {
        console.error(`error`, e);
        res.status(500).json({status: 'error', message: `${e.message}`});
      }
    });
    return router;
  }
}
