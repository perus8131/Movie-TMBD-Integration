import express from 'express';
import { MovieController } from './controllers/movieController';

const app = express();
const movieController = new MovieController();

app.get('/movies/:year', movieController.getMoviesByYear);

export default app;