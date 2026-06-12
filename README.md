# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Deploying the backend on Render

This project can use Render for the backend API. The backend already reads `PORT` and connects to MongoDB through `MONGODB_URI`, so it can run as a Render web service.

1. Push this repo to GitHub.
2. In Render, create a new Blueprint and connect the repo, or create a new Web Service from the `backend` folder.
3. Use these settings if you configure it manually:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment: `Node`
4. Add these environment variables in Render:
   - `MONGODB_URI` with your MongoDB Atlas connection string
   - `JWT_SECRET` with a long random secret
5. Deploy the service and copy the public Render URL, for example `https://ledger-ms-backend.onrender.com`.
6. Set `EXPO_PUBLIC_API_URL` in your Expo app to that Render URL before building the app for production.

Notes:

- Render free web services can sleep when idle, so the first request after inactivity may be slower.
- If the app still points to `localhost` or a private LAN IP, auth and cloud sync will fail after deployment.
