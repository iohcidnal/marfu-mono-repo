import app from './app';

const port: string = process.env.PORT || '3030';

app.listen(port, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Dev server listening on http://localhost:${port}`);
  } else {
    console.log(`Listening on ${port}`);
  }
});
