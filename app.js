const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const fileupload = require("express-fileupload")
const fs = require("fs");
const path = require("path");
const methodOverride = require("method-override");
const Photo = require("./models/Photo");
const app = express();


app.set("view engine", "ejs");
app.use(express.static("public")); // to use static files
app.use(express.urlencoded({ extended: true })); // to use form data
app.use(express.json());
app.use(fileupload());
app.use(methodOverride("_method", {
    methods: ["POST", "GET"]
}));
mongoose.connect("mongodb+srv://emre:PLswkCbp2BxvDUBx@cluster0.rghum.mongodb.net/Photos?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", async(req, res) => {
    const page = req.query.page || 1;
    const perPage = 1;
    const totalPages = await Photo.find().countDocuments();
    const photos = await Photo.find({}).sort("dataCreated").skip((page - 1) * perPage).limit(perPage)

    res.render("index", {photos, page, perPage, totalPages});
});
app.get("/about", (req, res) => {
  res.render("about");
});
app.get("/photo/:id", async(req, res) => {
    const id = req.params.id;
    const photo = await Photo.findById(id)
    res.render("photo", {photo});
  });

app.get("/add", (req, res) => {
  res.render("add");
});
app.get("/photo/:id/edit", async(req,res) => {
    const id = req.params.id;
    const photo = await Photo.findById(id)
    res.render("edit", {photo});
})
app.put("/photos/:id", async(req,res) => {
    const id = req.params.id;
    const photo = await Photo.findById(id)
    photo.title = req.body.title;
    photo.description = req.body.description;
    await photo.save();
    res.redirect(`/photo/${id}`);

})
app.delete("/photo/:id", async(req,res) => {
    const photo = await Photo.findById(req.params.id);
    let deletedImage = __dirname + `/public/${photo.image}`;
    fs.unlinkSync(deletedImage);
    await Photo.findByIdAndDelete(req.params.id);
    res.redirect("/");
})

app.post("/photos",  (req, res) => {
    const uploadDir = "public/uploads"
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }
    let uploadedImg = req.files.image;
    let uploadPath = __dirname + "/public/uploads/" + uploadedImg.name;
    uploadedImg.mv(uploadPath, async() => {
        await Photo.create({
            ...req.body,
            image: "/uploads/" + uploadedImg.name
        }) 
        res.redirect("/");
  })


});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("Server is running on port 3000");
});
