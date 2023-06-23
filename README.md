# Credit commons Wallet

## Developing

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Deploy

You can do sth like:

```bash
npm run build
cd build
scp -r . your-server.com:~/sites/wallet.your-server.com/
```