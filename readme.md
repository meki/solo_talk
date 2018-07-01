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
systemctl enable sample-server
 ```

起動
```
systemctl start sample-server
```

終了
```
systemctl stop sample-server
```

再起動
```
systemctl restart sample-server
```

# テスト

```
npm test
```

# 注意点？

index.html というファイルを置いておくと app.get("/") が無視されてるっぽい。
しょうがないので home.html にファイル名を変更した。