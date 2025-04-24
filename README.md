# aihack

開発時のルールは [docs/rules.md](docs/rules.md)を、参考資料は[ref.md](docs/ref.md)を参照すること  

## 技術スタック

- Next.js
- shadcn/ui

## 開発サーバー起動

```sh
pnpm i
pnpm dev
```

<localhost:3000>  

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
