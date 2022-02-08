const express = require('express');
const StormDB = require("stormdb");
const bcrypt = require("bcrypt");
const session = require("express-session")
var bodyParser = require('body-parser')
var multer  = require('multer');
const path = require("path")
var fs  = require('fs');

const engine = new StormDB.localFileEngine("./db.stormdb");
const db = new StormDB(engine);

var storage = multer.diskStorage({
	destination: function (req, file, callback) {
		var dir = './imghost';
			if (!fs.existsSync(dir)){
				fs.mkdirSync(dir);
		 }
			callback(null, dir);
		},
		  filename: function (req, file, callback) {
        filename = req.session.username.toLowerCase() + "-" + file.originalname
			  callback(null, filename);
        db.get("img").push({"imgname":filename, "imgurl": "https://board.perrypal.xyz/imghost/" + filename})
        db.save()
			}
	});

var upload = multer({storage: storage}).single("img")


exports.img_get = (req, res) => {
  var imgdb = db.get("img").state.img
  res.render("default/img", {imgdb: imgdb})
};

exports.msg_get = (req, res) => {
  var msgdb = db.get("msg").state.msg
  res.render("default/msg", {msgdb: msgdb})
};

exports.imgupload_get = (req, res) => {
  if (req.session.isAuth === true) {
    res.render("login/imgupload")
  } else {
    res.render("default/login", { err: "You need to be logged in to do that!" })
  }
};

exports.msgupload_get = (req, res) => {
  if (req.session.isAuth === true) {
    res.render("login/msgupload")
  } else {
    res.render("default/login", { err: "You need to be logged in to do that!" })
  }
};

exports.imgupload_post =  function (req, res, next) {
  if (req.session.isAuth === true) {
    upload(req, res, function (err) {
	  if (err) {
		  return res.send(err);
	  }
		  res.redirect("/img");
	  })
  } else {
    res.render("default/login", { err: "You need to be logged in to do that!" })
  }
}

exports.msgupload_post = (req, res) => {
  if (req.session.isAuth === true) {
    const {msg} = req.body
    db.get("msg").push({"msg":msg,"author":req.session.username,"date":new Date().toLocaleString() + " UTC"})
    db.save()
    res.redirect("/msg")
  } else {
    res.render("default/login", { err: "You need to be logged in to do that!" })
  }
};
