//import required modules
const express = require("express");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

//Mongo
const dbUrl = "mongodb://localhost:27017/testdb";
const client = new MongoClient(dbUrl);

//set up Express app
const app = express();
const port = process.env.PORT || 8888;

//define important folders
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
//setup public folder
app.use(express.static(path.join(__dirname, "public")));

//in order to parse POST body data as JSON, do the following.
//the following lines will convert the form data from query string format to JSON format.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* var links = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "About",
    path: "/about",
  },
]; */

//test Express app
app.get("/", async (request, response) => {
  //response.status(200).send("Test page again");
  links = await getLinks();
  response.render("index", { title: "Home", menu: links });
});

app.get("/about", async (request, response) => {
  links = await getLinks();
  response.render("about", { title: "About", menu: links });
});

app.get("/admin/menu", async (request, response) => {
  links = await getLinks();
  response.render("menu-list", { title: "Menu links admin", menu: links });
});

app.get("/admin/menu/add", async (request, response) => {
  links = await getLinks();
  response.render("menu-add", { title: "Add menu link", menu: links });
});

app.get("/admin/menu/delete", async (request, response) => {
  //get linkId value
  //for a GET form, field values are passed in request.query.<_field_name> because we're retrieving from a query string
  let id = request.query.linkId;
  await deleteLink(id);
  response.redirect("/admin/menu");
});

/********** EDIT ************/
app.get("/admin/menu/edit", async (request, response) => {
  if (request.query.linkId) {
    let id = request.query.linkId;
    let linkToEdit = await getSingleLink(id);
    let links = await getLinks();
    response.render("menu-edit", {
      title: "Edit menu link",
      menu: links,
      editLink: linkToEdit,
    });
  } else {
    response.redirect("/admin/menu");
  }
});

//FORM PROCESSING PATHS
app.post("/admin/menu/add/submit", async (request, response) => {
  //for a POST form, field values are passed in request.body.<field_name>
  //we can do this because of lines 23-24 above
  let weightVal = request.body.weight;
  let pathVal = request.body.path;
  let nameVal = request.body.name;
  let newLink = {
    weight: weightVal,
    path: pathVal,
    name: nameVal,
  };
  await addLink(newLink);
  response.redirect("/admin/menu");
});

// ===================== EDIT BETWEEN THIS PORTION =====================
app.post("/admin/menu/edit/submit", async (request, response) => {
  // FILL OUT CODE
  // need to get the _id to use this as a filter
  let id = request.body.linkId;
  const idFilter = { _id: ObjectId(id) };
  //grabs _id from the link of the doc that was edited
  console.log(idFilter._id);
  // get weight/path/name values and build this as your updated document
  let newWeightVal = request.body.weight;
  let newPathVal = request.body.path;
  let newNameVal = request.body.name;

  let link = {
    weight: newWeightVal,
    path: newPathVal,
    name: newNameVal,
  };
  console.log(link);
  //run editLink()
  await editLink(idFilter, link);
  response.redirect("/admin/menu");
});

// ===================== EDIT BETWEEN THIS PORTION =====================

//set up server listening
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

//MONGO FUNCTIONS
async function connection() {
  await client.connect();
  db = client.db("testdb"); //select testdb database
  return db;
}

/*Async function to retrieve all links documents from menuLinks collection */
async function getLinks() {
  db = await connection(); //await result connection() and store returned db
  var results = db.collection("menuLinks").find({}); //{} as the query means no filger, aka SELECT* (select all)
  res = await results.toArray();
  return res;
}

/*Async functions to insert one document into menuLinks */
async function addLink(link) {
  db = await connection();
  let status = await db.collection("menuLinks").insertOne(link);
  console.log("link added");
}

/*Async function to delete one document by _id. */
async function deleteLink(id) {
  db = await connection();
  const deleteId = { _id: new ObjectId(id) };
  const result = await db.collection("menuLinks").deleteOne(deleteId);
  if (result.deletedCount == 1) console.log("delete successful");
}

/*Async function to select one document by _id. */
async function getSingleLink(id) {
  db = await connection();
  const editId = { _id: new ObjectId(id) };
  const result = db.collection("menuLinks").findOne(editId);
  return result;
}

// ===================== EDIT BETWEEN THIS PORTION =====================

/*Async function to edit one document. */
async function editLink(filter, link) {
  db = await connection();
  const updateId = { $set: link };

  const result = await db.collection("menuLinks").updateOne(filter, updateId);
  console.log(link);
  console.log(filter);
  console.log(updateId);
  console.log(result);
  console.log(`Link updated: ${result.modifiedCount}`);
  // FILL WITH CODE TO GET FROM EDIT/SUBMIT
  //https://www.mongodb.com/docs/drivers/node/current/usage-examples/updateOne/
}

// ===================== EDIT BETWEEN THIS PORTION =====================
