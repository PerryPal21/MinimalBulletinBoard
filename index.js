const express = require('express');
const StormDB = require("stormdb");
const bcrypt = require("bcrypt");
const session = require("express-session")
var bodyParser = require('body-parser')
const appController = require("./board");


const app = express();
app.use(express.static('views/static'))
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.set('view engine', 'ejs');

const engine = new StormDB.localFileEngine("./db.stormdb");
const db = new StormDB(engine);

app.use("/imghost", express.static('imghost'))

app.use(
  session({
    secret: "Platypuses are really cool",
    resave: false,
    saveUninitialized: false,
  })
)

app.get("/",(req,res) => {
  if (req.session.username) {
    userdb = db.get().state.users
    res.render("default/mainlogged", {userName: req.session.username, userdb: userdb})
  } else {
  console.log(req.session)
  res.render("default/main")
  }
})

app.get("/login",(req,res) => {
  const error = req.session.error;
  delete req.session.error;
  res.render("default/login", { err: error });
})

app.post("/login",async (req,res) => {
  const { name, password } = req.body;
  console.log(req.body)
  console.log(req.session)

  const user = db.get().state.users.find(o => o.name === name);
  console.log(user)
  
  if (!user) {
    req.session.error = "Invalid Credentials";
    return res.redirect("/login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
    req.session.error = "Invalid Credentials";
    return res.redirect("/login");
  }

  req.session.isAuth = true;
  req.session.username = user.name;
  res.redirect("/");
})

app.get("/register",(req,res) => {
  const error = req.session.error;
  delete req.session.error;
  res.render("default/register", { err: error });
})

app.post("/register",async (req,res) => {
  const { username, email, password } = req.body;

  console.log(req.session)

  const user = db.get().state.users.find(o => o.email === email);
  
  if (user) {
    req.session.error = "User Already Exists";
    return res.redirect("default/register");
  }

  const hasdPsw = await bcrypt.hash(password, 12);

  db.get("users").push({"name":username,"email":email,"password": hasdPsw})

  db.save()
  res.redirect("/login")

})

app.get("/img", appController.img_get);
app.get("/msg", appController.msg_get);
app.get("/imgupload", appController.imgupload_get);
app.get("/msgupload", appController.msgupload_get);
app.post("/imgupload", appController.imgupload_post);
app.post("/msgupload", appController.msgupload_post);

/* app.post("/delete",(req,res) => {
  const {type, content, pass} = req.body
  if (pass === process.env.DELKEY) {
    if (type === "img") {
      target = db.get().state.img.findIndex((i) => i.imgname === content)
      db.get("img").get(target).delete(true)
      db.save() 
      res.send("Deleted Image")
    } else if (type === "msg") {
      target = db.get().state.msg.findIndex((i) => i.msg === content)
      db.get("msg").get(target).delete(true)
      db.save() 
      res.send("Deleted Message")
    }
  } else {
    res.send("Nice try")
  }
  if (!type || !content || !pass) {
    res.send("type, content, pass required")
  }
}) */


app.listen(3002, () => {
  console.log('server started');
});
