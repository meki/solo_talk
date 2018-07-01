# 準備

```
npm install
```

# 起動

```
npm start
```

## バックグラウンドプロセスで起動

```
npm start &
```

## バックグラウンドプロセスを探して Kill

```
pidof npm
kill [pid]
```

## シェルが死んでも起動し続ける(うまくいかない？)

```
nohup npm start > log.txt &
```

# サービス化

自動起動登録
```
systemctl enable class-outis
 ```

起動
```
systemctl start class-outis
```

終了
```
systemctl stop class-outis
```

再起動
```
systemctl restart class-outis
```

# テスト

```
npm test
```

# 注意点？

index.html というファイルを置いておくと app.get("/") が無視されてるっぽい。
しょうがないので start.html にファイル名を変更した。

# TODO

- CSRF対策とか必要？
- マルチユーザ対応
  - クラス削除のループを修正する必要がある