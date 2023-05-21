import express from 'express';
import Componentry from '@metric-im/componentry';
import axios from "axios";

export default class SearchService extends Componentry.Module {
  constructor(connector) {
    super(connector,import.meta.url);
  }
  routes() {
    let router = express.Router();
    router.get('/search',async (req,res) => {
      try {
        let url = this.connector.profile.server + '/media';
        if (req.query.q && req.query.q !== '') {
          url += '?q=' + encodeURIComponent(req.query.q);
        }
        let result = await axios.get(url);
        res.json(result.data);
      } catch (e) {
        console.error(e);
        res.status(500).send();
      }
    })

    return router;
  }
}
