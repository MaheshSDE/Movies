const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server is Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//1.get all movie_names in movie table

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT movie_name FROM movie;`;
  const movieNames = await db.all(getMoviesQuery);
  const ans = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };
  response.send(movieNames.map((eachPlayer) => ans(eachPlayer)));
});

//2.Add movie API

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
              INSERT INTO movie(director_id,movie_name,lead_actor)
              VALUES(
                    ${directorId},
                    '${movieName}',
                    '${leadActor}'
              );`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//3.Get movie API

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const movie = await db.get(getMovieQuery);
  const object = {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  };
  //console.log(movie);
  response.send(object);
});

//4.Update movie API
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
              UPDATE movie 
              SET 
              director_id=${directorId},
              movie_name='${movieName}',
              lead_actor='${leadActor}'
              WHERE movie_id=${movieId};`;
  const updateMovie = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//5.delete movie API
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id=${movieId};`;
  const deletedMovie = await db.get(deleteMovieQuery);
  response.send("Movie Removed");
});

//6.GET directors API
app.get("/directors/", async (request, response) => {
  const getDiretorsQuery = `SELECT * FROM director;`;
  const directors = await db.all(getDiretorsQuery);
  const ans = (dbObject) => {
    return {
      directorId: dbObject.director_id,
      directorName: dbObject.director_name,
    };
  };
  response.send(directors.map((eachDirector) => ans(eachDirector)));
});

//7.GET Movie directed by specific director API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `
  SELECT movie_name FROM movie 
  WHERE 
  director_id=${directorId};`;
  const directorMovieArray = await db.all(getDirectorQuery);
  const ans = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };
  response.send(directorMovieArray.map((each) => ans(each)));
});

module.exports = app;
