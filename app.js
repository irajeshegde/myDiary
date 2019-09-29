var express = require("express"),
	expressSanitizer = require("express-sanitizer");
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	methodOverride = require("method-override"),
	app = express();

//APP CONFIG
mongoose.connect("mongodb://localhost/my_diary");
app.use(express.static("public")); // to serve public directory for express
app.set("view engine", "ejs");  // extention not needed if this line is active
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// MONGOOSE MODEL CONFIG
var myDiarySchema = new mongoose.Schema({
	title: String,
	body: String,
	created: {type: Date, default: Date.now}
});
var Diary = mongoose.model("Diary", myDiarySchema);

// Diary.create({
// 	title: "Cooked!",
// 	body: "Today I made delicious palav! "
// });

//RESTful Routes
app.get("/", function(req, res){
	res.redirect("/diary");
});

// INDEX ROUTE
app.get("/diary", function(req, res){
	Diary.find({},function(err, diary){
		if (err) {
			console.log(err);
		} else {
			res.render("index", {diary:diary});
		}
	});
});

//NEW ROUTE 
app.get("/diary/new", function(req, res){
	res.render("new");
});

//CREATE ROUTE
app.post("/diary", function(req, res){
	//create
	req.body.diary.body = req.sanitize(req.body.diary.body);
	Diary.create(req.body.diary, function(err, newDiary){
		if (err) {
			res.render("new");
		} else {
			res.redirect("/diary")
		}
	});
});

//SHOW ROUTE
app.get("/diary/:id", function(req, res){
	Diary.findById(req.params.id,function(err, foundPost){
		if (err) {
			console.log(err);
		} else {
			res.render("show", {post:foundPost});
		}
	});
});

//EDIT ROUTE
app.get("/diary/:id/edit", function(req, res){
	Diary.findById(req.params.id,function(err, foundPost){
		if (err) {
			req.render("/diary");
		} else {
			res.render("edit", {post:foundPost});
		}
	});
});

//UPDATE ROUTE
app.put("/diary/:id", function(req, res){
	//Diary.findByIdAndUpdate(id , new data, callback)
	req.body.diary.body = req.sanitize(req.body.diary.body);
	Diary.findByIdAndUpdate(req.params.id, req.body.diary, function(err, updatePost){
		if (err) {
			res.redirect("/diary");
		} else {
			res.redirect("/diary/"+req.params.id);	
		}
	});
});

//DELETE ROUTE
app.delete("/diary/:id", function(req, res){
	//destroy
	Diary.findByIdAndDelete(req.params.id, function(err){
		if (err) {
			res.redirect("/diary");
		} else {
			res.redirect("/diary");
		}
	});
	//redirect to homepage
});

// Tell express to listen for requests (start server)
app.listen(3000, function(){
	console.log('myDiary server started!')
});

var server = app.listen(8080, function() {
  console.log('listening...');
  server.close(function() { console.log('Quit'); });
});