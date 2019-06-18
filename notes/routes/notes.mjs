import util from 'util';
import express from 'express';
import * as notes from '../models/notes';
export const router = express.Router();

router.get('/add', (req, res, next) => {
  res.render('noteedit', {
    title: 'Add a note',
    docreate: true,
    notekey: "",
    note: undefined
  })
})

router.post('/save', async (req, res, next) => {
  var note;
  if (req.body.docreate === 'create') {
    note = await notes.create(req.body.notekey, req.body.title, req.body.body)
  } else {
    note = await notes.update(req.body.notekey, req.body.title, req.body.body)
  }
  res.redirect('/notes/view?key=' + req.body.notekey)
  // res.redirect('/');
})

router.get('/view', async (req, res, next) => {
  var note = await notes.read(req.query.key);
  res.render('noteview', {
    title: note ? note.title : '',
    notekey: req.query.key,
    note: note
  });
})

router.get('/edit', async (req, res, next) => {
  var note = await notes.read(req.query.key);
  res.render('noteedit', {
    title: note ? `Edit ${note.title}`: 'Add a Note',
    docreate: false,
    notekey: req.query.key,
    note: note
  })
})

router.get('/destroy', async (req, res, next) => {
  var note = await notes.read(req.query.key);
  res.render('notedestroy', {
    title: note ? `Delete ${note.title}` : '',
    notekey: req.query.key,
    note: note
  })
})

router.post('/destroy/confirm', async (req, res, next) => {
  await notes.destroy(req.body.notekey);
  res.redirect('/'); 
})