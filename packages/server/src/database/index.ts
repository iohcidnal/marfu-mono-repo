import mongoose from 'mongoose';

export default function connectDb() {
  const dbUrl: string = process.env.DB_URL as string;

  mongoose.connect(
    dbUrl,
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    },
    err => {
      if (err) console.log(err);
    }
  );
}
