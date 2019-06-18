import express from 'express';
import * as notes from '../models/notes';
export const router = express.Router();

/* GET home page. */
router.get('/', async (req, res, next) => {
  let keylist = await notes.keylist();
  let keyPromise = keylist.map(key => {
    return notes.read(key)
  });
  let notelist = await Promise.all(keyPromise);
  res.render('index', { title: 'Notes', notelist });
});
