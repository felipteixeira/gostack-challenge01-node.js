const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

app.get("/repositories", (request, response) => {

  return response.json(repositories);
});

function idValidate(request, response, next) {
  const { id } = request.params;
  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid repositorie ID' })
  }
  return next();
}

function denyLike(request, response, next) {
  const like = request.body.likes
  if (like) {
    return response.status(400).json({ error: 'You cannot update likes manually' })
  }
  return next();
}

app.post("/repositories", denyLike, (request, response) => {
  const { title, url, techs, likes = 0 } = request.body;
  const repo = { id: uuid(), title, url, techs, likes };

  repositories.push(repo);

  console.log(repo);
  return response.json(repo);

});

app.put("/repositories/:id", idValidate, (request, response) => {
  const { id } = request.params
  const { title, url, techs, } = request.body;
  let likes = request.body.likes
  if (likes !== 0) {
    likes = 0
  }

  const repo = repositories.findIndex(repo => repo.id === id);
  if (!repo < 0) {
    return response.status(400).json({ error: 'Repo ID not found' })
  }

  const repoUpdate = {
    id,
    title,
    url,
    techs,
    likes,
  };

  repositories[repo] = repoUpdate;
  console.log(repoUpdate);
  return response.json(repoUpdate);

});

app.delete("/repositories/:id", idValidate, (request, response) => {
  const { id } = request.params

  const repoIndex = repositories.findIndex(repo => repo.id === id);
  if (repoIndex < 0) {
    return response.status(400).json({ error: 'Repo ID not found' })
  }

  repositories.splice(repoIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", idValidate, (request, response) => {
  const { id } = request.params;

  const repo = repositories.find(repo => repo.id === id);
  if (!repo) {
    return response.status(400).json({ error: 'Repo ID not found' })
  }

  repo.likes += 1;
  return response.json(repo);

});

module.exports = app;
