# ai-hackathon

開発時のルールは [docs/rules.md](docs/rules.md) を、参考資料は [docs/ref.md](docs/ref.md) を参照すること  

## 技術スタック

- Next.js
- shadcn/ui
- Vercel AI SDK

## 開発サーバー起動

```sh
pnpm i
pnpm dev
```

<http://localhost:3000>  

## Lint/Format

```sh
pnpm check
```

## Test

こっちは起動し続けて、テストを自動的にやってくれる

```sh
pnpm test
```

1回きりのテストの場合は

```sh
pnpm test run
```
